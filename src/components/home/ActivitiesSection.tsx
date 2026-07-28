import { Heart, Trees, Users, Cross } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { ACTIVITIES } from '@/data/sampleData';
import { formatBnDate } from '@/utils/format';
import type { LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = { heart: Heart, tree: Trees, users: Users, cross: Cross };

export function ActivitiesSection() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader title="সাম্প্রতিক কার্যক্রম" subtitle="সমাজে আমাদের অবদানের কিছু দৃষ্টান্ত" />
      <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ACTIVITIES.map((a) => {
          const Icon = iconMap[a.icon] ?? Heart;
          return (
            <StaggerItem key={a.id}>
              <div className="card p-5 h-full">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-bd-green-50 text-bd-green-600 dark:bg-bd-green-900/30 dark:text-bd-green-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-gray-900 dark:text-white">{a.title}</h3>
                <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-3">{a.description}</p>
                <p className="mt-3 text-xs text-gray-400">{formatBnDate(a.date)}</p>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerGroup>
    </section>
  );
}
