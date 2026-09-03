import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle, 
  Calendar, 
  Eye, 
  ChevronRight, 
  Shield, 
  Clock, 
  Users, 
  Sparkles, 
  Lock, 
  LogIn, 
  LogOut,
  LayoutDashboard,
  Info,
  X,
  ExternalLink,
  Award,
  CheckCircle2,
  Sun,
  CloudSun,
  CloudRain,
  Droplets,
  Wind
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassWeeklyScore, NewsPost, DayOfWeek } from '../../types';
import { YouthUnionBadge } from '../common/YouthUnionBadge';

export const PublicPortal: React.FC = () => {
  const { 
    currentUser,
    setActiveView,
    logout,
    activeWeek, 
    setActiveWeek, 
    getWeeklyScores, 
    news, 
    duties, 
    zones,
    violations,
    login, 
    loginAsUser, 
    users,
    schoolSettings,
    activitySlides
  } = useApp();

  // Filters for leaderboard & media
  const [selectedGrade, setSelectedGrade] = useState<'ALL' | 10 | 11 | 12>('ALL');
  const [selectedClassModal, setSelectedClassModal] = useState<ClassWeeklyScore | null>(null);
  const [selectedArticleModal, setSelectedArticleModal] = useState<NewsPost | null>(null);
  const [dutyTab, setDutyTab] = useState<'today' | 'week'>('today');
  const [isWeeklyDutyModalOpen, setIsWeeklyDutyModalOpen] = useState(false);

  // Activity Photo Slider state
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isSlidePaused, setIsSlidePaused] = useState(false);
  const [selectedPhotoModal, setSelectedPhotoModal] = useState<{ url: string; title: string; subtitle?: string } | null>(null);

  const activeSlideList = (activitySlides || []).filter(s => s.isActive).sort((a, b) => a.order - b.order);

  // Auto-play slide effect
  useEffect(() => {
    if (activeSlideList.length <= 1 || isSlidePaused) return;
    const interval = setInterval(() => {
      setCurrentSlideIdx(prev => (prev + 1) % activeSlideList.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeSlideList.length, isSlidePaused]);

  const handleNextSlide = () => {
    setCurrentSlideIdx(prev => (prev + 1) % activeSlideList.length);
  };

  const handlePrevSlide = () => {
    setCurrentSlideIdx(prev => (prev - 1 + activeSlideList.length) % activeSlideList.length);
  };

  // Login form state
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Filter out hidden news & announcements
  const visibleNews = news.filter(n => !n.isHidden);
  const pinnedNews = visibleNews.filter(n => n.isPinned);

  // Get scores for active week
  const allScores = getWeeklyScores(activeWeek);
  const filteredScores = selectedGrade === 'ALL' 
    ? allScores 
    : allScores.filter(s => s.grade === selectedGrade);

  const top1 = filteredScores[0];
  const top2 = filteredScores[1];
  const top3 = filteredScores[2];
  const restScores = filteredScores.slice(3);

  // Handle Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    if (!loginUsername.trim()) {
      setLoginError('Vui lòng nhập tên tài khoản');
      return;
    }
    const success = login(loginUsername);
    if (!success) {
      setLoginError('Tài khoản hoặc mật khẩu không chính xác!');
    }
  };

  // Trigger celebratory confetti when clicking on 1st place
  const triggerCelebration = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  // Group duties for today vs week
  const weekDuties = duties.filter(d => d.weekNumber === activeWeek);
  const activeDutiesPool = weekDuties.length > 0 ? weekDuties : duties.filter(d => d.day === 'T2');
  const todayDuties = activeDutiesPool.filter(d => d.day === 'T2');
  const daysOfWeek: DayOfWeek[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 animate-fadeIn">
      
      {/* Top Banner Hero Image if Configured */}
      {schoolSettings.bannerTopImage && (
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 min-h-[13rem] sm:min-h-[15rem] md:h-60 relative group bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 flex items-center">
          <img 
            src={schoolSettings.bannerTopImage} 
            alt="Top Banner" 
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 contrast-105" 
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80';
            }}
          />
          {/* Subtle vignette gradient allowing background photo to be bright and vivid */}
          <div className="absolute inset-0 bg-gradient-to-t sm:bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-slate-950/20 sm:to-transparent pointer-events-none" />
          
          <div className="relative z-10 w-full p-4 sm:p-7 md:p-8 flex items-center">
            <div className="flex flex-row items-center gap-3.5 sm:gap-6 max-w-3xl">
              {/* Huy hiệu Đoàn Thanh Niên */}
              <div className="relative shrink-0 group-hover:scale-105 transition-transform duration-300">
                <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl p-1.5 bg-gradient-to-tr from-red-600 via-amber-500 to-emerald-600 shadow-glow border border-amber-400/60 flex items-center justify-center bg-slate-950/85 backdrop-blur-md">
                  <YouthUnionBadge src={schoolSettings.youthUnionLogoUrl} className="w-full h-full" />
                </div>
              </div>

              {/* Thông tin Đoàn trường */}
              <div className="space-y-1 sm:space-y-2">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-red-600/90 text-white text-[10px] sm:text-xs font-black uppercase tracking-wider border border-red-400/40 shadow-md backdrop-blur-sm">
                  <span>⭐</span>
                  <span className="truncate">{schoolSettings.youthUnionName}</span>
                </div>
                <h2 className="text-base sm:text-2xl md:text-3xl font-black text-white leading-tight drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
                  {schoolSettings.schoolName}
                </h2>
                <p className="text-amber-300 font-bold text-[11px] sm:text-sm drop-shadow-[0_2px_6px_rgba(0,0,0,0.9)] line-clamp-2">
                  "{schoolSettings.slogan}"
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pinned Urgent Announcement Banner */}
      {pinnedNews.map(pinned => (
        <div 
          key={pinned.id}
          onClick={() => setSelectedArticleModal(pinned)}
          className="bg-gradient-to-r from-red-950/90 via-red-900/80 to-amber-950/90 border-2 border-red-600/70 rounded-2xl p-4 sm:p-5 shadow-glow cursor-pointer hover:border-red-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        >
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-red-600 text-white shrink-0 mt-0.5 animate-pulse">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-white text-[10px] font-black uppercase tracking-wider ${
                  pinned.urgency === 'critical' ? 'bg-red-600 animate-pulse' : 'bg-amber-600'
                }`}>
                  {pinned.category === 'announcement' ? '📢 THÔNG BÁO CHỈ ĐẠO' : '⭐ TIN NỔI BẬT'}
                </span>
                <span className="text-xs text-red-200">{pinned.publishDate}</span>
              </div>
              <h3 className="font-black text-white text-sm sm:text-base mt-1 line-clamp-1">{pinned.title}</h3>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{pinned.excerpt}</p>
            </div>
          </div>
          <button className="shrink-0 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1">
            <span>Xem Toàn Văn</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}

      {/* Main 3-Column Grid Layout on Desktop / Stacked on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* ================= COLUMN 1 (LEFT 3.5 cols): PUBLIC LEADERBOARD ================= */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card">
            
            {/* Header & Filter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-black text-white">BẢNG XẾP HẠNG THI ĐUA</h2>
                  <p className="text-[11px] text-slate-400">Tuần {activeWeek} • Điểm Chuẩn: 1440đ</p>
                </div>
              </div>
            </div>

            {/* Grade Filter Tabs */}
            <div className="flex rounded-xl bg-slate-950 p-1 mb-5 border border-slate-800 text-xs">
              {(['ALL', 10, 11, 12] as const).map(grade => (
                <button
                  key={grade}
                  onClick={() => setSelectedGrade(grade)}
                  className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center ${
                    selectedGrade === grade
                      ? 'bg-red-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {grade === 'ALL' ? 'Toàn trường' : `Khối ${grade}`}
                </button>
              ))}
            </div>

            {/* Top 3 Podium Display */}
            {filteredScores.length >= 3 && (
              <div className="grid grid-cols-3 gap-2 items-end mb-6 pt-4 pb-2">
                {/* 2nd Place */}
                {top2 && (
                  <div 
                    onClick={() => setSelectedClassModal(top2)}
                    className="podium-2nd rounded-2xl p-2.5 text-center cursor-pointer hover:scale-105 transition-all flex flex-col items-center justify-between min-h-[140px]"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-300 text-slate-900 font-black text-sm flex items-center justify-center shadow-md border-2 border-slate-200">
                      🥈 2
                    </div>
                    <div className="my-1">
                      <p className="font-extrabold text-white text-xs">{top2.className}</p>
                      <p className="font-black text-slate-200 text-sm">{top2.finalScore}</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-bold">
                      {top2.rating}
                    </span>
                  </div>
                )}

                {/* 1st Place */}
                {top1 && (
                  <div 
                    onClick={() => { triggerCelebration(); setSelectedClassModal(top1); }}
                    className="podium-1st rounded-2xl p-3 text-center cursor-pointer hover:scale-105 transition-all flex flex-col items-center justify-between min-h-[170px] relative overflow-hidden"
                  >
                    <div className="absolute top-1 right-1 text-amber-400 animate-spin">✨</div>
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-base flex items-center justify-center shadow-glow-gold border-2 border-amber-300">
                      🥇 1
                    </div>
                    <div className="my-1">
                      <div className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold">
                        <span>🏆 Quán Quân</span>
                      </div>
                      <p className="font-black text-white text-sm">{top1.className}</p>
                      <p className="font-black text-amber-300 text-base">{top1.finalScore}</p>
                    </div>
                    <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-200 border border-amber-700 font-extrabold">
                      {top1.rating}
                    </span>
                  </div>
                )}

                {/* 3rd Place */}
                {top3 && (
                  <div 
                    onClick={() => setSelectedClassModal(top3)}
                    className="podium-3rd rounded-2xl p-2.5 text-center cursor-pointer hover:scale-105 transition-all flex flex-col items-center justify-between min-h-[130px]"
                  >
                    <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-sm flex items-center justify-center shadow-md border-2 border-amber-600">
                      🥉 3
                    </div>
                    <div className="my-1">
                      <p className="font-extrabold text-white text-xs">{top3.className}</p>
                      <p className="font-black text-amber-200 text-sm">{top3.finalScore}</p>
                    </div>
                    <span className="text-[9px] px-2 py-0.5 rounded-full bg-amber-950 text-amber-300 font-bold">
                      {top3.rating}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* List from #4 to #18 */}
            <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
              {restScores.map(item => (
                <div
                  key={item.classId}
                  onClick={() => setSelectedClassModal(item)}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 flex items-center justify-between cursor-pointer transition-all hover:translate-x-1"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center font-bold text-xs text-slate-400">
                      #{item.rank}
                    </span>
                    <div>
                      <p className="font-bold text-white text-xs">{item.className}</p>
                      <span className="text-[10px] text-slate-500">Khối {item.grade}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Trend Icon */}
                    {item.trend === 'up' && (
                      <span className="flex items-center text-[11px] text-emerald-400 font-bold gap-0.5" title="Tăng hạng so với tuần trước">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>↑</span>
                      </span>
                    )}
                    {item.trend === 'down' && (
                      <span className="flex items-center text-[11px] text-rose-400 font-bold gap-0.5" title="Tụt hạng so với tuần trước">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>↓</span>
                      </span>
                    )}
                    {item.trend === 'same' && (
                      <span className="flex items-center text-[11px] text-slate-500 font-bold" title="Giữ nguyên thứ hạng">
                        <Minus className="w-3.5 h-3.5" />
                      </span>
                    )}

                    <div className="text-right min-w-[55px]">
                      <p className="font-black text-white text-xs">{item.finalScore}đ</p>
                      <p className="text-[9px] text-slate-400">-{item.totalDeduction}đ</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-400">
                🔒 Dữ liệu công khai chỉ hiển thị tổng điểm tập thể để bảo vệ quyền riêng tư học sinh.
              </p>
            </div>
          </div>

          {/* ================= ACTIVITY PHOTO SLIDESHOW WIDGET ================= */}
          {activeSlideList.length > 0 && (
            <div 
              className="glass-panel rounded-3xl p-4 border border-slate-800 shadow-card space-y-3 relative overflow-hidden group"
              onMouseEnter={() => setIsSlidePaused(true)}
              onMouseLeave={() => setIsSlidePaused(false)}
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-xl bg-red-600/20 text-red-400 border border-red-600/30 text-xs">
                    📸
                  </span>
                  <div>
                    <h4 className="text-xs font-black text-white tracking-wide uppercase">ẢNH HOẠT ĐỘNG PHONG TRÀO</h4>
                    <p className="text-[10px] text-slate-400">Khoảnh khắc thanh niên Quang Trung</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-slate-950 text-slate-300 border border-slate-800">
                    {currentSlideIdx + 1}/{activeSlideList.length}
                  </span>
                </div>
              </div>

              {/* Main Slide Carousel Frame */}
              <div className="relative w-full h-52 sm:h-56 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner group/slide">
                {activeSlideList.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                      idx === currentSlideIdx ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                    }`}
                  >
                    <img
                      src={slide.imageUrl}
                      alt={slide.title}
                      loading="lazy"
                      decoding="async"
                      className="w-full h-full object-cover cursor-pointer transition-transform duration-700 hover:scale-105 bg-slate-900"
                      onClick={() => setSelectedPhotoModal({ url: slide.imageUrl, title: slide.title, subtitle: slide.subtitle })}
                    />
                    
                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-3.5 space-y-1">
                      <div className="flex items-center gap-2">
                        {slide.tag && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-red-600 text-white shadow-sm">
                            {slide.tag}
                          </span>
                        )}
                        {slide.date && (
                          <span className="text-[10px] text-slate-300 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {slide.date}
                          </span>
                        )}
                      </div>

                      <h5 
                        className="text-xs sm:text-sm font-extrabold text-white line-clamp-2 cursor-pointer hover:text-red-300 transition-colors"
                        onClick={() => setSelectedPhotoModal({ url: slide.imageUrl, title: slide.title, subtitle: slide.subtitle })}
                      >
                        {slide.title}
                      </h5>

                      {slide.subtitle && (
                        <p className="text-[11px] text-slate-300 line-clamp-1">
                          {slide.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Prev / Next Navigation Arrows */}
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handlePrevSlide(); }}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-red-600 text-white border border-slate-700/80 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-95 cursor-pointer"
                  title="Ảnh trước"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/70 hover:bg-red-600 text-white border border-slate-700/80 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all shadow-lg active:scale-95 cursor-pointer"
                  title="Ảnh tiếp theo"
                >
                  ›
                </button>
              </div>

              {/* Slide Dots Indicator */}
              <div className="flex items-center justify-center gap-1.5 pt-1">
                {activeSlideList.map((_, dotIdx) => (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => setCurrentSlideIdx(dotIdx)}
                    className={`h-1.5 rounded-full transition-all ${
                      dotIdx === currentSlideIdx 
                        ? 'w-6 bg-red-500 shadow-glow' 
                        : 'w-2 bg-slate-700 hover:bg-slate-500'
                    }`}
                    title={`Chuyển đến ảnh ${dotIdx + 1}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ================= COLUMN 2 (MIDDLE 5.5 cols): NEWSFEED & CỜ ĐỎ DUTY ================= */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* CỜ ĐỎ DUTY SCHEDULE WIDGET */}
          <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-600/30">
                  🛡️
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">ĐỘI CỜ ĐỎ TRỰC BAN</h3>
                  <p className="text-[11px] text-slate-400">Minh bạch nhân sự giám sát nề nếp</p>
                </div>
              </div>

              {/* Toggle Tab */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                <button
                  onClick={() => setDutyTab('today')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all ${
                    dutyTab === 'today' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Hôm nay
                </button>
                <button
                  onClick={() => setIsWeeklyDutyModalOpen(true)}
                  className="px-3 py-1 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1"
                >
                  <span>Cả tuần</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Today Duty Mini Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {todayDuties.map(duty => (
                <div
                  key={duty.id}
                  className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-amber-400 border border-slate-700">
                      {duty.zone}
                    </span>
                    {duty.isLiveNow && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                        Đang làm việc
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">🛡️</span>
                    <div>
                      <p className="font-bold text-white text-xs">{duty.auditorName}</p>
                      <p className="text-[10px] text-slate-400">Chi đoàn {duty.auditorClass} • {duty.shiftTime.split('&')[0]}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* NEWSFEED & ANNOUNCEMENTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-600/30">
                  📰
                </span>
                <div>
                  <h3 className="text-sm sm:text-base font-black text-white">
                    BẢN TIN & THÔNG BÁO ĐOÀN
                  </h3>
                  <p className="text-[11px] text-slate-400">Thông tin cập nhật chính thức từ BCH Đoàn</p>
                </div>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-blue-400">
                {visibleNews.length} bài viết
              </span>
            </div>

            {/* Rendered Media Cards */}
            <div className="space-y-3.5">
              {visibleNews.map(article => {
                const isAnn = article.category === 'announcement' || article.id.startsWith('ann-');
                return (
                  <div
                    key={article.id}
                    onClick={() => setSelectedArticleModal(article)}
                    className={`glass-panel glass-panel-hover rounded-2xl p-4 border cursor-pointer group flex flex-col sm:flex-row gap-4 items-start transition-all ${
                      isAnn 
                        ? 'border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20' 
                        : 'border-slate-800'
                    }`}
                  >
                    <div className="w-full sm:w-36 h-28 relative shrink-0 rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white shadow ${
                        isAnn ? 'bg-amber-600' : 'bg-blue-600'
                      }`}>
                        {isAnn ? '📢 THÔNG BÁO' : '📰 BẢN TIN'}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        {isAnn && article.urgency && article.urgency !== 'normal' && (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                            article.urgency === 'critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-slate-950 font-black'
                          }`}>
                            {article.urgency === 'critical' ? '🔥 HỎA TỐC' : '⚠️ KHẨN'}
                          </span>
                        )}
                        {article.tags.map(tag => (
                          <span key={tag} className="text-[10px] font-bold text-red-400 bg-red-950/60 px-2 py-0.5 rounded border border-red-900/50">
                            {tag}
                          </span>
                        ))}
                        <span className="text-[11px] text-slate-400">• {article.publishDate}</span>
                      </div>

                      <h4 className="font-bold text-white text-sm group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h4>

                      <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>

                      <div className="pt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span>Bởi: <strong className="text-slate-200">{article.author}</strong></span>
                          {article.attachments && article.attachments.length > 0 && (
                            <span className="px-1.5 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[10px] font-bold flex items-center gap-1">
                              📎 {article.attachments.length} file đính kèm
                            </span>
                          )}
                        </div>
                        <span className="text-red-400 font-semibold group-hover:underline flex items-center gap-1 shrink-0">
                          Xem chi tiết <ChevronRight className="w-3 h-3" />
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}

              {visibleNews.length === 0 && (
                <div className="text-center py-10 glass-panel rounded-2xl border border-slate-800">
                  <p className="text-slate-400 text-sm">Chưa có bài viết hoặc thông báo nào trong mục này.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3 (RIGHT 3 cols): STICKY LOGIN FORM ================= */}
        <div className="lg:col-span-3 space-y-4">
          <div className="sticky top-24 space-y-4">
            
            {/* User Profile & Launchpad Card (If logged in) OR Login Form (If guest) */}
            {currentUser ? (
              <div className="glass-panel rounded-3xl p-5 border border-red-500/40 shadow-glow bg-gradient-to-b from-red-950/30 via-slate-900 to-slate-950 space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                  <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-600/30">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">TÀI KHOẢN ĐÃ ĐĂNG NHẬP</h3>
                    <p className="text-[11px] text-slate-400">Phiên làm việc hiện tại của bạn</p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-red-600 to-amber-500 text-white font-black text-base flex items-center justify-center shadow-md shrink-0">
                    {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      <span className="text-[10px] font-extrabold text-emerald-400 uppercase tracking-wider">Đang hoạt động</span>
                    </div>
                    <h4 className="font-bold text-white text-xs sm:text-sm truncate">{currentUser.name}</h4>
                    <p className="text-[11px] text-amber-400 font-semibold truncate">
                      {currentUser.roleTitle || (currentUser.role === 'admin' ? 'Bí thư Đoàn Trường / Quản trị' : currentUser.role === 'manager' ? `GVCN Lớp ${currentUser.classId}` : currentUser.role === 'auditor' ? 'Cán bộ Đội Cờ Đỏ' : currentUser.role === 'youth_secretary' ? `Bí thư Chi đoàn ${currentUser.classId}` : 'Đoàn viên / Học sinh')}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    onClick={() => {
                      if (currentUser.role === 'admin') setActiveView('admin');
                      else if (currentUser.role === 'manager') setActiveView('manager');
                      else if (currentUser.role === 'auditor') setActiveView('auditor');
                      else if (currentUser.role === 'youth_secretary') setActiveView('secretary');
                      else setActiveView('student');
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95"
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    <span>
                      {currentUser.role === 'admin' ? 'Vào Bảng Điều Hành Quản Trị' : currentUser.role === 'manager' ? 'Vào Cổng Giáo Viên Chủ Nhiệm' : currentUser.role === 'auditor' ? 'Vào Bảng Chấm Điểm Cờ Đỏ' : 'Vào Không Gian Chi Đoàn'}
                    </span>
                  </button>

                  <button
                    onClick={logout}
                    className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-800 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5 text-rose-400" />
                    <span>Đăng Xuất Khỏi Hệ Thống</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Login Card */
              <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card">
                <div className="flex items-center gap-2 mb-3 pb-3 border-b border-slate-800">
                  <div className="p-2 bg-red-600/20 text-red-400 rounded-xl border border-red-600/30">
                    <LogIn className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">ĐĂNG NHẬP HỆ THỐNG</h3>
                    <p className="text-[11px] text-slate-400">Đăng nhập tài khoản & mật khẩu</p>
                  </div>
                </div>

                <form onSubmit={handleLoginSubmit} className="space-y-3">
                  {loginError && (
                    <div className="p-2.5 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Tên Đăng Nhập / Mã Tài Khoản</label>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="vd: admin, gvcn_10_1, codo_nam..."
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition-colors font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Mật Khẩu Truy Cập</label>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Mặc định: 123456@Password"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition-colors font-mono"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-glow transition-all active:scale-95"
                  >
                    Xác Thực & Vào Hệ Thống
                  </button>
                </form>
              </div>
            )}

            {/* Quick Infobox */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-xs space-y-2">
              <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                <Info className="w-4 h-4" />
                <span>Quy định nề nếp tuần:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-400 list-disc list-inside">
                <li>Khóa sổ chấm điểm: 17h00 Thứ 7 hàng tuần</li>
                <li>Thời hạn gửi phúc khảo của GVCN: 24h</li>
                <li>Học sinh quét mã QR nhận điểm phong trào</li>
              </ul>
            </div>

            {/* WEATHER WIDGET (ĐÔNG GIANG - ĐÀ NẴNG) */}
            <div className="glass-panel rounded-3xl p-5 border border-sky-500/20 bg-gradient-to-br from-slate-900 via-sky-950/20 to-slate-950 shadow-card space-y-3.5 relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Header */}
              <div className="flex items-center justify-between pb-2.5 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    <CloudSun className="w-4 h-4 animate-pulse" />
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white tracking-wide">THỜI TIẾT HÔM NAY</h4>
                    <p className="text-[10px] text-sky-400 font-medium">Đông Giang, TP Đà Nẵng</p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  Trời đẹp
                </span>
              </div>

              {/* Main Weather Display */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
                    ☀️
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-black text-white">29°C</span>
                      <span className="text-[11px] text-slate-400 font-medium">/ 32°C</span>
                    </div>
                    <p className="text-xs font-bold text-sky-300">Nắng nhẹ, mây thoáng</p>
                  </div>
                </div>
                <div className="text-right text-[10px] text-slate-400 space-y-0.5">
                  <p>Cảm nhận: <span className="font-bold text-slate-200">31°C</span></p>
                  <p>Chỉ số UV: <span className="font-bold text-amber-400">5 (TB)</span></p>
                </div>
              </div>

              {/* Weather Stats Grid */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 text-sky-400 text-[10px] font-bold mb-0.5">
                    <Droplets className="w-3 h-3" />
                    <span>Độ ẩm</span>
                  </div>
                  <span className="text-xs font-black text-white">76%</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 text-teal-400 text-[10px] font-bold mb-0.5">
                    <Wind className="w-3 h-3" />
                    <span>Gió ĐN</span>
                  </div>
                  <span className="text-xs font-black text-white">12 km/h</span>
                </div>

                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <div className="flex items-center justify-center gap-1 text-indigo-400 text-[10px] font-bold mb-0.5">
                    <CloudRain className="w-3 h-3" />
                    <span>Mưa</span>
                  </div>
                  <span className="text-xs font-black text-white">10%</span>
                </div>
              </div>

              {/* 3-Period Micro Forecast */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px]">
                <div className="text-center">
                  <span className="text-slate-400 block font-medium">Sáng</span>
                  <span className="font-bold text-amber-300">27°C ☀️</span>
                </div>
                <div className="h-6 w-px bg-slate-800"></div>
                <div className="text-center">
                  <span className="text-slate-400 block font-medium">Chiều</span>
                  <span className="font-bold text-sky-300">31°C ⛅</span>
                </div>
                <div className="h-6 w-px bg-slate-800"></div>
                <div className="text-center">
                  <span className="text-slate-400 block font-medium">Tối</span>
                  <span className="font-bold text-indigo-300">25°C 🌙</span>
                </div>
              </div>

              {/* Youth Union Context Note */}
              <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/40 text-[10px] text-sky-200/90 leading-relaxed flex items-start gap-2">
                <span className="text-xs mt-0.5">✨</span>
                <span>Thời tiết thuận lợi cho các hoạt động chào cờ, thể dục & nhiệm vụ trực tuần của Đội Cờ Đỏ.</span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* ================= MODAL: CLASS SCORE BREAKDOWN (READ-ONLY) ================= */}
      {selectedClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-red-600/20 border border-red-500/30 text-red-400 font-black text-lg flex items-center justify-center">
                  #{selectedClassModal.rank}
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{selectedClassModal.className}</h3>
                  <p className="text-xs text-slate-400">Chi tiết cơ cấu điểm Tuần {selectedClassModal.weekNumber}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClassModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Score Overview Badges */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800">
                <p className="text-[10px] text-slate-400 uppercase font-bold">Điểm Chuẩn</p>
                <p className="text-base font-black text-white">1440</p>
              </div>
              <div className="p-3 bg-rose-950/40 rounded-2xl border border-rose-800/40">
                <p className="text-[10px] text-rose-300 uppercase font-bold">Tổng Trừ</p>
                <p className="text-base font-black text-rose-400">-{selectedClassModal.totalDeduction}</p>
              </div>
              <div className="p-3 bg-amber-950/40 rounded-2xl border border-amber-800/40">
                <p className="text-[10px] text-amber-300 uppercase font-bold">Tổng Điểm</p>
                <p className="text-base font-black text-amber-300">{selectedClassModal.finalScore}</p>
              </div>
            </div>

            {/* Anonymous Category Breakdown (Privacy-by-Design) */}
            {selectedClassModal.totalDeduction > 0 && (() => {
              const classVios = violations.filter(v => 
                v.classId === selectedClassModal.classId && 
                v.weekNumber === selectedClassModal.weekNumber &&
                v.status !== 'approved_appeal' && 
                v.status !== 'cancelled'
              );
              const groupMap: Record<string, number> = {
                'Chuyên cần': 0,
                'Vệ sinh': 0,
                'Nề nếp tự quản': 0,
                'Tác phong': 0
              };
              classVios.forEach(v => {
                if (v.groupName?.includes('Chuyên cần') || v.criterionId?.startsWith('1.')) groupMap['Chuyên cần'] += v.pointsDeducted;
                else if (v.groupName?.includes('Vệ sinh') || v.criterionId?.startsWith('2.')) groupMap['Vệ sinh'] += v.pointsDeducted;
                else if (v.groupName?.includes('Tự quản') || v.groupName?.includes('Nề nếp') || v.criterionId?.startsWith('3.')) groupMap['Nề nếp tự quản'] += v.pointsDeducted;
                else if (v.groupName?.includes('Tác phong') || v.criterionId?.startsWith('4.')) groupMap['Tác phong'] += v.pointsDeducted;
                else groupMap['Nề nếp tự quản'] += v.pointsDeducted;
              });

              return (
                <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2.5">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <span className="flex items-center gap-1.5">
                      <span>📊</span>
                      <span>Phân Bổ Điểm Trừ Theo Nhóm Tiêu Chí (Ẩn danh):</span>
                    </span>
                    <span className="text-[10px] text-amber-400 font-normal">Tổng trừ: -{selectedClassModal.totalDeduction}đ</span>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(groupMap).map(([grp, deduct]) => {
                      const pct = selectedClassModal.totalDeduction > 0 ? Math.round((deduct / selectedClassModal.totalDeduction) * 100) : 0;
                      return (
                        <div key={grp} className="space-y-1">
                          <div className="flex justify-between text-[11px]">
                            <span className="text-slate-400 font-medium">{grp}</span>
                            <span className="font-mono text-rose-300 font-bold">{deduct > 0 ? `-${deduct}đ (${pct}%)` : '0đ (0%)'}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                grp === 'Chuyên cần' ? 'bg-amber-500' :
                                grp === 'Vệ sinh' ? 'bg-emerald-500' :
                                grp === 'Nề nếp tự quản' ? 'bg-blue-500' : 'bg-purple-500'
                              }`}
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Daily Scores Breakdown Table */}
            <div>
              <p className="text-xs font-bold text-slate-300 mb-2">Điểm số từng ngày (T2 - T7):</p>
              <div className="grid grid-cols-6 gap-1.5 text-center text-xs">
                {(['T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as DayOfWeek[]).map(d => (
                  <div key={d} className="p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <p className="font-bold text-slate-400 text-[10px]">{d}</p>
                    <p className="font-black text-white text-xs mt-0.5">{selectedClassModal.dailyScores[d].final}</p>
                    {selectedClassModal.dailyScores[d].deduction > 0 && (
                      <p className="text-[9px] text-rose-400 font-mono">-{selectedClassModal.dailyScores[d].deduction}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>🔒 Dữ liệu công khai chỉ hiển thị tổng điểm tập thể để bảo vệ quyền riêng tư học sinh. GVCN vui lòng đăng nhập để xem danh sách chi tiết.</span>
            </div>

            <button
              onClick={() => setSelectedClassModal(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
            >
              Đóng
            </button>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEWS ARTICLE DETAIL ================= */}
      {selectedArticleModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-2xl w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-red-600 text-white text-xs font-black">
                  TIN ĐOÀN TRƯỜNG
                </span>
                <span className="text-xs text-slate-400">{selectedArticleModal.publishDate}</span>
              </div>
              <button
                onClick={() => setSelectedArticleModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-white leading-snug">
              {selectedArticleModal.title}
            </h2>

            <div className="flex items-center gap-2 text-xs text-slate-400 pb-2">
              <span>Đăng bởi: <strong className="text-slate-200">{selectedArticleModal.author}</strong> ({selectedArticleModal.authorRole})</span>
              <span>•</span>
              <span>{selectedArticleModal.views} lượt xem</span>
            </div>

            <img
              src={selectedArticleModal.thumbnail}
              alt={selectedArticleModal.title}
              className="w-full h-64 object-cover rounded-2xl border border-slate-700 shadow-md"
            />

            <div className="text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line bg-slate-900/60 p-4 rounded-2xl border border-slate-800/80">
              {selectedArticleModal.content}
            </div>

            {/* Attachments */}
            {selectedArticleModal.attachments && selectedArticleModal.attachments.length > 0 && (
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📎</span>
                  <span>Tài Liệu & File Đính Kèm ({selectedArticleModal.attachments.length}):</span>
                </p>
                <div className="space-y-1.5">
                  {selectedArticleModal.attachments.map((file, idx) => (
                    <a
                      key={idx}
                      href={file.url}
                      download={file.name}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-800 text-xs text-blue-400 hover:text-blue-300 transition-colors"
                    >
                      <span className="font-bold flex items-center gap-2">
                        <span>📄</span>
                        <span>{file.name}</span>
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                        {file.size && <span>{file.size}</span>}
                        <span>⬇️ Tải về</span>
                      </span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="flex flex-wrap gap-1.5 pt-2">
              {selectedArticleModal.tags.map(t => (
                <span key={t} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-amber-300 border border-slate-700">
                  {t}
                </span>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedArticleModal(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: FULL WEEKLY CỜ ĐỎ DUTY SCHEDULE ================= */}
      {isWeeklyDutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-4xl w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600 text-white font-bold">🛡️</span>
                <div>
                  <h3 className="text-base font-black text-white">LỊCH TRỰC ĐỘI CỜ ĐỎ TOÀN TRƯỜNG</h3>
                  <p className="text-xs text-slate-400">Phân công giám sát nề nếp từ Thứ 2 đến Thứ 7 (Tuần {activeWeek})</p>
                </div>
              </div>
              <button
                onClick={() => setIsWeeklyDutyModalOpen(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Schedule Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                    <th className="p-3 font-bold">Khu Vực Trực</th>
                    {daysOfWeek.map(d => (
                      <th key={d} className={`p-3 font-bold text-center ${d === 'T2' ? 'bg-red-950/40 text-red-300' : ''}`}>
                        {d} {d === 'T2' && <span className="text-[10px] block font-normal">(Hôm nay)</span>}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(zones && zones.length > 0 ? zones.map(z => z.name) : ['Khối 10', 'Khối 11', 'Khối 12', 'Khu Căn Tin & Nhà Đa Năng']).map((zoneName: string) => (
                    <tr key={zoneName} className="hover:bg-slate-800/40">
                      <td className="p-3 font-bold text-white bg-slate-900/60 whitespace-nowrap">
                        {zoneName}
                      </td>
                      {daysOfWeek.map(d => {
                        const match = duties.find(duty => duty.weekNumber === activeWeek && duty.day === d && duty.zone === zoneName) ||
                                      duties.find(duty => duty.day === d && duty.zone === zoneName);
                        return (
                          <td key={d} className={`p-2.5 text-center ${d === 'T2' ? 'bg-red-950/20' : ''}`}>
                            {match ? (
                              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800">
                                <p className="font-bold text-white text-[11px]">{match.auditorName}</p>
                                <span className="text-[10px] text-amber-400">({match.auditorClass})</span>
                              </div>
                            ) : (
                              <span className="text-slate-600 text-xs">-</span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsWeeklyDutyModalOpen(false)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Đóng Lịch Trực
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: FULL PHOTO VIEWER ================= */}
      {selectedPhotoModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fadeIn"
          onClick={() => setSelectedPhotoModal(null)}
        >
          <div 
            className="glass-modal max-w-3xl w-full rounded-3xl p-4 border border-slate-700 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-white">{selectedPhotoModal.title}</h4>
                {selectedPhotoModal.subtitle && (
                  <p className="text-xs text-slate-400">{selectedPhotoModal.subtitle}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedPhotoModal(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="w-full max-h-[70vh] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 flex items-center justify-center">
              <img
                src={selectedPhotoModal.url}
                alt={selectedPhotoModal.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

