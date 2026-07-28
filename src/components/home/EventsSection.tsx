import { Link } from 'react-router-dom';
import { CalendarDays, MapPin, ArrowUpRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { Badge } from '@/components/ui/Badge';
import { StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { EVENTS } from '@/data/sampleData';
import { formatBnDate, isUpcoming } from '@/utils/format';

export function EventsSection() {
  const events = EVENTS.filter((e) => isUpcoming(e.date)).slice(0, 3);
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader title="আসন্ন আয়োজন" subtitle="আগামী দিনের গুরুত্বপূর্ণ কর্মসূচি" to="/events" />
      <StaggerGroup className="grid gap-6 md:grid-cols-3">
        {events.map((e) => (
          <StaggerItem key={e.id}>
            <Link to="/events" className="card overflow-hidden group block h-full">
              <div className="relative h-44 overflow-hidden">
                <img src={e.coverImage} alt={e.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute top-3 left-3"><Badge variant="green">আসন্ন</Badge></div>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5" /> {formatBnDate(e.date)}</p>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-bd-green-700 dark:group-hover:text-bd-green-300 transition flex items-center justify-between">
                  {e.title}
                  <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </h3>
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{e.description}</p>
                <p className="mt-3 text-xs text-gray-400 flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {e.location}</p>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
