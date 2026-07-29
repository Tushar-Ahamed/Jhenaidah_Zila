import { useEffect, useState } from 'react';
import { FadeIn } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useAuth } from '@/context/AuthContext';
import { listAllUsers, updateUserStatus, softDeleteUser, writeAuditLog } from '@/services/userService';
import { ROLE_LABELS, STATUS_LABELS, UPAZILA_OPTIONS, type FirestoreUser, type UserStatus, type UserRole, type UpazilaName } from '@/types';
import { UserCog, CheckCircle, Ban, Trash2, Search, ShieldCheck, Shield, MapPin, X } from 'lucide-react';
import { toBnNumber } from '@/utils/format';
import { useDebounce } from '@/hooks/useDebounce';
import { supabase } from '@/lib/supabase';
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
  const [selectedUserForModal, setSelectedUserForModal] = useState<FirestoreUser | null>(null);
  const [targetUpazila, setTargetUpazila] = useState<UpazilaName>('ঝিনাইদহ সদর');
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
    const queryText = debounced.trim().toLowerCase();
    const haystack = [u.name, u.email, u.position ?? '', ROLE_LABELS[u.role]].join(' ').toLowerCase();
    const matchQuery = !queryText || haystack.includes(queryText);
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

  const changeUserRole = async (u: FirestoreUser, newRole: UserRole, assignUpazila?: UpazilaName) => {
    try {
      const upazilaName = assignUpazila ?? u.upazila ?? 'ঝিনাইদহ সদর';
      const positionName = newRole === 'upazila_admin' ? 'উপজেলা প্রশাসক' : newRole === 'district_admin' ? 'জেলা প্রশাসক' : u.position ?? 'সদস্য';
      const committeeType = newRole === 'upazila_admin' ? 'upazila' : newRole === 'district_admin' ? 'district' : null;

      try {
        await supabase.from('profiles').update({
          role: newRole,
          upazila: upazilaName,
          position: positionName,
          committee_type: committeeType,
          status: 'active',
          updated_at: new Date().toISOString(),
        }).eq('id', u.uid);
      } catch {
        // fallback
      }

      try {
        const regRaw = localStorage.getItem('jhenaidah_registered_users_v1');
        if (regRaw) {
          const list = JSON.parse(regRaw);
          const updated = list.map((r: any) => {
            if (r.email?.toLowerCase() === u.email?.toLowerCase()) {
              return {
                ...r,
                profile: {
                  ...r.profile,
                  role: newRole,
                  upazila: upazilaName,
                  position: positionName,
                  committeeType,
                },
              };
            }
            return r;
          });
          localStorage.setItem('jhenaidah_registered_users_v1', JSON.stringify(updated));
        }
      } catch {
        // ignore
      }

      try {
        const memRaw = localStorage.getItem('jhenaidah_approved_members_v1');
        if (memRaw) {
          const list = JSON.parse(memRaw);
          const updated = list.map((m: any) => {
            if (m.id === u.uid || m.email?.toLowerCase() === u.email?.toLowerCase()) {
              return {
                ...m,
                role: newRole,
                upazila: upazilaName,
                position: positionName,
              };
            }
            return m;
          });
          localStorage.setItem('jhenaidah_approved_members_v1', JSON.stringify(updated));
        } else {
          const newMember = {
            id: u.uid,
            uid: u.uid,
            name: u.name,
            photo: u.photoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
            department: 'অনুল্লেখিত',
            session: '২০২২-২৩',
            hall: 'অনুল্লেখিত',
            upazila: upazilaName,
            phone: '',
            email: u.email,
            bloodGroup: 'B+',
            bio: `${u.name} - ${positionName}`,
            role: newRole,
            status: 'approved',
            createdAt: Date.now(),
            updatedAt: Date.now(),
          };
          localStorage.setItem('jhenaidah_approved_members_v1', JSON.stringify([newMember]));
        }
      } catch {
        // ignore
      }

      toast.success(
        newRole === 'upazila_admin'
          ? `${u.name}-কে ${upazilaName} এর উপজেলা এডমিন নির্বাচিত করা হয়েছে! তিনি তাঁর নিজস্ব জিমেইল দিয়েই লগইন করবেন।`
          : newRole === 'district_admin'
          ? `${u.name}-কে জেলা প্রশাসক হিসেবে দায়িত্ব দেওয়া হয়েছে!`
          : `${u.name}-এর ভূমিকা হালনাগাদ করা হয়েছে।`
      );

      setSelectedUserForModal(null);
      await load();
    } catch {
      toast.error('ভূমিকা পরিবর্তনে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">ব্যবহারকারী ও এডমিন ব্যবস্থাপনা</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">শিক্ষার্থীকে উপজেলা এডমিন সিলেক্ট করুন বা সদস্য অনুমোদন ও নিয়ন্ত্রণ করুন</p>
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
              <div className="card p-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-bd-gradient text-white font-semibold shrink-0">{u.name?.[0] ?? 'U'}</div>
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 dark:text-white truncate">{u.name}</p>
                      <p className="text-xs text-gray-400 truncate">{u.email}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    <Badge variant={u.role === 'upazila_admin' ? 'amber' : u.role === 'district_admin' ? 'red' : 'blue'}>{ROLE_LABELS[u.role]}</Badge>
                    <Badge variant={statusVariant[u.status]}>{STATUS_LABELS[u.status]}</Badge>
                    {u.upazila && <Badge variant="gray">{u.upazila}</Badge>}
                  </div>
                  {u.position && <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">পদ: {u.position}</p>}
                  <p className="mt-1 text-xs text-gray-400">যোগদান: {new Date(u.createdAt).toLocaleDateString('bn-BD')}</p>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                  <div className="flex flex-wrap gap-2">
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

                  {user?.role === 'district_admin' && (
                    <button
                      onClick={() => {
                        setSelectedUserForModal(u);
                        setTargetUpazila(u.upazila || 'ঝিনাইদহ সদর');
                      }}
                      className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-800 transition hover:bg-amber-100 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-300"
                    >
                      <Shield className="h-3.5 w-3.5" /> উপজেলা এডমিন হিসেবে সিলেক্ট করুন
                    </button>
                  )}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      )}

      {/* Upazila Admin Assign Modal */}
      {selectedUserForModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-6 shadow-2xl dark:border-gray-800 dark:bg-gray-900">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white flex items-center gap-2">
                <Shield className="h-5 w-5 text-amber-600" /> উপজেলা এডমিন সিলেক্ট করুন
              </h3>
              <button onClick={() => setSelectedUserForModal(null)} className="rounded-full p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                আপনি <strong className="text-gray-900 dark:text-white">{selectedUserForModal.name}</strong> ({selectedUserForModal.email})-কে কোন উপজেলার এডমিন বানাতে চান?
              </p>

              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-bd-green-600" /> উপজেলা নির্বাচন করুন:
                </label>
                <select
                  value={targetUpazila ?? ''}
                  onChange={(e) => setTargetUpazila(e.target.value as UpazilaName)}
                  className="input mt-1.5 w-full"
                >
                  {UPAZILA_OPTIONS.map((up) => (
                    <option key={up} value={up ?? ''}>{up}</option>
                  ))}
                </select>
              </div>

              <div className="rounded-xl border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900/50 dark:bg-blue-900/20 dark:text-blue-300">
                💡 এডমিন সিলেক্ট করার পর এই ব্যবহারকারী তাঁর নিবন্ধিত জিমেইল ও পাসওয়ার্ড দিয়েই লগইন করে {targetUpazila} উপজেলার এডমিন প্যানেল পরিচালনা করতে পারবেন।
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2">
              <button
                onClick={() => changeUserRole(selectedUserForModal, 'upazila_admin', targetUpazila)}
                className="btn-primary w-full py-2.5 text-sm"
              >
                উপজেলা এডমিন বানান ({targetUpazila})
              </button>
              <button
                onClick={() => changeUserRole(selectedUserForModal, 'district_admin')}
                className="w-full rounded-2xl border border-bd-red-200 bg-bd-red-50 px-4 py-2.5 text-sm font-semibold text-bd-red-700 hover:bg-bd-red-100 dark:border-bd-red-800 dark:bg-bd-red-900/30 dark:text-bd-red-300 transition"
              >
                জেলা এডমিন (District Admin) বানান
              </button>
              <button
                onClick={() => setSelectedUserForModal(null)}
                className="btn-ghost w-full py-2 text-sm"
              >
                বাতিল
              </button>
            </div>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 text-center">মোট {toBnNumber(filtered.length)} জন ব্যবহারকারী</p>
    </div>
  );
}
