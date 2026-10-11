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
  KeyRound,
  Info,
  X,
  ExternalLink,
  Award,
  CheckCircle2,
  Sun,
  CloudSun,
  CloudRain,
  Droplets,
  Wind,
  FileText,
  Download,
  Folder,
  Copy,
  Search,
  File,
  Star
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { ClassWeeklyScore, NewsPost, DayOfWeek, DocumentFile } from '../../types';
import { YouthUnionBadge } from '../common/YouthUnionBadge';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { RichTextViewer } from '../common/RichTextViewer';
import { DocumentViewerModal } from '../common/DocumentViewerModal';

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
    activitySlides,
    documentFolders,
    documentFiles,
    incrementDocumentDownloads,
    incrementDocumentViews
  } = useApp();

  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

  // Document repository state
  const [selectedDocModal, setSelectedDocModal] = useState<DocumentFile | null>(null);
  const [publicDocSearch, setPublicDocSearch] = useState<string>('');
  const [publicDocFolder, setPublicDocFolder] = useState<string>('ALL');
  const [publicDocCategory, setPublicDocCategory] = useState<string>('ALL');

  // Filters for leaderboard & media
  const [selectedGrade, setSelectedGrade] = useState<'ALL' | 10 | 11 | 12>('ALL');
  const [selectedClassModal, setSelectedClassModal] = useState<ClassWeeklyScore | null>(null);
  const [selectedArticleModal, setSelectedArticleModal] = useState<NewsPost | null>(null);
  const [dutyTab, setDutyTab] = useState<'today' | 'week'>('today');
  const [isWeeklyDutyModalOpen, setIsWeeklyDutyModalOpen] = useState(false);
  const [dutyModalSession, setDutyModalSession] = useState<'ALL' | 'Sáng' | 'Chiều'>('ALL');
  const [dutyModalSearch, setDutyModalSearch] = useState<string>('');
  const [dutyModalDay, setDutyModalDay] = useState<'ALL' | DayOfWeek>('ALL');

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

  // Pinned Announcement state with auto-rotation
  const [currentPinnedIdx, setCurrentPinnedIdx] = useState(0);
  const [isPinnedPaused, setIsPinnedPaused] = useState(false);

  const [facebookViewMode, setFacebookViewMode] = useState<'grid' | 'feed'>('grid');

  const facebookNewsList = visibleNews.filter(n => 
    n.sourcePlatform === 'facebook' || 
    n.sourceUrl?.includes('facebook.com') || 
    (Array.isArray(n.tags) && n.tags.some(t => t.toLowerCase().includes('facebook')))
  );

  const facebookNewsCount = facebookNewsList.length;
  const filteredNewsList = facebookNewsList.length > 0 ? facebookNewsList : visibleNews;

  useEffect(() => {
    if (pinnedNews.length <= 1 || isPinnedPaused) return;
    const timer = setInterval(() => {
      setCurrentPinnedIdx(prev => (prev + 1) % pinnedNews.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [pinnedNews.length, isPinnedPaused]);

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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fadeIn">
      
      {/* Top Banner Hero Image if Configured */}
      {schoolSettings.bannerTopImage && (
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 min-h-[12rem] sm:min-h-[15rem] md:h-60 relative group bg-gradient-to-r from-red-950 via-slate-900 to-indigo-950 flex items-center">
          <img 
            src={schoolSettings.bannerTopImage} 
            alt="Top Banner" 
            loading="eager"
            // @ts-ignore
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 brightness-95 contrast-105" 
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== window.location.origin + '/brand/banner_top.svg') {
                target.src = '/brand/banner_top.svg';
              }
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

      {/* ================= ROW 1: TOP ANNOUNCEMENTS (LEFT) + ACCOUNT / LOGIN (RIGHT) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        
        {/* Left: Pinned Urgent Announcement Hub */}
        <div className="lg:col-span-8 xl:col-span-9">
          {pinnedNews.length > 0 ? (
            <div
              className="glass-panel rounded-2xl p-4 sm:p-5 border-2 border-red-600/70 bg-gradient-to-r from-red-950/95 via-slate-900/95 to-amber-950/90 shadow-glow relative overflow-hidden group transition-all h-full flex flex-col justify-center"
              onMouseEnter={() => setIsPinnedPaused(true)}
              onMouseLeave={() => setIsPinnedPaused(false)}
            >
              {/* Header bar of announcement hub */}
              <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-red-800/40">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-red-600 text-white animate-pulse text-xs">
                    <AlertCircle className="w-4 h-4" />
                  </span>
                  <h3 className="text-xs sm:text-sm font-black text-white tracking-wide uppercase flex items-center gap-1.5">
                    <span>THÔNG BÁO CHỈ ĐẠO & CÔNG VĂN</span>
                    <span className="px-2 py-0.2 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-sm">
                      {pinnedNews.length} tin
                    </span>
                  </h3>
                </div>

                {/* Prev / Next controls and indicator pills */}
                {pinnedNews.length > 1 && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-1 mr-1">
                      {pinnedNews.map((_, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentPinnedIdx(idx)}
                          className={`h-1.5 rounded-full transition-all cursor-pointer ${
                            idx === currentPinnedIdx ? 'w-5 bg-amber-400 shadow-glow' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                          }`}
                          title={`Chuyển đến thông báo ${idx + 1}`}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={() => setCurrentPinnedIdx(prev => (prev - 1 + pinnedNews.length) % pinnedNews.length)}
                      className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-red-600 text-white border border-slate-700 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                      title="Thông báo trước"
                    >
                      ‹
                    </button>
                    <span className="text-[10px] font-mono text-slate-400 font-bold px-1">
                      {currentPinnedIdx + 1}/{pinnedNews.length}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentPinnedIdx(prev => (prev + 1) % pinnedNews.length)}
                      className="w-6 h-6 rounded-lg bg-slate-900 hover:bg-red-600 text-white border border-slate-700 flex items-center justify-center text-xs font-bold transition-all cursor-pointer"
                      title="Thông báo kế tiếp"
                    >
                      ›
                    </button>
                  </div>
                )}
              </div>

              {/* Active Announcement Content */}
              {(() => {
                const activePinned = pinnedNews[currentPinnedIdx] || pinnedNews[0];
                if (!activePinned) return null;
                return (
                  <div
                    onClick={() => setSelectedArticleModal(activePinned)}
                    className="cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group/item"
                  >
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-white text-[10px] font-black uppercase tracking-wider ${
                          activePinned.urgency === 'critical' ? 'bg-red-600 animate-pulse' : 'bg-amber-600'
                        }`}>
                          {activePinned.category === 'announcement' ? '📢 THÔNG BÁO CHỈ ĐẠO' : '⭐ TIN NỔI BẬT'}
                        </span>
                        <span className="text-xs text-red-200/90 font-mono">{activePinned.publishDate}</span>
                        {activePinned.author && (
                          <span className="text-[11px] text-slate-400 hidden md:inline">• {activePinned.author}</span>
                        )}
                      </div>
                      <h4 className="font-black text-white text-sm sm:text-base group-hover/item:text-amber-300 transition-colors line-clamp-1">
                        {activePinned.title}
                      </h4>
                      <p className="text-xs text-slate-300 line-clamp-1 leading-relaxed">
                        {activePinned.excerpt}
                      </p>
                    </div>

                    <button
                      type="button"
                      className="shrink-0 px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-md cursor-pointer group-hover/item:scale-105"
                    >
                      <span>Xem Toàn Văn</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })()}
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 bg-gradient-to-r from-red-950/40 via-slate-900 to-indigo-950/40 flex items-center gap-4 h-full">
              <div className="p-3 rounded-2xl bg-red-600/20 text-red-400 border border-red-600/30 text-2xl shrink-0">
                🏛️
              </div>
              <div className="space-y-1">
                <h3 className="text-sm sm:text-base font-black text-white">
                  CỔNG THÔNG TIN ĐIỆN TỬ - {schoolSettings.schoolName?.toUpperCase()}
                </h3>
                <p className="text-xs text-slate-300">
                  Hệ thống quản lý nề nếp, thi đua học đường và phong trào đoàn viên thanh niên trực tuyến.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: User Profile Card (if logged in) OR Login Form (if guest) */}
        <div className="lg:col-span-4 xl:col-span-3">
          {currentUser ? (
            <div className="glass-panel rounded-2xl p-4 border border-red-500/40 shadow-glow bg-gradient-to-b from-red-950/30 via-slate-900 to-slate-950 space-y-3 h-full flex flex-col justify-between">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-emerald-600/20 text-emerald-400 rounded-lg border border-emerald-600/30">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black text-white">TÀI KHOẢN ĐÃ ĐĂNG NHẬP</h3>
                    <p className="text-[10px] text-slate-400">Phiên làm việc hiện tại</p>
                  </div>
                </div>
                <button
                  onClick={logout}
                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 text-[10px] font-bold border border-slate-800 transition-colors flex items-center gap-1"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3 h-3 text-rose-400" />
                  <span>Đăng xuất</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5 p-2 bg-slate-950 rounded-xl border border-slate-800">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 to-amber-500 text-white font-black text-sm flex items-center justify-center shadow-md shrink-0">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-white text-xs truncate">{currentUser.name}</h4>
                  <p className="text-[10px] text-amber-400 font-semibold truncate">
                    {currentUser.roleTitle || (currentUser.role === 'admin' ? 'Bí thư Đoàn Trường' : currentUser.role === 'manager' ? `GVCN Lớp ${currentUser.classId}` : currentUser.role === 'auditor' ? 'Cán bộ Đội Cờ Đỏ' : currentUser.role === 'youth_secretary' ? `Bí thư Chi đoàn ${currentUser.classId}` : 'Đoàn viên / Học sinh')}
                  </p>
                </div>
              </div>

              <div className="space-y-1.5">
                <button
                  onClick={() => {
                    if (currentUser.role === 'admin') setActiveView('admin');
                    else if (currentUser.role === 'manager') setActiveView('manager');
                    else if (currentUser.role === 'auditor') setActiveView('auditor');
                    else if (currentUser.role === 'youth_secretary') setActiveView('secretary');
                    else setActiveView('student');
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-glow transition-all active:scale-95"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span>
                    {currentUser.role === 'admin' ? 'Bảng Điều Hành Quản Trị' : currentUser.role === 'manager' ? 'Cổng GVCN Lớp' : currentUser.role === 'auditor' ? 'Bảng Chấm Điểm Cờ Đỏ' : 'Không Gian Chi Đoàn'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="w-full py-1.5 px-2.5 rounded-lg bg-slate-900 hover:bg-amber-950/60 text-amber-300 hover:text-amber-200 text-[11px] font-bold flex items-center justify-center gap-1 border border-slate-800 transition-colors"
                >
                  <KeyRound className="w-3 h-3 text-amber-400" />
                  <span>Đổi Mật Khẩu</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-4 border border-slate-800 shadow-card space-y-2.5 h-full flex flex-col justify-between">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <div className="p-1.5 bg-red-600/20 text-red-400 rounded-lg border border-red-600/30">
                  <LogIn className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-white">ĐĂNG NHẬP HỆ THỐNG</h3>
                  <p className="text-[10px] text-slate-400">Đăng nhập tài khoản</p>
                </div>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-2">
                {loginError && (
                  <div className="p-2 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-[10px] flex items-center gap-1.5">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <input
                      type="text"
                      required
                      value={loginUsername}
                      onChange={(e) => setLoginUsername(e.target.value)}
                      placeholder="Tên đăng nhập"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Mật khẩu"
                      className="w-full px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-red-500 transition-colors font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2 px-3 rounded-lg bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold shadow-glow transition-all active:scale-95"
                >
                  Xác Thực & Đăng Nhập
                </button>
              </form>
            </div>
          )}
        </div>

      </div>

      {/* ================= ROW 2: 3 BALANCED EQUAL-HEIGHT COLUMNS (DESKTOP) / 2x2 BALANCED GRID (TABLET) / 1-COLUMN (MOBILE) ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
        
        {/* ================= ITEM 1 (lg:col-span-4): PUBLIC LEADERBOARD ================= */}
        <div className="col-span-1 md:col-span-1 lg:col-span-4 lg:row-span-2 lg:col-start-1 lg:row-start-1 flex flex-col">
          <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-card h-full flex flex-col justify-between">
            
            <div>
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
              <div className="flex rounded-xl bg-slate-950 p-1 mb-4 border border-slate-800 text-[11px] sm:text-xs">
                {(['ALL', 10, 11, 12] as const).map(grade => (
                  <button
                    key={grade}
                    onClick={() => setSelectedGrade(grade)}
                    className={`flex-1 py-1.5 rounded-lg font-bold transition-all text-center cursor-pointer ${
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
                <div className="grid grid-cols-3 gap-2 items-end mb-4 pt-1 pb-1">
                  {/* 2nd Place */}
                  {top2 && (
                    <div 
                      onClick={() => setSelectedClassModal(top2)}
                      className="podium-2nd rounded-2xl p-2 sm:p-2.5 text-center cursor-pointer hover:scale-105 transition-all flex flex-col items-center justify-between min-h-[125px] sm:min-h-[135px]"
                    >
                      <div className="w-7 h-7 rounded-full bg-slate-300 text-slate-900 font-black text-xs flex items-center justify-center shadow-md border-2 border-slate-200">
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
                      className="podium-1st rounded-2xl p-2.5 sm:p-3 text-center cursor-pointer hover:scale-105 transition-all flex flex-col items-center justify-between min-h-[150px] sm:min-h-[160px] relative overflow-hidden"
                    >
                      <div className="absolute top-1 right-1 text-amber-400 animate-spin">✨</div>
                      <div className="w-9 h-9 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-black text-sm flex items-center justify-center shadow-glow-gold border-2 border-amber-300">
                        🥇 1
                      </div>
                      <div className="my-1">
                        <div className="inline-flex items-center gap-1 text-[10px] text-amber-300 font-bold">
                          <span>🏆 Quán Quân</span>
                        </div>
                        <p className="font-black text-white text-xs sm:text-sm">{top1.className}</p>
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
                      className="podium-3rd rounded-2xl p-2 sm:p-2.5 text-center cursor-pointer hover:scale-105 transition-all flex flex-col items-center justify-between min-h-[115px] sm:min-h-[125px]"
                    >
                      <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center shadow-md border-2 border-amber-600">
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
              <div className="space-y-1.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-thin">
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
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-center">
              <p className="text-[11px] text-slate-400">
                🔒 Dữ liệu công khai chỉ hiển thị tổng điểm tập thể để bảo vệ quyền riêng tư học sinh.
              </p>
            </div>
          </div>
        </div>

        {/* ================= ITEM 2 (lg:col-span-4): ĐỘI CỜ ĐỎ TRỰC BAN & QUY ĐỊNH ================= */}
        <div className="col-span-1 md:col-span-1 lg:col-span-4 lg:row-span-2 lg:col-start-5 lg:row-start-1 flex flex-col justify-between space-y-4 sm:space-y-5">
          {/* CỜ ĐỎ DUTY SCHEDULE WIDGET */}
          <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-card flex-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-600/30">
                    🛡️
                  </span>
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">ĐỘI CỜ ĐỎ TRỰC BAN</h3>
                    <p className="text-[11px] text-slate-400">Minh bạch nhân sự giám sát</p>
                  </div>
                </div>

                {/* Toggle Tab */}
                <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setDutyTab('today')}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      dutyTab === 'today' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Hôm nay
                  </button>
                  <button
                    onClick={() => setIsWeeklyDutyModalOpen(true)}
                    className="px-3 py-1 rounded-lg font-bold text-slate-400 hover:text-white hover:bg-slate-800 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <span>Cả tuần</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Today Duty Mini Cards - Single column for clean readability and full names */}
              <div className="grid grid-cols-1 gap-2.5 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin">
                {todayDuties.map(duty => (
                  <div
                    key={duty.id}
                    className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        duty.session === 'Chiều' 
                          ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' 
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {duty.session || 'Sáng'}
                      </span>
                      {duty.isLiveNow && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                          Đang trực
                        </span>
                      )}
                    </div>
                    <div className="flex items-start gap-2.5">
                      <span className="text-base shrink-0">🚩</span>
                      <div className="space-y-0.5 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <p className="font-bold text-white text-xs sm:text-sm truncate">{duty.auditorName}</p>
                          <span className="text-[10px] sm:text-xs text-amber-400 font-bold shrink-0 px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40">
                            Lớp {duty.auditorClass}
                          </span>
                        </div>
                        {duty.targetClasses && (
                          <p className="text-[11px] sm:text-xs text-red-300 font-semibold truncate">
                            Chấm điểm: <span className="font-bold text-red-200">{duty.targetClasses}</span>
                          </p>
                        )}
                        <p className="text-[10px] sm:text-[11px] text-slate-400 truncate">📍 {duty.zone}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Infobox (Quy định nề nếp tuần) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 text-xs space-y-2.5 shadow-card">
            <div className="flex items-center gap-2 text-amber-400 font-bold pb-2 border-b border-slate-800">
              <Info className="w-4 h-4 text-amber-400" />
              <span className="text-xs sm:text-sm font-black text-white">QUY ĐỊNH NỀ NẾP TUẦN</span>
            </div>
            <ul className="space-y-1.5 text-[11px] text-slate-300 list-disc list-inside leading-relaxed">
              <li>Khóa sổ chấm điểm: <span className="font-bold text-amber-300">17h00 Thứ 7</span> hàng tuần</li>
              <li>Thời hạn gửi phúc khảo của GVCN: <span className="font-bold text-sky-300">Trong vòng 24h</span></li>
              <li>Học sinh quét mã QR nhận điểm danh nề nếp & cộng điểm thi đua</li>
            </ul>
          </div>
        </div>

        {/* ================= ITEM 3 (lg:col-span-4): THỜI TIẾT HÔM NAY ================= */}
        <div className="col-span-1 md:col-span-1 lg:col-span-4 lg:row-span-1 lg:col-start-9 lg:row-start-1 flex flex-col">
          {/* WEATHER WIDGET (ĐÔNG GIANG - ĐÀ NẴNG) */}
          <div className="glass-panel rounded-3xl p-4 sm:p-5 border border-sky-500/20 bg-gradient-to-br from-slate-900 via-sky-950/20 to-slate-950 shadow-card space-y-3.5 relative overflow-hidden h-full flex flex-col justify-between">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div>
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
              <div className="flex items-center justify-between py-1 mt-1">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 text-2xl shadow-inner">
                    ☀️
                  </div>
                  <div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-xl sm:text-2xl font-black text-white">29°C</span>
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
              <div className="grid grid-cols-3 gap-2 pt-2">
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
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[10px] mt-2">
                <div className="text-center">
                  <span className="text-slate-400 block font-medium">Sáng</span>
                  <span className="font-bold text-amber-300">27°C ☀️</span>
                </div>
                <div className="h-5 w-px bg-slate-800"></div>
                <div className="text-center">
                  <span className="text-slate-400 block font-medium">Chiều</span>
                  <span className="font-bold text-sky-300">31°C ⛅</span>
                </div>
                <div className="h-5 w-px bg-slate-800"></div>
                <div className="text-center">
                  <span className="text-slate-400 block font-medium">Tối</span>
                  <span className="font-bold text-indigo-300">25°C 🌙</span>
                </div>
              </div>
            </div>

            {/* Youth Union Context Note */}
            <div className="p-2.5 rounded-xl bg-sky-950/40 border border-sky-800/40 text-[10px] text-sky-200/90 leading-relaxed flex items-start gap-2 mt-2">
              <span className="text-xs mt-0.5">✨</span>
              <span>Thời tiết thuận lợi cho các hoạt động chào cờ, thể dục & nhiệm vụ trực tuần của Đội Cờ Đỏ.</span>
            </div>
          </div>
        </div>

        {/* ================= ITEM 4 (lg:col-span-4): ẢNH HOẠT ĐỘNG PHONG TRÀO ================= */}
        <div className="col-span-1 md:col-span-1 lg:col-span-4 lg:row-span-1 lg:col-start-9 lg:row-start-2 flex flex-col">
          {/* ACTIVITY PHOTO SLIDESHOW WIDGET */}
          {activeSlideList.length > 0 && (
            <div 
              className="glass-panel rounded-3xl p-4 sm:p-5 border border-slate-800 shadow-card space-y-3 relative overflow-hidden group h-full flex flex-col justify-between"
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
              <div className="relative w-full h-48 sm:h-52 md:h-56 rounded-2xl overflow-hidden border border-slate-700 bg-slate-950 shadow-inner group/slide">
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
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('unsplash.com/photo-1523050854058')) {
                          target.src = 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=75';
                        }
                      }}
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
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-red-600 text-white border border-slate-700/80 flex items-center justify-center text-xs opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-lg active:scale-95 cursor-pointer"
                  title="Ảnh trước"
                >
                  ‹
                </button>

                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); handleNextSlide(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-slate-950/80 hover:bg-red-600 text-white border border-slate-700/80 flex items-center justify-center text-xs opacity-80 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-lg active:scale-95 cursor-pointer"
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
                    className={`h-1.5 rounded-full transition-all cursor-pointer ${
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

      </div>

      {/* ================= ROW 3: BẢN TIN & THÔNG BÁO HOẠT ĐỘNG ĐOÀN (FULL-WIDTH 100%) ================= */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800 bg-gradient-to-b from-slate-900/95 via-slate-900/70 to-slate-950 shadow-card space-y-6">
        {/* Official Facebook Connectivity Banner */}
        <div className="rounded-2xl p-4 sm:p-5 bg-gradient-to-r from-blue-950/80 via-slate-900 to-indigo-950/80 border border-blue-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/30">
              <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h4 className="text-sm sm:text-base font-black text-white">
                  KÊNH TRUYỀN THÔNG FACEBOOK: TUỔI TRẺ THPT QUANG TRUNG – ĐÔNG GIANG
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/40">
                  Xác thực Đoàn Trường
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                  {facebookNewsCount} bài viết
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Cập nhật bài viết, hình ảnh hoạt động phong trào, phóng sự ảnh và video trực tiếp từ Fanpage chính thức Đoàn trường THPT Quang Trung - Đông Giang.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
              <button
                type="button"
                onClick={() => setFacebookViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                  facebookViewMode === 'grid' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lưới bài viết
              </button>
              <button
                type="button"
                onClick={() => setFacebookViewMode('feed')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  facebookViewMode === 'feed' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span>Live Feed</span>
              </button>
            </div>
            <a
              href="https://www.facebook.com/profile.php?id=100065567376763"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-black transition-all shadow-md shadow-blue-600/30 flex items-center gap-1.5"
            >
              <span>Mở Fanpage</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Facebook Live Feed View (When Feed Mode Active) */}
        {facebookViewMode === 'feed' ? (
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs sm:text-sm font-bold text-white uppercase tracking-tight">
                  DÒNG THỜI GIAN TRỰC TIẾP (LIVE TIMELINE FEED) TỪ FANPAGE ĐOÀN TRƯỜNG
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Page ID: <strong className="text-blue-400">100065567376763</strong></span>
                <span>•</span>
                <a
                  href="https://www.facebook.com/profile.php?id=100065567376763"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>Mở trong tab mới</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Embedded Facebook Page Plugin Iframe */}
              <div className="lg:col-span-7 flex flex-col items-center justify-center bg-slate-900/90 rounded-2xl border border-slate-800 p-2 sm:p-4 min-h-[600px] overflow-hidden">
                <iframe 
                  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fprofile.php%3Fid%3D100065567376763&tabs=timeline&width=500&height=750&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" 
                  width="100%" 
                  height="750" 
                  style={{ border: 'none', overflow: 'hidden', minHeight: '650px', maxWidth: '500px' }} 
                  scrolling="no" 
                  frameBorder="0" 
                  allowFullScreen={true} 
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  title="Facebook Page Feed Đoàn Trường"
                  className="rounded-xl w-full shadow-inner bg-white/5"
                />
                <p className="text-[11px] text-slate-400 mt-3 text-center max-w-md">
                  Nếu trình duyệt của bạn đang bật chế độ bảo mật chặn cookie hoặc tiện ích mở rộng Adblock, bạn có thể bấm trực tiếp nút bên dưới để xem fanpage:
                </p>
                <a
                  href="https://www.facebook.com/profile.php?id=100065567376763"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2.5 px-4 py-2 bg-[#1877F2] hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow transition-colors"
                >
                  <span>Mở Facebook "Tuổi trẻ THPT Quang Trung - Đông Giang"</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              {/* Right Column: Synced Facebook Highlights & Gallery */}
              <div className="lg:col-span-5 space-y-4">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-black uppercase text-blue-400 flex items-center gap-1.5">
                    <span>📸</span>
                    <span>BÀI VIẾT & HÌNH ẢNH ĐỒNG BỘ TỪ FACEBOOK ({facebookNewsCount})</span>
                  </h4>
                  <div className="space-y-3">
                    {visibleNews
                      .filter(n => n.sourcePlatform === 'facebook' || n.sourceUrl?.includes('facebook.com') || (Array.isArray(n.tags) && n.tags.some(t => t.toLowerCase().includes('facebook'))))
                      .map(fbPost => (
                        <div
                          key={fbPost.id}
                          onClick={() => setSelectedArticleModal(fbPost)}
                          className="p-3 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all flex gap-3 group"
                        >
                          <img
                            src={fbPost.thumbnail}
                            alt={fbPost.title}
                            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-700"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] text-blue-400 font-bold block">{fbPost.publishDate}</span>
                            <h5 className="text-xs font-bold text-white group-hover:text-blue-300 line-clamp-2 leading-snug">
                              {fbPost.title}
                            </h5>
                            <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                              <span>Xem bài & chùm ảnh</span>
                              <ChevronRight className="w-3 h-3 text-blue-400" />
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* 4-Column Responsive Magazine Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
            {filteredNewsList.map(article => {
              const isAnn = article.category === 'announcement' || article.id.startsWith('ann-');
              const isFb = article.sourcePlatform === 'facebook' || article.sourceUrl?.includes('facebook.com') || (Array.isArray(article.tags) && article.tags.some(t => t.toLowerCase().includes('facebook')));
              return (
                <div
                  key={article.id}
                  onClick={() => setSelectedArticleModal(article)}
                  className={`glass-panel glass-panel-hover rounded-2xl p-3.5 border cursor-pointer group flex flex-col justify-between gap-3 transition-all hover:border-red-500/50 hover:shadow-glow ${
                    isAnn 
                      ? 'border-amber-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-amber-950/20' 
                      : isFb
                        ? 'border-blue-500/30 bg-gradient-to-br from-slate-900 via-slate-900 to-blue-950/20 hover:border-blue-500/60'
                        : 'border-slate-800 bg-slate-900/90'
                  }`}
                >
                  <div className="space-y-2.5">
                    <div className="w-full h-40 relative shrink-0 rounded-xl overflow-hidden border border-slate-700 bg-slate-950">
                      <img
                        src={article.thumbnail}
                        alt={article.title}
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          e.currentTarget.src = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=80';
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className={`absolute top-2 left-2 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider text-white shadow-md backdrop-blur-sm ${
                        isAnn 
                          ? 'bg-amber-600/90' 
                          : isFb 
                            ? 'bg-[#1877F2]/90 flex items-center gap-1' 
                            : 'bg-blue-600/90'
                      }`}>
                        {isAnn ? '📢 THÔNG BÁO' : isFb ? '🌐 FACEBOOK' : '📰 BẢN TIN'}
                      </span>
                      {isAnn && article.urgency && article.urgency !== 'normal' && (
                        <span className={`absolute top-2 right-2 px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                          article.urgency === 'critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-500 text-slate-950 font-black'
                        }`}>
                          {article.urgency === 'critical' ? '🔥 HỎA TỐC' : '⚠️ KHẨN'}
                        </span>
                      )}
                      {article.images && article.images.length > 1 && (
                        <span className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[9px] font-bold text-white flex items-center gap-1">
                          <span>📷</span>
                          <span>{article.images.length} ảnh</span>
                        </span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400">
                        {article.tags.slice(0, 2).map(tag => (
                          <span 
                            key={tag} 
                            className={`font-bold px-1.5 py-0.2 rounded border ${
                              tag.toLowerCase().includes('facebook')
                                ? 'text-blue-400 bg-blue-950/60 border-blue-900/50'
                                : 'text-red-400 bg-red-950/60 border-red-900/50'
                            }`}
                          >
                            {tag}
                          </span>
                        ))}
                        <span>• {article.publishDate}</span>
                      </div>

                      <h4 className="font-bold text-white text-xs sm:text-sm group-hover:text-red-400 transition-colors line-clamp-2 leading-snug">
                        {article.title}
                      </h4>

                      <p className="text-[11px] text-slate-300 line-clamp-2 leading-relaxed">
                        {article.excerpt}
                      </p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                    <span className="truncate max-w-[120px]">Bởi: <strong className="text-slate-200">{article.author}</strong></span>
                    <span className="text-red-400 font-bold group-hover:underline flex items-center gap-0.5 shrink-0">
                      {isFb ? (
                        <span className="text-blue-400 flex items-center gap-1">
                          <span>Xem tin Facebook</span>
                          <ChevronRight className="w-3 h-3" />
                        </span>
                      ) : (
                        <>
                          Xem tin <ChevronRight className="w-3 h-3" />
                        </>
                      )}
                    </span>
                  </div>
                </div>
              );
            })}

            {filteredNewsList.length === 0 && (
              <div className="col-span-full text-center py-12 glass-panel rounded-2xl border border-slate-800">
                <p className="text-slate-400 text-sm">Chưa có bài viết hoặc thông báo nào trong mục này.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ================= PUBLIC DOCUMENT & FORM REPOSITORY ================= */}
      <div className="glass-panel rounded-3xl p-6 border border-amber-500/20 bg-gradient-to-b from-slate-900 via-slate-900/90 to-amber-950/10 shadow-card space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 text-xl shadow-inner">
              📁
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  KHO BIỂU MẪU & VĂN BẢN ĐOÀN CÔNG KHAI
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Tải miễn phí
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Đoàn viên, học sinh và thầy cô có thể tra cứu, xem trực tuyến và tải về các mẫu đơn, cẩm nang, nghị quyết và kế hoạch mới nhất
              </p>
            </div>
          </div>

          {/* Quick search input */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={publicDocSearch}
              onChange={(e) => setPublicDocSearch(e.target.value)}
              placeholder="Tìm tên đơn, số hiệu, từ khóa..."
              className="w-full pl-9 pr-8 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
            {publicDocSearch && (
              <button
                type="button"
                onClick={() => setPublicDocSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => {
              setPublicDocFolder('ALL');
              setPublicDocCategory('ALL');
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
              publicDocFolder === 'ALL' && publicDocCategory === 'ALL'
                ? 'bg-amber-600 text-white shadow-glow'
                : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <span>Tất cả tài liệu</span>
            <span className="text-[10px] opacity-80 bg-black/30 px-1.5 py-0.2 rounded-full">
              {documentFiles?.filter((d) => d.isPublic).length || 0}
            </span>
          </button>

          {documentFolders?.map((folder) => {
            const count = documentFiles?.filter((f) => f.isPublic && f.folderId === folder.id).length || 0;
            if (count === 0) return null;
            return (
              <button
                key={folder.id}
                type="button"
                onClick={() => {
                  setPublicDocFolder(folder.id);
                  setPublicDocCategory('ALL');
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                  publicDocFolder === folder.id
                    ? 'bg-amber-600 text-white shadow-glow'
                    : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Folder className="w-3.5 h-3.5" style={{ color: folder.color || '#f59e0b' }} />
                <span>{folder.name}</span>
                <span className="text-[10px] opacity-80 bg-black/30 px-1.5 py-0.2 rounded-full">
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Document Cards */}
        {(() => {
          const publicDocs = (documentFiles || []).filter((doc) => {
            if (!doc.isPublic) return false;
            const matchFolder = publicDocFolder === 'ALL' || doc.folderId === publicDocFolder;
            const matchCategory = publicDocCategory === 'ALL' || doc.category === publicDocCategory;
            const matchSearch =
              !publicDocSearch ||
              doc.title.toLowerCase().includes(publicDocSearch.toLowerCase()) ||
              (doc.documentNumber && doc.documentNumber.toLowerCase().includes(publicDocSearch.toLowerCase())) ||
              (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(publicDocSearch.toLowerCase()))) ||
              (doc.description && doc.description.toLowerCase().includes(publicDocSearch.toLowerCase()));
            return matchFolder && matchCategory && matchSearch;
          });

          if (publicDocs.length === 0) {
            return (
              <div className="py-10 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/40">
                <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                <p className="text-sm font-semibold text-slate-400">Không tìm thấy tài liệu phù hợp</p>
                <p className="text-xs text-slate-500 mt-1">Vui lòng thử từ khóa tìm kiếm khác</p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {publicDocs.map((doc) => {
                const folder = documentFolders?.find((f) => f.id === doc.folderId);
                const formatConfig: Record<string, { label: string; bg: string; text: string; border: string }> = {
                  pdf: { label: 'PDF', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
                  docx: { label: 'DOCX', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
                  doc: { label: 'DOC', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
                  xlsx: { label: 'XLSX', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
                  xls: { label: 'XLS', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
                  pptx: { label: 'PPTX', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
                  zip: { label: 'ZIP', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
                  image: { label: 'ẢNH', bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30' },
                  other: { label: 'FILE', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' }
                };
                const fmt = formatConfig[doc.fileType] || formatConfig.other;

                return (
                  <div
                    key={doc.id}
                    className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800/90 hover:border-amber-500/40 transition-all hover:shadow-lg flex flex-col justify-between group"
                  >
                    <div className="space-y-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${fmt.bg} ${fmt.text} ${fmt.border}`}>
                          {fmt.label}
                        </span>
                        {doc.isPinned && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                            <Star className="w-2.5 h-2.5 fill-amber-400" /> Ghim
                          </span>
                        )}
                        {folder && (
                          <span className="text-[10px] text-slate-400 flex items-center gap-1">
                            <Folder className="w-3 h-3" style={{ color: folder.color || '#f59e0b' }} />
                            <span className="truncate max-w-[120px]">{folder.name}</span>
                          </span>
                        )}
                      </div>

                      <div>
                        <h4
                          onClick={() => {
                            incrementDocumentViews(doc.id);
                            setSelectedDocModal(doc);
                          }}
                          className="font-bold text-white text-xs sm:text-sm group-hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
                          title={doc.title}
                        >
                          {doc.title}
                        </h4>
                        {doc.documentNumber && (
                          <p className="text-[11px] font-mono text-amber-400/90 mt-0.5">
                            {doc.documentNumber}
                          </p>
                        )}
                      </div>

                      {doc.description && (
                        <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                          {doc.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                        <span>{doc.issueDate ? `Ban hành: ${doc.issueDate}` : `Dung lượng: ${doc.fileSize}`}</span>
                        <span>{doc.downloadCount || 0} lượt tải</span>
                      </div>
                    </div>

                    <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          incrementDocumentViews(doc.id);
                          setSelectedDocModal(doc);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Xem trước</span>
                      </button>

                      <a
                        href={doc.fileUrl || doc.url}
                        download={doc.title}
                        target="_blank"
                        rel="noreferrer"
                        onClick={() => incrementDocumentDownloads(doc.id)}
                        className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all active:scale-95"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Tải về</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
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
                <span className={`px-2.5 py-1 rounded text-xs font-black ${
                  (selectedArticleModal.sourcePlatform === 'facebook' || selectedArticleModal.sourceUrl?.includes('facebook.com') || (Array.isArray(selectedArticleModal.tags) && selectedArticleModal.tags.some(t => t.toLowerCase().includes('facebook'))))
                    ? 'bg-[#1877F2] text-white'
                    : 'bg-red-600 text-white'
                }`}>
                  {(selectedArticleModal.sourcePlatform === 'facebook' || selectedArticleModal.sourceUrl?.includes('facebook.com') || (Array.isArray(selectedArticleModal.tags) && selectedArticleModal.tags.some(t => t.toLowerCase().includes('facebook'))))
                    ? '🌐 FACEBOOK ĐOÀN TRƯỜNG'
                    : 'TIN ĐOÀN TRƯỜNG'}
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

            {/* Facebook Origin Attribution Banner */}
            {(selectedArticleModal.sourceUrl || selectedArticleModal.sourcePlatform === 'facebook' || (Array.isArray(selectedArticleModal.tags) && selectedArticleModal.tags.some(t => t.toLowerCase().includes('facebook')))) && (
              <div className="p-3.5 rounded-2xl bg-[#1877F2]/10 border border-[#1877F2]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-inner">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow">
                    <svg className="w-4.5 h-4.5 fill-current" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-white">Nguồn: Fanpage Tuổi trẻ THPT Quang Trung - Đông Giang</h5>
                    <p className="text-[11px] text-blue-300">Đồng bộ từ Facebook Page ID: 100065567376763</p>
                  </div>
                </div>
                <a
                  href={selectedArticleModal.sourceUrl || 'https://www.facebook.com/profile.php?id=100065567376763'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3.5 py-1.5 rounded-xl bg-[#1877F2] hover:bg-blue-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow"
                >
                  <span>Mở trên Facebook</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            <img
              src={selectedArticleModal.thumbnail}
              alt={selectedArticleModal.title}
              className="w-full h-64 object-cover rounded-2xl border border-slate-700 shadow-md"
            />

            <div className="bg-slate-900/60 p-4 sm:p-5 rounded-2xl border border-slate-800/80 shadow-inner">
              <RichTextViewer content={selectedArticleModal.content} />
            </div>

            {/* Photo Gallery If Multiple Images Present */}
            {selectedArticleModal.images && selectedArticleModal.images.length > 0 && (
              <div className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2.5">
                <p className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span>📷</span>
                  <span>Chùm Ảnh Hoạt Động ({selectedArticleModal.images.length} ảnh):</span>
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {selectedArticleModal.images.map((imgUrl, idx) => (
                    <div
                      key={idx}
                      onClick={() => setSelectedPhotoModal({ url: imgUrl, title: `${selectedArticleModal.title} (Ảnh ${idx + 1})` })}
                      className="h-28 rounded-xl overflow-hidden border border-slate-700 bg-slate-950 cursor-pointer group relative"
                    >
                      <img
                        src={imgUrl}
                        alt={`Ảnh ${idx + 1}`}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold">
                        <span>🔍 Xem lớn</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

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
      {isWeeklyDutyModalOpen && (() => {
        const currentWeekDuties = duties.filter(d => d.weekNumber === activeWeek);
        const filtered = currentWeekDuties.filter(d => {
          const matchSession = dutyModalSession === 'ALL' || d.session === dutyModalSession || (!d.session && dutyModalSession === 'Sáng');
          const matchDay = dutyModalDay === 'ALL' || d.day === dutyModalDay;
          const q = dutyModalSearch.toLowerCase().trim();
          const matchSearch = !q || 
            d.auditorName.toLowerCase().includes(q) || 
            d.auditorClass.toLowerCase().includes(q) || 
            (d.targetClasses && d.targetClasses.toLowerCase().includes(q)) || 
            d.zone.toLowerCase().includes(q) ||
            d.day.toLowerCase().includes(q);
          return matchSession && matchDay && matchSearch;
        });

        const morningDuties = filtered.filter(d => (d.session || 'Sáng') === 'Sáng');
        const afternoonDuties = filtered.filter(d => d.session === 'Chiều');
        const dayOrder: DayOfWeek[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
        const getDayLabel = (d: DayOfWeek) => {
          switch (d) {
            case 'T2': return 'Thứ 2';
            case 'T3': return 'Thứ 3';
            case 'T4': return 'Thứ 4';
            case 'T5': return 'Thứ 5';
            case 'T6': return 'Thứ 6';
            case 'T7': return 'Thứ 7';
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="glass-modal max-w-5xl w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                  <span className="p-2.5 rounded-2xl bg-red-600/20 text-red-400 border border-red-500/30 text-xl font-bold">🚩</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-tight">
                      LỊCH PHÂN CÔNG TRỰC CỜ ĐỎ - NĂM HỌC 2026 - 2027
                    </h3>
                    <p className="text-xs text-slate-400">
                      BCH Đoàn Trường THPT Quang Trung – Đông Giang • Tuần {activeWeek}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors hidden sm:flex items-center gap-1.5"
                  >
                    <span>🖨️ In Lịch</span>
                  </button>
                  <button
                    onClick={() => setIsWeeklyDutyModalOpen(false)}
                    className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={dutyModalSearch}
                    onChange={(e) => setDutyModalSearch(e.target.value)}
                    placeholder="Tìm theo tên, lớp, phòng..."
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                  />
                  {dutyModalSearch && (
                    <button onClick={() => setDutyModalSearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Session Filter */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1">
                  <span className="text-slate-400 mr-2 font-bold">Buổi:</span>
                  <select
                    value={dutyModalSession}
                    onChange={(e) => setDutyModalSession(e.target.value as any)}
                    className="bg-transparent text-white font-bold outline-none cursor-pointer flex-1"
                  >
                    <option value="ALL" className="bg-slate-900">Tất cả ({currentWeekDuties.length} ca)</option>
                    <option value="Sáng" className="bg-slate-900">Buổi Sáng (32 ca)</option>
                    <option value="Chiều" className="bg-slate-900">Buổi Chiều (12 ca)</option>
                  </select>
                </div>

                {/* Day Filter */}
                <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1">
                  <span className="text-slate-400 mr-2 font-bold">Thứ:</span>
                  <select
                    value={dutyModalDay}
                    onChange={(e) => setDutyModalDay(e.target.value as any)}
                    className="bg-transparent text-white font-bold outline-none cursor-pointer flex-1"
                  >
                    <option value="ALL" className="bg-slate-900">Tất cả các ngày</option>
                    {dayOrder.map(d => (
                      <option key={d} value={d} className="bg-slate-900">{getDayLabel(d)}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Schedule Content */}
              <div className="space-y-6">
                {/* Part I: Buổi Sáng */}
                {(dutyModalSession === 'ALL' || dutyModalSession === 'Sáng') && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-amber-500/30">
                      <h4 className="text-xs sm:text-sm font-black text-amber-400 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-amber-400" />
                        I. LỊCH TRỰC PHÂN CÔNG BUỔI SÁNG (06:45 - 07:15 & 11:15 - 11:45)
                      </h4>
                      <span className="text-[11px] text-slate-400 font-bold">{morningDuties.length} ca trực</span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-800">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                            <th className="p-2.5 font-bold text-center w-24">Thời Gian</th>
                            <th className="p-2.5 font-bold text-center w-20">Lớp Trực</th>
                            <th className="p-2.5 font-bold">Người Trực (Cờ Đỏ)</th>
                            <th className="p-2.5 font-bold text-center w-36">Chấm Điểm Lớp</th>
                            <th className="p-2.5 font-bold">Khu Vực Trực</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950/50">
                          {morningDuties.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-slate-500">
                                Không có ca trực buổi sáng phù hợp với bộ lọc.
                              </td>
                            </tr>
                          ) : (
                            dayOrder.map(day => {
                              const dayShifts = morningDuties.filter(d => d.day === day);
                              if (dayShifts.length === 0) return null;

                              return dayShifts.map((shift, idx) => (
                                <tr key={shift.id} className="hover:bg-slate-800/30 transition-colors">
                                  {idx === 0 && (
                                    <td
                                      rowSpan={dayShifts.length}
                                      className="p-2.5 font-bold text-center text-amber-400 bg-slate-900/60 border-r border-slate-800 align-middle"
                                    >
                                      <span className="text-sm font-black block">{getDayLabel(day)}</span>
                                      <span className="text-[10px] text-slate-400 block font-normal">({dayShifts.length} ca)</span>
                                    </td>
                                  )}
                                  <td className="p-2.5 font-bold text-center text-white bg-slate-900/20">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 font-bold border border-slate-700">
                                      {shift.auditorClass}
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-bold text-white">
                                    <span className="text-white">{shift.auditorName}</span>
                                  </td>
                                  <td className="p-2.5 font-bold text-center">
                                    <span className="px-2 py-0.5 rounded-lg bg-red-950/80 text-red-300 border border-red-800/80 text-[11px] font-bold">
                                      {shift.targetClasses || 'Toàn trường'}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-slate-300">
                                    <span>{shift.zone}</span>
                                  </td>
                                </tr>
                              ));
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Part II: Buổi Chiều */}
                {(dutyModalSession === 'ALL' || dutyModalSession === 'Chiều') && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-indigo-500/30">
                      <h4 className="text-xs sm:text-sm font-black text-indigo-400 uppercase tracking-wide flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-400" />
                        II. LỊCH TRỰC PHÂN CÔNG BUỔI CHIỀU (12:45 - 13:15 & 16:45 - 17:15)
                      </h4>
                      <span className="text-[11px] text-slate-400 font-bold">{afternoonDuties.length} ca trực</span>
                    </div>

                    <div className="overflow-x-auto rounded-2xl border border-slate-800">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800">
                            <th className="p-2.5 font-bold text-center w-24">Thời Gian</th>
                            <th className="p-2.5 font-bold text-center w-20">Lớp Trực</th>
                            <th className="p-2.5 font-bold">Người Trực (Cờ Đỏ)</th>
                            <th className="p-2.5 font-bold text-center w-36">Chấm Điểm Lớp</th>
                            <th className="p-2.5 font-bold">Khu Vực Trực</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 bg-slate-950/50">
                          {afternoonDuties.length === 0 ? (
                            <tr>
                              <td colSpan={5} className="p-4 text-center text-slate-500">
                                Không có ca trực buổi chiều phù hợp với bộ lọc.
                              </td>
                            </tr>
                          ) : (
                            dayOrder.map(day => {
                              const dayShifts = afternoonDuties.filter(d => d.day === day);
                              if (dayShifts.length === 0) return null;

                              return dayShifts.map((shift, idx) => (
                                <tr key={shift.id} className="hover:bg-slate-800/30 transition-colors">
                                  {idx === 0 && (
                                    <td
                                      rowSpan={dayShifts.length}
                                      className="p-2.5 font-bold text-center text-indigo-400 bg-slate-900/60 border-r border-slate-800 align-middle"
                                    >
                                      <span className="text-sm font-black block">{getDayLabel(day)}</span>
                                      <span className="text-[10px] text-slate-400 block font-normal">({dayShifts.length} ca)</span>
                                    </td>
                                  )}
                                  <td className="p-2.5 font-bold text-center text-white bg-slate-900/20">
                                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 font-bold border border-slate-700">
                                      {shift.auditorClass}
                                    </span>
                                  </td>
                                  <td className="p-2.5 font-bold text-white">
                                    <span className="text-white">{shift.auditorName}</span>
                                  </td>
                                  <td className="p-2.5 font-bold text-center">
                                    <span className="px-2 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 text-[11px] font-bold">
                                      {shift.targetClasses || 'Toàn trường'}
                                    </span>
                                  </td>
                                  <td className="p-2.5 text-slate-300">
                                    <span>{shift.zone}</span>
                                  </td>
                                </tr>
                              ));
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
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
        );
      })()}

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

      {/* Reusable Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Document Viewer Modal */}
      {selectedDocModal && (
        <DocumentViewerModal
          isOpen={true}
          onClose={() => setSelectedDocModal(null)}
          document={selectedDocModal}
        />
      )}

    </div>
  );
};

