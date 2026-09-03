import React from 'react';
import { Shield, Heart, Sparkles, MapPin, Mail, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { schoolSettings } = useApp();

  return (
    <footer className="mt-16 bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-8">
      {/* Footer Banner Image if configured */}
      {schoolSettings.footerBannerImage && (
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 mb-8">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 min-h-[9rem] sm:h-44 md:h-52 relative group bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 flex items-end">
            <img 
              src={schoolSettings.footerBannerImage} 
              alt="Footer Banner" 
              loading="lazy"
              decoding="async"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 brightness-90 contrast-105" 
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=80';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent pointer-events-none" />
            <div className="relative z-10 p-4 sm:p-6 w-full">
              <p className="text-amber-400 font-extrabold text-[11px] sm:text-xs uppercase tracking-widest drop-shadow-[0_1px_4px_rgba(0,0,0,0.9)]">
                {schoolSettings.slogan}
              </p>
              <h3 className="text-white font-black text-sm sm:text-xl md:text-2xl mt-0.5 drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
                {schoolSettings.youthUnionName}
              </h3>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Col 1: Brand */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center space-x-2 text-white font-bold text-sm">
              <span className="p-1 rounded-lg bg-red-600 text-white">⭐</span>
              <span className="uppercase">{schoolSettings.youthUnionName}</span>
            </div>
            <p className="text-slate-400 leading-relaxed pr-4">
              Hệ thống chuyển đổi số toàn diện công tác Quản lý Nề nếp – Đánh giá Thi đua – Tổ chức Hoạt động phong trào Đoàn. Minh bạch hóa điểm số, chuẩn hóa quy trình chấm chéo và bảo mật thông tin học sinh.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-slate-500 pt-1">
              <span>Định mức chuẩn: 1440 điểm/tuần</span>
              <span>•</span>
              <span>18 Chi đoàn</span>
              <span>•</span>
              <span>PWA Mobile-First</span>
            </div>
          </div>

          {/* Col 2: Quick Links */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider">Liên Kết Nhanh</h4>
            <ul className="space-y-1.5 text-slate-400">
              <li><a href="#leaderboard" className="hover:text-red-400 transition-colors">Bảng xếp hạng thi đua tuần</a></li>
              <li><a href="#newsfeed" className="hover:text-red-400 transition-colors">Bản tin phong trào Đoàn</a></li>
              <li><a href="#schedule" className="hover:text-red-400 transition-colors">Lịch trực Đội Cờ Đỏ</a></li>
              <li><a href="#criteria" className="hover:text-red-400 transition-colors">Bộ tiêu chí chấm điểm nề nếp</a></li>
            </ul>
          </div>

          {/* Col 3: Contact & Support */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-xs tracking-wider">Thông Tin Liên Hệ</h4>
            <p className="text-slate-400 flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
              <span>{schoolSettings.address}</span>
            </p>
            <p className="text-slate-400 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Hotline Đoàn: <span className="text-amber-400 font-mono">{schoolSettings.phone}</span></span>
            </p>
            <p className="text-slate-400 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>Email: <span className="text-blue-400 font-mono">{schoolSettings.email}</span></span>
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
          <p>© 2026 {schoolSettings.youthUnionName}. Bản quyền thuộc Ban Chấp Hành Đoàn Trường.</p>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center gap-1 text-slate-400">
              Phát triển với tinh thần <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> Thanh Niên Xung Kích
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
