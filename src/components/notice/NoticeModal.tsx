import type { Notice } from '@/types';
import { X, Printer, Download, Calendar, Tag, Paperclip, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import toast from 'react-hot-toast';

interface NoticeModalProps {
  notice: Notice | null;
  onClose: () => void;
}

export function NoticeModal({ notice, onClose }: NoticeModalProps) {
  if (!notice) return null;

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${notice.title} - ঝিনাইদহ জেলা সমিতি</title>
          <style>
            body { font-family: 'SolaimanLipi', Arial, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #006a4e; padding-bottom: 20px; margin-bottom: 30px; }
            .header h1 { margin: 0; color: #006a4e; font-size: 24px; }
            .header p { margin: 5px 0 0 0; color: #666; font-size: 14px; }
            .meta { margin-bottom: 20px; font-size: 14px; color: #444; border-bottom: 1px solid #eee; padding-bottom: 15px; }
            .title { font-size: 20px; font-weight: bold; margin-bottom: 20px; color: #111; }
            .body { font-size: 15px; white-space: pre-wrap; margin-bottom: 40px; }
            .footer { margin-top: 60px; border-top: 1px solid #ddd; pt-20px; text-align: right; font-size: 13px; color: #555; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>ঝিনাইদহ জেলা সমিতি, রাজশাহী বিশ্ববিদ্যালয়</h1>
            <p>অফিশিয়াল নোটিশ বোর্ড</p>
          </div>
          <div class="meta">
            <strong>বিষয়শ্রেণী:</strong> ${notice.category} | 
            <strong>তারিখ:</strong> ${new Date(notice.date).toLocaleDateString('bn-BD')} | 
            <strong>পরিসর:</strong> ${notice.scope === 'upazila' ? notice.upazila : 'জেলা শাখা'}
          </div>
          <div class="title">${notice.title}</div>
          <div class="body">${notice.body}</div>
          <div class="footer">
            <p>প্রচারে: সাধারণ সম্পাদক / সভাপতি</p>
            <p>ঝিনাইদহ জেলা সমিতি</p>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
  };

  const handleDownloadPDF = () => {
    handlePrint();
    toast.success('নোটিশ প্রিন্ট বা PDF হিসেবে সংরক্ষণ করুন');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="card max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800">
        {/* Modal Header */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {notice.pinned && (
              <Badge variant="amber" className="flex items-center gap-1">
                <Pin className="h-3 w-3" /> পিন করা
              </Badge>
            )}
            <Badge variant={notice.category === 'জরুরি' ? 'red' : 'green'}>
              {notice.category}
            </Badge>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">
            {notice.title}
          </h2>

          <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 dark:text-gray-400 border-y border-gray-100 dark:border-gray-800 py-2.5">
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-bd-green-600" />
              {new Date(notice.date).toLocaleDateString('bn-BD')}
            </span>
            <span className="flex items-center gap-1">
              <Tag className="h-3.5 w-3.5 text-bd-green-600" />
              {notice.scope === 'upazila' ? `${notice.upazila} উপজেলা` : 'জেলা সমিতি'}
            </span>
          </div>

          <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap leading-relaxed">
            {notice.body}
          </div>

          {notice.attachmentUrl && (
            <div className="mt-4 p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <span className="text-xs text-gray-600 dark:text-gray-300 flex items-center gap-2">
                <Paperclip className="h-4 w-4 text-bd-green-600" /> সংযুক্ত ফাইল
              </span>
              <a
                href={notice.attachmentUrl}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-semibold text-bd-green-600 hover:underline"
              >
                ডাউনলোড
              </a>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
          <button onClick={handlePrint} className="btn-ghost !py-2 !px-3 text-xs">
            <Printer className="h-4 w-4" /> নোটিশ প্রিন্ট করুন
          </button>
          <button onClick={handleDownloadPDF} className="btn-primary !py-2 !px-3 text-xs">
            <Download className="h-4 w-4" /> PDF ডাউনলোড
          </button>
        </div>
      </div>
    </div>
  );
}
