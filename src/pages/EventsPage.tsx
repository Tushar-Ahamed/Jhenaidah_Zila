import { useState } from 'react';
import { SEO } from '@/components/SEO';
import { EVENTS } from '@/data/sampleData';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CalendarDays, MapPin, Clock } from 'lucide-react';
import { formatBnDate, isUpcoming } from '@/utils/format';

const tabs = [
  { key: 'upcoming', label: 'আসন্ন' },
  { key: 'past', label: 'অতীত' },
  { key: 'all', label: 'সব' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export function EventsPage() {
  const [tab, setTab] = useState<TabKey>('upcoming');

  const filtered = EVENTS.filter((e) => {
    if (tab === 'upcoming') return isUpcoming(e.date);
    if (tab === 'past') return !isUpcoming(e.date);
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="আয়োজন" description="ঝিনাইদহ জেলা সমিতির সাংস্কৃতিক, শিক্ষা ও সামাজিক আয়োজনের তালিকা।" />
      <FadeIn>
        <span className="chip bg-bd-green-100 text-bd-green-700 dark:bg-bd-green-900/40 dark:text-bd-green-300">আয়োজন</span>
        <h1 className="section-title mt-4">আমাদের কর্মসূচি</h1>
        <p className="section-subtitle max-w-2xl">সাংস্কৃতিক, শিক্ষা ও সামাজিক — সকল আয়োজনের তালিকা</p>
      </FadeIn>

      {/* Tabs */}
      <div className="mt-8 inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
              tab === t.key ? 'bg-white dark:bg-gray-900 text-bd-green-700 dark:text-bd-green-300 shadow-soft' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8"><EmptyState title="কোনো আয়োজন নেই" description="এই ক্যাটেগরিতে বর্তমানে কোনো আয়োজন নেই।" /></div>
      ) : (
        <StaggerGroup className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <StaggerItem key={e.id}>
              <div className="card overflow-hidden h-full flex flex-col">
                <div className="relative h-44 overflow-hidden">
                  <img src={e.coverImage} alt={e.title} className="h-full w-full object-cover" loading="lazy" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-3 left-3">
                    <Badge variant={isUpcoming(e.date) ? 'green' : 'gray'}>
                      {isUpcoming(e.date) ? 'আসন্ন' : 'অতীত'}
                    </Badge>
                  </div>
                </div>
                <div className="p-5 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{e.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-3 flex-1">{e.description}</p>
                  <div className="mt-4 space-y-2 text-xs text-gray-500 dark:text-gray-400">
                    <p className="flex items-center gap-2"><CalendarDays className="h-3.5 w-3.5 text-bd-green-600" /> {formatBnDate(e.date, 'EEEE, d MMMM yyyy')}</p>
                    <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-bd-green-600" /> {isUpcoming(e.date) ? 'শীঘ্রই' : 'সম্পন্ন'}</p>
                    <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-bd-green-600" /> {e.location}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
