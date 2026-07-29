import type { MembershipPayment } from '@/types';
import { X, Printer, Download, CheckCircle2, Shield, Calendar, CreditCard, Hash } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface PaymentReceiptModalProps {
  payment: MembershipPayment | null;
  onClose: () => void;
}

export function PaymentReceiptModal({ payment, onClose }: PaymentReceiptModalProps) {
  if (!payment) return null;

  const handlePrint = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>পেমেন্ট রসিদ - ${payment.trxId}</title>
          <style>
            body { font-family: 'SolaimanLipi', sans-serif; padding: 40px; color: #222; }
            .receipt { max-width: 500px; margin: 0 auto; border: 2px solid #006a4e; border-radius: 12px; padding: 25px; }
            .header { text-align: center; border-bottom: 2px dashed #006a4e; padding-bottom: 15px; margin-bottom: 20px; }
            .header h2 { margin: 0; color: #006a4e; }
            .row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; font-size: 14px; }
            .total { font-size: 18px; font-weight: bold; color: #006a4e; border-top: 2px solid #006a4e; margin-top: 15px; padding-top: 10px; }
            .footer { text-align: center; margin-top: 30px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <h2>ঝিনাইদহ জেলা সমিতি</h2>
              <p>অফিশিয়াল সদস্য ফি রসিদ</p>
            </div>
            <div class="row"><span>সদস্যের নাম:</span> <strong>${payment.memberName}</strong></div>
            <div class="row"><span>ইমেইল:</span> <span>${payment.email}</span></div>
            <div class="row"><span>ফোন:</span> <span>${payment.phone}</span></div>
            <div class="row"><span>উপজেলা:</span> <span>${payment.upazila}</span></div>
            <div class="row"><span>বিভাগ ও সেশন:</span> <span>${payment.department} (${payment.session})</span></div>
            <div class="row"><span>পেমেন্ট মাধ্যম:</span> <span>${payment.paymentMethod}</span></div>
            <div class="row"><span>ট্রানজেকশন ID:</span> <strong>${payment.trxId}</strong></div>
            <div class="row"><span>স্ট্যাটাস:</span> <strong>${payment.status === 'paid' ? 'পরিশোধিত' : 'প্রক্রিয়াধীন'}</strong></div>
            <div class="row total"><span>মোট সদস্য ফি:</span> <span>৳ ${payment.amount}</span></div>
            <div class="footer">
              <p>ধন্যবাদ, ঝিনাইদহ জেলা সমিতি, রাজশাহী বিশ্ববিদ্যালয়।</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWin.document.close();
    printWin.focus();
    printWin.print();
    printWin.close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="card max-w-md w-full flex flex-col overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        {/* Header */}
        <div className="p-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-bd-green-600" />
            <h3 className="font-bold text-base text-gray-900 dark:text-white">অফিশিয়াল পেমেন্ট রসিদ</h3>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          <div className="text-center p-3 rounded-xl bg-bd-green-50 dark:bg-bd-green-900/20 border border-bd-green-200 dark:border-bd-green-800">
            <CheckCircle2 className="h-8 w-8 text-bd-green-600 mx-auto mb-1" />
            <p className="font-bold text-base text-bd-green-800 dark:text-bd-green-300">
              ৳ {payment.amount} (পরিশোধিত)
            </p>
            <p className="text-gray-500 mt-0.5">সদস্য ফি রসিদ</p>
          </div>

          <div className="space-y-2 divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">সদস্যের নাম:</span>
              <span className="font-semibold text-gray-900 dark:text-white">{payment.memberName}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">বিভাগ ও সেশন:</span>
              <span>{payment.department} ({payment.session})</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">উপজেলা:</span>
              <span>{payment.upazila}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">পেমেন্ট মাধ্যম:</span>
              <span className="font-semibold text-bd-green-600">{payment.paymentMethod}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">ট্রানজেকশন ID:</span>
              <span className="font-mono font-bold text-amber-600">{payment.trxId}</span>
            </div>
            <div className="flex justify-between py-1.5">
              <span className="text-gray-400">তারিখ:</span>
              <span>{new Date(payment.createdAt).toLocaleDateString('bn-BD')}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button onClick={handlePrint} className="btn-primary w-full flex items-center justify-center gap-2">
            <Printer className="h-4 w-4" /> রসিদ প্রিন্ট করুন
          </button>
        </div>
      </div>
    </div>
  );
}
