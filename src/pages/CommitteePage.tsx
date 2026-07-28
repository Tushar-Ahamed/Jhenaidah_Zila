import { useState } from 'react';
import { SEO } from '@/components/SEO';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { COMMITTEE } from '@/data/sampleData';
import { Mail, Phone, Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { EmptyState } from '@/components/ui/EmptyState';

export function CommitteePage() {
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 250);
  const filtered = COMMITTEE.filter(
    (m) => m.name.includes(debounced) || m.designation.includes(debounced)
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="কমিটি" description="ঝিনাইদহ জেলা সমিতির আহ্বায়ক কমিটি ২০২৬-২৭ এর সদস্যবৃন্দ।" />
      <FadeIn>
        <span className="chip bg-bd-green-100 text-bd-green-700 dark:bg-bd-green-900/40 dark:text-bd-green-300">জেলা কমিটি</span>
        <h1 className="section-title mt-4">আহ্বায়ক কমিটি ২০২৬-২৭</h1>
        <p className="section-subtitle max-w-2xl">সমিতির সার্বিক কার্যক্রম পরিচালনার জন্য গঠিত আহ্বায়ক কমিটির সদস্যবৃন্দ</p>
      </FadeIn>

      {/* Search */}
      <div className="mt-8 relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="নাম বা পদবি দিয়ে খুঁজুন..."
          className="input pl-10"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="কোনো সদস্য পাওয়া যায়নি" description="আপনার অনুসন্ধানের সাথে মিলে যাওয়া কোনো কমিটি সদস্য নেই।" />
        </div>
      ) : (
        <StaggerGroup className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <StaggerItem key={m.id}>
              <div className="card p-5 h-full">
                <div className="flex items-center gap-4">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-bd-gradient text-white text-xl font-semibold shrink-0">
                    {m.name[0]}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 dark:text-white truncate">{m.name}</h3>
                    <p className="text-sm text-bd-green-700 dark:text-bd-green-300">{m.designation}</p>
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-400">{m.organization}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {m.phone && <Badge variant="gray"><Phone className="h-3 w-3" /> {m.phone}</Badge>}
                  {m.email && <Badge variant="gray"><Mail className="h-3 w-3" /> {m.email}</Badge>}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}
    </div>
  );
}
