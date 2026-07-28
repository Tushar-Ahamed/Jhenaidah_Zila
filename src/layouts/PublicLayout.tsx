import { Outlet } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-bd-radial">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[200] focus:rounded-lg focus:bg-bd-green-600 focus:px-4 focus:py-2 focus:text-white focus:shadow-glass"
      >
        মূল কন্টেন্টে যান
      </a>
      <Navbar />
      <main id="main-content" className="flex-1" role="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
