import { useState, useEffect } from 'react';
import { SEO } from '@/components/SEO';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { listAlbums, createAlbum } from '@/services/albumService';
import { FacebookAlbumCard } from '@/components/gallery/FacebookAlbumCard';
import { LightboxModal } from '@/components/gallery/LightboxModal';
import { useAuth } from '@/context/AuthContext';
import { isCommittee } from '@/utils/rbac';
import { UPAZILA_OPTIONS, type MemoryAlbum, type UpazilaName } from '@/types';
import { Image as ImageIcon, Plus, X, Film, MapPin, Calendar, Camera } from 'lucide-react';
import toast from 'react-hot-toast';

export function GalleryPage() {
  const { user } = useAuth();
  const isCommitteeMember = isCommittee(user?.role);

  const [albums, setAlbums] = useState<MemoryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [scope, setScope] = useState<'all' | 'district' | 'upazila'>('all');
  const [selectedUpazila, setSelectedUpazila] = useState<UpazilaName>('ঝিনাইদহ সদর');

  // Lightbox State
  const [lightboxPhotos, setLightboxPhotos] = useState<string[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState<number>(-1);

  // Create Album Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newDate, setNewDate] = useState(new Date().toISOString().split('T')[0]);
  const [newLocation, setNewLocation] = useState('');
  const [newCategory, setNewCategory] = useState('অনুষ্ঠান');
  const [newPhotoUrlInput, setNewPhotoUrlInput] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newScope, setNewScope] = useState<'district' | 'upazila'>('district');
  const [newUpazila, setNewUpazila] = useState<UpazilaName>('ঝিনাইদহ সদর');
  const [submitting, setSubmitting] = useState(false);

  const loadAlbums = async () => {
    setLoading(true);
    try {
      const records = await listAlbums(
        scope === 'all' ? undefined : scope,
        scope === 'upazila' ? selectedUpazila : undefined
      );
      setAlbums(records);
    } catch {
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAlbums();
  }, [scope, selectedUpazila]);

  const handleOpenLightbox = (photos: string[], initialIndex: number) => {
    setLightboxPhotos(photos);
    setLightboxIndex(initialIndex);
  };

  const handleAddPhotoUrl = () => {
    if (!newPhotoUrlInput.trim()) return;
    setPhotoUrls((prev) => [...prev, newPhotoUrlInput.trim()]);
    setNewPhotoUrlInput('');
  };

  const handleRemovePhotoUrl = (idx: number) => {
    setPhotoUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleCreateAlbum = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      toast.error('অ্যালবামের শিরোনাম প্রয়োজন');
      return;
    }
    if (photoUrls.length === 0 && !newVideoUrl) {
      toast.error('কমপক্ষে ১টি ছবি বা ভিডিও যোগ করুন');
      return;
    }

    setSubmitting(true);
    try {
      await createAlbum({
        title: newTitle,
        description: newDescription,
        date: newDate,
        location: newLocation,
        photos: photoUrls,
        videoUrl: newVideoUrl || undefined,
        category: newCategory,
        authorId: user?.uid,
        authorName: user?.displayName || 'কমিটি সদস্য',
        authorRole: 'কমিটি সদস্য',
        scope: newScope,
        upazila: newScope === 'upazila' ? newUpazila : undefined,
      });

      toast.success('স্মৃতি অ্যালবাম সফলভাবে তৈরি হয়েছে');
      setShowCreateModal(false);
      // Reset form
      setNewTitle('');
      setNewDescription('');
      setNewLocation('');
      setPhotoUrls([]);
      setNewVideoUrl('');
      await loadAlbums();
    } catch {
      toast.error('অ্যালবাম তৈরিতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <SEO title="স্মৃতি অ্যালবাম ও ফটো গ্যালারি" description="ঝিনাইদহ জেলা সমিতির বিভিন্ন অনুষ্ঠান, শিক্ষা সফর ও আয়োজনের ফেইসবুক-স্টাইল ফটো ও ভিডিও অ্যালবাম।" />

      <FadeIn>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 dark:border-gray-800 pb-6">
          <div>
            <span className="chip bg-bd-green-100 text-bd-green-700 dark:bg-bd-green-900/40 dark:text-bd-green-300">
              স্মৃতি অ্যালবাম ও গ্যালারি
            </span>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-3 flex items-center gap-2">
              <Camera className="h-7 w-7 text-bd-green-600" />
              স্মৃতি অ্যালবাম (Memory Albums)
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 max-w-2xl">
              সমিতির বিভিন্ন আনন্দময় মুহূর্ত, পিকনিক, রক্তদান শিবির ও অনুষ্ঠানের স্মৃতিময় ছবি ও ভিডিও অ্যালবাম।
            </p>
          </div>

          {/* Committee Member Create Album Action */}
          {isCommitteeMember && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="btn-primary flex items-center gap-2"
            >
              <Plus className="h-4 w-4" /> নতুন স্মৃতি অ্যালবাম প্রকাশ করুন
            </button>
          )}
        </div>
      </FadeIn>

      {/* Scope Filter Bar */}
      <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
            <button
              onClick={() => setScope('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                scope === 'all' ? 'bg-bd-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              সকল অ্যালবাম
            </button>
            <button
              onClick={() => setScope('district')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                scope === 'district' ? 'bg-bd-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              জেলা কমিটি অ্যালবাম
            </button>
            <button
              onClick={() => setScope('upazila')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
                scope === 'upazila' ? 'bg-bd-green-600 text-white shadow-sm' : 'text-gray-600 dark:text-gray-300'
              }`}
            >
              উপজেলা অ্যালবাম
            </button>
          </div>

          {scope === 'upazila' && (
            <select
              value={selectedUpazila || ''}
              onChange={(e) => setSelectedUpazila(e.target.value as UpazilaName)}
              className="input !py-1.5 !px-3 !text-xs !w-auto"
            >
              {UPAZILA_OPTIONS.map((u) => (
                <option key={u} value={u ?? ''}>{u}</option>
              ))}
            </select>
          )}
        </div>

        <p className="text-xs text-gray-400">মোট {albums.length} টি অ্যালবাম</p>
      </div>

      {/* Facebook-Style Album Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-gray-400">লোডিং হচ্ছে...</div>
      ) : albums.length === 0 ? (
        <div className="card p-12 text-center text-gray-400 space-y-2">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-300" />
          <p className="font-semibold text-base">কোনো স্মৃতি অ্যালবাম পাওয়া যায়নি</p>
        </div>
      ) : (
        <StaggerGroup className="grid gap-6 md:grid-cols-2">
          {albums.map((album) => (
            <StaggerItem key={album.id}>
              <FacebookAlbumCard album={album} onOpenPhoto={handleOpenLightbox} />
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex >= 0 && (
        <LightboxModal
          photos={lightboxPhotos}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(-1)}
          onNavigate={(idx) => setLightboxIndex(idx)}
        />
      )}

      {/* Create Memory Album Modal for Committee Members */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="card max-w-xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Camera className="h-5 w-5 text-bd-green-600" />
                নতুন স্মৃতি অ্যালবাম তৈরি করুন
              </h2>
              <button onClick={() => setShowCreateModal(false)} className="p-1 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAlbum} className="p-5 overflow-y-auto space-y-4 flex-1">
              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">অ্যালবাম শিরোনাম *</label>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="যেমন: বার্ষিক সাংস্কৃতিক অনুষ্ঠান ২০২৫"
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">বিবরণ / ক্যাপশন</label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="অনুষ্ঠানের কিছু বর্ণনা..."
                  className="input min-h-[80px]"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">তারিখ</label>
                  <input
                    type="date"
                    value={newDate}
                    onChange={(e) => setNewDate(e.target.value)}
                    className="input"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">স্থান (Location Tag)</label>
                  <input
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    placeholder="যেমন: টিটিসি মিলনায়তন"
                    className="input"
                  />
                </div>
              </div>

              {/* Photos URL Input List */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block">ছবি যোগ করুন (Image URL)</label>
                <div className="flex gap-2">
                  <input
                    value={newPhotoUrlInput}
                    onChange={(e) => setNewPhotoUrlInput(e.target.value)}
                    placeholder="https://images.pexels.com/..."
                    className="input flex-1"
                  />
                  <button type="button" onClick={handleAddPhotoUrl} className="btn-ghost text-xs">
                    + যোগ
                  </button>
                </div>

                {photoUrls.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-2">
                    {photoUrls.map((url, idx) => (
                      <div key={idx} className="relative group w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                        <img src={url} alt="Uploaded preview" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => handleRemovePhotoUrl(idx)}
                          className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">ভিডিও লিংক (ইউটিউব/MP4)</label>
                <input
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="input"
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">কমিটি স্কোপ</label>
                  <select
                    value={newScope}
                    onChange={(e) => setNewScope(e.target.value as 'district' | 'upazila')}
                    className="input"
                  >
                    <option value="district">জেলা সমিতি</option>
                    <option value="upazila">উপজেলা শাখা</option>
                  </select>
                </div>
                {newScope === 'upazila' && (
                  <div>
                    <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">উপজেলা</label>
                    <select
                      value={newUpazila || ''}
                      onChange={(e) => setNewUpazila(e.target.value as UpazilaName)}
                      className="input"
                    >
                      {UPAZILA_OPTIONS.map((u) => (
                        <option key={u} value={u ?? ''}>{u}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100 dark:border-gray-800 flex justify-end gap-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="btn-ghost text-xs">
                  বাতিল
                </button>
                <button type="submit" disabled={submitting} className="btn-primary text-xs">
                  {submitting ? 'প্রকাশ হচ্ছে...' : 'অ্যালবাম প্রকাশ করুন'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
