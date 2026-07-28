import { Link } from 'react-router-dom';
import { Clock, LogOut, Home } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { FadeIn } from '@/components/ui/FadeIn';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

export function PendingApprovalPage() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success('লগআউট সম্পন্ন');
    navigate('/');
  };

  return (
    <div className="min-h-screen grid place-items-center bg-bd-radial px-4">
      <FadeIn className="max-w-md w-full glass-strong rounded-3xl p-8 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-300">
          <Clock className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">অনুমোদনের অপেক্ষায়</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          আপনার অ্যাকাউন্ট সফলভাবে নিবন্ধিত হয়েছে, তবে এখনো প্রশাসকের অনুমোদনের অপেক্ষায় আছে। অনুমোদিত হলে আপনি লগইন করতে পারবেন।
        </p>
        {user && (
          <p className="mt-3 text-xs text-gray-400">
            অ্যাকাউন্ট: <span className="font-medium text-gray-600 dark:text-gray-300">{user.email}</span>
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <Link to="/" className="btn-ghost">
            <Home className="h-4 w-4" /> হোম
          </Link>
          <button onClick={handleLogout} className="btn-primary">
            <LogOut className="h-4 w-4" /> লগআউট
          </button>
        </div>
      </FadeIn>
    </div>
  );
}
