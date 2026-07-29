import { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { HeroSection } from '@/components/home/HeroSection';
import { IntroSection } from '@/components/home/IntroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { NoticesSection } from '@/components/home/NoticesSection';
import { EventsSection } from '@/components/home/EventsSection';
import { ActivitiesSection } from '@/components/home/ActivitiesSection';
import { GalleryPreview } from '@/components/home/GalleryPreview';
import { ContactSection } from '@/components/home/ContactSection';
import { NoticeTicker } from '@/components/notice/NoticeTicker';
import { NoticeModal } from '@/components/notice/NoticeModal';
import { listNotices } from '@/services/contentService';
import type { Notice } from '@/types';

export function HomePage() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const list = await listNotices();
        setNotices(list);
      } catch {
        // fallback
      }
    };
    load();
  }, []);

  return (
    <>
      <SEO />
      <NoticeTicker notices={notices} onSelectNotice={(n) => setSelectedNotice(n)} />
      <HeroSection />
      <IntroSection />
      <StatsSection />
      <NoticesSection />
      <EventsSection />
      <ActivitiesSection />
      <GalleryPreview />
      <ContactSection />

      {/* Notice Modal View */}
      {selectedNotice && (
        <NoticeModal notice={selectedNotice} onClose={() => setSelectedNotice(null)} />
      )}
    </>
  );
}
