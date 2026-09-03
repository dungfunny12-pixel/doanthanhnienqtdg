import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  Unlock, 
  UserCircle2, 
  LogOut, 
  Menu, 
  X, 
  ChevronRight,
  Shield,
  GraduationCap,
  Sparkles,
  Smartphone,
  Award,
  KeyRound,
  Bell,
  Calendar,
  AlertTriangle,
  Database
} from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';
import { SupabaseConfigModal } from './SupabaseConfigModal';
import { isSupabaseConfigured } from '../../lib/supabase';

export const Header: React.FC = () => {
  const { 
    currentUser, 
    activeWeek, 
    setActiveWeek, 
    isWeekLocked, 
    logout, 
    activeView, 
    setActiveView,
    schoolSettings,
    weeksConfig,
    academicYears,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    isHistoricalYear,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearAllNotifications,
    requestPushPermission
  } = useApp();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isSupabaseModalOpen, setIsSupabaseModalOpen] = useState(false);

  // Filter notifications relevant to current logged-in user
  const userNotifications = notifications.filter(n => {
    if (!currentUser) return n.targetRole === 'all' || n.targetClassId === 'ALL';
    if (currentUser.role === 'admin') return true;
    if (n.targetClassId && currentUser.classId && n.targetClassId === currentUser.classId) return true;
    if (n.targetRole === currentUser.role || n.targetRole === 'all') return true;
    return false;
  });

  const userUnreadCount = userNotifications.filter(n => !n.isRead).length;

  // Determine user workspace route name and icon
  const getWorkspaceInfo = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'admin':
        return { view: 'admin', label: 'Bảng Điều Hành', icon: '🛡️' };
      case 'manager':
        return { view: 'manager', label: `Lớp Chủ Nhiệm (${currentUser.classId || '10/1'})`, icon: '🏫' };
      case 'auditor':
        return { view: 'auditor', label: 'Chấm Thi Đua', icon: '📋' };
      case 'youth_secretary':
        return { view: 'secretary', label: `Chi Đoàn (${currentUser.classId || '10/1'})`, icon: '🎖️' };
      case 'user':
        return { view: 'student', label: 'Sổ Đoàn & Học Sinh', icon: '💳' };
      default:
        return { view: 'portal', label: 'Cổng Công Cộng', icon: '🌐' };
    }
  };

  const workspace = getWorkspaceInfo();

  const getThemeGradient = (color?: string) => {
    switch (color) {
      case 'blue': return 'from-blue-800 via-blue-600 to-indigo-600';
      case 'emerald': return 'from-emerald-800 via-emerald-600 to-teal-600';
      case 'amber': return 'from-amber-800 via-amber-600 to-orange-600';
      case 'purple': return 'from-purple-800 via-purple-600 to-pink-600';
      case 'slate': return 'from-slate-900 via-slate-700 to-zinc-600';
      case 'cyan': return 'from-cyan-800 via-cyan-600 to-blue-600';
      default: return 'from-red-800 via-red-600 to-amber-600';
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      {/* Historical Year Read-Only Warning Banner - ONLY FOR ADMIN */}
      {isHistoricalYear && currentUser?.role === 'admin' && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 px-4 py-2 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-between shadow-glow border-b border-amber-600">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-5 h-5 shrink-0 text-slate-950 animate-bounce" />
            <span className="truncate">
              ⚠️ BẠN ĐANG XEM DỮ LIỆU LỊCH SỬ CỦA NĂM HỌC CŨ (CHẾ ĐỘ CHỈ XEM - READ ONLY). CÁC THAO TÁC THAY ĐỔI DỮ LIỆU ĐÃ BỊ KHÓA.
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const current = academicYears.find(y => y.isCurrent);
              if (current) setSelectedAcademicYearId(current.id);
            }}
            className="px-3 py-1 bg-slate-950 text-amber-300 rounded-lg font-bold text-xs hover:bg-slate-900 shrink-0 shadow transition-all ml-2"
          >
            Trở Về Năm Hiện Tại ↩
          </button>
        </div>
      )}

      {/* Top micro status bar */}
      <div className={`bg-gradient-to-r ${getThemeGradient(schoolSettings.themeColor)} px-4 py-1 text-xs text-white flex items-center justify-between font-medium`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <span className="inline-block w-2 h-2 shrink-0 rounded-full bg-amber-300 animate-ping"></span>
          <span className="font-extrabold uppercase tracking-wide truncate">
            {schoolSettings.youthUnionName.toUpperCase()} – HỆ THỐNG QUẢN LÝ NỀ NẾP & THI ĐUA ĐIỆN TỬ
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {isWeekLocked ? (
            <span className="flex items-center gap-1 bg-red-950 text-red-200 px-2.5 py-0.5 rounded text-[11px] font-bold border border-red-700">
              <Lock className="w-3 h-3" /> Tuần {activeWeek} ĐÃ KHÓA SỔ
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-emerald-950 text-emerald-300 px-2.5 py-0.5 rounded text-[11px] font-bold border border-emerald-700">
              <Unlock className="w-3 h-3" /> Tuần {activeWeek} ĐANG CHẤM ĐIỂM
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center space-x-3 cursor-pointer group shrink-0 min-w-0"
            onClick={() => setActiveView('portal')}
          >
            {schoolSettings.logoUrl ? (
              <img 
                src={schoolSettings.logoUrl} 
                alt="Logo" 
                className="w-10 h-10 rounded-xl object-cover shadow-glow border border-red-400/40 group-hover:scale-105 transition-transform"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-glow border border-red-400/40 group-hover:scale-105 transition-transform">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2"/>
                </svg>
              </div>
            )}
            <div className="truncate">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight text-white group-hover:text-red-400 transition-colors truncate">
                  {schoolSettings.schoolName.toUpperCase()}
                </h1>
              </div>
              <p className="text-[11px] text-slate-400 font-medium truncate">
                Cổng Thông Tin Nề Nếp & Phong Trào Đoàn
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Clean & Responsive) */}
          <nav className="hidden lg:flex items-center space-x-2">
            <button
              onClick={() => setActiveView('portal')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeView === 'portal'
                  ? 'bg-red-600 text-white shadow-glow'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <span>🌐</span>
              <span>Cổng Công Cộng</span>
            </button>

            {currentUser && workspace && (
              <button
                onClick={() => setActiveView(workspace.view as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === workspace.view
                    ? 'bg-red-600 text-white shadow-glow'
                    : 'bg-slate-800 text-amber-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <span>{workspace.icon}</span>
                <span>{workspace.label}</span>
              </button>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Academic Year Selector Dropdown - ONLY FOR ADMIN */}
            {currentUser?.role === 'admin' && (
              <div className="hidden sm:flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs shadow-inner">
                <Calendar className="w-3.5 h-3.5 text-amber-400 mr-1.5 shrink-0" />
                <select
                  value={selectedAcademicYearId}
                  onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                  className={`bg-transparent font-bold outline-none cursor-pointer text-xs ${
                    isHistoricalYear ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                  title="Chọn Năm học để xem bảng điểm và dữ liệu thi đua (Chỉ dành cho Quản trị viên)"
                >
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id} className="bg-slate-900 text-white">
                      {y.name} {y.isCurrent ? '(Hiện tại)' : '🔒'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Week Selector Dropdown */}
            <div className="flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs shadow-inner">
              <span className="text-slate-400 mr-1.5 font-bold text-[11px]">Tuần:</span>
              <select
                value={activeWeek}
                onChange={(e) => setActiveWeek(Number(e.target.value))}
                className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer text-xs"
              >
                {weeksConfig.map(w => (
                  <option key={w.weekNumber} value={w.weekNumber} className="bg-slate-900 text-white">
                    {w.title} {w.isCurrent ? '(Hiện tại)' : w.isLocked ? '🔒' : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Cloud Database (Supabase) Connection Trigger */}
            <button
              type="button"
              onClick={() => setIsSupabaseModalOpen(true)}
              title={isSupabaseConfigured() ? 'Cơ sở dữ liệu Supabase: Đã kết nối' : 'Cơ sở dữ liệu Supabase: Chưa kết nối (Bấm để cấu hình)'}
              className={`px-2.5 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isSupabaseConfigured()
                  ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300 shadow-glow'
                  : 'bg-slate-800/90 text-slate-300 hover:text-white hover:bg-slate-700 border-slate-700'
              }`}
            >
              <Database className={`w-3.5 h-3.5 ${isSupabaseConfigured() ? 'text-emerald-400' : 'text-amber-400'}`} />
              <span className="hidden xl:inline text-[11px]">
                {isSupabaseConfigured() ? 'Cloud DB' : 'Cấu hình DB'}
              </span>
            </button>

            {/* Authenticated User Status or Login Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-1.5 bg-slate-800/80 border border-slate-700 p-1 rounded-2xl relative">
                
                {/* Notification Bell with Badge */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                    title="Hộp thư thông báo thời gian thực"
                    className="p-2 rounded-xl bg-slate-900 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative"
                  >
                    <Bell className="w-4 h-4 text-amber-400" />
                    {userUnreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-600 text-white rounded-full text-[9px] font-black flex items-center justify-center shadow-glow animate-pulse">
                        {userUnreadCount > 9 ? '9+' : userUnreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notification Dropdown Flyout */}
                  {isNotificationOpen && (
                    <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-3xl bg-slate-950 border border-slate-700 shadow-2xl z-50 p-4 space-y-3 animate-fadeIn text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <Bell className="w-4 h-4 text-amber-400" />
                          <h4 className="font-black text-white text-xs">THÔNG BÁO TỨC THÌ</h4>
                          {userUnreadCount > 0 && (
                            <span className="px-1.5 py-0.2 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-bold">
                              {userUnreadCount} mới
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1">
                          {userUnreadCount > 0 && (
                            <button
                              type="button"
                              onClick={() => markAllNotificationsAsRead()}
                              className="text-[10px] text-emerald-400 hover:underline font-bold"
                              title="Đánh dấu tất cả đã đọc"
                            >
                              Đã đọc hết
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Push Permission Prompt if not granted */}
                      {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
                        <div className="p-2.5 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between gap-2">
                          <span className="text-[10px] text-purple-200 leading-tight">
                            Bật thông báo đẩy Web Push trên trình duyệt?
                          </span>
                          <button
                            type="button"
                            onClick={() => requestPushPermission()}
                            className="px-2 py-1 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] shadow-sm shrink-0"
                          >
                            Bật Ngay
                          </button>
                        </div>
                      )}

                      {/* Notifications List */}
                      <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
                        {userNotifications.map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationAsRead(n.id);
                              if (n.linkView) {
                                setActiveView(n.linkView);
                                setIsNotificationOpen(false);
                              }
                            }}
                            className={`p-2.5 rounded-2xl border transition-all cursor-pointer ${
                              !n.isRead 
                                ? 'bg-slate-900 border-amber-500/40 hover:bg-slate-850 shadow-sm' 
                                : 'bg-slate-950/60 border-slate-800/80 opacity-70 hover:opacity-100 hover:bg-slate-900'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-2">
                              <span className="font-bold text-white text-xs leading-tight">{n.title}</span>
                              <span className="text-[9px] text-slate-500 shrink-0">{n.createdAt}</span>
                            </div>
                            <p className="text-[11px] text-slate-300 mt-1 leading-snug">{n.message}</p>
                          </div>
                        ))}

                        {userNotifications.length === 0 && (
                          <div className="p-6 text-center text-slate-500 text-xs">
                            Không có thông báo nào.
                          </div>
                        )}
                      </div>

                      {/* Bottom Footer Actions */}
                      {userNotifications.length > 0 && (
                        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                          <span>Tự động đồng bộ với Cờ đỏ & BQT</span>
                          <button
                            type="button"
                            onClick={() => clearAllNotifications()}
                            className="text-rose-400 hover:underline"
                          >
                            Xóa tất cả
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div 
                  className="flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-slate-700/60 rounded-xl transition-colors"
                  onClick={() => workspace && setActiveView(workspace.view as any)}
                  title="Nhấn để về không gian làm việc của bạn"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-red-600 to-amber-600 text-white font-black text-xs flex items-center justify-center">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white leading-tight">{currentUser.name}</p>
                    <p className="text-[10px] text-amber-400 leading-tight">{currentUser.roleTitle}</p>
                  </div>
                </div>

                {/* Change Password Button for ALL Users */}
                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  title="Đổi mật khẩu mới"
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-amber-950 text-slate-400 hover:text-amber-300 border border-slate-700 hover:border-amber-700 transition-colors flex items-center gap-1"
                >
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline text-[11px] font-bold text-amber-300 pr-1">Đổi MK</span>
                </button>

                <button
                  onClick={logout}
                  title="Đăng xuất khỏi hệ thống"
                  className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-300 border border-slate-700 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveView('portal')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-glow flex items-center gap-1.5"
              >
                <span>🔐</span>
                <span>Đăng Nhập</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-3 space-y-2 animate-fadeIn text-xs">
          <button
            onClick={() => { setActiveView('portal'); setIsMobileMenuOpen(false); }}
            className="w-full text-left p-2.5 rounded-xl bg-slate-900 text-white font-bold flex items-center gap-2"
          >
            <span>🌐</span>
            <span>Cổng Công Cộng</span>
          </button>

          {currentUser && workspace && (
            <button
              onClick={() => { setActiveView(workspace.view as any); setIsMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2 ${
                activeView === workspace.view ? 'bg-red-600 text-white shadow-glow' : 'bg-slate-900 text-slate-300'
              }`}
            >
              <span>{workspace.icon}</span>
              <span>{workspace.label}</span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={() => { setIsChangePasswordOpen(true); setIsMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-xl bg-slate-900 hover:bg-amber-950 text-amber-300 font-bold flex items-center gap-2 border border-slate-800"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>🔑 Đổi Mật Khẩu ({currentUser.username})</span>
            </button>
          )}

          {currentUser && (
            <button
              onClick={() => { logout(); setIsMobileMenuOpen(false); }}
              className="w-full text-left p-2.5 rounded-xl bg-slate-900 text-rose-400 font-bold flex items-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng Xuất ({currentUser.name})</span>
            </button>
          )}
        </div>
      )}

      {/* Reusable Change Password Modal for Current User */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* Supabase Cloud Database Configuration & Sync Modal */}
      <SupabaseConfigModal
        isOpen={isSupabaseModalOpen}
        onClose={() => setIsSupabaseModalOpen(false)}
      />

    </header>
  );
};
