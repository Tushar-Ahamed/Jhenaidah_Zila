import { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Pin, CalendarDays, Search, FileText, Printer, Download, Eye } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { formatBnDate, relativeBn } from '@/utils/format';
import { listNotices } from '@/services/contentService';
import { NoticeModal } from '@/components/notice/NoticeModal';
import { UPAZILA_OPTIONS, type Notice, type UpazilaName } from '@/types';

const categories = ['সব', 'জরুরি', 'সাধারণ', 'অনুষ্ঠান', 'নির্বাচন', 'পরীক্ষা/ভর্তি', 'বৃত্তি'] as const;

const variant: Record<string, 'red' | 'green' | 'amber' | 'blue'> = {
  'জরুরি': 'red',
  'সাধারণ': 'green',
  'অনুষ্ঠান': 'blue',
  'নির্বাচন': 'amber',
  'পরীক্ষা/ভর্তি': 'blue',
  'বৃত্তি': 'green',
};

export function NoticesPage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [cat, setCat] = useState<string>('সব');
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<'all' | 'district' | 'upazila'>('all');
  const [selectedUpazila, setSelectedUpazila] = useState<UpazilaName>('ঝিনাইদহ সদর');
  const [activeNotice, setActiveNotice] = useState<Notice | null>(null);

  const debounced = useDebounce(query, 250);

  const load = async () => {
    setLoading(true);
    try {
      const list = await listNotices(
        scope === 'all' ? undefined : scope,
        scope === 'upazila' ? selectedUpazila : undefined
      );
      setNotices(list);
    } catch {
      setNotices([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [scope, selectedUpazila]);

  const pinnedNotices = notices.filter((n) => n.pinned);

  const filtered = notices.filter((n) => {
    const matchCat = cat === 'সব' || n.category === cat;
    const q = debounced.trim().toLowerCase();
    const haystack = [n.title, n.body, n.category, n.upazila ?? ''].join(' ').toLowerCase();
    const matchQuery = !q || haystack.includes(q);
    return matchCat && matchQuery;
  }).sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SEO title="নোটিশ বোর্ড" description="ঝিনাইদহ জেলা সমিতির সকল সরকারি, জরুরি ও ব্যক্তিগত নোটিশের তালিকা।" />

      <FadeIn>
        <span className="chip bg-bd-red-100 text-bd-red-700 dark:bg-bd-red-900/40 dark:text-bd-red-300">
          অফিশিয়াল নোটিশ বোর্ড
        </span>
        <h1 className="section-title mt-3">গুরুত্বপূর্ণ ঘোষণা ও বিজ্ঞপ্তি</h1>
        <p className="section-subtitle max-w-2xl">
          ঝিনাইদহ জেলা সমিতি ও উপজেলা শাখাসমূহের সকল জরুরি বিজ্ঞপ্তি, সাধারণ নোটিশ ও সিদ্ধান্তসমূহ।
        </p>
      </FadeIn>

      {/* Pinned Notices Box (if pinned notices exist) */}
      {pinnedNotices.length > 0 && (
        <FadeIn>
          <div className="card p-5 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border-2 border-amber-500/30 shadow-md">
            <div className="flex items-center gap-2 mb-3 text-amber-800 dark:text-amber-300 font-bold text-sm">
              <Pin className="h-4 w-4 fill-amber-500 text-amber-600" />
              <span>পিন করা বিশেষ নোটিশ ({pinnedNotices.length})</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {pinnedNotices.map((pn) => (
                <div
                  key={pn.id}
                  onClick={() => setActiveNotice(pn)}
                  className="p-3.5 rounded-xl bg-white dark:bg-gray-800 border border-amber-500/20 shadow-sm cursor-pointer hover:border-amber-500 transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="amber">{pn.category}</Badge>
                      <span className="text-[11px] text-gray-400">
                        {pn.scope === 'upazila' ? pn.upazila : 'জেলা শাখা'}
                      </span>
                    </div>
                    <h3 className="font-bold text-sm text-gray-900 dark:text-white line-clamp-1">{pn.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{pn.body}</p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-[11px] text-bd-green-600 font-semibold">
                    <span>পড়ুন ও ডাউনলোড করুন</span>
                    <Eye className="h-3.5 w-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      )}

      {/* Search & Scope Filters Bar */}
      <div className="card p-4 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* Search input */}
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="শিরোনাম বা বর্ণনা দিয়ে খুঁজুন..."
              className="input pl-10"
            />
          </div>

          {/* Scope Selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
              <button
                onClick={() => setScope('all')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  scope === 'all' ? 'bg-bd-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                সব
              </button>
              <button
                onClick={() => setScope('district')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  scope === 'district' ? 'bg-bd-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                জেলা নোটিশ
              </button>
              <button
                onClick={() => setScope('upazila')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  scope === 'upazila' ? 'bg-bd-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                উপজেলা নোটিশ
              </button>
            </div>

            {scope === 'upazila' && (
              <select
                value={selectedUpazila || ''}
                onChange={(e) => setSelectedUpazila(e.target.value as UpazilaName)}
                className="input !py-1.5 !px-3 !text-xs !w-auto"
              >
                {UPAZILA_OPTIONS.map((u) => (
                  <option key={u} value={u ?? ''}>{u}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex flex-wrap gap-1.5 pt-2 border-t border-gray-100 dark:border-gray-800">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`chip text-xs transition ${
                cat === c ? 'bg-bd-green-600 text-white' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-bd-green-50'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Notice List */}
      {loading ? (
        <div className="py-12 text-center text-gray-400">লোডিং হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-8 w-8" />}
          title="কোনো নোটিশ নেই"
          description="আপনার অনুসন্ধানের সাথে মিলে যাওয়া কোনো নোটিশ পাওয়া যায়নি।"
        />
      ) : (
        <StaggerGroup className="space-y-4">
          {filtered.map((n) => (
            <StaggerItem key={n.id}>
              <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 hover:border-bd-green-400 transition">
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={variant[n.category] || 'green'}>{n.category}</Badge>
                    {n.scope === 'upazila' && (
                      <Badge variant="blue">{n.upazila} শাখা</Badge>
                    )}
                    {n.pinned && (
                      <span className="chip bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                        <Pin className="h-3 w-3" /> পিন করা
                      </span>
                    )}
                  </div>
                  <h3
                    onClick={() => setActiveNotice(n)}
                    className="text-lg font-bold text-gray-900 dark:text-white hover:text-bd-green-600 transition cursor-pointer"
                  >
                    {n.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">
                    {n.body}
                  </p>
                </div>

                <div className="shrink-0 flex flex-col sm:items-end justify-between gap-3 pt-3 sm:pt-0 sm:pl-4 border-t sm:border-t-0 sm:border-l border-gray-100 dark:border-gray-800 text-xs text-gray-400">
                  <div>
                    <p className="flex items-center gap-1.5 sm:justify-end">
                      <CalendarDays className="h-3.5 w-3.5 text-bd-green-600" />
                      {formatBnDate(n.date)}
                    </p>
                    <p className="mt-0.5 sm:justify-end text-[11px]">{relativeBn(n.date)}</p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setActiveNotice(n)}
                      className="btn-primary !py-1.5 !px-3 text-xs flex items-center gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" /> বিস্তারিত ও প্রিন্ট
                    </button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {/* Notice Detail Modal View with Print & Download PDF */}
      {activeNotice && (
        <NoticeModal notice={activeNotice} onClose={() => setActiveNotice(null)} />
      )}
    </div>
  );
}
