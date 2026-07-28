import { FadeIn, StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { STATS } from '@/data/sampleData';
import { toBnNumber } from '@/utils/format';

export function StatsSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="rounded-3xl bg-bd-gradient p-8 sm:p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-bd-radial opacity-40" />
        <div className="relative">
          <div className="text-center text-white">
            <h2 className="text-2xl sm:text-3xl font-bold">সংখ্যায় আমরা</h2>
            <p className="mt-2 text-white/80 text-sm">এক দশকের বেশি সময় ধরে শিক্ষার্থীদের পাশে</p>
          </div>
          <StaggerGroup className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-5">
            {STATS.map((s) => (
              <StaggerItem key={s.label}>
                <div className="text-center text-white">
                  <p className="text-4xl sm:text-5xl font-bold">
                    {toBnNumber(s.value)}<span className="text-bd-green-300">{s.suffix}</span>
                  </p>
                  <p className="mt-2 text-sm text-white/75">{s.label}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </div>
    </section>
  );
}

export function StatsSectionWithHeader() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader title="সংখ্যায় আমরা" subtitle="এক দশকের বেশি সময় ধরে শিক্ষার্থীদের পাশে" align="center" />
      <FadeIn className="mt-8 grid grid-cols-2 lg:grid-cols-4 gap-5">
        {STATS.map((s) => (
          <div key={s.label} className="card p-6 text-center">
            <p className="text-4xl font-bold text-bd-green-600">{toBnNumber(s.value)}{s.suffix}</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{s.label}</p>
          </div>
        ))}
      </FadeIn>
    </section>
  );
}
