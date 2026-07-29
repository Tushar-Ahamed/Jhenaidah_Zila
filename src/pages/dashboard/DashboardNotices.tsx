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
import { UPAZILA_OPTIONS, type Notice, type NoticeCategory, type UpazilaName } from '@/types';
import { Pin, CalendarDays, Search, FileText, Plus, Pencil, Trash2, Save, ShieldCheck } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { formatBnDate, relativeBn } from '@/utils/format';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

const variant: Record<string, 'red' | 'green' | 'amber' | 'blue'> = {
  'জরুরি': 'red',
  'সাধারণ': 'green',
  'অনুষ্ঠান': 'blue',
  'নির্বাচন': 'amber',
  'পরীক্ষা/ভর্তি': 'blue',
  'বৃত্তি': 'green',
};

const categories: NoticeCategory[] = ['জরুরি', 'সাধারণ', 'অনুষ্ঠান', 'নির্বাচন', 'পরীক্ষা/ভর্তি', 'বৃত্তি'];

interface FormValues {
  title: string;
  body: string;
  category: NoticeCategory;
  date: string;
  pinned: boolean;
  scope: 'district' | 'upazila';
  upazila?: UpazilaName;
}

export function DashboardNotices() {
  const { user } = useAuth();
  const canPublishDistrict = canManageDistrictContent(user?.role);
  const canPublishUpazila = canManageUpazilaContent(user?.role);

  const defaultScope: 'district' | 'upazila' = canPublishDistrict ? 'district' : 'upazila';
  const defaultUpazila = user?.upazila || UPAZILA_OPTIONS[0];

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

  const { register, handleSubmit, watch, reset, setValue, formState: { errors } } = useForm<FormValues>();
  const watchScope = watch('scope');

  const load = async () => {
    setLoading(true);
    setError(false);
    try {
      const list = await listNotices();
      setNotices(list);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = notices.filter((n) => {
    const q = debounced.trim().toLowerCase();
    if (!q) return true;
    return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q);
  });

  const openCreate = () => {
    setEditing(null);
    reset({
      title: '',
      body: '',
      category: 'সাধারণ',
      date: new Date().toISOString().slice(0, 10),
      pinned: false,
      scope: defaultScope,
      upazila: defaultUpazila,
    });
    setModalOpen(true);
  };

  const openEdit = (n: Notice) => {
    setEditing(n);
    reset({
      title: n.title,
      body: n.body,
      category: n.category,
      date: n.date.slice(0, 10),
      pinned: n.pinned ?? false,
      scope: n.scope || defaultScope,
      upazila: n.upazila || defaultUpazila,
    });
    setModalOpen(true);
  };

  const onSubmit = async (data: FormValues) => {
    // Check permission scoping
    if (data.scope === 'district' && !canPublishDistrict) {
      toast.error('জেলা নোটিশ প্রকাশের অনুমতি আপনার নেই।');
      return;
    }

    setSaving(true);
    try {
      const payload: NoticeInput = {
        title: data.title,
        body: data.body,
        category: data.category,
        date: data.date,
        pinned: data.pinned,
        scope: data.scope,
        upazila: data.scope === 'upazila' ? data.upazila : undefined,
        authorId: user!.uid,
      };

      if (editing) {
        await updateNotice(editing.id, payload);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'profile_update', targetId: editing.id, details: `নোটিশ সম্পাদনা: ${data.title}` });
        toast.success('নোটিশ হালনাগাদ সম্পন্ন');
      } else {
        await createNotice(payload);
        await writeAuditLog({ actorId: user!.uid, actorEmail: user!.email ?? '', actorRole: user!.role, action: 'account_created', details: `নতুন নোটিশ: ${data.title}` });
        toast.success('নতুন নোটিশ সফলভাবে প্রকাশ করা হয়েছে');
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">নোটিশ প্রকাশ ও ব্যবস্থাপনা</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {canPublishDistrict
                ? 'জেলা অ্যাডমিন ও জেলা কমিটি সদস্য হিসেবে আপনি জেলা ও উপজেলা নোটিশ প্রকাশ করতে পারেন।'
                : 'উপজেলা কমিটি সদস্য হিসেবে আপনি নিজ উপজেলার জন্য নোটিশ প্রকাশ করতে পারেন।'}
            </p>
          </div>
          <button onClick={openCreate} className="btn-primary"><Plus className="h-4 w-4" /> নতুন নোটিশ প্রকাশ</button>
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
                    <Badge variant={variant[n.category] || 'green'}>{n.category}</Badge>
                    {n.pinned && <Badge variant="amber">পিন করা</Badge>}
                    <Badge variant={n.scope === 'district' ? 'blue' : 'gray'}>
                      {n.scope === 'district' ? 'জেলা নোটিশ' : `${n.upazila} নোটিশ`}
                    </Badge>
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
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'নোটিশ সম্পাদনা' : 'নতুন নোটিশ প্রকাশ'} size="md">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">নোটিশ প্রকাশ পরিসর (Scope)</label>
            <select
              className="input mt-1.5"
              {...register('scope')}
              disabled={!canPublishDistrict}
            >
              {canPublishDistrict && <option value="district">জেলা নোটিশ (District Notice)</option>}
              <option value="upazila">উপজেলা নোটিশ (Upazila Notice)</option>
            </select>
          </div>

          {watchScope === 'upazila' && (
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">উপজেলা নির্বাচন করুন</label>
              <select className="input mt-1.5" {...register('upazila')}>
                {UPAZILA_OPTIONS.map((u) => (
                  <option key={u} value={u ?? ''}>{u}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">শিরোনাম</label>
            <input className="input mt-1.5" placeholder="নোটিশের বিষয়বস্তু..." {...register('title', { required: 'শিরোনাম আবশ্যক' })} />
            {errors.title && <p className="mt-1 text-xs text-bd-red-600">{errors.title.message}</p>}
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">বিস্তারিত বিবরণ</label>
            <textarea rows={4} className="input mt-1.5 resize-none" placeholder="নোটিশের বিস্তারিত বার্তা..." {...register('body', { required: 'বিবরণ আবশ্যক' })} />
            {errors.body && <p className="mt-1 text-xs text-bd-red-600">{errors.body.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ক্যাটেগরি</label>
              <select className="input mt-1.5" {...register('category')}>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">তারিখ</label>
              <input type="date" className="input mt-1.5" {...register('date', { required: 'তারিখ আবশ্যক' })} />
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
            <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-bd-green-600 focus:ring-bd-green-500" {...register('pinned')} />
            পিন করে রাখুন (Homepage-এ বিশেষ পিন করা বক্স ও স্ক্রোলিং টিকারে দেখাবে)
          </label>

          <div className="flex gap-3 pt-2">
            <button type="submit" disabled={saving} className="btn-primary flex-1"><Save className="h-4 w-4" /> {saving ? 'সংরক্ষণ হচ্ছে...' : 'নোটিশ প্রকাশ করুন'}</button>
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
