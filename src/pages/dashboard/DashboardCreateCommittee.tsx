import { useEffect, useState } from 'react';
import { FadeIn } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { useAuth, AuthError } from '@/context/AuthContext';
import { listAllUsers, updateUserStatus, writeAuditLog } from '@/services/userService';
import { listMembers } from '@/services/memberService';
import {
  assignCommitteeMember,
  listCommitteeMembers,
  removeCommitteeMember,
} from '@/services/committeeService';
import {
  COMMITTEE_POSITIONS,
  COMMITTEE_SESSIONS,
  ROLE_LABELS,
  UPAZILA_OPTIONS,
  type CommitteeMemberRecord,
  type CommitteeType,
  type FirestoreUser,
  type MemberProfile,
  type UpazilaName,
  type UserRole,
} from '@/types';
import { supabase } from '@/lib/supabase';
import { getCommitteeCreateError, isDistrictAdmin as isDistrictAdminRole, isUpazilaAdmin as isUpazilaAdminRole } from '@/utils/rbac';
import { ShieldCheck, KeyRound, Hash, UserPlus, Search, CheckCircle, Trash2, Award, Users, UserCheck } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface AccountFormValues {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'student' | 'teacher' | 'alumni'>;
  committeeType: CommitteeType;
  upazila: UpazilaName;
  position: string;
  committeeCode: string;
}

const committeeAccountRoles: { value: AccountFormValues['role']; label: string }[] = [
  { value: 'upazila_committee', label: ROLE_LABELS.upazila_committee },
  { value: 'district_committee', label: ROLE_LABELS.district_committee },
  { value: 'upazila_admin', label: ROLE_LABELS.upazila_admin },
  { value: 'district_admin', label: ROLE_LABELS.district_admin },
];

function generateSecurityKey(): string {
  return Math.random().toString(36).slice(2, 12).toUpperCase();
}

export function DashboardCreateCommittee() {
  const { user } = useAuth();
  const isDistrictAdmin = isDistrictAdminRole(user?.role);
  const isUpazilaAdmin = isUpazilaAdminRole(user?.role);

  // Active Tab: 'assign' | 'upazila_admins' | 'current' | 'create_account'
  const [activeTab, setActiveTab] = useState<'assign' | 'upazila_admins' | 'current' | 'create_account'>('assign');

  // Common State
  const [users, setUsers] = useState<FirestoreUser[]>([]);
  const [members, setMembers] = useState<MemberProfile[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter State for Student / Alumni Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSession, setSelectedSession] = useState(COMMITTEE_SESSIONS[0]);
  const [selectedScope, setSelectedScope] = useState<'district' | 'upazila'>(
    isUpazilaAdmin ? 'upazila' : 'district'
  );
  const [selectedUpazila, setSelectedUpazila] = useState<UpazilaName>(
    user?.upazila || UPAZILA_OPTIONS[0]
  );

  // Position Assigning Form State
  const [selectedTarget, setSelectedTarget] = useState<{
    id: string;
    name: string;
    email: string;
    phone: string;
    department: string;
    session: string;
    photoUrl?: string;
  } | null>(null);
  const [targetPosition, setTargetPosition] = useState(COMMITTEE_POSITIONS[0].bnLabel);

  // Current Committee List State
  const [currentCommitteeRecords, setCurrentCommitteeRecords] = useState<CommitteeMemberRecord[]>([]);

  // Account creation form
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AccountFormValues>({
    defaultValues: { role: 'upazila_committee', committeeType: 'upazila', upazila: 'ঝিনাইদহ সদর' },
  });
  const committeeType = watch('committeeType');
  const selectedRole = watch('role');

  const loadData = async () => {
    setLoading(true);
    try {
      const [uList, mList] = await Promise.all([listAllUsers(), listMembers('approved')]);
      setUsers(uList);
      setMembers(mList);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const loadCommitteeRecords = async () => {
    try {
      const records = await listCommitteeMembers(
        selectedSession,
        selectedScope,
        selectedScope === 'upazila' ? selectedUpazila : undefined
      );
      setCurrentCommitteeRecords(records);
    } catch {
      setCurrentCommitteeRecords([]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadCommitteeRecords();
  }, [selectedSession, selectedScope, selectedUpazila]);

  useEffect(() => {
    if (!user) return;
    if (isUpazilaAdmin && user.upazila) {
      setSelectedScope('upazila');
      setSelectedUpazila(user.upazila);
      setValue('role', 'upazila_committee');
      setValue('committeeType', 'upazila');
      setValue('upazila', user.upazila);
    }
  }, [isUpazilaAdmin, user, setValue]);

  // Unified Student / Alumni list for search
  const candidates = [
    ...users
      .filter((u) => u.role === 'student' || u.role === 'alumni')
      .map((u) => ({
        id: u.uid,
        name: u.name,
        email: u.email,
        phone: '',
        department: '',
        session: '',
        upazila: u.upazila,
        role: u.role,
        photoUrl: u.photoUrl || undefined,
      })),
    ...members.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      phone: m.phone,
      department: m.department,
      session: m.session,
      upazila: m.upazila,
      role: 'student' as UserRole,
      photoUrl: m.photo,
    })),
  ].filter((c, idx, self) => self.findIndex((t) => t.email === c.email || t.id === c.id) === idx);

  const filteredCandidates = candidates.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    const haystack = [c.name, c.email, c.department, c.session, c.upazila ?? ''].join(' ').toLowerCase();
    return haystack.includes(q);
  });

  const handleAssignPosition = async () => {
    if (!selectedTarget) {
      toast.error('দয়া করে একজন শিক্ষার্থী বা প্রাক্তন ছাত্র নির্বাচন করুন।');
      return;
    }

    try {
      await assignCommitteeMember({
        session: selectedSession,
        scope: selectedScope,
        upazila: selectedScope === 'upazila' ? selectedUpazila : undefined,
        name: selectedTarget.name,
        photoUrl: selectedTarget.photoUrl,
        position: targetPosition,
        department: selectedTarget.department || 'অনুল্লেখিত',
        studentSession: selectedTarget.session || '২০২০-২১',
        phone: selectedTarget.phone,
        email: selectedTarget.email,
        assignedBy: user?.uid,
      });

      await writeAuditLog({
        actorId: user!.uid,
        actorEmail: user!.email ?? '',
        actorRole: user!.role,
        action: 'role_change',
        targetId: selectedTarget.id,
        targetEmail: selectedTarget.email,
        details: `কমিটি পদবি অর্পণ: ${selectedTarget.name} - ${targetPosition} (${selectedSession})`,
      });

      toast.success(`${selectedTarget.name}-কে "${targetPosition}" পদবি দেওয়া হয়েছে`);
      setSelectedTarget(null);
      await loadCommitteeRecords();
    } catch {
      toast.error('পদবি অর্পণ করতে সমস্যা হয়েছে');
    }
  };

  const handleRemoveRecord = async (id: string, name: string) => {
    try {
      await removeCommitteeMember(id);
      toast.success(`${name}-এর পদবি সরানো হয়েছে`);
      await loadCommitteeRecords();
    } catch {
      toast.error('পদবি সরাতে সমস্যা হয়েছে');
    }
  };

  // Upazila Admin assignment by District Admin
  const handleAssignUpazilaAdmin = async (u: FirestoreUser) => {
    try {
      await updateUserStatus(u.uid, 'active', user!.uid);
      await supabase.from('profiles').update({ role: 'upazila_admin' }).eq('id', u.uid);
      await writeAuditLog({
        actorId: user!.uid,
        actorEmail: user!.email ?? '',
        actorRole: user!.role,
        action: 'role_change',
        targetId: u.uid,
        targetEmail: u.email,
        details: `উপজেলা প্রশাসক নিয়োগ: ${u.name} (${u.upazila})`,
      });
      toast.success(`${u.name}-কে ${u.upazila} উপজেলা প্রশাসক করা হয়েছে`);
      await loadData();
    } catch {
      toast.error('উপজেলা প্রশাসক করতে সমস্যা হয়েছে');
    }
  };

  // Create committee login credentials account
  const generateCode = () => {
    const code = `JZS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setValue('committeeCode', code);
    toast.success('কমিটি কোড তৈরি হয়েছে');
  };

  const validateCreateAccess = (data: AccountFormValues) => {
    if (!user) throw new Error('আপনি লগইন করেননি');

    const error = getCommitteeCreateError(
      user.role,
      data.role,
      data.committeeType === 'district' ? null : data.upazila,
      users,
      user.upazila
    );

    if (error) throw new Error(error);
  };

  const onSubmitAccount = async (data: AccountFormValues) => {
    setLoading(true);
    try {
      validateCreateAccess(data);
      const securityKey = generateSecurityKey();

      const { data: edgeResult, error: edgeError } = await supabase.functions.invoke('admin-create-user', {
        body: {
          email: data.email,
          password: data.password,
          name: data.name,
          role: data.role,
          committee_type: data.committeeType,
          upazila: data.committeeType === 'district' ? null : data.upazila,
          position: data.position,
          security_key: securityKey,
          committee_code: data.committeeCode,
          approved_by: user!.uid,
        },
      });

      let newUid = edgeResult?.uid;

      if (edgeError || !newUid) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              name: data.name,
              role: data.role,
              upazila: data.committeeType === 'district' ? null : data.upazila,
              committee_type: data.committeeType,
            },
          },
        });
        if (signUpError || !signUpData.user) {
          throw new Error(signUpError?.message || 'অ্যাকাউন্ট তৈরি করা যায়নি।');
        }
        newUid = signUpData.user.id;
        await supabase.from('profiles').upsert({
          id: newUid,
          name: data.name,
          email: data.email,
          role: data.role,
          committee_type: data.committeeType,
          upazila: data.committeeType === 'district' ? null : data.upazila,
          position: data.position,
          status: 'active',
          security_key: securityKey,
          committee_code: data.committeeCode,
          approved_by: user!.uid,
        });
      }

      await writeAuditLog({
        actorId: user!.uid,
        actorEmail: user!.email ?? '',
        actorRole: user!.role,
        action: 'account_created',
        targetId: newUid,
        targetEmail: data.email,
        details: `কমিটি অ্যাকাউন্ট তৈরি: ${data.name} (${ROLE_LABELS[data.role]})`,
      });

      toast.success('কমিটি অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে');
      await loadData();
    } catch (e) {
      if (e instanceof AuthError) toast.error(e.message);
      else toast.error(e instanceof Error ? e.message : 'অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Award className="h-6 w-6 text-bd-green-600" />
              কমিটি ব্যবস্থাপনা ও পদবি অর্পণ
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {isDistrictAdmin
                ? 'জেলা সুপার অ্যাডমিন যেকোনো শিক্ষার্থী/প্রাক্তন ছাত্রকে পদবি দিতে পারেন এবং প্রতি উপজেলায় ৩ জন উপজেলা প্রশাসক নিয়োগ করতে পারেন।'
                : 'উপজেলা অ্যাডমিন কেবল নিজস্ব উপজেলার কমিটি পদবি পরিচালনা করতে পারেন।'}
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Tabs Bar */}
      <div className="flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-800 pb-3">
        <button
          onClick={() => setActiveTab('assign')}
          className={`chip px-4 py-2 text-sm font-medium transition ${
            activeTab === 'assign'
              ? 'bg-bd-green-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-bd-green-50'
          }`}
        >
          <UserCheck className="h-4 w-4" /> পদবি অর্পণ করুন
        </button>

        {isDistrictAdmin && (
          <button
            onClick={() => setActiveTab('upazila_admins')}
            className={`chip px-4 py-2 text-sm font-medium transition ${
              activeTab === 'upazila_admins'
                ? 'bg-bd-green-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-bd-green-50'
            }`}
          >
            <ShieldCheck className="h-4 w-4" /> উপজেলা প্রশাসক (৩ জন করে)
          </button>
        )}

        <button
          onClick={() => setActiveTab('current')}
          className={`chip px-4 py-2 text-sm font-medium transition ${
            activeTab === 'current'
              ? 'bg-bd-green-600 text-white shadow-md'
              : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-bd-green-50'
          }`}
        >
          <Users className="h-4 w-4" /> বর্তমান পদবিধারীগণ ({currentCommitteeRecords.length})
        </button>

        {isDistrictAdmin && (
          <button
            onClick={() => setActiveTab('create_account')}
            className={`chip px-4 py-2 text-sm font-medium transition ${
              activeTab === 'create_account'
                ? 'bg-bd-green-600 text-white shadow-md'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-bd-green-50'
            }`}
          >
            <UserPlus className="h-4 w-4" /> নতুন কমিটি লগইন অ্যাকাউন্ট
          </button>
        )}
      </div>

      {/* TAB 1: ASSIGN POSITION */}
      {activeTab === 'assign' && (
        <div className="grid lg:grid-cols-12 gap-6">
          {/* Left 7 cols: Search Candidate */}
          <div className="lg:col-span-7 space-y-4">
            <div className="card p-5 space-y-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Search className="h-4 w-4 text-bd-green-600" />
                ১. শিক্ষার্থী বা প্রাক্তন ছাত্র খুঁজুন
              </h2>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="নাম, ইমেইল, বিভাগ বা সেশন দিয়ে খুঁজুন..."
                  className="input pl-10"
                />
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
                {filteredCandidates.length === 0 ? (
                  <p className="text-xs text-gray-400 py-6 text-center">কোনো শিক্ষার্থী বা প্রাক্তন ছাত্র পাওয়া যায়নি</p>
                ) : (
                  filteredCandidates.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedTarget(c)}
                      className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                        selectedTarget?.id === c.id
                          ? 'border-bd-green-500 bg-bd-green-50/50 dark:bg-bd-green-900/20'
                          : 'border-gray-100 dark:border-gray-800 hover:border-bd-green-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="grid h-10 w-10 place-items-center rounded-full bg-bd-gradient text-white font-bold shrink-0 overflow-hidden text-sm">
                          {c.photoUrl ? <img src={c.photoUrl} alt={c.name} className="h-full w-full object-cover" /> : c.name[0]}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-gray-900 dark:text-white truncate">{c.name}</p>
                          <p className="text-xs text-gray-400 truncate">{c.department ? `${c.department} • ${c.session}` : c.email}</p>
                        </div>
                      </div>
                      <Badge variant={c.role === 'alumni' ? 'blue' : 'green'}>{c.upazila || 'ঝিনাইদহ'}</Badge>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right 5 cols: Configure Position & Assign */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card p-5 space-y-4">
              <h2 className="text-base font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-bd-green-600" />
                ২. পদবি নির্ধারণ ও অর্পণ
              </h2>

              {selectedTarget ? (
                <div className="p-3 rounded-xl bg-bd-green-50 dark:bg-bd-green-900/30 border border-bd-green-200 dark:border-bd-green-800 flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-bd-green-600 text-white font-bold shrink-0">
                    {selectedTarget.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-gray-900 dark:text-white">{selectedTarget.name}</p>
                    <p className="text-xs text-bd-green-700 dark:text-bd-green-300">{selectedTarget.email}</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 text-xs">
                  বামপাশ থেকে একজন সদস্য নির্বাচন করুন।
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">কমিটি সেশন / মেয়াদী বছর</label>
                <select
                  value={selectedSession}
                  onChange={(e) => setSelectedSession(e.target.value)}
                  className="input"
                >
                  {COMMITTEE_SESSIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">কমিটি স্কোপ</label>
                <select
                  value={selectedScope}
                  onChange={(e) => setSelectedScope(e.target.value as 'district' | 'upazila')}
                  className="input"
                  disabled={isUpazilaAdmin}
                >
                  <option value="district">জেলা কমিটি</option>
                  <option value="upazila">উপজেলা কমিটি</option>
                </select>
              </div>

              {selectedScope === 'upazila' && (
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">উপজেলা নির্বাচন</label>
                  <select
                    value={selectedUpazila || ''}
                    onChange={(e) => setSelectedUpazila(e.target.value as UpazilaName)}
                    className="input"
                    disabled={isUpazilaAdmin}
                  >
                    {UPAZILA_OPTIONS.map((u) => (
                      <option key={u} value={u ?? ''}>{u}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                  পদবি লিখুন (যেকোনো কাস্টম পদবি স্বাচ্ছন্দ্যে লিখুন)
                </label>
                <input
                  type="text"
                  value={targetPosition}
                  onChange={(e) => setTargetPosition(e.target.value)}
                  placeholder="যেমন: সভাপতি, সহ-সাংগঠনিক সম্পাদক, ক্রীড়া সম্পাদক..."
                  className="input mb-2"
                />
                <div className="flex flex-wrap gap-1">
                  <span className="text-[11px] text-gray-400 font-medium self-center mr-1">দ্রুত সিলেক্ট:</span>
                  {COMMITTEE_POSITIONS.map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setTargetPosition(p.bnLabel)}
                      className={`chip text-[11px] py-0.5 px-2 ${
                        targetPosition === p.bnLabel
                          ? 'bg-bd-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {p.bnLabel}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAssignPosition}
                disabled={!selectedTarget}
                className="btn-primary w-full mt-2"
              >
                <CheckCircle className="h-4 w-4" /> পদবি অর্পণ সম্পন্ন করুন
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: UPAZILA ADMINS (District Admin only) */}
      {activeTab === 'upazila_admins' && isDistrictAdmin && (
        <div className="space-y-6">
          <div className="card p-5 border-l-4 border-l-bd-green-500">
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">
              উপজেলা প্রশাসক নিযুক্তি (প্রতি উপজেলায় সর্বোচ্চ ৩ জন)
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              জেলা সুপার অ্যাডমিন প্রতিটি উপজেলার জন্য ৩ জন করে উপজেলা প্রশাসক বরাদ্দ করতে পারেন।
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {UPAZILA_OPTIONS.map((upazilaName) => {
              const currentAdmins = users.filter(
                (u) => u.role === 'upazila_admin' && u.upazila === upazilaName
              );
              return (
                <div key={upazilaName} className="card p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-800">
                      <h3 className="font-bold text-gray-900 dark:text-white">{upazilaName}</h3>
                      <Badge variant={currentAdmins.length >= 3 ? 'amber' : 'green'}>
                        {currentAdmins.length} / ৩ জন প্রশাসক
                      </Badge>
                    </div>

                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">বর্তমান প্রশাসকগণ:</p>
                      {currentAdmins.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">এখনো কোনো প্রশাসক নিয়োগ দেওয়া হয়নি</p>
                      ) : (
                        currentAdmins.map((adm) => (
                          <div key={adm.uid} className="flex items-center justify-between text-xs p-2 rounded-lg bg-gray-50 dark:bg-gray-800">
                            <span className="font-medium text-gray-900 dark:text-white">{adm.name}</span>
                            <span className="text-gray-400">{adm.email}</span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800">
                    {currentAdmins.length < 3 && (
                      <div>
                        <p className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">নতুন প্রশাসক নির্বাচন করুন:</p>
                        <select
                          onChange={(e) => {
                            const u = users.find((x) => x.uid === e.target.value);
                            if (u) handleAssignUpazilaAdmin({ ...u, upazila: upazilaName });
                          }}
                          defaultValue=""
                          className="input !text-xs"
                        >
                          <option value="" disabled>-- সদস্য নির্বাচন করুন --</option>
                          {users
                            .filter((u) => u.upazila === upazilaName && u.role !== 'upazila_admin')
                            .map((u) => (
                              <option key={u.uid} value={u.uid}>
                                {u.name} ({u.role})
                              </option>
                            ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: CURRENT COMMITTEE RECORDS */}
      {activeTab === 'current' && (
        <div className="space-y-4">
          <div className="card p-5 flex flex-wrap items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="input !w-auto"
              >
                {COMMITTEE_SESSIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>

              <select
                value={selectedScope}
                onChange={(e) => setSelectedScope(e.target.value as 'district' | 'upazila')}
                className="input !w-auto"
                disabled={isUpazilaAdmin}
              >
                <option value="district">জেলা কমিটি</option>
                <option value="upazila">উপজেলা কমিটি</option>
              </select>

              {selectedScope === 'upazila' && (
                <select
                  value={selectedUpazila || ''}
                  onChange={(e) => setSelectedUpazila(e.target.value as UpazilaName)}
                  className="input !w-auto"
                  disabled={isUpazilaAdmin}
                >
                  {UPAZILA_OPTIONS.map((u) => (
                    <option key={u} value={u ?? ''}>{u}</option>
                  ))}
                </select>
              )}
            </div>

            <p className="text-xs text-gray-400">মোট {currentCommitteeRecords.length} জন পদবিধারী সদস্য</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {currentCommitteeRecords.map((r) => (
              <div key={r.id} className="card p-4 flex items-center justify-between gap-3 border-l-4 border-l-bd-green-500">
                <div className="min-w-0">
                  <Badge variant="green" className="mb-1">{r.position}</Badge>
                  <p className="font-bold text-sm text-gray-900 dark:text-white truncate">{r.name}</p>
                  <p className="text-xs text-gray-400 truncate">{r.department} • {r.studentSession}</p>
                </div>
                <button
                  onClick={() => handleRemoveRecord(r.id, r.name)}
                  className="chip bg-bd-red-50 text-bd-red-600 hover:bg-bd-red-100 dark:bg-bd-red-900/30 dark:text-bd-red-300 p-2 shrink-0"
                  title="পদবি মুছুন"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: CREATE COMMITTEE ACCOUNT */}
      {activeTab === 'create_account' && isDistrictAdmin && (
        <FadeIn>
          <form onSubmit={handleSubmit(onSubmitAccount)} className="card p-6 max-w-2xl space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ভূমিকা</label>
              <select className="input mt-1.5" {...register('role', { required: 'ভূমিকা আবশ্যক' })}>
                {committeeAccountRoles.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">নাম</label>
                <input className="input mt-1.5" placeholder="সদস্যের নাম" {...register('name', { required: 'নাম আবশ্যক' })} />
                {errors.name && <p className="mt-1 text-xs text-bd-red-600">{errors.name.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ইমেইল</label>
                <input type="email" className="input mt-1.5" placeholder="email@example.com" {...register('email', { required: 'ইমেইল আবশ্যক' })} />
                {errors.email && <p className="mt-1 text-xs text-bd-red-600">{errors.email.message}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">পাসওয়ার্ড</label>
              <input type="password" className="input mt-1.5" placeholder="••••••••" {...register('password', { required: 'পাসওয়ার্ড আবশ্যক', minLength: { value: 6, message: 'কমপক্ষে ৬ অক্ষর' } })} />
              {errors.password && <p className="mt-1 text-xs text-bd-red-600">{errors.password.message}</p>}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">কমিটি ধরন</label>
                <select className="input mt-1.5" {...register('committeeType', { required: true })} onChange={(e) => setValue('committeeType', e.target.value as CommitteeType)}>
                  <option value="upazila">উপজেলা</option>
                  <option value="district">জেলা</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">পদবি</label>
                <input className="input mt-1.5" placeholder="যেমন: সভাপতি, সম্পাদক" {...register('position', { required: 'পদবি আবশ্যক' })} />
                {errors.position && <p className="mt-1 text-xs text-bd-red-600">{errors.position.message}</p>}
              </div>
            </div>

            {committeeType === 'upazila' && (
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">উপজেলা</label>
                <select className="input mt-1.5" {...register('upazila', { required: true })}>
                  {UPAZILA_OPTIONS.map((u) => <option key={u} value={u ?? ''}>{u}</option>)}
                </select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">কমিটি কোড (গোপন)</label>
              <div className="mt-1.5 flex gap-2">
                <div className="relative flex-1">
                  <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input className="input pl-10" readOnly placeholder="কোড তৈরি করুন" {...register('committeeCode')} />
                </div>
                <button type="button" onClick={generateCode} className="btn-ghost"><KeyRound className="h-4 w-4" /> তৈরি করুন</button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              <UserPlus className="h-4 w-4" /> {loading ? 'তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
            </button>
          </form>
        </FadeIn>
      )}
    </div>
  );
}
