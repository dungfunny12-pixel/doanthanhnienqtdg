import React, { useState, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Shield, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  MessageSquare, 
  Upload, 
  TrendingUp, 
  TrendingDown, 
  User, 
  Calendar, 
  Image as ImageIcon, 
  X, 
  FileText, 
  Send,
  Award,
  ChevronDown,
  ChevronUp,
  History,
  Lock,
  Unlock,
  Layers,
  Sparkles,
  Save,
  RotateCcw,
  Check,
  Eye,
  Search,
  FileSpreadsheet,
  Copy,
  CheckSquare,
  Square,
  Filter,
  Download
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Violation, ClassWeeklyScore } from '../../types';
import { PhotoViewerModal } from '../common/PhotoViewerModal';

export const ManagerPortal: React.FC = () => {
  const { 
    currentUser, 
    activeWeek, 
    activeView,
    setActiveView,
    classes, 
    students,
    violations, 
    getClassScore, 
    updateViolationStatus, 
    submitAppeal,
    updateStudent,
    feeLocks,
    toggleFeeLock,
    isFeeMonthLocked,
    payYearlyFee,
    batchUpdateUnionFee,
    isWeekLocked
  } = useApp();

  // GVCN's assigned class ID
  const defaultClassId = currentUser?.classId || '10/1';
  const [selectedClassId, setSelectedClassId] = useState<string>(defaultClassId);

  // Tab: Inbox vs Student list vs History
  const [activeTab, setActiveTab] = useState<'inbox' | 'students' | 'history'>('inbox');
  const [inboxGroupFilter, setInboxGroupFilter] = useState<string>('ALL');

  // Student selection & filters for GVCN
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentFilter, setStudentFilter] = useState<'all' | 'union' | 'non_union' | 'paid_all' | 'unpaid'>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Month selector for Union Fee tracking (All 9 school months: 9, 10, 11, 12, 1, 2, 3, 4, 5)
  const MONTHS = ['Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'];
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Expanded violation row for details
  const [expandedVioId, setExpandedVioId] = useState<string | null>(null);

  // Photo viewer state
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  // Appeal modal state
  const [appealingVio, setAppealingVio] = useState<Violation | null>(null);
  const [appealReason, setAppealReason] = useState<string>('');
  const [appealProof, setAppealProof] = useState<string>(
    'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80'
  );
  const appealFileInputRef = useRef<HTMLInputElement>(null);

  const handleAppealFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          setAppealProof(reader.result as string);
        }
      };
      reader.readAsDataURL(files[0]);
    }
  };

  // Get class weekly score
  const classScore: ClassWeeklyScore | undefined = getClassScore(selectedClassId, activeWeek);
  const classInfo = classes.find(c => c.id === selectedClassId);

  // Class violations this week
  const classViolations = violations.filter(v => v.classId === selectedClassId && v.weekNumber === activeWeek);
  const pendingViolations = classViolations.filter(v => v.status === 'pending' || v.status === 'appealed');
  const acceptedViolations = classViolations.filter(v => v.status === 'accepted');

  // Filtered inbox violations by selected group
  const filteredPendingViolations = inboxGroupFilter === 'ALL'
    ? pendingViolations
    : pendingViolations.filter(v => v.groupName.toLowerCase().includes(inboxGroupFilter.toLowerCase()) || v.criterionId.startsWith(inboxGroupFilter));

  // Category breakdown calculation
  const groupDeductions: Record<string, number> = {
    'Chuyên cần': 0,
    'Vệ sinh': 0,
    'Nề nếp tự quản': 0,
    'Tác phong': 0
  };
  classViolations.forEach(v => {
    if (v.status !== 'approved_appeal' && v.status !== 'cancelled') {
      const gName = v.groupName?.includes('Chuyên cần') ? 'Chuyên cần'
        : v.groupName?.includes('Vệ sinh') ? 'Vệ sinh'
        : v.groupName?.includes('Nề nếp') ? 'Nề nếp tự quản'
        : v.groupName?.includes('Tác phong') ? 'Tác phong'
        : v.groupName || 'Khác';
      if (groupDeductions[gName] !== undefined) {
        groupDeductions[gName] += v.pointsDeducted;
      }
    }
  });

  const calculatedTotalDeduct = Object.values(groupDeductions).reduce((a, b) => a + b, 0);
  const displayTotalDeduct = classScore !== undefined ? classScore.totalDeduction : calculatedTotalDeduct;
  const displayFinalScore = classScore !== undefined ? classScore.finalScore : (1440 - calculatedTotalDeduct);
  const displayRank = classScore?.rank ?? 1;

  // Radar chart score ratios (0 to 100)
  const radarAxes = [
    { label: 'I.1 Chuyên cần', max: 240, deduct: groupDeductions['Chuyên cần'] || 0, color: '#f97316' },
    { label: 'I.2 Vệ sinh', max: 180, deduct: groupDeductions['Vệ sinh'] || 0, color: '#22c55e' },
    { label: 'I.3 Nề nếp tự quản', max: 390, deduct: groupDeductions['Nề nếp tự quản'] || 0, color: '#3b82f6' },
    { label: 'I.4 Tác phong', max: 540, deduct: groupDeductions['Tác phong'] || 0, color: '#a855f7' },
    { label: 'Phong trào Đoàn', max: 100, deduct: 0, color: '#eab308' },
    { label: 'Sự kiện phong trào', max: 100, deduct: 0, color: '#ec4899' }
  ];

  const radarPoints = radarAxes.map((axis, i) => {
    const angle = (Math.PI * 2 / radarAxes.length) * i - Math.PI / 2;
    const healthPercent = Math.max(20, Math.min(100, Math.round(((axis.max - axis.deduct) / axis.max) * 100)));
    const radius = (healthPercent / 100) * 80;
    const x = 110 + radius * Math.cos(angle);
    const y = 110 + radius * Math.sin(angle);
    return { x, y, angle, label: axis.label, percent: healthPercent, color: axis.color };
  });

  const radarPolygonPath = radarPoints.map(p => `${p.x},${p.y}`).join(' ');

  // Handle Accept Violation
  const handleAcceptViolation = (id: string) => {
    updateViolationStatus(id, 'accepted');
  };

  // Submit Appeal Form
  const handleSendAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealingVio || !appealReason.trim()) return;
    submitAppeal(appealingVio.id, appealReason, appealProof ? [appealProof] : []);
    setAppealingVio(null);
    setAppealReason('');
  };

  // Class students from Master Data
  const classStudents = students.filter(s => s.classId === selectedClassId);
  const unionMembers = classStudents.filter(s => s.isUnionMember);

  // Access Guard: Only GVCN (manager) and Admin can access ManagerPortal
  if (currentUser?.role !== 'admin' && currentUser?.role !== 'manager') {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5 animate-fadeIn">
        <div className="p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center text-3xl mx-auto shadow-glow">
            🛡️
          </div>
          <h2 className="text-lg font-black text-white">TRUY CẬP BỊ HẠN CHẾ (ACCESS RESTRICTED)</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Trang này dành riêng cho <strong>Giáo viên Chủ nhiệm (GVCN)</strong> và <strong>Ban Quản trị (Admin)</strong>.
            Tài khoản của bạn ({currentUser?.name}) đang đăng nhập với vai trò: <strong className="text-amber-400">{currentUser?.roleTitle || 'Bí thư Chi đoàn'}</strong>.
          </p>
          <button
            type="button"
            onClick={() => {
              if (currentUser?.role === 'youth_secretary') setActiveView('secretary');
              else if (currentUser?.role === 'auditor') setActiveView('auditor');
              else if (currentUser?.role === 'user') setActiveView('student');
              else setActiveView('portal');
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-glow transition-all active:scale-95"
          >
            Quay Về Không Gian Làm Việc Của Bạn ➔
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      
      {/* Header Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-2xl shadow-glow-blue">
            🏫
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">TRANG LỚP CHỦ NHIỆM</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-xs font-bold">
                {classInfo?.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              GVCN: <strong>{classInfo?.gvcnName}</strong> • Sĩ số: {classInfo?.totalStudents} học sinh ({classInfo?.unionMembers} Đoàn viên)
            </p>
          </div>
        </div>

        {/* Quick Class Switcher (ONLY for Admin) */}
        {currentUser?.role === 'admin' && (
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-400">Xem lớp:</span>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs focus:outline-none focus:border-blue-500"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.name} - {c.gvcnName}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Overview Cards & Radar Chart Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Card 1: Score & Rank */}
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-400 uppercase">Điểm Thi Đua Tuần {activeWeek}</h3>
            <span className="px-2.5 py-1 rounded-full text-xs font-black bg-amber-950 text-amber-300 border border-amber-800 shadow-sm">
              Hạng #{displayRank} / 18
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-3xl sm:text-4xl font-black text-white">
              {displayFinalScore}
            </span>
            <span className="text-xs text-slate-400 font-medium">/ 1440 điểm chuẩn</span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <span className="text-slate-400">Trừ nề nếp: <strong className="text-rose-400">-{displayTotalDeduct}đ</strong></span>
            <span className="text-slate-400">Vị thứ: <strong className="text-amber-400 font-black">#{displayRank} / 18</strong></span>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-800/60">
            {Object.entries(groupDeductions).map(([group, pts]) => {
              const totalForPercent = displayTotalDeduct > 0 ? displayTotalDeduct : 1;
              const percent = displayTotalDeduct > 0 ? Math.round((pts / totalForPercent) * 100) : 0;
              return (
                <div key={group} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-300">{group}</span>
                    <span className="font-mono text-rose-400">-{pts}đ</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full rounded-full ${
                        group === 'Chuyên cần' ? 'bg-amber-500' :
                        group === 'Vệ sinh' ? 'bg-emerald-500' :
                        group === 'Nề nếp tự quản' ? 'bg-blue-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${pts > 0 ? Math.max(10, percent) : 0}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Radar Chart (Biểu Đồ Màng Nhện 6 Trục Nhận Diện Điểm Yếu) */}
        <div className="md:col-span-2 glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-300 uppercase flex items-center gap-1.5">
              <span>🕸️</span>
              <span>Biểu Đồ Màng Nhện Đánh Giá Nề Nếp & Phong Trào (Radar Chart 6 Trục)</span>
            </h3>
            <span className="text-[11px] text-amber-400 font-bold">Mức chuẩn: 100%</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Giúp GVCN nhận diện trực quan điểm yếu và trục nề nếp cần chấn chỉnh trong sinh hoạt lớp Thứ 2.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 pt-2">
            {/* SVG Radar Spider Web */}
            <div className="relative w-56 h-56 shrink-0">
              <svg viewBox="0 0 220 220" className="w-full h-full">
                {/* Background Grid Concentric Polygons */}
                {[0.25, 0.5, 0.75, 1].map((lvl, lIdx) => {
                  const ringPath = radarAxes.map((_, i) => {
                    const angle = (Math.PI * 2 / radarAxes.length) * i - Math.PI / 2;
                    const r = 80 * lvl;
                    return `${110 + r * Math.cos(angle)},${110 + r * Math.sin(angle)}`;
                  }).join(' ');
                  return (
                    <polygon
                      key={lIdx}
                      points={ringPath}
                      fill="none"
                      stroke="#334155"
                      strokeWidth="0.8"
                      strokeDasharray={lvl < 1 ? '2 2' : 'none'}
                    />
                  );
                })}

                {/* Axis Radial Lines */}
                {radarAxes.map((_, i) => {
                  const angle = (Math.PI * 2 / radarAxes.length) * i - Math.PI / 2;
                  const x2 = 110 + 80 * Math.cos(angle);
                  const y2 = 110 + 80 * Math.sin(angle);
                  return (
                    <line key={i} x1="110" y1="110" x2={x2} y2={y2} stroke="#334155" strokeWidth="0.8" />
                  );
                })}

                {/* Filled Radar Area */}
                <polygon
                  points={radarPolygonPath}
                  fill="rgba(59, 130, 246, 0.3)"
                  stroke="#3b82f6"
                  strokeWidth="2"
                />

                {/* Radar Vertex Dots */}
                {radarPoints.map((pt, i) => (
                  <circle
                    key={i}
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill={pt.color}
                    stroke="#ffffff"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            </div>

            {/* Radar Legend Metrics */}
            <div className="grid grid-cols-2 gap-2 text-xs w-full max-w-sm">
              {radarPoints.map((pt, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950/90 border border-slate-800 flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-2 min-w-0 pr-1">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: pt.color }}></span>
                    <span className="text-[11px] text-slate-200 font-bold truncate" title={pt.label}>{pt.label}</span>
                  </div>
                  <span className={`font-mono font-black text-xs shrink-0 ${pt.percent >= 90 ? 'text-emerald-400' : pt.percent >= 75 ? 'text-amber-400' : 'text-rose-400'}`}>
                    {pt.percent}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Main Tabs Navigation */}
      <div className="flex border-b border-slate-800 space-x-4 text-xs font-bold">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'inbox'
              ? 'border-b-2 border-red-500 text-red-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Hộp Thư Nề Nếp & Khiếu Nại ({pendingViolations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'students'
              ? 'border-b-2 border-red-500 text-red-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Hồ Sơ Đoàn Viên / Học Sinh Lớp</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 transition-colors flex items-center gap-2 ${
            activeTab === 'history'
              ? 'border-b-2 border-red-500 text-red-400'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Lịch Sử Đã Chốt ({acceptedViolations.length})</span>
        </button>
      </div>

      {/* ================= TAB 1: VIOLATION INBOX ================= */}
      {activeTab === 'inbox' && (
        <div className="space-y-4">
          
          {/* Group Filter Bar for GVCN Inbox */}
          <div className="flex overflow-x-auto pb-1.5 border-b border-slate-800 space-x-2 text-xs font-bold">
            {[
              { id: 'ALL', label: 'Tất cả các nhóm', color: '#94a3b8', borderActive: 'border-slate-400 text-white' },
              { id: 'Chuyên cần', label: 'I.1 Chuyên cần', color: '#f97316', borderActive: 'border-orange-500 text-orange-400' },
              { id: 'Vệ sinh', label: 'I.2 Vệ sinh', color: '#22c55e', borderActive: 'border-emerald-500 text-emerald-400' },
              { id: 'Nề nếp tự quản', label: 'I.3 Nề nếp tự quản', color: '#3b82f6', borderActive: 'border-blue-500 text-blue-400' },
              { id: 'Tác phong', label: 'I.4 Tác phong', color: '#a855f7', borderActive: 'border-purple-500 text-purple-400' },
              { id: 'Phong trào', label: 'Thành tích/Phong trào 🏆', color: '#eab308', borderActive: 'border-amber-400 text-amber-300' },
            ].map(group => {
              const count = group.id === 'ALL'
                ? pendingViolations.length
                : pendingViolations.filter(v => v.groupName.toLowerCase().includes(group.id.toLowerCase()) || v.criterionId.startsWith(group.id)).length;

              const isActive = inboxGroupFilter === group.id;

              return (
                <button
                  key={group.id}
                  onClick={() => setInboxGroupFilter(group.id)}
                  className={`pb-2 px-3 whitespace-nowrap transition-all border-b-2 font-bold flex items-center gap-1.5 ${
                    isActive 
                      ? group.borderActive 
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                  style={isActive ? { borderBottomColor: group.color } : {}}
                >
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: group.color }}></span>
                  <span>{group.label}</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    count > 0 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-slate-900 text-slate-500'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {filteredPendingViolations.length === 0 ? (
            <div className="glass-panel rounded-3xl p-10 text-center text-slate-400 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="font-bold text-white text-base">Không có vi phạm nào đang chờ phản hồi trong nhóm này.</p>
              <p className="text-xs text-slate-500">Lớp đang duy trì nề nếp rất tốt trong Tuần {activeWeek}.</p>
              {acceptedViolations.length > 0 && inboxGroupFilter === 'ALL' && (
                <div className="pt-2">
                  <button
                    onClick={() => setActiveTab('history')}
                    className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-blue-400 text-xs font-bold transition-all inline-flex items-center gap-1.5"
                  >
                    <span>Lớp có {acceptedViolations.length} vi phạm đã chốt chính thức trong tuần ➔ Xem Lịch Sử</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPendingViolations.map(vio => {
                const isExpanded = expandedVioId === vio.id;
                return (
                  <div
                    key={vio.id}
                    className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-card"
                  >
                    {/* Header Row */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
                      <div className="flex items-start space-x-3">
                        <span className="p-2 rounded-xl bg-red-600/20 text-red-400 font-black text-xs border border-red-600/30">
                          {vio.day}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-white text-sm">{vio.criterionName}</h4>
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-rose-400 border border-slate-700">
                              -{vio.pointsDeducted}đ (x{vio.quantity})
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">
                            Ghi nhận bởi: <strong>{vio.reportedBy.name}</strong> • {vio.reportedAt}
                          </p>
                        </div>
                      </div>

                      {/* Right Actions & Countdown */}
                      <div className="flex items-center space-x-2">
                        {vio.status === 'pending' && (
                          <div className="flex items-center gap-1 text-[11px] text-amber-400 font-bold bg-amber-950/60 px-2 py-1 rounded-lg border border-amber-800">
                            <Clock className="w-3 h-3 animate-spin" />
                            <span>Còn 18h phản hồi</span>
                          </div>
                        )}

                        {vio.status === 'appealed' && (
                          <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-purple-950 text-purple-300 border border-purple-800">
                            ⏳ Đã gửi phúc khảo
                          </span>
                        )}

                        <button
                          onClick={() => setExpandedVioId(isExpanded ? null : vio.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-4 text-xs">
                        {vio.note && (
                          <div>
                            <span className="font-bold text-slate-400">Ghi chú từ Cờ đỏ:</span>
                            <p className="text-slate-200 mt-0.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                              {vio.note}
                            </p>
                          </div>
                        )}

                        {vio.studentNames && (
                          <div>
                            <span className="font-bold text-slate-400">Học sinh vi phạm:</span>
                            <p className="text-amber-300 font-medium mt-0.5">
                              {vio.studentNames.join(', ')}
                            </p>
                          </div>
                        )}

                        {/* Proof Photos */}
                        {vio.proofImages.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-400 block mb-1.5">Ảnh minh chứng đính kèm:</span>
                            <div className="flex gap-2">
                              {vio.proofImages.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt="Minh chứng"
                                  onClick={() => setViewingPhoto(img)}
                                  className="w-24 h-24 object-cover rounded-xl border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Appeal status details if appealed */}
                        {vio.appeal && (
                          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1">
                            <p className="font-bold text-purple-300">Nội dung đã giải trình phúc khảo:</p>
                            <p className="text-slate-200">{vio.appeal.reason}</p>
                            <p className="text-[10px] text-purple-400">Bởi: {vio.appeal.appealedBy} lúc {vio.appeal.appealedAt}</p>
                          </div>
                        )}

                        {/* Decision Buttons for GVCN */}
                        {vio.status === 'pending' && (
                          <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-end gap-2">
                            {isWeekLocked ? (
                              <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold flex items-center gap-1.5">
                                <Lock className="w-3.5 h-3.5 text-rose-400" />
                                <span>Tuần {activeWeek} đã đóng băng dữ liệu (Khóa sổ)</span>
                              </span>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleAcceptViolation(vio.id)}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center gap-1.5 active:scale-95"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Xác Nhận Lỗi (Chấp nhận trừ điểm)</span>
                                </button>

                                <button
                                  onClick={() => setAppealingVio(vio)}
                                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition-colors flex items-center gap-1.5 shadow-glow active:scale-95"
                                >
                                  <MessageSquare className="w-4 h-4" />
                                  <span>Yêu Cầu Phúc Khảo / Khiếu Nại</span>
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: 9-MONTH UNION FEES TRACKING TABLE (READ-ONLY FOR GVCN) ================= */}
      {activeTab === 'students' && (() => {
        const isClassFeeLocked = Boolean(feeLocks[`${selectedClassId}_ALL_YEAR`]);
        const totalPaidAll = unionMembers.reduce((acc, st) => {
          const count = MONTHS.filter(m => (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid').length;
          return acc + count;
        }, 0);
        const totalPossible = unionMembers.length * 9;
        const totalYearPercent = totalPossible > 0 ? Math.round((totalPaidAll / totalPossible) * 100) : 0;
        const fullyPaidUnionCount = unionMembers.filter(st => {
          const count = MONTHS.filter(m => (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid').length;
          return count === 9;
        }).length;
        const pendingUnionCount = unionMembers.length - fullyPaidUnionCount;
        const nonUnionCount = classStudents.length - unionMembers.length;

        const filteredStudents = classStudents.filter(st => {
          if (studentSearch.trim()) {
            const q = studentSearch.toLowerCase().trim();
            const matchName = st.name.toLowerCase().includes(q);
            const matchId = st.studentId.toLowerCase().includes(q);
            if (!matchName && !matchId) return false;
          }
          if (studentFilter === 'union') return st.isUnionMember;
          if (studentFilter === 'non_union') return !st.isUnionMember;
          if (studentFilter === 'paid_all') {
            if (!st.isUnionMember) return false;
            const paidCount = MONTHS.filter(m => (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid').length;
            return paidCount === 9;
          }
          if (studentFilter === 'unpaid') {
            if (!st.isUnionMember) return false;
            const paidCount = MONTHS.filter(m => (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid').length;
            return paidCount < 9;
          }
          return true;
        });

        const isAllSelected = filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length;

        const handleToggleSelectAll = () => {
          if (isAllSelected) {
            setSelectedStudentIds([]);
          } else {
            setSelectedStudentIds(filteredStudents.map(s => s.id));
          }
        };

        const handleToggleSelectStudent = (id: string) => {
          setSelectedStudentIds(prev => 
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
          );
        };

        const handleExportExcel = () => {
          const targetStudents = selectedStudentIds.length > 0
            ? classStudents.filter(s => selectedStudentIds.includes(s.id))
            : filteredStudents;

          const data = targetStudents.map((st, idx) => {
            const isUnion = st.isUnionMember;
            const paidCount = isUnion ? MONTHS.filter(m => (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid').length : 0;
            
            const row: Record<string, any> = {
              'STT': idx + 1,
              'Mã Học Sinh': st.studentId,
              'Họ và Tên': st.name,
              'Số Điện Thoại': st.phone || '',
              'Địa Chỉ Liên Hệ': st.address || '',
              'Lớp': classInfo?.name || selectedClassId,
              'Tư Cách': isUnion ? 'Đoàn viên' : 'Học sinh (Chưa vào Đoàn)',
            };

            MONTHS.forEach(m => {
              const shortM = 'T' + m.replace('Tháng ', '');
              if (!isUnion) {
                row[shortM] = 'Không thu';
              } else {
                const isPaid = (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid';
                row[shortM] = isPaid ? 'Đã nộp' : 'Chưa nộp';
              }
            });

            row['Tiến Độ'] = isUnion ? `${paidCount}/9 (${Math.round((paidCount / 9) * 100)}%)` : 'Không thu';
            row['Tình Trạng'] = isUnion ? (paidCount === 9 ? 'Đã nộp đủ 9T' : `Còn nợ ${9 - paidCount} tháng`) : 'Chưa vào Đoàn (Không thu)';

            return row;
          });

          const ws = XLSX.utils.json_to_sheet(data);
          const wb = XLSX.utils.book_new();
          XLSX.utils.book_append_sheet(wb, ws, `DoanPhi_${selectedClassId.replace('/', '_')}`);
          XLSX.writeFile(wb, `Bao_Cao_Doan_Phi_${classInfo?.name?.replace(/\s+/g, '_') || selectedClassId}.xlsx`);
        };

        const handleCopySelectedNames = () => {
          const targetStudents = classStudents.filter(s => selectedStudentIds.includes(s.id));
          const text = targetStudents.map((s, i) => `${i + 1}. ${s.name} (${s.studentId}) - ${s.isUnionMember ? 'Đoàn viên' : 'Học sinh'}`).join('\n');
          navigator.clipboard.writeText(text);
          setSaveSuccessMsg(`📋 Đã sao chép danh sách ${targetStudents.length} học sinh vào bộ nhớ tạm!`);
          setTimeout(() => setSaveSuccessMsg(null), 3000);
        };

        return (
          <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4 animate-fadeIn">
            
            {/* Header & Mode Badge */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-sm sm:text-base font-black text-white">BẢNG THEO DÕI THU ĐOÀN PHÍ 9 THÁNG</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-950 text-blue-400 border border-blue-800 text-xs font-bold">
                    {classInfo?.name}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700 text-[11px] font-bold flex items-center gap-1.5 shadow-sm">
                    <Eye className="w-3.5 h-3.5 text-blue-400" />
                    <span>Chế độ Chỉ Xem (GVCN)</span>
                  </span>
                  {isClassFeeLocked && (
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-950 text-amber-300 border border-amber-800 text-[11px] font-black flex items-center gap-1">
                      <Lock className="w-3 h-3" /> ĐÃ KHÓA SỔ
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Sĩ số: <strong>{classStudents.length} học sinh</strong> ({unionMembers.length} Đoàn viên, {nonUnionCount} Học sinh chưa vào Đoàn) • 
                  Tổng thu cả năm: <strong className="text-emerald-400">{totalPaidAll} / {totalPossible} lượt thu</strong> ({totalYearPercent}%)
                </p>
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleExportExcel}
                  className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-emerald-950 text-slate-300 hover:text-emerald-300 border border-slate-800 hover:border-emerald-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                  title="Xuất bảng theo dõi đoàn phí ra file Excel"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Xuất Excel Báo Cáo</span>
                </button>
              </div>
            </div>

            {/* Read-Only Notice Box for GVCN */}
            <div className="p-3.5 rounded-2xl bg-blue-950/30 border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
              <div className="flex items-start sm:items-center gap-2.5">
                <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
                <div>
                  <strong className="text-blue-300">Quy định phân quyền:</strong> Giáo viên Chủ nhiệm theo dõi số liệu ở chế độ <em>Chỉ Xem</em>. Bí thư Chi đoàn <strong>({classInfo?.bithuName || 'Bí thư'})</strong> và Ban Thường vụ Đoàn trường trực tiếp phụ trách thu nộp và cập nhật dữ liệu.
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0 text-[11px] text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span> Đã nộp
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span> Chưa nộp
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-600 inline-block"></span> Không thu
                </span>
              </div>
            </div>

            {/* Notification Banner */}
            {saveSuccessMsg && (
              <div className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-500 text-xs font-bold text-emerald-300 flex items-center justify-between shadow-lg animate-fadeIn">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{saveSuccessMsg}</span>
                </div>
              </div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pt-1">
              
              {/* Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => setStudentFilter('all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    studentFilter === 'all'
                      ? 'bg-blue-600 text-white shadow-glow-blue'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Tất cả ({classStudents.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilter('union')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    studentFilter === 'union'
                      ? 'bg-blue-600 text-white shadow-glow-blue'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Đoàn viên ({unionMembers.length})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilter('non_union')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    studentFilter === 'non_union'
                      ? 'bg-blue-600 text-white shadow-glow-blue'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  Chưa vào Đoàn ({nonUnionCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilter('paid_all')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    studentFilter === 'paid_all'
                      ? 'bg-emerald-600 text-white shadow-glow'
                      : 'bg-slate-900 text-emerald-400 hover:text-emerald-300 border border-slate-800'
                  }`}
                >
                  Đã xong 9T ({fullyPaidUnionCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStudentFilter('unpaid')}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                    studentFilter === 'unpaid'
                      ? 'bg-rose-600 text-white shadow-glow'
                      : 'bg-slate-900 text-rose-400 hover:text-rose-300 border border-slate-800'
                  }`}
                >
                  Còn nợ ({pendingUnionCount})
                </button>
              </div>

              {/* Search input */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Tìm theo tên, mã học sinh..."
                  className="w-full pl-9 pr-8 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-blue-500"
                />
                {studentSearch && (
                  <button
                    type="button"
                    onClick={() => setStudentSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Batch Selection Action Bar */}
            {selectedStudentIds.length > 0 && (
              <div className="p-3 rounded-2xl bg-blue-950/90 border border-blue-500/80 text-xs text-white flex flex-wrap items-center justify-between gap-3 shadow-glow-blue animate-fadeIn">
                <div className="flex items-center gap-2 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0" />
                  <span>Đang chọn <strong>{selectedStudentIds.length}</strong> / {filteredStudents.length} học sinh</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleExportExcel}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-all"
                    title="Xuất riêng danh sách các bạn đã chọn ra Excel"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Xuất DS Đã Chọn ({selectedStudentIds.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopySelectedNames}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-400" />
                    <span>Sao Chép Tên</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedStudentIds([])}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all"
                  >
                    Bỏ chọn
                  </button>
                </div>
              </div>
            )}

            {/* DIRECT 9-MONTH MATRIX TABLE (READ-ONLY) */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 border-b border-slate-800 text-[11px]">
                    {/* Select All Checkbox Column */}
                    <th className="p-3 w-10 text-center">
                      <input
                        type="checkbox"
                        checked={isAllSelected}
                        onChange={handleToggleSelectAll}
                        className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                        title="Chọn tất cả / Bỏ chọn tất cả"
                      />
                    </th>
                    <th className="p-3 font-bold">Họ và Tên Đoàn Viên / Học Sinh</th>
                    <th className="p-3 font-bold text-center">Tư Cách</th>
                    {MONTHS.map((m, idx) => (
                      <th key={m} className="p-2 text-center whitespace-nowrap font-bold">
                        <div className="flex flex-col items-center">
                          <span className="text-slate-300 font-bold">T{m.replace('Tháng ', '')}</span>
                          <span className="text-[9px] text-slate-500">{idx < 5 ? 'HK1' : 'HK2'}</span>
                        </div>
                      </th>
                    ))}
                    <th className="p-2 text-center font-bold">Tiến Độ</th>
                    <th className="p-3 text-right font-bold">Tình Trạng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredStudents.map(st => {
                    const isSelected = selectedStudentIds.includes(st.id);
                    const isUnion = st.isUnionMember;
                    const paidMonthsCount = isUnion 
                      ? MONTHS.filter(m => (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid').length 
                      : 0;
                    const percent = isUnion ? Math.round((paidMonthsCount / 9) * 100) : 0;

                    return (
                      <tr 
                        key={st.id} 
                        className={`transition-colors ${
                          isSelected 
                            ? 'bg-blue-950/30 hover:bg-blue-950/40' 
                            : 'hover:bg-slate-800/40'
                        }`}
                      >
                        {/* Checkbox before student name */}
                        <td className="p-3 w-10 text-center">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectStudent(st.id)}
                            className="w-4 h-4 rounded text-blue-600 bg-slate-900 border-slate-700 focus:ring-blue-500 focus:ring-offset-0 cursor-pointer"
                            title={`Chọn ${st.name}`}
                          />
                        </td>

                        {/* Student Name */}
                        <td className="p-3 font-bold text-white whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="p-1 rounded-lg bg-slate-800 text-slate-300 text-xs">👤</span>
                            <div>
                              <span className="text-sm font-bold text-white">{st.name}</span>
                              <span className="text-[10px] text-slate-500 font-mono block">{st.studentId}</span>
                            </div>
                          </div>
                        </td>

                        {/* Union Status */}
                        <td className="p-3 text-center whitespace-nowrap">
                          {isUnion ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                              Đoàn viên
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-900 text-slate-400 border border-slate-800">
                              Học sinh
                            </span>
                          )}
                        </td>

                        {/* 9 Month Status Cells */}
                        {MONTHS.map(m => {
                          if (!isUnion) {
                            return (
                              <td key={m} className="p-1.5 text-center">
                                <span 
                                  className="inline-flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900/50 border border-slate-800/80 text-slate-600 text-xs font-mono select-none"
                                  title="Chưa kết nạp Đoàn - Không thu đoàn phí"
                                >
                                  —
                                </span>
                              </td>
                            );
                          }

                          const isPaid = (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid';
                          return (
                            <td key={m} className="p-1.5 text-center">
                              <div
                                className={`w-8 h-8 rounded-xl text-xs font-black flex items-center justify-center mx-auto border transition-all select-none ${
                                  isPaid
                                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80 shadow-sm'
                                    : 'bg-rose-950/30 text-rose-400/80 border-rose-900/40'
                                }`}
                                title={`${m}: ${isPaid ? 'Đã hoàn thành nộp Đoàn phí' : 'Chưa nộp Đoàn phí'}`}
                              >
                                {isPaid ? '✓' : '✕'}
                              </div>
                            </td>
                          );
                        })}

                        {/* Progress */}
                        <td className="p-2 text-center whitespace-nowrap">
                          {isUnion ? (
                            <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              percent === 100 ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                              percent >= 50 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-rose-950/50 text-rose-300 border border-rose-800'
                            }`}>
                              {paidMonthsCount}/9 ({percent}%)
                            </span>
                          ) : (
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-slate-900 text-slate-500 border border-slate-800 select-none">
                              Không thu
                            </span>
                          )}
                        </td>

                        {/* Status Summary */}
                        <td className="p-3 text-right whitespace-nowrap">
                          {isUnion ? (
                            percent === 100 ? (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 inline-flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                <span>Đã nộp đủ 9T</span>
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950 text-amber-300 border border-amber-800 inline-flex items-center gap-1">
                                <Clock className="w-3 h-3 text-amber-400" />
                                <span>Nợ {9 - paidMonthsCount} tháng</span>
                              </span>
                            )
                          ) : (
                            <span className="text-slate-500 text-xs italic">
                              Chưa vào Đoàn
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {filteredStudents.length === 0 && (
                    <tr>
                      <td colSpan={14} className="p-8 text-center text-slate-500">
                        Không tìm thấy học sinh nào phù hợp với bộ lọc hiện tại.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

          </div>
        );
      })()}

      {/* ================= TAB 3: HISTORY ================= */}
      {activeTab === 'history' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4">
          <h3 className="text-sm font-black text-white pb-3 border-b border-slate-800">CÁC LỖI ĐÃ XÁC NHẬN CHÍNH THỨC</h3>
          {acceptedViolations.length === 0 ? (
            <p className="text-xs text-slate-500 text-center py-6">Chưa có bản ghi nào.</p>
          ) : (
            <div className="space-y-2">
              {acceptedViolations.map(v => (
                <div key={v.id} className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-white">{v.criterionName}</span>
                    <p className="text-[11px] text-slate-400">{v.day} • Báo cáo bởi {v.reportedBy.name}</p>
                  </div>
                  <span className="font-black text-rose-400">-{v.pointsDeducted}đ</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: APPEAL / PHÚC KHẢO ================= */}
      {appealingVio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-600 text-white font-bold">⚖️</span>
                <div>
                  <h3 className="text-base font-black text-white">YÊU CẦU PHÚC KHẢO VI PHẠM</h3>
                  <p className="text-xs text-slate-400">Gửi giải trình trực tiếp đến Bí thư Đoàn trường</p>
                </div>
              </div>
              <button
                onClick={() => setAppealingVio(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 text-xs space-y-1">
              <p className="text-slate-400">Lỗi bị ghi nhận:</p>
              <p className="font-extrabold text-white">{appealingVio.criterionName} (Trừ {appealingVio.pointsDeducted}đ)</p>
              <p className="text-slate-400 text-[11px]">Ngày: {appealingVio.day} • {appealingVio.reportedAt}</p>
            </div>

            <form onSubmit={handleSendAppeal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  ✍️ Lý do giải trình / Minh chứng phản bác (Bắt buộc):
                </label>
                <textarea
                  rows={4}
                  required
                  value={appealReason}
                  onChange={(e) => setAppealReason(e.target.value)}
                  placeholder="Ví dụ: Học sinh bị ốm có giấy xác nhận của Phòng Y tế; Lớp đã trực nhật sạch sẽ lúc 6h45 nhưng lớp khác để rác..."
                  className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  📎 Ảnh giấy xin phép / Minh chứng đối chất:
                </label>
                <div className="flex items-center gap-3">
                  {appealProof && (
                    <img
                      src={appealProof}
                      alt="Giấy xin phép"
                      className="w-16 h-16 object-cover rounded-xl border border-slate-700"
                    />
                  )}
                  <button
                    type="button"
                    onClick={() => appealFileInputRef.current?.click()}
                    className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white flex items-center gap-1.5 cursor-pointer hover:border-slate-500 transition-colors"
                  >
                    <Upload className="w-4 h-4 text-amber-400" />
                    <span>Tải ảnh từ máy tính</span>
                  </button>
                  <input
                    type="file"
                    ref={appealFileInputRef}
                    onChange={handleAppealFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setAppealingVio(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-glow flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Đơn Phúc Khảo</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Photo Lightbox */}
      {viewingPhoto && (
        <PhotoViewerModal
          isOpen={true}
          onClose={() => setViewingPhoto(null)}
          imageUrl={viewingPhoto}
          title="Minh chứng vi phạm chi tiết"
        />
      )}

    </div>
  );
};
