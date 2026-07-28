import { Link, useNavigate } from 'react-router-dom';
import { MailCheck, RefreshCw, LogOut, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { FadeIn } from '@/components/ui/FadeIn';

export function VerifyEmailPage() {
  const { resendVerification, logout, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [checking, setChecking] = useState(false);

  const handleResend = async () => {
    setSending(true);
    try {
      await resendVerification();
      toast.success('যাচাই লিংক পুনরায় পাঠানো হয়েছে');
    } catch {
      toast.error('লিংক পাঠাতে সমস্যা হয়েছে');
    } finally {
      setSending(false);
    }
  };

  const handleCheck = async () => {
    setChecking(true);
    try {
      await refreshUser();
      toast.success('ইমেইল যাচাই সম্পন্ন হয়েছে। লগইন করুন।');
      await logout();
      navigate('/login');
    } catch {
      toast.error('এখনো যাচাই হয়নি। ইমেইল চেক করুন।');
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center bg-bd-radial px-4">
      <FadeIn className="max-w-md w-full glass-strong rounded-3xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-bd-green-100 text-bd-green-600 dark:bg-bd-green-900/40 dark:text-bd-green-300">
          <MailCheck className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">ইমেইল যাচাই করুন</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          আপনার ইমেইলে একটি যাচাই লিংক পাঠানো হয়েছে। লিংকে ক্লিক করে ইমেইল যাচাই করুন, তারপর নিচের বাটনে ক্লিক করুন।
        </p>
        <div className="mt-6 space-y-3">
          <button onClick={handleCheck} disabled={checking} className="btn-primary w-full">
            <RefreshCw className={`h-4 w-4 ${checking ? 'animate-spin' : ''}`} /> {checking ? 'যাচাই হচ্ছে...' : 'যাচাই সম্পন্ন হয়েছে'}
          </button>
          <button onClick={handleResend} disabled={sending} className="btn-ghost w-full">
            <Send /> {sending ? 'পাঠানো হচ্ছে...' : 'লিংক পুনরায় পাঠান'}
          </button>
        </div>
        <Link to="/login" className="mt-5 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-bd-red-600">
          <LogOut className="h-4 w-4" /> লগইনে ফিরুন
        </Link>
      </FadeIn>
    </div>
  );
}
