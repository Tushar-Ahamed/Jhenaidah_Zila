import { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { CalendarDays, MapPin, Clock, Award, CheckCircle, Eye, Calendar as CalendarIcon } from 'lucide-react';
import { formatBnDate, isUpcoming } from '@/utils/format';
import { listEvents } from '@/services/contentService';
import { EventModal } from '@/components/events/EventModal';
import { UPAZILA_OPTIONS, type OrgEvent, type UpazilaName } from '@/types';

const tabs = [
  { key: 'upcoming', label: 'আসন্ন আয়োজন (Upcoming Events)' },
  { key: 'past', label: 'সম্পন্ন আয়োজন (Past Events)' },
  { key: 'all', label: 'সকল আয়োজন' },
] as const;

type TabKey = (typeof tabs)[number]['key'];

export function EventsPage() {
  const [tab, setTab] = useState<TabKey>('upcoming');
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'all' | 'district' | 'upazila'>('all');
  const [selectedUpazila, setSelectedUpazila] = useState<UpazilaName>('ঝিনাইদহ সদর');
  const [selectedEvent, setSelectedEvent] = useState<OrgEvent | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const list = await listEvents(
        scope === 'all' ? undefined : scope,
        scope === 'upazila' ? selectedUpazila : undefined
      );
      setEvents(list);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [scope, selectedUpazila]);

  const filtered = events.filter((e) => {
    if (tab === 'upcoming') return isUpcoming(e.date);
    if (tab === 'past') return !isUpcoming(e.date);
    return true;
  });

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SEO title="কর্মসূচি ও আয়োজন" description="ঝিনাইদহ জেলা সমিতির সাংস্কৃতিক, শিক্ষা, অনলাইন রেজিস্ট্রেশন ও সামাজিক আয়োজনের তথ্য।" />

      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <span className="chip bg-bd-green-100 text-bd-green-700 dark:bg-bd-green-900/40 dark:text-bd-green-300">
              আমাদের কর্মসূচি ও অনুষ্ঠান
            </span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-3 flex items-center gap-2">
              <CalendarIcon className="h-7 w-7 text-bd-green-600" />
              ইভেন্ট ও আয়োজন নির্দেশিকা (Event System)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              ঝিনাইদহ জেলা সমিতি ও উপজেলা শাখা সমূহের শিক্ষামূলক, সাংস্কৃতিক ও বার্ষিক অনুষ্ঠান নির্দেশিকা।
            </p>
          </div>
        </div>
      </FadeIn>

      {/* Filter Bar */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
                  tab === t.key ? 'bg-white dark:bg-gray-900 text-bd-green-700 dark:text-bd-green-300 shadow-sm' : 'text-gray-500 dark:text-gray-400'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Scope Dropdown */}
          <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                scope === 'all' ? 'bg-bd-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              সব নোটিশ/আয়োজন
            </button>
            <button
              onClick={() => setScope('district')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                scope === 'district' ? 'bg-bd-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              জেলা আয়োজন
            </button>
            <button
              onClick={() => setScope('upazila')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                scope === 'upazila' ? 'bg-bd-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              উপজেলা আয়োজন
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

        <p className="text-xs text-gray-400">মোট {filtered.length} টি আয়োজন</p>
      </div>

      {/* Events Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-gray-400">লোডিং হচ্ছে...</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="কোনো আয়োজন নেই" description="এই তালিকায় বর্তমানে কোনো আয়োজন নেই।" />
      ) : (
        <StaggerGroup className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <StaggerItem key={e.id}>
              <div className="card overflow-hidden h-full flex flex-col group border hover:border-bd-green-400 transition shadow-sm hover:shadow-md">
                {/* Banner */}
                <div className="relative h-48 overflow-hidden bg-black">
                  {e.coverImage ? (
                    <img src={e.coverImage} alt={e.title} className="h-full w-full object-cover group-hover:scale-105 transition duration-500" loading="lazy" />
                  ) : (
                    <div className="h-full w-full bg-bd-gradient grid place-items-center text-white/50 font-bold text-xl">
                      ঝিনাইদহ জেলা সমিতি
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-1">
                    <Badge variant={isUpcoming(e.date) ? 'amber' : 'gray'}>
                      {isUpcoming(e.date) ? 'আসন্ন' : 'সম্পন্ন'}
                    </Badge>
                    {e.registrationOpen && <Badge variant="green">রেজিস্ট্রেশন চালু</Badge>}
                  </div>
                  {e.scope === 'upazila' && e.upazila && (
                    <div className="absolute top-3 right-3"><Badge variant="blue">{e.upazila}</Badge></div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-1 justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-1 leading-snug">{e.title}</h3>
                    {e.chiefGuest && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 font-semibold mt-1 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5" /> প্রধান অতিথি: {e.chiefGuest}
                      </p>
                    )}
                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-2 leading-relaxed">{e.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-1.5 text-xs text-gray-500 dark:text-gray-400">
                    <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-bd-green-600" /> {formatBnDate(e.date)} {e.time ? `(${e.time})` : ''}</p>
                    <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-bd-green-600" /> {e.location}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <button
                      onClick={() => setSelectedEvent(e)}
                      className="btn-primary w-full text-xs flex items-center justify-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" /> বিস্তারিত ও রেজিস্ট্রেশন
                    </button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {/* Event Detail & Registration Modal */}
      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
    </div>
  );
}
