import { useState } from 'react';
import { SEO } from '@/components/SEO';
import { GALLERY } from '@/data/sampleData';
import { FadeIn } from '@/components/ui/FadeIn';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { formatBnDate } from '@/utils/format';

const categories = ['সব', ...Array.from(new Set(GALLERY.map((g) => g.category)))];

export function GalleryPage() {
  const [active, setActive] = useState('সব');
  const [lightbox, setLightbox] = useState<string | null>(null);

  const items = active === 'সব' ? GALLERY : GALLERY.filter((g) => g.category === active);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="গ্যালারি" description="ঝিনাইদহ জেলা সমিতির আয়োজন ও কার্যক্রমের ছবি।" />
      <FadeIn>
        <span className="chip bg-bd-green-100 text-bd-green-700 dark:bg-bd-green-900/40 dark:text-bd-green-300">গ্যালারি</span>
        <h1 className="section-title mt-4">স্মৃতির ফ্রেম</h1>
        <p className="section-subtitle max-w-2xl">আমাদের আয়োজন ও কার্যক্রমের কিছু নির্বাচিত ছবি</p>
      </FadeIn>

      {/* Filter */}
      <div className="mt-8 flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`chip transition ${
              active === c
                ? 'bg-bd-green-600 text-white'
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300 hover:bg-bd-green-50'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {items.length === 0 ? (
        <div className="mt-8"><EmptyState title="কোনো ছবি নেই" description="এই ক্যাটেগরিতে এখনো কোনো ছবি যোগ করা হয়নি।" /></div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((g, i) => (
            <FadeIn key={g.id} delay={(i % 6) * 0.05}>
              <button onClick={() => setLightbox(g.url)} className="group relative block w-full overflow-hidden rounded-2xl card p-0 text-left">
                <div className="aspect-[4/3] overflow-hidden">
                  <img src={g.url} alt={g.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{g.title}</h3>
                    <Badge variant="green">{g.category}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{formatBnDate(g.date)}</p>
                </div>
              </button>
            </FadeIn>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur p-4"
          >
            <button className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={() => setLightbox(null)}>
              <X className="h-5 w-5" />
            </button>
            <motion.img
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              src={lightbox}
              alt="preview"
              className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
