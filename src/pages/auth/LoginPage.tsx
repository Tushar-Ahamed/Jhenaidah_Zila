import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Lock, LogIn, Eye, EyeOff, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuth, AuthError } from '@/context/AuthContext';

interface FormValues {
  email: string;
  password: string;
  remember: boolean;
}

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: { remember: true },
  });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      await login({ email: data.email, password: data.password, remember: data.remember });
      toast.success('সফলভাবে লগইন হয়েছে');
      navigate('/dashboard');
    } catch (e) {
      if (e instanceof AuthError) {
        if (e.code === 'EMAIL_NOT_VERIFIED') navigate('/verify-email');
        else if (e.code === 'ACCOUNT_PENDING') navigate('/pending-approval');
        else if (e.code === 'ACCOUNT_SUSPENDED' || e.code === 'ACCOUNT_DELETED') navigate('/unauthorized');
        else toast.error(e.message);
      } else {
        toast.error('লগইন ব্যর্থ হয়েছে। তথ্য যাচাই করুন।');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">লগইন করুন</h1>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">আপনার অ্যাকাউন্টে প্রবেশ করুন</p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ইমেইল</label>
          <div className="relative mt-1.5">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type="email" className="input pl-10" placeholder="email@example.com" {...register('email', { required: 'ইমেইল আবশ্যক' })} />
          </div>
          {errors.email && <p className="mt-1 text-xs text-bd-red-600">{errors.email.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">পাসওয়ার্ড</label>
          <div className="relative mt-1.5">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input type={showPass ? 'text' : 'password'} className="input pl-10 pr-10" placeholder="••••••••" {...register('password', { required: 'পাসওয়ার্ড আবশ্যক', minLength: { value: 6, message: 'কমপক্ষে ৬ অক্ষর' } })} />
            <button type="button" onClick={() => setShowPass((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && <p className="mt-1 text-xs text-bd-red-600">{errors.password.message}</p>}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-bd-green-600 focus:ring-bd-green-500" {...register('remember')} />
            আমাকে মনে রাখুন
          </label>
          <Link to="/forgot-password" className="text-xs font-medium text-bd-green-700 dark:text-bd-green-300 hover:underline">
            পাসওয়ার্ড ভুলে গেছেন?
          </Link>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          <LogIn className="h-4 w-4" /> {loading ? 'প্রক্রিয়াকরণ...' : 'লগইন'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
        অ্যাকাউন্ট নেই?{' '}
        <Link to="/register" className="font-semibold text-bd-green-700 dark:text-bd-green-300 hover:underline">
          নিবন্ধন করুন
        </Link>
      </p>

      <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <Link to="/admin-setup" className="flex items-center justify-center gap-1.5 text-xs font-medium text-gray-400 hover:text-bd-green-600 dark:hover:text-bd-green-300 transition">
          <Shield className="h-3.5 w-3.5" /> প্রশাসক সেটআপ
        </Link>
      </div>
    </div>
  );
}
