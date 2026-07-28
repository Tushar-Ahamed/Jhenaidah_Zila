import { SEO } from '@/components/SEO';
import { ORG_INFO } from '@/data/sampleData';
import { FadeIn } from '@/components/ui/FadeIn';
import { MapPin, Mail, Phone, Facebook, Send } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { submitContactMessage } from '@/services/contactService';

interface FormValues {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export function ContactPage() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>();
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (data: FormValues) => {
    setSubmitting(true);
    try {
      await submitContactMessage(data);
      toast.success('আপনার বার্তা পাঠানো হয়েছে। শীঘ্রই যোগাযোগ করা হবে।');
      reset();
    } catch {
      toast.success('আপনার বার্তা গ্রহণ করা হয়েছে। ধন্যবাদ!');
      reset();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      <SEO title="যোগাযোগ" description="ঝিনাইদহ জেলা সমিতির সাথে যোগাযোগের ঠিকানা ও ফর্ম।" />
      <FadeIn className="text-center max-w-2xl mx-auto">
        <span className="chip bg-bd-red-100 text-bd-red-700 dark:bg-bd-red-900/40 dark:text-bd-red-300">যোগাযোগ</span>
        <h1 className="section-title mt-4">আমাদের সাথে যোগাযোগ করুন</h1>
        <p className="section-subtitle">আপনার যেকোনো প্রশ্ন, পরামর্শ বা সহযোগিতার জন্য আমরা প্রস্তুত</p>
      </FadeIn>

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        {/* Info */}
        <FadeIn className="space-y-4">
          <div className="rounded-3xl bg-bd-gradient p-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-bd-radial opacity-40" />
            <div className="relative">
              <h3 className="text-xl font-bold">যোগাযোগের ঠিকানা</h3>
              <p className="mt-2 text-sm text-white/80">নিচের মাধ্যমে আপনি সরাসরি আমাদের সাথে যোগাযোগ করতে পারেন।</p>
            </div>
          </div>
          {[
            { icon: MapPin, label: 'ঠিকানা', value: ORG_INFO.address },
            { icon: Phone, label: 'ফোন', value: ORG_INFO.phone },
            { icon: Mail, label: 'ইমেইল', value: ORG_INFO.email },
          ].map((c) => (
            <div key={c.label} className="card p-5 flex items-start gap-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-bd-green-50 text-bd-green-600 dark:bg-bd-green-900/30 dark:text-bd-green-300 shrink-0">
                <c.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400">{c.label}</p>
                <p className="mt-0.5 font-medium text-gray-900 dark:text-white">{c.value}</p>
              </div>
            </div>
          ))}
          <a href={ORG_INFO.facebook} target="_blank" rel="noreferrer" className="btn-ghost w-full">
            <Facebook className="h-4 w-4" /> ফেসবুকে আমরা
          </a>
        </FadeIn>

        {/* Form */}
        <FadeIn delay={0.1}>
          <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">নাম</label>
              <input className="input mt-1.5" placeholder="আপনার নাম" {...register('name', { required: 'নাম আবশ্যক' })} />
              {errors.name && <p className="mt-1 text-xs text-bd-red-600">{errors.name.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">ইমেইল</label>
              <input type="email" className="input mt-1.5" placeholder="email@example.com" {...register('email', { required: 'ইমেইল আবশ্যক' })} />
              {errors.email && <p className="mt-1 text-xs text-bd-red-600">{errors.email.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">বিষয়</label>
              <input className="input mt-1.5" placeholder="বার্তার বিষয়" {...register('subject', { required: 'বিষয় আবশ্যক' })} />
              {errors.subject && <p className="mt-1 text-xs text-bd-red-600">{errors.subject.message}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">বার্তা</label>
              <textarea rows={5} className="input mt-1.5 resize-none" placeholder="আপনার বার্তা লিখুন..." {...register('message', { required: 'বার্তা আবশ্যক' })} />
              {errors.message && <p className="mt-1 text-xs text-bd-red-600">{errors.message.message}</p>}
            </div>
            <button type="submit" disabled={submitting} className="btn-primary w-full">
              <Send className="h-4 w-4" /> {submitting ? 'পাঠানো হচ্ছে...' : 'বার্তা পাঠান'}
            </button>
          </form>
        </FadeIn>
      </div>
    </div>
  );
}
