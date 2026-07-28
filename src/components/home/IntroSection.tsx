import { FadeIn } from '@/components/ui/FadeIn';
import { Target, Eye, Users } from 'lucide-react';
import { ORG_INFO } from '@/data/sampleData';

const cards = [
  { icon: Target, title: 'আমাদের লক্ষ্য', text: ORG_INFO.mission, color: 'text-bd-green-600 bg-bd-green-50 dark:bg-bd-green-900/30' },
  { icon: Eye, title: 'আমাদের স্বপ্ন', text: ORG_INFO.vision, color: 'text-bd-red-600 bg-bd-red-50 dark:bg-bd-red-900/30' },
  { icon: Users, title: 'আমরা কারা', text: ORG_INFO.about, color: 'text-accent-600 bg-accent-50' },
];

export function IntroSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
      <FadeIn className="text-center max-w-2xl mx-auto">
        <span className="chip bg-bd-green-100 text-bd-green-700 dark:bg-bd-green-900/40 dark:text-bd-green-300">পরিচিতি</span>
        <h2 className="section-title mt-4">আমরা কারা</h2>
        <p className="section-subtitle">{ORG_INFO.about}</p>
      </FadeIn>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {cards.map((c, i) => (
          <FadeIn key={c.title} delay={i * 0.1}>
            <div className="card p-6 h-full">
              <div className={`grid h-12 w-12 place-items-center rounded-xl ${c.color}`}>
                <c.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">{c.title}</h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{c.text}</p>
            </div>
          </FadeIn>
        ))}
      </div>
    </section>
  );
}
