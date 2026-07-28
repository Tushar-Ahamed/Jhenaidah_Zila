import { useState } from 'react';
import { FadeIn } from '@/components/ui/FadeIn';
import { useAuth, AuthError } from '@/context/AuthContext';
import { writeAuditLog } from '@/services/userService';
import { ROLE_LABELS, UPAZILA_OPTIONS, type CommitteeType, type UpazilaName, type UserRole } from '@/types';
import { supabase } from '@/lib/supabase';
import { ShieldCheck, KeyRound, Hash, UserPlus } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';

interface FormValues {
  name: string;
  email: string;
  password: string;
  role: Exclude<UserRole, 'student' | 'teacher' | 'alumni'>;
  committeeType: CommitteeType;
  upazila: UpazilaName;
  position: string;
  committeeCode: string;
}

const committeeRoles: { value: FormValues['role']; label: string }[] = [
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
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { role: 'upazila_committee', committeeType: 'upazila', upazila: 'ঝিনাইদহ সদর' },
  });
  const [loading, setLoading] = useState(false);
  const committeeType = watch('committeeType');

  const generateCode = () => {
    const code = `JZS-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
    setValue('committeeCode', code);
    toast.success('কমিটি কোড তৈরি হয়েছে');
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const securityKey = generateSecurityKey();

      const { data: result, error: fnError } = await supabase.functions.invoke('admin-create-user', {
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

      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);

      await writeAuditLog({
        actorId: user!.uid,
        actorEmail: user!.email ?? '',
        actorRole: user!.role,
        action: 'account_created',
        targetId: result.uid,
        targetEmail: data.email,
        details: `কমিটি অ্যাকাউন্ট: ${data.name} (${ROLE_LABELS[data.role]})`,
      });
      toast.success('কমিটি অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে');
    } catch (e) {
      if (e instanceof AuthError) toast.error(e.message);
      else toast.error('অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">কমিটি অ্যাকাউন্ট তৈরি</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">শুধুমাত্র জেলা প্রশাসক কমিটি অ্যাকাউন্ট তৈরি করতে পারেন</p>
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 max-w-2xl space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ভূমিকা</label>
            <select className="input mt-1.5" {...register('role', { required: 'ভূমিকা আবশ্যক' })}>
              {committeeRoles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
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
            <p className="mt-1.5 text-xs text-amber-600 dark:text-amber-400">এই কোড ও নিরাপত্তা কী ব্যবহারকারীর কাছে প্রদর্শিত হবে না।</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            <UserPlus className="h-4 w-4" /> {loading ? 'তৈরি হচ্ছে...' : 'অ্যাকাউন্ট তৈরি করুন'}
          </button>
        </form>
      </FadeIn>

      <FadeIn delay={0.1}>
        <div className="card p-5 border-l-4 border-l-bd-green-500">
          <div className="flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-bd-green-600 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-gray-900 dark:text-white">নিরাপত্তা নোট</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">প্রতিটি কমিটি অ্যাকাউন্টে একটি গোপন নিরাপত্তা কী ও কমিটি কোড স্বয়ংক্রিয়ভাবে তৈরি হয়। এই তথ্য ডাটাবেসে সংরক্ষিত থাকে কিন্তু কখনো UI-তে দেখানো হয় না।</p>
            </div>
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
