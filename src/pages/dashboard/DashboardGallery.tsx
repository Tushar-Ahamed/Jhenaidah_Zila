import { useEffect, useState } from 'react';
import { FadeIn, StaggerGroup, StaggerItem } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useAuth } from '@/context/AuthContext';
import { canManageDistrictContent, canManageUpazilaContent } from '@/utils/rbac';
import { listAlbums, createAlbum, deleteAlbum } from '@/services/albumService';
import { uploadImage } from '@/services/uploadService';
import { writeAuditLog } from '@/services/userService';
import { UPAZILA_OPTIONS, type MemoryAlbum, type UpazilaName } from '@/types';
import { Image as ImageIcon, Plus, Trash2, Save, Upload, X, Camera, Film, MapPin } from 'lucide-react';
import { formatBnDate } from '@/utils/format';
import toast from 'react-hot-toast';

const categories = ['অনুষ্ঠান', 'সমাজসেবা', 'শিক্ষা সফর', 'আলোচনা', 'সংস্কৃতি', 'ক্রীড়া', 'শিক্ষা'];

export function DashboardGallery() {
  const { user } = useAuth();
  const isDistrict = canManageDistrictContent(user?.role);
  const isUpazila = canManageUpazilaContent(user?.role);
  const defaultScope: 'district' | 'upazila' = isUpazila && !isDistrict ? 'upazila' : 'district';
  const defaultUpazila = user?.upazila || UPAZILA_OPTIONS[0];

  const [albums, setAlbums] = useState<MemoryAlbum[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('');
  const [category, setCategory] = useState('অনুষ্ঠান');
  const [photos, setPhotos] = useState<string[]>([]);
  const [photoInput, setPhotoInput] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [scope, setScope] = useState<'district' | 'upazila'>(defaultScope);
  const [upazila, setUpazila] = useState<UpazilaName>(defaultUpazila);

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const list = await listAlbums();
      setAlbums(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setTitle('');
    setDescription('');
    setDate(new Date().toISOString().slice(0, 10));
    setLocation('');
    setCategory('অনুষ্ঠান');
    setPhotos([]);
    setPhotoInput('');
    setVideoUrl('');
    setScope(defaultScope);
    setUpazila(defaultUpazila);
    setModalOpen(true);
  };

  const handleUploadFile = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadImage(file, `albums/${scope}`);
      setPhotos((prev) => [...prev, url]);
      toast.success('ছবি আপলোড সম্পন্ন');
    } catch {
      toast.error('ছবি আপলোড ব্যর্থ হয়েছে');
    } finally {
      setUploading(false);
    }
  };

  const handleAddPhotoInput = () => {
    if (!photoInput.trim()) return;
    setPhotos((prev) => [...prev, photoInput.trim()]);
    setPhotoInput('');
  };

  const handleRemovePhoto = (idx: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('শিরোনাম আবশ্যক');
      return;
    }
    if (photos.length === 0 && !videoUrl) {
      toast.error('কমপক্ষে ১টি ছবি বা ভিডিও প্রয়োজন');
      return;
    }

    setSubmitting(true);
    try {
      await createAlbum({
        title,
        description,
        date,
        location,
        photos,
        videoUrl: videoUrl || undefined,
        category,
        authorId: user?.uid,
        authorName: user?.displayName || 'কমিটি সদস্য',
        authorRole: isDistrict ? 'জেলা কমিটি / অ্যাডমিন' : 'উপজেলা কমিটি',
        scope,
        upazila: scope === 'upazila' ? upazila : undefined,
      });

      await writeAuditLog({
        actorId: user!.uid,
        actorEmail: user!.email ?? '',
        actorRole: user!.role,
        action: 'account_created',
        details: `নতুন স্মৃতি অ্যালবাম প্রকাশ: ${title}`,
      });

      toast.success('স্মৃতি অ্যালবাম সফলভাবে তৈরি হয়েছে');
      setModalOpen(false);
      await load();
    } catch {
      toast.error('অ্যালবাম তৈরিতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteAlbum(deleteId);
      await writeAuditLog({
        actorId: user!.uid,
        actorEmail: user!.email ?? '',
        actorRole: user!.role,
        action: 'account_deleted',
        targetId: deleteId,
        details: 'স্মৃতি অ্যালবাম মুছে ফেলা হয়েছে',
      });
      toast.success('অ্যালবাম মুছে ফেলা হয়েছে');
      setDeleteId(null);
      await load();
    } catch {
      toast.error('মুছতে সমস্যা হয়েছে');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Camera className="h-6 w-6 text-bd-green-600" />
              স্মৃতি অ্যালবাম ব্যবস্থাপনা
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ফেইসবুক-স্টাইল ফটো গ্যালারি ও ভিডিও অ্যালবাম তৈরি ও পরিচালনা করুন
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary">
            <Plus className="h-4 w-4" /> নতুন স্মৃতি অ্যালবাম প্রকাশ
          </button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : albums.length === 0 ? (
        <EmptyState
          icon={<ImageIcon className="h-8 w-8" />}
          title="কোনো স্মৃতি অ্যালবাম নেই"
          description="এখনো কোনো স্মৃতি অ্যালবাম তৈরি করা হয়নি।"
          action={<button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> নতুন অ্যালবাম</button>}
        />
      ) : (
        <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {albums.map((album) => (
            <StaggerItem key={album.id}>
              <div className="card p-4 flex flex-col justify-between h-full border-t-4 border-t-bd-green-600">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge variant="green">{album.category}</Badge>
                    <Badge variant={album.scope === 'district' ? 'blue' : 'gray'}>
                      {album.scope === 'district' ? 'জেলা' : album.upazila}
                    </Badge>
                  </div>

                  <h3 className="font-bold text-base text-gray-900 dark:text-white line-clamp-1">{album.title}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">{album.description}</p>

                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <span>{formatBnDate(album.date)}</span>
                    {album.location && (
                      <span className="flex items-center gap-1 text-bd-green-600">
                        <MapPin className="h-3 w-3" /> {album.location}
                      </span>
                    )}
                  </div>

                  {/* Thumbnail Previews */}
                  <div className="mt-3 flex items-center gap-1 overflow-hidden h-14 rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
                    {album.photos.slice(0, 4).map((p, idx) => (
                      <img key={idx} src={p} alt="thumb" className="h-full flex-1 object-cover rounded" />
                    ))}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                  <span className="text-gray-500">{album.photos.length} টি ছবি</span>
                  <button
                    onClick={() => setDeleteId(album.id)}
                    className="chip bg-bd-red-50 text-bd-red-600 hover:bg-bd-red-100 dark:bg-bd-red-900/30 dark:text-bd-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" /> মুছুন
                  </button>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {/* Create Memory Album Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="নতুন স্মৃতি অ্যালবাম প্রকাশ" size="lg">
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">অ্যালবাম শিরোনাম *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="যেমন: বার্ষিক রক্তদান শিবির ও মেধা সংবর্ধনা"
              className="input mt-1.5"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">বিবরণ / ক্যাপশন</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="অনুষ্ঠানের কিছু বিশেষ বর্ণনা..."
              rows={3}
              className="input mt-1.5 resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">তারিখ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="input mt-1.5"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">স্থান (Location Tag)</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="যেমন: টিটিসি মিলনায়তন"
                className="input mt-1.5"
              />
            </div>
          </div>

          {/* Photo Management */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ছবি সমুহ (Multi-Photos)</label>
            <div className="mt-1.5 flex flex-col gap-2">
              <div className="flex gap-2">
                <label className="btn-ghost border border-dashed border-gray-300 dark:border-gray-700 cursor-pointer text-xs shrink-0">
                  <Upload className="h-4 w-4" /> {uploading ? 'আপলোড...' : 'ফাইল আপলোড'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleUploadFile(f);
                    }}
                    disabled={uploading}
                  />
                </label>
                <input
                  value={photoInput}
                  onChange={(e) => setPhotoInput(e.target.value)}
                  placeholder="অথবা ছবি URL দিয়ে যোগ করুন"
                  className="input flex-1"
                />
                <button type="button" onClick={handleAddPhotoInput} className="btn-ghost text-xs">
                  + যোগ
                </button>
              </div>

              {photos.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200">
                      <img src={p} alt="uploaded" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => handleRemovePhoto(idx)}
                        className="absolute top-0.5 right-0.5 bg-black/70 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ভিডিও URL (ইউটিউব/MP4)</label>
            <input
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="input mt-1.5"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ক্যাটেগরি</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="input mt-1.5"
              >
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">পরিসর (Scope)</label>
              <select
                value={scope}
                onChange={(e) => setScope(e.target.value as 'district' | 'upazila')}
                className="input mt-1.5"
                disabled={!isDistrict}
              >
                {isDistrict && <option value="district">জেলা সমিতি</option>}
                <option value="upazila">উপজেলা শাখা</option>
              </select>
            </div>
          </div>

          {scope === 'upazila' && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">উপজেলা</label>
              <select
                value={upazila || ''}
                onChange={(e) => setUpazila(e.target.value as UpazilaName)}
                className="input mt-1.5"
              >
                {UPAZILA_OPTIONS.map((u) => <option key={u} value={u ?? ''}>{u}</option>)}
              </select>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={submitting || uploading} className="btn-primary flex-1">
              <Save className="h-4 w-4" /> {submitting ? 'প্রকাশ হচ্ছে...' : 'অ্যালবাম প্রকাশ করুন'}
            </button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">বাতিল</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="অ্যালবাম মুছুন"
        message="আপনি কি এই স্মৃতি অ্যালবামটি মুছে ফেলতে চান?"
        confirmLabel="মুছে ফেলুন"
        loading={deleting}
      />
    </div>
  );
}
