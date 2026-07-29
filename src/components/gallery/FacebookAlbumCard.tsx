import type { MemoryAlbum } from '@/types';
import { MapPin, Calendar, Film, Image as ImageIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface FacebookAlbumCardProps {
  album: MemoryAlbum;
  onOpenPhoto: (photos: string[], initialIndex: number) => void;
}

export function FacebookAlbumCard({ album, onOpenPhoto }: FacebookAlbumCardProps) {
  const photos = album.photos || [];

  return (
    <div className="card overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-lg transition">
      {/* Header: Author Info */}
      <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-full bg-bd-gradient text-white font-bold shrink-0 shadow-sm overflow-hidden text-base">
            {album.authorPhoto ? (
              <img src={album.authorPhoto} alt={album.authorName} className="h-full w-full object-cover" />
            ) : (
              (album.authorName || 'অ')[0]
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-gray-900 dark:text-white">{album.authorName || 'কমিটি সদস্য'}</h3>
              {album.authorRole && <Badge variant="green" className="!text-[10px] !py-0">{album.authorRole}</Badge>}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-bd-green-600" />
                {new Date(album.date).toLocaleDateString('bn-BD')}
              </span>
              {album.location && (
                <span className="flex items-center gap-1 text-bd-green-700 dark:text-bd-green-300 font-medium">
                  <MapPin className="h-3 w-3" />
                  {album.location}
                </span>
              )}
            </div>
          </div>
        </div>

        <Badge variant="blue">{album.category}</Badge>
      </div>

      {/* Title & Description */}
      <div className="p-4 space-y-1.5">
        <h2 className="font-bold text-base text-gray-900 dark:text-white leading-snug">{album.title}</h2>
        {album.description && (
          <p className="text-xs text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
            {album.description}
          </p>
        )}
      </div>

      {/* Video Embed Section (if video exists) */}
      {album.videoUrl && (
        <div className="px-4 pb-3">
          <div className="relative rounded-xl overflow-hidden bg-black aspect-video flex items-center justify-center border border-gray-800">
            {album.videoUrl.includes('youtube') || album.videoUrl.includes('youtu.be') ? (
              <iframe
                src={`https://www.youtube.com/embed/${album.videoUrl.split('v=')[1] || album.videoUrl.split('/').pop()}`}
                title={album.title}
                className="w-full h-full"
                allowFullScreen
              ></iframe>
            ) : (
              <video src={album.videoUrl} controls className="w-full h-full object-cover"></video>
            )}
          </div>
        </div>
      )}

      {/* Facebook Photo Grid Layout */}
      {photos.length > 0 && (
        <div className="cursor-pointer border-t border-gray-100 dark:border-gray-800">
          {/* 1 Photo */}
          {photos.length === 1 && (
            <div
              onClick={() => onOpenPhoto(photos, 0)}
              className="relative max-h-96 overflow-hidden bg-gray-100 dark:bg-gray-900"
            >
              <img src={photos[0]} alt={album.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
            </div>
          )}

          {/* 2 Photos */}
          {photos.length === 2 && (
            <div className="grid grid-cols-2 gap-1 max-h-80 overflow-hidden bg-gray-100 dark:bg-gray-900">
              {photos.map((p, idx) => (
                <div key={idx} onClick={() => onOpenPhoto(photos, idx)} className="h-64 overflow-hidden">
                  <img src={p} alt={album.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                </div>
              ))}
            </div>
          )}

          {/* 3 Photos */}
          {photos.length === 3 && (
            <div className="grid grid-cols-2 gap-1 h-80 overflow-hidden bg-gray-100 dark:bg-gray-900">
              <div onClick={() => onOpenPhoto(photos, 0)} className="h-full overflow-hidden">
                <img src={photos[0]} alt={album.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
              </div>
              <div className="grid grid-rows-2 gap-1 h-full">
                <div onClick={() => onOpenPhoto(photos, 1)} className="h-full overflow-hidden">
                  <img src={photos[1]} alt={album.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                </div>
                <div onClick={() => onOpenPhoto(photos, 2)} className="h-full overflow-hidden">
                  <img src={photos[2]} alt={album.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                </div>
              </div>
            </div>
          )}

          {/* 4+ Photos */}
          {photos.length >= 4 && (
            <div className="grid grid-cols-2 gap-1 h-80 overflow-hidden bg-gray-100 dark:bg-gray-900">
              {photos.slice(0, 3).map((p, idx) => (
                <div key={idx} onClick={() => onOpenPhoto(photos, idx)} className="h-39 overflow-hidden">
                  <img src={p} alt={album.title} className="w-full h-full object-cover hover:scale-105 transition duration-300" />
                </div>
              ))}
              {/* 4th Photo with Overlay */}
              <div onClick={() => onOpenPhoto(photos, 3)} className="relative h-39 overflow-hidden">
                <img src={photos[3]} alt={album.title} className="w-full h-full object-cover" />
                {photos.length > 4 && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white font-bold text-xl backdrop-blur-[2px]">
                    +{photos.length - 3} আরও
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Card Footer Info */}
      <div className="p-3 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <ImageIcon className="h-3.5 w-3.5 text-bd-green-600" />
          {photos.length} টি ছবি
        </span>
        {album.videoUrl && (
          <span className="flex items-center gap-1 text-amber-600 font-medium">
            <Film className="h-3.5 w-3.5" /> ভিডিও যুক্ত
          </span>
        )}
      </div>
    </div>
  );
}
