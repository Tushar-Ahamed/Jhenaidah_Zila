import { Link } from 'react-router-dom';
import { ShieldX, Home, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { FadeIn } from '@/components/ui/FadeIn';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export function UnauthorizedPage() {
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
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-bd-red-100 text-bd-red-600 dark:bg-bd-red-900/40 dark:text-bd-red-300">
          <ShieldX className="h-8 w-8" />
        </div>
        <h1 className="mt-5 text-2xl font-bold text-gray-900 dark:text-white">প্রবেশ অনুমোদিত নয়</h1>
        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
          দুঃখিত, এই পৃষ্ঠায় প্রবেশের জন্য আপনার পর্যাপ্ত অনুমতি নেই অথবা আপনার অ্যাকাউন্ট নিষ্ক্রিয় অবস্থায় আছে।
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
          {user ? (
            <button onClick={handleLogout} className="btn-primary">
              <LogIn className="h-4 w-4" /> লগআউট
            </button>
          ) : (
            <Link to="/login" className="btn-primary">
              <LogIn className="h-4 w-4" /> লগইন
            </Link>
          )}
        </div>
      </FadeIn>
    </div>
  );
}
