import { Link } from 'react-router-dom';
import { SEO } from '@/components/SEO';
import { Home, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

export function NotFoundPage() {
  return (
    <div className="min-h-screen grid place-items-center bg-bd-radial px-4">
      <SEO title="পৃষ্ঠা পাওয়া যায়নি" description="এই পৃষ্ঠাটি বিদ্যমান নেই।" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md"
      >
        <div className="relative mx-auto h-40 w-40">
          <div className="absolute inset-0 rounded-full bg-bd-green-500/20 blur-2xl" />
          <div className="relative grid h-full w-full place-items-center rounded-full bg-bd-gradient text-white">
            <span className="text-6xl font-bold">৪০৪</span>
          </div>
        </div>
        <h1 className="mt-8 text-2xl font-bold text-gray-900 dark:text-white">পৃষ্ঠাটি খুঁজে পাওয়া যায়নি</h1>
        <p className="mt-2 text-gray-500 dark:text-gray-400">
          দুঃখিত, আপনি যে পৃষ্ঠাটি খুঁজছেন সেটি বিদ্যমান নেই বা সরিয়ে ফেলা হয়েছে।
        </p>
        <div className="mt-6 flex items-center justify-center gap-3">
          <button onClick={() => window.history.back()} className="btn-ghost">
            <ArrowLeft className="h-4 w-4" /> ফিরে যান
          </button>
          <Link to="/" className="btn-primary">
            <Home className="h-4 w-4" /> হোমপেজে
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
