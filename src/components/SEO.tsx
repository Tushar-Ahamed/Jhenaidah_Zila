import { useEffect } from 'react';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  type?: string;
}

const SITE_NAME = 'ঝিনাইদহ জেলা সমিতি, রাজশাহী বিশ্ববিদ্যালয়';
const DEFAULT_DESC = 'ঝিনাইদহ জেলা সমিতি, রাজশাহী বিশ্ববিদ্যালয় — ঐক্য, সংহতি ও উন্নয়নের ঠিকানা।';

function setMeta(attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

export function SEO({ title, description = DEFAULT_DESC, image, type = 'website' }: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : SITE_NAME;

  useEffect(() => {
    document.title = fullTitle;
    setMeta('name', 'description', description);
    setMeta('property', 'og:title', fullTitle);
    setMeta('property', 'og:description', description);
    setMeta('property', 'og:type', type);
    setMeta('property', 'og:site_name', SITE_NAME);
    setMeta('name', 'twitter:card', 'summary_large_image');
    setMeta('name', 'twitter:title', fullTitle);
    setMeta('name', 'twitter:description', description);
    if (image) {
      setMeta('property', 'og:image', image);
      setMeta('name', 'twitter:image', image);
    }
  }, [fullTitle, description, image, type]);

  return null;
}
