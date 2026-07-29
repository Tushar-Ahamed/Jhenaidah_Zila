import type { MemberProfile, MembershipPayment } from '@/types';
import { ShieldCheck, QrCode, Printer, MapPin, Award, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface MembershipCardProps {
  member?: MemberProfile | null;
  payment?: MembershipPayment | null;
}

export function MembershipCard({ member, payment }: MembershipCardProps) {
  const name = member?.name || payment?.memberName || 'ঝিনাইদহ সদস্য';
  const email = member?.email || payment?.email || 'member@jhenaidahsamiti.org';
  const phone = member?.phone || payment?.phone || '০১৭xx-xxxxxx';
  const department = member?.department || payment?.department || 'বাংলা';
  const session = member?.session || payment?.session || '২০২০-২১';
  const upazila = member?.upazila || payment?.upazila || 'ঝিনাইদহ সদর';
  const photo = member?.photo || '';
  const status = payment?.status || 'paid';

  const handlePrintCard = () => {
    const printWin = window.open('', '_blank');
    if (!printWin) return;

    printWin.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ডিজিটাল মেম্বারশিপ কার্ড - ${name}</title>
          <style>
            body { font-family: 'SolaimanLipi', sans-serif; display: flex; justify-content: center; align-items: center; min-h: 100vh; background: #f0f2f5; margin: 0; }
            .card-box { width: 450px; background: linear-gradient(135deg, #006a4e 0%, #004d38 100%); color: #fff; border-radius: 20px; padding: 25px; box-shadow: 0 15px 35px rgba(0,0,0,0.2); border: 2px solid #00a877; position: relative; overflow: hidden; }
            .badge-bar { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255,255,255,0.2); padding-bottom: 12px; margin-bottom: 20px; }
            .org-title { font-size: 16px; font-weight: bold; margin: 0; }
            .sub-title { font-size: 11px; opacity: 0.8; margin: 0; }
            .profile-flex { display: flex; gap: 15px; align-items: center; }
            .avatar { width: 75px; height: 75px; border-radius: 50%; background: #fff; color: #006a4e; display: flex; align-items: center; justify-content: center; font-size: 28px; font-weight: bold; border: 3px solid #ffd700; overflow: hidden; }
            .info h2 { font-size: 18px; margin: 0 0 5px 0; color: #fff; }
            .info p { font-size: 12px; margin: 2px 0; opacity: 0.9; }
            .card-footer { display: flex; justify-content: space-between; align-items: center; margin-top: 25px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.2); font-size: 11px; }
            .status-tag { background: #ffd700; color: #004d38; padding: 3px 10px; border-radius: 12px; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card-box">
            <div class="badge-bar">
              <div>
                <p class="org-title">ঝিনাইদহ জেলা সমিতি</p>
                <p class="sub-title">রাজশাহী বিশ্ববিদ্যালয়</p>
              </div>
              <span class="status-tag">${status === 'paid' ? 'সক্রিয় সদস্য' : 'প্রক্রিয়াধীন'}</span>
            </div>
            <div class="profile-flex">
              <div class="avatar">${photo ? `<img src="${photo}" style="width:100%;height:100%;object-fit:cover;" />` : name[0]}</div>
              <div class="info">
                <h2>${name}</h2>
                <p><strong>বিভাগ:</strong> ${department} (${session})</p>
                <p><strong>উপজেলা:</strong> ${upazila}</p>
                <p><strong>ফোন:</strong> ${phone}</p>
              </div>
            </div>
            <div class="card-footer">
              <span>মেম্বারশিপ ID: JZS-${Math.abs(name.split('').reduce((a,b)=>a+b.charCodeAt(0),0))}</span>
              <span>ইস্যু: ২০২৬-২৭</span>
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
    <div className="card p-6 bg-gradient-to-br from-bd-green-800 via-bd-green-700 to-teal-900 text-white border-2 border-bd-green-400/40 shadow-2xl relative overflow-hidden max-w-md mx-auto">
      {/* Background Graphic Watermark */}
      <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
        <Award className="h-56 w-56 text-white" />
      </div>

      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-white/20 pb-3 mb-4">
        <div className="flex items-center gap-2">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-white/20 text-amber-300 font-bold text-sm">
            ঝি
          </div>
          <div>
            <h3 className="font-bold text-sm leading-tight text-white">ঝিনাইদহ জেলা সমিতি</h3>
            <p className="text-[10px] text-emerald-100">রাজশাহী বিশ্ববিদ্যালয়</p>
          </div>
        </div>

        {/* Status Badge */}
        {status === 'paid' ? (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-400 text-emerald-950 font-bold text-xs shadow-md">
            <CheckCircle2 className="h-3.5 w-3.5" /> পরিশোধিত (Paid)
          </span>
        ) : status === 'pending' ? (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-sky-400 text-slate-950 font-bold text-xs shadow-md">
            <Clock className="h-3.5 w-3.5" /> প্রক্রিয়াধীন
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-400 text-rose-950 font-bold text-xs shadow-md">
            <AlertCircle className="h-3.5 w-3.5" /> মেয়াদোত্তীর্ণ
          </span>
        )}
      </div>

      {/* Card Middle: Profile Details & QR Code */}
      <div className="flex items-start gap-4">
        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/20 text-white font-bold text-3xl border-2 border-amber-300/60 shadow-md shrink-0 overflow-hidden">
          {photo ? <img src={photo} alt={name} className="h-full w-full object-cover" /> : name[0]}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <h2 className="font-bold text-lg text-white truncate">{name}</h2>
          <p className="text-xs text-emerald-100"><span className="opacity-70">বিভাগ:</span> {department}</p>
          <p className="text-xs text-emerald-100"><span className="opacity-70">সেশন:</span> {session}</p>
          <p className="text-xs text-emerald-100 flex items-center gap-1">
            <MapPin className="h-3 w-3 text-amber-300" /> {upazila}
          </p>
        </div>
      </div>

      {/* Bottom Bar: QR Badge & ID */}
      <div className="mt-6 pt-3 border-t border-white/20 flex items-center justify-between text-xs text-emerald-100">
        <div className="flex items-center gap-2">
          <QrCode className="h-7 w-7 text-amber-300" />
          <div>
            <p className="text-[10px] opacity-75 uppercase tracking-wider">সদস্য কোড</p>
            <p className="font-mono font-bold text-amber-300">JZS-{Math.abs(name.split('').reduce((a,b)=>a+b.charCodeAt(0),0))}</p>
          </div>
        </div>

        <button
          onClick={handlePrintCard}
          className="px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white font-semibold text-xs transition flex items-center gap-1.5"
        >
          <Printer className="h-3.5 w-3.5" /> প্রিন্ট কার্ড
        </button>
      </div>
    </div>
  );
}
