import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Lock, 
  Unlock, 
  UserCircle2, 
  LogOut, 
  Menu, 
  X, 
  Shield, 
  GraduationCap, 
  KeyRound, 
  Bell, 
  Calendar, 
  AlertTriangle,
  Database,
  ChevronDown
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

  // Filter notifications strictly relevant to current logged-in user role & class authorization
  const userNotifications = notifications.filter(n => {
    // If not logged in, only public announcements with no class restriction
    if (!currentUser) {
      return (n.targetRole === 'all' || !n.targetRole) && (!n.targetClassId || n.targetClassId === 'ALL');
    }
    // Admin has full global visibility
    if (currentUser.role === 'admin') return true;

    // Check Role Authorization
    const roleMatches = !n.targetRole || n.targetRole === 'all' || n.targetRole === currentUser.role;

    // Check Class Authorization
    const classMatches = !n.targetClassId || n.targetClassId === 'ALL' || (currentUser.classId && n.targetClassId === currentUser.classId);

    return roleMatches && classMatches;
  });

  const userUnreadCount = userNotifications.filter(n => !n.isRead).length;

  // Determine user workspace route name and icon
  const getWorkspaceInfo = () => {
    if (!currentUser) return null;
    switch (currentUser.role) {
      case 'admin':
        return { view: 'admin', label: 'Bảng Điều Hành', icon: '🛡️' };
      case 'manager':
        return { view: 'manager', label: `Lớp ${currentUser.classId || '10/1'}`, icon: '🏫' };
      case 'auditor':
        return { view: 'auditor', label: 'Chấm Thi Đua', icon: '📋' };
      case 'youth_secretary':
        return { view: 'secretary', label: `Chi Đoàn ${currentUser.classId || '10/1'}`, icon: '🎖️' };
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
    <header className="sticky top-0 z-40 bg-slate-900/98 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Historical Year Read-Only Warning Banner - ONLY FOR ADMIN */}
      {isHistoricalYear && currentUser?.role === 'admin' && (
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 px-4 py-1.5 text-slate-950 font-black text-xs sm:text-sm flex items-center justify-between shadow-glow border-b border-amber-600">
          <div className="flex items-center gap-2 max-w-7xl mx-auto w-full">
            <AlertTriangle className="w-4 h-4 shrink-0 text-slate-950 animate-bounce" />
            <span className="truncate">
              ⚠️ ĐANG XEM DỮ LIỆU NĂM HỌC CŨ (CHẾ ĐỘ CHỈ XEM).
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              const current = academicYears.find(y => y.isCurrent);
              if (current) setSelectedAcademicYearId(current.id);
            }}
            className="px-2.5 py-0.5 bg-slate-950 text-amber-300 rounded-lg font-bold text-xs hover:bg-slate-900 shrink-0 shadow transition-all ml-2"
          >
            Về Năm Hiện Tại ↩
          </button>
        </div>
      )}

      {/* Top micro status bar */}
      <div className={`bg-gradient-to-r ${getThemeGradient(schoolSettings.themeColor)} px-3 sm:px-4 py-1 text-[11px] sm:text-xs text-white flex items-center justify-between font-medium`}>
        <div className="flex items-center gap-2 overflow-hidden max-w-[85%] sm:max-w-none">
          <span className="inline-block w-2 h-2 shrink-0 rounded-full bg-amber-300 animate-ping"></span>
          <span className="font-extrabold uppercase tracking-wide truncate">
            {schoolSettings.youthUnionName.toUpperCase()} – HỆ THỐNG QUẢN LÝ NỀ NẾP & THI ĐUA ĐIỆN TỬ
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {isWeekLocked ? (
            <span className="flex items-center gap-1 bg-red-950/90 text-red-200 px-2 py-0.5 rounded text-[10px] font-bold border border-red-700">
              <Lock className="w-2.5 h-2.5" /> <span className="hidden sm:inline">Tuần {activeWeek}</span> ĐÃ KHÓA
            </span>
          ) : (
            <span className="flex items-center gap-1 bg-emerald-950/90 text-emerald-300 px-2 py-0.5 rounded text-[10px] font-bold border border-emerald-700">
              <Unlock className="w-2.5 h-2.5" /> <span className="hidden sm:inline">Tuần {activeWeek}</span> ĐANG CHẤM
            </span>
          )}
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center space-x-2.5 cursor-pointer group shrink-0 min-w-0 max-w-[200px] sm:max-w-[320px] md:max-w-none"
            onClick={() => setActiveView('portal')}
          >
            {schoolSettings.logoUrl ? (
              <img 
                src={schoolSettings.logoUrl} 
                alt="Logo" 
                loading="eager"
                // @ts-ignore
                fetchPriority="high"
                decoding="async"
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl object-cover shadow-glow border border-red-400/40 group-hover:scale-105 transition-transform shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-red-600 to-red-500 flex items-center justify-center text-white shadow-glow border border-red-400/40 group-hover:scale-105 transition-transform shrink-0">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" fill="#F59E0B" stroke="#B45309" strokeWidth="1.2"/>
                </svg>
              </div>
            )}
            <div className="truncate min-w-0">
              <h1 className="text-xs sm:text-sm md:text-base font-black tracking-tight text-white group-hover:text-red-400 transition-colors truncate">
                {schoolSettings.schoolName.toUpperCase()}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-slate-400 font-medium truncate hidden xs:block">
                Cổng Thông Tin Nề Nếp & Phong Trào Đoàn
              </p>
            </div>
          </div>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1.5 shrink-0">
            <button
              onClick={() => setActiveView('portal')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
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
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  activeView === workspace.view
                    ? 'bg-red-600 text-white shadow-glow'
                    : 'bg-slate-800/90 text-amber-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
              >
                <span>{workspace.icon}</span>
                <span>{workspace.label}</span>
              </button>
            )}
          </nav>

          {/* Right Action Area */}
          <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
            
            {/* Academic Year Selector (Desktop only, Admin only) */}
            {currentUser?.role === 'admin' && (
              <div className="hidden xl:flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-2 py-1 text-xs shadow-inner shrink-0">
                <Calendar className="w-3.5 h-3.5 text-amber-400 mr-1 shrink-0" />
                <select
                  value={selectedAcademicYearId}
                  onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                  className={`bg-transparent font-bold outline-none cursor-pointer text-[11px] ${
                    isHistoricalYear ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                  title="Chọn Năm học để xem dữ liệu thi đua"
                >
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id} className="bg-slate-900 text-white">
                      {y.name} {y.isCurrent ? '(Hiện tại)' : '🔒'}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Week Selector (Desktop/Tablet) */}
            <div className="hidden md:flex items-center bg-slate-800/90 border border-slate-700 rounded-xl px-2 py-1 text-xs shadow-inner shrink-0">
              <span className="text-slate-400 mr-1 font-bold text-[11px]">Tuần:</span>
              <select
                value={activeWeek}
                onChange={(e) => setActiveWeek(Number(e.target.value))}
                className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer text-[11px]"
              >
                {weeksConfig
                  .filter(w => !w.isHidden || w.isCurrent || currentUser?.role === 'admin')
                  .map(w => (
                    <option key={w.weekNumber} value={w.weekNumber} className="bg-slate-900 text-white">
                      {w.title} {w.isCurrent ? '(Hiện tại)' : w.isLocked ? '🔒' : ''} {w.isHidden ? '(Đã ẩn)' : ''}
                    </option>
                  ))}
              </select>
            </div>

            {/* Notification Bell (Visible everywhere) */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                title="Hộp thư thông báo tức thời"
                className="p-1.5 sm:p-2 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors relative"
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
                <div className="absolute right-0 top-11 w-72 sm:w-80 md:w-96 rounded-2xl bg-slate-950 border border-slate-700 shadow-2xl z-50 p-3 sm:p-4 space-y-3 animate-fadeIn text-xs">
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

                    {userUnreadCount > 0 && (
                      <button
                        type="button"
                        onClick={() => markAllNotificationsAsRead()}
                        className="text-[10px] text-emerald-400 hover:underline font-bold"
                      >
                        Đã đọc hết
                      </button>
                    )}
                  </div>

                  {/* Push Permission Prompt if not granted */}
                  {typeof window !== 'undefined' && 'Notification' in window && Notification.permission !== 'granted' && (
                    <div className="p-2 rounded-xl bg-purple-950/40 border border-purple-800/60 flex items-center justify-between gap-2">
                      <span className="text-[10px] text-purple-200 leading-tight">
                        Bật thông báo đẩy Web Push?
                      </span>
                      <button
                        type="button"
                        onClick={() => requestPushPermission()}
                        className="px-2 py-0.5 rounded bg-purple-600 hover:bg-purple-500 text-white font-bold text-[10px] shadow-sm shrink-0"
                      >
                        Bật Ngay
                      </button>
                    </div>
                  )}

                  {/* Notifications List */}
                  <div className="max-h-64 overflow-y-auto space-y-2 pr-1">
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
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                          !n.isRead 
                            ? 'bg-slate-900 border-amber-500/40 hover:bg-slate-850 shadow-sm' 
                            : 'bg-slate-950/60 border-slate-800/80 opacity-70 hover:opacity-100 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-white text-xs leading-tight">{n.title}</span>
                            {n.targetRole && n.targetRole !== 'all' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-blue-950 text-blue-300 border border-blue-800">
                                {n.targetRole === 'manager' ? 'GVCN' : n.targetRole === 'auditor' ? 'Cờ Đỏ' : n.targetRole === 'youth_secretary' ? 'Bí Thư' : 'Học Sinh'}
                              </span>
                            )}
                            {n.targetClassId && n.targetClassId !== 'ALL' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                                Lớp {n.targetClassId}
                              </span>
                            )}
                          </div>
                          <span className="text-[9px] text-slate-500 shrink-0">{n.createdAt}</span>
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1 leading-snug">{n.message}</p>
                      </div>
                    ))}

                    {userNotifications.length === 0 && (
                      <div className="p-4 text-center text-slate-500 text-xs">
                        Không có thông báo nào.
                      </div>
                    )}
                  </div>

                  {/* Bottom Footer Actions */}
                  {userNotifications.length > 0 && (
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
                      <span>Tự động đồng bộ CSDL</span>
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

            {/* Authenticated User Status or Login Trigger */}
            {currentUser ? (
              <div className="flex items-center gap-1 bg-slate-800/80 border border-slate-700 p-0.5 sm:p-1 rounded-xl shrink-0">
                
                {/* User Avatar + Name (Desktop) */}
                <div 
                  className="flex items-center gap-1.5 px-1 sm:px-2 py-0.5 cursor-pointer hover:bg-slate-700/60 rounded-lg transition-colors max-w-[110px] sm:max-w-[160px] md:max-w-[200px]"
                  onClick={() => workspace && setActiveView(workspace.view as any)}
                  title={`Tài khoản: ${currentUser.name} (${currentUser.roleTitle}) - Bấm để về không gian làm việc`}
                >
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-gradient-to-tr from-red-600 to-amber-600 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-sm">
                    {currentUser.name.charAt(0)}
                  </div>
                  <div className="hidden sm:block text-left truncate min-w-0">
                    <p className="text-xs font-bold text-white leading-tight truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-amber-400 leading-tight truncate">{currentUser.roleTitle}</p>
                  </div>
                </div>

                {/* Change Password Button (Hidden on small mobile, available in drawer) */}
                <button
                  type="button"
                  onClick={() => setIsChangePasswordOpen(true)}
                  title="Đổi mật khẩu tài khoản"
                  className="hidden md:flex p-1 sm:p-1.5 rounded-lg bg-slate-900 hover:bg-amber-950 text-slate-300 hover:text-amber-300 border border-slate-700 hover:border-amber-700 transition-colors items-center gap-1 text-[11px] font-bold"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                  <span className="hidden xl:inline">Đổi MK</span>
                </button>

                {/* Logout Button (Hidden on small mobile, available in drawer) */}
                <button
                  type="button"
                  onClick={logout}
                  title="Đăng xuất khỏi hệ thống"
                  className="hidden md:flex p-1 sm:p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setActiveView('portal')}
                className="px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-glow flex items-center gap-1 shrink-0"
              >
                <span>🔐</span>
                <span className="hidden xs:inline">Đăng Nhập</span>
              </button>
            )}

            {/* Mobile Menu Button (Hamburger) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              title="Menu điều hướng di động"
              className="lg:hidden p-1.5 sm:p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shrink-0"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu (Full responsive & organized) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-950 border-b border-slate-800 px-4 py-4 space-y-3 animate-fadeIn text-xs max-h-[85vh] overflow-y-auto">
          
          {/* User Profile Card in Mobile Menu */}
          {currentUser && (
            <div className="p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-850 border border-slate-700/80 flex items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-amber-600 text-white font-black text-sm flex items-center justify-center shrink-0 shadow-md">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="truncate min-w-0">
                  <p className="font-black text-white text-xs sm:text-sm leading-tight truncate">{currentUser.name}</p>
                  <p className="text-[11px] text-amber-400 font-bold leading-tight truncate mt-0.5">{currentUser.roleTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => { setIsChangePasswordOpen(true); setIsMobileMenuOpen(false); }}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-amber-950 text-amber-300 border border-slate-700 text-xs font-bold flex items-center gap-1"
                  title="Đổi mật khẩu"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span className="text-[11px]">Đổi MK</span>
                </button>

                <button
                  type="button"
                  onClick={() => { logout(); setIsMobileMenuOpen(false); }}
                  className="p-2 rounded-xl bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800 text-xs font-bold"
                  title="Đăng xuất"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* Quick Selectors in Mobile Menu */}
          <div className="grid grid-cols-2 gap-2">
            {/* Week Selector Mobile */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
              <label className="text-[10px] font-bold text-slate-400 block mb-1">📅 Tuần thi đua:</label>
              <select
                value={activeWeek}
                onChange={(e) => setActiveWeek(Number(e.target.value))}
                className="w-full bg-slate-950 text-amber-400 font-bold rounded-lg p-1.5 text-xs outline-none border border-slate-800"
              >
                {weeksConfig
                  .filter(w => !w.isHidden || w.isCurrent || currentUser?.role === 'admin')
                  .map(w => (
                    <option key={w.weekNumber} value={w.weekNumber}>
                      {w.title} {w.isCurrent ? '(Hiện tại)' : w.isLocked ? '🔒' : ''} {w.isHidden ? '(Đã ẩn)' : ''}
                    </option>
                  ))}
              </select>
            </div>

            {/* Academic Year Mobile (Admin) */}
            {currentUser?.role === 'admin' ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2">
                <label className="text-[10px] font-bold text-slate-400 block mb-1">🎓 Năm học:</label>
                <select
                  value={selectedAcademicYearId}
                  onChange={(e) => setSelectedAcademicYearId(e.target.value)}
                  className={`w-full bg-slate-950 font-bold rounded-lg p-1.5 text-xs outline-none border border-slate-800 ${
                    isHistoricalYear ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {academicYears.map(y => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.isCurrent ? '(Hiện tại)' : '🔒'}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-2 flex flex-col justify-center">
                <span className="text-[10px] font-bold text-slate-400">🎓 Năm học:</span>
                <span className="text-xs font-bold text-emerald-400 mt-1">2025 - 2026 (Hiện tại)</span>
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <div className="space-y-1.5 pt-1">
            <button
              onClick={() => { setActiveView('portal'); setIsMobileMenuOpen(false); }}
              className={`w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 transition-all ${
                activeView === 'portal' ? 'bg-red-600 text-white shadow-glow' : 'bg-slate-900 text-slate-300 hover:text-white'
              }`}
            >
              <span className="text-base">🌐</span>
              <span>Cổng Thông Tin Công Cộng</span>
            </button>

            {currentUser && workspace && (
              <button
                onClick={() => { setActiveView(workspace.view as any); setIsMobileMenuOpen(false); }}
                className={`w-full text-left p-2.5 rounded-xl font-bold flex items-center gap-2.5 transition-all ${
                  activeView === workspace.view ? 'bg-red-600 text-white shadow-glow' : 'bg-slate-900 text-amber-300 hover:text-white border border-slate-800'
                }`}
              >
                <span className="text-base">{workspace.icon}</span>
                <span>Không Gian Làm Việc ({workspace.label})</span>
              </button>
            )}
          </div>

          {/* Supabase status in mobile drawer footer */}
          <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              CSDL Supabase: {isSupabaseConfigured() ? 'Đã kết nối Cloud' : 'Cục bộ'}
            </span>
            {currentUser?.role === 'admin' && (
              <button
                type="button"
                onClick={() => { setIsSupabaseModalOpen(true); setIsMobileMenuOpen(false); }}
                className="text-amber-400 hover:underline font-bold"
              >
                Cấu hình DB
              </button>
            )}
          </div>

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
