import { useState, useEffect } from 'react';
import { FadeIn } from '@/components/ui/FadeIn';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { isDistrictAdmin, isUpazilaAdmin } from '@/utils/rbac';
import {
  listMembershipPayments,
  createMembershipPayment,
  updatePaymentStatus,
} from '@/services/membershipService';
import { MembershipCard } from '@/components/membership/MembershipCard';
import { PaymentReceiptModal } from '@/components/membership/PaymentReceiptModal';
import { UPAZILA_OPTIONS, type MembershipPayment, type MembershipPaymentStatus, type UpazilaName } from '@/types';
import { ShieldCheck, CreditCard, DollarSign, Users, CheckCircle2, Clock, AlertCircle, Search, Printer, Plus, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

export function DashboardMembership() {
  const { user } = useAuth();
  const isAdmin = isDistrictAdmin(user?.role) || isUpazilaAdmin(user?.role);

  const [payments, setPayments] = useState<MembershipPayment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter & Search State
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MembershipPaymentStatus | 'all'>('all');

  // Submit Payment Form State
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [memberName, setMemberName] = useState(user?.displayName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [upazila, setUpazila] = useState<UpazilaName>(user?.upazila || UPAZILA_OPTIONS[0]);
  const [department, setDepartment] = useState('');
  const [session, setSession] = useState('২০২০-২১');
  const [amount, setAmount] = useState(500);
  const [paymentMethod, setPaymentMethod] = useState<'bKash' | 'Nagad' | 'Rocket' | 'Bank'>('bKash');
  const [trxId, setTrxId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Selected Receipt Modal
  const [selectedReceipt, setSelectedReceipt] = useState<MembershipPayment | null>(null);

  const loadPayments = async () => {
    setLoading(true);
    try {
      const records = await listMembershipPayments();
      setPayments(records);
    } catch {
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPayments();
  }, []);

  const paidPayments = payments.filter((p) => p.status === 'paid');
  const pendingPayments = payments.filter((p) => p.status === 'pending');
  const expiredPayments = payments.filter((p) => p.status === 'expired');
  const totalCollection = paidPayments.reduce((sum, p) => sum + p.amount, 0);

  // User's own payment (if exists)
  const myPayment = payments.find((p) => p.email === user?.email || p.userId === user?.uid);

  const filteredPayments = payments.filter((p) => {
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    const q = query.trim().toLowerCase();
    const haystack = [p.memberName, p.email, p.phone, p.trxId, p.upazila ?? ''].join(' ').toLowerCase();
    const matchQuery = !q || haystack.includes(q);
    return matchStatus && matchQuery;
  });

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !email || !phone || !trxId) {
      toast.error('নাম, ইমেইল, ফোন ও ট্রানজেকশন ID আবশ্যক');
      return;
    }

    setSubmitting(true);
    try {
      await createMembershipPayment({
        userId: user?.uid,
        memberName,
        email,
        phone,
        upazila,
        department: department || 'অনুল্লেখিত',
        session,
        amount,
        paymentMethod,
        trxId,
      });

      toast.success('সদস্য ফি পরিশোধ জমা হয়েছে! অ্যাডমিন অনুমোদনের পর কার্ড সক্রিয় হবে।');
      setShowPaymentForm(false);
      await loadPayments();
    } catch {
      toast.error('পেমেন্ট জমা দিতে সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveStatus = async (id: string, newStatus: MembershipPaymentStatus) => {
    try {
      await updatePaymentStatus(id, newStatus);
      toast.success(newStatus === 'paid' ? 'পেমেন্ট অনুমোদিত হয়েছে' : 'স্ট্যাটাস পরিবর্তন হয়েছে');
      await loadPayments();
    } catch {
      toast.error('স্ট্যাটাস পরিবর্তনে সমস্যা হয়েছে');
    }
  };

  return (
    <div className="space-y-6">
      <FadeIn>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <CreditCard className="h-6 w-6 text-bd-green-600" />
              মেম্বারশিপ ও পেমেন্ট ট্র্যাকিং
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ডিজিটাল মেম্বারশিপ কার্ড, পেমেন্ট রসিদ ও অর্থ সংগ্রহ হিসাব
            </p>
          </div>

          <button
            onClick={() => setShowPaymentForm(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-4 w-4" /> অনলাইন সদস্য ফি পরিশোধ করুন
          </button>
        </div>
      </FadeIn>

      {/* Admin Analytics Summary Cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        {/* Total Collection */}
        <div className="card p-5 border-l-4 border-l-bd-green-600 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">মোট আদায়কৃত ফি (Collection)</p>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              ৳ {totalCollection.toLocaleString('bn-BD')}
            </h3>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-bd-green-100 text-bd-green-700 dark:bg-bd-green-900/40 dark:text-bd-green-300">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>

        {/* Paid Members */}
        <div className="card p-5 border-l-4 border-l-emerald-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">পরিশোধিত সদস্য (Paid Members)</p>
            <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
              {paidPayments.length} জন
            </h3>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Pending & Due Members */}
        <div className="card p-5 border-l-4 border-l-amber-500 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">প্রক্রিয়াধীন / বকেয়া (Pending/Due)</p>
            <h3 className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">
              {pendingPayments.length + expiredPayments.length} জন
            </h3>
          </div>
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
            <Clock className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* User's Digital Membership Card Preview */}
      <div className="card p-6 space-y-4">
        <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-500" />
          আপনার ডিজিটাল মেম্বারশিপ কার্ড (Membership Card)
        </h2>
        <MembershipCard payment={myPayment} />
      </div>

      {/* Payment History & Admin Manager Table */}
      <div className="card p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100 dark:border-gray-800">
          <h2 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
            <Users className="h-5 w-5 text-bd-green-600" />
            পেমেন্ট ইতিহাস ও ট্র্যাকিং তালিকা ({filteredPayments.length})
          </h2>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="নাম, ফোন বা Trx ID..."
                className="input pl-9 !py-1.5 !text-xs !w-48"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as MembershipPaymentStatus | 'all')}
              className="input !py-1.5 !px-3 !text-xs !w-auto"
            >
              <option value="all">সব স্ট্যাটাস</option>
              <option value="paid">পরিশোধিত (Paid)</option>
              <option value="pending">প্রক্রিয়াধীন (Pending)</option>
              <option value="expired">মেয়াদোত্তীর্ণ (Expired)</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 font-semibold border-b border-gray-200 dark:border-gray-800">
              <tr>
                <th className="py-3 px-4">সদস্যের নাম</th>
                <th className="py-3 px-4">বিভাগ ও উপজেলা</th>
                <th className="py-3 px-4">পেমেন্ট মাধ্যম</th>
                <th className="py-3 px-4">Trx ID</th>
                <th className="py-3 px-4">পরিমাণ</th>
                <th className="py-3 px-4">স্ট্যাটাস</th>
                <th className="py-3 px-4">অ্যাকশন</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">কোনো পেমেন্ট তথ্য পাওয়া যায়নি</td>
                </tr>
              ) : (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition">
                    <td className="py-3 px-4 font-bold text-gray-900 dark:text-white">
                      {p.memberName}
                      <p className="text-[10px] text-gray-400 font-normal">{p.email}</p>
                    </td>
                    <td className="py-3 px-4">
                      {p.department} ({p.session})
                      <p className="text-[10px] text-bd-green-600 font-medium">{p.upazila}</p>
                    </td>
                    <td className="py-3 px-4 font-semibold">{p.paymentMethod}</td>
                    <td className="py-3 px-4 font-mono font-bold text-amber-600">{p.trxId}</td>
                    <td className="py-3 px-4 font-bold">৳ {p.amount}</td>
                    <td className="py-3 px-4">
                      <Badge variant={p.status === 'paid' ? 'green' : p.status === 'pending' ? 'amber' : 'red'}>
                        {p.status === 'paid' ? 'পরিশোধিত' : p.status === 'pending' ? 'প্রক্রিয়াধীন' : 'মেয়াদোত্তীর্ণ'}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedReceipt(p)}
                          className="chip bg-bd-green-50 text-bd-green-700 dark:bg-bd-green-900/30 dark:text-bd-green-300 hover:bg-bd-green-100 text-[11px]"
                        >
                          <Printer className="h-3 w-3" /> রসিদ
                        </button>

                        {isAdmin && p.status === 'pending' && (
                          <button
                            onClick={() => handleApproveStatus(p.id, 'paid')}
                            className="chip bg-emerald-600 text-white hover:bg-emerald-700 text-[11px]"
                          >
                            অনুমোদন
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Online Membership Fee Payment Form Modal */}
      {showPaymentForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="card max-w-lg w-full flex flex-col overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
            <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-base text-gray-900 dark:text-white flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-bd-green-600" />
                অনলাইন সদস্য ফি পরিশোধ
              </h3>
              <button onClick={() => setShowPaymentForm(false)} className="p-1 text-gray-400 hover:text-gray-600">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmitPayment} className="p-5 space-y-3 text-xs overflow-y-auto max-h-[80vh]">
              <div className="p-3 rounded-xl bg-bd-green-50 dark:bg-bd-green-900/30 text-bd-green-800 dark:text-bd-green-300 font-medium">
                বার্ষিক সদস্য ফি: ৳ ৫০০। bKash/Nagad নম্বর <strong>০১৭xx-xxxxxx</strong>-এ Send Money করে Transaction ID নিচে প্রবেশ করান।
              </div>

              <div>
                <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">সদস্যের নাম *</label>
                <input
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
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
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">উপজেলা</label>
                  <select
                    value={upazila || ''}
                    onChange={(e) => setUpazila(e.target.value as UpazilaName)}
                    className="input"
                  >
                    {UPAZILA_OPTIONS.map((u) => <option key={u} value={u ?? ''}>{u}</option>)}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">বিভাগ ও সেশন</label>
                  <input
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    placeholder="বাংলা, ২০২০-২১"
                    className="input"
                  />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">পেমেন্ট মাধ্যম</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="input"
                  >
                    <option value="bKash">bKash (বিকাশ)</option>
                    <option value="Nagad">Nagad (নগদ)</option>
                    <option value="Rocket">Rocket (রকেট)</option>
                    <option value="Bank">Bank Transfer</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-gray-700 dark:text-gray-300 block mb-1">ট্রানজেকশন ID (TrxID) *</label>
                  <input
                    value={trxId}
                    onChange={(e) => setTrxId(e.target.value)}
                    placeholder="যেমন: BK9X77A12"
                    className="input font-mono uppercase"
                    required
                  />
                </div>
              </div>

              <button type="submit" disabled={submitting} className="btn-primary w-full mt-2">
                {submitting ? 'পেমেন্ট জমা হচ্ছে...' : 'পেমেন্ট তথ্য জমা দিন'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Payment Receipt Modal */}
      {selectedReceipt && (
        <PaymentReceiptModal payment={selectedReceipt} onClose={() => setSelectedReceipt(null)} />
      )}
    </div>
  );
}
