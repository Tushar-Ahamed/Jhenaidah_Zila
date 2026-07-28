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
import { listNotices, createNotice, updateNotice, deleteNotice, type NoticeInput } from '@/services/contentService';
import { writeAuditLog } from '@/services/userService';
import type { Notice } from '@/types';
import { Pin, CalendarDays, Search, FileText, Plus, Pencil, Trash2, Save } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { formatBnDate, relativeBn } from '@/utils/format';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const variant: Record<string, 'red' | 'green' | 'amber' | 'blue'> = {
  'জরুরি': 'red', 'সাধারণ': 'green', 'অনুষ্ঠান': 'blue', 'নির্বাচন': 'amber',
};
const categories: Notice['category'][] = ['জরুরি', 'সাধারণ', 'অনুষ্ঠান', 'নির্বাচন'];

interface FormValues {
  title: string;
  body: string;
  category: Notice['category'];
  date: string;
  pinned: boolean;
}

export function DashboardNotices() {
  const { user } = useAuth();
  const isDistrict = canManageDistrictContent(user?.role);
  const isUpazila = canManageUpazilaContent(user?.role);
  const scope: 'district' | 'upazila' = isUpazila && !isDistrict ? 'upazila' : 'district';
  const upazila = isUpazila && !isDistrict ? user?.upazila : undefined;

  const [notices, setNotices] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');
  const debounced = useDebounce(query, 250);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const list = await listNotices(scope, upazila);
      setNotices(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = notices.filter((n) => n.title.includes(debounced) || n.body.includes(debounced));

  const openCreate = () => {
    setEditing(null);
    reset({ title: '', body: '', category: 'সাধারণ', date: new Date().toISOString().slice(0, 10), pinned: false });
    setModalOpen(true);
  };

  const openEdit = (n: Notice) => {
    setEditing(n);
    reset({ title: n.title, body: n.body, category: n.category, date: n.date.slice(0, 10), pinned: n.pinned ?? false });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    setSaving(true);
    try {
      const payload: NoticeInput = {
        title: data.title, body: data.body, category: data.category, date: data.date,
        pinned: data.pinned, scope, upazila, authorId: user!.uid,
      };
      if (editing) {
        await updateNotice(editing.id, payload);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'profile_update', targetId: editing.id, details: `নোটিশ সম্পাদনা: ${data.title}` });
        toast.success('নোটিশ হালনাগাদ সম্পন্ন');
      } else {
        await createNotice(payload);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'account_created', details: `নতুন নোটিশ: ${data.title}` });
        toast.success('নতুন নোটিশ যোগ হয়েছে');
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
      await deleteNotice(deleteId);
      await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'account_deleted', targetId: deleteId, details: 'নোটিশ মুছে ফেলা হয়েছে' });
      toast.success('নোটিশ মুছে ফেলা হয়েছে');
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">নোটিশ ব্যবস্থাপনা</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {scope === 'district' ? 'জেলা পর্যায়ের নোটিশ' : `${upazila ?? ''} উপজেলার নোটিশ`}
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> নতুন নোটিশ</button>
        </div>
      </FadeIn>

      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="নোটিশ খুঁজুন..." className="input pl-10" />
      </div>

      {loading ? (
        <div className="grid gap-4">{Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)}</div>
      ) : error ? (
        <ErrorState onRetry={load} />
      ) : filtered.length === 0 ? (
        <EmptyState icon={<FileText className="h-8 w-8" />} title="কোনো নোটিশ নেই" description="এখনো কোনো নোটিশ যোগ করা হয়নি।" action={<button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> নতুন নোটিশ</button>} />
      ) : (
        <StaggerGroup className="space-y-3">
          {filtered.map((n) => (
            <StaggerItem key={n.id}>
              <div className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="grid h-10 w-10 place-items-center rounded-xl bg-bd-green-50 text-bd-green-600 dark:bg-bd-green-900/30 dark:text-bd-green-300 shrink-0">
                  {n.pinned ? <Pin className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant={variant[n.category]}>{n.category}</Badge>
                    {n.pinned && <Badge variant="amber">পিন করা</Badge>}
                    {n.scope === 'upazila' && n.upazila && <Badge variant="gray">{n.upazila}</Badge>}
                  </div>
                  <h3 className="mt-1.5 font-semibold text-gray-900 dark:text-white">{n.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">{n.body}</p>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-xs text-gray-400 sm:text-right">
                    <p className="flex items-center gap-1.5 sm:justify-end"><CalendarDays className="h-3.5 w-3.5" /> {formatBnDate(n.date)}</p>
                    <p className="mt-0.5">{relativeBn(n.date)}</p>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => openEdit(n)} className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-bd-green-100 dark:hover:bg-bd-green-900/30 hover:text-bd-green-700 transition" title="সম্পাদনা"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => setDeleteId(n.id)} className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 dark:bg-gray-800 text-bd-red-600 hover:bg-bd-red-100 dark:hover:bg-bd-red-900/30 transition" title="মুছুন"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      )}

      {/* Create/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">শিরোনাম</label>
            <input className="input mt-1.5" {...register('title', { required: 'শিরোনাম আবশ্যক' })} />
            {errors.title && <p className="mt-1 text-xs text-bd-red-600">{errors.title.message}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">বিবরণ</label>
            <textarea rows={4} className="input mt-1.5 resize-none" {...register('body', { required: 'বিবরণ আবশ্যক' })} />
            {errors.body && <p className="mt-1 text-xs text-bd-red-600">{errors.body.message}</p>}
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
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-bd-green-600 focus:ring-bd-green-500" {...register('pinned')} />
            পিন করে রাখুন (শীর্ষে দেখাবে)
          </label>
          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1"><Save className="h-4 w-4" /> {saving ? 'সংরক্ষণ হচ্ছে...' : 'সংরক্ষণ'}</button>
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">বাতিল</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="নোটিশ মুছুন"
        message="আপনি কি এই নোটিশটি মুছে ফেলতে চান? এটি ফেরানো যাবে না।"
        confirmLabel="মুছে ফেলুন"
        loading={deleting}
      />
    </div>
  );
}
