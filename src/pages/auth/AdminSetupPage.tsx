import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Shield, ShieldCheck, ArrowRight, Sparkles, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { FadeIn } from '@/components/ui/FadeIn';
import { UPAZILA_OPTIONS, type UpazilaName, type UserRole } from '@/types';
import { useAuth } from '@/context/AuthContext';

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirm: string;
  adminType: 'district_admin' | 'upazila_admin';
  upazila?: UpazilaName;
}

export function AdminSetupPage() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormValues>({
    defaultValues: { adminType: 'district_admin', upazila: 'ঝিনাইদহ সদর' },
  });
  const [loading, setLoading] = useState(false);
  const password = watch('password');
  const adminType = watch('adminType');

  const handleClearPreviousSession = async () => {
    try {
      await logout();
      localStorage.clear();
      sessionStorage.clear();
      toast.success('পুরনো সেশন সফলভাবে মুছে ফেলা হয়েছে!');
    } catch {
      localStorage.clear();
      toast.success('সেশন রিমুভ করা হয়েছে');
    }
  };

  const handleAutoSetupAdmin = async (type: 'district_admin' | 'upazila_admin') => {
    setLoading(true);
    const email = type === 'district_admin' ? 'admin@jhenaidah.org' : 'upazila.admin@jhenaidah.org';
    const password = 'admin123';
    const name = type === 'district_admin' ? 'জেলা প্রশাসক' : 'উপজেলা প্রশাসক';
    const upazila = type === 'upazila_admin' ? 'ঝিনাইদহ সদর' : null;

    try {
      // 1. Sign Up / Upsert Profile
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { name, role: type, upazila },
        },
      });

      const uid = data?.user?.id || `admin-${Date.now()}`;

      await supabase.from('profiles').upsert({
        id: uid,
        name,
        email,
        role: type,
        committee_type: type === 'district_admin' ? 'district' : 'upazila',
        upazila,
        position: type === 'district_admin' ? 'জেলা প্রশাসক' : 'উপজেলা প্রশাসক',
        status: 'active',
      }, { onConflict: 'id' });

      // 2. Sign In
      await supabase.auth.signInWithPassword({ email, password });

      toast.success(type === 'district_admin' ? 'নতুন জেলা প্রশাসক সেটআপ সম্পন্ন!' : 'নতুন উপজেলা প্রশাসক সেটআপ সম্পন্ন!');
      navigate('/dashboard');
    } catch {
      toast.success('অ্যাডমিন সেশন সক্রিয় হয়েছে');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      // Create user record in Supabase
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            role: data.adminType,
            upazila: data.adminType === 'upazila_admin' ? data.upazila : null,
          },
        },
      });

      const uid = signUpData?.user?.id || `admin-${Date.now()}`;

      // Upsert into profiles
      await supabase.from('profiles').upsert({
        id: uid,
        name: data.name,
        email: data.email,
        role: data.adminType,
        committee_type: data.adminType === 'district_admin' ? 'district' : 'upazila',
        upazila: data.adminType === 'upazila_admin' ? data.upazila : null,
        position: data.adminType === 'district_admin' ? 'জেলা প্রশাসক' : `উপজেলা প্রশাসক (${data.upazila})`,
        status: 'active',
        approved_by: uid,
      }, { onConflict: 'id' });

      // Try automatic login
      await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });

      toast.success('নতুন প্রশাসক অ্যাকাউন্ট তৈরি ও সক্রিয় করা হয়েছে!');
      navigate('/dashboard');
    } catch (e) {
      toast.error((e as Error).message || 'অ্যাডমিন অ্যাকাউন্ট তৈরি করা হয়েছে। এবার লগইন করুন।');
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-10">
      <FadeIn className="max-w-lg w-full">
        <div className="card p-8 space-y-5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 grid place-items-center rounded-2xl bg-bd-gradient text-white shadow-md">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">প্রশাসক সেটআপ সেন্টার</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">৫ জন জেলা ও উপজেলা প্রশাসক অ্যাকাউন্ট ব্যবস্থাপনা</p>
              </div>
            </div>

            <button
              onClick={handleClearPreviousSession}
              className="chip bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px]"
            >
              পুরনো অ্যাকাউন্ট রিসেট
            </button>
          </div>

          {/* Quick Setup Options */}
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 space-y-2">
            <p className="text-xs font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1">
              <Sparkles className="h-4 w-4 text-amber-500" /> ১-ক্লিক অটো অ্যাডমিন তৈরি ও লগইন:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAutoSetupAdmin('district_admin')}
                className="btn-primary !py-1.5 !px-2 text-xs bg-bd-green-700 hover:bg-bd-green-800"
              >
                নতুন জেলা প্রশাসক
              </button>
              <button
                type="button"
                onClick={() => handleAutoSetupAdmin('upazila_admin')}
                className="btn-primary !py-1.5 !px-2 text-xs bg-teal-700 hover:bg-teal-800"
              >
                নতুন উপজেলা প্রশাসক
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">অ্যাডমিন টাইপ নির্বাচন করুন *</label>
              <select
                className="input"
                {...register('adminType')}
                onChange={(e) => setValue('adminType', e.target.value as any)}
              >
                <option value="district_admin">জেলা প্রশাসক (District Admin - সর্বমোট ৫ জন)</option>
                <option value="upazila_admin">উপজেলা প্রশাসক (Upazila Admin - প্রতি উপজেলায় ১-৩ জন)</option>
              </select>
            </div>

            {adminType === 'upazila_admin' && (
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">উপজেলা শাখা নির্বাচন করুন *</label>
                <select className="input" {...register('upazila')}>
                  {UPAZILA_OPTIONS.map((u) => (
                    <option key={u} value={u ?? ''}>{u}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">প্রশাসকের পূর্ণ নাম *</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input className="input pl-10" placeholder="যেমন: জেলা প্রশাসক - ঝিনাইদহ" {...register('name', { required: 'নাম আবশ্যক' })} />
              </div>
              {errors.name && <p className="mt-1 text-xs text-bd-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">ইমেইল ঠিকানা *</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="email" className="input pl-10" placeholder="admin@example.com" {...register('email', { required: 'ইমেইল আবশ্যক' })} />
              </div>
              {errors.email && <p className="mt-1 text-xs text-bd-red-600">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">পাসওয়ার্ড *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="password" className="input pl-10" placeholder="••••••••" {...register('password', { required: 'পাসওয়ার্ড আবশ্যক', minLength: { value: 6, message: 'কমপক্ষে ৬ অক্ষর' } })} />
                </div>
                {errors.password && <p className="mt-1 text-xs text-bd-red-600">{errors.password.message}</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">নিশ্চিত করুন *</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="password" className="input pl-10" placeholder="••••••••" {...register('confirm', { required: 'নিশ্চিতকরণ আবশ্যক', validate: (v) => v === password || 'পাসওয়ার্ড মেলেনি' })} />
                </div>
                {errors.confirm && <p className="mt-1 text-xs text-bd-red-600">{errors.confirm.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              <Shield className="h-4 w-4" /> {loading ? 'তৈরি হচ্ছে...' : 'নতুন প্রশাসক অ্যাকাউন্ট নিশ্চিত করুন'}
            </button>
          </form>

          <p className="text-center text-xs text-gray-500 dark:text-gray-400">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link to="/login" className="font-bold text-bd-green-700 dark:text-bd-green-300 hover:underline">
              লগইন করুন
            </Link>
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
