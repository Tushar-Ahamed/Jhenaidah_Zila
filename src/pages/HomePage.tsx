import { SEO } from '@/components/SEO';
import { HeroSection } from '@/components/home/HeroSection';
import { IntroSection } from '@/components/home/IntroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { NoticesSection } from '@/components/home/NoticesSection';
import { EventsSection } from '@/components/home/EventsSection';
import { ActivitiesSection } from '@/components/home/ActivitiesSection';
import { GalleryPreview } from '@/components/home/GalleryPreview';
import { ContactSection } from '@/components/home/ContactSection';

export function HomePage() {
  return (
    <>
      <SEO />
      <HeroSection />
      <IntroSection />
      <StatsSection />
      <NoticesSection />
      <EventsSection />
      <ActivitiesSection />
      <GalleryPreview />
      <ContactSection />
    </>
  );
}
