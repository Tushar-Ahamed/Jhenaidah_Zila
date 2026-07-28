import { useEffect, useState } from 'react';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { MemberCard } from '@/components/MemberCard';
import { useAuth } from '@/context/AuthContext';
import { isAdmin } from '@/utils/rbac';
import { listMembers, approveMember, rejectMember, setMemberStatus } from '@/services/memberService';
import { writeAuditLog } from '@/services/userService';
import type { MemberProfile, MemberStatus } from '@/types';
import { Users, Search, CheckCircle, XCircle, RotateCcw, Clock, UserCheck, UserX } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { toBnNumber, classNames, formatBnDate } from '@/utils/format';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

type Tab = 'pending' | 'approved' | 'rejected';

const tabs: { key: Tab; label: string; icon: typeof Clock }[] = [
  { key: 'pending', label: 'অনুমোদনের অপেক্ষায়', icon: Clock },
  { key: 'approved', label: 'অনুমোদিত', icon: UserCheck },
  { key: 'rejected', label: 'প্রত্যাখ্যাত', icon: UserX },
];

const statusVariant: Record<MemberStatus, 'amber' | 'green' | 'red'> = {
  pending: 'amber',
  approved: 'green',
  rejected: 'red',
};

const statusLabel: Record<MemberStatus, string> = {
  pending: 'অপেক্ষমাণ',
  approved: 'অনুমোদিত',
  rejected: 'প্রত্যাখ্যাত',
};

export function DashboardMembers() {
  const { user } = useAuth();
  const admin = isAdmin(user?.role);
  const [tab, setTab] = useState<Tab>('pending');
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 250);

  const load = async (status: MemberStatus) => {
    setLoading(true);
    setError(false);
    try {
      const list = await listMembers(status);
      setMembers(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(tab); }, [tab]);

  const filtered = members.filter(
    (m) => m.name.includes(debounced) || m.email.includes(debounced) || m.department.includes(debounced)
  );

  const act = async (m: MemberProfile, action: 'approve' | 'reject' | 'revoke') => {
    try {
      if (action === 'approve') {
        await approveMember(m.id);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'account_approved', targetId: m.id, targetEmail: m.email, details: `সদস্য অনুমোদিত: ${m.name}` });
        toast.success('সদস্য অনুমোদিত হয়েছে');
      } else if (action === 'reject') {
        await rejectMember(m.id);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'status_change', targetId: m.id, targetEmail: m.email, details: `সদস্য প্রত্যাখ্যাত: ${m.name}` });
        toast.success('সদস্য প্রত্যাখ্যাত হয়েছে');
      } else {
        await setMemberStatus(m.id, 'pending');
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'status_change', targetId: m.id, targetEmail: m.email, details: `সদস্য পুনঃবিবেচনায়: ${m.name}` });
        toast.success('পুনঃবিবেচনায় পাঠানো হয়েছে');
      }
      await load(tab);
    } catch {
      toast.error('কাজটি সম্পন্ন করা যায়নি');
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">সদস্য ব্যবস্থাপনা</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">সদস্য অনুমোদন, প্রত্যাখ্যান ও তালিকা ব্যবস্থাপনা</p>
        </div>
      </FadeIn>

      {/* Tabs */}
      <div className="inline-flex flex-wrap gap-1 rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={classNames(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition',
              tab === t.key ? 'bg-white dark:bg-gray-900 text-bd-green-700 dark:text-bd-green-300 shadow-soft' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
            )}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="সদস্য খুঁজুন..." className="input pl-10" />
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState onRetry={() => load(tab)} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<Users className="h-8 w-8" />} title={`কোনো ${statusLabel[tab]} সদস্য নেই`} description="এই তালিকায় বর্তমানে কোনো সদস্য নেই।" />
      ) : (
        <>
          <p className="text-sm text-gray-500 dark:text-gray-400">মোট {toBnNumber(filtered.length)} জন</p>
          <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m) => (
              <StaggerItem key={m.id} className="flex flex-col">
                <div className="relative">
                  <MemberCard member={m} to={`/members/${m.id}`} />
                </div>
                {/* Admin action bar */}
                {admin && (
                  <div className="mt-2 card p-3 flex items-center justify-between gap-2">
                    <Badge variant={statusVariant[m.status]}>{statusLabel[m.status]}</Badge>
                    <div className="flex items-center gap-1.5">
                      {tab === 'pending' && (
                        <>
                          <button onClick={() => act(m, 'approve')} className="chip bg-bd-green-50 text-bd-green-700 dark:bg-bd-green-900/30 dark:text-bd-green-300 hover:bg-bd-green-100" title="অনুমোদন"><CheckCircle className="h-4 w-4" /></button>
                          <button onClick={() => act(m, 'reject')} className="chip bg-bd-red-50 text-bd-red-700 dark:bg-bd-red-900/30 dark:text-bd-red-300 hover:bg-bd-red-100" title="প্রত্যাখ্যান"><XCircle className="h-4 w-4" /></button>
                        </>
                      )}
                      {tab === 'approved' && (
                        <button onClick={() => act(m, 'revoke')} className="chip bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100" title="পুনঃবিবেচনা"><RotateCcw className="h-4 w-4" /></button>
                      )}
                      {tab === 'rejected' && (
                        <button onClick={() => act(m, 'approve')} className="chip bg-bd-green-50 text-bd-green-700 dark:bg-bd-green-900/30 dark:text-bd-green-300 hover:bg-bd-green-100" title="অনুমোদন"><CheckCircle className="h-4 w-4" /></button>
                      )}
                      <Link to={`/dashboard/members/${m.id}/edit`} className="chip bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-gray-200" title="সম্পাদনা"><Users className="h-4 w-4" /></Link>
                    </div>
                  </div>
                )}
                <p className="mt-1 px-1 text-[11px] text-gray-400">যোগদান: {formatBnDate(new Date(m.createdAt).toISOString())}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </>
      )}
    </div>
  );
}
