import { useState, useEffect } from 'react';
import type { OrgEvent, EventRegistrationRecord } from '@/types';
import { X, Calendar, MapPin, User, Users, CheckCircle, Image as ImageIcon, Film, Clock, Award, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { registerForEvent, listEventRegistrations } from '@/services/membershipService';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

interface EventModalProps {
  event: OrgEvent | null;
  onClose: () => void;
}

export function EventModal({ event, onClose }: EventModalProps) {
  if (!event) return null;

  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'details' | 'register' | 'gallery' | 'participants'>('details');

  // Registration Form State
  const [name, setName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [department, setDepartment] = useState('');
  const [session, setSession] = useState('২০২০-২১');
  const [paymentTrx, setPaymentTrx] = useState('');
  const [registering, setRegistering] = useState(false);

  // Participants List
  const [participants, setParticipants] = useState<EventRegistrationRecord[]>([]);

  const loadParticipants = async () => {
    try {
      const records = await listEventRegistrations(event.id);
      setParticipants(records);
    } catch {
      setParticipants([]);
    }
  };

  useEffect(() => {
    loadParticipants();
  }, [event.id]);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone) {
      toast.error('নাম, ইমেইল ও ফোন নম্বর আবশ্যক');
      return;
    }

    setRegistering(true);
    try {
      await registerForEvent({
        eventId: event.id,
        eventTitle: event.title,
        userId: user?.uid,
        name,
        email,
        phone,
        department: department || 'অনুল্লেখিত',
        session,
        paymentTrx,
      });

      toast.success('অনলাইন রেজিস্ট্রেশন সফল হয়েছে!');
      setActiveTab('participants');
      await loadParticipants();
    } catch {
      toast.error('রেজিস্ট্রেশন সম্পূর্ণ করা যায়নি');
    } finally {
      setRegistering(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-fadeIn">
      <div className="card max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        {/* Banner */}
        {event.coverImage ? (
          <div className="relative h-48 sm:h-64 w-full bg-black shrink-0">
            <img src={event.coverImage} alt={event.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-5">
              <div>
                <Badge variant={event.status === 'upcoming' ? 'amber' : 'green'} className="mb-2">
                  {event.status === 'upcoming' ? 'আসন্ন আয়োজন' : 'সম্পন্ন আয়োজন'}
                </Badge>
                <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">{event.title}</h2>
              </div>
            </div>
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-black/60 text-white hover:bg-black/90 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        ) : (
          <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{event.title}</h2>
            <button onClick={onClose} className="p-1.5 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-800 px-4 bg-gray-50/50 dark:bg-gray-900/50">
          <button
            onClick={() => setActiveTab('details')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition ${
              activeTab === 'details'
                ? 'border-bd-green-600 text-bd-green-700 dark:text-bd-green-300'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            বিস্তারিত তথ্য
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'border-bd-green-600 text-bd-green-700 dark:text-bd-green-300'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <CheckCircle className="h-3.5 w-3.5" /> অনলাইন রেজিস্ট্রেশন
          </button>

          {(event.photos?.length || event.videoUrl) && (
            <button
              onClick={() => setActiveTab('gallery')}
              className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
                activeTab === 'gallery'
                  ? 'border-bd-green-600 text-bd-green-700 dark:text-bd-green-300'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <ImageIcon className="h-3.5 w-3.5" /> ফটো ও ভিডিও গ্যালারি
            </button>
          )}

          <button
            onClick={() => setActiveTab('participants')}
            className={`px-4 py-3 text-xs font-semibold border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'participants'
                ? 'border-bd-green-600 text-bd-green-700 dark:text-bd-green-300'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="h-3.5 w-3.5" /> অংশগ্রহণকারী ({participants.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: DETAILS */}
          {activeTab === 'details' && (
            <div className="space-y-4 text-xs">
              <div className="grid sm:grid-cols-2 gap-3 p-4 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <Calendar className="h-4 w-4 text-bd-green-600 shrink-0" />
                  <span><strong>তারিখ:</strong> {new Date(event.date).toLocaleDateString('bn-BD')}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Clock className="h-4 w-4 text-bd-green-600 shrink-0" />
                    <span><strong>সময়:</strong> {event.time}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                  <MapPin className="h-4 w-4 text-bd-green-600 shrink-0" />
                  <span><strong>স্থান:</strong> {event.location}</span>
                </div>
                {event.chiefGuest && (
                  <div className="flex items-center gap-2 text-gray-700 dark:text-gray-200">
                    <Award className="h-4 w-4 text-amber-500 shrink-0" />
                    <span><strong>প্রধান অতিথি:</strong> {event.chiefGuest}</span>
                  </div>
                )}
              </div>

              <div>
                <h4 className="font-bold text-sm text-gray-900 dark:text-white mb-1">আয়োজনের বিবরণ</h4>
                <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                  {event.description}
                </p>
              </div>

              <div className="pt-4 flex justify-end">
                <button onClick={() => setActiveTab('register')} className="btn-primary">
                  <CheckCircle className="h-4 w-4" /> রেজিস্ট্রেশন করুন
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ONLINE REGISTRATION */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs max-w-lg mx-auto">
              <div className="p-3 rounded-xl bg-bd-green-50 dark:bg-bd-green-900/30 text-bd-green-800 dark:text-bd-green-300 font-medium">
                অনলাইন রেজিস্ট্রেশন ফর্ম — {event.title}
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">নাম *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="আপনার নাম"
                  className="input"
                  required
                />
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">ইমেইল *</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="email@example.com"
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">ফোন নম্বর *</label>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="০১৭xx-xxxxxx"
                    className="input"
                    required
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">বিভাগ</label>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="যেমন: বাংলা, ইংরেজি"
                    className="input"
                  />
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">সেশন</label>
                  <input
                    value={session}
                    onChange={(e) => setSession(e.target.value)}
                    placeholder="২০২০-২১"
                    className="input"
                  />
                </div>
              </div>

              {event.registrationFee && event.registrationFee > 0 ? (
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">
                    পেমেন্ট ট্রানজেকশন ID (ফি: ৳ {event.registrationFee})
                  </label>
                  <input
                    value={paymentTrx}
                    onChange={(e) => setPaymentTrx(e.target.value)}
                    placeholder="bKash/Nagad Transaction ID"
                    className="input font-mono"
                  />
                </div>
              ) : null}

              <button type="submit" disabled={registering} className="btn-primary w-full mt-2">
                {registering ? 'রেজিস্ট্রেশন হচ্ছে...' : 'রেজিস্ট্রেশন জমা দিন'}
              </button>
            </form>
          )}

          {/* TAB 3: PHOTO & VIDEO GALLERY */}
          {activeTab === 'gallery' && (
            <div className="space-y-4">
              {event.photos && event.photos.length > 0 && (
                <div>
                  <h4 className="font-bold text-xs text-gray-700 dark:text-gray-300 mb-2">ফটো গ্যালারি</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {event.photos.map((p, idx) => (
                      <div key={idx} className="h-32 rounded-lg overflow-hidden border border-gray-200">
                        <img src={p} alt="gallery" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {event.videoUrl && (
                <div>
                  <h4 className="font-bold text-xs text-gray-700 dark:text-gray-300 mb-2">ভিডিও গ্যালারি</h4>
                  <div className="aspect-video rounded-xl overflow-hidden bg-black">
                    <iframe
                      src={`https://www.youtube.com/embed/${event.videoUrl.split('v=')[1] || event.videoUrl.split('/').pop()}`}
                      title={event.title}
                      className="w-full h-full"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: PARTICIPANTS */}
          {activeTab === 'participants' && (
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-gray-700 dark:text-gray-300">অংশগ্রহণকারীদের তালিকা</h4>
              {participants.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">এখনো কেউ রেজিস্ট্রেশন করেননি</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-800">
                  {participants.map((p) => (
                    <div key={p.id} className="py-2.5 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white">{p.name}</p>
                        <p className="text-gray-400">{p.department} ({p.session}) • {p.phone}</p>
                      </div>
                      <Badge variant="green">কনফার্মড</Badge>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
