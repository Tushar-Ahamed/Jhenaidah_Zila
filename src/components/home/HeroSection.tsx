import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Calendar, MapPin, Sparkles, Users, Award, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ORG_INFO, STATS as DEFAULT_STATS } from '@/data/sampleData';
import { fetchDynamicStats, type DynamicStat } from '@/services/statsService';
import { toBnNumber } from '@/utils/format';

const statIcons = [Users, Award, BookOpen, MapPin];

export function HeroSection() {
  const [stats, setStats] = useState<DynamicStat[]>(DEFAULT_STATS);

  useEffect(() => {
    fetchDynamicStats().then((data) => {
      if (data && data.length > 0) setStats(data);
    });
  }, []);

  return (
    <section className="relative overflow-hidden bg-gray-950">
      {/* Dynamic Animated Mesh Backdrop */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/60 via-teal-950/80 to-gray-950" />
      <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-emerald-500/20 blur-[120px] animate-pulse" />
      <div className="absolute -bottom-32 -left-32 h-96 w-96 rounded-full bg-teal-500/25 blur-[120px] animate-pulse" style={{ animationDelay: '3s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[500px] rounded-full bg-green-500/10 blur-[150px]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="text-white"
          >
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-900/30 px-4 py-1.5 backdrop-blur-xl text-emerald-300 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
              <Sparkles className="h-4 w-4 text-emerald-400 animate-spin" style={{ animationDuration: '8s' }} />
              <span className="text-xs font-semibold tracking-wide">
                প্রতিষ্ঠা {toBnNumber(ORG_INFO.established)} • রাজশাহী বিশ্ববিদ্যালয়
              </span>
            </div>
            
            <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.12] tracking-tight text-white text-balance">
              {ORG_INFO.fullName}
            </h1>
            
            <p className="mt-5 text-lg text-emerald-100/90 max-w-xl leading-relaxed font-normal">
              {ORG_INFO.tagline}। রাজশাহী বিশ্ববিদ্যালয়ে অধ্যয়নরত ঝিনাইদহ জেলার শিক্ষার্থী ও সুধীবৃন্দের ঐতিহ্যবাহী প্ল্যাটফর্ম।
            </p>
            
            <div className="mt-9 flex flex-wrap gap-4">
              <Link
                to="/about"
                className="group relative inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-3.5 text-sm font-bold text-white shadow-[0_10px_30px_rgba(16,185,129,0.35)] transition-all duration-300 hover:scale-105 hover:shadow-[0_15px_40px_rgba(16,185,129,0.5)] active:scale-95"
              >
                আরও জানুন
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center gap-2.5 rounded-2xl border border-white/20 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur-xl shadow-lg transition-all duration-300 hover:bg-white/20 hover:border-white/40 active:scale-95"
              >
                সদস্য হোন
              </Link>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-emerald-200/80 text-sm font-medium border-t border-emerald-800/40 pt-6">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                বার্ষিক কার্যক্রম ও সাহায্য
              </span>
              <span className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-emerald-400" /> রাজশাহী বিশ্ববিদ্যালয় ক্যাম্পাস
              </span>
            </div>
          </motion.div>

          {/* Stats card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="relative rounded-3xl border border-white/15 bg-white/10 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_32px_64px_rgba(0,0,0,0.5)] text-white"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-400">পরিসংখ্যান ও অর্জন</p>
                <h3 className="mt-1 text-xl font-bold text-white">আমাদের শক্তি ও ঐক্য</h3>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5">
              {stats.map((s, idx) => {
                const Icon = statIcons[idx % statIcons.length];
                return (
                  <div
                    key={s.label}
                    className="group rounded-2xl bg-white/5 p-4 sm:p-5 border border-white/10 backdrop-blur-lg transition-all duration-300 hover:bg-white/15 hover:border-emerald-400/40 hover:-translate-y-1"
                  >
                    <div className="flex items-center justify-between text-emerald-300 mb-2">
                      <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                      <span className="text-[11px] font-semibold opacity-60">সমিতি</span>
                    </div>
                    <p className="text-3xl font-extrabold tracking-tight text-white">
                      {toBnNumber(s.value)}{s.suffix}
                    </p>
                    <p className="mt-1 text-xs font-medium text-emerald-100/70">{s.label}</p>
                  </div>
                );
              })}
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
