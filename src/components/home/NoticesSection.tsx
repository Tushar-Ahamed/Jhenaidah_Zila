import { Link } from 'react-router-dom';
import { Pin, CalendarDays, ArrowUpRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { NOTICES } from '@/data/sampleData';
import { formatBnDate, relativeBn } from '@/utils/format';

const categoryVariant: Record<string, 'red' | 'green' | 'amber' | 'blue'> = {
  'জরুরি': 'red',
  'সাধারণ': 'green',
  'অনুষ্ঠান': 'blue',
  'নির্বাচন': 'amber',
};

export function NoticesSection() {
  const notices = [...NOTICES].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)).slice(0, 4);
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader title="সাম্প্রতিক নোটিশ" subtitle="সর্বশেষ গুরুত্বপূর্ণ ঘোষণাসমূহ" to="/notices" />
      <StaggerGroup className="grid gap-5 md:grid-cols-2">
        {notices.map((n) => (
          <StaggerItem key={n.id}>
            <Link to="/notices" className="card p-5 group block h-full">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge variant={categoryVariant[n.category]}>{n.category}</Badge>
                  {n.pinned && (
                    <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      <Pin className="h-3 w-3" /> পিন করা
                    </span>
                  )}
                </div>
                <ArrowUpRight className="h-5 w-5 text-gray-400 group-hover:text-bd-green-600 transition" />
              </div>
              <h3 className="mt-3 font-semibold text-gray-900 dark:text-white group-hover:text-bd-green-700 dark:group-hover:text-bd-green-300 transition">
                {n.title}
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{n.body}</p>
              <div className="mt-4 flex items-center gap-3 text-xs text-gray-400">
                <span className="flex items-center gap-1"><CalendarDays className="h-3.5 w-3.5" /> {formatBnDate(n.date)}</span>
                <span>·</span>
                <span>{relativeBn(n.date)}</span>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}

export { FadeIn };
