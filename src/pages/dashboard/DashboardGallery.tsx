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
import { listGallery, createGalleryItem, updateGalleryItem, deleteGalleryItem, type GalleryInput } from '@/services/contentService';
import { uploadImage } from '@/services/uploadService';
import { writeAuditLog } from '@/services/userService';
import type { GalleryItem } from '@/types';
import { Image as ImageIcon, Plus, Pencil, Trash2, Save, Upload, X } from 'lucide-react';
import { formatBnDate } from '@/utils/format';
import { AnimatePresence, motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const categories = ['অনুষ্ঠান', 'সমাজসেবা', 'শিক্ষা সফর', 'আলোচনা', 'সংস্কৃতি', 'ক্রীড়া', 'শিক্ষা'];

interface FormValues {
  title: string;
  url: string;
  category: string;
  date: string;
}

export function DashboardGallery() {
  const { user } = useAuth();
  const isDistrict = canManageDistrictContent(user?.role);
  const isUpazila = canManageUpazilaContent(user?.role);
  const scope: 'district' | 'upazila' = isUpazila && !isDistrict ? 'upazila' : 'district';
  const upazila = isUpazila && !isDistrict ? user?.upazila : undefined;

  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [lightbox, setLightbox] = useState<string | null>(null);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>();
  const url = watch('url');

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const list = await listGallery(scope, upazila);
      setItems(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', url: '', category: 'অনুষ্ঠান', date: new Date().toISOString().slice(0, 10) });
    setModalOpen(true);
  };

  const openEdit = (g: GalleryItem) => {
    setEditing(g);
    reset({ title: g.title, url: g.url, category: g.category, date: g.date.slice(0, 10) });
    setModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadImage(file, `gallery/${scope}`);
      setValue('url', url);
      toast.success('ছবি আপলোড সম্পন্ন');
    } catch {
      toast.error('আপলোড ব্যর্থ হয়েছে');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const payload: GalleryInput = {
        title: data.title, url: data.url, category: data.category, date: data.date,
        scope, upazila, authorId: user!.uid,
      };
      if (editing) {
        await updateGalleryItem(editing.id, payload);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'profile_update', targetId: editing.id, details: `গ্যালারি সম্পাদনা: ${data.title}` });
        toast.success('গ্যালারি হালনাগাদ সম্পন্ন');
      } else {
        await createGalleryItem(payload);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'account_created', details: `নতুন গ্যালারি: ${data.title}` });
        toast.success('নতুন ছবি যোগ হয়েছে');
      }
      setModalOpen(false);
      await load();
    } catch {
      toast.error('কাজটি সম্পন্ন করা যায়নি');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await deleteGalleryItem(deleteId);
      await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'account_deleted', targetId: deleteId, details: 'গ্যালারি ছবি মুছে ফেলা হয়েছে' });
      toast.success('ছবি মুছে ফেলা হয়েছে');
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">গ্যালারি ব্যবস্থাপনা</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {scope === 'district' ? 'জেলা পর্যায়ের গ্যালারি' : `${upazila ?? ''} উপজেলার গ্যালারি`}
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> ছবি যোগ করুন</button>
        </div>
      </FadeIn>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : items.length === 0 ? (
        <EmptyState icon={<ImageIcon className="h-8 w-8" />} title="কোনো ছবি নেই" description="এখনো কোনো ছবি যোগ করা হয়নি।" action={<button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> ছবি যোগ করুন</button>} />
      ) : (
        <StaggerGroup className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((g) => (
            <StaggerItem key={g.id}>
              <div className="card overflow-hidden group">
                <button onClick={() => setLightbox(g.url)} className="relative block w-full aspect-[4/3] overflow-hidden">
                  <img src={g.url} alt={g.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center gap-2">
                    <div className="opacity-0 group-hover:opacity-100 transition flex gap-1">
                      <button onClick={(e) => { e.stopPropagation(); openEdit(g); }} className="grid h-8 w-8 place-items-center rounded-lg bg-white/90 text-gray-700 hover:bg-white"><Pencil className="h-4 w-4" /></button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(g.id); }} className="grid h-8 w-8 place-items-center rounded-lg bg-bd-red-600 text-white hover:bg-bd-red-700"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                </button>
                <div className="p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-white line-clamp-1">{g.title}</p>
                    <Badge variant="green">{g.category}</Badge>
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{formatBnDate(g.date)}</p>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'ছবি সম্পাদনা' : 'নতুন ছবি'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ছবি</label>
            <div className="mt-1.5 flex flex-col sm:flex-row gap-4">
              <div className="h-28 w-full sm:w-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 grid place-items-center">
                {url ? <img src={url} alt="preview" className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-400" />}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="btn-ghost border border-dashed border-gray-300 dark:border-gray-700 cursor-pointer w-fit">
                  <Upload className="h-4 w-4" /> {uploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} disabled={uploading} />
                </label>
                <input className="input" placeholder="অথবা ছবি URL দিন" {...register('url', { required: 'ছবি আবশ্যক' })} />
                {errors.url && <p className="text-xs text-bd-red-600">{errors.url.message}</p>}
              </div>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">শিরোনাম</label>
            <input className="input mt-1.5" {...register('title', { required: 'শিরোনাম আবশ্যক' })} />
            {errors.title && <p className="mt-1 text-xs text-bd-red-600">{errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ক্যাটেগরি</label>
              <select className="input mt-1.5" {...register('category')}>{categories.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">তারিখ</label>
              <input type="date" className="input mt-1.5" {...register('date', { required: 'তারিখ আবশ্যক' })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || uploading} className="btn-primary flex-1"><Save className="h-4 w-4" /> {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">বাতিল</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="ছবি মুছুন" message="আপনি কি এই ছবিটি মুছে ফেলতে চান?" confirmLabel="মুছে ফেলুন" loading={deleting} />

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setLightbox(null)} className="fixed inset-0 z-[100] grid place-items-center bg-black/80 backdrop-blur p-4">
            <button className="absolute top-4 right-4 grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white hover:bg-white/20" onClick={() => setLightbox(null)}><X className="h-5 w-5" /></button>
            <motion.img initial={{ scale: 0.9 }} animate={{ scale: 1 }} src={lightbox} alt="preview" className="max-h-[85vh] max-w-[90vw] rounded-2xl shadow-2xl" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
