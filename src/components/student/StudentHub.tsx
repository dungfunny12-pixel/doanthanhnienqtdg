import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  QrCode, 
  Trophy, 
  Sparkles, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle2, 
  History, 
  AlertCircle, 
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  User,
  Heart,
  KeyRound
} from 'lucide-react';
import { QRCodeModal } from '../common/QRCodeModal';
import { PhotoViewerModal } from '../common/PhotoViewerModal';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { MediaPickerButton } from '../common/MediaPickerButton';

export const StudentHub: React.FC = () => {
  const { 
    currentUser, 
    activeWeek, 
    classes, 
    events, 
    registerForEvent, 
    getWeeklyScores, 
    violations,
    updateUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'card' | 'events' | 'ranking' | 'history'>('card');
  const [isQRModalOpen, setIsQRModalOpen] = useState<boolean>(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  const studentClassId = currentUser?.classId || '10/1';
  const studentClass = classes.find(c => c.id === studentClassId);
  const scores = getWeeklyScores(activeWeek);
  const studentClassScore = scores.find(s => s.classId === studentClassId);

  // Grade color theme: Grade 10 Blue, Grade 11 Orange, Grade 12 Red
  const grade = studentClass?.grade || 10;
  const cardGradient = grade === 10 
    ? 'from-blue-600 via-indigo-600 to-blue-900 border-blue-400/50 shadow-glow-blue'
    : grade === 11
    ? 'from-amber-600 via-orange-600 to-amber-900 border-amber-400/50 shadow-glow-gold'
    : 'from-red-600 via-rose-700 to-red-950 border-red-400/50 shadow-glow';

  // Dynamic QR Code string token
  const dynamicQrToken = `STUDENT-PASS:${currentUser?.studentId || 'HS20241019'}:${currentUser?.username || 'doanvien_minh'}:${Math.floor(Date.now() / 300000)}`;

  // Experience and rank progress
  const points = currentUser?.points || 85;
  const nextRankTarget = points < 80 ? 80 : points < 150 ? 150 : points < 200 ? 200 : 300;
  const progressPercent = Math.min(100, Math.round((points / nextRankTarget) * 100));

  // Personal history: events registered + violations for this student or class
  const registeredEvents = events.filter(e => e.registeredStudentIds.includes(currentUser?.id || ''));
  const myClassVios = violations.filter(v => v.classId === studentClassId && v.weekNumber === activeWeek);

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 space-y-6 animate-fadeIn">
      
      {/* Top Header */}
      <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150'}
              alt={currentUser?.name}
              className="w-14 h-14 rounded-2xl object-cover border-2 border-red-500 shadow-md"
            />
            <div className="absolute -bottom-1 -right-1">
              <MediaPickerButton
                category="students"
                suggestedClassId={studentClassId}
                onSelect={(url) => {
                  const newAvatar = Array.isArray(url) ? url[0] : url;
                  if (currentUser) {
                    updateUser(currentUser.id, { avatar: newAvatar });
                  }
                }}
                variant="iconOnly"
                label=""
                className="w-6 h-6 !p-0 rounded-full bg-slate-900 border border-slate-700 text-amber-400 hover:bg-amber-950 flex items-center justify-center shadow-lg cursor-pointer"
                title="Đổi ảnh thẻ chân dung 3x4"
              />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-black text-white">{currentUser?.name || 'Nguyễn Quang Minh'}</h2>
              <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                {studentClass?.name}
              </span>
            </div>
            <p className="text-xs text-amber-400 font-semibold">{currentUser?.rankTitle || 'Đoàn viên Tích cực'}</p>
          </div>
        </div>

        <div className="text-right flex flex-col items-end gap-1">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold">Điểm phong trào</span>
            <p className="text-xl font-black text-amber-300">{points}đ</p>
          </div>
          <button
            onClick={() => setIsChangePasswordOpen(true)}
            className="px-2 py-1 rounded-xl bg-slate-900 hover:bg-amber-950 text-amber-300 hover:text-amber-200 border border-slate-700 hover:border-amber-600 text-[10px] font-bold flex items-center gap-1 transition-all"
            title="Đổi mật khẩu tài khoản"
          >
            <KeyRound className="w-3 h-3 text-amber-400" />
            <span>Đổi MK</span>
          </button>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex rounded-2xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold">
        {[
          { id: 'card', label: '💳 Thẻ Số & QR' },
          { id: 'events', label: '🎪 Sự Kiện' },
          { id: 'ranking', label: '🏆 Xếp Hạng Lớp' },
          { id: 'history', label: '📜 Lịch Sử Điểm' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 py-2 rounded-xl transition-all text-center ${
              activeTab === tab.id
                ? 'bg-red-600 text-white shadow-glow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ================= TAB 1: DIGITAL ID CARD (THẺ HỌC SINH SỐ) ================= */}
      {activeTab === 'card' && (
        <div className="space-y-6">
          
          {/* Glowing Realistic Digital Card */}
          <div className={`relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br ${cardGradient} border text-white shadow-2xl space-y-6`}>
            
            {/* Card Watermark and Top crest */}
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-md">⭐</span>
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-amber-200 uppercase">ĐOÀN TNCS HỒ CHÍ MINH</p>
                  <p className="text-xs font-black">THPT VIỆT ĐỨC</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-[10px] font-black border border-white/30">
                KHỐI {grade}
              </span>
            </div>

            {/* Middle: Student Details & Big QR */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="space-y-1">
                <p className="text-[11px] text-white/80 uppercase font-semibold">Đoàn Viên - Học Sinh</p>
                <h3 className="text-xl font-black tracking-tight">{currentUser?.name}</h3>
                <p className="text-xs font-mono text-amber-200">Mã ĐV: {currentUser?.studentId || 'HS20241019'}</p>
                <p className="text-xs text-white/90">Chi đoàn: <strong>{studentClass?.name}</strong></p>
              </div>

              {/* QR Code preview */}
              <div 
                onClick={() => setIsQRModalOpen(true)}
                className="p-2.5 bg-white rounded-2xl shadow-2xl cursor-pointer hover:scale-105 transition-transform shrink-0 border-2 border-white/40"
              >
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(dynamicQrToken)}&margin=4&color=0f172a`}
                  alt="QR Thẻ"
                  className="w-20 h-20 object-contain"
                />
                <span className="block text-[9px] text-slate-900 font-extrabold text-center mt-0.5">Chạm để phóng to</span>
              </div>
            </div>

            {/* Bottom Progress Bar */}
            <div className="pt-2 border-t border-white/20 space-y-1">
              <div className="flex justify-between text-[11px] font-bold">
                <span>Cấp độ: {currentUser?.rankTitle}</span>
                <span>{points} / {nextRankTarget}đ</span>
              </div>
              <div className="w-full h-2 bg-black/30 rounded-full overflow-hidden border border-white/20">
                <div 
                  className="h-full bg-gradient-to-r from-amber-300 to-yellow-200 rounded-full transition-all"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>

          </div>

          {/* Action Button: Enlarge QR Code for Check-in */}
          <button
            onClick={() => setIsQRModalOpen(true)}
            className="w-full py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 shadow-card transition-all"
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Mở Mã QR Điểm Danh Sự Kiện (Tự Động Làm Mới Mỗi 5 Phút)</span>
          </button>
        </div>
      )}

      {/* ================= TAB 2: EVENTS REGISTRATION ================= */}
      {activeTab === 'events' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white">CỔNG ĐĂNG KÝ HOẠT ĐỘNG ĐOÀN</h3>
            <span className="text-xs text-slate-400">{events.length} sự kiện</span>
          </div>

          <div className="space-y-4">
            {events.map(evt => {
              const isRegistered = evt.registeredStudentIds.includes(currentUser?.id || '');
              const isFull = evt.registeredCount >= evt.maxSlots;

              return (
                <div key={evt.id} className="glass-panel rounded-3xl p-4 border border-slate-800 space-y-3 shadow-card">
                  <div className="relative">
                    <img
                      src={evt.thumbnail}
                      alt={evt.title}
                      className="w-full h-36 object-cover rounded-2xl border border-slate-700"
                    />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-900/90 text-amber-300 border border-amber-500/40">
                      {evt.category}
                    </span>
                    <span className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-950/90 text-emerald-300 border border-emerald-600/60">
                      +{evt.bonusPoints} Điểm
                    </span>
                  </div>

                  <div className="space-y-1">
                    <h4 className="font-extrabold text-white text-sm">{evt.title}</h4>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">{evt.description}</p>
                    <p className="text-[11px] text-amber-400 flex items-center gap-1 pt-1">
                      <Clock className="w-3.5 h-3.5" /> {evt.startDate} • Tại {evt.location}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400">
                      Chỗ còn lại: <strong className="text-white">{evt.maxSlots - evt.registeredCount} / {evt.maxSlots}</strong>
                    </span>

                    {isRegistered ? (
                      <span className="px-3.5 py-1.5 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Đã Đăng Ký
                      </span>
                    ) : (
                      <button
                        onClick={() => {
                          const res = registerForEvent(evt.id, currentUser?.id || 'doanvien_minh');
                          alert(res.message);
                        }}
                        disabled={isFull}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isFull
                            ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-500 text-white shadow-glow'
                        }`}
                      >
                        {isFull ? 'Vào Danh Sách Chờ' : 'Đăng Ký Tham Gia'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 3: CLASS RANKING & MY CLASS HIGHLIGHT ================= */}
      {activeTab === 'ranking' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-black text-white">VỊ THỨ CHI ĐOÀN CỦA BẠN</h3>
              <p className="text-xs text-slate-400">Tuần {activeWeek} • Điểm chuẩn: 1440đ</p>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-950 text-amber-300 border border-amber-800">
              {studentClass?.name}: Hạng #{studentClassScore?.rank || 3}
            </span>
          </div>

          <div className="space-y-1.5 max-h-[420px] overflow-y-auto pr-1">
            {scores.map(item => {
              const isMyClass = item.classId === studentClassId;
              return (
                <div
                  key={item.classId}
                  className={`p-3 rounded-2xl flex items-center justify-between text-xs transition-all ${
                    isMyClass
                      ? 'bg-gradient-to-r from-red-950/90 to-amber-950/90 border-2 border-red-500 text-white shadow-glow scale-[1.02]'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-7 text-center font-black ${isMyClass ? 'text-amber-300' : 'text-slate-400'}`}>
                      #{item.rank}
                    </span>
                    <div>
                      <p className="font-bold">{item.className} {isMyClass && '🌟 (Lớp bạn)'}</p>
                      <span className="text-[10px] text-slate-400">Khối {item.grade}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-black text-sm">{item.finalScore}đ</p>
                    <span className="text-[10px] text-rose-400">-{item.totalDeduction}đ</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= TAB 4: PERSONAL CONDUCT & POINT TIMELINE ================= */}
      {activeTab === 'history' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4">
          <div className="pb-3 border-b border-slate-800">
            <h3 className="text-sm font-black text-white">DÒNG THỜI GIAN ĐIỂM SỐ & MINH CHỨNG</h3>
            <p className="text-xs text-slate-400">Minh bạch tất cả lý do cộng/trừ điểm để cùng rút kinh nghiệm</p>
          </div>

          <div className="space-y-3">
            {/* Event Bonus */}
            {registeredEvents.map(evt => (
              <div key={evt.id} className="p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <span className="px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 font-bold text-[10px]">
                    + Điểm phong trào Đoàn
                  </span>
                  <p className="font-bold text-white">{evt.title}</p>
                  <p className="text-[11px] text-slate-400">{evt.startDate}</p>
                </div>
                <span className="font-black text-emerald-400 text-sm">+{evt.bonusPoints}đ</span>
              </div>
            ))}

            {/* Class/Personal Deductions */}
            {myClassVios.map(vio => (
              <div key={vio.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start justify-between text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 font-bold text-[10px] border border-rose-800">
                      - Trừ nề nếp
                    </span>
                    <span className="text-[10px] text-slate-400">{vio.day} • {vio.reportedAt}</span>
                  </div>
                  <p className="font-bold text-white">{vio.criterionName} (x{vio.quantity})</p>
                  {vio.note && <p className="text-[11px] text-slate-400 italic">"{vio.note}"</p>}
                  {vio.proofImages.length > 0 && (
                    <button
                      onClick={() => setViewingPhoto(vio.proofImages[0])}
                      className="text-[11px] text-amber-400 hover:underline flex items-center gap-1 pt-1"
                    >
                      <span>Xem ảnh minh chứng vi phạm</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
                <span className="font-black text-rose-400 text-sm">-{vio.pointsDeducted}đ</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal QR Code */}
      <QRCodeModal
        isOpen={isQRModalOpen}
        onClose={() => setIsQRModalOpen(false)}
        title="Thẻ Đoàn Viên Số"
        subtitle={`Chi đoàn ${studentClass?.name} • THPT Việt Đức`}
        qrValue={dynamicQrToken}
        studentName={currentUser?.name}
        className={studentClass?.name}
      />

      {/* Photo Lightbox */}
      {viewingPhoto && (
        <PhotoViewerModal
          isOpen={true}
          onClose={() => setViewingPhoto(null)}
          imageUrl={viewingPhoto}
          title="Minh chứng vi phạm nề nếp"
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

    </div>
  );
};
