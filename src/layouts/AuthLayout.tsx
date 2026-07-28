import { Outlet, Link } from 'react-router-dom';
import { ORG_INFO } from '@/data/sampleData';
import { ThemeToggle } from '@/components/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-bd-gradient">
      {/* Brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-bd-radial opacity-40" />
        <div className="relative">
          <Link to="/" className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-white/15 backdrop-blur text-white font-bold text-xl">
              ঝি
            </div>
            <div>
              <p className="font-bold">{ORG_INFO.name}</p>
              <p className="text-xs text-white/70">{ORG_INFO.university}</p>
            </div>
          </Link>
        </div>
        <div className="relative">
          <h2 className="text-4xl font-bold leading-tight">
            ঐক্য, সংহতি ও<br />উন্নয়নের ঠিকানা
          </h2>
          <p className="mt-4 text-white/80 max-w-md leading-relaxed">
            রাজশাহী বিশ্ববিদ্যালয়ে অধ্যয়নরত ঝিনাইদহের শিক্ষার্থীদের একত্রিত করতে আমাদের সাথে যুক্ত হোন।
          </p>
        </div>
        <p className="relative text-xs text-white/60">© {new Date().getFullYear()} {ORG_INFO.fullName}</p>
      </div>

      {/* Form panel */}
      <div className="flex flex-col">
        <div className="flex items-center justify-between p-4">
          <Link to="/" className="lg:hidden flex items-center gap-2 text-white">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur font-bold">ঝি</div>
            <span className="font-semibold text-sm">{ORG_INFO.name}</span>
          </Link>
          <div className="ml-auto"><ThemeToggle /></div>
        </div>
        <div className="flex-1 grid place-items-center p-6 sm:p-10">
          <div className="w-full max-w-md glass-strong rounded-3xl p-6 sm:p-8 shadow-glass-lg">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
