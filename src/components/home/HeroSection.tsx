import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ORG_INFO, STATS } from '@/data/sampleData';
import { toBnNumber } from '@/utils/format';

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-bd-gradient" />
      <div className="absolute inset-0 bg-bd-radial opacity-50" />
      <div className="absolute -top-24 -right-24 h-72 w-72 rounded-full bg-bd-green-400/30 blur-3xl animate-float" />
      <div className="absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-bd-red-500/20 blur-3xl animate-float" style={{ animationDelay: '2s' }} />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white"
          >
            <span className="chip bg-white/15 backdrop-blur border border-white/20 text-white">
              <span className="h-2 w-2 rounded-full bg-bd-green-300 animate-pulse" />
              প্রতিষ্ঠা {toBnNumber(ORG_INFO.established)}
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.15] text-balance">
              {ORG_INFO.fullName}
            </h1>
            <p className="mt-4 text-lg text-white/85 max-w-xl leading-relaxed">
              {ORG_INFO.tagline}। রাজশাহী বিশ্ববিদ্যালয়ে অধ্যয়নরত ঝিনাইদহ জেলার শিক্ষার্থীদের ঐক্যের কেন্দ্র।
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/about" className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-bd-green-700 shadow-glass hover:shadow-glow transition active:scale-[0.98]">
                আরও জানুন <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/register" className="inline-flex items-center gap-2 rounded-xl bg-white/15 backdrop-blur border border-white/25 px-5 py-3 text-sm font-semibold text-white hover:bg-white/25 transition active:scale-[0.98]">
                সদস্য হোন
              </Link>
            </div>
            <div className="mt-8 flex items-center gap-5 text-white/80 text-sm">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> বার্ষিক অনুষ্ঠান</span>
              <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4" /> রাজশাহী ক্যাম্পাস</span>
            </div>
          </motion.div>

          {/* Stats card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-strong rounded-3xl p-6 shadow-glass-lg text-white"
          >
            <p className="text-sm text-white/70">আমাদের সাফল্যের পরিসংখ্যান</p>
            <div className="mt-5 grid grid-cols-2 gap-4">
              {STATS.map((s) => (
                <div key={s.label} className="rounded-2xl bg-white/10 backdrop-blur p-5 border border-white/10">
                  <p className="text-3xl font-bold">
                    {toBnNumber(s.value)}{s.suffix}
                  </p>
                  <p className="mt-1 text-sm text-white/70">{s.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Wave divider */}
      <div className="relative">
        <svg viewBox="0 0 1440 80" className="w-full h-12 sm:h-16" preserveAspectRatio="none">
          <path d="M0,40 C360,80 1080,0 1440,40 L1440,80 L0,80 Z" className="fill-gray-50 dark:fill-gray-950" />
        </svg>
      </div>
    </section>
  );
}
