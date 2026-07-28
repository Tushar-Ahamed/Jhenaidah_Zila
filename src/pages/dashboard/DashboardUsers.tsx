import { useEffect, useState } from 'react';
import { FadeIn } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuth } from '@/context/AuthContext';
import { listAllUsers, updateUserStatus, softDeleteUser, writeAuditLog } from '@/services/userService';
import { ROLE_LABELS, STATUS_LABELS, type FirestoreUser, type UserStatus, type UserRole } from '@/types';
import { UserCog, CheckCircle, Ban, Trash2, Search, ShieldCheck } from 'lucide-react';
import { toBnNumber } from '@/utils/format';
import { useDebounce } from '@/hooks/useDebounce';
import toast from 'react-hot-toast';

const statusVariant: Record<UserStatus, 'green' | 'amber' | 'red' | 'gray'> = {
  active: 'green',
  pending: 'amber',
  suspended: 'red',
  deleted: 'gray',
};

const roleFilters: { key: UserRole | 'all'; label: string }[] = [
  { key: 'all', label: 'সব' },
  { key: 'student', label: ROLE_LABELS.student },
  { key: 'teacher', label: ROLE_LABELS.teacher },
  { key: 'alumni', label: ROLE_LABELS.alumni },
  { key: 'upazila_committee', label: ROLE_LABELS.upazila_committee },
  { key: 'district_committee', label: ROLE_LABELS.district_committee },
  { key: 'upazila_admin', label: ROLE_LABELS.upazila_admin },
  { key: 'district_admin', label: ROLE_LABELS.district_admin },
];

export function DashboardUsers() {
  const { user } = useAuth();
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<UserStatus | 'all'>('all');
  const debounced = useDebounce(query, 250);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const list = await listAllUsers();
      setUsers(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = users.filter((u) => {
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    const matchStatus = statusFilter === 'all' || u.status === statusFilter;
    const matchQuery = u.name.includes(debounced) || u.email.includes(debounced);
    return matchRole && matchStatus && matchQuery;
  });

  const actOnUser = async (
    u: FirestoreUser,
    action: 'approve' | 'suspend' | 'reactivate' | 'delete'
  ) => {
    try {
      if (action === 'delete') {
        await softDeleteUser(u.uid);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'account_deleted', targetId: u.uid, targetEmail: u.email, details: `সফট-ডিলিট: ${u.name}` });
        toast.success('অ্যাকাউন্ট মুছে ফেলা হয়েছে');
      } else {
        const newStatus: UserStatus = action === 'approve' ? 'active' : action === 'suspend' ? 'suspended' : 'active';
        await updateUserStatus(u.uid, newStatus, user!.uid);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: action === 'approve' ? 'account_approved' : 'status_change', targetId: u.uid, targetEmail: u.email, details: `স্ট্যাটাস: ${STATUS_LABELS[newStatus]}` });
        toast.success(action === 'approve' ? 'অ্যাকাউন্ট অনুমোদিত' : action === 'suspend' ? 'অ্যাকাউন্ট স্থগিত' : 'অ্যাকাউন্ট পুনরায় সক্রিয়');
      }
      await load();
    } catch {
      toast.error('কাজটি সম্পন্ন করা যায়নি');
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ব্যবহারকারী ব্যবস্থাপনা</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">সকল ব্যবহারকারী অনুমোদন, স্থগিত বা মুছে ফেলুন</p>
        </div>
      </FadeIn>

      {/* Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="নাম বা ইমেইল খুঁজুন..." className="input pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {roleFilters.map((r) => (
            <button key={r.key} onClick={() => setRoleFilter(r.key)} className={`chip transition ${roleFilter === r.key ? 'bg-bd-green-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-bd-green-50'}`}>{r.label}</button>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {(['all', 'pending', 'active', 'suspended', 'deleted'] as const).map((s) => (
            <button key={s} onClick={() => setStatusFilter(s)} className={`chip transition ${statusFilter === s ? 'bg-bd-red-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-bd-red-50'}`}>{s === 'all' ? 'সব স্ট্যাটাস' : STATUS_LABELS[s]}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<UserCog className="h-8 w-8" />} title="কোনো ব্যবহারকারী নেই" description="আপনার ফিল্টারের সাথে মিলে যাওয়া কোনো ব্যবহারকারী নেই।" />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((u, i) => (
            <FadeIn key={u.uid} delay={(i % 6) * 0.04}>
              <div className="card p-5 h-full flex flex-col">
                <div className="flex items-center gap-3">
                  <div className="grid h-11 w-11 place-items-center rounded-full bg-bd-gradient text-white font-semibold shrink-0">{u.name?.[0] ?? 'U'}</div>
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                    <p className="text-xs text-gray-400 truncate">{u.email}</p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  <Badge variant="blue">{ROLE_LABELS[u.role]}</Badge>
                  <Badge variant={statusVariant[u.status]}>{STATUS_LABELS[u.status]}</Badge>
                  {u.upazila && <Badge variant="gray">{u.upazila}</Badge>}
                </div>
                {u.position && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">পদ: {u.position}</p>}
                <p className="mt-1 text-xs text-gray-400">যোগদান: {new Date(u.createdAt).toLocaleDateString('bn-BD')}</p>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex flex-wrap gap-2">
                  {u.status === 'pending' && (
                    <button onClick={() => actOnUser(u, 'approve')} className="chip bg-bd-green-50 text-bd-green-700 dark:bg-bd-green-900/30 dark:text-bd-green-300 hover:bg-bd-green-100"><CheckCircle className="h-3.5 w-3.5" /> অনুমোদন</button>
                  )}
                  {u.status === 'active' && (
                    <button onClick={() => actOnUser(u, 'suspend')} className="chip bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 hover:bg-amber-100"><Ban className="h-3.5 w-3.5" /> স্থগিত</button>
                  )}
                  {(u.status === 'suspended' || u.status === 'pending') && (
                    <button onClick={() => actOnUser(u, 'reactivate')} className="chip bg-bd-green-50 text-bd-green-700 dark:bg-bd-green-900/30 dark:text-bd-green-300 hover:bg-bd-green-100"><ShieldCheck className="h-3.5 w-3.5" /> সক্রিয় করুন</button>
                  )}
                  {u.status !== 'deleted' && (
                    <button onClick={() => actOnUser(u, 'delete')} className="chip bg-bd-red-50 text-bd-red-700 dark:bg-bd-red-900/30 dark:text-bd-red-300 hover:bg-bd-red-100"><Trash2 className="h-3.5 w-3.5" /> মুছুন</button>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">মোট {toBnNumber(filtered.length)} জন ব্যবহারকারী</p>
    </div>
  );
}
