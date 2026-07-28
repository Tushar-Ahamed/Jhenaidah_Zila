import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Mail, Send, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

interface FormValues {
  email: string;
}

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSent(true);
      toast.success('পাসওয়ার্ড পুনঃনির্ধারণ লিংক পাঠানো হয়েছে');
    } catch {
      toast.error('ইমেইল পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Link to="/login" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-bd-green-700 dark:hover:text-bd-green-300 mb-4">
        <ArrowLeft className="h-4 w-4" /> লগইনে ফিরুন
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">পাসওয়ার্ড ভুলে গেছেন?</h1>
      <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">আপনার ইমেইল দিন, আমরা পুনঃনির্ধারণ লিংক পাঠাব।</p>

      {sent ? (
        <div className="mt-6 rounded-2xl bg-bd-green-50 dark:bg-bd-green-900/30 border border-bd-green-200 dark:border-bd-green-800 p-5 text-center">
          <p className="text-sm text-bd-green-800 dark:text-bd-green-200">
            আপনার ইমেইলে পুনঃনির্ধারণ লিংক পাঠানো হয়েছে। ইনবক্স চেক করুন।
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ইমেইল</label>
            <div className="relative mt-1.5">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="email" className="input pl-10" placeholder="email@example.com" {...register('email', { required: 'ইমেইল আবশ্যক' })} />
            </div>
            {errors.email && <p className="mt-1 text-xs text-bd-red-600">{errors.email.message}</p>}
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full">
            <Send className="h-4 w-4" /> {loading ? 'পাঠানো হচ্ছে...' : 'লিংক পাঠান'}
          </button>
        </form>
      )}
    </div>
  );
}
