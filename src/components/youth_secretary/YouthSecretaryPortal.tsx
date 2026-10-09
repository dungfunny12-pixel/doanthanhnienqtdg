import React, { useState, useMemo, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  AlertCircle, 
  Calendar, 
  CheckCircle2, 
  Users, 
  Sparkles, 
  Bell, 
  Clock, 
  ChevronRight,
  Award,
  Lock,
  Unlock,
  Layers,
  Save,
  RotateCcw,
  Search,
  X,
  FileSpreadsheet,
  Copy,
  CheckSquare,
  Square,
  Filter,
  Plus,
  Trash2,
  Download,
  Send,
  Check,
  Flame,
  MessageSquare,
  Upload,
  ChevronDown,
  ChevronUp,
  Eye,
  Folder,
  Star,
  File
} from 'lucide-react';
import { ClassWeeklyScore, ActivityParticipant, ActivityNonParticipant, ActivityReport, Violation, DocumentFile } from '../../types';
import { PhotoViewerModal } from '../common/PhotoViewerModal';
import { MediaPickerButton } from '../common/MediaPickerButton';
import { RichTextEditor } from '../common/RichTextEditor';
import { RichTextViewer } from '../common/RichTextViewer';
import { DocumentViewerModal } from '../common/DocumentViewerModal';
import { SortableTh } from '../common/SortableTh';
import { sortDataList } from '../../utils/sortUtils';
import { SupabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import { compressImageToDataURL } from '../../utils/imageCompressor';
import * as XLSX from 'xlsx';

export const YouthSecretaryPortal: React.FC = () => {
  const { 
    currentUser, 
    activeWeek, 
    classes, 
    students,
    updateStudent,
    notices, 
    events,
    news,
    activityReports,
    submitActivityReport,
    deleteActivityReport,
    getClassScore, 
    violations, 
    updateViolationStatus,
    submitAppeal,
    isWeekLocked,
    registerForEvent,
    feeLocks,
    toggleFeeLock,
    isFeeMonthLocked,
    payYearlyFee,
    documentFolders,
    documentFiles,
    incrementDocumentDownloads,
    incrementDocumentViews
  } = useApp();

  const classId = currentUser?.classId || '10/1';
  const classScore: ClassWeeklyScore | undefined = getClassScore(classId, activeWeek);
  const classInfo = classes.find(c => c.id === classId);
  const classStudents = students.filter(s => s.classId === classId);
  const unionMembers = classStudents.filter(s => s.isUnionMember);

  // Main Navigation Tabs for Bí thư
  const [bithuTab, setBithuTab] = useState<'overview' | 'inbox' | 'activity_reports' | 'union_fee' | 'notices' | 'documents'>('overview');

  // Document management state for Bí thư
  const [selectedDocModal, setSelectedDocModal] = useState<DocumentFile | null>(null);
  const [docSearch, setDocSearch] = useState<string>('');
  const [docFolderFilter, setDocFolderFilter] = useState<string>('ALL');

  // Inbox & Appeals states for Bí thư
  const [inboxGroupFilter, setInboxGroupFilter] = useState<string>('ALL');
  const [expandedVioId, setExpandedVioId] = useState<string | null>(null);
  const [appealingVio, setAppealingVio] = useState<Violation | null>(null);
  const [appealReason, setAppealReason] = useState<string>('');
  const [appealProof, setAppealProof] = useState<string>('');
  const appealFileInputRef = useRef<HTMLInputElement>(null);
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  // Student selection & filters for Union Fee tracking
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [studentFilter, setStudentFilter] = useState<'all' | 'union' | 'non_union' | 'paid_all' | 'unpaid'>('all');
  const [studentSearch, setStudentSearch] = useState<string>('');

  // Month selector for Union Fee tracking (All 9 months)
  const MONTHS = ['Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'];
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Relevant notices & violations for this class
  const classNotices = notices.filter(n => n.targetClasses.includes('ALL') || n.targetClasses.includes(classId));
  const classVios = violations.filter(v => v.classId === classId && v.weekNumber === activeWeek);
  const pendingViolations = classVios.filter(v => v.status === 'pending' || v.status === 'appealed');
  const acceptedViolations = classVios.filter(v => v.status === 'accepted');

  const filteredPendingViolations = inboxGroupFilter === 'ALL'
    ? pendingViolations
    : pendingViolations.filter(v => v.groupName.toLowerCase().includes(inboxGroupFilter.toLowerCase()) || v.criterionId.startsWith(inboxGroupFilter));

  const handleAppealFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      try {
        if (isSupabaseConfigured()) {
          const publicUrl = await SupabaseService.uploadImage(file, 'proof_images');
          if (publicUrl) {
            setAppealProof(publicUrl);
            return;
          }
        }
        const compressed = await compressImageToDataURL(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82, outputFormat: 'image/webp' });
        if (compressed) {
          setAppealProof(compressed);
        }
      } catch (err) {
        console.error(err);
      } finally {
        e.target.value = '';
      }
    }
  };

  const handleAcceptViolation = (id: string) => {
    updateViolationStatus(id, 'accepted');
  };

  const handleSendAppeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appealingVio || !appealReason.trim()) return;
    submitAppeal(appealingVio.id, appealReason, appealProof ? [appealProof] : []);
    setAppealingVio(null);
    setAppealReason('');
    setAppealProof('');
  };

  // Class activity reports
  const classActivityReports = activityReports.filter(r => r.classId === classId);
  const [activeReportTab, setActiveReportTab] = useState<Record<string, 'participating' | 'non_participating'>>({});
  const [memberTableSort, setMemberTableSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });

  // Helper to get non-participants for an activity report in YouthSecretaryPortal
  const getReportNonParticipants = (report: ActivityReport): ActivityNonParticipant[] => {
    if (report.nonParticipants && report.nonParticipants.length > 0) {
      return report.nonParticipants;
    }
    const participantIds = new Set(report.participants.map((p: ActivityParticipant) => p.studentId.trim()));
    const participantNames = new Set(report.participants.map((p: ActivityParticipant) => p.name.trim().toLowerCase()));

    return classStudents
      .filter(s => !participantIds.has(s.studentId.trim()) && !participantNames.has(s.name.trim().toLowerCase()))
      .map(s => ({
        studentId: s.studentId,
        name: s.name,
        gender: s.gender as ('Nam' | 'Nữ'),
        phone: s.phone || '',
        isUnionMember: s.isUnionMember,
        reason: 'Chưa tham gia / Vắng mặt phong trào',
        note: ''
      }));
  };

  // ================= ACTIVITY REPORTING MODAL STATE =================
  const [isReportModalOpen, setIsReportModalOpen] = useState<boolean>(false);
  const [reportStudentSearch, setReportStudentSearch] = useState<string>('');
  const [reportForm, setReportForm] = useState<{
    activityId: string;
    activityTitle: string;
    activityType: 'the_thao' | 'tinh_nguyen' | 'van_nghe' | 'lao_dong' | 'phong_trao' | 'khac';
    customActivityTitle: string;
    participants: Record<string, {
      selected: boolean;
      role: string;
      achievement: string;
      note: string;
    }>;
    proofImages: string[];
  }>({
    activityId: events[0]?.id || 'custom',
    activityTitle: events[0]?.title || '',
    activityType: 'the_thao',
    customActivityTitle: '',
    participants: {},
    proofImages: []
  });

  // Open Activity Reporting Modal
  const handleOpenReportModal = (initialEventId?: string) => {
    const targetEvt = events.find(e => e.id === initialEventId) || events[0];
    const initialParticipants: Record<string, { selected: boolean; role: string; achievement: string; note: string }> = {};
    
    classStudents.forEach(st => {
      initialParticipants[st.id] = {
        selected: false,
        role: 'Vận động viên / Thành viên',
        achievement: '',
        note: ''
      };
    });

    setReportForm({
      activityId: targetEvt?.id || 'custom',
      activityTitle: targetEvt?.title || '',
      activityType: targetEvt?.category === 'Thể thao' ? 'the_thao' :
                    targetEvt?.category === 'Tình nguyện' ? 'tinh_nguyen' :
                    targetEvt?.category === 'Văn nghệ' ? 'van_nghe' : 'phong_trao',
      customActivityTitle: '',
      participants: initialParticipants,
      proofImages: []
    });
    setReportStudentSearch('');
    setIsReportModalOpen(true);
  };

  // Submit Activity Report
  const handleSubmitActivityReport = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = reportForm.activityId === 'custom'
      ? reportForm.customActivityTitle.trim()
      : reportForm.activityTitle;

    if (!finalTitle) {
      alert('Vui lòng nhập tên hoạt động / phong trào!');
      return;
    }

    const selectedEntries = Object.entries(reportForm.participants)
      .filter(([_, val]) => val.selected)
      .map(([stId, val]) => {
        const st = classStudents.find(s => s.id === stId);
        return {
          studentId: st?.studentId || stId,
          name: st?.name || 'Học sinh',
          gender: st?.gender || 'Nam',
          phone: st?.phone || '',
          role: val.role.trim() || 'Thành viên tham gia',
          achievement: val.achievement.trim() || '',
          note: val.note.trim() || ''
        };
      });

    if (selectedEntries.length === 0) {
      alert('Vui lòng tích chọn ít nhất 1 học sinh tham gia hoạt động phong trào!');
      return;
    }

    const nonSelectedEntries: ActivityNonParticipant[] = Object.entries(reportForm.participants)
      .filter(([_, val]) => !val.selected)
      .map(([stId, val]) => {
        const st = classStudents.find(s => s.id === stId);
        return {
          studentId: st?.studentId || stId,
          name: st?.name || 'Học sinh',
          gender: (st?.gender || 'Nam') as ('Nam' | 'Nữ'),
          phone: st?.phone || '',
          isUnionMember: st?.isUnionMember,
          reason: val.note.trim() || 'Vắng mặt / Không tham gia đợt này',
          note: ''
        };
      });

    submitActivityReport({
      activityId: reportForm.activityId,
      activityTitle: finalTitle,
      activityType: reportForm.activityType as any,
      classId: classId,
      className: classInfo?.name || `Lớp ${classId}`,
      secretaryName: currentUser?.name || 'Bí thư Chi đoàn',
      participantCount: selectedEntries.length,
      participants: selectedEntries,
      nonParticipants: nonSelectedEntries,
      proofImages: reportForm.proofImages
    });

    alert(`Đã gửi báo cáo danh sách ${selectedEntries.length} học sinh tham gia "${finalTitle}" về Đoàn trường thành công!`);
    setIsReportModalOpen(false);
  };

  // Quick Student Selection inside Report Modal
  const handleSelectAllInModal = (filterType: 'all' | 'union' | 'clear') => {
    setReportForm(prev => {
      const updated = { ...prev.participants };
      classStudents.forEach(st => {
        if (filterType === 'clear') {
          updated[st.id] = { ...updated[st.id], selected: false };
        } else if (filterType === 'union') {
          updated[st.id] = { ...updated[st.id], selected: st.isUnionMember };
        } else {
          updated[st.id] = { ...updated[st.id], selected: true };
        }
      });
      return { ...prev, participants: updated };
    });
  };

  // Export Class Activity Report to Excel
  const handleExportClassActivityExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Học Sinh Tham Gia
      const rowsParticipants: any[] = [];
      let stt1 = 1;
      classActivityReports.forEach(report => {
        report.participants.forEach(p => {
          rowsParticipants.push({
            'STT': stt1++,
            'Tên Hoạt Động / Phong Trào': report.activityTitle,
            'Loại Hoạt Động': report.activityType === 'the_thao' ? 'Thể Thao / Hội Thao' :
                              report.activityType === 'tinh_nguyen' ? 'Tình Nguyện' :
                              report.activityType === 'van_nghe' ? 'Văn Nghệ' :
                              report.activityType === 'lao_dong' ? 'Lao Động' : 'Phong Trào',
            'Lớp / Chi Đoàn': report.className,
            'Mã Học Sinh': p.studentId,
            'Họ và Tên': p.name,
            'Giới Tính': p.gender,
            'Số Điện Thoại': p.phone || '',
            'Vai Trò / Nhiệm Vụ': p.role || 'Thành viên tham gia',
            'Thành Tích / Giải Thưởng': p.achievement || 'Hoàn thành tốt',
            'Ghi Chú': p.note || '',
            'Thời Gian Báo Cáo': report.reportedAt,
            'Trạng Thái Duyệt': report.status === 'verified' ? 'Đã duyệt' : 'Chờ xác nhận',
            'Phản Hồi Đoàn Trường': report.adminFeedback || ''
          });
        });
      });
      if (rowsParticipants.length > 0) {
        const ws1 = XLSX.utils.json_to_sheet(rowsParticipants);
        XLSX.utils.book_append_sheet(wb, ws1, 'Học Sinh Tham Gia');
      }

      // Sheet 2: Học Sinh Không Tham Gia
      const rowsNonParticipants: any[] = [];
      let stt2 = 1;
      classActivityReports.forEach(report => {
        const nonList = getReportNonParticipants(report);
        nonList.forEach(np => {
          rowsNonParticipants.push({
            'STT': stt2++,
            'Tên Hoạt Động / Phong Trào': report.activityTitle,
            'Lớp / Chi Đoàn': report.className,
            'Mã Học Sinh': np.studentId,
            'Họ và Tên': np.name,
            'Giới Tính': np.gender,
            'Đoàn Viên': np.isUnionMember ? 'Đoàn viên' : 'Thanh niên',
            'Số Điện Thoại': np.phone || '',
            'Lý Do / Trạng Thái': np.reason || 'Vắng mặt / Không tham gia',
            'Ghi Chú': np.note || '',
            'Thời Gian Báo Cáo': report.reportedAt
          });
        });
      });
      if (rowsNonParticipants.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(rowsNonParticipants);
        XLSX.utils.book_append_sheet(wb, ws2, 'Không Tham Gia');
      }

      if (rowsParticipants.length === 0 && rowsNonParticipants.length === 0) {
        alert('Chi đoàn chưa có báo cáo hoạt động phong trào nào để xuất Excel!');
        return;
      }

      XLSX.writeFile(wb, `Danh_Sach_Tham_Gia_Phong_Trao_${(classInfo?.name || classId).replace(/\//g, '_')}.xlsx`);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi xuất file Excel!');
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">
      
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 text-white flex items-center justify-center font-black text-2xl shadow-glow">
            🎖️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">KHÔNG GIAN BÍ THƯ CHI ĐOÀN</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs font-bold">
                {classInfo?.name}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Bí thư: <strong>{currentUser?.name}</strong> • Số đoàn viên: {classInfo?.unionMembers} / {classInfo?.totalStudents} HS
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs text-slate-400">Vị thứ thi đua toàn trường:</span>
          <p className="text-2xl font-black text-amber-400">Hạng #{classScore?.rank || 1} / 18</p>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="bg-slate-950/90 p-2 rounded-2xl border border-slate-800 shadow-inner">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-bold">
          {[
            { id: 'overview', label: 'Tổng Quan', icon: Trophy, badge: null, isRedBadge: false },
            { 
              id: 'inbox', 
              label: 'Hộp Thư Nề Nếp', 
              icon: AlertCircle, 
              badge: pendingViolations.length,
              isRedBadge: pendingViolations.length > 0 
            },
            { 
              id: 'activity_reports', 
              label: 'Báo Cáo Phong Trào', 
              icon: Award, 
              badge: classActivityReports.length,
              isRedBadge: false 
            },
            { id: 'union_fee', label: 'Sổ Đoàn Phí', icon: Layers, badge: `${unionMembers.length} ĐV`, isRedBadge: false },
            { id: 'notices', label: 'Nhiệm Vụ & Lao Động', icon: Bell, badge: classNotices.length, isRedBadge: false },
            { id: 'documents', label: 'Biểu Mẫu & Cẩm Nang', icon: Folder, badge: documentFiles?.length || 0, isRedBadge: false },
          ].map(tab => {
            const isActive = bithuTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setBithuTab(tab.id as any)}
                className={`w-full px-2.5 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-bold border text-center ${
                  isActive
                    ? 'bg-emerald-600 border-emerald-500 text-white shadow-glow'
                    : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : tab.isRedBadge ? 'text-rose-400' : 'text-slate-400'}`} />
                <span className="truncate">{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black shrink-0 ${
                    isActive 
                      ? 'bg-white/25 text-white' 
                      : tab.isRedBadge 
                        ? 'bg-rose-950 text-rose-300 border border-rose-800 animate-pulse'
                        : 'bg-slate-800 text-amber-400 border border-slate-700'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB 1: OVERVIEW & SCORE CARD ================= */}
      {bithuTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Class Score Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-1 text-center">
              <span className="text-xs text-slate-400 uppercase font-bold">Tổng Điểm Tuần {activeWeek}</span>
              <p className="text-3xl font-black text-white">{classScore?.finalScore || 1440}đ</p>
              <span className="text-[11px] text-emerald-400 font-bold">Xếp loại: {classScore?.rating || 'Xuất sắc'}</span>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-1 text-center">
              <span className="text-xs text-slate-400 uppercase font-bold">Tổng Điểm Trừ Nề Nếp</span>
              <p className="text-3xl font-black text-rose-400">-{classScore?.totalDeduction || 0}đ</p>
              <span className="text-[11px] text-slate-400">{classVios.length} bản ghi vi phạm</span>
            </div>

            <div className="glass-panel rounded-2xl p-4 border border-slate-800 space-y-1 text-center">
              <span className="text-xs text-slate-400 uppercase font-bold">Điểm Thưởng Phong Trào</span>
              <p className="text-3xl font-black text-emerald-300">+{classScore?.totalBonus || 0}đ</p>
              <span className="text-[11px] text-amber-400 font-bold">{classActivityReports.length} phong trào đã nộp</span>
            </div>
          </div>

          {/* Quick Action: Báo cáo phong trào banner */}
          <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-950/60 via-slate-950 to-slate-950 border border-purple-900/60 shadow-glow flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-purple-600/30 text-purple-300 border border-purple-600/40 text-xl">
                🚩
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Báo Cáo Học Sinh Tham Gia Phong Trào, Thể Thao & Tình Nguyện</h4>
                <p className="text-xs text-slate-400">Gửi danh sách học sinh tham gia phong trào để Đoàn trường cộng điểm thi đua cho lớp</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleOpenReportModal()}
              className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-2 shadow-glow active:scale-95 transition-all shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Gửi Báo Cáo Mới</span>
            </button>
          </div>

          {/* Events Preview */}
          <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <span>CÁC PHONG TRÀO & SỰ KIỆN ĐANG PHÁT ĐỘNG</span>
              </h3>
              <button
                type="button"
                onClick={() => setBithuTab('activity_reports')}
                className="text-xs font-bold text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Xem tất cả báo cáo ({classActivityReports.length})</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {events.map(evt => (
                <div key={evt.id} className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <img
                    src={evt.thumbnail}
                    alt={evt.title}
                    className="w-full h-28 object-cover rounded-xl border border-slate-700"
                  />
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                        {evt.category}
                      </span>
                      <span className="text-xs font-black text-emerald-400">+{evt.bonusPoints}đ thi đua</span>
                    </div>
                    <h4 className="font-bold text-white text-xs line-clamp-1">{evt.title}</h4>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{evt.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-xs">
                    <span className="text-slate-400 text-[11px]">Đã tham gia: <strong>{evt.registeredCount} HS</strong></span>
                    <button
                      type="button"
                      onClick={() => handleOpenReportModal(evt.id)}
                      className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11px] shadow-glow flex items-center gap-1"
                    >
                      <span>Báo Cáo DS Tham Gia</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB: HỘP THƯ NỀ NẾP & KHIẾU NẠI CHI ĐOÀN ================= */}
      {bithuTab === 'inbox' && (
        <div className="space-y-4 animate-fadeIn">
          
          {/* Header Description */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-rose-500" />
                <span>HỘP THƯ NỀ NẾP & PHÚC KHẢO CHI ĐOÀN {classInfo?.name} (TUẦN {activeWeek})</span>
              </h3>
              <p className="text-xs text-slate-400">
                Theo dõi các lỗi do Đội Cờ Đỏ ghi nhận trong tuần, kiểm tra ảnh minh chứng và nộp đơn giải trình đối chất lên Đoàn trường.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-950 text-rose-300 border border-rose-800">
                {pendingViolations.length} lỗi chờ phản hồi
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 text-slate-400 border border-slate-700">
                {acceptedViolations.length} đã chốt
              </span>
            </div>
          </div>

          {/* Group Filter Bar (as shown in user screenshot) */}
          <div className="flex overflow-x-auto pb-1.5 border-b border-slate-800 space-x-2 text-xs font-bold">
            {[
              { id: 'ALL', label: 'Tất cả các nhóm', color: '#94a3b8', borderActive: 'border-slate-400 text-white' },
              { id: 'Chuyên cần', label: 'I.1 Chuyên cần', color: '#f97316', borderActive: 'border-orange-500 text-orange-400' },
              { id: 'Vệ sinh', label: 'I.2 Vệ sinh', color: '#22c55e', borderActive: 'border-emerald-500 text-emerald-400' },
              { id: 'Nề nếp tự quản', label: 'I.3 Nề nếp tự quản', color: '#3b82f6', borderActive: 'border-blue-500 text-blue-400' },
              { id: 'Tác phong', label: 'I.4 Tác phong', color: '#a855f7', borderActive: 'border-purple-500 text-purple-400' },
              { id: 'Phong trào', label: 'Thành tích / Phong trào 🏆', color: '#eab308', borderActive: 'border-amber-400 text-amber-300' },
            ].map(group => {
              const count = group.id === 'ALL'
                ? pendingViolations.length
                : pendingViolations.filter(v => v.groupName.toLowerCase().includes(group.id.toLowerCase()) || v.criterionId.startsWith(group.id)).length;

              const isActive = inboxGroupFilter === group.id;

              return (
                <button
                  key={group.id}
                  type="button"
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

          {/* List of Violation Cards */}
          {filteredPendingViolations.length === 0 ? (
            <div className="glass-panel rounded-3xl p-10 text-center text-slate-400 space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <p className="font-bold text-white text-base">Không có vi phạm nào đang chờ phản hồi trong nhóm này.</p>
              <p className="text-xs text-slate-500">Chi đoàn {classInfo?.name} đang duy trì nề nếp rất tốt trong Tuần {activeWeek}.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPendingViolations.map(vio => {
                const isExpanded = expandedVioId === vio.id;
                return (
                  <div
                    key={vio.id}
                    className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-card hover:border-slate-700 transition-all"
                  >
                    {/* Header Row */}
                    <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60">
                      <div className="flex items-start space-x-3">
                        <span className="p-2 rounded-xl bg-red-600/20 text-red-400 font-black text-xs border border-red-600/30 shrink-0">
                          {vio.day}
                        </span>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
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
                      <div className="flex items-center space-x-2 self-end sm:self-center">
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
                          type="button"
                          onClick={() => setExpandedVioId(isExpanded ? null : vio.id)}
                          className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-800 bg-slate-950/80 space-y-4 text-xs animate-fadeIn">
                        {vio.note && (
                          <div>
                            <span className="font-bold text-slate-400">Ghi chú từ Cờ đỏ:</span>
                            <div className="text-slate-200 mt-0.5 p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                              <RichTextViewer content={vio.note} compact />
                            </div>
                          </div>
                        )}

                        <div>
                          <span className="font-bold text-slate-400">Học sinh vi phạm:</span>
                          <p className="text-amber-300 font-medium mt-0.5">
                            {vio.studentNames && vio.studentNames.length > 0 ? vio.studentNames.join(', ') : 'Lỗi tập thể lớp'}
                          </p>
                        </div>

                        {/* Proof Photos */}
                        {vio.proofImages && vio.proofImages.length > 0 && (
                          <div>
                            <span className="font-bold text-slate-400 block mb-1.5">Ảnh minh chứng đính kèm:</span>
                            <div className="flex flex-wrap gap-2">
                              {vio.proofImages.map((img, i) => (
                                <img
                                  key={i}
                                  src={img}
                                  alt="Minh chứng"
                                  onClick={() => setViewingPhoto(img)}
                                  className="w-24 h-24 object-cover rounded-xl border border-slate-700 cursor-pointer hover:opacity-80 transition-opacity hover:scale-105"
                                  title="Nhấn để xem ảnh lớn"
                                />
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Appeal status details if appealed */}
                        {vio.appeal && (
                          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/60 space-y-1">
                            <p className="font-bold text-purple-300">Nội dung đã giải trình phúc khảo:</p>
                            <div className="text-slate-200">
                              <RichTextViewer content={vio.appeal.reason} compact />
                            </div>
                            <p className="text-[10px] text-purple-400">Bởi: {vio.appeal.appealedBy} lúc {vio.appeal.appealedAt}</p>
                          </div>
                        )}

                        {/* Decision Buttons for Bí Thư Chi Đoàn */}
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
                                  type="button"
                                  onClick={() => handleAcceptViolation(vio.id)}
                                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors flex items-center gap-1.5 active:scale-95"
                                >
                                  <CheckCircle2 className="w-4 h-4" />
                                  <span>Xác Nhận Lỗi (Chấp nhận trừ điểm)</span>
                                </button>

                                <button
                                  type="button"
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

      {/* ================= TAB 2: ACTIVITY PARTICIPANTS REPORTING ================= */}
      {bithuTab === 'activity_reports' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-400" />
                <span>BÁO CÁO HỌC SINH THAM GIA PHONG TRÀO CHI ĐOÀN {classInfo?.name}</span>
              </h3>
              <p className="text-xs text-slate-400">
                Lập danh sách học sinh và số lượng tham gia từng hoạt động (hội thao, tình nguyện, văn nghệ...) để gửi về Ban Chấp hành Đoàn trường
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportClassActivityExcel}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 hover:border-emerald-600 text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Xuất Excel (.xlsx)</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenReportModal()}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-2 shadow-glow active:scale-95 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Lập Báo Cáo Mới</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400">Số Phong Trào Đã Báo Cáo</span>
              <p className="text-xl font-black text-white mt-1">{classActivityReports.length} <span className="text-xs font-normal text-slate-500">hoạt động</span></p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
              <span className="text-[11px] font-bold text-slate-400">Tổng Lượt HS Tham Gia</span>
              <p className="text-xl font-black text-purple-400 mt-1">
                {classActivityReports.reduce((sum, r) => sum + (r.participantCount || r.participants.length), 0)} <span className="text-xs font-normal text-slate-500">học sinh</span>
              </p>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-bold text-slate-400">Đã Được Đoàn Trường Duyệt</span>
              <p className="text-xl font-black text-emerald-400 mt-1">
                {classActivityReports.filter(r => r.status === 'verified').length} / {classActivityReports.length} <span className="text-xs font-normal text-slate-500">báo cáo</span>
              </p>
            </div>
          </div>

          {/* Reports List */}
          <div className="space-y-4">
            {classActivityReports.map(report => {
              const currentTab = activeReportTab[report.id] || 'participating';
              const nonParticipants = getReportNonParticipants(report);
              const totalInClass = report.participants.length + nonParticipants.length;
              const participantRate = totalInClass > 0 ? Math.round((report.participants.length / totalInClass) * 100) : 100;

              const sortedParticipants = sortDataList(report.participants, 'name', 'asc');
              const sortedNonParticipants = sortDataList(nonParticipants, 'name', 'asc');

              return (
                <div
                  key={report.id}
                  className="p-5 rounded-3xl bg-slate-950 border border-slate-800 shadow-md space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                    <div className="space-y-1">
                      <div className="flex items-center flex-wrap gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          report.activityType === 'the_thao' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                          report.activityType === 'tinh_nguyen' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                          report.activityType === 'van_nghe' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                          'bg-blue-950 text-blue-300 border-blue-800'
                        }`}>
                          {report.activityType === 'the_thao' ? '🏅 Hội Thao' :
                           report.activityType === 'tinh_nguyen' ? '🌱 Tình Nguyện' :
                           report.activityType === 'van_nghe' ? '🎭 Văn Nghệ' :
                           report.activityType === 'lao_dong' ? '🛠️ Lao Động' : '🚩 Phong Trào'}
                        </span>
                        <h4 className="text-base font-black text-white">{report.activityTitle}</h4>
                      </div>
                      <p className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-0.5">
                        <span>🕒 Thời gian gửi: <strong className="text-slate-300">{report.reportedAt}</strong></span>
                        <span>👥 Sĩ số: <strong className="text-slate-300">{totalInClass} học sinh</strong></span>
                        <span>✅ Tham gia: <strong className="text-purple-400 font-bold">{report.participants.length} ({participantRate}%)</strong></span>
                        <span>❌ Không tham gia: <strong className="text-rose-400 font-bold">{nonParticipants.length} ({100 - participantRate}%)</strong></span>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      {report.status === 'verified' ? (
                        <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Đoàn Trường Đã Duyệt</span>
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-xl bg-amber-950/80 text-amber-300 border border-amber-800 text-xs font-bold flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-amber-400" />
                          <span>Chờ Đoàn Trường Xác Nhận</span>
                        </span>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa báo cáo phong trào "${report.activityTitle}"?`)) {
                            deleteActivityReport(report.id);
                          }
                        }}
                        className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-800 hover:border-rose-800 transition-colors"
                        title="Xóa báo cáo này"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Segmented Switcher: Tham Gia vs Không Tham Gia */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800">
                      <button
                        type="button"
                        onClick={() => setActiveReportTab(prev => ({ ...prev, [report.id]: 'participating' }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          currentTab === 'participating'
                            ? 'bg-purple-600 text-white shadow-glow'
                            : 'text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                      >
                        <span>✅ Học Sinh Tham Gia ({report.participants.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveReportTab(prev => ({ ...prev, [report.id]: 'non_participating' }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          currentTab === 'non_participating'
                            ? 'bg-rose-600 text-white shadow-glow'
                            : 'text-slate-400 hover:text-rose-300 hover:bg-slate-800'
                        }`}
                      >
                        <span>❌ Không Tham Gia ({nonParticipants.length})</span>
                      </button>
                    </div>

                    <span className="text-[11px] text-slate-500 font-medium italic">
                      {currentTab === 'participating'
                        ? `Danh sách ${report.participants.length} học sinh tham gia phong trào`
                        : `Danh sách ${nonParticipants.length} học sinh trong lớp vắng mặt / không tham gia`}
                    </span>
                  </div>

                  {/* Table View */}
                  {currentTab === 'participating' ? (
                    <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-bold">
                            <th className="p-2.5 text-center w-12 text-slate-400">STT</th>
                            <th className="p-2.5">Mã Học Sinh</th>
                            <th className="p-2.5">Họ và Tên (A-Z)</th>
                            <th className="p-2.5 text-center">Giới Tính</th>
                            <th className="p-2.5">Số Điện Thoại</th>
                            <th className="p-2.5">Vai Trò / Nhiệm Vụ</th>
                            <th className="p-2.5">Thành Tích / Khen Thưởng</th>
                            <th className="p-2.5">Ghi Chú</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {sortedParticipants.map((p, pIdx) => (
                            <tr key={p.studentId || pIdx} className="hover:bg-slate-800/40 transition-colors">
                              <td className="p-2.5 text-center text-slate-400 font-mono font-bold">{pIdx + 1}</td>
                              <td className="p-2.5 font-mono text-amber-400 font-bold">{p.studentId}</td>
                              <td className="p-2.5 font-bold text-white whitespace-nowrap">{p.name}</td>
                              <td className="p-2.5 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  p.gender === 'Nữ' ? 'bg-pink-950 text-pink-300' : 'bg-blue-950 text-blue-300'
                                }`}>
                                  {p.gender}
                                </span>
                              </td>
                              <td className="p-2.5 text-slate-300 font-mono">{p.phone || '—'}</td>
                              <td className="p-2.5 text-slate-200 font-semibold">{p.role || 'Thành viên'}</td>
                              <td className="p-2.5">
                                {p.achievement ? (
                                  <span className="px-2 py-0.5 rounded-lg bg-amber-950/80 text-amber-300 border border-amber-700 font-bold text-[11px]">
                                    🏆 {p.achievement}
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-xs">Tham gia đầy đủ</span>
                                )}
                              </td>
                              <td className="p-2.5 text-slate-400 italic">{p.note || '—'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="overflow-x-auto rounded-2xl border border-rose-950/60 bg-slate-900/60">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="bg-rose-950/40 text-rose-300 border-b border-rose-900/50 font-bold">
                            <th className="p-2.5 text-center w-12 text-slate-400">STT</th>
                            <th className="p-2.5">Mã Học Sinh</th>
                            <th className="p-2.5">Họ và Tên (A-Z)</th>
                            <th className="p-2.5 text-center">Giới Tính</th>
                            <th className="p-2.5 text-center">Đoàn Viên</th>
                            <th className="p-2.5">Số Điện Thoại</th>
                            <th className="p-2.5">Trạng Thái / Lý Do Vắng</th>
                            <th className="p-2.5">Ghi Chú</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {sortedNonParticipants.length === 0 ? (
                            <tr>
                              <td colSpan={8} className="p-6 text-center text-emerald-400 font-bold">
                                🎉 100% học sinh trong chi đoàn đều tham gia hoạt động này!
                              </td>
                            </tr>
                          ) : (
                            sortedNonParticipants.map((np, npIdx) => (
                              <tr key={np.studentId || npIdx} className="hover:bg-rose-950/20 transition-colors">
                                <td className="p-2.5 text-center text-slate-400 font-mono font-bold">{npIdx + 1}</td>
                                <td className="p-2.5 font-mono text-slate-400 font-bold">{np.studentId}</td>
                                <td className="p-2.5 font-bold text-white whitespace-nowrap">{np.name}</td>
                                <td className="p-2.5 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    np.gender === 'Nữ' ? 'bg-pink-950 text-pink-300' : 'bg-blue-950 text-blue-300'
                                  }`}>
                                    {np.gender}
                                  </span>
                                </td>
                                <td className="p-2.5 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                    np.isUnionMember ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-slate-800 text-slate-400'
                                  }`}>
                                    {np.isUnionMember ? 'Đoàn viên' : 'Thanh niên'}
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-400 font-mono">{np.phone || '—'}</td>
                                <td className="p-2.5">
                                  <span className="px-2 py-0.5 rounded-lg bg-rose-950 text-rose-300 border border-rose-800/60 text-[11px] font-semibold">
                                    {np.reason || 'Vắng mặt / Không tham gia'}
                                  </span>
                                </td>
                                <td className="p-2.5 text-slate-400 italic">{np.note || '—'}</td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {report.adminFeedback && (
                    <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/50 text-purple-200 text-xs flex items-center gap-2">
                      <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span><strong>Phản hồi từ Đoàn trường:</strong> {report.adminFeedback}</span>
                    </div>
                  )}
                </div>
              );
            })}

            {classActivityReports.length === 0 && (
              <div className="p-12 text-center bg-slate-950 rounded-3xl border border-slate-800 text-slate-400 text-xs space-y-3">
                <p className="text-base font-bold text-slate-300">Chi đoàn chưa gửi báo cáo tham gia phong trào nào</p>
                <p className="text-slate-500">Bí thư hãy bấm nút <strong>"Lập Báo Cáo Mới"</strong> để gửi danh sách học sinh tham gia Hội thao, Tình nguyện, Văn nghệ lên Đoàn trường.</p>
                <button
                  type="button"
                  onClick={() => handleOpenReportModal()}
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-glow inline-flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Lập Báo Cáo Đầu Tiên</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 3: UNION FEE 9 MONTHS ================= */}
      {bithuTab === 'union_fee' && (
        <div className="space-y-5 animate-fadeIn">
          {(() => {
            const isClassFeeLocked = Boolean(feeLocks[`${classId}_ALL_YEAR`]);
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

            const handleToggleFeeMonth = (student: typeof students[0], month: string) => {
              if (isClassFeeLocked) {
                alert('Sổ đoàn phí của Chi đoàn hiện đang bị KHÓA SỔ. Vui lòng bấm [Mở Khóa Sổ Thu Phí] nếu cần điều chỉnh dữ liệu!');
                return;
              }
              const current = (student.monthlyUnionFees?.[month] || (student.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid';
              const nextStatus: 'paid' | 'unpaid' = current ? 'unpaid' : 'paid';
              
              updateStudent(student.id, {
                monthlyUnionFees: {
                  ...(student.monthlyUnionFees || {}),
                  [month]: nextStatus
                }
              });
              setHasUnsavedChanges(true);
            };

            const handleMarkAllYearForClass = () => {
              if (isClassFeeLocked) {
                alert('Sổ đoàn phí của Chi đoàn hiện đang bị KHÓA SỔ. Vui lòng bấm [Mở Khóa Sổ Thu Phí] nếu cần điều chỉnh dữ liệu!');
                return;
              }
              if (confirm(`Xác nhận đánh dấu TẤT CẢ đoàn viên ${classInfo?.name || classId} đã hoàn thành nộp đoàn phí CẢ NĂM (9 tháng)?`)) {
                unionMembers.forEach(st => {
                  payYearlyFee(st.id, 'paid');
                });
                setHasUnsavedChanges(true);
                setSaveSuccessMsg('✓ Đã cập nhật nộp đủ 9 tháng cho toàn bộ chi đoàn!');
                setTimeout(() => setSaveSuccessMsg(null), 3500);
              }
            };

            const handleBatchPaySelectedYear = (status: 'paid' | 'unpaid') => {
              if (isClassFeeLocked) {
                alert('Sổ đoàn phí của Chi đoàn hiện đang bị KHÓA SỔ. Vui lòng bấm [Mở Khóa Sổ Thu Phí] nếu cần điều chỉnh dữ liệu!');
                return;
              }
              const targetUnionMembers = unionMembers.filter(st => selectedStudentIds.includes(st.id));
              if (targetUnionMembers.length === 0) {
                alert('Vui lòng chọn ít nhất 1 Đoàn viên để thực hiện!');
                return;
              }
              targetUnionMembers.forEach(st => {
                payYearlyFee(st.id, status);
              });
              setHasUnsavedChanges(true);
              setSaveSuccessMsg(`✓ Đã ${status === 'paid' ? 'thu đủ 9 tháng' : 'đặt lại chưa nộp'} cho ${targetUnionMembers.length} đoàn viên đã chọn!`);
              setTimeout(() => setSaveSuccessMsg(null), 3500);
            };

            const handleExportExcel = () => {
              const wb = XLSX.utils.book_new();
              const exportRows = classStudents.map((st, idx) => {
                const isUnion = st.isUnionMember;
                const paidCount = isUnion 
                  ? MONTHS.filter(m => (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid').length 
                  : 0;

                const rowData: Record<string, any> = {
                  'STT': idx + 1,
                  'Mã Học Sinh': st.studentId,
                  'Họ và Tên': st.name,
                  'Giới Tính': st.gender,
                  'Đối Tượng': isUnion ? 'Đoàn viên' : 'Học sinh',
                  'Số Thẻ Đoàn': st.unionCardNumber || '',
                  'Chức Vụ': st.unionPosition || (isUnion ? 'Đoàn viên' : 'Học sinh')
                };

                MONTHS.forEach(m => {
                  if (!isUnion) {
                    rowData[m] = 'Không thu';
                  } else {
                    const isPaid = (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid';
                    rowData[m] = isPaid ? 'Đã nộp' : 'Chưa';
                  }
                });

                rowData['Tổng Đã Nộp'] = isUnion ? `${paidCount}/9 tháng` : '—';
                rowData['Tiến Độ'] = isUnion ? `${Math.round((paidCount / 9) * 100)}%` : '—';

                return rowData;
              });

              const ws = XLSX.utils.json_to_sheet(exportRows);
              XLSX.utils.book_append_sheet(wb, ws, `DoanPhi_${classInfo?.name || classId}`);
              XLSX.writeFile(wb, `SoTheoDoi_DoanPhi_${(classInfo?.name || classId).replace('/', '_')}_9Thang.xlsx`);
            };

            return (
              <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-600/30">
                        <Layers className="w-5 h-5" />
                      </span>
                      <h3 className="text-base font-black text-white">
                        SỔ THEO DÕI THU ĐOÀN PHÍ 9 THÁNG NĂM HỌC
                      </h3>
                    </div>
                    <p className="text-xs text-slate-400">
                      Theo dõi thu đoàn phí từng tháng (Tháng 9 đến Tháng 5) cho {unionMembers.length} Đoàn viên Chi đoàn {classInfo?.name}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* Lock / Unlock Union Fee Booklet Button */}
                    <button
                      type="button"
                      onClick={() => toggleFeeLock(classId, 'ALL_YEAR')}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
                        isClassFeeLocked
                          ? 'bg-amber-950/80 text-amber-300 border border-amber-600 hover:bg-amber-900'
                          : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600'
                      }`}
                      title={isClassFeeLocked ? "Mở khóa sổ để tiếp tục cập nhật thu đoàn phí" : "Khóa sổ để đóng băng số liệu thu đoàn phí"}
                    >
                      {isClassFeeLocked ? (
                        <>
                          <Unlock className="w-4 h-4 text-amber-400" />
                          <span>🔓 Mở Khóa Sổ Thu Phí</span>
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>🔒 Khóa Sổ Thu Phí</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={handleExportExcel}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 hover:border-emerald-600 text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Xuất Excel (.xlsx)</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleMarkAllYearForClass}
                      disabled={isClassFeeLocked}
                      className={`px-4 py-2 rounded-xl text-white font-bold text-xs flex items-center gap-1.5 shadow-glow active:scale-95 transition-all ${
                        isClassFeeLocked 
                          ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700' 
                          : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500'
                      }`}
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>Thu Cả Năm Toàn Lớp</span>
                    </button>
                  </div>
                </div>

                {/* Locked Banner Notification */}
                {isClassFeeLocked && (
                  <div className="p-3.5 rounded-2xl bg-amber-950/70 border border-amber-600/60 flex items-center justify-between gap-3 text-amber-200 text-xs shadow-inner animate-fadeIn">
                    <div className="flex items-center gap-2.5">
                      <Lock className="w-5 h-5 text-amber-400 shrink-0" />
                      <div>
                        <span className="font-black text-amber-300">Sổ Đoàn Phí Đang Bị Khóa (Chế độ chỉ xem):</span> Dữ liệu đã được chốt. Bấm nút <strong>[🔓 Mở Khóa Sổ Thu Phí]</strong> ở góc phải nếu bạn cần cập nhật hoặc chỉnh sửa.
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-amber-900/90 font-mono text-[10px] text-amber-300 font-bold border border-amber-700 shrink-0">
                      🔒 ĐÃ KHÓA SỔ
                    </span>
                  </div>
                )}

                {/* KPI Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400">Tổng Số Đoàn Viên</span>
                    <p className="text-xl font-black text-white mt-1">{unionMembers.length} <span className="text-xs font-normal text-slate-500">/ {classStudents.length} HS</span></p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400">Đã Hoàn Thành Cả Năm</span>
                    <p className="text-xl font-black text-emerald-400 mt-1">{fullyPaidUnionCount} <span className="text-xs font-normal text-slate-500">ĐV</span></p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400">Còn Thiếu Tháng</span>
                    <p className="text-xl font-black text-amber-400 mt-1">{pendingUnionCount} <span className="text-xs font-normal text-slate-500">ĐV</span></p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                    <span className="text-[11px] font-bold text-slate-400">Tiến Độ Thu Cả Năm</span>
                    <p className="text-xl font-black text-blue-400 mt-1">{totalYearPercent}%</p>
                  </div>
                </div>

                {/* Table of students */}
                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  {(() => {
                    const sortedClassStudents = sortDataList(filteredStudents, memberTableSort.key, memberTableSort.direction);

                    return (
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold">
                            <th className="p-2.5 text-center w-10">STT</th>
                            <SortableTh
                              sortKey="studentId"
                              currentSortKey={memberTableSort.key}
                              currentSortDir={memberTableSort.direction}
                              onSort={(k) => setMemberTableSort(prev => ({ key: k, direction: prev.key === k && prev.direction === 'asc' ? 'desc' : 'asc' }))}
                              className="p-2.5"
                            >
                              Mã HS
                            </SortableTh>
                            <SortableTh
                              sortKey="name"
                              currentSortKey={memberTableSort.key}
                              currentSortDir={memberTableSort.direction}
                              onSort={(k) => setMemberTableSort(prev => ({ key: k, direction: prev.key === k && prev.direction === 'asc' ? 'desc' : 'asc' }))}
                              className="p-2.5"
                            >
                              Họ và Tên
                            </SortableTh>
                            <SortableTh
                              sortKey="isUnionMember"
                              currentSortKey={memberTableSort.key}
                              currentSortDir={memberTableSort.direction}
                              onSort={(k) => setMemberTableSort(prev => ({ key: k, direction: prev.key === k && prev.direction === 'asc' ? 'desc' : 'asc' }))}
                              className="p-2.5 text-center"
                            >
                              Đối Tượng
                            </SortableTh>
                            {MONTHS.map(m => (
                              <th key={m} className="p-2 text-center text-[11px] text-amber-400 font-black min-w-[54px]">{m.replace('Tháng ', 'T')}</th>
                            ))}
                            <th className="p-2.5 text-center">Tiến Độ</th>
                            <th className="p-2.5 text-right">Thao Tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {sortedClassStudents.map((st, idx) => {
                            const isUnion = st.isUnionMember;
                            const paidMonthsCount = isUnion 
                              ? MONTHS.filter(m => (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid').length 
                              : 0;
                            const percent = isUnion ? Math.round((paidMonthsCount / 9) * 100) : 0;

                            return (
                              <tr key={st.id} className="hover:bg-slate-900/40 transition-colors">
                                <td className="p-2.5 text-center text-slate-400 font-mono font-bold">{idx + 1}</td>
                                <td className="p-2.5 font-mono text-amber-400 font-bold">{st.studentId}</td>
                                <td className="p-2.5 font-bold text-white whitespace-nowrap">{st.name}</td>
                            <td className="p-2.5 text-center">
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

                            {MONTHS.map(m => {
                              if (!isUnion) {
                                return (
                                  <td key={m} className="p-1 text-center">
                                    <span className="text-slate-600 text-xs font-mono">—</span>
                                  </td>
                                );
                              }

                              const isPaid = (st.monthlyUnionFees?.[m] || (st.unionFeeStatus === 'paid' ? 'paid' : 'unpaid')) === 'paid';
                              return (
                                <td key={m} className="p-1 text-center">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleFeeMonth(st, m)}
                                    className={`w-7 h-7 rounded-lg text-xs font-black transition-all flex items-center justify-center mx-auto border ${
                                      isPaid
                                        ? 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                                        : 'bg-slate-900 text-rose-400 border border-slate-800 hover:border-slate-700'
                                    }`}
                                    title={`${m}: ${isPaid ? 'Đã nộp (Click để đổi thành chưa)' : 'Chưa nộp (Click để đổi thành đã nộp)'}`}
                                  >
                                    {isPaid ? '✓' : '✕'}
                                  </button>
                                </td>
                              );
                            })}

                            <td className="p-2 text-center whitespace-nowrap">
                              {isUnion ? (
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                                  percent === 100 ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                                  percent >= 50 ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                                  'bg-slate-900 text-slate-400 border border-slate-800'
                                }`}>
                                  {paidMonthsCount}/9 ({percent}%)
                                </span>
                              ) : (
                                <span className="text-slate-600 text-xs">Không thu</span>
                              )}
                            </td>

                            <td className="p-2.5 text-right whitespace-nowrap">
                              {isUnion ? (
                                <button
                                  type="button"
                                  onClick={() => {
                                    payYearlyFee(st.id, paidMonthsCount === 9 ? 'unpaid' : 'paid');
                                    setHasUnsavedChanges(true);
                                  }}
                                  className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold border border-slate-800"
                                >
                                  {paidMonthsCount === 9 ? 'Đặt lại' : 'Cả năm'}
                                </button>
                              ) : (
                                <span className="text-slate-600 text-xs italic">Chưa vào Đoàn</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                );
              })()}
            </div>
          </div>
        );
      })()}
    </div>
  )}

      {/* ================= TAB 4: TASK NOTICES ================= */}
      {bithuTab === 'notices' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-600/30">
                <Bell className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm sm:text-base font-black text-white">THÔNG BÁO ĐIỀU ĐỘNG & NHIỆM VỤ LAO ĐỘNG</h3>
                <p className="text-xs text-slate-400">Căn cứ chấm điểm chuyên cần theo tiêu chí 1.6</p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {classNotices.map(notice => (
              <div
                key={notice.id}
                className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-bold text-[10px] border border-red-800">
                      {notice.type === 'lao_dong' ? 'Lao Động' : notice.type === 'cuoc_hop' ? 'Cuộc Họp' : 'Điều Động'}
                    </span>
                    <h4 className="font-black text-white text-sm">{notice.title}</h4>
                  </div>
                  <span className="text-xs text-amber-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Hạn: {notice.deadline}
                  </span>
                </div>
                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  <RichTextViewer content={notice.content} />
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Phát bởi: <strong>{notice.assignedBy}</strong></span>
                  <span className="text-emerald-400 font-bold">Bí thư chi đoàn triển khai cho đoàn viên</span>
                </div>
              </div>
            ))}
            {classNotices.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-4">Hiện không có thông báo điều động lao động nào cho chi đoàn</p>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 6: DOCUMENTS & HANDBOOKS FOR YOUTH SECRETARY ================= */}
      {bithuTab === 'documents' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Folder className="w-5 h-5 text-emerald-500" />
                <span>KHO BIỂU MẪU & CẨM NANG BÍ THƯ CHI ĐOÀN</span>
              </h3>
              <p className="text-xs text-slate-400">
                Tài liệu phục vụ sinh hoạt chi đoàn, biểu mẫu kết nạp Đoàn viên mới, sổ sách Đoàn và cẩm nang hướng dẫn
              </p>
            </div>

            {/* Search */}
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={docSearch}
                onChange={(e) => setDocSearch(e.target.value)}
                placeholder="Tìm tên đơn, số hiệu, từ khóa..."
                className="w-full pl-9 pr-8 py-2 bg-slate-950/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
              {docSearch && (
                <button
                  type="button"
                  onClick={() => setDocSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Folder Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
            <button
              type="button"
              onClick={() => setDocFolderFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                docFolderFilter === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-glow'
                  : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              <Folder className="w-3.5 h-3.5" />
              <span>Tất cả ({documentFiles?.length || 0})</span>
            </button>
            {documentFolders?.map((folder) => {
              const count = documentFiles?.filter((f) => f.folderId === folder.id).length || 0;
              return (
                <button
                  key={folder.id}
                  type="button"
                  onClick={() => setDocFolderFilter(folder.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    docFolderFilter === folder.id
                      ? 'bg-emerald-600 text-white shadow-glow'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" style={{ color: folder.color || '#10b981' }} />
                  <span>{folder.name}</span>
                  <span className="text-[10px] opacity-75 bg-black/30 px-1.5 py-0.2 rounded-full">
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Document Cards Grid */}
          {(() => {
            const filteredDocs = (documentFiles || []).filter((doc) => {
              const matchFolder = docFolderFilter === 'ALL' || doc.folderId === docFolderFilter;
              const matchSearch =
                !docSearch ||
                doc.title.toLowerCase().includes(docSearch.toLowerCase()) ||
                (doc.documentNumber && doc.documentNumber.toLowerCase().includes(docSearch.toLowerCase())) ||
                (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(docSearch.toLowerCase()))) ||
                (doc.description && doc.description.toLowerCase().includes(docSearch.toLowerCase()));
              return matchFolder && matchSearch;
            });

            if (filteredDocs.length === 0) {
              return (
                <div className="py-10 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-950/30">
                  <File className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-semibold text-slate-400">Không tìm thấy tài liệu phù hợp</p>
                </div>
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredDocs.map((doc) => {
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
                      className="bg-slate-950/70 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-3.5 space-y-3 transition-all hover:shadow-lg flex flex-col justify-between group"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between gap-1.5">
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
                              <Folder className="w-3 h-3" style={{ color: folder.color || '#10b981' }} />
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
                            className="text-xs font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
                            title={doc.title}
                          >
                            {doc.title}
                          </h4>
                          {doc.documentNumber && (
                            <p className="text-[11px] font-mono text-emerald-400/90 mt-0.5">
                              {doc.documentNumber}
                            </p>
                          )}
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1">
                          <span>{doc.fileSize}</span>
                          <span>{doc.downloadCount || 0} lượt tải</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            incrementDocumentViews(doc.id);
                            setSelectedDocModal(doc);
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </button>

                        <a
                          href={doc.fileUrl || doc.url}
                          download={doc.title}
                          target="_blank"
                          rel="noreferrer"
                          onClick={() => incrementDocumentDownloads(doc.id)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white text-[11px] font-bold flex items-center gap-1 transition-colors shadow-sm"
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
      )}

      {/* ================= MODAL: SUBMIT ACTIVITY PARTICIPANT REPORT ================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-2xl w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-purple-600 text-white font-bold">🚩</span>
                <div>
                  <h3 className="text-base font-black text-white">Lập Báo Cáo Học Sinh Tham Gia Phong Trào</h3>
                  <p className="text-xs text-slate-400">Chi đoàn {classInfo?.name} • Gửi về Ban Chấp hành Đoàn trường</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitActivityReport} className="space-y-4 text-xs">
              {/* Select Activity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Chọn Hoạt Động / Sự Kiện:</label>
                  <select
                    value={reportForm.activityId}
                    onChange={(e) => {
                      const selId = e.target.value;
                      const evt = events.find(ev => ev.id === selId);
                      setReportForm(prev => ({
                        ...prev,
                        activityId: selId,
                        activityTitle: evt ? evt.title : prev.activityTitle,
                        activityType: evt?.category === 'Thể thao' ? 'the_thao' :
                                      evt?.category === 'Tình nguyện' ? 'tinh_nguyen' :
                                      evt?.category === 'Văn nghệ' ? 'van_nghe' : 'phong_trao'
                      }));
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                  >
                    {events.map(ev => (
                      <option key={ev.id} value={ev.id}>🏆 {ev.title} (+{ev.bonusPoints}đ)</option>
                    ))}
                    <option value="custom">✏️ Hoạt động phong trào khác (Tự nhập tên)...</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Loại Hình Hoạt Động:</label>
                  <select
                    value={reportForm.activityType}
                    onChange={(e) => setReportForm(prev => ({ ...prev, activityType: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="the_thao">Hội thao / Giải Thể thao</option>
                    <option value="tinh_nguyen">Tình nguyện / Mùa hè xanh</option>
                    <option value="van_nghe">Văn nghệ / Hội diễn</option>
                    <option value="lao_dong">Lao động dọn vệ sinh</option>
                    <option value="phong_trao">Phong trào Đoàn khác</option>
                  </select>
                </div>
              </div>

              {/* Custom Title if selected custom */}
              {reportForm.activityId === 'custom' && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tên Hoạt Động / Phong Trào:</label>
                  <input
                    type="text"
                    required
                    value={reportForm.customActivityTitle}
                    onChange={(e) => setReportForm(prev => ({ ...prev, customActivityTitle: e.target.value }))}
                    placeholder="VD: Hội thao 26/3, Cuộc thi Kéo co khối 10, Ngày thứ 7 tình nguyện..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>
              )}

              {/* Select Students Section */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className="font-bold text-slate-200">
                      Danh Sách Học Sinh Tham Gia ({Object.values(reportForm.participants).filter(p => p.selected).length} đã chọn):
                    </label>
                    <p className="text-[11px] text-slate-400">Tích chọn học sinh và điền vai trò / thành tích tương ứng</p>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    <button
                      type="button"
                      onClick={() => handleSelectAllInModal('union')}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-blue-300 text-[11px] font-bold border border-slate-700"
                    >
                      Chọn tất cả ĐV ({unionMembers.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAllInModal('all')}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-emerald-300 text-[11px] font-bold border border-slate-700"
                    >
                      Chọn cả lớp ({classStudents.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => handleSelectAllInModal('clear')}
                      className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-rose-300 text-[11px] font-bold border border-slate-700"
                    >
                      Bỏ chọn hết
                    </button>
                  </div>
                </div>

                {/* Filter / Search student */}
                <input
                  type="text"
                  value={reportStudentSearch}
                  onChange={(e) => setReportStudentSearch(e.target.value)}
                  placeholder="🔍 Tìm nhanh học sinh trong lớp theo tên, mã HS..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500"
                />

                {/* Student Selection List */}
                <div className="max-h-64 overflow-y-auto space-y-2 pr-1 rounded-2xl bg-slate-950 p-2 border border-slate-800">
                  {classStudents.filter(st => {
                    if (!reportStudentSearch.trim()) return true;
                    const q = reportStudentSearch.toLowerCase().trim();
                    return st.name.toLowerCase().includes(q) || st.studentId.toLowerCase().includes(q);
                  }).map(st => {
                    const isChecked = Boolean(reportForm.participants[st.id]?.selected);
                    return (
                      <div
                        key={st.id}
                        className={`p-2.5 rounded-xl border transition-all ${
                          isChecked 
                            ? 'bg-purple-950/40 border-purple-800/80 shadow-sm' 
                            : 'bg-slate-900/40 border-slate-800/60 opacity-80 hover:opacity-100'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <label className="flex items-center gap-2 cursor-pointer font-bold text-white text-xs select-none">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setReportForm(prev => ({
                                  ...prev,
                                  participants: {
                                    ...prev.participants,
                                    [st.id]: {
                                      ...(prev.participants[st.id] || { role: 'Vận động viên / Thành viên', achievement: '', note: '' }),
                                      selected: checked
                                    }
                                  }
                                }));
                              }}
                              className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                            />
                            <span>{st.name}</span>
                            <span className="font-mono text-[11px] text-amber-400">({st.studentId})</span>
                            <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                              st.isUnionMember ? 'bg-blue-950 text-blue-300' : 'bg-slate-800 text-slate-400'
                            }`}>
                              {st.isUnionMember ? 'ĐV' : 'HS'}
                            </span>
                          </label>

                          <span className="text-[11px] text-slate-400">{st.gender}</span>
                        </div>

                        {/* Extra inputs when student is selected */}
                        {isChecked && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2 pt-2 border-t border-slate-800/80 animate-fadeIn">
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Vai trò / Nhiệm vụ:</span>
                              <input
                                type="text"
                                value={reportForm.participants[st.id]?.role || ''}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setReportForm(prev => ({
                                    ...prev,
                                    participants: {
                                      ...prev.participants,
                                      [st.id]: { ...prev.participants[st.id], role: v }
                                    }
                                  }));
                                }}
                                placeholder="VĐV kéo co, Tiết mục văn nghệ, Tình nguyện viên..."
                                className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px]"
                              />
                            </div>

                            <div>
                              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Thành tích / Khen thưởng:</span>
                              <input
                                type="text"
                                value={reportForm.participants[st.id]?.achievement || ''}
                                onChange={(e) => {
                                  const v = e.target.value;
                                  setReportForm(prev => ({
                                    ...prev,
                                    participants: {
                                      ...prev.participants,
                                      [st.id]: { ...prev.participants[st.id], achievement: v }
                                    }
                                  }));
                                }}
                                placeholder="Giải Nhất, Giải Nhì, Giải Ba, Hoàn thành tốt..."
                                className="w-full px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-white text-[11px]"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
                {/* Proof images for activity report */}
                <div className="pt-2 border-t border-slate-800">
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">
                    📸 Ảnh minh chứng hoạt động của Chi đoàn (Tùy chọn):
                  </label>
                  <div className="flex flex-wrap gap-2 items-center">
                    {reportForm.proofImages.map((img, idx) => (
                      <div key={idx} className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-700">
                        <img
                          src={img}
                          alt="Minh chứng hoạt động"
                          onClick={() => setViewingPhoto(img)}
                          className="w-full h-full object-cover cursor-pointer"
                        />
                        <button
                          type="button"
                          onClick={() => setReportForm(prev => ({ ...prev, proofImages: prev.proofImages.filter((_, i) => i !== idx) }))}
                          className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-600 text-white text-[9px]"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                    <MediaPickerButton
                      category="activities"
                      suggestedClassId={classId}
                      suggestedWeek={activeWeek}
                      multiple={true}
                      onSelect={(urls) => {
                        const newUrls = Array.isArray(urls) ? urls : [urls];
                        setReportForm(prev => ({
                          ...prev,
                          proofImages: Array.from(new Set([...prev.proofImages, ...newUrls]))
                        }));
                      }}
                      label="Kho Media / Tải Ảnh Hoạt Động"
                      className="px-3 py-2 rounded-xl border border-dashed border-purple-500/60 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 font-bold text-xs"
                    />
                  </div>
                </div>

              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold shadow-glow flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Báo Cáo Cho Đoàn Trường</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= APPEAL / PHÚC KHẢO MODAL FOR BÍ THƯ ================= */}
      {appealingVio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-600/20 text-rose-400 border border-rose-600/30">
                  <MessageSquare className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-white">YÊU CẦU PHÚC KHẢO / GIẢI TRÌNH</h3>
                  <p className="text-xs text-slate-400">Gửi đơn khiếu nại lên Ban Quản Trị Đoàn trường</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setAppealingVio(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 text-xs">
              <p className="text-slate-400">Nội dung lỗi bị trừ:</p>
              <p className="font-bold text-white text-sm">{appealingVio.criterionName}</p>
              <p className="text-rose-400 font-bold">Mức điểm trừ: -{appealingVio.pointsDeducted} điểm ({appealingVio.day})</p>
            </div>

            <form onSubmit={handleSendAppeal} className="space-y-4 text-xs">
              <RichTextEditor
                value={appealReason}
                onChange={setAppealReason}
                label="Lý do phúc khảo / Giải trình cụ thể (*):"
                placeholder="Ví dụ: Học sinh bị ốm có giấy xác nhận của Phòng Y tế; Chi đoàn đã trực nhật sạch sẽ lúc 6h45 trước khi chấm..."
                toolbarPreset="minimal"
                minHeight="140px"
              />

              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  📎 Ảnh giấy xác nhận / Minh chứng đối chất:
                </label>
                <div className="flex items-center gap-3">
                  {appealProof && (
                    <div className="relative group w-16 h-16 rounded-xl overflow-hidden border border-slate-700">
                      <img
                        src={appealProof}
                        alt="Giấy xác nhận"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setAppealProof('')}
                        className="absolute top-0.5 right-0.5 p-0.5 rounded-full bg-red-600 text-white text-[9px]"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                  <MediaPickerButton
                    category="violations"
                    suggestedClassId={classId}
                    suggestedWeek={activeWeek}
                    onSelect={(url) => setAppealProof(Array.isArray(url) ? url[0] : url)}
                    label="Chọn / Chụp Ảnh Minh Chứng"
                    className="px-3.5 py-2.5 rounded-xl border border-dashed border-amber-500/60 bg-amber-950/20 hover:bg-amber-950/40 text-amber-300 font-bold"
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
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold shadow-glow flex items-center gap-1.5 active:scale-95"
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
