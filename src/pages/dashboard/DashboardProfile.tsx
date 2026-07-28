import { useState, useRef } from 'react';
import { FadeIn } from '@/components/ui/FadeIn';
import { useAuth } from '@/context/AuthContext';
import { Badge } from '@/components/ui/Badge';
import { updateOwnProfile, writeAuditLog } from '@/services/userService';
import { uploadAvatar } from '@/services/uploadService';
import { ROLE_LABELS, STATUS_LABELS, UPAZILA_OPTIONS, type UpazilaName } from '@/types';
import { Mail, MapPin, Calendar, Shield, Save, User, Camera, Loader2, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useForm } from 'react-hook-form';

interface FormValues {
  name: string;
  upazila: UpazilaName;
  position: string;
}

export function DashboardProfile() {
  const { user, refreshUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    defaultValues: {
      name: user?.displayName ?? '',
      upazila: user?.upazila ?? 'ঝিনাইদহ সদর',
      position: user?.position ?? '',
    },
  });

  if (!user) return null;

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('ছবির সাইজ ২MB এর কম হতে হবে');
      return;
    }
    setUploading(true);
    try {
      const { url } = await uploadAvatar(file, user.uid);
      await updateOwnProfile(user.uid, { photoUrl: url });
      await writeAuditLog({ actorId: user.uid, actorEmail: user.email ?? '', actorRole: user.role, action: 'profile_update', details: 'প্রোফাইল ছবি আপলোড' });
      await refreshUser();
      toast.success('ছবি সফলভাবে আপলোড হয়েছে');
    } catch {
      toast.error('ছবি আপলোড ব্যর্থ হয়েছে');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleRemovePhoto = async () => {
    if (!user) return;
    setUploading(true);
    try {
      await updateOwnProfile(user.uid, { photoUrl: null });
      await writeAuditLog({ actorId: user.uid, actorEmail: user.email ?? '', actorRole: user.role, action: 'profile_update', details: 'প্রোফাইল ছবি মুছে ফেলা হয়েছে' });
      await refreshUser();
      toast.success('ছবি মুছে ফেলা হয়েছে');
    } catch {
      toast.error('ছবি মুছতে সমস্যা হয়েছে');
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (data: FormValues) => {
    try {
      await updateOwnProfile(user.uid, { name: data.name, upazila: data.upazila, position: data.position || null });
      await writeAuditLog({ actorId: user.uid, actorEmail: user.email ?? '', actorRole: user.role, action: 'profile_update', details: `প্রোফাইল হালনাগাদ: ${data.name}` });
      await refreshUser();
      toast.success('প্রোফাইল হালনাগাদ সম্পন্ন');
      setEditing(false);
    } catch {
      toast.error('হালনাগাদ ব্যর্থ হয়েছে');
    }
  };

  const avatar = user.photoURL;

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">আমার প্রোফাইল</h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">আপনার অ্যাকাউন্টের তথ্য</p>
          </div>
          {!editing && (
            <button onClick={() => setEditing(true)} className="btn-ghost"><User className="h-4 w-4" /> সম্পাদনা</button>
          )}
        </div>
      </FadeIn>

      <FadeIn delay={0.05}>
        <div className="card overflow-hidden">
          <div className="h-28 bg-bd-gradient relative">
            <div className="absolute inset-0 bg-bd-radial opacity-40" />
          </div>
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
              <div className="relative group">
                <div className="grid h-24 w-24 place-items-center rounded-3xl bg-white dark:bg-gray-900 shadow-glass border-4 border-white dark:border-gray-900 overflow-hidden">
                  {avatar ? (
                    <img src={avatar} alt={user.displayName ?? 'avatar'} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-3xl font-bold text-bd-green-700 dark:text-bd-green-300">
                      {user.displayName?.[0] ?? user.email?.[0] ?? 'U'}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                  className="absolute -bottom-1 -right-1 grid h-9 w-9 place-items-center rounded-full bg-bd-green-600 text-white shadow-lg hover:bg-bd-green-700 transition disabled:opacity-50"
                  title="ছবি আপলোড করুন"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </div>
              <div className="flex-1 sm:pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user.displayName ?? 'নামহীন সদস্য'}</h2>
                  <Badge variant={user.role === 'district_admin' ? 'red' : 'green'}><Shield className="h-3 w-3" /> {ROLE_LABELS[user.role]}</Badge>
                  <Badge variant="blue">{STATUS_LABELS[user.status]}</Badge>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                {avatar && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={uploading}
                    className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-gray-400 hover:text-bd-red-600 transition disabled:opacity-50"
                  >
                    <X className="h-3 w-3" /> ছবি মুছুন
                  </button>
                )}
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">নাম</label>
                  <input className="input mt-1.5" {...register('name', { required: 'নাম আবশ্যক' })} />
                  {errors.name && <p className="mt-1 text-xs text-bd-red-600">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">উপজেলা</label>
                  <select className="input mt-1.5" {...register('upazila')}>
                    {UPAZILA_OPTIONS.map((u) => <option key={u} value={u ?? ''}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">পদবি (ঐচ্ছিক)</label>
                  <input className="input mt-1.5" placeholder="যেমন: ছাত্র, সহকারী অধ্যাপক" {...register('position')} />
                </div>
                <div className="flex gap-3">
                  <button type="submit" className="btn-primary"><Save className="h-4 w-4" /> সংরক্ষণ</button>
                  <button type="button" onClick={() => setEditing(false)} className="btn-ghost">বাতিল</button>
                </div>
              </form>
            ) : (
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {[
                  { icon: Mail, label: 'ইমেইল', value: user.email ?? '—' },
                  { icon: MapPin, label: 'উপজেলা', value: user.upazila ?? '—' },
                  { icon: Shield, label: 'পদবি', value: user.position ?? '—' },
                  { icon: Calendar, label: 'ভূমিকা', value: ROLE_LABELS[user.role] },
                ].map((f) => (
                  <div key={f.label} className="rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-bd-green-50 text-bd-green-600 dark:bg-bd-green-900/30 dark:text-bd-green-300 shrink-0"><f.icon className="h-5 w-5" /></div>
                    <div className="min-w-0"><p className="text-xs text-gray-400">{f.label}</p><p className="text-sm font-medium text-gray-900 dark:text-white truncate">{f.value}</p></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </FadeIn>
    </div>
  );
}
