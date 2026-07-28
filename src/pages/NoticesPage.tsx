import { useState } from 'react';
import { SEO } from '@/components/SEO';
import { NOTICES } from '@/data/sampleData';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pin, CalendarDays, Search, FileText } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { formatBnDate, relativeBn } from '@/utils/format';

const categories = ['সব', 'জরুরি', 'সাধারণ', 'অনুষ্ঠান', 'নির্বাচন'] as const;
const variant: Record<string, 'red' | 'green' | 'amber' | 'blue'> = {
  'জরুরি': 'red',
  'সাধারণ': 'green',
  'অনুষ্ঠান': 'blue',
  'নির্বাচন': 'amber',
};

export function NoticesPage() {
  const [cat, setCat] = useState<string>('সব');
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 250);

  const filtered = NOTICES.filter((n) => {
    const matchCat = cat === 'সব' || n.category === cat;
    const matchQuery = n.title.includes(debounced) || n.body.includes(debounced);
    return matchCat && matchQuery;
  }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="নোটিশ" description="ঝিনাইদহ জেলা সমিতির সকল সরকারি ও ব্যক্তিগত নোটিশের তালিকা।" />
      <FadeIn>
        <span className="chip bg-bd-red-100 text-bd-red-700 dark:bg-bd-red-900/40 dark:text-bd-red-300">নোটিশ</span>
        <h1 className="section-title mt-4">গুরুত্বপূর্ণ ঘোষণা</h1>
        <p className="section-subtitle max-w-2xl">সমিতির সকল সরকারি ও ব্যক্তিগত নোটিশের তালিকা</p>
      </FadeIn>

      {/* Search + filter */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="নোটিশ খুঁজুন..." className="input pl-10" />
        </div>
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`chip transition ${
                cat === c ? 'bg-bd-green-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-bd-green-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8"><EmptyState icon={<FileText className="h-8 w-8" />} title="কোনো নোটিশ নেই" description="আপনার অনুসন্ধানের সাথে মিলে যাওয়া কোনো নোটিশ পাওয়া যায়নি।" /></div>
      ) : (
        <StaggerGroup className="mt-8 space-y-4">
          {filtered.map((n) => (
            <StaggerItem key={n.id}>
              <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={variant[n.category]}>{n.category}</Badge>
                    {n.pinned && <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"><Pin className="h-3 w-3" /> পিন করা</span>}
                  </div>
                  <h3 className="mt-3 text-lg font-semibold text-gray-900 dark:text-white">{n.title}</h3>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{n.body}</p>
                </div>
                <div className="shrink-0 text-left sm:text-right text-xs text-gray-400 sm:pl-4 sm:border-l sm:border-gray-100 dark:sm:border-gray-800 sm:min-w-[140px]">
                  <p className="flex items-center gap-1.5 sm:justify-end"><CalendarDays className="h-3.5 w-3.5" /> {formatBnDate(n.date)}</p>
                  <p className="mt-1 sm:justify-end">{relativeBn(n.date)}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
