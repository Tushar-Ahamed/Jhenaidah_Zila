import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { GALLERY } from '@/data/sampleData';

export function GalleryPreview() {
  const items = GALLERY.slice(0, 6);
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <SectionHeader title="গ্যালারি ঝলক" subtitle="আমাদের স্মৃতিচারণের কিছু মুহূর্ত" to="/gallery" />
      <StaggerGroup className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {items.map((g) => (
          <StaggerItem key={g.id}>
            <Link to="/gallery" className="group relative block aspect-square overflow-hidden rounded-2xl">
              <img src={g.url} alt={g.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-3">
                <div className="text-white">
                  <p className="text-xs font-medium line-clamp-2">{g.title}</p>
                  <ArrowUpRight className="h-4 w-4 mt-1" />
                </div>
              </div>
            </Link>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  );
}
