import { useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

interface LightboxModalProps {
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function LightboxModal({ photos, currentIndex, onClose, onNavigate }: LightboxModalProps) {
  if (photos.length === 0 || currentIndex < 0 || currentIndex >= photos.length) return null;

  const currentPhoto = photos[currentIndex];

  const handlePrev = () => {
    onNavigate((currentIndex - 1 + photos.length) % photos.length);
  };

  const handleNext = () => {
    onNavigate((currentIndex + 1) % photos.length);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, photos]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-fadeIn">
      {/* Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 text-white">
        <span className="text-sm font-semibold tracking-wider bg-black/50 px-3 py-1 rounded-full border border-white/20">
          {currentIndex + 1} / {photos.length}
        </span>
        <button
          onClick={onClose}
          className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition text-white"
          aria-label="গ্যালারি বন্ধ করুন"
        >
          <X className="h-6 w-6" />
        </button>
      </div>

      {/* Main Image */}
      <div className="relative max-w-5xl max-h-[85vh] p-4 flex items-center justify-center select-none">
        <img
          src={currentPhoto}
          alt={`Gallery Photo ${currentIndex + 1}`}
          className="max-h-[80vh] max-w-full object-contain rounded-lg shadow-2xl transition duration-300"
        />
      </div>

      {/* Navigation Buttons */}
      {photos.length > 1 && (
        <>
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition border border-white/20"
            aria-label="পূর্ববর্তী ছবি"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>

          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition border border-white/20"
            aria-label="পরবর্তী ছবি"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}
    </div>
  );
}
