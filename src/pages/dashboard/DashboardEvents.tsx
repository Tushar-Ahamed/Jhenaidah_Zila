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
import { listEvents, createEvent, updateEvent, deleteEvent, type EventInput } from '@/services/contentService';
import { uploadImage } from '@/services/uploadService';
import { writeAuditLog } from '@/services/userService';
import type { OrgEvent } from '@/types';
import { CalendarDays, MapPin, Plus, Pencil, Trash2, Save, Upload, Clock, ImageIcon } from 'lucide-react';
import { formatBnDate, isUpcoming, classNames } from '@/utils/format';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const tabs = [
  { key: 'upcoming', label: 'আসন্ন' },
  { key: 'past', label: 'অতীত' },
  { key: 'all', label: 'সব' },
] as const;

interface FormValues {
  title: string;
  description: string;
  date: string;
  location: string;
  coverImage: string;
}

export function DashboardEvents() {
  const { user } = useAuth();
  const isDistrict = canManageDistrictContent(user?.role);
  const isUpazila = canManageUpazilaContent(user?.role);
  const scope: 'district' | 'upazila' = isUpazila && !isDistrict ? 'upazila' : 'district';
  const upazila = isUpazila && !isDistrict ? user?.upazila : undefined;

  const [tab, setTab] = useState<'upcoming' | 'past' | 'all'>('upcoming');
  const [events, setEvents] = useState<OrgEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<OrgEvent | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, watch, setValue, formState: { errors } } = useForm<FormValues>();
  const coverImage = watch('coverImage');

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const list = await listEvents(scope, upazila);
      setEvents(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = events.filter((e) => {
    if (tab === 'upcoming') return isUpcoming(e.date);
    if (tab === 'past') return !isUpcoming(e.date);
    return true;
  });

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', description: '', date: new Date().toISOString().slice(0, 10), location: '', coverImage: '' });
    setModalOpen(true);
  };

  const openEdit = (e: OrgEvent) => {
    setEditing(e);
    reset({ title: e.title, description: e.description, date: e.date.slice(0, 10), location: e.location, coverImage: e.coverImage ?? '' });
    setModalOpen(true);
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const { url } = await uploadImage(file, `events/${scope}`);
      setValue('coverImage', url);
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
      const payload: EventInput = {
        title: data.title, description: data.description, date: data.date, location: data.location,
        coverImage: data.coverImage || undefined, status: isUpcoming(data.date) ? 'upcoming' : 'past',
        scope, upazila, authorId: user!.uid,
      };
      if (editing) {
        await updateEvent(editing.id, payload);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'profile_update', targetId: editing.id, details: `আয়োজন সম্পাদনা: ${data.title}` });
        toast.success('আয়োজন হালনাগাদ সম্পন্ন');
      } else {
        await createEvent(payload);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'account_created', details: `নতুন আয়োজন: ${data.title}` });
        toast.success('নতুন আয়োজন যোগ হয়েছে');
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
      await deleteEvent(deleteId);
      await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'account_deleted', targetId: deleteId, details: 'আয়োজন মুছে ফেলা হয়েছে' });
      toast.success('আয়োজন মুছে ফেলা হয়েছে');
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">আয়োজন ব্যবস্থাপনা</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {scope === 'district' ? 'জেলা পর্যায়ের আয়োজন' : `${upazila ?? ''} উপজেলার আয়োজন`}
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> নতুন আয়োজন</button>
        </div>
      </FadeIn>

      <div className="inline-flex rounded-xl bg-gray-100 dark:bg-gray-800 p-1">
        {tabs.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={classNames('px-4 py-2 rounded-lg text-sm font-medium transition', tab === t.key ? 'bg-white dark:bg-gray-900 text-bd-green-700 dark:text-bd-green-300 shadow-soft' : 'text-gray-500 dark:text-gray-400')}>{t.label}</button>
        ))}
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<CalendarDays className="h-8 w-8" />} title="কোনো আয়োজন নেই" description="এই তালিকায় বর্তমানে কোনো আয়োজন নেই।" action={<button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> নতুন আয়োজন</button>} />
      ) : (
        <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((e) => (
            <StaggerItem key={e.id}>
              <div className="card overflow-hidden h-full flex flex-col group">
                <div className="relative h-36 overflow-hidden">
                  {e.coverImage ? (
                    <img src={e.coverImage} alt={e.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-full w-full bg-bd-gradient grid place-items-center text-white/60"><ImageIcon className="h-10 w-10" /></div>
                  )}
                  <div className="absolute top-3 left-3"><Badge variant={isUpcoming(e.date) ? 'green' : 'gray'}>{isUpcoming(e.date) ? 'আসন্ন' : 'অতীত'}</Badge></div>
                  {e.scope === 'upazila' && e.upazila && <div className="absolute top-3 right-3"><Badge variant="blue">{e.upazila}</Badge></div>}
                  <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/60 to-transparent flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                    <button onClick={() => openEdit(e)} className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 backdrop-blur text-white hover:bg-white/30"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteId(e.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-bd-red-600/80 backdrop-blur text-white hover:bg-bd-red-600"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{e.title}</h3>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">{e.description}</p>
                  <div className="mt-3 space-y-1.5 text-xs text-gray-400">
                    <p className="flex items-center gap-1.5"><CalendarDays className="h-3.5 w-3.5 text-bd-green-600" /> {formatBnDate(e.date)}</p>
                    <p className="flex items-center gap-1.5"><Clock className="h-3.5 w-3.5 text-bd-green-600" /> {isUpcoming(e.date) ? 'শীঘ্রই' : 'সম্পন্ন'}</p>
                    <p className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5 text-bd-green-600" /> {e.location}</p>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'আয়োজন সম্পাদনা' : 'নতুন আয়োজন'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Cover image upload */}
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">প্রচ্ছদ ছবি</label>
            <div className="mt-1.5 flex flex-col sm:flex-row gap-4">
              <div className="h-28 w-full sm:w-40 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-800 shrink-0 grid place-items-center">
                {coverImage ? <img src={coverImage} alt="cover" className="h-full w-full object-cover" /> : <ImageIcon className="h-8 w-8 text-gray-400" />}
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <label className="btn-ghost border border-dashed border-gray-300 dark:border-gray-700 cursor-pointer w-fit">
                  <Upload className="h-4 w-4" /> {uploading ? 'আপলোড হচ্ছে...' : 'ছবি আপলোড করুন'}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} disabled={uploading} />
                </label>
                <input className="input" placeholder="অথবা ছবি URL দিন" {...register('coverImage')} />
                <p className="text-xs text-gray-400">Firebase Storage-এ আপলোড হবে। ডেমোতে লোকাল প্রিভিউ দেখাবে।</p>
              </div>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">শিরোনাম</label>
            <input className="input mt-1.5" {...register('title', { required: 'শিরোনাম আবশ্যক' })} />
            {errors.title && <p className="mt-1 text-xs text-bd-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">বিবরণ</label>
            <textarea rows={3} className="input mt-1.5 resize-none" {...register('description', { required: 'বিবরণ আবশ্যক' })} />
            {errors.description && <p className="mt-1 text-xs text-bd-red-600">{errors.description.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">তারিখ</label>
              <input type="date" className="input mt-1.5" {...register('date', { required: 'তারিখ আবশ্যক' })} />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">স্থান</label>
              <input className="input mt-1.5" {...register('location', { required: 'স্থান আবশ্যক' })} />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving || uploading} className="btn-primary flex-1"><Save className="h-4 w-4" /> {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">বাতিল</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={confirmDelete} title="আয়োজন মুছুন" message="আপনি কি এই আয়োজনটি মুছে ফেলতে চান?" confirmLabel="মুছে ফেলুন" loading={deleting} />
    </div>
  );
}
