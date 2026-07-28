import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, User, Shield, ShieldCheck, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { supabase } from '@/lib/supabase';
import { FadeIn } from '@/components/ui/FadeIn';

interface FormValues {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

export function AdminSetupPage() {
  const navigate = useNavigate();
  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(true);
  const [adminExists, setAdminExists] = useState(false);
  const password = watch('password');

  useEffect(() => {
    (async () => {
      try {
        const { data, error } = await supabase.functions.invoke('bootstrap-admin', {
          method: 'GET',
        });
        if (error) throw error;
        setAdminExists(!!data?.adminExists);
      } catch {
        setAdminExists(false);
      } finally {
        setChecking(false);
      }
    })();
  }, []);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      const { data: result, error: fnError } = await supabase.functions.invoke('bootstrap-admin', {
        body: { email: data.email, password: data.password, name: data.name },
      });
      if (fnError) throw fnError;
      if (result?.error) throw new Error(result.error);

      // Auto-login the new admin
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      });
      if (signInError) throw signInError;

      toast.success('প্রশাসক অ্যাকাউন্ট তৈরি! ড্যাশবোর্ডে প্রবেশ করছে...');
      navigate('/dashboard');
    } catch (e) {
      toast.error((e as Error).message || 'অ্যাকাউন্ট তৈরিতে সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="animate-pulse text-gray-400">যাচাই করা হচ্ছে...</div>
      </div>
    );
  }

  if (adminExists) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
        <FadeIn>
          <div className="max-w-md w-full card p-8 text-center">
            <div className="mx-auto h-14 w-14 grid place-items-center rounded-2xl bg-bd-green-100 text-bd-green-600 dark:bg-bd-green-900/30 dark:text-bd-green-300">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <h1 className="mt-4 text-xl font-bold text-gray-900 dark:text-white">প্রশাসক ইতিমধ্যে তৈরি</h1>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">এই অ্যাপে একজন প্রশাসক ইতিমধ্যে আছেন। নতুন প্রশাসক অ্যাকাউন্ট তৈরি করা সম্ভব নয়।</p>
            <Link to="/login" className="btn-primary mt-6 inline-flex">
              লগইন করুন <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4 py-10">
      <FadeIn className="max-w-md w-full">
        <div className="card p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 grid place-items-center rounded-2xl bg-bd-gradient text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">প্রশাসক সেটআপ</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">প্রথম জেলা প্রশাসক অ্যাকাউন্ট তৈরি করুন</p>
            </div>
          </div>

          <div className="rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 p-3 mb-5">
            <p className="text-xs text-amber-700 dark:text-amber-300">
              এটি একবারমাত্র সেটআপ। প্রথম অ্যাকাউন্টটি স্বয়ংক্রিয়ভাবে জেলা প্রশাসক হিসেবে তৈরি হবে এবং সক্রিয় থাকবে। পরবর্তী সকল কমিটি/প্রশাসক অ্যাকাউন্ট এই অ্যাকাউন্ট থেকে তৈরি করতে হবে।
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">পূর্ণ নাম</label>
              <div className="relative mt-1.5">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input className="input pl-10" placeholder="আপনার নাম" {...register('name', { required: 'নাম আবশ্যক' })} />
              </div>
              {errors.name && <p className="mt-1 text-xs text-bd-red-600">{errors.name.message}</p>}
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ইমেইল</label>
              <div className="relative mt-1.5">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="email" className="input pl-10" placeholder="admin@example.com" {...register('email', { required: 'ইমেইল আবশ্যক' })} />
              </div>
              {errors.email && <p className="mt-1 text-xs text-bd-red-600">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">পাসওয়ার্ড</label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="password" className="input pl-10" placeholder="••••••••" {...register('password', { required: 'পাসওয়ার্ড আবশ্যক', minLength: { value: 6, message: 'কমপক্ষে ৬ অক্ষর' } })} />
                </div>
                {errors.password && <p className="mt-1 text-xs text-bd-red-600">{errors.password.message}</p>}
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">নিশ্চিত করুন</label>
                <div className="relative mt-1.5">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="password" className="input pl-10" placeholder="••••••••" {...register('confirm', { required: 'নিশ্চিতকরণ আবশ্যক', validate: (v) => v === password || 'পাসওয়ার্ড মেলেনি' })} />
                </div>
                {errors.confirm && <p className="mt-1 text-xs text-bd-red-600">{errors.confirm.message}</p>}
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              <Shield className="h-4 w-4" /> {loading ? 'তৈরি হচ্ছে...' : 'প্রশাসক অ্যাকাউন্ট তৈরি করুন'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
            <Link to="/login" className="font-semibold text-bd-green-700 dark:text-bd-green-300 hover:underline">
              লগইন করুন
            </Link>
          </p>
        </div>
      </FadeIn>
    </div>
  );
}
