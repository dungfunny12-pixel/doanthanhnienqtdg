import React from 'react';
import { Shield, Heart, Sparkles, MapPin, Mail, Phone } from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const Footer: React.FC = () => {
  const { schoolSettings } = useApp();

  return (
    <footer className="mt-16 bg-slate-950 border-t border-slate-800 text-slate-400 text-xs py-8">
      {/* Footer Banner Image if configured */}
      {schoolSettings.footerBannerImage && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-800 h-36 sm:h-48 relative group">
            <img 
              src={schoolSettings.footerBannerImage} 
              alt="Footer Banner" 
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 bg-slate-900" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex items-end p-6">
              <div>
                <p className="text-amber-400 font-extrabold text-xs uppercase tracking-widest">{schoolSettings.slogan}</p>
                <h3 className="text-white font-black text-lg sm:text-xl">{schoolSettings.youthUnionName}</h3>
              </div>
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
