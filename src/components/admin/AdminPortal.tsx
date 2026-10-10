import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Table,
  Scale,
  Sliders,
  Lock,
  Unlock,
  FileSpreadsheet,
  Printer,
  Share2,
  Users,
  Plus,
  X,
  Bell,
  CheckCircle2,
  CheckSquare,
  Download,
  Trash2,
  Edit3,
  KeyRound,
  Copy,
  Search,
  Newspaper,
  Eye,
  EyeOff,
  Settings,
  GraduationCap,
  FileUp,
  UserPlus,
  ArrowRightLeft,
  Archive,
  Clock,
  Pin,
  Paperclip,
  Upload,
  File,
  Filter,
  Star,
  ShieldAlert,
  BadgeCheck,
  Activity,
  Calendar,
  Megaphone,
  Image as ImageIcon,
  Sparkles,
  Palette,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Award,
  Trophy,
  PieChart,
  LineChart,
  Layers,
  Flame,
  ChevronDown,
  Database,
  HardDrive,
  RefreshCw,
  FileCheck,
  Shield,
  Loader2,
  Cloud,
  Folder,
  FolderPlus,
  FileText,
  Globe,
  ExternalLink
} from 'lucide-react';
import { SupabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import {
  Criterion,
  DayOfWeek,
  User,
  ClassInfo,
  NewsPost,
  WeekConfig,
  Violation,
  ViolationStatus,
  Student,
  DutyAssignment,
  DutyZone,
  AuditorMember,
  ActivitySlide,
  TaskNotice,
  YouthEvent,
  ActivityReport,
  ActivityParticipant,
  ActivityNonParticipant
} from '../../types';
import { PhotoViewerModal } from '../common/PhotoViewerModal';
import { AcademicYearRolloverModal } from './AcademicYearRolloverModal';
import { SortableTh } from '../common/SortableTh';
import { sortDataList } from '../../utils/sortUtils';
import { MediaPickerButton } from '../common/MediaPickerButton';
import { MediaManagerModal } from '../common/MediaManagerModal';
import { ResourceManagerView } from '../common/ResourceManagerView';
import { RichTextEditor } from '../common/RichTextEditor';
import { RichTextViewer } from '../common/RichTextViewer';
import { DocumentManagerModal } from '../common/DocumentManagerModal';
import { DocumentViewerModal } from '../common/DocumentViewerModal';
import { DocumentPickerButton } from '../common/DocumentPickerButton';
import { compressImageToDataURL } from '../../utils/imageCompressor';

export const AdminPortal: React.FC = () => {
  const {
    currentUser,
    activeWeek,
    isWeekLocked,
    classes,
    students,
    criteria,
    violations,
    news,
    notices,
    events,
    users,
    duties,
    zones,
    auditors,
    auditLogs,
    weeksConfig,
    schoolSettings,
    activitySlides,
    mediaFolders,
    mediaAssets,
    addMediaFolder,
    updateMediaFolder,
    deleteMediaFolder,
    moveMediaToFolder,
    batchMoveMediaToFolder,
    addMediaAsset,
    deleteMediaAsset,
    documentFolders,
    documentFiles,
    addDocumentFolder,
    updateDocumentFolder,
    deleteDocumentFolder,
    addDocumentFile,
    updateDocumentFile,
    deleteDocumentFile,
    incrementDocumentDownloads,
    incrementDocumentViews,
    moveDocumentFile,
    academicYears,
    selectedAcademicYearId,
    currentAcademicYear,
    isHistoricalYear,
    setSelectedAcademicYearId,
    executeAcademicYearRollover,
    addActivitySlide,
    updateActivitySlide,
    deleteActivitySlide,
    toggleActivitySlideStatus,
    getWeeklyScores,
    resolveAppeal,
    addCriterion,
    updateCriterion,
    deleteCriterion,
    toggleCriterion,
    lockWeek,
    unlockWeek,
    addUser,
    updateUser,
    deleteUser,
    toggleUserActive,
    resetPassword,
    addClass,
    updateClass,
    deleteClass,
    archiveClass,
    addStudent,
    updateStudent,
    deleteStudent,
    deleteStudentsBatch,
    transferStudent,
    importStudents,
    upsertStudentsFromExcel,
    addViolation,
    updateViolation,
    deleteViolation,
    addDutyAssignment,
    updateDutyAssignment,
    deleteDutyAssignment,
    generateDefaultDutiesForWeek,
    copyDutiesToWeek,
    addZone,
    updateZone,
    deleteZone,
    addAuditorMember,
    updateAuditorMember,
    deleteAuditorMember,
    toggleAuditorActive,
    addNewsPost,
    updateNewsPost,
    deleteNewsPost,
    toggleNewsVisibility,
    addNotice,
    updateNotice,
    deleteNotice,
    addEvent,
    updateEvent,
    deleteEvent,
    updateSchoolSettings,
    addWeek,
    updateWeek,
    deleteWeek,
    toggleWeekLockDirect,
    setCurrentWeek,
    toggleWeekVisibility,
    resetToDefault35Weeks,
    updateSemesterConfig,
    syncWeeksToCloud,
    activityReports,
    verifyActivityReport,
    deleteActivityReport,
    getSemesterScores,
    createFullBackupSnapshot,
    restoreFullBackup,
    cleanOldStorageData
  } = useApp();

  // Active Admin Hub (5 Main Consolidated Hubs)
  const [adminTab, setAdminTab] = useState<
    'violations_hub' | 'operations_hub' | 'media_hub' | 'criteria' | 'system_hub'
  >('violations_hub');

  // Violations & Scoring Hub Sub-Tab: 'scoreboard' | 'violations_list' | 'appeals'
  const [violationHubSubTab, setViolationHubSubTab] = useState<'scoreboard' | 'violations_list' | 'appeals'>('scoreboard');
  const [violationHubWeek, setViolationHubWeek] = useState<number>(activeWeek);

  // Operations Hub Sub-Tab: 'students' | 'classes' | 'duties' | 'weeks'
  const [operationsSubTab, setOperationsSubTab] = useState<'students' | 'classes' | 'duties' | 'weeks'>('students');

  // Media Hub Sub-Tab: 'news_events' | 'news' | 'announcements' | 'tasks_notices' | 'events' | 'activity_reports' | 'media_library' | 'documents'
  const [mediaHubSubTab, setMediaHubSubTab] = useState<'news_events' | 'news' | 'announcements' | 'tasks_notices' | 'events' | 'activity_reports' | 'media_library' | 'documents'>('news_events');
  const [newsEventsViewFilter, setNewsEventsViewFilter] = useState<'ALL' | 'events' | 'news'>('ALL');
  const [activitySearch, setActivitySearch] = useState<string>('');
  const [activityClassFilter, setActivityClassFilter] = useState<string>('ALL');
  const [activityTypeFilter, setActivityTypeFilter] = useState<string>('ALL');
  const [activityStatusFilter, setActivityStatusFilter] = useState<string>('ALL');
  const [selectedReportDetail, setSelectedReportDetail] = useState<import('../../types').ActivityReport | null>(null);

  // Media Library Sub-Tab state in Media Hub
  const [mediaSearchQuery, setMediaSearchQuery] = useState<string>('');
  const [mediaCategoryFilter, setMediaCategoryFilter] = useState<string>('ALL');
  const [mediaFolderFilter, setMediaFolderFilter] = useState<string>('ALL');
  const [mediaClassFilter, setMediaClassFilter] = useState<string>('ALL');
  const [isGlobalMediaModalOpen, setIsGlobalMediaModalOpen] = useState<boolean>(false);
  const [previewMediaItem, setPreviewMediaItem] = useState<import('../../types').MediaItem | null>(null);

  // Document Management Sub-Tab state
  const [isGlobalDocumentModalOpen, setIsGlobalDocumentModalOpen] = useState<boolean>(false);
  const [previewDocumentFile, setPreviewDocumentFile] = useState<import('../../types').DocumentFile | null>(null);
  const [docSearchQuery, setDocSearchQuery] = useState<string>('');
  const [docFolderFilter, setDocFolderFilter] = useState<string>('ALL');
  const [docCategoryFilter, setDocCategoryFilter] = useState<string>('ALL');

  // System Hub Sub-Tab: 'users' | 'settings' | 'slides' | 'export' | 'backup' | 'rollover' | 'logs'
  const [systemHubSubTab, setSystemHubSubTab] = useState<'users' | 'settings' | 'slides' | 'export' | 'backup' | 'rollover' | 'logs'>('users');
  const [isRolloverModalOpen, setIsRolloverModalOpen] = useState<boolean>(false);

  // Activity Slide Modal state
  const [isSlideModalOpen, setIsSlideModalOpen] = useState<boolean>(false);
  const [editingSlide, setEditingSlide] = useState<ActivitySlide | null>(null);
  const [slideForm, setSlideForm] = useState<{
    title: string;
    subtitle: string;
    imageUrl: string;
    date: string;
    tag: string;
    isActive: boolean;
    order: number;
  }>({
    title: '',
    subtitle: '',
    imageUrl: '',
    date: new Date().toLocaleDateString('vi-VN'),
    tag: 'Phong trào',
    isActive: true,
    order: 1
  });

  const handleSlideImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage('slide');
    try {
      if (isSupabaseConfigured()) {
        const publicUrl = await SupabaseService.uploadImage(file, 'media');
        if (publicUrl) {
          setSlideForm(prev => ({ ...prev, imageUrl: publicUrl }));
          return;
        }
      }
      const compressed = await compressImageToDataURL(file, { maxWidth: 1400, maxHeight: 1400, quality: 0.82, outputFormat: 'image/webp' });
      if (compressed) {
        setSlideForm(prev => ({ ...prev, imageUrl: compressed }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingImage(null);
      e.target.value = '';
    }
  };

  const handleSlideFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!slideForm.title.trim() || !slideForm.imageUrl.trim()) {
      alert('Vui lòng nhập tiêu đề và chọn/nhập ảnh slide!');
      return;
    }
    if (editingSlide) {
      updateActivitySlide(editingSlide.id, slideForm);
    } else {
      addActivitySlide(slideForm);
    }
    setIsSlideModalOpen(false);
    setEditingSlide(null);
  };

  // Report & Statistics Hub States
  const [reportViewTab, setReportViewTab] = useState<'weeks_grid' | 'cumulative_ranking' | 'charts' | 'weekly_analysis' | 'semester_summary'>('weeks_grid');
  const [selectedReportWeek, setSelectedReportWeek] = useState<number>(activeWeek);
  const [chartGradeFilter, setChartGradeFilter] = useState<'ALL' | 10 | 11 | 12>('ALL');
  const [cumulativeGradeFilter, setCumulativeGradeFilter] = useState<'ALL' | 10 | 11 | 12>('ALL');
  const [isUploadingImage, setIsUploadingImage] = useState<string | null>(null);

  // Semester / Term Summary State
  const [semesterReportType, setSemesterReportType] = useState<'HK1' | 'HK2' | 'YEAR'>('HK1');
  const semesterClassScores = useMemo(() => {
    return getSemesterScores(semesterReportType);
  }, [semesterReportType, classes, violations, weeksConfig]);

  // ================= TABLE SORTING STATES & HELPERS =================
  const [scoreSort, setScoreSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'rank', direction: 'asc' });
  const [violationSort, setViolationSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'day', direction: 'asc' });
  const [studentSort, setStudentSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'name', direction: 'asc' });
  const [cumulativeSort, setCumulativeSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'cumulativeRank', direction: 'asc' });
  const [weeklyMatrixSort, setWeeklyMatrixSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'rank', direction: 'asc' });
  const [semesterSort, setSemesterSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'rank', direction: 'asc' });
  const [userTableSort, setUserTableSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'username', direction: 'asc' });
  const [academicYearSort, setAcademicYearSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'id', direction: 'desc' });

  const handleToggleSort = (setter: React.Dispatch<React.SetStateAction<{ key: string; direction: 'asc' | 'desc' }>>, key: string) => {
    setter(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Full Database Backup & Restore File Input Ref
  const backupFileInputRef = useRef<HTMLInputElement>(null);
  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);
  const [cloudSyncResult, setCloudSyncResult] = useState<{ success: boolean; message: string } | null>(null);

  const handleSyncToSupabaseCloud = async () => {
    setIsSyncingCloud(true);
    setCloudSyncResult(null);
    try {
      const res = await SupabaseService.seedLocalDataToSupabase({
        classes,
        criteria,
        students,
        violations,
        news,
        notices,
        schoolSettings
      });
      setCloudSyncResult(res);
      if (res.success) {
        alert('🎉 ' + res.message);
      } else {
        alert('⚠️ ' + res.message);
      }
    } catch (err: any) {
      const errMsg = `Lỗi kết nối đồng bộ: ${err?.message || 'Không xác định'}`;
      setCloudSyncResult({ success: false, message: errMsg });
      alert('❌ ' + errMsg);
    } finally {
      setIsSyncingCloud(false);
    }
  };

  // Export Semester Summary to Excel (.xlsx) with all weekly breakdowns & adjustable cells
  const handleExportSemesterExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      const weekNums = semesterReportType === 'HK1'
        ? Array.from({ length: 18 }, (_, i) => i + 1)
        : semesterReportType === 'HK2'
          ? Array.from({ length: 17 }, (_, i) => i + 19)
          : Array.from({ length: 35 }, (_, i) => i + 1);

      const rows: any[] = [];
      semesterClassScores.forEach((item, idx) => {
        const rowObj: any = {
          'STT': idx + 1,
          'XẾP HẠNG': `#${item.rank}`,
          'CHI ĐOÀN / LỚP': item.className,
          'KHỐI': `Khối ${item.grade}`,
          'GIÁO VIÊN CHỦ NHIỆM': classes.find(c => c.id === item.classId)?.gvcnName || 'Chưa gán',
          'SỐ TUẦN XÉT': item.totalWeeksEvaluated,
          'ĐIỂM TRUNG BÌNH TUẦN': item.averageWeeklyScore,
          'TỔNG ĐIỂM TRỪ': item.totalDeductions > 0 ? `-${item.totalDeductions}` : '0',
          'TỔNG ĐIỂM CỘNG': item.totalBonuses > 0 ? `+${item.totalBonuses}` : '0',
          'SỐ LƯỢNG LỖI VI PHẠM': item.totalViolations,
          'KHIẾU NẠI ĐÃ DUYỆT': item.resolvedAppeals,
          'ĐIỂM TỔNG KẾT': item.finalSemesterScore,
          'DANH HIỆU THI ĐUA': item.awardTitle
        };

        weekNums.forEach(w => {
          rowObj[`Tuần ${w}`] = item.weeklyScores[w] ?? 1440;
        });

        rows.push(rowObj);
      });

      const ws = XLSX.utils.json_to_sheet(rows);
      XLSX.utils.book_append_sheet(wb, ws, `So_Ket_${semesterReportType}`);

      const fileName = `Bang_So_Ket_Thi_Dua_${semesterReportType}_THPT_QuangTrung_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.xlsx`;
      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi xuất file Excel Sơ kết!');
    }
  };

  // Export Formal PDF Document using jsPDF and autotable
  const handleExportSemesterPDF = () => {
    try {
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      });

      const termTitle = semesterReportType === 'HK1'
        ? 'HỌC KỲ I (NĂM HỌC 2025 - 2026)'
        : semesterReportType === 'HK2'
          ? 'HỌC KỲ II (NĂM HỌC 2025 - 2026)'
          : 'CẢ NĂM HỌC 2025 - 2026';

      // Header
      doc.setFontSize(10);
      doc.text('ĐOÀN TNCS HỒ CHÍ MINH TP ĐÀ NẴNG', 20, 15);
      doc.text('BCH ĐOÀN TRƯỜNG THPT QUANG TRUNG', 20, 20);
      doc.text('***', 45, 24);

      doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 190, 15);
      doc.text('Độc lập - Tự do - Hạnh phúc', 205, 20);
      doc.text('---------------', 215, 24);

      // Title
      doc.setFontSize(16);
      doc.text('BẢNG TỔNG KẾT & SƠ KẾT THI ĐUA NỀ NẾP CHI ĐOÀN', 148, 36, { align: 'center' });
      doc.setFontSize(12);
      doc.text(termTitle, 148, 43, { align: 'center' });

      // Table data
      const tableHeaders = [
        ['STT', 'Hạng', 'Chi Đoàn', 'Khối', 'GVCN', 'Số Tuần', 'Điểm TB', 'Tổng Trừ', 'Tổng Cộng', 'Lỗi VP', 'Danh Hiệu Khen Thưởng']
      ];

      const tableBody = semesterClassScores.map((item, idx) => [
        (idx + 1).toString(),
        `#${item.rank}`,
        item.className,
        `Khối ${item.grade}`,
        classes.find(c => c.id === item.classId)?.gvcnName || '-',
        item.totalWeeksEvaluated,
        `${item.averageWeeklyScore}đ`,
        `-${item.totalDeductions}đ`,
        `+${item.totalBonuses}đ`,
        item.totalViolations,
        item.awardTitle
      ]);

      (doc as any).autoTable({
        head: tableHeaders,
        body: tableBody,
        startY: 48,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2.5, halign: 'center' },
        headStyles: { fillColor: [185, 28, 28], textColor: [255, 255, 255], fontStyle: 'bold' },
        columnStyles: {
          1: { halign: 'left', fontStyle: 'bold' },
          3: { halign: 'left' },
          9: { halign: 'left', fontStyle: 'bold' }
        }
      });

      const finalY = ((doc as any).lastAutoTable?.finalY || 140) + 15;

      // Signature Block
      doc.setFontSize(10);
      doc.text('Đông Giang, ngày ..... tháng ..... năm 2026', 200, finalY);
      doc.text('TM. BAN GIÁM HIỆU', 40, finalY + 7);
      doc.text('HIỆU TRƯỞNG', 45, finalY + 12);
      doc.text('(Ký và đóng dấu)', 44, finalY + 17);

      doc.text('TM. BAN CHẤP HÀNH ĐOÀN TRƯỜNG', 200, finalY + 7);
      doc.text('BÍ THƯ ĐOÀN TRƯỜNG', 212, finalY + 12);
      doc.text('(Ký và ghi rõ họ tên)', 211, finalY + 17);

      doc.save(`Bao_Cao_So_Ket_Thi_Dua_${semesterReportType}_THPT_QuangTrung.pdf`);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo file PDF Sơ kết!');
    }
  };

  // Full Database Backup Handlers
  const handleExportFullJSONBackup = () => {
    try {
      const snapshot = createFullBackupSnapshot();
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `CSDL_THPT_QuangTrung_Backup_Snapshot_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi tạo file sao lưu JSON!');
    }
  };

  const handleExportMultiSheetExcelBackup = () => {
    try {
      const wb = XLSX.utils.book_new();

      const wsClasses = XLSX.utils.json_to_sheet(classes);
      XLSX.utils.book_append_sheet(wb, wsClasses, 'Lop_Hoc');

      const wsStudents = XLSX.utils.json_to_sheet(students);
      XLSX.utils.book_append_sheet(wb, wsStudents, 'Hoc_Sinh_Doan_Vien');

      const wsCriteria = XLSX.utils.json_to_sheet(criteria);
      XLSX.utils.book_append_sheet(wb, wsCriteria, 'Tieu_Chi_Thi_Dua');

      const wsViolations = XLSX.utils.json_to_sheet(violations);
      XLSX.utils.book_append_sheet(wb, wsViolations, 'Vi_Pham_Ne_Nep');

      const wsReports = XLSX.utils.json_to_sheet(activityReports);
      XLSX.utils.book_append_sheet(wb, wsReports, 'Bao_Cao_Phong_Trao');

      const wsLogs = XLSX.utils.json_to_sheet(auditLogs);
      XLSX.utils.book_append_sheet(wb, wsLogs, 'Nhat_Ky_Kiem_Toan');

      XLSX.writeFile(wb, `Toan_Bo_CSDL_MultiSheet_THPT_QuangTrung_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.xlsx`);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi xuất file Excel sao lưu CSDL!');
    }
  };

  const handleImportJSONBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (confirm('CẢNH BÁO QUAN TRỌNG: Khôi phục CSDL từ file snapshot sẽ cập nhật toàn bộ cơ sở dữ liệu hiện tại của hệ thống. Bạn có chắc chắn muốn tiến hành?')) {
            const res = restoreFullBackup(parsed);
            alert(res.message);
          }
        } catch (err: any) {
          alert('Tệp JSON không đúng định dạng: ' + err.message);
        }
      };
      reader.readAsText(file);
    }
  };

  // Multi-week cumulative calculations across all created weeks
  const multiWeekSummary = useMemo(() => {
    const classData = classes.map(cls => {
      const weeklyBreakdowns = weeksConfig.map(week => {
        const scores = getWeeklyScores(week.weekNumber);
        const found = scores.find(s => s.classId === cls.id);
        return {
          weekNumber: week.weekNumber,
          weekTitle: week.title,
          finalScore: found ? found.finalScore : 1440,
          totalDeduction: found ? found.totalDeduction : 0,
          totalBonus: found ? found.totalBonus : 0,
          rank: found ? found.rank : 0,
          violationCount: found ? found.violationCount : 0
        };
      });

      const totalCumulativeScore = weeklyBreakdowns.reduce((sum, w) => sum + w.finalScore, 0);
      const totalViolations = weeklyBreakdowns.reduce((sum, w) => sum + w.violationCount, 0);
      const totalDeductions = weeklyBreakdowns.reduce((sum, w) => sum + w.totalDeduction, 0);
      const totalBonus = weeklyBreakdowns.reduce((sum, w) => sum + w.totalBonus, 0);
      const avgScore = weeksConfig.length > 0 ? +(totalCumulativeScore / weeksConfig.length).toFixed(1) : 1440;

      return {
        classId: cls.id,
        className: cls.name,
        grade: cls.grade,
        homeroomTeacher: cls.gvcnName || 'Chưa gán',
        youthSecretary: cls.bithuName || 'Chưa gán',
        studentCount: cls.totalStudents || 0,
        weeklyBreakdowns,
        totalCumulativeScore,
        totalViolations,
        totalDeductions,
        totalBonus,
        avgScore,
        cumulativeRank: 0,
        rating: avgScore >= 1425 ? 'Xuất sắc' : avgScore >= 1400 ? 'Tiên tiến' : avgScore >= 1370 ? 'Khá' : 'Cần cố gắng'
      };
    });

    classData.sort((a, b) => b.totalCumulativeScore - a.totalCumulativeScore);
    classData.forEach((item, idx) => {
      item.cumulativeRank = idx + 1;
    });

    return classData;
  }, [classes, weeksConfig, violations]);

  // Selected week scores & metrics
  const selectedWeekScores = useMemo(() => {
    return getWeeklyScores(selectedReportWeek);
  }, [selectedReportWeek, violations, classes]);

  const sortedCumulativeSummary = useMemo(() => {
    const list = multiWeekSummary.filter(cls => cumulativeGradeFilter === 'ALL' || cls.grade === cumulativeGradeFilter);
    return sortDataList(list, cumulativeSort.key, cumulativeSort.direction);
  }, [multiWeekSummary, cumulativeGradeFilter, cumulativeSort]);

  const sortedWeeklyScores = useMemo(() => {
    return sortDataList(selectedWeekScores, weeklyMatrixSort.key, weeklyMatrixSort.direction);
  }, [selectedWeekScores, weeklyMatrixSort]);

  const sortedSemesterScores = useMemo(() => {
    return sortDataList(semesterClassScores, semesterSort.key, semesterSort.direction);
  }, [semesterClassScores, semesterSort]);

  const sortedAcademicYears = useMemo(() => {
    return sortDataList(academicYears, academicYearSort.key, academicYearSort.direction);
  }, [academicYears, academicYearSort]);

  const selectedWeekViolations = useMemo(() => {
    return violations.filter(v => v.weekNumber === selectedReportWeek && v.status !== 'approved_appeal');
  }, [selectedReportWeek, violations]);

  const criteriaBreakdown = useMemo(() => {
    const counts: Record<string, { count: number; points: number }> = {
      'I. Chuyên cần & Giờ giấc': { count: 0, points: 0 },
      'II. Đồng phục & Tác phong': { count: 0, points: 0 },
      'III. Học tập & Kỷ luật lớp': { count: 0, points: 0 },
      'IV. Vệ sinh & Môi trường': { count: 0, points: 0 },
      'V. Hoạt động Đoàn & Phong trào': { count: 0, points: 0 }
    };

    selectedWeekViolations.forEach(v => {
      const g = v.groupName || 'Khác';
      if (!counts[g]) {
        counts[g] = { count: 0, points: 0 };
      }
      counts[g].count += (v.quantity || 1);
      counts[g].points += (v.pointsDeducted || 0);
    });

    const totalVios = selectedWeekViolations.reduce((sum, v) => sum + (v.quantity || 1), 0) || 1;
    return Object.entries(counts).map(([group, data]) => ({
      group,
      count: data.count,
      points: data.points,
      percent: Math.round((data.count / totalVios) * 100)
    }));
  }, [selectedWeekViolations]);

  // Export Comprehensive Multi-Week Cumulative Excel
  const handleExportCumulativeExcel = () => {
    try {
      const wb = XLSX.utils.book_new();

      // Sheet 1: Bảng Tổng Hợp Lũy Kế Đa Tuần
      const headerRow1 = [
        'STT',
        'HẠNG TỔNG HỢP',
        'LỚP',
        'KHỐI',
        'GIÁO VIÊN CHỦ NHIỆM',
        ...weeksConfig.map(w => `${w.title} (Điểm)`),
        'TỔNG ĐIỂM LŨY KẾ',
        'ĐIỂM TRUNG BÌNH / TUẦN',
        'TỔNG LỖI VI PHẠM',
        'DANH HIỆU THI ĐUA'
      ];

      const dataRows1 = multiWeekSummary.map((item, idx) => [
        idx + 1,
        `#${item.cumulativeRank}`,
        item.className,
        `Khối ${item.grade}`,
        item.homeroomTeacher,
        ...item.weeklyBreakdowns.map(w => w.finalScore),
        item.totalCumulativeScore,
        item.avgScore,
        item.totalViolations,
        item.rating
      ]);

      const ws1 = XLSX.utils.aoa_to_sheet([
        [`BÁO CÁO THỐNG KÊ THI ĐUA TỔNG HỢP LŨY KẾ - ${schoolSettings.schoolName.toUpperCase()}`],
        [`Thời gian xuất: ${new Date().toLocaleString('vi-VN')} | Tổng số tuần: ${weeksConfig.length}`],
        [],
        headerRow1,
        ...dataRows1
      ]);
      XLSX.utils.book_append_sheet(wb, ws1, 'Tổng Hợp Lũy Kế');

      // Sheet 2: Danh Sách Tuần & Kết Quả Từng Tuần
      const headerRow2 = ['STT', 'MÃ TUẦN', 'TÊN TUẦN', 'TỪ NGÀY', 'ĐẾN NGÀY', 'TRẠNG THÁI', 'ĐIỂM TRUNG BÌNH', 'TOP 1', 'TOP 2', 'TOP 3'];
      const dataRows2 = weeksConfig.map((w, idx) => {
        const scores = getWeeklyScores(w.weekNumber);
        const avg = scores.length > 0 ? (scores.reduce((sum, s) => sum + s.finalScore, 0) / scores.length).toFixed(1) : '1440';
        return [
          idx + 1,
          `Tuần ${w.weekNumber}`,
          w.title,
          w.startDate,
          w.endDate,
          w.isLocked ? 'Đã Khóa Sổ' : 'Đang Mở Điểm',
          `${avg}đ`,
          scores[0]?.className || '-',
          scores[1]?.className || '-',
          scores[2]?.className || '-'
        ];
      });
      const ws2 = XLSX.utils.aoa_to_sheet([
        ['DANH SÁCH CÁC TUẦN THI ĐUA ĐÃ CẤU HÌNH'],
        [],
        headerRow2,
        ...dataRows2
      ]);
      XLSX.utils.book_append_sheet(wb, ws2, 'Danh Sách Tuần');

      // Sheet 3: Danh Sách Vi Phạm Toàn Trường
      const headerRow3 = ['STT', 'MÃ LỖI', 'TUẦN', 'THỨ', 'NGÀY', 'LỚP', 'TIÊU CHÍ VI PHẠM', 'NHÓM', 'SỐ LƯỢNG', 'ĐIỂM TRỪ', 'NGƯỜI GHI NHẬN', 'TRẠNG THÁI'];
      const dataRows3 = violations.map((v, idx) => [
        idx + 1,
        v.id,
        `Tuần ${v.weekNumber}`,
        v.day,
        v.date,
        v.className,
        v.criterionName,
        v.groupName,
        v.quantity,
        `-${v.pointsDeducted}đ`,
        v.reportedBy?.name || 'Cờ đỏ',
        v.status === 'approved_appeal' ? 'Đã Hủy Lỗi (Phúc Khảo)' : v.status === 'appealed' ? 'Đang Phúc Khảo' : 'Đã Ghi Nhận'
      ]);
      const ws3 = XLSX.utils.aoa_to_sheet([
        ['DANH SÁCH CHI TIẾT VI PHẠM NỀ NẾP TOÀN TRƯỜNG'],
        [],
        headerRow3,
        ...dataRows3
      ]);
      XLSX.utils.book_append_sheet(wb, ws3, 'Vi Phạm Toàn Trường');

      XLSX.writeFile(wb, `BaoCao_ThongKe_ThiDua_LuyKe_${schoolSettings.schoolName.replace(/\s+/g, '_')}.xlsx`);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi xuất file Excel. Vui lòng thử lại!');
    }
  };

  // Export Single Week Excel
  const handleExportSingleWeekExcel = (weekNum: number) => {
    try {
      const wb = XLSX.utils.book_new();
      const scores = getWeeklyScores(weekNum);
      const weekConf = weeksConfig.find(w => w.weekNumber === weekNum);

      const header1 = ['STT', 'HẠNG', 'LỚP', 'KHỐI', 'GVCN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'ĐIỂM TRỪ', 'ĐIỂM THƯỞNG', 'ĐIỂM TỔNG', 'XẾP LOẠI'];
      const data1 = scores.map((s, idx) => [
        idx + 1,
        `#${s.rank}`,
        s.className,
        `Khối ${s.grade}`,
        classes.find(c => c.id === s.classId)?.gvcnName || '',
        s.dailyScores.T2.final,
        s.dailyScores.T3.final,
        s.dailyScores.T4.final,
        s.dailyScores.T5.final,
        s.dailyScores.T6.final,
        s.dailyScores.T7.final,
        `-${s.totalDeduction}đ`,
        `+${s.totalBonus}đ`,
        `${s.finalScore}đ`,
        s.rating
      ]);
      const ws1 = XLSX.utils.aoa_to_sheet([
        [`BẢNG ĐIỂM THI ĐUA NỀ NẾP - TUẦN ${weekNum} (${weekConf?.startDate || ''} đến ${weekConf?.endDate || ''})`],
        [`Trường: ${schoolSettings.schoolName}`],
        [],
        header1,
        ...data1
      ]);
      XLSX.utils.book_append_sheet(wb, ws1, `Bảng Điểm Tuần ${weekNum}`);

      const weekVios = violations.filter(v => v.weekNumber === weekNum);
      const header2 = ['STT', 'THỨ', 'NGÀY', 'LỚP', 'TIÊU CHÍ', 'NHÓM', 'SỐ LƯỢNG', 'ĐIỂM TRỪ', 'HỌC SINH', 'NGƯỜI BÁO', 'TRẠNG THÁI'];
      const data2 = weekVios.map((v, idx) => [
        idx + 1,
        v.day,
        v.date,
        v.className,
        v.criterionName,
        v.groupName,
        v.quantity,
        `-${v.pointsDeducted}đ`,
        (v.studentNames || []).join(', ') || '-',
        v.reportedBy?.name || 'Cờ đỏ',
        v.status
      ]);
      const ws2 = XLSX.utils.aoa_to_sheet([
        [`DANH SÁCH VI PHẠM NỀ NẾP TUẦN ${weekNum}`],
        [],
        header2,
        ...data2
      ]);
      XLSX.utils.book_append_sheet(wb, ws2, `Vi Phạm Tuần ${weekNum}`);

      XLSX.writeFile(wb, `SoDiem_Tuan_${weekNum}_${schoolSettings.schoolName.replace(/\s+/g, '_')}.xlsx`);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi xuất file Excel tuần!');
    }
  };

  // Criteria Search & Filters State
  const [critSearch, setCritSearch] = useState<string>('');
  const [critGroupFilter, setCritGroupFilter] = useState<string>('ALL');
  const [critTypeFilter, setCritTypeFilter] = useState<'ALL' | 'deduction' | 'addition'>('ALL');
  const [critStatusFilter, setCritStatusFilter] = useState<'ALL' | 'active' | 'inactive' | 'severe'>('ALL');

  // User Management filters
  const [userRoleFilter, setUserRoleFilter] = useState<string>('ALL');
  const [userSearch, setUserSearch] = useState<string>('');

  // Duty Schedule state
  const [dutyWeekFilter, setDutyWeekFilter] = useState<number>(activeWeek);
  const [dutyViewMode, setDutyViewMode] = useState<'official' | 'matrix'>('official');
  const [dutySessionFilter, setDutySessionFilter] = useState<'ALL' | 'Sáng' | 'Chiều'>('ALL');
  const [dutyDayFilter, setDutyDayFilter] = useState<'ALL' | DayOfWeek>('ALL');
  const [dutySearch, setDutySearch] = useState<string>('');
  const [isDutyModalOpen, setIsDutyModalOpen] = useState<boolean>(false);
  const [editingDuty, setEditingDuty] = useState<DutyAssignment | null>(null);
  const [dutyForm, setDutyForm] = useState<{
    weekNumber: number;
    day: DayOfWeek;
    zone: string;
    auditorId: string;
    auditorName: string;
    auditorClass: string;
    shiftTime: string;
    isLiveNow: boolean;
    targetClasses: string;
    session: 'Sáng' | 'Chiều';
  }>({
    weekNumber: activeWeek,
    day: 'T2',
    zone: zones[0]?.name || 'Phòng 8 (tầng 2), Phòng 7 (tầng 2)',
    auditorId: auditors[0]?.id || 'codo_12_1_1',
    auditorName: auditors[0]?.name || 'Đặng Cát Diệu',
    auditorClass: auditors[0]?.classId || '12/1',
    shiftTime: '06:45 - 07:15 & 11:15 - 11:45',
    isLiveNow: true,
    targetClasses: '10/1, 10/2',
    session: 'Sáng'
  });

  const [isCopyDutyModalOpen, setIsCopyDutyModalOpen] = useState<boolean>(false);
  const [copyTargetWeek, setCopyTargetWeek] = useState<number>(activeWeek + 1);

  // Zone CRUD Modal state
  const [isZoneModalOpen, setIsZoneModalOpen] = useState<boolean>(false);
  const [editingZone, setEditingZone] = useState<DutyZone | null>(null);
  const [zoneForm, setZoneForm] = useState<{
    name: string;
    description: string;
    icon: string;
  }>({
    name: '',
    description: '',
    icon: '🏢'
  });

  // Auditor Member CRUD Modal state
  const [isAuditorModalOpen, setIsAuditorModalOpen] = useState<boolean>(false);
  const [editingAuditor, setEditingAuditor] = useState<AuditorMember | null>(null);
  const [auditorForm, setAuditorForm] = useState<{
    name: string;
    classId: string;
    phone: string;
    assignedZone: string;
    defaultShiftTime: string;
    isActive: boolean;
  }>({
    name: '',
    classId: '10/1',
    phone: '',
    assignedZone: zones[0]?.name || 'Khối 10',
    defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45',
    isActive: true
  });

  // Master Data sub-tab: 'students' | 'classes'
  const [masterSubTab, setMasterSubTab] = useState<'students' | 'classes'>('students');
  const [classGradeTab, setClassGradeTab] = useState<'ALL' | 10 | 11 | 12>('ALL');

  // ================= GROUP FILTER FOR VIOLATIONS (TÌM KIẾM THI ĐUA THEO NHÓM MẶC ĐỊNH) =================
  const [defaultCriterionGroup, setDefaultCriterionGroup] = useState<string>(() => {
    try {
      return localStorage.getItem('DEFAULT_CRITERION_GROUP') || 'ALL';
    } catch {
      return 'ALL';
    }
  });
  const [selectedCriterionGroup, setSelectedCriterionGroup] = useState<string>(defaultCriterionGroup);
  const [violationSearch, setViolationSearch] = useState<string>('');
  const [violationDayFilter, setViolationDayFilter] = useState<string>('ALL');
  const [violationClassFilter, setViolationClassFilter] = useState<string>('ALL');

  // Save default criterion group
  const handleSetDefaultGroup = (groupName: string) => {
    setDefaultCriterionGroup(groupName);
    try {
      localStorage.setItem('DEFAULT_CRITERION_GROUP', groupName);
      alert(`Đã đặt nhóm "${groupName === 'ALL' ? 'Tất cả nhóm' : groupName}" làm nhóm tìm kiếm mặc định!`);
    } catch (e) {
      console.warn(e);
    }
  };

  // Student Filters & Multi-Selection
  const [studentGradeFilter, setStudentGradeFilter] = useState<'ALL' | '10' | '11' | '12'>('ALL');
  const [studentClassFilter, setStudentClassFilter] = useState<string>('ALL');
  const [studentUnionFilter, setStudentUnionFilter] = useState<string>('ALL');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);

  const toggleSelectAllStudents = () => {
    if (selectedStudentIds.length === filteredStudents.length && filteredStudents.length > 0) {
      setSelectedStudentIds([]);
    } else {
      setSelectedStudentIds(filteredStudents.map(s => s.id || s.studentId));
    }
  };

  const toggleStudentSelection = (id: string) => {
    setSelectedStudentIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBatchDeleteStudents = () => {
    if (selectedStudentIds.length === 0) return;
    if (confirm(`⚠️ CẢNH BÁO: Bạn có chắc chắn muốn xóa ${selectedStudentIds.length} học sinh đã chọn?\nDữ liệu sẽ được xóa đồng thời trên máy và hệ thống Supabase Cloud!`)) {
      deleteStudentsBatch(selectedStudentIds);
      setSelectedStudentIds([]);
      alert(`✅ Đã xóa thành công ${selectedStudentIds.length} học sinh khỏi hệ thống!`);
    }
  };

  const handleBatchMakeUnionMember = (isMember: boolean) => {
    if (selectedStudentIds.length === 0) return;
    selectedStudentIds.forEach(id => {
      updateStudent(id, { isUnionMember: isMember });
    });
    alert(`✅ Đã cập nhật trạng thái Đoàn viên cho ${selectedStudentIds.length} học sinh đã chọn!`);
    setSelectedStudentIds([]);
  };

  const toggleUnionStatus = (studentId: string) => {
    const st = students.find(s => s.id === studentId || s.studentId === studentId);
    if (st) {
      updateStudent(st.id || studentId, { isUnionMember: !st.isUnionMember });
    }
  };

  // Photo viewer state
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  // Lock PIN modal state
  const [pinInput, setPinInput] = useState<string>('');
  const [pinAction, setPinAction] = useState<'lock' | 'unlock' | null>(null);
  const [pinError, setPinError] = useState<string>('');

  // ================= VIOLATION DIRECT CRUD MODAL STATE =================
  const [isViolationModalOpen, setIsViolationModalOpen] = useState<boolean>(false);
  const [editingViolation, setEditingViolation] = useState<Violation | null>(null);
  const [violationForm, setViolationForm] = useState<{
    classId: string;
    day: DayOfWeek;
    criterionId: string;
    quantity: number;
    studentNames: string;
    note: string;
    proofImage: string;
    status: ViolationStatus;
  }>({
    classId: '10/1',
    day: 'T2',
    criterionId: criteria[0]?.id || '1.1',
    quantity: 1,
    studentNames: '',
    note: '',
    proofImage: '',
    status: 'accepted'
  });

  // ================= BONUS POINTS MANAGEMENT MODAL STATE =================
  const [bonusModalClass, setBonusModalClass] = useState<{ classId: string; className: string } | null>(null);
  const [bonusPointsInput, setBonusPointsInput] = useState<number>(5);
  const [bonusReasonInput, setBonusReasonInput] = useState<string>('Khen thưởng phong trào Đoàn');
  const [bonusDayInput, setBonusDayInput] = useState<DayOfWeek>('T2');
  const [bonusNoteInput, setBonusNoteInput] = useState<string>('');

  // ================= DIRECT SCORE OVERRIDE / ENTRY MODAL STATE =================
  const [directScoreModalClass, setDirectScoreModalClass] = useState<{
    classId: string;
    className: string;
    currentScore: number;
    currentDeduct: number;
    currentBonus: number;
  } | null>(null);
  const [directScoreTarget, setDirectScoreTarget] = useState<number>(1440);
  const [directScoreReason, setDirectScoreReason] = useState<string>('Điều chỉnh điểm thi đua tuần (BQT / Admin)');
  const [directScoreDay, setDirectScoreDay] = useState<DayOfWeek>('T2');

  // ================= BATCH DIRECT SCORE ENTRY MODAL STATE (18 CLASSES) =================
  const [isBatchDirectScoreModalOpen, setIsBatchDirectScoreModalOpen] = useState<boolean>(false);
  const [batchScores, setBatchScores] = useState<Record<string, { targetScore: number; reason: string }>>({});

  // ================= CRITERIA MODAL STATE =================
  const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState<boolean>(false);
  const [editingCrit, setEditingCrit] = useState<Criterion | null>(null);
  const [critForm, setCritForm] = useState<{
    code: string;
    name: string;
    groupId: 'I.1' | 'I.2' | 'I.3' | 'I.4';
    groupName: string;
    groupStandardScore: number;
    type: 'deduction' | 'bonus';
    points: number;
    unit: string;
    isSevere: boolean;
    isEnabled: boolean;
    description: string;
  }>({
    code: '1.7',
    name: '',
    groupId: 'I.1',
    groupName: 'Chuyên cần',
    groupStandardScore: 40,
    type: 'deduction',
    points: 1,
    unit: 'đ / HS',
    isSevere: false,
    isEnabled: true,
    description: ''
  });

  // ================= NEWS CRUD MODAL STATE =================
  const [isNewsModalOpen, setIsNewsModalOpen] = useState<boolean>(false);
  const [editingNews, setEditingNews] = useState<NewsPost | null>(null);
  const [newsForm, setNewsForm] = useState<{
    title: string;
    excerpt: string;
    content: string;
    thumbnail: string;
    tags: string;
    isPinned: boolean;
    attachments: Array<{ name: string; url: string; size?: string; type?: string }>;
  }>({
    title: '',
    excerpt: '',
    content: '',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    tags: '#PhongTrao, #NeNep',
    isPinned: false,
    attachments: []
  });

  // ================= ANNOUNCEMENT CRUD MODAL STATE (THÔNG BÁO CHỈ ĐẠO ĐOÀN TRƯỜNG) =================
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState<boolean>(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<NewsPost | null>(null);
  const [announcementForm, setAnnouncementForm] = useState<{
    title: string;
    excerpt: string;
    content: string;
    urgency: 'normal' | 'urgent' | 'critical';
    thumbnail: string;
    tags: string;
    isPinned: boolean;
    attachments: Array<{ name: string; url: string; size?: string; type?: string }>;
  }>({
    title: '',
    excerpt: '',
    content: '',
    urgency: 'urgent',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    tags: '#ThongBaoKhan, #ChiDaoDoan',
    isPinned: true,
    attachments: []
  });

  const announcementThumbnailRef = useRef<HTMLInputElement>(null);
  const announcementAttachmentRef = useRef<HTMLInputElement>(null);

  // ================= NOTICE CRUD MODAL STATE (ĐIỀU ĐỘNG & LAO ĐỘNG) =================
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState<boolean>(false);
  const [editingNotice, setEditingNotice] = useState<TaskNotice | null>(null);
  const [noticeForm, setNoticeForm] = useState<{
    title: string;
    content: string;
    type: 'lao_dong' | 'dieu_dong' | 'cuoc_hop' | 'khac';
    targetClasses: string[];
    deadline: string;
    assignedBy: string;
    status: 'pending' | 'completed';
  }>({
    title: '',
    content: '',
    type: 'lao_dong',
    targetClasses: ['ALL'],
    deadline: '2026-09-05 17:00',
    assignedBy: currentUser?.name ? `${currentUser.name} - ${currentUser.roleTitle || 'Ban Bí thư'}` : 'Cô Zdrăm Thị Thành Thương - Bí thư Đoàn',
    status: 'pending'
  });

  // ================= EVENT CRUD MODAL STATE (SỰ KIỆN PHONG TRÀO ĐOÀN) =================
  const [isEventModalOpen, setIsEventModalOpen] = useState<boolean>(false);
  const [editingEvent, setEditingEvent] = useState<YouthEvent | null>(null);
  const [eventForm, setEventForm] = useState<{
    title: string;
    description: string;
    category: 'Phong trào' | 'Tình nguyện' | 'Thể thao' | 'Học thuật' | 'Văn nghệ';
    thumbnail: string;
    location: string;
    startDate: string;
    endDate: string;
    bonusPoints: number;
    maxSlots: number;
    isRegistrationOpen: boolean;
    qrCodeValue: string;
  }>({
    title: '',
    description: '',
    category: 'Phong trào',
    thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80',
    location: 'Sân lễ trường THPT Quang Trung',
    startDate: '2026-09-05',
    endDate: '2026-09-05',
    bonusPoints: 15,
    maxSlots: 50,
    isRegistrationOpen: true,
    qrCodeValue: `EVT-${Date.now()}`
  });
  const eventThumbnailRef = useRef<HTMLInputElement>(null);

  const handleEventThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage('event');
    try {
      if (isSupabaseConfigured()) {
        const publicUrl = await SupabaseService.uploadImage(file, 'media');
        if (publicUrl) {
          setEventForm(prev => ({ ...prev, thumbnail: publicUrl }));
          return;
        }
      }
      const compressed = await compressImageToDataURL(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82, outputFormat: 'image/webp' });
      if (compressed) {
        setEventForm(prev => ({ ...prev, thumbnail: compressed }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingImage(null);
      e.target.value = '';
    }
  };

  // Settings File Input Refs
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const youthUnionLogoFileInputRef = useRef<HTMLInputElement>(null);
  const topBannerFileInputRef = useRef<HTMLInputElement>(null);
  const footerBannerFileInputRef = useRef<HTMLInputElement>(null);

  // ================= STUDENT CRUD MODAL STATE (ĐẦY ĐỦ THÔNG TIN ĐOÀN VIÊN NÂNG CAO) =================
  const [isStudentModalOpen, setIsStudentModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [studentModalTab, setStudentModalTab] = useState<'basic' | 'union'>('basic');
  const [studentForm, setStudentForm] = useState<{
    studentId: string;
    name: string;
    classId: string;
    grade: 10 | 11 | 12;
    gender: 'Nam' | 'Nữ';
    dob: string;
    ethnicity: string;
    phone: string;
    address: string;
    avatar?: string;
    isUnionMember: boolean;
    unionCardNumber: string;
    unionPosition: string;
    unionJoinedDate: string;
    unionJoinedPlace: string;
    unionFeeStatus: 'paid' | 'unpaid';
    unionBookletStatus: 'submitted' | 'not_submitted';
    conductRating: 'Xuất sắc' | 'Khá' | 'Trung bình' | 'Yếu';
    customNotes: string;
    points: number;
    rankTitle: string;
    status: 'active' | 'archived';
  }>({
    studentId: `HS2024${Math.floor(1000 + Math.random() * 9000)}`,
    name: '',
    classId: '10/1',
    grade: 10,
    gender: 'Nam',
    dob: '2009-01-01',
    ethnicity: 'Kinh',
    phone: '',
    address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
    avatar: '',
    isUnionMember: true,
    unionCardNumber: '',
    unionPosition: 'Đoàn viên',
    unionJoinedDate: '2024-03-26',
    unionJoinedPlace: 'Đoàn trường THPT Quang Trung',
    unionFeeStatus: 'paid',
    unionBookletStatus: 'submitted',
    conductRating: 'Xuất sắc',
    customNotes: '',
    points: 100,
    rankTitle: 'Đoàn viên Tích cực',
    status: 'active'
  });

  // Student Transfer Modal
  const [transferingStudent, setTransferingStudent] = useState<Student | null>(null);
  const [targetTransferClass, setTargetTransferClass] = useState<string>('10/2');

  // Excel Import / Upsert Modal for Students
  const [isImportModalOpen, setIsImportModalOpen] = useState<boolean>(false);
  const [importText, setImportText] = useState<string>('');
  const excelFileInputRef = useRef<HTMLInputElement>(null);

  // ================= CLASS CRUD MODAL STATE =================
  const [isClassModalOpen, setIsClassModalOpen] = useState<boolean>(false);
  const [editingClass, setEditingClass] = useState<ClassInfo | null>(null);
  const [classForm, setClassForm] = useState<{
    id: string;
    name: string;
    grade: 10 | 11 | 12;
    gvcnName: string;
    gvcnId: string;
    classPresidentName: string;
    classPresidentPhone: string;
    academicVicePresidentName: string;
    academicVicePresidentPhone: string;
    bithuName: string;
    bithuId: string;
    bithuPhone: string;
    deputySecretaryName: string;
    deputySecretaryPhone: string;
    totalStudents: number;
    unionMembers: number;
  }>({
    id: '10/1',
    name: 'Lớp 10/1',
    grade: 10,
    gvcnName: '',
    gvcnId: '',
    classPresidentName: '',
    classPresidentPhone: '',
    academicVicePresidentName: '',
    academicVicePresidentPhone: '',
    bithuName: '',
    bithuId: 'bithu_10_1',
    bithuPhone: '',
    deputySecretaryName: '',
    deputySecretaryPhone: '',
    totalStudents: 40,
    unionMembers: 30
  });
  const [classViewMode, setClassViewMode] = useState<'table' | 'cards'>('table');
  const [classSearchQuery, setClassSearchQuery] = useState<string>('');

  // ================= WEEK CRUD MODAL STATE =================
  const [isWeekModalOpen, setIsWeekModalOpen] = useState<boolean>(false);
  const [editingWeek, setEditingWeek] = useState<WeekConfig | null>(null);
  const [weekForm, setWeekForm] = useState<{
    weekNumber: number;
    title: string;
    startDate: string;
    endDate: string;
    note: string;
  }>({
    weekNumber: 26,
    title: 'Tuần 26',
    startDate: '2026-09-08',
    endDate: '2026-09-13',
    note: 'Kế hoạch học tập tuần mới'
  });

  // School Settings form
  const [settingsForm, setSettingsForm] = useState(schoolSettings);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  useEffect(() => {
    if (schoolSettings) {
      setSettingsForm(schoolSettings);
    }
  }, [schoolSettings]);

  // User Management Modal
  const [isUserModalOpen, setIsUserModalOpen] = useState<boolean>(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState<{
    username: string;
    password?: string;
    name: string;
    role: 'admin' | 'manager' | 'auditor' | 'youth_secretary' | 'user';
    roleTitle: string;
    classId: string;
    assignedZone?: string;
    phone: string;
    email: string;
  }>({
    username: '',
    password: '123456@Password',
    name: '',
    role: 'manager',
    roleTitle: 'Giáo viên Chủ nhiệm',
    classId: '10/1',
    assignedZone: 'Khối 10',
    phone: '',
    email: ''
  });

  // Zalo template state
  const [zaloCopied, setZaloCopied] = useState<boolean>(false);

  // Active appealed violations for Resolution Center (Tuần đang chọn)
  const appealedViolations = violations.filter(v => v.status === 'appealed' && v.weekNumber === violationHubWeek);
  const scores = getWeeklyScores(violationHubWeek);



  // ================= FILTERED VIOLATIONS LIST =================
  const filteredViolations = violations.filter(v => {
    const matchWeek = v.weekNumber === violationHubWeek;
    const matchGroup = selectedCriterionGroup === 'ALL' || v.groupName.toLowerCase().includes(selectedCriterionGroup.toLowerCase());
    const matchDay = violationDayFilter === 'ALL' || v.day === violationDayFilter;
    const matchClass = violationClassFilter === 'ALL' || v.classId === violationClassFilter;
    const matchSearch = v.className.toLowerCase().includes(violationSearch.toLowerCase()) ||
      v.criterionName.toLowerCase().includes(violationSearch.toLowerCase()) ||
      (v.studentNames && v.studentNames.some(name => name.toLowerCase().includes(violationSearch.toLowerCase()))) ||
      v.reportedBy.name.toLowerCase().includes(violationSearch.toLowerCase()) ||
      (v.note && v.note.toLowerCase().includes(violationSearch.toLowerCase()));
    return matchWeek && matchGroup && matchDay && matchClass && matchSearch;
  });

  // Filter students with Grade, Class, Union Status and Search keyword
  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchGrade = studentGradeFilter === 'ALL' || 
        s.classId.startsWith(`${studentGradeFilter}/`) || 
        s.grade?.toString() === studentGradeFilter;
      const matchClass = studentClassFilter === 'ALL' || s.classId === studentClassFilter;
      const matchUnion = studentUnionFilter === 'ALL' ||
        ((studentUnionFilter === 'YES' || studentUnionFilter === 'UNION') && s.isUnionMember) ||
        ((studentUnionFilter === 'NO' || studentUnionFilter === 'NON_UNION') && !s.isUnionMember);
      const search = studentSearch.trim().toLowerCase();
      const matchSearch = !search ||
        s.name.toLowerCase().includes(search) ||
        s.studentId.toLowerCase().includes(search) ||
        (s.phone && s.phone.toLowerCase().includes(search)) ||
        (s.address && s.address.toLowerCase().includes(search)) ||
        (s.ethnicity && s.ethnicity.toLowerCase().includes(search)) ||
        (s.unionCardNumber && s.unionCardNumber.toLowerCase().includes(search)) ||
        (s.unionPosition && s.unionPosition.toLowerCase().includes(search)) ||
        s.classId.toLowerCase().includes(search);
      return matchGrade && matchClass && matchUnion && matchSearch;
    });
  }, [students, studentGradeFilter, studentClassFilter, studentUnionFilter, studentSearch]);

  // Sorted data lists for UI tables
  const sortedScores = useMemo(() => {
    return sortDataList(scores, scoreSort.key, scoreSort.direction, (item, key) => {
      if (key === 'gvcnName') return classes.find(c => c.id === item.classId)?.gvcnName || '';
      return (item as any)[key];
    });
  }, [scores, scoreSort, classes]);

  const sortedViolations = useMemo(() => {
    return sortDataList(filteredViolations, violationSort.key, violationSort.direction, (item, key) => {
      if (key === 'reportedBy') return item.reportedBy?.name || '';
      if (key === 'studentNames') return (item.studentNames || []).join(', ');
      return (item as any)[key];
    });
  }, [filteredViolations, violationSort]);

  const sortedStudents = useMemo(() => {
    return sortDataList(filteredStudents, studentSort.key, studentSort.direction);
  }, [filteredStudents, studentSort]);

  // Student classes available for the current grade filter
  const availableStudentClasses = useMemo(() => {
    if (studentGradeFilter === 'ALL') return classes;
    return classes.filter(c => c.grade.toString() === studentGradeFilter || c.id.startsWith(`${studentGradeFilter}/`));
  }, [classes, studentGradeFilter]);

  // Student statistics for filter badges
  const studentStats = useMemo(() => {
    const countTotal = students.length;
    const count10 = students.filter(s => s.grade === 10 || s.classId.startsWith('10/')).length;
    const count11 = students.filter(s => s.grade === 11 || s.classId.startsWith('11/')).length;
    const count12 = students.filter(s => s.grade === 12 || s.classId.startsWith('12/')).length;

    const scopedStudents = studentGradeFilter === 'ALL' 
      ? students 
      : students.filter(s => s.grade?.toString() === studentGradeFilter || s.classId.startsWith(`${studentGradeFilter}/`));
    
    const scopedUnion = scopedStudents.filter(s => s.isUnionMember).length;
    const scopedNonUnion = scopedStudents.length - scopedUnion;

    return {
      total: countTotal,
      grade10: count10,
      grade11: count11,
      grade12: count12,
      scopedTotal: scopedStudents.length,
      scopedUnion,
      scopedNonUnion
    };
  }, [students, studentGradeFilter]);

  // Filter and sort users
  const filteredSortedUsers = useMemo(() => {
    const list = users.filter(u => {
      if (userRoleFilter !== 'ALL' && u.role !== userRoleFilter) return false;
      if (userSearch.trim()) {
        const q = userSearch.toLowerCase().trim();
        return (
          u.username.toLowerCase().includes(q) ||
          u.name.toLowerCase().includes(q) ||
          (u.classId && u.classId.toLowerCase().includes(q)) ||
          (u.assignedZone && u.assignedZone.toLowerCase().includes(q)) ||
          (u.roleTitle && u.roleTitle.toLowerCase().includes(q))
        );
      }
      return true;
    });

    return sortDataList(list, userTableSort.key, userTableSort.direction, (item, key) => {
      if (key === 'classId') return item.classId || item.assignedZone || '';
      return (item as any)[key];
    });
  }, [users, userRoleFilter, userSearch, userTableSort]);

  // Filter Activity Reports submitted by Youth Secretaries
  const filteredActivityReports = activityReports.filter(r => {
    const matchClass = activityClassFilter === 'ALL' || r.classId === activityClassFilter;
    const matchType = activityTypeFilter === 'ALL' || r.activityType === activityTypeFilter;
    const matchStatus = activityStatusFilter === 'ALL' || r.status === activityStatusFilter;
    const matchSearch = r.activityTitle.toLowerCase().includes(activitySearch.toLowerCase()) ||
      r.className.toLowerCase().includes(activitySearch.toLowerCase()) ||
      r.secretaryName.toLowerCase().includes(activitySearch.toLowerCase()) ||
      r.participants.some(p => p.name.toLowerCase().includes(activitySearch.toLowerCase()) || p.studentId.toLowerCase().includes(activitySearch.toLowerCase()));
    return matchClass && matchType && matchStatus && matchSearch;
  });

  // Track active tab for each activity report (participating vs non-participating)
  const [activeReportTab, setActiveReportTab] = useState<Record<string, 'participating' | 'non_participating'>>({});
  const [weeksViewMode, setWeeksViewMode] = useState<'table' | 'cards'>('table');
  const [weekSort, setWeekSort] = useState<{ key: string; direction: 'asc' | 'desc' }>({ key: 'weekNumber', direction: 'asc' });

  // Semester Structure Modal State (HK1 & HK2)
  const [isSemesterModalOpen, setIsSemesterModalOpen] = useState(false);
  const [semesterForm, setSemesterForm] = useState<{
    semester1EndWeek: number;
    semester1Name: string;
    semester2Name: string;
  }>({
    semester1EndWeek: schoolSettings.semester1EndWeek || 18,
    semester1Name: schoolSettings.semester1Name || 'Học Kỳ 1',
    semester2Name: schoolSettings.semester2Name || 'Học Kỳ 2'
  });

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  // Helper to get non-participants for an activity report
  const getReportNonParticipants = (report: ActivityReport): ActivityNonParticipant[] => {
    if (report.nonParticipants && report.nonParticipants.length > 0) {
      return report.nonParticipants;
    }
    const classStudentsList = students.filter(s => s.classId === report.classId || s.classId.toLowerCase() === report.className.toLowerCase());
    const participantIds = new Set(report.participants.map((p: ActivityParticipant) => p.studentId.trim()));
    const participantNames = new Set(report.participants.map((p: ActivityParticipant) => p.name.trim().toLowerCase()));

    return classStudentsList
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

  // Export Activity Participants & Non-Participants to Excel
  const handleExportActivityParticipantsExcel = (customList?: typeof activityReports) => {
    try {
      const reports = customList || filteredActivityReports;
      const wb = XLSX.utils.book_new();

      // Sheet 1: Học Sinh Tham Gia
      const rowsParticipants: any[] = [];
      let stt1 = 1;
      reports.forEach(report => {
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
            'Thành Tích / Giải Thưởng': p.achievement || 'Tham gia tích cực',
            'Ghi Chú': p.note || '',
            'Bí Thư Chi Đoàn': report.secretaryName,
            'Thời Gian Báo Cáo': report.reportedAt,
            'Trạng Thái Duyệt': report.status === 'verified' ? 'Đã duyệt' : 'Chờ xác nhận'
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
      reports.forEach(report => {
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
            'Lý Do / Trạng Thái': np.reason || 'Vắng mặt / Không tham gia phong trào',
            'Ghi Chú': np.note || '',
            'Bí Thư Chi Đoàn': report.secretaryName,
            'Thời Gian Báo Cáo': report.reportedAt
          });
        });
      });
      if (rowsNonParticipants.length > 0) {
        const ws2 = XLSX.utils.json_to_sheet(rowsNonParticipants);
        XLSX.utils.book_append_sheet(wb, ws2, 'Không Tham Gia');
      }

      // Sheet 3: Tổng Hợp Tỷ Lệ Tham Gia
      const summaryRows = reports.map((report, idx) => {
        const nonList = getReportNonParticipants(report);
        const total = report.participants.length + nonList.length;
        const rate = total > 0 ? `${Math.round((report.participants.length / total) * 100)}%` : '100%';
        return {
          'STT': idx + 1,
          'Lớp / Chi Đoàn': report.className,
          'Tên Hoạt Động': report.activityTitle,
          'Sĩ Số Lớp': total,
          'Số Lượng Tham Gia': report.participants.length,
          'Tỷ Lệ Tham Gia': rate,
          'Số Lượng Không Tham Gia': nonList.length,
          'Bí Thư': report.secretaryName,
          'Trạng Thái': report.status === 'verified' ? 'Đã duyệt' : 'Chờ duyệt'
        };
      });
      const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
      XLSX.utils.book_append_sheet(wb, wsSummary, 'Tổng Hợp Tỷ Lệ');

      const fileName = reports.length === 1
        ? `Bao_Cao_Phong_Trao_${reports[0].className.replace(/\s+/g, '_')}_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.xlsx`
        : `Bao_Cao_Tong_Hop_Phong_Trao_${new Date().toLocaleDateString('vi-VN').replace(/\//g, '_')}.xlsx`;

      XLSX.writeFile(wb, fileName);
    } catch (err) {
      console.error(err);
      alert('Có lỗi khi xuất file Excel học sinh tham gia phong trào!');
    }
  };

  // Handle PIN submit for lock / unlock
  const handlePinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinError('');
    const targetW = selectedReportWeek;
    if (pinAction === 'lock') {
      const res = lockWeek(pinInput, targetW);
      if (res.success) {
        alert(res.message);
        setPinAction(null);
        setPinInput('');
      } else {
        setPinError(res.message);
      }
    } else if (pinAction === 'unlock') {
      const res = unlockWeek(pinInput, targetW);
      if (res.success) {
        alert(res.message);
        setPinAction(null);
        setPinInput('');
      } else {
        setPinError(res.message);
      }
    }
  };

  // EXCEL EXPORT
  const handleExportExcel = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Bảng tổng hợp thi đua 18 lớp
    const summaryData = scores.map((s, i) => ({
      'STT': i + 1,
      'VỊ THỨ': s.rank,
      'LỚP': s.className,
      'KHỐI': s.grade,
      'ĐIỂM CHUẨN': 1440,
      'T2': s.dailyScores.T2.deduction > 0 ? `-${s.dailyScores.T2.deduction}` : '0',
      'T3': s.dailyScores.T3.deduction > 0 ? `-${s.dailyScores.T3.deduction}` : '0',
      'T4': s.dailyScores.T4.deduction > 0 ? `-${s.dailyScores.T4.deduction}` : '0',
      'T5': s.dailyScores.T5.deduction > 0 ? `-${s.dailyScores.T5.deduction}` : '0',
      'T6': s.dailyScores.T6.deduction > 0 ? `-${s.dailyScores.T6.deduction}` : '0',
      'T7': s.dailyScores.T7.deduction > 0 ? `-${s.dailyScores.T7.deduction}` : '0',
      'TỔNG TRỪ': `-${s.totalDeduction}`,
      'ĐIỂM CỘNG': `+${s.totalBonus}`,
      'TỔNG ĐIỂM': s.finalScore,
      'XẾP LOẠI': s.rating
    }));
    const wsSummary = XLSX.utils.json_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, `Tong_Diem_Tuan_${activeWeek}`);

    // Sheet 2: Danh sách chi tiết vi phạm
    const viosData = violations.filter(v => v.weekNumber === activeWeek).map((v, i) => ({
      'STT': i + 1,
      'LỚP': v.className,
      'NGÀY': v.day,
      'NHÓM': v.groupName,
      'MÃ LỖI': v.criterionId,
      'TÊN TIÊU CHÍ': v.criterionName,
      'SỐ LƯỢNG': v.quantity,
      'ĐIỂM TRỪ': `-${v.pointsDeducted}`,
      'HỌC SINH': v.studentNames ? v.studentNames.join(', ') : 'Tập thể',
      'NGƯỜI CHẤM': v.reportedBy.name,
      'TRẠNG THÁI': v.status === 'accepted' ? 'Đã duyệt' : v.status === 'appealed' ? 'Đang khiếu nại' : 'Chờ duyệt'
    }));
    const wsVios = XLSX.utils.json_to_sheet(viosData);
    XLSX.utils.book_append_sheet(wb, wsVios, 'Chi_Tiet_Vi_Pham');

    // Sheet 3: Danh sách đoàn viên
    const stData = students.map((st, i) => ({
      'STT': i + 1,
      'MÃ HS': st.studentId,
      'HỌ VÀ TÊN': st.name,
      'LỚP': st.classId,
      'KHỐI': st.grade,
      'GIỚI TÍNH': st.gender,
      'NGÀY SINH': st.dob,
      'DÂN TỘC': st.ethnicity || 'Kinh',
      'SỐ ĐIỆN THOẠI': st.phone || '',
      'ĐỊA CHỈ LIÊN HỆ': st.address || '',
      'ĐOÀN VIÊN': st.isUnionMember ? 'Đã kết nạp' : 'Chưa kết nạp',
      'SỐ THẺ ĐOÀN': st.unionCardNumber || '',
      'CHỨC VỤ ĐOÀN': st.unionPosition || 'Đoàn viên',
      'NGÀY VÀO ĐOÀN': st.unionJoinedDate || '',
      'NƠI KẾT NẠP': st.unionJoinedPlace || '',
      'ĐOÀN PHÍ': st.unionFeeStatus === 'paid' ? 'Đã nộp' : 'Chưa nộp',
      'SỔ ĐOÀN': st.unionBookletStatus === 'submitted' ? 'Đã nộp' : 'Chưa nộp',
      'ĐIỂM PHONG TRÀO': st.points,
      'SỐ LỖI': st.violationsCount,
      'XẾP LOẠI': st.conductRating || st.rankTitle,
      'GHI CHÚ': st.customNotes || ''
    }));
    const wsSt = XLSX.utils.json_to_sheet(stData);
    XLSX.utils.book_append_sheet(wb, wsSt, 'Danh_Sach_Doan_Vien');

    // Generate and download
    XLSX.writeFile(wb, `Bang_Thi_Dua_Tuan_${activeWeek}_THPT_QuangTrung.xlsx`);
  };

  // DOWNLOAD SAMPLE EXCEL TEMPLATE
  const handleDownloadSampleExcel = () => {
    const wb = XLSX.utils.book_new();
    const sampleData = [
      {
        'Mã HS': 'HS20241001',
        'Họ và Tên': 'Nguyễn Quang Minh',
        'Lớp': '10/1',
        'Giới tính': 'Nam',
        'Ngày sinh': '2009-04-15',
        'Dân tộc': 'Kinh',
        'Số điện thoại': '0919.888.999',
        'Địa chỉ liên hệ': 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
        'Đoàn viên': 'Đoàn viên',
        'Số thẻ đoàn': 'ĐV2024-0012',
        'Chức vụ Đoàn': 'Ủy viên BCH',
        'Ngày vào Đoàn': '2024-05-19',
        'Nơi kết nạp': 'Đoàn trường THPT Quang Trung',
        'Đoàn phí': 'Đã nộp',
        'Sổ đoàn': 'Đã nộp',
        'Xếp loại': 'Xuất sắc',
        'Ghi chú': 'Học sinh tích cực tham gia phong trào'
      },
      {
        'Mã HS': 'HS20241002',
        'Họ và Tên': 'Trần Thị Thu Thảo',
        'Lớp': '10/1',
        'Giới tính': 'Nữ',
        'Ngày sinh': '2009-08-20',
        'Dân tộc': 'Kinh',
        'Số điện thoại': '0977.334.455',
        'Địa chỉ liên hệ': 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng',
        'Đoàn viên': 'Đoàn viên',
        'Số thẻ đoàn': 'ĐV2024-0015',
        'Chức vụ Đoàn': 'Bí thư Chi đoàn',
        'Ngày vào Đoàn': '2024-03-26',
        'Nơi kết nạp': 'Đoàn trường THPT Quang Trung',
        'Đoàn phí': 'Đã nộp',
        'Sổ đoàn': 'Đã nộp',
        'Xếp loại': 'Xuất sắc',
        'Ghi chú': 'Cán bộ đoàn tiêu biểu'
      },
      {
        'Mã HS': 'HS20241003',
        'Họ và Tên': 'Nguyễn Văn Đức',
        'Lớp': '10/1',
        'Giới tính': 'Nam',
        'Ngày sinh': '2009-01-10',
        'Dân tộc': 'Cơ Tu',
        'Số điện thoại': '0988.333.444',
        'Địa chỉ liên hệ': 'Thôn Giàn Bí, xã Hòa Bắc, TP Đà Nẵng',
        'Đoàn viên': 'Chưa',
        'Số thẻ đoàn': '',
        'Chức vụ Đoàn': 'Học sinh',
        'Ngày vào Đoàn': '',
        'Nơi kết nạp': '',
        'Đoàn phí': 'Chưa nộp',
        'Sổ đoàn': 'Chưa nộp',
        'Xếp loại': 'Khá',
        'Ghi chú': 'Đang học lớp bồi dưỡng cảm tình Đoàn'
      }
    ];
    const ws = XLSX.utils.json_to_sheet(sampleData);
    XLSX.utils.book_append_sheet(wb, ws, 'Mau_Nhap_Lieu');
    XLSX.writeFile(wb, 'Mau_Nhap_Danh_Sach_Doan_Vien_Hoc_Sinh.xlsx');
  };

  // PDF PRINT REPORT GENERATION
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.setFontSize(10);
    doc.text('SỞ GIÁO DỤC VÀ ĐÀO TẠO TP ĐÀ NẴNG', 14, 15);
    doc.text(schoolSettings.schoolName.toUpperCase(), 14, 20);
    doc.text(schoolSettings.youthUnionName.toUpperCase(), 14, 25);

    doc.text('CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', 120, 15);
    doc.text('Độc lập - Tự do - Hạnh phúc', 130, 20);

    doc.setFontSize(13);
    doc.text(`BẢNG TỔNG HỢP THI ĐUA NỀ NẾP – TUẦN ${activeWeek}`, 45, 36);

    const tableRows = scores.map((s, i) => [
      (i + 1).toString(),
      s.rank.toString(),
      s.className,
      '1440',
      `-${s.dailyScores.T2.deduction}`,
      `-${s.dailyScores.T3.deduction}`,
      `-${s.dailyScores.T4.deduction}`,
      `-${s.dailyScores.T5.deduction}`,
      `-${s.dailyScores.T6.deduction}`,
      `-${s.dailyScores.T7.deduction}`,
      `-${s.totalDeduction}`,
      s.finalScore.toString(),
      s.rating
    ]);

    (doc as any).autoTable({
      head: [['STT', 'Hạng', 'Lớp', 'Chuẩn', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'Trừ', 'Tổng', 'Loại']],
      body: tableRows,
      startY: 42,
      styles: { fontSize: 8, cellPadding: 2 },
      headStyles: { fillColor: [185, 28, 28] }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.text('TM. BAN GIÁM HIỆU', 25, finalY);
    doc.text('HIỆU TRƯỞNG', 32, finalY + 5);

    doc.text('TM. BAN CHẤP HÀNH ĐOÀN TRƯỜNG', 120, finalY);
    doc.text('BÍ THƯ ĐOÀN', 140, finalY + 5);

    doc.save(`Bao_Cao_Thi_Dua_Tuan_${activeWeek}.pdf`);
  };

  // ZALO BROADCAST MESSAGE
  const zaloText = `📢 [${schoolSettings.youthUnionName.toUpperCase()} - THÔNG BÁO KẾT QUẢ THI ĐUA TUẦN ${activeWeek}]
--------------------------------------
Kính gửi Quý Thầy/Cô GVCN và Ban Cán Sự 18 Lớp!
BCH Đoàn trường xin công bố kết quả xếp loại thi đua nề nếp Tuần ${activeWeek}:

🏆 TOP 3 XUẤT SẮC NHẤT:
🥇 Hạng 1: ${scores[0]?.className} (${scores[0]?.finalScore}/1440 điểm)
🥈 Hạng 2: ${scores[1]?.className} (${scores[1]?.finalScore}/1440 điểm)
🥉 Hạng 3: ${scores[2]?.className} (${scores[2]?.finalScore}/1440 điểm)

⚠️ CÁC LỚP CẦN CHẤN CHỈNH NỀ NẾP:
- ${scores[scores.length - 1]?.className} (${scores[scores.length - 1]?.finalScore}đ - ${scores[scores.length - 1]?.rating})
- ${scores[scores.length - 2]?.className} (${scores[scores.length - 2]?.finalScore}đ - ${scores[scores.length - 2]?.rating})

Thầy/Cô GVCN vui lòng kiểm tra chi tiết lỗi trên Web App Đoàn trường để sinh hoạt lớp vào sáng Thứ 2. Trân trọng!`;

  const copyZaloText = () => {
    navigator.clipboard.writeText(zaloText);
    setZaloCopied(true);
    setTimeout(() => setZaloCopied(false), 3000);
  };

  // ================= HANDLE DIRECT SCORE ENTRY (SINGLE CLASS) =================
  const handleSaveDirectScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directScoreModalClass) return;

    const { classId, className, currentScore } = directScoreModalClass;
    const targetScore = Number(directScoreTarget);
    if (isNaN(targetScore) || targetScore < 0) {
      alert('Vui lòng nhập số điểm hợp lệ (từ 0 trở lên)!');
      return;
    }

    const delta = targetScore - currentScore;
    if (delta === 0) {
      alert('Điểm mới bằng với điểm hiện tại, không có thay đổi.');
      setDirectScoreModalClass(null);
      return;
    }

    if (delta > 0) {
      // Direct Admin Bonus Points
      addViolation({
        classId,
        className,
        day: directScoreDay,
        date: new Date().toLocaleDateString('vi-VN'),
        weekNumber: violationHubWeek,
        session: 'Sáng',
        criterionId: 'BONUS_ADMIN',
        criterionName: 'Cộng điểm thi đua trực tiếp (BQT / Admin)',
        groupName: 'Thành tích/Phong trào',
        pointsDeducted: 0,
        bonusPoints: delta,
        quantity: 1,
        reportedBy: {
          id: currentUser?.id || 'admin',
          name: currentUser?.name || 'BQT / Admin',
          role: 'admin'
        },
        note: directScoreReason || 'Nhập / Điều chỉnh điểm trực tiếp từ Ban Quản Trị',
        proofImages: []
      });
    } else {
      // Direct Admin Point Deduction
      addViolation({
        classId,
        className,
        day: directScoreDay,
        date: new Date().toLocaleDateString('vi-VN'),
        weekNumber: violationHubWeek,
        session: 'Sáng',
        criterionId: 'DEDUCT_ADMIN',
        criterionName: 'Trừ điểm thi đua trực tiếp (BQT / Admin)',
        groupName: 'Nề nếp tự quản',
        pointsDeducted: Math.abs(delta),
        bonusPoints: 0,
        quantity: 1,
        reportedBy: {
          id: currentUser?.id || 'admin',
          name: currentUser?.name || 'BQT / Admin',
          role: 'admin'
        },
        note: directScoreReason || 'Nhập / Điều chỉnh điểm trực tiếp từ Ban Quản Trị',
        proofImages: []
      });
    }

    alert(`✓ Đã cập nhật thành công điểm cho ${className}: ${currentScore}đ ➔ ${targetScore}đ (${delta > 0 ? `+${delta}đ` : `${delta}đ`})`);
    setDirectScoreModalClass(null);
  };

  // Open Batch Direct Score Modal for all 18 classes
  const handleOpenBatchDirectScoreModal = () => {
    const initialBatch: Record<string, { targetScore: number; reason: string }> = {};
    scores.forEach(s => {
      initialBatch[s.classId] = {
        targetScore: s.finalScore,
        reason: 'Điều chỉnh điểm tuần hàng loạt (Admin)'
      };
    });
    setBatchScores(initialBatch);
    setIsBatchDirectScoreModalOpen(true);
  };

  // Save Batch Direct Scores for 18 classes
  const handleSaveBatchDirectScores = () => {
    let changedCount = 0;
    scores.forEach(s => {
      const entry = batchScores[s.classId];
      if (entry && Number(entry.targetScore) !== s.finalScore) {
        const targetVal = Number(entry.targetScore);
        if (isNaN(targetVal) || targetVal < 0) return;
        const delta = targetVal - s.finalScore;
        if (delta > 0) {
          addViolation({
            classId: s.classId,
            className: s.className,
            day: 'T2',
            date: new Date().toLocaleDateString('vi-VN'),
            weekNumber: violationHubWeek,
            session: 'Sáng',
            criterionId: 'BONUS_ADMIN',
            criterionName: 'Cộng điểm trực tiếp hàng loạt (BQT)',
            groupName: 'Thành tích/Phong trào',
            pointsDeducted: 0,
            bonusPoints: delta,
            quantity: 1,
            reportedBy: {
              id: currentUser?.id || 'admin',
              name: currentUser?.name || 'BQT / Admin',
              role: 'admin'
            },
            note: entry.reason || 'Nhập điểm trực tiếp hàng loạt',
            proofImages: []
          });
          changedCount++;
        } else if (delta < 0) {
          addViolation({
            classId: s.classId,
            className: s.className,
            day: 'T2',
            date: new Date().toLocaleDateString('vi-VN'),
            weekNumber: violationHubWeek,
            session: 'Sáng',
            criterionId: 'DEDUCT_ADMIN',
            criterionName: 'Trừ điểm trực tiếp hàng loạt (BQT)',
            groupName: 'Nề nếp tự quản',
            pointsDeducted: Math.abs(delta),
            bonusPoints: 0,
            quantity: 1,
            reportedBy: {
              id: currentUser?.id || 'admin',
              name: currentUser?.name || 'BQT / Admin',
              role: 'admin'
            },
            note: entry.reason || 'Nhập điểm trực tiếp hàng loạt',
            proofImages: []
          });
          changedCount++;
        }
      }
    });

    if (changedCount > 0) {
      alert(`✓ Đã lưu thành công điểm trực tiếp cho ${changedCount} lớp!`);
    } else {
      alert('Không có thay đổi nào so với bảng điểm hiện tại.');
    }
    setIsBatchDirectScoreModalOpen(false);
  };

  // ================= HANDLE CRITERIA SAVE =================
  const handleSaveCriteria = (e: React.FormEvent) => {
    e.preventDefault();
    if (!critForm.name.trim() || !critForm.code.trim()) {
      alert('Vui lòng nhập đầy đủ Mã tiêu chí và Tên tiêu chí!');
      return;
    }

    const groupNames = {
      'I.1': 'Chuyên cần',
      'I.2': 'Vệ sinh',
      'I.3': 'Nề nếp tự quản',
      'I.4': 'Tác phong'
    };

    const groupScores = {
      'I.1': 40,
      'I.2': 30,
      'I.3': 65,
      'I.4': 90
    };

    const selectedGroupName = groupNames[critForm.groupId] || 'Nề nếp';
    const selectedGroupScore = groupScores[critForm.groupId] || 40;

    if (editingCrit) {
      updateCriterion(editingCrit.id, {
        code: critForm.code,
        name: critForm.name,
        groupId: critForm.groupId,
        groupName: selectedGroupName,
        groupStandardScore: selectedGroupScore,
        type: critForm.type,
        points: Number(critForm.points),
        unit: critForm.unit,
        isSevere: critForm.isSevere,
        isEnabled: critForm.isEnabled,
        description: critForm.description
      });
      alert(`Đã cập nhật tiêu chí "${critForm.name}" thành công!`);
    } else {
      addCriterion({
        code: critForm.code,
        name: critForm.name,
        groupId: critForm.groupId,
        groupName: selectedGroupName,
        groupStandardScore: selectedGroupScore,
        type: critForm.type,
        points: Number(critForm.points),
        unit: critForm.unit,
        isSevere: critForm.isSevere,
        isEnabled: critForm.isEnabled,
        description: critForm.description
      });
      alert(`Đã thêm mới tiêu chí "${critForm.name}" thành công!`);
    }

    setIsCriteriaModalOpen(false);
    setEditingCrit(null);
  };

  // ================= HANDLE VIOLATION DIRECT SAVE =================
  const handleSaveViolation = (e: React.FormEvent) => {
    e.preventDefault();
    const targetClass = classes.find(c => c.id === violationForm.classId);
    const targetCrit = criteria.find(c => c.id === violationForm.criterionId) || criteria[0];
    const totalDeducted = Number(violationForm.quantity) * targetCrit.points;
    const namesArray = violationForm.studentNames ? violationForm.studentNames.split(',').map(n => n.trim()).filter(Boolean) : [];

    if (editingViolation) {
      updateViolation(editingViolation.id, {
        classId: violationForm.classId,
        className: targetClass?.name || `Lớp ${violationForm.classId}`,
        day: violationForm.day,
        criterionId: targetCrit.id,
        criterionName: targetCrit.name,
        groupName: targetCrit.groupName,
        quantity: Number(violationForm.quantity),
        pointsDeducted: totalDeducted,
        studentNames: namesArray,
        note: violationForm.note,
        status: violationForm.status,
        proofImages: violationForm.proofImage ? [violationForm.proofImage] : editingViolation.proofImages
      });
      alert('Đã cập nhật vi phạm thành công!');
    } else {
      addViolation({
        classId: violationForm.classId,
        className: targetClass?.name || `Lớp ${violationForm.classId}`,
        day: violationForm.day,
        date: new Date().toLocaleDateString('vi-VN'),
        weekNumber: activeWeek,
        criterionId: targetCrit.id,
        criterionName: targetCrit.name,
        groupName: targetCrit.groupName,
        quantity: Number(violationForm.quantity),
        pointsDeducted: totalDeducted,
        studentNames: namesArray,
        note: violationForm.note,
        proofImages: violationForm.proofImage ? [violationForm.proofImage] : ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80'],
        reportedBy: {
          id: currentUser?.id || 'admin',
          name: currentUser?.name || 'Bí thư Đoàn',
          role: 'Bí thư Đoàn'
        }
      });
      alert(`Đã ghi nhận lỗi "${targetCrit.name}" cho ${targetClass?.name || violationForm.classId} (-${totalDeducted}đ)!`);
    }

    setIsViolationModalOpen(false);
    setEditingViolation(null);
  };

  // ================= HANDLE FILE / IMAGE UPLOAD FOR NEWS =================
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage('news_thumb');
    try {
      if (isSupabaseConfigured()) {
        const publicUrl = await SupabaseService.uploadImage(file, 'media');
        if (publicUrl) {
          setNewsForm(prev => ({ ...prev, thumbnail: publicUrl }));
          return;
        }
      }
      const compressed = await compressImageToDataURL(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82, outputFormat: 'image/webp' });
      if (compressed) {
        setNewsForm(prev => ({ ...prev, thumbnail: compressed }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingImage(null);
      e.target.value = '';
    }
  };

  const handleAttachmentsUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setIsUploadingImage('news_attach');
    try {
      for (const file of Array.from(files)) {
        let fileUrl: string | null = null;
        if (isSupabaseConfigured()) {
          fileUrl = await SupabaseService.uploadImage(file, 'media');
        }
        if (!fileUrl) {
          fileUrl = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (ev) => resolve((ev.target?.result as string) || '');
            reader.readAsDataURL(file);
          });
        }
        const sizeInKb = (file.size / 1024).toFixed(1) + ' KB';
        setNewsForm(prev => ({
          ...prev,
          attachments: [
            ...prev.attachments,
            {
              name: file.name,
              url: fileUrl!,
              size: sizeInKb,
              type: file.type
            }
          ]
        }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingImage(null);
      e.target.value = '';
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setNewsForm(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  // Handle News Form Save
  const handleSaveNews = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = newsForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (editingNews) {
      updateNewsPost(editingNews.id, {
        title: newsForm.title,
        excerpt: newsForm.excerpt,
        content: newsForm.content,
        thumbnail: newsForm.thumbnail,
        category: 'news',
        urgency: 'normal',
        tags: tagArray,
        isPinned: newsForm.isPinned,
        attachments: newsForm.attachments
      });
      alert(`Đã cập nhật bài viết phong trào "${newsForm.title}" thành công!`);
    } else {
      addNewsPost({
        title: newsForm.title,
        excerpt: newsForm.excerpt,
        content: newsForm.content,
        thumbnail: newsForm.thumbnail || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
        author: currentUser?.name || 'BCH Đoàn Trường',
        authorRole: 'Bí thư Đoàn',
        publishDate: new Date().toISOString().split('T')[0],
        category: 'news',
        urgency: 'normal',
        isPinned: newsForm.isPinned,
        tags: tagArray,
        attachments: newsForm.attachments
      });
      alert(`Đã đăng bài viết phong trào mới "${newsForm.title}" thành công!`);
    }
    setIsNewsModalOpen(false);
    setEditingNews(null);
  };

  // Handle Announcement Form Save
  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = announcementForm.tags.split(',').map(t => t.trim()).filter(Boolean);
    if (editingAnnouncement) {
      updateNewsPost(editingAnnouncement.id, {
        title: announcementForm.title,
        excerpt: announcementForm.excerpt,
        content: announcementForm.content,
        thumbnail: announcementForm.thumbnail,
        category: 'announcement',
        urgency: announcementForm.urgency,
        tags: tagArray,
        isPinned: announcementForm.isPinned,
        attachments: announcementForm.attachments
      });
      alert(`Đã cập nhật thông báo "${announcementForm.title}" thành công!`);
    } else {
      addNewsPost({
        title: announcementForm.title,
        excerpt: announcementForm.excerpt,
        content: announcementForm.content,
        thumbnail: announcementForm.thumbnail || 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
        author: currentUser?.name || 'BCH Đoàn Trường',
        authorRole: 'Bí thư Đoàn',
        publishDate: new Date().toISOString().split('T')[0],
        category: 'announcement',
        urgency: announcementForm.urgency,
        isPinned: announcementForm.isPinned,
        tags: tagArray,
        attachments: announcementForm.attachments
      });
      alert(`Đã ban hành thông báo chỉ đạo mới "${announcementForm.title}" thành công!`);
    }
    setIsAnnouncementModalOpen(false);
    setEditingAnnouncement(null);
  };

  // Handle Settings Image Uploads with Supabase Cloud Storage
  // Handle Settings Image Uploads with Supabase Cloud Storage
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage('logo');
    try {
      let finalUrl: string | null = null;
      if (isSupabaseConfigured()) {
        finalUrl = await SupabaseService.uploadImage(file, 'media');
      }
      if (!finalUrl) {
        finalUrl = await compressImageToDataURL(file, { maxWidth: 800, maxHeight: 800, quality: 0.85, outputFormat: 'image/webp' });
      }
      if (finalUrl) {
        const next = { ...settingsForm, logoUrl: finalUrl };
        setSettingsForm(next);
        await updateSchoolSettings(next);
        alert('✅ Đã tải Logo trường và đồng bộ nhận diện hệ thống thành công!');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể tải ảnh: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
    } finally {
      setIsUploadingImage(null);
      e.target.value = '';
    }
  };

  const handleYouthUnionLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage('youth_logo');
    try {
      let finalUrl: string | null = null;
      if (isSupabaseConfigured()) {
        finalUrl = await SupabaseService.uploadImage(file, 'media');
      }
      if (!finalUrl) {
        finalUrl = await compressImageToDataURL(file, { maxWidth: 800, maxHeight: 800, quality: 0.85, outputFormat: 'image/webp' });
      }
      if (finalUrl) {
        const next = { ...settingsForm, youthUnionLogoUrl: finalUrl };
        setSettingsForm(next);
        await updateSchoolSettings(next);
        alert('✅ Đã tải Huy hiệu Đoàn và đồng bộ nhận diện hệ thống thành công!');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể tải ảnh: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
    } finally {
      setIsUploadingImage(null);
      e.target.value = '';
    }
  };

  const handleTopBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage('top_banner');
    try {
      let finalUrl: string | null = null;
      if (isSupabaseConfigured()) {
        finalUrl = await SupabaseService.uploadImage(file, 'media');
      }
      if (!finalUrl) {
        finalUrl = await compressImageToDataURL(file, { maxWidth: 1600, maxHeight: 600, quality: 0.82, outputFormat: 'image/webp' });
      }
      if (finalUrl) {
        const next = { ...settingsForm, bannerTopImage: finalUrl };
        setSettingsForm(next);
        await updateSchoolSettings(next);
        alert('✅ Đã tải Banner Đầu Trang và đồng bộ nhận diện hệ thống thành công!');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể tải ảnh: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
    } finally {
      setIsUploadingImage(null);
      e.target.value = '';
    }
  };

  const handleFooterBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage('footer_banner');
    try {
      let finalUrl: string | null = null;
      if (isSupabaseConfigured()) {
        finalUrl = await SupabaseService.uploadImage(file, 'media');
      }
      if (!finalUrl) {
        finalUrl = await compressImageToDataURL(file, { maxWidth: 1600, maxHeight: 600, quality: 0.82, outputFormat: 'image/webp' });
      }
      if (finalUrl) {
        const next = { ...settingsForm, footerBannerImage: finalUrl };
        setSettingsForm(next);
        await updateSchoolSettings(next);
        alert('✅ Đã tải Banner Chân Trang và đồng bộ nhận diện hệ thống thành công!');
      }
    } catch (err) {
      console.error(err);
      alert('Không thể tải ảnh: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
    } finally {
      setIsUploadingImage(null);
      e.target.value = '';
    }
  };

  // Handle Student Form Save
  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const gradeVal = (Number(studentForm.classId.split('/')[0]) || 10) as 10 | 11 | 12;
    const cleanStudentData = {
      ...studentForm,
      studentId: studentForm.studentId.trim(),
      name: studentForm.name.trim(),
      phone: studentForm.phone.trim(),
      address: studentForm.address.trim(),
      dob: studentForm.dob,
      ethnicity: studentForm.ethnicity.trim() || 'Kinh',
      grade: gradeVal
    };

    if (editingStudent) {
      updateStudent(editingStudent.id || editingStudent.studentId, cleanStudentData);
      alert(`✅ Đã lưu và đồng bộ hồ sơ học sinh/đoàn viên "${cleanStudentData.name}" vào hệ thống!`);
    } else {
      addStudent(cleanStudentData);
      alert(`✅ Đã thêm mới và lưu học sinh "${cleanStudentData.name}" vào lớp ${cleanStudentData.classId}!`);
    }
    setIsStudentModalOpen(false);
    setEditingStudent(null);
  };

  // Handle Class Form Save
  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingClass) {
      updateClass(editingClass.id, {
        name: classForm.name,
        grade: classForm.grade,
        gvcnName: classForm.gvcnName,
        gvcnId: classForm.gvcnId,
        classPresidentName: classForm.classPresidentName,
        classPresidentPhone: classForm.classPresidentPhone,
        academicVicePresidentName: classForm.academicVicePresidentName,
        academicVicePresidentPhone: classForm.academicVicePresidentPhone,
        bithuName: classForm.bithuName,
        bithuId: classForm.bithuId,
        bithuPhone: classForm.bithuPhone,
        deputySecretaryName: classForm.deputySecretaryName,
        deputySecretaryPhone: classForm.deputySecretaryPhone,
        totalStudents: Number(classForm.totalStudents),
        unionMembers: Number(classForm.unionMembers)
      });
      alert(`Đã cập nhật thông tin ban cán sự & lớp ${classForm.name} thành công!`);
    } else {
      addClass({
        id: classForm.id,
        name: classForm.name,
        grade: classForm.grade,
        gvcnName: classForm.gvcnName || 'Chưa phân công',
        gvcnId: classForm.gvcnId || '',
        classPresidentName: classForm.classPresidentName,
        classPresidentPhone: classForm.classPresidentPhone,
        academicVicePresidentName: classForm.academicVicePresidentName,
        academicVicePresidentPhone: classForm.academicVicePresidentPhone,
        bithuName: classForm.bithuName || 'Đang cập nhật',
        bithuId: classForm.bithuId || `bithu_${classForm.id.replace('/', '_')}`,
        bithuPhone: classForm.bithuPhone,
        deputySecretaryName: classForm.deputySecretaryName,
        deputySecretaryPhone: classForm.deputySecretaryPhone,
        totalStudents: Number(classForm.totalStudents) || 40,
        unionMembers: Number(classForm.unionMembers) || 30
      });
      alert(`Đã thêm mới ${classForm.name} thành công!`);
    }
    setIsClassModalOpen(false);
    setEditingClass(null);
  };

  // Export Ban Cán Sự Lớp & BCH Chi Đoàn to Excel
  const exportCadreToExcel = () => {
    const sortedClasses = [...classes].sort((a, b) => {
      const gA = a.grade;
      const gB = b.grade;
      if (gA !== gB) return gA - gB;
      const numA = parseInt(a.id.split('/')[1] || '0', 10);
      const numB = parseInt(b.id.split('/')[1] || '0', 10);
      return numA - numB;
    });

    const headers = [
      ['DANH SÁCH BAN CÁN SỰ LỚP - NĂM HỌC 2026-2027'],
      ['TRƯỜNG THPT QUANG TRUNG - ĐÔNG GIANG'],
      [''],
      ['TT', 'LỚP', 'LỚP TRƯỞNG', 'SỐ ĐT LỚP TRƯỞNG', 'LỚP PHÓ HT', 'SỐ ĐT LỚP PHÓ HT', 'BÍ THƯ', 'SỐ ĐT BÍ THƯ', 'PHÓ BÍ THƯ', 'SỐ ĐT PHÓ BÍ THƯ', 'GVCN']
    ];

    const rows = sortedClasses.map((c, idx) => [
      idx + 1,
      c.id,
      c.classPresidentName || '',
      c.classPresidentPhone ? `'${c.classPresidentPhone}` : '',
      c.academicVicePresidentName || '',
      c.academicVicePresidentPhone ? `'${c.academicVicePresidentPhone}` : '',
      c.bithuName || '',
      c.bithuPhone ? `'${c.bithuPhone}` : '',
      c.deputySecretaryName || '',
      c.deputySecretaryPhone ? `'${c.deputySecretaryPhone}` : '',
      c.gvcnName || ''
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([...headers, ...rows]);
    worksheet['!cols'] = [
      { wch: 6 },  // TT
      { wch: 10 }, // Lớp
      { wch: 24 }, // Lớp trưởng
      { wch: 16 }, // SĐT LT
      { wch: 24 }, // Lớp phó HT
      { wch: 16 }, // SĐT LP
      { wch: 24 }, // Bí thư
      { wch: 16 }, // SĐT BT
      { wch: 24 }, // Phó BT
      { wch: 16 }, // SĐT PBT
      { wch: 22 }  // GVCN
    ];
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'BanCanSuLop');
    XLSX.writeFile(workbook, `DANH_SACH_BAN_CAN_SU_LOP_2026_2027.xlsx`);
  };

  // Sync Cadre Accounts to Users Table
  const handleSyncCadreAccounts = () => {
    let syncedCount = 0;
    classes.forEach(c => {
      const classKey = c.id.replace('/', '_');

      // 1. Bí Thư (youth_secretary)
      if (c.bithuName) {
        const uId = `bithu_${classKey}`;
        const existing = users.find(u => u.username === uId || u.id === uId);
        if (existing) {
          updateUser(existing.id, {
            name: c.bithuName,
            phone: c.bithuPhone || existing.phone,
            role: 'youth_secretary',
            roleTitle: `Bí thư Chi đoàn ${c.id}`,
            classId: c.id
          });
        } else {
          addUser({
            username: uId,
            password: '123456@Password',
            name: c.bithuName,
            role: 'youth_secretary',
            roleTitle: `Bí thư Chi đoàn ${c.id}`,
            classId: c.id,
            phone: c.bithuPhone || '',
            email: `${uId}@thpt.edu.vn`,
            isActive: true
          });
        }
        syncedCount++;
      }

      // 2. Lớp Trưởng (youth_secretary)
      if (c.classPresidentName && c.classPresidentName !== c.bithuName) {
        const uId = `loptruong_${classKey}`;
        const existing = users.find(u => u.username === uId || u.id === uId);
        if (existing) {
          updateUser(existing.id, {
            name: c.classPresidentName,
            phone: c.classPresidentPhone || existing.phone,
            role: 'youth_secretary',
            roleTitle: `Lớp trưởng ${c.id}`,
            classId: c.id
          });
        } else {
          addUser({
            username: uId,
            password: '123456@Password',
            name: c.classPresidentName,
            role: 'youth_secretary',
            roleTitle: `Lớp trưởng ${c.id}`,
            classId: c.id,
            phone: c.classPresidentPhone || '',
            email: `${uId}@thpt.edu.vn`,
            isActive: true
          });
        }
        syncedCount++;
      }

      // 3. Lớp Phó HT (user)
      if (c.academicVicePresidentName) {
        const uId = `loppho_${classKey}`;
        const existing = users.find(u => u.username === uId || u.id === uId);
        if (existing) {
          updateUser(existing.id, {
            name: c.academicVicePresidentName,
            phone: c.academicVicePresidentPhone || existing.phone,
            role: 'user',
            roleTitle: `Lớp phó Học tập ${c.id}`,
            classId: c.id
          });
        } else {
          addUser({
            username: uId,
            password: '123456@Password',
            name: c.academicVicePresidentName,
            role: 'user',
            roleTitle: `Lớp phó Học tập ${c.id}`,
            classId: c.id,
            phone: c.academicVicePresidentPhone || '',
            email: `${uId}@thpt.edu.vn`,
            isActive: true
          });
        }
        syncedCount++;
      }

      // 4. Phó Bí Thư (user)
      if (c.deputySecretaryName && c.deputySecretaryName !== c.academicVicePresidentName) {
        const uId = `phobithu_${classKey}`;
        const existing = users.find(u => u.username === uId || u.id === uId);
        if (existing) {
          updateUser(existing.id, {
            name: c.deputySecretaryName,
            phone: c.deputySecretaryPhone || existing.phone,
            role: 'user',
            roleTitle: `Phó Bí thư Chi đoàn ${c.id}`,
            classId: c.id
          });
        } else {
          addUser({
            username: uId,
            password: '123456@Password',
            name: c.deputySecretaryName,
            role: 'user',
            roleTitle: `Phó Bí thư Chi đoàn ${c.id}`,
            classId: c.id,
            phone: c.deputySecretaryPhone || '',
            email: `${uId}@thpt.edu.vn`,
            isActive: true
          });
        }
        syncedCount++;
      }
    });

    alert(`⚡ Đã đồng bộ và phân quyền thành công ${syncedCount} tài khoản Ban Cán Sự & BCH Chi Đoàn 15 Lớp (Mật khẩu mặc định: 123456@Password)!`);
  };

  // Handle Week Form Save
  const handleSaveWeek = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingWeek) {
      updateWeek(editingWeek.weekNumber, {
        title: weekForm.title,
        startDate: weekForm.startDate,
        endDate: weekForm.endDate,
        note: weekForm.note
      });
      alert(`Đã cập nhật thông tin ${weekForm.title} thành công!`);
    } else {
      addWeek({
        weekNumber: Number(weekForm.weekNumber),
        title: weekForm.title || `Tuần ${weekForm.weekNumber}`,
        startDate: weekForm.startDate,
        endDate: weekForm.endDate,
        isCurrent: false,
        isLocked: false,
        note: weekForm.note
      });
      alert(`Đã tạo mới ${weekForm.title} thành công!`);
    }
    setIsWeekModalOpen(false);
    setEditingWeek(null);
  };

  // Violation local photo upload ref & handler
  const violationFileInputRef = useRef<HTMLInputElement>(null);
  const handleViolationPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingImage('violation');
    try {
      if (isSupabaseConfigured()) {
        const publicUrl = await SupabaseService.uploadImage(file, 'proof_images');
        if (publicUrl) {
          setViolationForm(prev => ({ ...prev, proofImage: publicUrl }));
          return;
        }
      }
      const compressed = await compressImageToDataURL(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82, outputFormat: 'image/webp' });
      if (compressed) {
        setViolationForm(prev => ({ ...prev, proofImage: compressed }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsUploadingImage(null);
      e.target.value = '';
    }
  };

  // Handle Zone CRUD Save
  const handleSaveZone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneForm.name.trim()) {
      alert('Vui lòng nhập tên khu vực!');
      return;
    }
    if (editingZone) {
      updateZone(editingZone.id, zoneForm);
      alert(`Đã cập nhật thông tin khu vực "${zoneForm.name}" thành công!`);
    } else {
      addZone(zoneForm);
      alert(`Đã thêm khu vực giám sát mới "${zoneForm.name}" thành công!`);
    }
    setIsZoneModalOpen(false);
    setEditingZone(null);
  };

  // Handle Auditor Member CRUD Save
  const handleSaveAuditor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!auditorForm.name.trim()) {
      alert('Vui lòng nhập họ tên cán bộ cờ đỏ!');
      return;
    }
    if (editingAuditor) {
      updateAuditorMember(editingAuditor.id, auditorForm);
      alert(`Đã cập nhật thông tin thành viên "${auditorForm.name}" thành công!`);
    } else {
      addAuditorMember(auditorForm);
      alert(`Đã thêm mới thành viên "${auditorForm.name}" vào Đội Cờ Đỏ thành công!`);
    }
    setIsAuditorModalOpen(false);
    setEditingAuditor(null);
  };

  // Handle Duty Assignment Save
  const handleSaveDuty = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAuditorMember = auditors.find(a => a.id === dutyForm.auditorId);
    const targetAuditorUser = users.find(u => u.id === dutyForm.auditorId);
    const auditorName = targetAuditorMember?.name || targetAuditorUser?.name || dutyForm.auditorName || 'Cán bộ Cờ đỏ';
    const auditorClass = targetAuditorMember?.classId || targetAuditorUser?.classId || dutyForm.auditorClass || '11/2';

    if (editingDuty) {
      updateDutyAssignment(editingDuty.id, {
        weekNumber: Number(dutyForm.weekNumber),
        day: dutyForm.day,
        zone: dutyForm.zone,
        auditorId: dutyForm.auditorId,
        auditorName,
        auditorClass,
        shiftTime: dutyForm.shiftTime,
        isLiveNow: dutyForm.isLiveNow,
        targetClasses: dutyForm.targetClasses || undefined,
        session: dutyForm.session
      });
      alert(`Đã cập nhật ca trực ${dutyForm.zone} (${dutyForm.day}) thành công!`);
    } else {
      addDutyAssignment({
        weekNumber: Number(dutyForm.weekNumber),
        day: dutyForm.day,
        zone: dutyForm.zone,
        auditorId: dutyForm.auditorId,
        auditorName,
        auditorClass,
        shiftTime: dutyForm.shiftTime,
        isLiveNow: dutyForm.isLiveNow,
        targetClasses: dutyForm.targetClasses || undefined,
        session: dutyForm.session
      });
      alert(`Đã thêm mới ca trực ${dutyForm.zone} (${dutyForm.day}) thành công!`);
    }
    setIsDutyModalOpen(false);
    setEditingDuty(null);
  };

  // Handle Copy Duties
  const handleCopyDuties = (e: React.FormEvent) => {
    e.preventDefault();
    copyDutiesToWeek(dutyWeekFilter, Number(copyTargetWeek));
    alert(`Đã sao chép toàn bộ lịch trực từ Tuần ${dutyWeekFilter} sang Tuần ${copyTargetWeek} thành công!`);
    setIsCopyDutyModalOpen(false);
  };

  // Helper for flexible Excel row key extraction
  const extractRowField = (row: any, ...fieldAliases: string[]): string => {
    for (const alias of fieldAliases) {
      if (row[alias] !== undefined && row[alias] !== null && String(row[alias]).trim() !== '') {
        return String(row[alias]).trim();
      }
    }
    const rowKeys = Object.keys(row);
    for (const alias of fieldAliases) {
      const cleanAlias = alias.toLowerCase().replace(/[^a-z0-9à-ỹ]/gi, '');
      const matchedKey = rowKeys.find(k => k.toLowerCase().replace(/[^a-z0-9à-ỹ]/gi, '') === cleanAlias);
      if (matchedKey && row[matchedKey] !== undefined && row[matchedKey] !== null && String(row[matchedKey]).trim() !== '') {
        return String(row[matchedKey]).trim();
      }
    }
    return '';
  };

  const formatExcelDob = (rawVal: any): string => {
    if (!rawVal) return '2009-01-01';
    const valStr = String(rawVal).trim();
    if (!isNaN(Number(valStr)) && Number(valStr) > 10000 && Number(valStr) < 60000) {
      const d = new Date(Math.round((Number(valStr) - 25569) * 86400 * 1000));
      return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
    }
    return valStr;
  };

  // Handle Real Excel File Upload and Smart Upsert
  const handleExcelFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsName = wb.SheetNames[0];
        const ws = wb.Sheets[wsName];
        const rawData: any[] = XLSX.utils.sheet_to_json(ws);

        if (rawData.length === 0) {
          alert('File Excel không có dữ liệu!');
          return;
        }

        const parsedList: Array<Partial<Student> & { studentId: string; name: string; classId: string }> = [];

        rawData.forEach((row: any) => {
          const studentId = extractRowField(row, 'Mã HS', 'Mã Học Sinh', 'Mã định danh', 'Mã số', 'Số định danh', 'ID', 'studentId', 'MSHS') || `HS${Math.floor(10000000 + Math.random() * 90000000)}`;
          const name = extractRowField(row, 'Họ và Tên', 'Họ và tên', 'Họ Tên', 'Họ tên', 'Tên học sinh', 'Tên', 'name');
          const classId = extractRowField(row, 'Lớp', 'Lớp học', 'Chi đoàn', 'Class', 'classId') || '10/1';

          if (name && classId) {
            const rawGender = extractRowField(row, 'Giới tính', 'Giới Tính', 'Phái', 'Gender', 'gender');
            const gender = (rawGender === 'Nữ' || rawGender === 'Nu' || rawGender === 'nữ' || rawGender === 'F') ? 'Nữ' : 'Nam';
            const rawDob = extractRowField(row, 'Ngày sinh', 'Ngày Sinh', 'DOB', 'dob', 'Ngày tháng năm sinh', 'Năm sinh');
            const dob = formatExcelDob(rawDob);
            const ethnicity = extractRowField(row, 'Dân tộc', 'Dân Tộc', 'ethnicity') || 'Kinh';
            let phone = extractRowField(row, 'Số điện thoại', 'Số Điện Thoại', 'Số ĐT', 'SĐT', 'SDT', 'Điện thoại', 'Phone', 'phone', 'Sđt', 'Số điện thoại phụ huynh', 'SĐT liên hệ', 'Di động');
            let address = extractRowField(row, 'Địa chỉ liên hệ', 'Địa chỉ', 'Địa Chỉ', 'Địa Chỉ Liên Hệ', 'Nơi ở', 'Hộ khẩu', 'Thường trú', 'Địa chỉ thường trú', 'Nơi cư trú', 'Chỗ ở hiện nay', 'Quê quán', 'Address', 'address');

            // If phone column contains letters/words (e.g. "Thôn Bến Hiên, Xã Bến Hiên..."), it is an address
            if (phone && /[a-zA-Zà-ỹÀ-Ỹ]/.test(phone)) {
              if (!address) {
                address = phone;
              }
              phone = '';
            }

            const rawUnion = extractRowField(row, 'Đoàn viên', 'Đoàn Viên', 'Đã kết nạp', 'isUnionMember').toLowerCase();
            const isUnion = rawUnion.includes('đoàn') || rawUnion.includes('co') || rawUnion.includes('yes') || rawUnion.includes('rồi') || rawUnion === 'x' || rawUnion === '1';

            parsedList.push({
              studentId: String(studentId).trim(),
              name: String(name).trim(),
              classId: String(classId).trim(),
              gender,
              dob: String(dob).trim(),
              ethnicity: String(ethnicity).trim(),
              phone: String(phone).trim(),
              address: String(address).trim(),
              isUnionMember: isUnion,
              unionCardNumber: extractRowField(row, 'Số thẻ đoàn', 'Số thẻ Đoàn', 'Số thẻ'),
              unionPosition: extractRowField(row, 'Chức vụ Đoàn', 'Chức vụ', 'Chức vụ chi đoàn') || (isUnion ? 'Đoàn viên' : 'Học sinh'),
              unionJoinedDate: extractRowField(row, 'Ngày vào Đoàn', 'Ngày vào đoàn', 'Ngày kết nạp'),
              unionJoinedPlace: extractRowField(row, 'Nơi kết nạp', 'Nơi vào Đoàn') || 'Đoàn trường THPT Quang Trung',
              unionFeeStatus: (extractRowField(row, 'Đoàn phí') === 'Chưa nộp' || extractRowField(row, 'Đoàn phí') === 'Chưa') ? 'unpaid' : 'paid',
              unionBookletStatus: (extractRowField(row, 'Sổ đoàn') === 'Chưa nộp' || extractRowField(row, 'Sổ đoàn') === 'Chưa') ? 'not_submitted' : 'submitted',
              conductRating: (extractRowField(row, 'Xếp loại') as any) || 'Xuất sắc',
              customNotes: extractRowField(row, 'Ghi chú', 'Ghi Chú') || ''
            });
          }
        });

        if (parsedList.length > 0) {
          const res = upsertStudentsFromExcel(parsedList);
          alert(`🎉 Đồng bộ thành công ${parsedList.length} hồ sơ từ file Excel!\n• Thêm mới: ${res.added} học sinh\n• Cập nhật: ${res.updated} hồ sơ\n• Đã lưu tự động vào CSDL Supabase Cloud!`);
          setIsImportModalOpen(false);
        } else {
          alert('Không tìm thấy dòng dữ liệu hợp lệ! Vui lòng kiểm tra tiêu đề cột của file Excel.');
        }
      } catch (err) {
        alert('Lỗi khi đọc file Excel! Vui lòng kiểm tra định dạng file .xlsx hoặc .xls.');
      }
    };
    reader.readAsBinaryString(file);
  };

  // Handle Text/CSV Import
  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!importText.trim()) return;

    const lines = importText.trim().split('\n');
    const parsedList: Array<Partial<Student> & { studentId: string; name: string; classId: string }> = [];

    lines.forEach(line => {
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 3) {
        const studentId = parts[0] || `HS2024${Math.floor(1000 + Math.random() * 9000)}`;
        const name = parts[1];
        const classId = parts[2];
        const gender = (parts[3] === 'Nữ' || parts[3] === 'Nu') ? 'Nữ' : 'Nam';
        const dob = parts[4] || '2009-01-01';
        const ethnicity = parts[5] || 'Kinh';
        const isUnion = parts[6] ? (parts[6].toLowerCase().includes('đoàn') || parts[6].toLowerCase().includes('co') || parts[6].toLowerCase().includes('yes')) : true;

        parsedList.push({
          studentId,
          name,
          classId,
          gender,
          dob,
          ethnicity,
          isUnionMember: isUnion,
          unionPosition: isUnion ? 'Đoàn viên' : 'Học sinh',
          points: 100,
          rankTitle: isUnion ? 'Đoàn viên Tích cực' : 'Học sinh',
          status: 'active'
        });
      }
    });

    if (parsedList.length > 0) {
      const res = upsertStudentsFromExcel(parsedList);
      alert(`Đồng bộ dữ liệu thành công!\n• Thêm mới: ${res.added} học sinh\n• Cập nhật: ${res.updated} hồ sơ`);
      setIsImportModalOpen(false);
      setImportText('');
    } else {
      alert('Không phân tích được dữ liệu! Vui lòng nhập đúng định dạng: Mã HS, Họ Tên, Lớp, Giới tính, Ngày sinh, Dân tộc');
    }
  };

  const [isPushingStudents, setIsPushingStudents] = useState(false);

  const handlePushStudentsToCloud = async () => {
    if (!students || students.length === 0) {
      alert('Không có học sinh nào trong danh sách để tải lên Cloud!');
      return;
    }
    if (!window.confirm(`Bạn có chắc chắn muốn đẩy toàn bộ ${students.length} học sinh hiện tại lên CSDL Supabase Cloud để đồng bộ với điện thoại và các thiết bị khác?`)) {
      return;
    }
    setIsPushingStudents(true);
    try {
      const ok = await SupabaseService.saveStudentsBatch(students);
      if (ok) {
        alert(`🎉 ĐÃ ĐỒNG BỘ THÀNH CÔNG ${students.length} HỌC SINH LÊN SUPABASE CLOUD!\n\n📱 Bây giờ trên điện thoại bạn chỉ cần mở lại hoặc bấm nút 🔄 (Đồng bộ) là sẽ thấy đầy đủ ${students.length} học sinh!`);
      } else {
        alert('Có lỗi khi lưu học sinh lên Supabase Cloud. Vui lòng kiểm tra kết nối mạng hoặc thử lại.');
      }
    } catch (e: any) {
      alert(`Lỗi khi đẩy dữ liệu: ${e?.message || 'Không xác định'}`);
    } finally {
      setIsPushingStudents(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-fadeIn">

      {/* Top Banner */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-600 text-white flex items-center justify-center font-black text-2xl shadow-glow">
            🛡️
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white">TRANG QUẢN TRỊ ĐOÀN TRƯỜNG</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-xs font-bold">
                {schoolSettings.youthUnionName.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Toàn quyền Thêm / Sửa / Xóa dữ liệu học sinh, đoàn viên, lớp học, vi phạm nề nếp và cấu hình hệ thống
            </p>
          </div>
        </div>

        {/* Quick Actions & Lock Week */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsGlobalDocumentModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all active:scale-95"
            title="Mở trình quản lý văn bản, biểu mẫu và thư mục phân cấp"
          >
            <Folder className="w-4 h-4" />
            <span>📁 Kho Văn Bản ({documentFiles?.length || 0})</span>
          </button>

          {isWeekLocked ? (
            <button
              onClick={() => { setPinAction('unlock'); setPinError(''); setPinInput(''); }}
              className="px-4 py-2 rounded-xl bg-red-950 border border-red-700 text-red-300 hover:bg-red-900 text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <Lock className="w-4 h-4 text-red-400" />
              <span>Tuần {activeWeek} Đang Khóa</span>
            </button>
          ) : (
            <button
              onClick={() => { setPinAction('lock'); setPinError(''); setPinInput(''); }}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white text-xs font-bold shadow-glow flex items-center gap-2 transition-all"
            >
              <Lock className="w-4 h-4" />
              <span>Khóa Sổ Tuần {activeWeek}</span>
            </button>
          )}
        </div>
      </div>

      {/* Admin Navigation Tabs - 5 Consolidated Hubs */}
      <div className="bg-slate-950/90 p-2 rounded-2xl border border-slate-800 shadow-inner">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 text-xs font-bold">
          {[
            {
              id: 'violations_hub',
              label: 'Quản Lý Vi Phạm & Thi Đua',
              icon: ShieldAlert,
              badge: violations.filter(v => v.weekNumber === activeWeek).length + (appealedViolations.length > 0 ? ` (${appealedViolations.length} khiếu nại)` : '')
            },
            {
              id: 'operations_hub',
              label: 'Đoàn Viên, Lớp Học & Lịch Trực',
              icon: GraduationCap,
              badge: null
            },
            {
              id: 'media_hub',
              label: 'Kho Văn Bản, Bản Tin & Media',
              icon: Folder,
              badge: `${documentFiles?.length || 0} file`
            },
            { id: 'criteria', label: 'Quản Lý Tiêu Chí', icon: Sliders, badge: criteria.length },
            { id: 'system_hub', label: 'Tài Khoản, Cài Đặt & Báo Cáo', icon: Settings, badge: users.length },
          ].map(tab => {
            const isActive = adminTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setAdminTab(tab.id as any)}
                className={`w-full px-3 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs font-bold border text-center ${isActive
                  ? 'bg-red-600 border-red-500 text-white shadow-glow'
                  : 'bg-slate-900/90 border-slate-800 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700'
                  }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span className="truncate">{tab.label}</span>
                {tab.badge !== null && tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black shrink-0 ${isActive ? 'bg-white/25 text-white' : 'bg-slate-800 text-amber-400 border border-slate-700'
                    }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= UNIFIED MAIN TAB 1: VIOLATIONS, SCOREBOARD & APPEALS HUB ================= */}
      {adminTab === 'violations_hub' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-5">
          {/* Sub-tabs Header inside Violations Hub */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center flex-wrap gap-2.5">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-red-500 shrink-0" />
                  <h3 className="text-sm sm:text-base font-black text-white">
                    QUẢN LÝ VI PHẠM & ĐIỂM THI ĐUA NỀ NẾP
                  </h3>
                </div>

                {/* Dropdown tùy chỉnh theo tuần */}
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-700 shadow-sm">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-bold text-slate-400">Xem Tuần:</span>
                  <select
                    value={violationHubWeek}
                    onChange={(e) => setViolationHubWeek(Number(e.target.value))}
                    className="bg-transparent text-amber-400 font-extrabold text-xs focus:outline-none cursor-pointer"
                    title="Chọn tuần thi đua cần xem / quản lý điểm"
                  >
                    {weeksConfig.map(w => (
                      <option key={w.weekNumber} value={w.weekNumber} className="bg-slate-900 text-white font-medium">
                        {w.title} {w.isCurrent ? '(Hiện tại)' : ''} {w.isLocked ? '🔒 Đã Khóa' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="text-xs text-slate-400">
                Kiểm soát bảng điểm {classes.length} lớp toàn trường, ghi nhận vi phạm và giải quyết khiếu nại của Giáo viên Chủ nhiệm • <strong className="text-amber-400">Tuần {violationHubWeek}</strong>
              </p>
            </div>

            {/* Sub-tabs pills */}
            <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold shrink-0">
              <button
                type="button"
                onClick={() => setViolationHubSubTab('scoreboard')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${violationHubSubTab === 'scoreboard'
                  ? 'bg-red-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Table className="w-3.5 h-3.5" />
                <span>Bảng Điểm {classes.length} Lớp</span>
              </button>

              <button
                type="button"
                onClick={() => setViolationHubSubTab('violations_list')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${violationHubSubTab === 'violations_list'
                  ? 'bg-red-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Danh Sách Vi Phạm</span>
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${violationHubSubTab === 'violations_list' ? 'bg-white/20 text-white' : 'bg-slate-800 text-amber-400'
                  }`}>
                  {violations.filter(v => v.weekNumber === violationHubWeek).length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setViolationHubSubTab('appeals')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${violationHubSubTab === 'appeals'
                  ? 'bg-purple-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Scale className="w-3.5 h-3.5" />
                <span>Xử Lý Khiếu Nại</span>
                {appealedViolations.length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${violationHubSubTab === 'appeals' ? 'bg-white/20 text-white' : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                    {appealedViolations.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* ================= SUB-TAB 1.1: ALL CLASSES SCOREBOARD ================= */}
          {violationHubSubTab === 'scoreboard' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">BẢNG TỔNG HỢP ĐIỂM THI ĐUA {classes.length} LỚP TOÀN TRƯỜNG</h4>
                  <p className="text-[11px] text-slate-400">Định mức chuẩn: 1440 điểm (240đ/ngày từ T2 đến T7) • <strong className="text-amber-400">Tuần {violationHubWeek}</strong></p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={handleOpenBatchDirectScoreModal}
                    className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow active:scale-95 transition-all"
                    title={`Mở bảng nhập điểm nhanh hàng loạt cho cả ${classes.length} lớp`}
                  >
                    <span>⚡</span>
                    <span>Nhập Điểm {classes.length} Lớp</span>
                  </button>
                  <button
                    onClick={handleExportExcel}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Xuất Excel</span>
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In PDF</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                      <th className="p-2.5 text-center font-bold w-12 text-slate-400">STT</th>
                      <SortableTh
                        label="Vị Thứ"
                        columnKey="rank"
                        currentSortKey={scoreSort.key}
                        currentSortDir={scoreSort.direction}
                        onSort={(k) => handleToggleSort(setScoreSort, k)}
                        align="center"
                        width="70px"
                      />
                      <SortableTh
                        label="Lớp"
                        columnKey="className"
                        currentSortKey={scoreSort.key}
                        currentSortDir={scoreSort.direction}
                        onSort={(k) => handleToggleSort(setScoreSort, k)}
                      />
                      <SortableTh
                        label="GVCN"
                        columnKey="gvcnName"
                        currentSortKey={scoreSort.key}
                        currentSortDir={scoreSort.direction}
                        onSort={(k) => handleToggleSort(setScoreSort, k)}
                      />
                      <th className="p-2 text-center font-bold">Chuẩn</th>
                      <th className="p-2 text-center font-bold">T2</th>
                      <th className="p-2 text-center font-bold">T3</th>
                      <th className="p-2 text-center font-bold">T4</th>
                      <th className="p-2 text-center font-bold">T5</th>
                      <th className="p-2 text-center font-bold">T6</th>
                      <th className="p-2 text-center font-bold">T7</th>
                      <SortableTh
                        label="Tổng Trừ"
                        columnKey="totalDeduction"
                        currentSortKey={scoreSort.key}
                        currentSortDir={scoreSort.direction}
                        onSort={(k) => handleToggleSort(setScoreSort, k)}
                        align="center"
                        className="text-rose-400"
                      />
                      <SortableTh
                        label="Điểm Thưởng"
                        columnKey="totalBonus"
                        currentSortKey={scoreSort.key}
                        currentSortDir={scoreSort.direction}
                        onSort={(k) => handleToggleSort(setScoreSort, k)}
                        align="center"
                        className="text-emerald-400"
                      />
                      <SortableTh
                        label="Tổng Điểm"
                        columnKey="finalScore"
                        currentSortKey={scoreSort.key}
                        currentSortDir={scoreSort.direction}
                        onSort={(k) => handleToggleSort(setScoreSort, k)}
                        align="center"
                        className="text-amber-400"
                      />
                      <th className="p-2.5 text-center font-bold">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sortedScores.map((item, idx) => (
                      <tr key={item.classId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-2.5 text-center font-mono font-bold text-slate-400">
                          {idx + 1}
                        </td>
                        <td className="p-2.5 text-center font-black">
                          {item.rank === 1 ? <span className="text-amber-400">🥇 #1</span> :
                            item.rank === 2 ? <span className="text-slate-300">🥈 #2</span> :
                              item.rank === 3 ? <span className="text-amber-600">🥉 #3</span> : `#${item.rank}`}
                        </td>
                        <td className="p-2.5 font-bold text-white whitespace-nowrap">
                          {item.className}
                        </td>
                        <td className="p-2.5 text-slate-400 whitespace-nowrap">
                          {classes.find(c => c.id === item.classId)?.gvcnName.replace('Thầy ', '').replace('Cô ', '')}
                        </td>
                        <td className="p-2 text-center text-slate-400 font-mono">1440</td>

                        {/* Daily Deductions with Quick Click */}
                        {(['T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as DayOfWeek[]).map(d => {
                          const ded = item.dailyScores[d].deduction;
                          return (
                            <td key={d} className="p-2 text-center font-mono">
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingViolation(null);
                                  setViolationForm(prev => ({
                                    ...prev,
                                    classId: item.classId,
                                    day: d,
                                    criterionId: criteria[0]?.id || '1.1',
                                    quantity: 1,
                                    studentNames: '',
                                    note: '',
                                    proofImage: '',
                                    status: 'accepted'
                                  }));
                                  setIsViolationModalOpen(true);
                                }}
                                className={`px-1.5 py-0.5 rounded transition-all ${ded > 0
                                  ? 'text-rose-400 hover:bg-rose-950 font-bold'
                                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
                                  }`}
                                title={`Ghi nhận / Trừ điểm ${item.className} vào Thứ ${d.replace('T', '')}`}
                              >
                                {ded > 0 ? `-${ded}` : '0'}
                              </button>
                            </td>
                          );
                        })}

                        {/* Tổng Trừ (Clickable to open Trừ Điểm Modal) */}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingViolation(null);
                              setViolationForm(prev => ({
                                ...prev,
                                classId: item.classId,
                                day: 'T2',
                                criterionId: criteria[0]?.id || '1.1',
                                quantity: 1,
                                studentNames: '',
                                note: '',
                                proofImage: '',
                                status: 'accepted'
                              }));
                              setIsViolationModalOpen(true);
                            }}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition-all inline-flex items-center gap-1 shadow-sm ${item.totalDeduction > 0
                              ? 'bg-rose-950/80 text-rose-300 border border-rose-700/60 hover:bg-rose-900'
                              : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-rose-400 hover:bg-slate-800'
                              }`}
                            title="Bấm để Ghi nhận / Quản lý Trừ điểm của lớp"
                          >
                            <span>{item.totalDeduction > 0 ? `-${item.totalDeduction}` : '0'}</span>
                            <span className="text-[10px] text-rose-400">✏️</span>
                          </button>
                        </td>

                        {/* Điểm Thưởng (Clickable to open Thưởng Điểm Modal) */}
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => setBonusModalClass({ classId: item.classId, className: item.className })}
                            className={`px-2.5 py-1 rounded-lg text-xs font-black font-mono transition-all inline-flex items-center gap-1 shadow-sm ${item.totalBonus > 0
                              ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-600 hover:bg-emerald-900'
                              : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-emerald-300 hover:bg-slate-800'
                              }`}
                            title="Bấm để Thêm / Sửa / Xóa điểm thưởng của lớp"
                          >
                            <span>{item.totalBonus > 0 ? `+${item.totalBonus}đ` : '0đ'}</span>
                            <span className="text-[10px] text-emerald-400">✏️</span>
                          </button>
                        </td>

                        {/* Tổng Điểm (Clickable for Direct Score Entry Modal) */}
                        <td className="p-2.5 text-center font-mono">
                          <button
                            type="button"
                            onClick={() => {
                              setDirectScoreModalClass({
                                classId: item.classId,
                                className: item.className,
                                currentScore: item.finalScore,
                                currentDeduct: item.totalDeduction,
                                currentBonus: item.totalBonus
                              });
                              setDirectScoreTarget(item.finalScore);
                              setDirectScoreReason('BQT/Admin điều chỉnh điểm trực tiếp');
                              setDirectScoreDay('T2');
                            }}
                            className="px-2.5 py-1 rounded-xl bg-amber-950/70 hover:bg-amber-900 text-amber-300 hover:text-amber-100 border border-amber-800/80 hover:border-amber-500 font-mono font-black text-sm transition-all inline-flex items-center gap-1.5 shadow-sm active:scale-95 group cursor-pointer"
                            title={`Bấm để Nhập / Điều chỉnh điểm trực tiếp cho ${item.className}`}
                          >
                            <span>{item.finalScore}</span>
                            <span className="text-[11px] text-amber-400 opacity-75 group-hover:opacity-100">✏️</span>
                          </button>
                        </td>

                        {/* Thao Tác (3 buttons: Nhập Điểm, Thưởng Điểm & Trừ Điểm) */}
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5 flex-wrap">
                            <button
                              type="button"
                              onClick={() => {
                                setDirectScoreModalClass({
                                  classId: item.classId,
                                  className: item.className,
                                  currentScore: item.finalScore,
                                  currentDeduct: item.totalDeduction,
                                  currentBonus: item.totalBonus
                                });
                                setDirectScoreTarget(item.finalScore);
                                setDirectScoreReason('BQT/Admin điều chỉnh điểm trực tiếp');
                                setDirectScoreDay('T2');
                              }}
                              className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold transition-all shadow-glow flex items-center gap-1 whitespace-nowrap active:scale-95"
                              title={`Nhập / Điều chỉnh điểm trực tiếp cho ${item.className}`}
                            >
                              <span>✏️</span>
                              <span>Nhập Điểm</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setBonusModalClass({ classId: item.classId, className: item.className })}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold transition-all shadow-glow flex items-center gap-1 whitespace-nowrap active:scale-95"
                              title="Thêm hoặc xóa điểm thưởng cho lớp"
                            >
                              <span>⭐</span>
                              <span>Thưởng Điểm</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingViolation(null);
                                setViolationForm(prev => ({
                                  ...prev,
                                  classId: item.classId,
                                  day: 'T2',
                                  criterionId: criteria[0]?.id || '1.1',
                                  quantity: 1,
                                  studentNames: '',
                                  note: '',
                                  proofImage: '',
                                  status: 'accepted'
                                }));
                                setIsViolationModalOpen(true);
                              }}
                              className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold transition-all shadow-glow flex items-center gap-1 whitespace-nowrap active:scale-95"
                              title="Ghi nhận lỗi trừ điểm cho lớp"
                            >
                              <span>💥</span>
                              <span>Trừ Điểm</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= SUB-TAB 1.2: VIOLATIONS LIST ================= */}
          {violationHubSubTab === 'violations_list' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">DANH SÁCH VI PHẠM NỀ NẾP & TRỪ ĐIỂM</h4>
                  <p className="text-[11px] text-slate-400">Toàn quyền thêm trực tiếp, chỉnh sửa lỗi, xóa vi phạm và lọc tìm kiếm theo nhóm tiêu chí</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {filteredViolations.filter(v => v.status === 'pending').length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        const pendingList = filteredViolations.filter(v => v.status === 'pending');
                        if (confirm(`Xác nhận DUYỆT NHANH TẤT CẢ ${pendingList.length} bản ghi vi phạm đang chờ duyệt?`)) {
                          pendingList.forEach(v => {
                            updateViolation(v.id, { status: 'accepted' });
                          });
                          alert(`✓ Đã duyệt nhanh thành công ${pendingList.length} bản ghi vi phạm!`);
                        }
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow active:scale-95 transition-all"
                      title="Duyệt nhanh tất cả vi phạm đang chờ trong danh sách hiện tại"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>⚡ Duyệt Tất Cả ({filteredViolations.filter(v => v.status === 'pending').length} Lỗi Chờ)</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setEditingViolation(null);
                      setViolationForm({
                        classId: classes[0]?.id || '10/1',
                        day: 'T2',
                        criterionId: criteria[0]?.id || '1.1',
                        quantity: 1,
                        studentNames: '',
                        note: '',
                        proofImage: '',
                        status: 'accepted'
                      });
                      setIsViolationModalOpen(true);
                    }}
                    className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ghi Nhận Lỗi / Điểm Mới</span>
                  </button>
                </div>
              </div>

              {/* NHÓM TIÊU CHÍ CHỌN MẶC ĐỊNH & BỘ LỌC */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Lọc theo Nhóm Nội Dung:</span>
                    {defaultCriterionGroup !== 'ALL' && (
                      <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 text-[10px] font-bold border border-amber-800">
                        ⭐ Mặc định: {defaultCriterionGroup}
                      </span>
                    )}
                  </div>

                  {selectedCriterionGroup !== defaultCriterionGroup && (
                    <button
                      onClick={() => handleSetDefaultGroup(selectedCriterionGroup)}
                      className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1 self-end"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>Đặt nhóm "{selectedCriterionGroup === 'ALL' ? 'Tất cả' : selectedCriterionGroup}" làm mặc định</span>
                    </button>
                  )}
                </div>

                {/* Group Chips */}
                <div className="flex flex-wrap gap-1.5 text-xs">
                  {[
                    { id: 'ALL', label: 'Tất cả các nhóm' },
                    { id: 'Chuyên cần', label: 'I.1 Chuyên cần' },
                    { id: 'Vệ sinh', label: 'I.2 Vệ sinh' },
                    { id: 'Nề nếp tự quản', label: 'I.3 Nề nếp tự quản' },
                    { id: 'Tác phong', label: 'I.4 Tác phong' },
                    { id: 'Thành tích & Phong trào', label: 'Thành tích / Phong trào' }
                  ].map(group => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedCriterionGroup(group.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${selectedCriterionGroup === group.id
                        ? 'bg-red-600 text-white shadow-glow'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                      {group.label}
                    </button>
                  ))}
                </div>

                {/* Additional Search & Filters */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-900">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-500" />
                    <input
                      type="text"
                      value={violationSearch}
                      onChange={(e) => setViolationSearch(e.target.value)}
                      placeholder="Tìm lớp, học sinh, tiêu chí, người chấm..."
                      className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-red-500"
                    />
                  </div>

                  <div>
                    <select
                      value={violationClassFilter}
                      onChange={(e) => setViolationClassFilter(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                    >
                      <option value="ALL">Tất cả các lớp (18 lớp)</option>
                      {classes.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <select
                      value={violationDayFilter}
                      onChange={(e) => setViolationDayFilter(e.target.value)}
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold"
                    >
                      <option value="ALL">Tất cả các ngày (T2 - T7)</option>
                      {['T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                        <option key={d} value={d}>Thứ {d.replace('T', '')}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Violations Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                      <th className="p-3 font-bold text-center w-12 text-slate-400">STT</th>
                      <SortableTh
                        label="Ngày"
                        columnKey="day"
                        currentSortKey={violationSort.key}
                        currentSortDir={violationSort.direction}
                        onSort={(k) => handleToggleSort(setViolationSort, k)}
                      />
                      <SortableTh
                        label="Lớp"
                        columnKey="className"
                        currentSortKey={violationSort.key}
                        currentSortDir={violationSort.direction}
                        onSort={(k) => handleToggleSort(setViolationSort, k)}
                      />
                      <SortableTh
                        label="Nhóm Tiêu Chí"
                        columnKey="groupName"
                        currentSortKey={violationSort.key}
                        currentSortDir={violationSort.direction}
                        onSort={(k) => handleToggleSort(setViolationSort, k)}
                      />
                      <SortableTh
                        label="Nội Dung Tiêu Chí"
                        columnKey="criterionName"
                        currentSortKey={violationSort.key}
                        currentSortDir={violationSort.direction}
                        onSort={(k) => handleToggleSort(setViolationSort, k)}
                      />
                      <SortableTh
                        label="SL"
                        columnKey="quantity"
                        currentSortKey={violationSort.key}
                        currentSortDir={violationSort.direction}
                        onSort={(k) => handleToggleSort(setViolationSort, k)}
                        align="center"
                      />
                      <SortableTh
                        label="Điểm Trừ/Cộng"
                        columnKey="pointsDeducted"
                        currentSortKey={violationSort.key}
                        currentSortDir={violationSort.direction}
                        onSort={(k) => handleToggleSort(setViolationSort, k)}
                        align="center"
                      />
                      <SortableTh
                        label="Học Sinh Vi Phạm"
                        columnKey="studentNames"
                        currentSortKey={violationSort.key}
                        currentSortDir={violationSort.direction}
                        onSort={(k) => handleToggleSort(setViolationSort, k)}
                      />
                      <SortableTh
                        label="Người Chấm"
                        columnKey="reportedBy"
                        currentSortKey={violationSort.key}
                        currentSortDir={violationSort.direction}
                        onSort={(k) => handleToggleSort(setViolationSort, k)}
                      />
                      <SortableTh
                        label="Trạng Thái"
                        columnKey="status"
                        currentSortKey={violationSort.key}
                        currentSortDir={violationSort.direction}
                        onSort={(k) => handleToggleSort(setViolationSort, k)}
                        align="center"
                      />
                      <th className="p-3 text-right font-bold">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sortedViolations.map((vio, index) => (
                      <tr key={vio.id} className="hover:bg-slate-800/40">
                        <td className="p-3 text-center font-mono font-bold text-slate-400">
                          {index + 1}
                        </td>
                        <td className="p-3 font-bold text-amber-400 whitespace-nowrap">{vio.day}</td>
                        <td className="p-3 font-bold text-white whitespace-nowrap">{vio.className}</td>
                        <td className="p-3 text-slate-400">{vio.groupName}</td>
                        <td className="p-3 font-bold text-slate-200">
                          <div>{vio.criterionName}</div>
                          {vio.note && <div className="text-[10px] text-slate-400 font-normal italic mt-0.5">{vio.note}</div>}
                        </td>
                        <td className="p-3 text-center font-mono">{vio.quantity}</td>
                        <td className="p-3 text-center font-black text-rose-400 font-mono whitespace-nowrap">
                          -{vio.pointsDeducted}đ
                        </td>
                        <td className="p-3 text-slate-300">
                          {vio.studentNames && vio.studentNames.length > 0 && !vio.studentNames.some(n => n.toLowerCase().includes('tập thể')) ? (
                            <div className="flex flex-wrap gap-1">
                              {vio.studentNames.map((name, i) => (
                                <span
                                  key={i}
                                  className="px-2 py-0.5 rounded-lg bg-red-950/80 border border-red-800/70 text-red-200 text-xs font-semibold inline-flex items-center gap-1 shadow-sm"
                                >
                                  <span className="text-[10px]">👤</span>
                                  {name}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">
                              {vio.studentNames && vio.studentNames.length > 0 ? vio.studentNames.join(', ') : 'Tập thể lớp'}
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-slate-400">{vio.reportedBy.name}</td>
                        <td className="p-3 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${vio.status === 'accepted' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                            vio.status === 'appealed' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                              vio.status === 'approved_appeal' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                                'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                            {vio.status === 'accepted' ? 'Đã duyệt' : vio.status === 'appealed' ? 'Đang khiếu nại' : vio.status === 'approved_appeal' ? 'Đã hủy lỗi' : 'Chờ duyệt'}
                          </span>
                        </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          {vio.status === 'pending' && (
                            <button
                              onClick={() => {
                                updateViolation(vio.id, { status: 'accepted' });
                              }}
                              title="⚡ Duyệt nhanh vi phạm này"
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[11px] inline-flex items-center gap-1 shadow-sm active:scale-95 transition-all mr-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Duyệt</span>
                            </button>
                          )}

                          {vio.proofImages && vio.proofImages.length > 0 && (
                            <button
                              onClick={() => setViewingPhoto(vio.proofImages[0])}
                              title="Xem ảnh minh chứng"
                              className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:bg-blue-950"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setEditingViolation(vio);
                              setViolationForm({
                                classId: vio.classId,
                                day: vio.day,
                                criterionId: vio.criterionId,
                                quantity: vio.quantity,
                                studentNames: vio.studentNames ? vio.studentNames.join(', ') : '',
                                note: vio.note || '',
                                proofImage: vio.proofImages[0] || '',
                                status: vio.status
                              });
                              setIsViolationModalOpen(true);
                            }}
                            title="Chỉnh sửa vi phạm"
                            className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-amber-950"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa bản ghi lỗi "${vio.criterionName}" của ${vio.className}? (Điểm trừ sẽ được hoàn trả)`)) {
                                deleteViolation(vio.id);
                              }
                            }}
                            title="Xóa vi phạm"
                            className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= SUB-TAB 1.3: APPEALS RESOLUTION ================= */}
          {violationHubSubTab === 'appeals' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">TRUNG TÂM PHÂN XỬ KHIẾU NẠI & ĐỐI CHẤT (SPLIT-VIEW)</h4>
                  <p className="text-[11px] text-slate-400">Đối chiếu trực quan giữa Báo cáo Cờ đỏ và Đơn giải trình của Giáo viên Chủ nhiệm</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-950 text-purple-300 border border-purple-800">
                  {appealedViolations.length} đơn chờ xử lý
                </span>
              </div>

              {appealedViolations.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs bg-slate-950/50 rounded-2xl border border-slate-900">
                  <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-2" />
                  <p className="font-bold text-white text-base">Không có khiếu nại nào đang chờ xử lý.</p>
                  <p className="text-slate-400 text-xs mt-1">Toàn bộ khiếu nại của các lớp trong Tuần {activeWeek} đã được phân xử hoàn tất.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {appealedViolations.map(vio => (
                    <div key={vio.id} className="p-5 rounded-3xl bg-slate-950 border border-slate-800 space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded-lg bg-red-600 text-white font-bold text-xs">
                            {vio.className}
                          </span>
                          <h4 className="font-black text-white text-sm">{vio.criterionName} (Trừ {vio.pointsDeducted}đ)</h4>
                          <span className="text-xs text-slate-400">• Ngày: {vio.day}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Left: Cờ Đỏ Report */}
                        <div className="p-4 rounded-2xl bg-slate-900 border border-amber-800/40 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                              🚩 Báo cáo của Đội Cờ Đỏ:
                            </span>
                            <span className="text-[10px] text-slate-400">{vio.reportedAt}</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Cờ đỏ phụ trách: <strong>{vio.reportedBy.name}</strong>
                          </p>
                          <p className="text-xs text-slate-300">
                            Ghi chú: {vio.note || 'Không có ghi chú thêm.'}
                          </p>
                          {vio.proofImages.length > 0 && (
                            <div>
                              <span className="text-[11px] text-slate-400 block mb-1">Ảnh chụp hiện trường:</span>
                              <img
                                src={vio.proofImages[0]}
                                alt="Cờ đỏ report"
                                onClick={() => setViewingPhoto(vio.proofImages[0])}
                                className="w-full h-36 object-cover rounded-xl border border-slate-700 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>

                        {/* Right: GVCN Appeal */}
                        <div className="p-4 rounded-2xl bg-slate-900 border border-blue-800/40 space-y-2">
                          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                            <span className="text-xs font-bold text-blue-400 flex items-center gap-1">
                              🏫 Giải trình của GVCN:
                            </span>
                            <span className="text-[10px] text-slate-400">{vio.appeal?.appealedAt}</span>
                          </div>
                          <p className="text-xs text-slate-300">
                            Người gửi: <strong>{vio.appeal?.appealedBy}</strong>
                          </p>
                          <p className="text-xs text-slate-200 bg-slate-950 p-2.5 rounded-xl border border-slate-800 leading-relaxed">
                            "{vio.appeal?.reason}"
                          </p>
                          {vio.appeal?.proofImages && vio.appeal.proofImages.length > 0 && (
                            <div>
                              <span className="text-[11px] text-slate-400 block mb-1">Minh chứng / Giấy xin phép:</span>
                              <img
                                src={vio.appeal.proofImages[0]}
                                alt="GVCN proof"
                                onClick={() => setViewingPhoto(vio.appeal!.proofImages[0])}
                                className="w-full h-36 object-cover rounded-xl border border-slate-700 cursor-pointer"
                              />
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-end gap-3">
                        <button
                          onClick={() => resolveAppeal(vio.id, 'rejected_appeal', 'Bác bỏ khiếu nại: Minh chứng của Cờ đỏ rõ ràng, giữ nguyên điểm trừ.')}
                          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-rose-950 hover:border-rose-700 text-rose-300 border border-slate-700 text-xs font-bold transition-colors"
                        >
                          ❌ Bác Bỏ Khiếu Nại (Giữ Nguyên)
                        </button>

                        <button
                          onClick={() => resolveAppeal(vio.id, 'approved_appeal', 'Chấp nhận khiếu nại: GVCN đã cung cấp đủ giấy xác nhận hợp lệ, hủy lỗi vi phạm và hoàn trả điểm.')}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow transition-all"
                        >
                          ✅ Chấp Nhận Khiếu Nại (Hủy Lỗi & Hoàn Điểm)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ================= MAIN TAB 2: OPERATIONS HUB (ĐOÀN VIÊN, LỚP HỌC, LỊCH TRỰC, CẤU HÌNH TUẦN) ================= */}
      {adminTab === 'operations_hub' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-5">
          {/* Sub-tabs Header inside Operations Hub */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-blue-500" />
                <span>QUẢN LÝ DỮ LIỆU CƠ SỞ, ĐOÀN VIÊN & VẬN HÀNH</span>
              </h3>
              <p className="text-xs text-slate-400">Quản lý hồ sơ học sinh, danh sách lớp học, phân công lịch trực cờ đỏ và cấu hình tuần học</p>
            </div>

            {/* Sub-tabs pills */}
            <div className="flex flex-wrap bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => setOperationsSubTab('students')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${operationsSubTab === 'students'
                  ? 'bg-blue-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>👨‍🎓 Học Sinh & Đoàn Viên ({students.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setOperationsSubTab('classes')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${operationsSubTab === 'classes'
                  ? 'bg-blue-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>🏫 Danh Sách Lớp ({classes.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setOperationsSubTab('duties')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${operationsSubTab === 'duties'
                  ? 'bg-blue-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>🛡️ Phân Công Trực Tuần</span>
              </button>

              <button
                type="button"
                onClick={() => setOperationsSubTab('weeks')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${operationsSubTab === 'weeks'
                  ? 'bg-blue-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>📅 Cấu Hình Tuần ({weeksConfig.length})</span>
              </button>
            </div>
          </div>

          {/* Master Sub-Tab 1: STUDENTS */}
          {operationsSubTab === 'students' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Scientific Filter Bar Container */}
              <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3 shadow-lg">
                
                {/* 1. Grade Selector Pills */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                    <span className="text-xs font-bold text-slate-400 mr-1 flex items-center gap-1">
                      <span>🏷️ Khối lớp:</span>
                    </span>
                    {(['ALL', '10', '11', '12'] as const).map(g => {
                      const isSelected = studentGradeFilter === g;
                      const count = g === 'ALL' ? studentStats.total : g === '10' ? studentStats.grade10 : g === '11' ? studentStats.grade11 : studentStats.grade12;
                      return (
                        <button
                          key={g}
                          type="button"
                          onClick={() => {
                            setStudentGradeFilter(g);
                            setStudentClassFilter('ALL');
                          }}
                          className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'bg-red-600 text-white shadow-glow'
                              : 'bg-slate-950 text-slate-400 hover:text-white hover:bg-slate-800 border border-slate-800'
                          }`}
                        >
                          <span>{g === 'ALL' ? 'Tất cả Khối' : `Khối ${g}`}</span>
                          <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                            isSelected ? 'bg-black/30 text-white font-mono' : 'bg-slate-800 text-slate-400 font-mono'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Realtime Counter Badge */}
                  <div className="flex items-center gap-2">
                    <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-bold text-slate-300 flex items-center gap-1.5 shadow-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span>Hiển thị: <strong className="text-amber-400">{filteredStudents.length}</strong> / {students.length} học sinh</span>
                    </div>
                  </div>
                </div>

                {/* 2. Secondary Filter Bar (Class, Union Status, Search & Primary Actions) */}
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-2.5">
                  <div className="flex flex-wrap items-center gap-2 flex-1">
                    {/* Dynamic Class Selector */}
                    <div className="relative min-w-[170px]">
                      <select
                        value={studentClassFilter}
                        onChange={(e) => setStudentClassFilter(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs focus:outline-none focus:border-amber-500 cursor-pointer shadow-sm"
                      >
                        <option value="ALL">
                          {studentGradeFilter === 'ALL' ? `🏫 Tất cả ${classes.length} lớp` : `🏫 Tất cả lớp Khối ${studentGradeFilter}`}
                        </option>
                        {availableStudentClasses.map(c => {
                          const classStudentCount = students.filter(s => s.classId === c.id).length;
                          return (
                            <option key={c.id} value={c.id}>
                              {c.name} ({classStudentCount} HS)
                            </option>
                          );
                        })}
                      </select>
                    </div>

                    {/* Union Status Filter Pills */}
                    <div className="flex items-center bg-slate-950 p-1 rounded-xl border border-slate-700/80 text-xs font-bold shadow-sm">
                      <button
                        type="button"
                        onClick={() => setStudentUnionFilter('ALL')}
                        className={`px-2.5 py-1 rounded-lg transition-all ${
                          studentUnionFilter === 'ALL'
                            ? 'bg-slate-800 text-white font-black'
                            : 'text-slate-400 hover:text-white'
                        }`}
                        title="Tất cả học sinh"
                      >
                        Tất cả ({studentStats.scopedTotal})
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentUnionFilter('YES')}
                        className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                          studentUnionFilter === 'YES' || studentUnionFilter === 'UNION'
                            ? 'bg-red-600 text-white font-black shadow-glow'
                            : 'text-amber-400 hover:text-amber-300'
                        }`}
                        title="Chỉ đoàn viên"
                      >
                        <span>⭐ Đoàn viên</span>
                        <span className="text-[10px] opacity-80">({studentStats.scopedUnion})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setStudentUnionFilter('NO')}
                        className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
                          studentUnionFilter === 'NO' || studentUnionFilter === 'NON_UNION'
                            ? 'bg-slate-700 text-white font-black'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                        title="Chưa kết nạp Đoàn"
                      >
                        <span>Chưa vào</span>
                        <span className="text-[10px] opacity-80">({studentStats.scopedNonUnion})</span>
                      </button>
                    </div>

                    {/* Search Bar with Clear Button */}
                    <div className="relative flex-1 min-w-[200px]">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        placeholder="Tìm theo Mã HS, Họ tên, SĐT, Địa chỉ, Dân tộc..."
                        className="w-full pl-8 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500 shadow-sm"
                      />
                      {studentSearch && (
                        <button
                          type="button"
                          onClick={() => setStudentSearch('')}
                          className="absolute right-2.5 top-2.5 text-slate-500 hover:text-white p-0.5 rounded-full"
                          title="Xóa tìm kiếm"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Primary Action Buttons */}
                  <div className="flex items-center gap-2 shrink-0 justify-end flex-wrap sm:flex-nowrap">
                    <button
                      onClick={handlePushStudentsToCloud}
                      disabled={isPushingStudents}
                      className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95 disabled:opacity-50"
                      title="Đẩy toàn bộ danh sách học sinh hiện tại trên máy tính lên CSDL Supabase Cloud để đồng bộ với điện thoại"
                    >
                      <Cloud className={`w-4 h-4 ${isPushingStudents ? 'animate-spin text-amber-300' : 'text-blue-200'}`} />
                      <span>{isPushingStudents ? 'Đang đồng bộ...' : `Đẩy lên Cloud (${students.length})`}</span>
                    </button>

                    <button
                      onClick={() => setIsImportModalOpen(true)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                      title="Nhập danh sách học sinh từ file Excel"
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Import Excel</span>
                    </button>

                    <button
                      onClick={() => {
                        setEditingStudent(null);
                        setStudentForm({
                          studentId: `HS2024${Math.floor(1000 + Math.random() * 9000)}`,
                          name: '',
                          classId: availableStudentClasses[0]?.id || classes[0]?.id || '10/1',
                          grade: (Number((availableStudentClasses[0]?.id || '10/1').split('/')[0]) || 10) as 10 | 11 | 12,
                          gender: 'Nam',
                          dob: '2009-01-01',
                          ethnicity: 'Kinh',
                          phone: '',
                          address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
                          avatar: '',
                          isUnionMember: true,
                          unionCardNumber: '',
                          unionPosition: 'Đoàn viên',
                          unionJoinedDate: '2024-03-26',
                          unionJoinedPlace: 'Đoàn trường THPT Quang Trung',
                          unionFeeStatus: 'paid',
                          unionBookletStatus: 'submitted',
                          conductRating: 'Xuất sắc',
                          customNotes: '',
                          points: 100,
                          rankTitle: 'Đoàn viên Tích cực',
                          status: 'active'
                        });
                        setIsStudentModalOpen(true);
                      }}
                      className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all active:scale-95"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Thêm Học Sinh</span>
                    </button>

                    <button
                      onClick={() => {
                        if (selectedStudentIds.length === 0) {
                          alert('👉 Vui lòng tích chọn ô vuông ở cột đầu tiên của các học sinh bạn muốn xóa trong danh sách!');
                        } else {
                          handleBatchDeleteStudents();
                        }
                      }}
                      className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                        selectedStudentIds.length > 0
                          ? 'bg-red-600 hover:bg-red-500 text-white shadow-glow animate-pulse'
                          : 'bg-slate-950 hover:bg-red-950/60 text-red-400 border border-red-800/60'
                      }`}
                      title={selectedStudentIds.length > 0 ? `Xóa ${selectedStudentIds.length} học sinh đã chọn` : 'Tích chọn ô vuông để xóa'}
                    >
                      <Trash2 className="w-4 h-4 text-red-300" />
                      <span>{selectedStudentIds.length > 0 ? `Xóa Đã Chọn (${selectedStudentIds.length})` : 'Xóa Học Sinh'}</span>
                    </button>
                  </div>
                </div>

                {/* Batch Action Bar if any student is selected */}
                {selectedStudentIds.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 bg-red-950/70 border border-red-600/80 rounded-xl animate-fadeIn">
                    <div className="flex items-center gap-2">
                      <span className="p-1 rounded-lg bg-red-600 text-white">
                        <CheckSquare className="w-3.5 h-3.5" />
                      </span>
                      <span className="text-xs font-black text-amber-300">
                        Đang chọn: {selectedStudentIds.length} học sinh
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleBatchMakeUnionMember(true)}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Star className="w-3.5 h-3.5 text-amber-300" />
                        <span>Chuyển vào Đoàn ({selectedStudentIds.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBatchMakeUnionMember(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1 transition-all"
                      >
                        <span>Rút khỏi Đoàn</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleBatchDeleteStudents}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 shadow-sm transition-all"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Xóa ({selectedStudentIds.length})</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedStudentIds([])}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white text-xs font-bold"
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Students Table */}
              <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/60 shadow-xl">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-800 font-bold">
                      <th className="p-3 w-12 text-center">
                        <input
                          type="checkbox"
                          checked={filteredStudents.length > 0 && selectedStudentIds.length === filteredStudents.length}
                          onChange={toggleSelectAllStudents}
                          className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-0 cursor-pointer"
                          title="Chọn tất cả học sinh đang hiển thị"
                        />
                      </th>
                      <th className="p-3 text-center font-bold w-12 text-slate-400">STT</th>
                      <SortableTh
                        label="Mã HS"
                        columnKey="studentId"
                        currentSortKey={studentSort.key}
                        currentSortDir={studentSort.direction}
                        onSort={(k) => handleToggleSort(setStudentSort, k)}
                      />
                      <SortableTh
                        label="Họ và Tên"
                        columnKey="name"
                        currentSortKey={studentSort.key}
                        currentSortDir={studentSort.direction}
                        onSort={(k) => handleToggleSort(setStudentSort, k)}
                      />
                      <SortableTh
                        label="Lớp"
                        columnKey="classId"
                        currentSortKey={studentSort.key}
                        currentSortDir={studentSort.direction}
                        onSort={(k) => handleToggleSort(setStudentSort, k)}
                      />
                      <SortableTh
                        label="Ngày Sinh"
                        columnKey="dob"
                        currentSortKey={studentSort.key}
                        currentSortDir={studentSort.direction}
                        onSort={(k) => handleToggleSort(setStudentSort, k)}
                      />
                      <SortableTh
                        label="Giới Tính"
                        columnKey="gender"
                        currentSortKey={studentSort.key}
                        currentSortDir={studentSort.direction}
                        onSort={(k) => handleToggleSort(setStudentSort, k)}
                      />
                      <SortableTh
                        label="Dân Tộc"
                        columnKey="ethnicity"
                        currentSortKey={studentSort.key}
                        currentSortDir={studentSort.direction}
                        onSort={(k) => handleToggleSort(setStudentSort, k)}
                      />
                      <SortableTh
                        label="Số Điện Thoại"
                        columnKey="phone"
                        currentSortKey={studentSort.key}
                        currentSortDir={studentSort.direction}
                        onSort={(k) => handleToggleSort(setStudentSort, k)}
                      />
                      <SortableTh
                        label="Địa Chỉ Liên Hệ"
                        columnKey="address"
                        currentSortKey={studentSort.key}
                        currentSortDir={studentSort.direction}
                        onSort={(k) => handleToggleSort(setStudentSort, k)}
                      />
                      <SortableTh
                        label="Đoàn Viên"
                        columnKey="isUnionMember"
                        currentSortKey={studentSort.key}
                        currentSortDir={studentSort.direction}
                        onSort={(k) => handleToggleSort(setStudentSort, k)}
                        align="center"
                      />
                      <SortableTh
                        label="Chức Vụ / Hồ Sơ Sổ Đoàn"
                        columnKey="unionPosition"
                        currentSortKey={studentSort.key}
                        currentSortDir={studentSort.direction}
                        onSort={(k) => handleToggleSort(setStudentSort, k)}
                      />
                      <th className="p-3 text-right">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {sortedStudents.length === 0 ? (
                      <tr>
                        <td colSpan={13} className="p-8 text-center text-slate-500 space-y-2">
                          <p className="text-base font-bold text-slate-400">Không tìm thấy học sinh nào phù hợp bộ lọc!</p>
                          <p className="text-xs text-slate-500">Thử thay đổi Khối, Lớp, Trạng thái Đoàn viên hoặc từ khóa tìm kiếm.</p>
                        </td>
                      </tr>
                    ) : (
                      sortedStudents.map((st, index) => {
                        const isSelected = selectedStudentIds.includes(st.id) || selectedStudentIds.includes(st.studentId);
                        return (
                          <tr 
                            key={st.id || st.studentId} 
                            className={`transition-colors ${isSelected ? 'bg-red-950/30' : 'hover:bg-slate-800/40'}`}
                          >
                            <td className="p-3 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleStudentSelection(st.id || st.studentId)}
                                className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-red-600 focus:ring-0 cursor-pointer"
                              />
                            </td>
                            <td className="p-3 text-center font-mono font-bold text-slate-400">
                              {index + 1}
                            </td>
                            <td className="p-3 font-mono font-bold text-amber-400 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-lg bg-amber-950/60 border border-amber-800/60">
                                {st.studentId}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-white whitespace-nowrap">{st.name}</td>
                            <td className="p-3 whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded-lg bg-blue-950/80 border border-blue-800/60 text-blue-300 font-bold">
                                {st.classId}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300 whitespace-nowrap font-mono">{st.dob || '—'}</td>
                            <td className="p-3 whitespace-nowrap">
                              <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                                st.gender === 'Nam' ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/50' : 'bg-rose-950/80 text-rose-300 border border-rose-800/50'
                              }`}>
                                {st.gender}
                              </span>
                            </td>
                            <td className="p-3 text-slate-300 whitespace-nowrap">{st.ethnicity || 'Kinh'}</td>
                            <td className="p-3 font-mono whitespace-nowrap">
                              {st.phone ? (
                                <span className="text-emerald-400 font-bold">{st.phone}</span>
                              ) : (
                                <span className="text-slate-500 italic text-[11px]">Chưa cập nhật</span>
                              )}
                            </td>
                            <td className="p-3 text-slate-300 max-w-[220px] truncate" title={st.address || 'Chưa cập nhật địa chỉ'}>
                              {st.address ? (
                                <span>{st.address}</span>
                              ) : (
                                <span className="text-slate-500 italic text-[11px]">Chưa cập nhật</span>
                              )}
                            </td>
                            <td className="p-3 text-center whitespace-nowrap">
                              <button
                                onClick={() => toggleUnionStatus(st.id || st.studentId)}
                                className={`px-2.5 py-1 rounded-full text-[11px] font-bold border transition-all active:scale-95 ${
                                  st.isUnionMember
                                    ? 'bg-red-950 text-red-300 border-red-700 hover:bg-red-900 shadow-sm'
                                    : 'bg-slate-950 text-slate-500 border-slate-700 hover:bg-slate-800 hover:text-slate-300'
                                }`}
                                title="Click để chuyển đổi trạng thái Đoàn viên"
                              >
                                {st.isUnionMember ? '⭐ Đoàn viên' : 'Chưa vào'}
                              </button>
                            </td>
                            <td className="p-3 text-slate-400 whitespace-nowrap">
                              {st.isUnionMember ? (
                                <div>
                                  <span className="font-bold text-slate-200">{st.unionPosition || 'Đoàn viên'}</span>
                                  <span className="text-[10px] block text-slate-400">
                                    {st.unionBookletStatus === 'submitted' ? '✓ Đã nộp sổ' : '✕ Chưa nộp sổ'} • {st.unionFeeStatus === 'paid' ? '✓ Đã đóng phí' : '✕ Nợ phí'}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-600">—</span>
                              )}
                            </td>
                            <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                              <button
                                onClick={() => {
                                  setTransferingStudent(st);
                                  setTargetTransferClass(classes.find(c => c.id !== st.classId)?.id || '10/2');
                                }}
                                title="Chuyển lớp cho học sinh"
                                className="p-1.5 rounded-lg bg-slate-800 text-blue-400 hover:bg-blue-950 border border-slate-700 hover:border-blue-700"
                              >
                                <ArrowRightLeft className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  setEditingStudent(st);
                                  setStudentForm({
                                    studentId: st.studentId,
                                    name: st.name,
                                    classId: st.classId,
                                    grade: st.grade,
                                    gender: st.gender,
                                    dob: st.dob,
                                    ethnicity: st.ethnicity || 'Kinh',
                                    phone: st.phone || '',
                                    address: st.address || '',
                                    avatar: st.avatar || '',
                                    isUnionMember: st.isUnionMember,
                                    unionCardNumber: st.unionCardNumber || '',
                                    unionPosition: st.unionPosition || 'Đoàn viên',
                                    unionJoinedDate: st.unionJoinedDate || '2024-03-26',
                                    unionJoinedPlace: st.unionJoinedPlace || 'Đoàn trường THPT Quang Trung',
                                    unionFeeStatus: st.unionFeeStatus || 'paid',
                                    unionBookletStatus: st.unionBookletStatus || 'submitted',
                                    conductRating: st.conductRating || 'Xuất sắc',
                                    customNotes: st.customNotes || '',
                                    points: st.points,
                                    rankTitle: st.rankTitle,
                                    status: (st.status === 'archived' ? 'archived' : 'active') as any
                                  });
                                  setIsStudentModalOpen(true);
                                }}
                                title="Sửa hồ sơ học sinh"
                                className="p-1.5 rounded-lg bg-slate-800 text-amber-400 hover:bg-amber-950 border border-slate-700 hover:border-amber-700"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => {
                                  if (confirm(`Bạn có chắc chắn muốn xóa học sinh "${st.name}" (${st.studentId})?`)) {
                                    deleteStudent(st.id || st.studentId);
                                  }
                                }}
                                title="Xóa học sinh"
                                className="p-1.5 rounded-lg bg-slate-800 text-rose-400 hover:bg-rose-950 border border-slate-700 hover:border-rose-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Master Sub-Tab 2: CLASSES & CADRES (BAN CÁN SỰ & BCH CHI ĐOÀN) */}
          {operationsSubTab === 'classes' && (() => {
            const sortedAndFilteredClasses = classes
              .filter(c => classGradeTab === 'ALL' || c.grade === classGradeTab)
              .filter(c => {
                if (!classSearchQuery.trim()) return true;
                const q = classSearchQuery.toLowerCase().trim();
                return (
                  c.id.toLowerCase().includes(q) ||
                  c.name.toLowerCase().includes(q) ||
                  (c.gvcnName && c.gvcnName.toLowerCase().includes(q)) ||
                  (c.classPresidentName && c.classPresidentName.toLowerCase().includes(q)) ||
                  (c.academicVicePresidentName && c.academicVicePresidentName.toLowerCase().includes(q)) ||
                  (c.bithuName && c.bithuName.toLowerCase().includes(q)) ||
                  (c.deputySecretaryName && c.deputySecretaryName.toLowerCase().includes(q))
                );
              })
              .sort((a, b) => {
                const gA = a.grade;
                const gB = b.grade;
                if (gA !== gB) return gA - gB;
                const numA = parseInt(a.id.split('/')[1] || '0', 10);
                const numB = parseInt(b.id.split('/')[1] || '0', 10);
                return numA - numB;
              });

            const totalStudentsCount = classes.reduce((acc, c) => acc + (c.totalStudents || 0), 0);
            const totalUnionCount = classes.reduce((acc, c) => acc + (c.unionMembers || 0), 0);

            return (
              <div className="space-y-5 animate-fadeIn">
                {/* Header Banner & Global Action Buttons */}
                <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-950 to-blue-950/40 border border-slate-800 shadow-xl space-y-4">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="p-2 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 text-base font-bold">
                          🏛️
                        </span>
                        <h4 className="text-base font-black text-white tracking-wide uppercase flex items-center gap-2">
                          <span>DANH SÁCH BAN CÁN SỰ & BCH CHI ĐOÀN 15 LỚP</span>
                          <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-700 text-[11px] font-bold">
                            Năm học 2026 - 2027
                          </span>
                        </h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        Quản lý cơ cấu Ban Cán sự (Lớp trưởng, Lớp phó HT) và BCH Chi đoàn (Bí thư, Phó Bí thư) cùng phân quyền tài khoản hệ thống.
                      </p>
                    </div>

                    {/* Action Buttons: Excel Export, Sync Accounts, Add Class */}
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        onClick={exportCadreToExcel}
                        className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
                        title="Xuất bảng danh sách Ban cán sự 15 lớp ra file Excel (.xlsx)"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Xuất File Excel</span>
                      </button>

                      <button
                        onClick={handleSyncCadreAccounts}
                        className="px-3.5 py-2 rounded-xl bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
                        title="Tự động đồng bộ và cấp quyền tài khoản Youth Secretary / User cho tất cả cán bộ lớp"
                      >
                        <Sparkles className="w-4 h-4" />
                        <span>Đồng Bộ Tài Khoản</span>
                      </button>

                      <button
                        onClick={() => {
                          setEditingClass(null);
                          setClassForm({
                            id: `10/${classes.filter(c => c.grade === 10).length + 1}`,
                            name: `Lớp 10/${classes.filter(c => c.grade === 10).length + 1}`,
                            grade: 10,
                            gvcnName: '',
                            gvcnId: '',
                            classPresidentName: '',
                            classPresidentPhone: '',
                            academicVicePresidentName: '',
                            academicVicePresidentPhone: '',
                            bithuName: '',
                            bithuId: `bithu_10_${classes.filter(c => c.grade === 10).length + 1}`,
                            bithuPhone: '',
                            deputySecretaryName: '',
                            deputySecretaryPhone: '',
                            totalStudents: 40,
                            unionMembers: 30
                          });
                          setIsClassModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Thêm Lớp Mới</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Counters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800/80 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Tổng số lớp:</span>
                      <strong className="text-white text-sm font-mono">{classes.length} Lớp</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Tổng sĩ số:</span>
                      <strong className="text-sky-300 text-sm font-mono">{totalStudentsCount} HS</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Đoàn viên:</span>
                      <strong className="text-amber-300 text-sm font-mono">{totalUnionCount} ĐV</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                      <span className="text-slate-400 font-bold">Cán bộ lớp:</span>
                      <strong className="text-emerald-300 text-sm font-mono">{classes.length * 4} Cán bộ</strong>
                    </div>
                  </div>
                </div>

                {/* Filter & View Switcher Toolbar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  {/* Grade Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto">
                    <button
                      onClick={() => setClassGradeTab('ALL')}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                        classGradeTab === 'ALL'
                          ? 'bg-blue-600 text-white shadow-glow'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      Tất cả ({classes.length} Lớp)
                    </button>
                    <button
                      onClick={() => setClassGradeTab(10)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                        classGradeTab === 10
                          ? 'bg-sky-600 text-white shadow-glow'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      Khối 10 ({classes.filter(c => c.grade === 10).length} Lớp)
                    </button>
                    <button
                      onClick={() => setClassGradeTab(11)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                        classGradeTab === 11
                          ? 'bg-emerald-600 text-white shadow-glow'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      Khối 11 ({classes.filter(c => c.grade === 11).length} Lớp)
                    </button>
                    <button
                      onClick={() => setClassGradeTab(12)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 ${
                        classGradeTab === 12
                          ? 'bg-purple-600 text-white shadow-glow'
                          : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                    >
                      Khối 12 ({classes.filter(c => c.grade === 12).length} Lớp)
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Search Input */}
                    <div className="relative min-w-[220px] flex-1 sm:flex-initial">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        value={classSearchQuery}
                        onChange={(e) => setClassSearchQuery(e.target.value)}
                        placeholder="Tìm lớp, cán bộ lớp, GVCN..."
                        className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-blue-500"
                      />
                    </div>

                    {/* View Switcher: Table vs Cards */}
                    <div className="flex items-center bg-slate-900 p-0.5 rounded-xl border border-slate-700 font-bold shrink-0">
                      <button
                        onClick={() => setClassViewMode('table')}
                        className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                          classViewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Xem chế độ bảng danh sách"
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>Bảng</span>
                      </button>
                      <button
                        onClick={() => setClassViewMode('cards')}
                        className={`px-2.5 py-1 rounded-lg flex items-center gap-1 transition-all ${
                          classViewMode === 'cards' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                        title="Xem chế độ thẻ"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        <span>Thẻ</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* VIEW 1: OFFICIAL CADRE TABLE VIEW */}
                {classViewMode === 'table' && (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/80 shadow-2xl">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-800 text-[11px] uppercase tracking-wider">
                          <th className="p-3 text-center w-12 text-slate-400 font-black">TT</th>
                          <th className="p-3 text-center w-16 font-black text-amber-400">Lớp</th>
                          <th className="p-3 font-black text-blue-400">Lớp Trưởng</th>
                          <th className="p-3 font-black text-sky-400">Lớp Phó Học Tập</th>
                          <th className="p-3 font-black text-emerald-400">Bí Thư Chi Đoàn</th>
                          <th className="p-3 font-black text-purple-400">Phó Bí Thư</th>
                          <th className="p-3 font-black text-amber-300">GVCN</th>
                          <th className="p-3 text-center font-black text-slate-300">Sĩ Số / ĐV</th>
                          <th className="p-3 text-right font-black">Thao Tác</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {sortedAndFilteredClasses.length === 0 ? (
                          <tr>
                            <td colSpan={9} className="p-8 text-center text-slate-500">
                              Không tìm thấy lớp học nào phù hợp bộ lọc!
                            </td>
                          </tr>
                        ) : (
                          sortedAndFilteredClasses.map((c, index) => (
                            <tr key={c.id} className="hover:bg-slate-800/40 transition-colors">
                              {/* TT */}
                              <td className="p-3 text-center font-mono font-bold text-slate-400">
                                <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                                  {index + 1}
                                </span>
                              </td>

                              {/* Lớp */}
                              <td className="p-3 text-center">
                                <span className="px-2.5 py-1 rounded-xl bg-blue-950/80 border border-blue-700 text-blue-300 font-extrabold text-xs font-mono">
                                  {c.id}
                                </span>
                              </td>

                              {/* Lớp Trưởng */}
                              <td className="p-3">
                                <div className="font-bold text-white whitespace-nowrap">
                                  {c.classPresidentName || <span className="text-slate-500 italic">Chưa phân công</span>}
                                </div>
                                {c.classPresidentPhone && (
                                  <a
                                    href={`tel:${c.classPresidentPhone}`}
                                    className="text-[11px] text-blue-400 hover:text-blue-300 font-mono flex items-center gap-1 mt-0.5"
                                  >
                                    <span>📞 {c.classPresidentPhone}</span>
                                  </a>
                                )}
                              </td>

                              {/* Lớp Phó Học Tập */}
                              <td className="p-3">
                                <div className="font-bold text-slate-200 whitespace-nowrap">
                                  {c.academicVicePresidentName || <span className="text-slate-500 italic">Chưa phân công</span>}
                                </div>
                                {c.academicVicePresidentPhone && (
                                  <a
                                    href={`tel:${c.academicVicePresidentPhone}`}
                                    className="text-[11px] text-sky-400 hover:text-sky-300 font-mono flex items-center gap-1 mt-0.5"
                                  >
                                    <span>📞 {c.academicVicePresidentPhone}</span>
                                  </a>
                                )}
                              </td>

                              {/* Bí Thư Chi Đoàn */}
                              <td className="p-3">
                                <div className="font-bold text-emerald-300 whitespace-nowrap flex items-center gap-1.5">
                                  <span>{c.bithuName || <span className="text-slate-500 italic">Chưa phân công</span>}</span>
                                  <span className="px-1.5 py-0.2 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[9px] font-mono font-bold">
                                    Bí thư
                                  </span>
                                </div>
                                {c.bithuPhone && (
                                  <a
                                    href={`tel:${c.bithuPhone}`}
                                    className="text-[11px] text-emerald-400 hover:text-emerald-300 font-mono flex items-center gap-1 mt-0.5"
                                  >
                                    <span>📞 {c.bithuPhone}</span>
                                  </a>
                                )}
                              </td>

                              {/* Phó Bí Thư */}
                              <td className="p-3">
                                <div className="font-bold text-purple-200 whitespace-nowrap">
                                  {c.deputySecretaryName || <span className="text-slate-500 italic">Chưa phân công</span>}
                                </div>
                                {c.deputySecretaryPhone && (
                                  <a
                                    href={`tel:${c.deputySecretaryPhone}`}
                                    className="text-[11px] text-purple-400 hover:text-purple-300 font-mono flex items-center gap-1 mt-0.5"
                                  >
                                    <span>📞 {c.deputySecretaryPhone}</span>
                                  </a>
                                )}
                              </td>

                              {/* GVCN */}
                              <td className="p-3">
                                <span className="font-bold text-amber-300 whitespace-nowrap">
                                  {c.gvcnName || <span className="text-slate-500 italic">Chưa phân công</span>}
                                </span>
                              </td>

                              {/* Sĩ số / Đoàn viên */}
                              <td className="p-3 text-center whitespace-nowrap">
                                <div className="font-mono text-xs">
                                  <strong className="text-white">{c.totalStudents}</strong>
                                  <span className="text-slate-500 mx-1">/</span>
                                  <strong className="text-amber-300">{c.unionMembers} ĐV</strong>
                                </div>
                              </td>

                              {/* Thao tác */}
                              <td className="p-3 text-right whitespace-nowrap">
                                <div className="flex items-center justify-end gap-1">
                                  <button
                                    onClick={() => {
                                      setEditingClass(c);
                                      setClassForm({
                                        id: c.id,
                                        name: c.name,
                                        grade: c.grade,
                                        gvcnName: c.gvcnName,
                                        gvcnId: c.gvcnId,
                                        classPresidentName: c.classPresidentName || '',
                                        classPresidentPhone: c.classPresidentPhone || '',
                                        academicVicePresidentName: c.academicVicePresidentName || '',
                                        academicVicePresidentPhone: c.academicVicePresidentPhone || '',
                                        bithuName: c.bithuName || '',
                                        bithuId: c.bithuId || `bithu_${c.id.replace('/', '_')}`,
                                        bithuPhone: c.bithuPhone || '',
                                        deputySecretaryName: c.deputySecretaryName || '',
                                        deputySecretaryPhone: c.deputySecretaryPhone || '',
                                        totalStudents: c.totalStudents,
                                        unionMembers: c.unionMembers
                                      });
                                      setIsClassModalOpen(true);
                                    }}
                                    title="Sửa thông tin lớp & Ban Cán sự"
                                    className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-700 hover:border-amber-600 flex items-center gap-1 text-[11px] font-bold"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Sửa</span>
                                  </button>

                                  <button
                                    onClick={() => archiveClass(c.id, !c.isArchived)}
                                    title={c.isArchived ? 'Khôi phục lớp' : 'Lưu trữ lớp'}
                                    className="p-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700"
                                  >
                                    <Archive className="w-3.5 h-3.5" />
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`Bạn có chắc chắn muốn xóa ${c.name}?`)) {
                                        const res = deleteClass(c.id);
                                        alert(res.message);
                                      }
                                    }}
                                    title="Xóa lớp"
                                    className="p-1 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-700 hover:border-rose-700"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* VIEW 2: CLASS CARDS VIEW */}
                {classViewMode === 'cards' && (
                  <div className="space-y-6">
                    {[10, 11, 12].filter(grade => classGradeTab === 'ALL' || classGradeTab === grade).map(grade => {
                      const gradeClasses = sortedAndFilteredClasses.filter(c => c.grade === grade);
                      if (gradeClasses.length === 0) return null;

                      const gradeColors = {
                        10: {
                          badge: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
                          border: 'border-sky-500/20',
                          dot: 'bg-sky-400'
                        },
                        11: {
                          badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
                          border: 'border-emerald-500/20',
                          dot: 'bg-emerald-400'
                        },
                        12: {
                          badge: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
                          border: 'border-purple-500/20',
                          dot: 'bg-purple-400'
                        }
                      }[grade as 10 | 11 | 12];

                      const totalGradeStudents = gradeClasses.reduce((acc, c) => acc + (c.totalStudents || 0), 0);
                      const totalGradeUnion = gradeClasses.reduce((acc, c) => acc + (c.unionMembers || 0), 0);

                      return (
                        <div key={grade} className={`p-4 rounded-3xl bg-slate-950/60 border ${gradeColors.border} space-y-3.5`}>
                          {/* Grade Section Title */}
                          <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
                            <div className="flex items-center gap-2.5">
                              <span className={`w-3 h-3 rounded-full ${gradeColors.dot} shadow-glow`}></span>
                              <h3 className="text-sm font-black text-white tracking-wide uppercase">
                                KHỐI {grade} ({gradeClasses.length} LỚP: {grade}/1 - {grade}/{gradeClasses.length})
                              </h3>
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${gradeColors.badge}`}>
                                Khối {grade}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-400">
                              <span>Tổng sĩ số: <strong className="text-white">{totalGradeStudents} HS</strong></span>
                              <span>•</span>
                              <span>Đoàn viên: <strong className="text-amber-300">{totalGradeUnion} ĐV</strong></span>
                            </div>
                          </div>

                          {/* Class Cards Grid */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
                            {gradeClasses.map(c => (
                              <div
                                key={c.id}
                                className={`p-4 rounded-2xl border space-y-3 text-xs transition-all ${
                                  c.isArchived
                                    ? 'bg-slate-950/40 border-slate-800 opacity-60'
                                    : 'bg-slate-950 border-slate-800 hover:border-slate-700 hover:shadow-card'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <span className="font-extrabold text-white text-sm">{c.name}</span>
                                  <span className="px-2 py-0.5 rounded bg-slate-900 text-amber-400 font-mono text-[10px] font-bold">
                                    Khối {c.grade}
                                  </span>
                                </div>

                                <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80">
                                  <div className="flex justify-between text-slate-300">
                                    <span className="text-slate-400">GVCN:</span>
                                    <strong className="text-amber-300">{c.gvcnName || 'Chưa phân công'}</strong>
                                  </div>
                                  <div className="flex justify-between text-slate-300">
                                    <span className="text-slate-400">Lớp Trưởng:</span>
                                    <span className="font-bold text-blue-300">
                                      {c.classPresidentName || '—'} {c.classPresidentPhone ? `(${c.classPresidentPhone})` : ''}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-slate-300">
                                    <span className="text-slate-400">Lớp Phó HT:</span>
                                    <span className="font-bold text-sky-300">
                                      {c.academicVicePresidentName || '—'} {c.academicVicePresidentPhone ? `(${c.academicVicePresidentPhone})` : ''}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-slate-300">
                                    <span className="text-slate-400">Bí Thư:</span>
                                    <span className="font-bold text-emerald-300">
                                      {c.bithuName || '—'} {c.bithuPhone ? `(${c.bithuPhone})` : ''}
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-slate-300">
                                    <span className="text-slate-400">Phó Bí Thư:</span>
                                    <span className="font-bold text-purple-300">
                                      {c.deputySecretaryName || '—'} {c.deputySecretaryPhone ? `(${c.deputySecretaryPhone})` : ''}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex justify-between text-slate-400 pt-1 border-t border-slate-900 text-[11px]">
                                  <span>Sĩ số: <strong>{c.totalStudents} HS</strong></span>
                                  <span>Đoàn viên: <strong>{c.unionMembers} ĐV</strong></span>
                                </div>

                                <div className="pt-2 flex justify-end gap-1.5 border-t border-slate-900">
                                  <button
                                    onClick={() => {
                                      setEditingClass(c);
                                      setClassForm({
                                        id: c.id,
                                        name: c.name,
                                        grade: c.grade,
                                        gvcnName: c.gvcnName,
                                        gvcnId: c.gvcnId,
                                        classPresidentName: c.classPresidentName || '',
                                        classPresidentPhone: c.classPresidentPhone || '',
                                        academicVicePresidentName: c.academicVicePresidentName || '',
                                        academicVicePresidentPhone: c.academicVicePresidentPhone || '',
                                        bithuName: c.bithuName || '',
                                        bithuId: c.bithuId || `bithu_${c.id.replace('/', '_')}`,
                                        bithuPhone: c.bithuPhone || '',
                                        deputySecretaryName: c.deputySecretaryName || '',
                                        deputySecretaryPhone: c.deputySecretaryPhone || '',
                                        totalStudents: c.totalStudents,
                                        unionMembers: c.unionMembers
                                      });
                                      setIsClassModalOpen(true);
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 flex items-center gap-1 text-[11px]"
                                  >
                                    <Edit3 className="w-3 h-3" />
                                    <span>Sửa</span>
                                  </button>

                                  <button
                                    onClick={() => archiveClass(c.id, !c.isArchived)}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white flex items-center gap-1 text-[11px]"
                                  >
                                    <Archive className="w-3 h-3" />
                                    <span>{c.isArchived ? 'Khôi phục' : 'Lưu trữ'}</span>
                                  </button>

                                  <button
                                    onClick={() => {
                                      if (confirm(`Bạn có chắc chắn muốn xóa ${c.name}?`)) {
                                        const res = deleteClass(c.id);
                                        alert(res.message);
                                      }
                                    }}
                                    className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 flex items-center gap-1 text-[11px]"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                    <span>Xóa</span>
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })()}

          {/* Master Sub-Tab 3: DUTIES */}
          {operationsSubTab === 'duties' && (() => {
            const currentWeekDuties = duties.filter(d => d.weekNumber === dutyWeekFilter);
            
            // Search and filters
            const filteredDuties = currentWeekDuties.filter(d => {
              const matchSession = dutySessionFilter === 'ALL' || d.session === dutySessionFilter || (!d.session && dutySessionFilter === 'Sáng');
              const matchDay = dutyDayFilter === 'ALL' || d.day === dutyDayFilter;
              const q = dutySearch.toLowerCase().trim();
              const matchSearch = !q || 
                d.auditorName.toLowerCase().includes(q) || 
                d.auditorClass.toLowerCase().includes(q) || 
                (d.targetClasses && d.targetClasses.toLowerCase().includes(q)) || 
                d.zone.toLowerCase().includes(q) ||
                d.day.toLowerCase().includes(q);
              return matchSession && matchDay && matchSearch;
            });

            const morningDuties = filteredDuties.filter(d => (d.session || 'Sáng') === 'Sáng');
            const afternoonDuties = filteredDuties.filter(d => d.session === 'Chiều');

            const handleExportExcel = () => {
              const rows = currentWeekDuties.map((d, index) => ({
                'STT': index + 1,
                'Tuần': `Tuần ${d.weekNumber}`,
                'Buổi': d.session || 'Sáng',
                'Thời Gian': d.day === 'T2' ? 'Thứ 2' : d.day === 'T3' ? 'Thứ 3' : d.day === 'T4' ? 'Thứ 4' : d.day === 'T5' ? 'Thứ 5' : d.day === 'T6' ? 'Thứ 6' : 'Thứ 7',
                'Lớp Trực': d.auditorClass,
                'Người Trực (Cờ đỏ)': d.auditorName,
                'Chấm Điểm Lớp': d.targetClasses || '',
                'Khu Vực Trực': d.zone,
                'Khung Giờ': d.shiftTime
              }));
              const ws = XLSX.utils.json_to_sheet(rows);
              const wb = XLSX.utils.book_new();
              XLSX.utils.book_append_sheet(wb, ws, `LichTruc_Tuan_${dutyWeekFilter}`);
              XLSX.writeFile(wb, `Lich_Phan_Cong_Truc_Co_Do_Tuan_${dutyWeekFilter}.xlsx`);
            };

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
              <div className="space-y-6 animate-fadeIn">
                {/* Main Header & Controls Card */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="p-1.5 rounded-lg bg-red-600/20 text-red-400 border border-red-500/30 font-bold text-sm">🚩</span>
                        <h4 className="text-base font-black text-white uppercase tracking-tight">
                          LỊCH PHÂN CÔNG TRỰC CỜ ĐỎ - NĂM HỌC 2026 - 2027
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-red-950 text-red-400 border border-red-800 text-xs font-bold">
                          Tuần {dutyWeekFilter}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 border border-slate-700 text-xs font-bold">
                          {currentWeekDuties.length} ca trực / tuần
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        BCH Đoàn Trường THPT Quang Trung – Đông Giang • Phân công 30 cán bộ cờ đỏ giám sát 18 lớp học
                      </p>
                    </div>

                    {/* Action & View Mode Buttons */}
                    <div className="flex flex-wrap items-center gap-2">
                      {/* View mode toggle */}
                      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs">
                        <button
                          onClick={() => setDutyViewMode('official')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                            dutyViewMode === 'official' ? 'bg-red-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>Văn Bản Chính Thức</span>
                        </button>
                        <button
                          onClick={() => setDutyViewMode('matrix')}
                          className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
                            dutyViewMode === 'matrix' ? 'bg-red-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <Layers className="w-3.5 h-3.5" />
                          <span>Ma Trận Khu Vực</span>
                        </button>
                      </div>

                      {/* Week selector */}
                      <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
                        <span className="text-slate-400 mr-2 font-bold">Tuần:</span>
                        <select
                          value={dutyWeekFilter}
                          onChange={(e) => setDutyWeekFilter(Number(e.target.value))}
                          className="bg-transparent text-amber-400 font-bold outline-none cursor-pointer"
                        >
                          {weeksConfig.map(w => (
                            <option key={w.weekNumber} value={w.weekNumber} className="bg-slate-900 text-white">
                              {w.title} {w.isCurrent ? '(Hiện tại)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          setEditingDuty(null);
                          setDutyForm({
                            weekNumber: dutyWeekFilter,
                            day: 'T2',
                            zone: zones[0]?.name || 'Phòng 8 (tầng 2), Phòng 7 (tầng 2)',
                            auditorId: auditors[0]?.id || 'codo_12_1_1',
                            auditorName: auditors[0]?.name || 'Đặng Cát Diệu',
                            auditorClass: auditors[0]?.classId || '12/1',
                            shiftTime: '06:45 - 07:15 & 11:15 - 11:45',
                            isLiveNow: true,
                            targetClasses: '10/1, 10/2',
                            session: 'Sáng'
                          });
                          setIsDutyModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Phân Công Mới</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn áp dụng lịch phân công chuẩn 44 ca cho Tuần ${dutyWeekFilter}?`)) {
                            generateDefaultDutiesForWeek(dutyWeekFilter);
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Tự động tạo lịch chuẩn 44 ca (32 sáng + 12 chiều) đúng theo văn bản Đoàn Trường"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tạo Lịch Chuẩn (44 ca)</span>
                      </button>

                      <button
                        onClick={handleExportExcel}
                        className="px-3.5 py-2 rounded-xl bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 hover:text-white border border-emerald-700/60 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="Xuất bảng phân công ra file Excel"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Xuất Excel</span>
                      </button>

                      <button
                        onClick={() => window.print()}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                        title="In văn bản phân công lịch trực"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>In Lịch Trực</span>
                      </button>

                      <button
                        onClick={() => {
                          setCopyTargetWeek(dutyWeekFilter + 1);
                          setIsCopyDutyModalOpen(true);
                        }}
                        className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span>Sao Chép Tuần</span>
                      </button>
                    </div>
                  </div>

                  {/* Filter & Search Toolbar */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={dutySearch}
                        onChange={(e) => setDutySearch(e.target.value)}
                        placeholder="Tìm cờ đỏ, lớp trực, lớp chấm, phòng..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-red-500"
                      />
                      {dutySearch && (
                        <button onClick={() => setDutySearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Filter Buổi */}
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                      <span className="text-slate-400 mr-2 font-bold">Buổi:</span>
                      <select
                        value={dutySessionFilter}
                        onChange={(e) => setDutySessionFilter(e.target.value as any)}
                        className="bg-transparent text-white font-bold outline-none cursor-pointer flex-1"
                      >
                        <option value="ALL" className="bg-slate-900">Tất cả các buổi ({currentWeekDuties.length})</option>
                        <option value="Sáng" className="bg-slate-900">Buổi Sáng (32 ca)</option>
                        <option value="Chiều" className="bg-slate-900">Buổi Chiều (12 ca)</option>
                      </select>
                    </div>

                    {/* Filter Thứ */}
                    <div className="flex items-center bg-slate-900 border border-slate-700 rounded-xl px-2.5 py-1 text-xs">
                      <span className="text-slate-400 mr-2 font-bold">Thứ:</span>
                      <select
                        value={dutyDayFilter}
                        onChange={(e) => setDutyDayFilter(e.target.value as any)}
                        className="bg-transparent text-white font-bold outline-none cursor-pointer flex-1"
                      >
                        <option value="ALL" className="bg-slate-900">Tất cả các ngày (T2 - T7)</option>
                        {dayOrder.map(d => (
                          <option key={d} value={d} className="bg-slate-900">
                            {getDayLabel(d)} ({currentWeekDuties.filter(x => x.day === d).length} ca)
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Quick Stats Counter */}
                    <div className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px]">
                      <span className="text-slate-400">Đang hiển thị:</span>
                      <span className="font-bold text-amber-400">{filteredDuties.length} / {currentWeekDuties.length} ca</span>
                    </div>
                  </div>
                </div>

                {/* ================= VIEW MODE 1: OFFICIAL DOCUMENT TABLE ================= */}
                {dutyViewMode === 'official' && (
                  <div className="space-y-6">
                    {/* Document Header Representation */}
                    <div className="glass-panel p-6 rounded-3xl border border-slate-800 bg-slate-950/90 text-center space-y-2 relative overflow-hidden">
                      <div className="absolute -top-12 -right-12 w-48 h-48 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
                      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800/80 pb-4 text-xs">
                        <div className="text-left font-bold text-slate-300">
                          <p className="uppercase">ĐOÀN XÃ ĐÔNG GIANG</p>
                          <p className="uppercase text-red-400 font-extrabold">BCH ĐOÀN TRƯỜNG THPT QUANG TRUNG – ĐÔNG GIANG</p>
                          <p className="text-slate-500 font-normal">***</p>
                        </div>
                        <div className="text-right font-bold text-slate-300">
                          <p className="uppercase text-red-400 font-extrabold">ĐOÀN TNCS HỒ CHÍ MINH</p>
                          <p className="text-slate-400 font-normal">Đông Giang, Năm học 2026 - 2027</p>
                        </div>
                      </div>

                      <div className="pt-2 pb-1">
                        <h3 className="text-lg sm:text-xl font-black text-white tracking-wide uppercase">
                          LỊCH PHÂN CÔNG TRỰC CỜ ĐỎ
                        </h3>
                        <p className="text-amber-400 text-xs font-bold mt-0.5">
                          Áp Dụng: Tuần {dutyWeekFilter} (Năm học 2026 - 2027)
                        </p>
                      </div>
                    </div>

                    {/* PART I: BUỔI SÁNG */}
                    {(dutySessionFilter === 'ALL' || dutySessionFilter === 'Sáng') && (
                      <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
                            <h4 className="text-sm font-black text-amber-400 uppercase tracking-wide">
                              I. LỊCH TRỰC PHÂN CÔNG BUỔI SÁNG (32 ca / tuần)
                            </h4>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Khung giờ: 06:45 - 07:15 & 11:15 - 11:45
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-700">
                                <th className="p-3 font-bold w-24 text-center">Thời Gian</th>
                                <th className="p-3 font-bold w-20 text-center">Lớp Trực</th>
                                <th className="p-3 font-bold">Người Trực (Cờ Đỏ)</th>
                                <th className="p-3 font-bold w-32 text-center">Chấm Điểm Lớp</th>
                                <th className="p-3 font-bold">Khu Vực Trực</th>
                                <th className="p-3 font-bold w-28 text-center">Trạng Thái</th>
                                <th className="p-3 font-bold w-24 text-center">Thao Tác</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {morningDuties.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="p-6 text-center text-slate-500">
                                    Không tìm thấy ca trực buổi sáng nào khớp với bộ lọc.
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
                                          className="p-3 font-bold text-center text-amber-300 bg-slate-900/60 border-r border-slate-800 align-middle"
                                        >
                                          <span className="text-sm font-extrabold block">{getDayLabel(day)}</span>
                                          <span className="text-[10px] text-slate-400 block font-normal">({dayShifts.length} ca)</span>
                                        </td>
                                      )}
                                      <td className="p-3 font-bold text-center text-white bg-slate-900/20">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-amber-400 font-bold border border-slate-700">
                                          {shift.auditorClass}
                                        </span>
                                      </td>
                                      <td className="p-3 font-bold text-white">
                                        <div className="flex items-center gap-2">
                                          <span className="text-amber-400">👤</span>
                                          <span>{shift.auditorName}</span>
                                        </div>
                                      </td>
                                      <td className="p-3 font-bold text-center">
                                        <span className="px-2 py-1 rounded-lg bg-red-950/80 text-red-300 border border-red-800/80 text-[11px] font-bold">
                                          {shift.targetClasses || 'Toàn trường'}
                                        </span>
                                      </td>
                                      <td className="p-3 text-slate-300 font-medium">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs">📍</span>
                                          <span>{shift.zone}</span>
                                        </div>
                                      </td>
                                      <td className="p-3 text-center">
                                        {shift.isLiveNow ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                            Đang trực
                                          </span>
                                        ) : (
                                          <span className="text-slate-500 text-[10px]">Đã lên lịch</span>
                                        )}
                                      </td>
                                      <td className="p-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <button
                                            onClick={() => {
                                              setEditingDuty(shift);
                                              setDutyForm({
                                                weekNumber: shift.weekNumber,
                                                day: shift.day,
                                                zone: shift.zone,
                                                auditorId: shift.auditorId,
                                                auditorName: shift.auditorName,
                                                auditorClass: shift.auditorClass,
                                                shiftTime: shift.shiftTime,
                                                isLiveNow: !!shift.isLiveNow,
                                                targetClasses: shift.targetClasses || '',
                                                session: shift.session || 'Sáng'
                                              });
                                              setIsDutyModalOpen(true);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                                            title="Sửa ca trực"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (confirm(`Xóa phân công của ${shift.auditorName} lớp ${shift.auditorClass} (${getDayLabel(shift.day)})?`)) {
                                                deleteDutyAssignment(shift.id);
                                              }
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                                            title="Xóa ca trực"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
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

                    {/* PART II: BUỔI CHIỀU */}
                    {(dutySessionFilter === 'ALL' || dutySessionFilter === 'Chiều') && (
                      <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-xl space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-pulse" />
                            <h4 className="text-sm font-black text-indigo-400 uppercase tracking-wide">
                              II. LỊCH TRỰC PHÂN CÔNG BUỔI CHIỀU (12 ca: Thứ 2, Thứ 3, Thứ 4, Thứ 6)
                            </h4>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            Khung giờ: 12:45 - 13:15 & 16:45 - 17:15
                          </span>
                        </div>

                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="bg-slate-900/90 text-slate-300 border-b border-slate-700">
                                <th className="p-3 font-bold w-24 text-center">Thời Gian</th>
                                <th className="p-3 font-bold w-20 text-center">Lớp Trực</th>
                                <th className="p-3 font-bold">Người Trực (Cờ Đỏ)</th>
                                <th className="p-3 font-bold w-32 text-center">Chấm Điểm Lớp</th>
                                <th className="p-3 font-bold">Khu Vực Trực</th>
                                <th className="p-3 font-bold w-28 text-center">Trạng Thái</th>
                                <th className="p-3 font-bold w-24 text-center">Thao Tác</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {afternoonDuties.length === 0 ? (
                                <tr>
                                  <td colSpan={7} className="p-6 text-center text-slate-500">
                                    Không tìm thấy ca trực buổi chiều nào khớp với bộ lọc.
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
                                          className="p-3 font-bold text-center text-indigo-300 bg-slate-900/60 border-r border-slate-800 align-middle"
                                        >
                                          <span className="text-sm font-extrabold block">{getDayLabel(day)}</span>
                                          <span className="text-[10px] text-slate-400 block font-normal">({dayShifts.length} ca)</span>
                                        </td>
                                      )}
                                      <td className="p-3 font-bold text-center text-white bg-slate-900/20">
                                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-indigo-300 font-bold border border-slate-700">
                                          {shift.auditorClass}
                                        </span>
                                      </td>
                                      <td className="p-3 font-bold text-white">
                                        <div className="flex items-center gap-2">
                                          <span className="text-indigo-400">👤</span>
                                          <span>{shift.auditorName}</span>
                                        </div>
                                      </td>
                                      <td className="p-3 font-bold text-center">
                                        <span className="px-2 py-1 rounded-lg bg-indigo-950/80 text-indigo-300 border border-indigo-800/80 text-[11px] font-bold">
                                          {shift.targetClasses || 'Toàn trường'}
                                        </span>
                                      </td>
                                      <td className="p-3 text-slate-300 font-medium">
                                        <div className="flex items-center gap-1.5">
                                          <span className="text-xs">📍</span>
                                          <span>{shift.zone}</span>
                                        </div>
                                      </td>
                                      <td className="p-3 text-center">
                                        {shift.isLiveNow ? (
                                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] font-bold">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                                            Đang trực
                                          </span>
                                        ) : (
                                          <span className="text-slate-500 text-[10px]">Đã lên lịch</span>
                                        )}
                                      </td>
                                      <td className="p-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                          <button
                                            onClick={() => {
                                              setEditingDuty(shift);
                                              setDutyForm({
                                                weekNumber: shift.weekNumber,
                                                day: shift.day,
                                                zone: shift.zone,
                                                auditorId: shift.auditorId,
                                                auditorName: shift.auditorName,
                                                auditorClass: shift.auditorClass,
                                                shiftTime: shift.shiftTime,
                                                isLiveNow: !!shift.isLiveNow,
                                                targetClasses: shift.targetClasses || '',
                                                session: shift.session || 'Chiều'
                                              });
                                              setIsDutyModalOpen(true);
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                                            title="Sửa ca trực"
                                          >
                                            <Edit3 className="w-3.5 h-3.5" />
                                          </button>
                                          <button
                                            onClick={() => {
                                              if (confirm(`Xóa phân công của ${shift.auditorName} lớp ${shift.auditorClass} (${getDayLabel(shift.day)})?`)) {
                                                deleteDutyAssignment(shift.id);
                                              }
                                            }}
                                            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-rose-400 transition-colors"
                                            title="Xóa ca trực"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
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
                )}

                {/* ================= VIEW MODE 2: MATRIX BY ZONE & DAY ================= */}
                {dutyViewMode === 'matrix' && (
                  <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <h4 className="text-xs font-black text-white uppercase">
                        MA TRẬN PHÂN BỔ CA TRỰC THEO KHU VỰC VÀ THỨ TRONG TUẦN
                      </h4>
                      <span className="text-[11px] text-slate-400">
                        Hiển thị tất cả ca trực Sáng / Chiều theo khu vực
                      </span>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                            <th className="p-3 font-bold w-52">Khu Vực Giám Sát</th>
                            {dayOrder.map(d => (
                              <th key={d} className="p-3 font-bold text-center">
                                <span className="text-amber-400">{d}</span>
                                <span className="block text-[10px] text-slate-400 font-normal">
                                  {getDayLabel(d)}
                                </span>
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60">
                          {zones.map(zoneObj => {
                            const zone = zoneObj.name;
                            return (
                              <tr key={zoneObj.id} className="hover:bg-slate-800/20">
                                <td className="p-3 font-bold text-white bg-slate-900/80 border-r border-slate-800/80 align-top">
                                  <div className="flex items-center gap-2">
                                    <span className="p-1.5 rounded-lg bg-slate-800 text-amber-400 text-sm">
                                      {zoneObj.icon || '📍'}
                                    </span>
                                    <div>
                                      <p className="font-bold text-white">{zone}</p>
                                      {zoneObj.description && (
                                        <p className="text-[10px] text-slate-400 font-normal">{zoneObj.description}</p>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                {dayOrder.map(day => {
                                  const cellShifts = currentWeekDuties.filter(d => 
                                    d.day === day && (d.zone === zone || d.zone.includes(zone) || zone.includes(d.zone))
                                  );

                                  return (
                                    <td key={day} className="p-2 align-top">
                                      <div className="space-y-1.5">
                                        {cellShifts.map(shift => (
                                          <div
                                            key={shift.id}
                                            className="p-2 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all space-y-1 text-[11px]"
                                          >
                                            <div className="flex items-center justify-between gap-1">
                                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                                shift.session === 'Chiều' 
                                                  ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' 
                                                  : 'bg-amber-950 text-amber-300 border border-amber-800'
                                              }`}>
                                                {shift.session || 'Sáng'}
                                              </span>
                                              <div className="flex items-center gap-0.5">
                                                <button
                                                  onClick={() => {
                                                    setEditingDuty(shift);
                                                    setDutyForm({
                                                      weekNumber: shift.weekNumber,
                                                      day: shift.day,
                                                      zone: shift.zone,
                                                      auditorId: shift.auditorId,
                                                      auditorName: shift.auditorName,
                                                      auditorClass: shift.auditorClass,
                                                      shiftTime: shift.shiftTime,
                                                      isLiveNow: !!shift.isLiveNow,
                                                      targetClasses: shift.targetClasses || '',
                                                      session: shift.session || 'Sáng'
                                                    });
                                                    setIsDutyModalOpen(true);
                                                  }}
                                                  className="p-0.5 rounded text-slate-400 hover:text-amber-400"
                                                >
                                                  <Edit3 className="w-3 h-3" />
                                                </button>
                                                <button
                                                  onClick={() => {
                                                    if (confirm(`Xóa ca trực của ${shift.auditorName}?`)) {
                                                      deleteDutyAssignment(shift.id);
                                                    }
                                                  }}
                                                  className="p-0.5 rounded text-slate-400 hover:text-rose-400"
                                                >
                                                  <Trash2 className="w-3 h-3" />
                                                </button>
                                              </div>
                                            </div>
                                            <p className="font-bold text-white truncate">{shift.auditorName}</p>
                                            <p className="text-[10px] text-amber-400 font-semibold">Lớp {shift.auditorClass}</p>
                                            {shift.targetClasses && (
                                              <p className="text-[9px] text-red-300 font-mono truncate">Chấm: {shift.targetClasses}</p>
                                            )}
                                          </div>
                                        ))}

                                        <button
                                          onClick={() => {
                                            setEditingDuty(null);
                                            setDutyForm({
                                              weekNumber: dutyWeekFilter,
                                              day: day,
                                              zone: zone,
                                              auditorId: auditors[0]?.id || 'codo_12_1_1',
                                              auditorName: auditors[0]?.name || 'Đặng Cát Diệu',
                                              auditorClass: auditors[0]?.classId || '12/1',
                                              shiftTime: '06:45 - 07:15 & 11:15 - 11:45',
                                              isLiveNow: true,
                                              targetClasses: '10/1, 10/2',
                                              session: 'Sáng'
                                            });
                                            setIsDutyModalOpen(true);
                                          }}
                                          className="w-full py-2 border border-dashed border-slate-800 hover:border-slate-600 rounded-xl text-[10px] text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 flex items-center justify-center transition-all"
                                        >
                                          <span>+ Thêm ca</span>
                                        </button>
                                      </div>
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* AUDITORS MEMBERS & ZONES CRUD SECTION */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Auditors List CRUD */}
                <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-black text-white">ĐỘI CỜ ĐỎ GIÁM SÁT ({auditors.length} cán bộ)</h4>
                      <p className="text-[11px] text-slate-400">Danh sách lực lượng cờ đỏ được dùng để nạp dữ liệu phân công lịch trực</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingAuditor(null);
                        setAuditorForm({
                          name: '',
                          classId: '11/2',
                          phone: '',
                          assignedZone: 'Khối 10',
                          defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45',
                          isActive: true
                        });
                        setIsAuditorModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 shadow-glow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Cán Bộ</span>
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                    {auditors.map(auditor => (
                      <div
                        key={auditor.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex items-center justify-between gap-3 text-xs transition-all"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-white">{auditor.name}</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-900 text-amber-400 font-bold text-[10px]">
                              Chi đoàn {auditor.classId}
                            </span>
                            <button
                              onClick={() => toggleAuditorActive(auditor.id)}
                              className={`px-2 py-0.2 rounded-full text-[9px] font-bold border transition-colors ${auditor.isActive
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                : 'bg-slate-900 text-slate-500 border-slate-700'
                                }`}
                            >
                              {auditor.isActive ? 'Đang trực' : 'Tạm nghỉ'}
                            </button>
                          </div>
                          <div className="text-[11px] text-slate-400 flex flex-wrap gap-x-3 gap-y-0.5">
                            <span>📞 {auditor.phone || 'Chưa cập nhật'}</span>
                            <span>📍 Khu vực: <strong className="text-slate-300">{auditor.assignedZone || 'Chưa gán'}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => {
                              setEditingAuditor(auditor);
                              setAuditorForm({
                                name: auditor.name,
                                classId: auditor.classId,
                                phone: auditor.phone || '',
                                assignedZone: auditor.assignedZone || 'Khối 10',
                                defaultShiftTime: auditor.defaultShiftTime || '06:45 - 07:15 & 11:15 - 11:45',
                                isActive: auditor.isActive
                              });
                              setIsAuditorModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400"
                            title="Sửa cán bộ"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa cán bộ cờ đỏ "${auditor.name}"?`)) {
                                deleteAuditorMember(auditor.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400"
                            title="Xóa cán bộ"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Zones List CRUD */}
                <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div>
                      <h4 className="text-sm font-black text-white">KHU VỰC GIÁM SÁT ({zones.length} khu vực)</h4>
                      <p className="text-[11px] text-slate-400">Danh sách các vị trí phân bổ cán bộ cờ đỏ tuần tra nề nếp</p>
                    </div>
                    <button
                      onClick={() => {
                        setEditingZone(null);
                        setZoneForm({
                          name: '',
                          description: '',
                          icon: '🏢'
                        });
                        setIsZoneModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1 shadow-glow"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Thêm Khu Vực</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
                    {zones.map(zoneItem => (
                      <div
                        key={zoneItem.id}
                        className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 space-y-2 text-xs transition-all"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg p-1.5 rounded-xl bg-slate-900 border border-slate-800">
                              {zoneItem.icon || '📍'}
                            </span>
                            <span className="font-extrabold text-white text-xs">{zoneItem.name}</span>
                          </div>
                        </div>

                        <p className="text-slate-400 text-[11px] line-clamp-2">
                          {zoneItem.description || 'Khu vực giám sát nề nếp toàn trường'}
                        </p>

                        <div className="pt-2 flex items-center justify-end gap-1.5 border-t border-slate-900">
                          <button
                            onClick={() => {
                              setEditingZone(zoneItem);
                              setZoneForm({
                                name: zoneItem.name,
                                description: zoneItem.description || '',
                                icon: zoneItem.icon || '🏢'
                              });
                              setIsZoneModalOpen(true);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 flex items-center gap-1 text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Sửa</span>
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa khu vực "${zoneItem.name}"?`)) {
                                deleteZone(zoneItem.id);
                              }
                            }}
                            className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 flex items-center gap-1 text-[11px]"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Xóa</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

          {/* Master Sub-Tab 4: WEEKS */}
          {operationsSubTab === 'weeks' && (
            <div className="space-y-4 animate-fadeIn">
              {(() => {
                const semester1EndWeek = schoolSettings.semester1EndWeek || 18;
                const semester1Name = schoolSettings.semester1Name || 'Học Kỳ 1';
                const semester2Name = schoolSettings.semester2Name || 'Học Kỳ 2';

                const sortedWeeks = sortDataList(weeksConfig, weekSort.key, weekSort.direction);

                const hk1Weeks = weeksConfig.filter(w => w.weekNumber <= semester1EndWeek);
                const hk2Weeks = weeksConfig.filter(w => w.weekNumber > semester1EndWeek);

                const hk1StartDate = hk1Weeks[0]?.startDate ? formatDateDisplay(hk1Weeks[0].startDate) : '07/09/2026';
                const hk1EndDate = hk1Weeks[hk1Weeks.length - 1]?.endDate ? formatDateDisplay(hk1Weeks[hk1Weeks.length - 1].endDate) : '09/01/2027';

                const hk2StartDate = hk2Weeks[0]?.startDate ? formatDateDisplay(hk2Weeks[0].startDate) : '11/01/2027';
                const hk2EndDate = hk2Weeks[hk2Weeks.length - 1]?.endDate ? formatDateDisplay(hk2Weeks[hk2Weeks.length - 1].endDate) : '08/05/2027';

                return (
                  <>
                    {/* Header & Actions Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                      <div>
                        <h4 className="text-sm font-black text-white flex items-center gap-2">
                          <span>📅 CẤU HÌNH 35 TUẦN HỌC & HỌC KỲ NĂM HỌC 2026 – 2027</span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-[11px] font-bold">
                            {weeksConfig.length} Tuần
                          </span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Phân bổ thời gian, cấu trúc {semester1Name} & {semester2Name}, chốt dữ liệu và đồng bộ Supabase Cloud
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {/* View Switcher: Table vs Cards */}
                        <div className="flex items-center p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-bold">
                          <button
                            type="button"
                            onClick={() => setWeeksViewMode('table')}
                            className={`px-3 py-1 rounded-lg transition-all ${
                              weeksViewMode === 'table' ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>📋 Bảng Danh Sách</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setWeeksViewMode('cards')}
                            className={`px-3 py-1 rounded-lg transition-all ${
                              weeksViewMode === 'cards' ? 'bg-blue-600 text-white shadow-glow' : 'text-slate-400 hover:text-white'
                            }`}
                          >
                            <span>🗂️ Dạng Thẻ</span>
                          </button>
                        </div>

                        {/* Open Semester Structure Modal */}
                        <button
                          type="button"
                          onClick={() => {
                            setSemesterForm({
                              semester1EndWeek: schoolSettings.semester1EndWeek || 18,
                              semester1Name: schoolSettings.semester1Name || 'Học Kỳ 1',
                              semester2Name: schoolSettings.semester2Name || 'Học Kỳ 2'
                            });
                            setIsSemesterModalOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-xl bg-purple-950/80 hover:bg-purple-900 border border-purple-700/80 text-purple-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
                          title="Tùy chỉnh số tuần và thời gian Học Kỳ 1 vs Học Kỳ 2"
                        >
                          <Sliders className="w-3.5 h-3.5 text-purple-400" />
                          <span>⚙️ Cấu Trúc Học Kỳ</span>
                        </button>

                        {/* Cloud Sync Button */}
                        <div
                          className="px-3 py-1.5 rounded-xl bg-emerald-950/70 border border-emerald-800/60 text-emerald-300 font-bold text-xs flex items-center gap-1.5 shadow-sm"
                          title="Mọi thay đổi về cấu hình tuần học và học kỳ đều được tự động lưu lên Supabase Cloud"
                        >
                          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Tự động lưu Cloud</span>
                        </div>

                        {/* Reset / Force Sync 35 Weeks */}
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm('Khôi phục danh mục 35 tuần chuẩn năm học 2026 – 2027 (07/09/2026 đến 08/05/2027)?')) {
                              resetToDefault35Weeks();
                              alert('✅ Đã nạp thành công 35 tuần học năm học 2026 – 2027 vào hệ thống!');
                            }
                          }}
                          className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-600 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
                          title="Nạp lại đầy đủ 35 tuần theo đúng lịch biểu năm học 2026 - 2027"
                        >
                          <RefreshCw className="w-3.5 h-3.5 text-amber-400" />
                          <span>Nạp 35 Tuần Chuẩn</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingWeek(null);
                            const nextNum = Math.max(...weeksConfig.map(w => w.weekNumber), 35) + 1;
                            setWeekForm({
                              weekNumber: nextNum,
                              title: `Tuần ${nextNum}`,
                              startDate: '2027-05-10',
                              endDate: '2027-05-15',
                              note: 'Kế hoạch tuần bổ sung'
                            });
                            setIsWeekModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow transition-all active:scale-95"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Thêm Tuần</span>
                        </button>
                      </div>
                    </div>

                    {/* Interactive Semester Summary Cards */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-400">Tổng Số Tuần Học</span>
                        <div>
                          <p className="text-xl font-black text-white mt-1">{weeksConfig.length} <span className="text-xs font-normal text-slate-500">tuần</span></p>
                          <p className="text-[10px] text-slate-500 mt-0.5">Năm học 2026 – 2027</p>
                        </div>
                      </div>

                      {/* HK1 Dynamic Card (Clickable to customize) */}
                      <div 
                        onClick={() => {
                          setSemesterForm({
                            semester1EndWeek: schoolSettings.semester1EndWeek || 18,
                            semester1Name: schoolSettings.semester1Name || 'Học Kỳ 1',
                            semester2Name: schoolSettings.semester2Name || 'Học Kỳ 2'
                          });
                          setIsSemesterModalOpen(true);
                        }}
                        className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-950 border border-amber-800/60 hover:border-amber-500 transition-all cursor-pointer group shadow-sm hover:shadow-glow"
                        title="Bấm để tùy chỉnh cấu trúc & số tuần Học Kỳ 1"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                            <span>🎓 {semester1Name} ({hk1Weeks.length} Tuần)</span>
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-900/60 text-amber-300 font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                            ⚙️ Tùy chỉnh
                          </span>
                        </div>
                        <p className="text-xs font-bold text-amber-300 mt-1.5 font-mono">{hk1StartDate} ➔ {hk1EndDate}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Tuần 1 đến Tuần {semester1EndWeek}</p>
                      </div>

                      {/* HK2 Dynamic Card (Clickable to customize) */}
                      <div 
                        onClick={() => {
                          setSemesterForm({
                            semester1EndWeek: schoolSettings.semester1EndWeek || 18,
                            semester1Name: schoolSettings.semester1Name || 'Học Kỳ 1',
                            semester2Name: schoolSettings.semester2Name || 'Học Kỳ 2'
                          });
                          setIsSemesterModalOpen(true);
                        }}
                        className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-950/40 to-slate-950 border border-emerald-800/60 hover:border-emerald-500 transition-all cursor-pointer group shadow-sm hover:shadow-glow"
                        title="Bấm để tùy chỉnh cấu trúc & số tuần Học Kỳ 2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                            <span>🎓 {semester2Name} ({hk2Weeks.length} Tuần)</span>
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-900/60 text-emerald-300 font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                            ⚙️ Tùy chỉnh
                          </span>
                        </div>
                        <p className="text-xs font-bold text-emerald-300 mt-1.5 font-mono">{hk2StartDate} ➔ {hk2EndDate}</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Tuần {semester1EndWeek + 1} đến Tuần {weeksConfig.length}</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between">
                        <span className="text-[11px] font-bold text-slate-400">Tuần Hiện Tại</span>
                        <div>
                          <p className="text-xl font-black text-purple-400 mt-1">Tuần {activeWeek}</p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {activeWeek <= semester1EndWeek ? semester1Name : semester2Name}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* View 1: Detailed 35 Weeks Table */}
                    {weeksViewMode === 'table' ? (
                      <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-900/90 text-slate-400 border-b border-slate-800 font-bold">
                              <th className="p-3 text-center w-12 text-slate-400">STT</th>
                              <SortableTh
                                sortKey="weekNumber"
                                currentSortKey={weekSort.key}
                                currentSortDir={weekSort.direction}
                                onSort={(k) => setWeekSort(prev => ({ key: k, direction: prev.key === k && prev.direction === 'asc' ? 'desc' : 'asc' }))}
                                className="p-3 font-bold"
                              >
                                Tên Tuần Học
                              </SortableTh>
                              <SortableTh
                                sortKey="startDate"
                                currentSortKey={weekSort.key}
                                currentSortDir={weekSort.direction}
                                onSort={(k) => setWeekSort(prev => ({ key: k, direction: prev.key === k && prev.direction === 'asc' ? 'desc' : 'asc' }))}
                                className="p-3 font-bold"
                              >
                                Từ Ngày (Thứ 2)
                              </SortableTh>
                              <SortableTh
                                sortKey="endDate"
                                currentSortKey={weekSort.key}
                                currentSortDir={weekSort.direction}
                                onSort={(k) => setWeekSort(prev => ({ key: k, direction: prev.key === k && prev.direction === 'asc' ? 'desc' : 'asc' }))}
                                className="p-3 font-bold"
                              >
                                Đến Ngày (Thứ 7)
                              </SortableTh>
                              <th className="p-3 font-bold text-center">Học Kỳ</th>
                              <th className="p-3 font-bold">Kế Hoạch / Ghi Chú Trọng Tâm</th>
                              <th className="p-3 font-bold text-center">Khóa Sổ Thi Đua</th>
                              <th className="p-3 font-bold text-right">Thao Tác</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800/60">
                            {sortedWeeks.map((w, idx) => {
                              const isHk1 = w.weekNumber <= semester1EndWeek;
                              return (
                                <tr
                                  key={w.weekNumber}
                                  className={`transition-colors ${
                                    w.isCurrent
                                      ? 'bg-red-950/30 font-semibold'
                                      : w.isHidden
                                        ? 'bg-slate-950/40 opacity-75 hover:opacity-100 hover:bg-slate-900/40'
                                        : 'hover:bg-slate-900/50'
                                  }`}
                                >
                                  <td className="p-3 text-center text-slate-400 font-mono font-bold">
                                    {idx + 1}
                                  </td>
                                  <td className="p-3 font-bold text-white whitespace-nowrap">
                                    <div className="flex items-center gap-2">
                                      <span className={`font-extrabold text-sm ${w.isHidden ? 'text-slate-400 line-through decoration-slate-600' : 'text-white'}`}>
                                        {w.title}
                                      </span>
                                      {w.isCurrent && (
                                        <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[9px] shadow-sm animate-pulse">
                                          GỐC
                                        </span>
                                      )}
                                      {w.isHidden && (
                                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[9px] border border-slate-700">
                                          ĐÃ ẨN
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className="p-3 text-amber-300 font-mono font-semibold whitespace-nowrap">
                                    {formatDateDisplay(w.startDate)}
                                  </td>
                                  <td className="p-3 text-amber-300 font-mono font-semibold whitespace-nowrap">
                                    {formatDateDisplay(w.endDate)}
                                  </td>
                                  <td className="p-3 text-center whitespace-nowrap">
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                                      isHk1
                                        ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                                        : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                                    }`}>
                                      {isHk1 ? semester1Name : semester2Name}
                                    </span>
                                  </td>
                                  <td className="p-3 text-slate-300 max-w-xs">
                                    <span className="text-xs">{w.note || '—'}</span>
                                  </td>
                                  <td className="p-3 text-center whitespace-nowrap">
                                    <button
                                      type="button"
                                      onClick={() => toggleWeekLockDirect(w.weekNumber)}
                                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 mx-auto transition-colors ${
                                        w.isLocked
                                          ? 'bg-rose-950 text-rose-300 border-rose-700 hover:bg-rose-900'
                                          : 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                                      }`}
                                      title={w.isLocked ? "Bấm để mở khóa sổ thi đua" : "Bấm để khóa sổ thi đua tuần này"}
                                    >
                                      {w.isLocked ? <Lock className="w-3 h-3 text-rose-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                                      <span>{w.isLocked ? 'Đã Khóa' : 'Đang Mở'}</span>
                                    </button>
                                  </td>
                                  <td className="p-3 text-right whitespace-nowrap">
                                    <div className="flex items-center justify-end gap-1.5">
                                      {/* Thay đổi nút Đặt gốc thành Ẩn / Hiển thị */}
                                      <button
                                        type="button"
                                        onClick={() => toggleWeekVisibility(w.weekNumber)}
                                        title={w.isHidden ? "Bấm để hiển thị lại tuần này trên hệ thống" : "Bấm để ẩn tuần này khỏi hệ thống"}
                                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                                          w.isHidden
                                            ? 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                                            : 'bg-slate-900 text-emerald-400 border-emerald-800/60 hover:bg-slate-800 hover:text-emerald-300'
                                        }`}
                                      >
                                        {w.isHidden ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                                        <span>{w.isHidden ? 'Đã Ẩn' : 'Hiển Thị'}</span>
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() => {
                                          setEditingWeek(w);
                                          setWeekForm({
                                            weekNumber: w.weekNumber,
                                            title: w.title,
                                            startDate: w.startDate,
                                            endDate: w.endDate,
                                            note: w.note || ''
                                          });
                                          setIsWeekModalOpen(true);
                                        }}
                                        title="Sửa thông tin tuần học"
                                        className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800"
                                      >
                                        <Edit3 className="w-3.5 h-3.5" />
                                      </button>
                                      {!w.isCurrent && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (confirm(`Bạn có chắc muốn xóa ${w.title}?`)) {
                                              const res = deleteWeek(w.weekNumber);
                                              alert(res.message);
                                            }
                                          }}
                                          title="Xóa tuần học này"
                                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-800"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      /* View 2: Visual Cards Grid */
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {weeksConfig.map(w => {
                          const isHk1 = w.weekNumber <= semester1EndWeek;
                          return (
                            <div
                              key={w.weekNumber}
                              className={`p-4 rounded-2xl border space-y-3 text-xs transition-all ${
                                w.isCurrent
                                  ? 'bg-gradient-to-br from-red-950/80 to-slate-950 border-red-500 shadow-glow'
                                  : w.isHidden
                                    ? 'bg-slate-950/60 border-slate-800 opacity-75 hover:opacity-100'
                                    : 'bg-slate-950 border-slate-800'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <span className={`font-extrabold text-base ${w.isHidden ? 'text-slate-400 line-through decoration-slate-600' : 'text-white'}`}>
                                    {w.title}
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                                    isHk1
                                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                  }`}>
                                    {isHk1 ? semester1Name : semester2Name}
                                  </span>
                                  {w.isHidden && (
                                    <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[9px] border border-slate-700">
                                      ĐÃ ẨN
                                    </span>
                                  )}
                                </div>
                                {w.isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full bg-red-600 text-white font-extrabold text-[9px]">
                                    TUẦN HIỆN TẠI
                                  </span>
                                )}
                              </div>

                              <p className="text-slate-300 text-[11px]">
                                📅 {formatDateDisplay(w.startDate)} đến {formatDateDisplay(w.endDate)}
                              </p>
                              {w.note && (
                                <p className="text-slate-400 text-[11px] italic bg-slate-900/60 p-1.5 rounded-lg">
                                  {w.note}
                                </p>
                              )}

                              <div className="pt-2 flex flex-wrap items-center justify-between gap-1.5 border-t border-slate-900">
                                <button
                                  type="button"
                                  onClick={() => toggleWeekLockDirect(w.weekNumber)}
                                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border flex items-center gap-1 transition-colors ${
                                    w.isLocked
                                      ? 'bg-rose-950 text-rose-300 border-rose-700 hover:bg-rose-900'
                                      : 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                                  }`}
                                >
                                  {w.isLocked ? <Lock className="w-3 h-3 text-rose-400" /> : <Unlock className="w-3 h-3 text-emerald-400" />}
                                  <span>{w.isLocked ? 'Đã Khóa' : 'Đang Mở'}</span>
                                </button>

                                <div className="flex items-center gap-1">
                                  {/* Thay đổi nút Đặt gốc thành Ẩn / Hiển thị */}
                                  <button
                                    type="button"
                                    onClick={() => toggleWeekVisibility(w.weekNumber)}
                                    title={w.isHidden ? "Bấm để hiển thị lại tuần này" : "Bấm để ẩn tuần này"}
                                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border flex items-center gap-1 transition-all ${
                                      w.isHidden
                                        ? 'bg-slate-900 text-slate-400 border-slate-700 hover:bg-slate-800 hover:text-white'
                                        : 'bg-slate-900 text-emerald-400 border-emerald-800/60 hover:bg-slate-800 hover:text-emerald-300'
                                    }`}
                                  >
                                    {w.isHidden ? <EyeOff className="w-3.5 h-3.5 text-slate-400" /> : <Eye className="w-3.5 h-3.5 text-emerald-400" />}
                                    <span>{w.isHidden ? 'Đã Ẩn' : 'Hiển Thị'}</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => {
                                      setEditingWeek(w);
                                      setWeekForm({
                                        weekNumber: w.weekNumber,
                                        title: w.title,
                                        startDate: w.startDate,
                                        endDate: w.endDate,
                                        note: w.note || ''
                                      });
                                      setIsWeekModalOpen(true);
                                    }}
                                    title="Sửa thông tin tuần"
                                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-400"
                                  >
                                    <Edit3 className="w-3.5 h-3.5" />
                                  </button>

                                  {!w.isCurrent && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        if (confirm(`Bạn có chắc muốn xóa ${w.title}?`)) {
                                          const res = deleteWeek(w.weekNumber);
                                          alert(res.message);
                                        }
                                      }}
                                      title="Xóa tuần học"
                                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: TÙY CHỈNH PHÂN BỔ HỌC KỲ (HK1 & HK2) ================= */}
      {isSemesterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-lg rounded-3xl p-6 border border-purple-700/60 shadow-2xl space-y-5 bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-600/20 text-purple-400">
                  <Sliders className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-base font-black text-white">TÙY CHỈNH CẤU TRÚC HỌC KỲ</h3>
                  <p className="text-xs text-slate-400">Phân chia số tuần & thời gian Học kỳ 1 / Học kỳ 2 theo kế hoạch nhà trường</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsSemesterModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Semester 1 Name */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Tên hiển thị Học Kỳ 1</label>
                <input
                  type="text"
                  value={semesterForm.semester1Name}
                  onChange={(e) => setSemesterForm(prev => ({ ...prev, semester1Name: e.target.value }))}
                  placeholder="Học Kỳ 1"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Semester 2 Name */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Tên hiển thị Học Kỳ 2</label>
                <input
                  type="text"
                  value={semesterForm.semester2Name}
                  onChange={(e) => setSemesterForm(prev => ({ ...prev, semester2Name: e.target.value }))}
                  placeholder="Học Kỳ 2"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:outline-none focus:border-purple-500"
                />
              </div>

              {/* Semester 1 Cutoff Week */}
              <div className="space-y-1">
                <label className="text-slate-300 font-bold flex items-center justify-between">
                  <span>Tuần kết thúc {semesterForm.semester1Name}</span>
                  <span className="text-purple-400 font-extrabold text-sm">Tuần {semesterForm.semester1EndWeek}</span>
                </label>
                <select
                  value={semesterForm.semester1EndWeek}
                  onChange={(e) => setSemesterForm(prev => ({ ...prev, semester1EndWeek: Number(e.target.value) }))}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold focus:outline-none focus:border-purple-500 cursor-pointer"
                >
                  {Array.from({ length: Math.max(weeksConfig.length - 1, 34) }, (_, i) => i + 1).map(num => (
                    <option key={num} value={num} className="bg-slate-900 text-white">
                      Tuần {num} ({num} tuần HK1 / {weeksConfig.length - num} tuần HK2)
                    </option>
                  ))}
                </select>
              </div>

              {/* Live Preview Calculation */}
              {(() => {
                const s1Weeks = weeksConfig.filter(w => w.weekNumber <= semesterForm.semester1EndWeek);
                const s2Weeks = weeksConfig.filter(w => w.weekNumber > semesterForm.semester1EndWeek);

                const s1Start = s1Weeks[0]?.startDate ? formatDateDisplay(s1Weeks[0].startDate) : '—';
                const s1End = s1Weeks[s1Weeks.length - 1]?.endDate ? formatDateDisplay(s1Weeks[s1Weeks.length - 1].endDate) : '—';

                const s2Start = s2Weeks[0]?.startDate ? formatDateDisplay(s2Weeks[0].startDate) : '—';
                const s2End = s2Weeks[s2Weeks.length - 1]?.endDate ? formatDateDisplay(s2Weeks[s2Weeks.length - 1].endDate) : '—';

                return (
                  <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Xem trước phân bổ thời gian:</p>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-amber-950/30 border border-amber-800/40">
                      <div>
                        <span className="font-extrabold text-amber-300">{semesterForm.semester1Name}</span>
                        <p className="text-[10px] text-slate-400">Tuần 1 đến Tuần {semesterForm.semester1EndWeek} ({s1Weeks.length} Tuần)</p>
                      </div>
                      <span className="font-mono text-amber-400 font-bold text-[11px]">{s1Start} ➔ {s1End}</span>
                    </div>

                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                      <div>
                        <span className="font-extrabold text-emerald-300">{semesterForm.semester2Name}</span>
                        <p className="text-[10px] text-slate-400">Tuần {semesterForm.semester1EndWeek + 1} đến Tuần {weeksConfig.length} ({s2Weeks.length} Tuần)</p>
                      </div>
                      <span className="font-mono text-emerald-400 font-bold text-[11px]">{s2Start} ➔ {s2End}</span>
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setIsSemesterModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  updateSemesterConfig(semesterForm);
                  setIsSemesterModalOpen(false);
                  alert(`✅ Đã cập nhật thành công cấu trúc học kỳ!\n- ${semesterForm.semester1Name}: Tuần 1 -> Tuần ${semesterForm.semester1EndWeek}\n- ${semesterForm.semester2Name}: Tuần ${semesterForm.semester1EndWeek + 1} -> Tuần ${weeksConfig.length}`);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-bold shadow-glow transition-all active:scale-95"
              >
                💾 Lưu & Đồng Bộ Cấu Hình
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MAIN TAB 3: MEDIA HUB (BẢN TIN & THÔNG BÁO) ================= */}
      {adminTab === 'media_hub' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-5">
          {/* Sub-tabs Header inside Media Hub */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Newspaper className="w-5 h-5 text-amber-500" />
                <span>QUẢN LÝ TRUYỀN THÔNG, BẢN TIN & THÔNG BÁO CHỈ ĐẠO</span>
              </h3>
              <p className="text-xs text-slate-400">Đăng tải bản tin phong trào Đoàn và ban hành công văn, thông báo chỉ đạo khẩn</p>
            </div>

            {/* Sub-tabs pills */}
            <div className="flex flex-wrap bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => setMediaHubSubTab('documents')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${mediaHubSubTab === 'documents'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-glow'
                  : 'text-amber-400 hover:text-white hover:bg-amber-950/40'
                  }`}
              >
                <Folder className="w-3.5 h-3.5" />
                <span>📁 Kho Văn Bản & Biểu Mẫu ({documentFiles?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaHubSubTab('news_events')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${(mediaHubSubTab === 'news_events' || mediaHubSubTab === 'news' || mediaHubSubTab === 'events')
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <Newspaper className="w-3.5 h-3.5" />
                <span>📰🏆 Bản Tin & Sự Kiện ({news.filter(n => n.category !== 'announcement' && !n.id.startsWith('ann-')).length + events.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaHubSubTab('announcements')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${mediaHubSubTab === 'announcements'
                  ? 'bg-amber-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>📢 Thông Báo Chỉ Đạo ({news.filter(n => n.category === 'announcement' || n.id.startsWith('ann-')).length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaHubSubTab('tasks_notices')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${mediaHubSubTab === 'tasks_notices'
                  ? 'bg-red-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>🛠️ Điều Động & Lao Động ({notices.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setMediaHubSubTab('activity_reports')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${mediaHubSubTab === 'activity_reports'
                  ? 'bg-purple-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>🚩 Báo Cáo Phong Trào ({activityReports.length})</span>
                {activityReports.filter(r => r.status === 'submitted').length > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${mediaHubSubTab === 'activity_reports' ? 'bg-white/20 text-white' : 'bg-purple-950 text-purple-300 border border-purple-800'
                    }`}>
                    {activityReports.filter(r => r.status === 'submitted').length} mới
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMediaHubSubTab('media_library')}
                className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${mediaHubSubTab === 'media_library'
                  ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>🖼️ Kho Media & Ảnh ({mediaAssets?.length || 0})</span>
              </button>
            </div>
          </div>

          {/* Sub-Tab 3.1: Merged News & Events Hub */}
          {(mediaHubSubTab === 'news_events' || mediaHubSubTab === 'news' || mediaHubSubTab === 'events') && (
            <div className="space-y-5 animate-fadeIn">
              {/* Header & Action Buttons */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Newspaper className="w-4 h-4 text-emerald-400" />
                    <span>BẢN TIN & SỰ KIỆN PHONG TRÀO ĐOÀN TRƯỜNG</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Quản lý toàn bộ bài viết truyền thông, phong trào thanh niên, giải thể thao và mã QR điểm danh học sinh
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingNews(null);
                      setNewsForm({
                        title: '',
                        excerpt: '',
                        content: '',
                        thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
                        tags: '#PhongTrao, #HoatDongDoan',
                        isPinned: false,
                        attachments: []
                      });
                      setIsNewsModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Bản Tin Mới</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingEvent(null);
                      setEventForm({
                        title: '',
                        description: '',
                        category: 'Phong trào',
                        thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80',
                        location: 'Sân lễ trường THPT Quang Trung',
                        startDate: '2026-09-05',
                        endDate: '2026-09-05',
                        bonusPoints: 15,
                        maxSlots: 50,
                        isRegistrationOpen: true,
                        qrCodeValue: `EVT-${Date.now()}`
                      });
                      setIsEventModalOpen(true);
                    }}
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow active:scale-95 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>+ Thêm Sự Kiện Mới</span>
                  </button>
                </div>
              </div>

              {/* Sub-Filter Segments Switcher */}
              <div className="flex items-center gap-2 bg-slate-950/80 p-1.5 rounded-2xl border border-slate-800 w-fit text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setNewsEventsViewFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${newsEventsViewFilter === 'ALL'
                    ? 'bg-gradient-to-r from-blue-600 to-emerald-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <span>🌟 Tất Cả</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/30 text-white/90">
                    {news.filter(n => n.category !== 'announcement' && !n.id.startsWith('ann-')).length + events.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewsEventsViewFilter('events')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${newsEventsViewFilter === 'events'
                    ? 'bg-emerald-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <span>🏆 Sự Kiện Phong Trào</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800">
                    {events.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setNewsEventsViewFilter('news')}
                  className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${newsEventsViewFilter === 'news'
                    ? 'bg-blue-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <span>📰 Bài Viết & Bản Tin</span>
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-950 text-blue-300 border border-blue-800">
                    {news.filter(n => n.category !== 'announcement' && !n.id.startsWith('ann-')).length}
                  </span>
                </button>
              </div>

              {/* Section: SỰ KIỆN PHONG TRÀO */}
              {(newsEventsViewFilter === 'ALL' || newsEventsViewFilter === 'events') && (
                <div className="space-y-3">
                  {newsEventsViewFilter === 'ALL' && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                      <h5 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                        <span>🏆 SỰ KIỆN & HOẠT ĐỘNG PHONG TRÀO ({events.length})</span>
                      </h5>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {events.map(ev => (
                      <div
                        key={ev.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 space-y-3 transition-all flex flex-col justify-between"
                      >
                        <div className="space-y-3">
                          <div className="relative h-36 rounded-xl overflow-hidden border border-slate-700">
                            <img
                              src={ev.thumbnail}
                              alt={ev.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 text-emerald-300 font-extrabold text-[10px] border border-emerald-700">
                                {ev.category}
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-amber-950/90 text-amber-300 font-extrabold text-[10px] border border-amber-700">
                                +{ev.bonusPoints}đ Phong trào
                              </span>
                            </div>
                            <div className="absolute top-2 right-2">
                              <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${ev.isRegistrationOpen
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-800 text-slate-400'
                                }`}>
                                {ev.isRegistrationOpen ? 'Đang Mở Đăng Ký' : 'Đã Đóng'}
                              </span>
                            </div>
                          </div>

                          <div className="space-y-1">
                            <h4 className="font-extrabold text-white text-sm">{ev.title}</h4>
                            <p className="text-slate-300 text-xs line-clamp-2">{ev.description}</p>

                            <div className="grid grid-cols-2 gap-1 text-[11px] text-slate-400 pt-1">
                              <span>📍 {ev.location}</span>
                              <span>📅 {ev.startDate}</span>
                            </div>
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <div className="space-y-0.5">
                            <span className="text-[11px] text-slate-300">
                              Đăng ký: <strong>{ev.registeredCount}/{ev.maxSlots}</strong> HS
                            </span>
                            <div className="text-[10px] text-emerald-400 font-mono">
                              Mã QR: {ev.qrCodeValue}
                            </div>
                          </div>

                          <div className="flex items-center space-x-1.5">
                            <button
                              onClick={() => {
                                setEditingEvent(ev);
                                setEventForm({
                                  title: ev.title,
                                  description: ev.description,
                                  category: ev.category,
                                  thumbnail: ev.thumbnail,
                                  location: ev.location,
                                  startDate: ev.startDate,
                                  endDate: ev.endDate,
                                  bonusPoints: ev.bonusPoints,
                                  maxSlots: ev.maxSlots,
                                  isRegistrationOpen: ev.isRegistrationOpen,
                                  qrCodeValue: ev.qrCodeValue
                                });
                                setIsEventModalOpen(true);
                              }}
                              title="Chỉnh sửa sự kiện"
                              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc muốn xóa sự kiện "${ev.title}"?`)) {
                                  deleteEvent(ev.id);
                                }
                              }}
                              title="Xóa sự kiện"
                              className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}

                    {events.length === 0 && (
                      <div className="col-span-2 p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                        Chưa có sự kiện phong trào nào. Nhấn "Thêm Sự Kiện Mới" để tạo.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Section: BẢN TIN PHONG TRÀO */}
              {(newsEventsViewFilter === 'ALL' || newsEventsViewFilter === 'news') && (
                <div className="space-y-3">
                  {newsEventsViewFilter === 'ALL' && (
                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80">
                      <h5 className="text-xs font-black uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                        <span>📰 BÀI VIẾT & BẢN TIN HOẠT ĐỘNG ({news.filter(n => n.category !== 'announcement' && !n.id.startsWith('ann-')).length})</span>
                      </h5>
                    </div>
                  )}

                  <div className="space-y-3">
                    {news.filter(n => n.category !== 'announcement' && !n.id.startsWith('ann-')).map(article => (
                      <div
                        key={article.id}
                        className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-blue-500/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={article.thumbnail}
                            alt={article.title}
                            className="w-20 h-16 object-cover rounded-xl border border-slate-700 shrink-0"
                          />
                          <div className="space-y-1">
                            <div className="flex flex-wrap items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-extrabold text-[9px] border border-blue-800">
                                📰 BẢN TIN
                              </span>
                              {article.isPinned && (
                                <span className="px-2 py-0.5 rounded bg-red-600 text-white font-black text-[9px] flex items-center gap-1">
                                  <Pin className="w-2.5 h-2.5" /> GHIM
                                </span>
                              )}
                              {article.isHidden && (
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[9px]">
                                  ẨN
                                </span>
                              )}
                              {article.attachments && article.attachments.length > 0 && (
                                <span className="px-2 py-0.5 rounded bg-slate-800 text-blue-300 font-bold text-[9px] flex items-center gap-1 border border-slate-700">
                                  <Paperclip className="w-2.5 h-2.5" /> {article.attachments.length} file đính kèm
                                </span>
                              )}
                              <span className="text-slate-400 text-[10px]">• {article.publishDate}</span>
                              <span className="text-amber-400 text-[10px]">Bởi: {article.author}</span>
                            </div>

                            <h4 className="font-extrabold text-white text-sm line-clamp-1">{article.title}</h4>
                            <p className="text-slate-400 text-[11px] line-clamp-1">{article.excerpt}</p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                          <button
                            onClick={() => toggleNewsVisibility(article.id)}
                            title={article.isHidden ? 'Hiển thị ra trang chủ' : 'Ẩn khỏi trang chủ'}
                            className={`p-2 rounded-xl border text-xs font-bold transition-colors ${article.isHidden
                              ? 'bg-slate-900 border-slate-700 text-slate-400'
                              : 'bg-emerald-950 border-emerald-800 text-emerald-300'
                              }`}
                          >
                            {article.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => {
                              setEditingNews(article);
                              setNewsForm({
                                title: article.title,
                                excerpt: article.excerpt,
                                content: article.content,
                                thumbnail: article.thumbnail,
                                tags: article.tags.join(', '),
                                isPinned: article.isPinned,
                                attachments: article.attachments || []
                              });
                              setIsNewsModalOpen(true);
                            }}
                            title="Chỉnh sửa bản tin"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa bản tin "${article.title}"?`)) {
                                deleteNewsPost(article.id);
                              }
                            }}
                            title="Xóa bản tin"
                            className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}

                    {news.filter(n => n.category !== 'announcement' && !n.id.startsWith('ann-')).length === 0 && (
                      <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                        Chưa có bản tin bài viết nào. Nhấn "Thêm Bản Tin Mới" để đăng bài.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 3.2: Announcements Admin */}
          {mediaHubSubTab === 'announcements' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">CÔNG VĂN & THÔNG BÁO CHỈ ĐẠO ĐOÀN TRƯỜNG</h4>
                  <p className="text-[11px] text-slate-400">Ban hành thông báo khẩn, công văn điều hành, lịch họp và tài liệu văn bản</p>
                </div>
                <button
                  onClick={() => {
                    setEditingAnnouncement(null);
                    setAnnouncementForm({
                      title: '',
                      excerpt: '',
                      content: '',
                      urgency: 'urgent',
                      thumbnail: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=600&auto=format&fit=crop&q=80',
                      tags: '#ThongBaoKhan, #CongVan',
                      isPinned: true,
                      attachments: []
                    });
                    setIsAnnouncementModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ban Hành Thông Báo Mới</span>
                </button>
              </div>

              <div className="space-y-3">
                {news.filter(n => n.category === 'announcement' || n.id.startsWith('ann-')).map(ann => (
                  <div
                    key={ann.id}
                    className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-950 to-amber-950/20 border border-amber-500/30 hover:border-amber-500/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-black text-xl shrink-0">
                        📢
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${ann.urgency === 'critical' ? 'bg-red-600 text-white animate-pulse' : 'bg-amber-600 text-white'
                            }`}>
                            {ann.urgency === 'critical' ? '🔥 HỎA TỐC' : '⚠️ KHẨN CẤP'}
                          </span>
                          {ann.isPinned && (
                            <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800 font-bold text-[9px] flex items-center gap-1">
                              <Pin className="w-2.5 h-2.5" /> GHIM TRANG CHỦ
                            </span>
                          )}
                          {ann.isHidden && (
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[9px]">
                              ẨN
                            </span>
                          )}
                          {ann.attachments && ann.attachments.length > 0 && (
                            <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-bold text-[9px] flex items-center gap-1 border border-blue-800">
                              <Paperclip className="w-2.5 h-2.5" /> {ann.attachments.length} file công văn
                            </span>
                          )}
                          <span className="text-slate-400 text-[10px]">• {ann.publishDate}</span>
                          <span className="text-amber-400 text-[10px]">Ban hành: {ann.author}</span>
                        </div>

                        <h4 className="font-extrabold text-white text-sm line-clamp-1">{ann.title}</h4>
                        <p className="text-slate-300 text-[11px] line-clamp-1">{ann.excerpt}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => toggleNewsVisibility(ann.id)}
                        title={ann.isHidden ? 'Hiển thị ra trang chủ' : 'Ẩn khỏi trang chủ'}
                        className={`p-2 rounded-xl border text-xs font-bold transition-colors ${ann.isHidden
                          ? 'bg-slate-900 border-slate-700 text-slate-400'
                          : 'bg-emerald-950 border-emerald-800 text-emerald-300'
                          }`}
                      >
                        {ann.isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>

                      <button
                        onClick={() => {
                          setEditingAnnouncement(ann);
                          setAnnouncementForm({
                            title: ann.title,
                            excerpt: ann.excerpt,
                            content: ann.content,
                            urgency: ann.urgency || 'urgent',
                            thumbnail: ann.thumbnail,
                            tags: ann.tags.join(', '),
                            isPinned: ann.isPinned,
                            attachments: ann.attachments || []
                          });
                          setIsAnnouncementModalOpen(true);
                        }}
                        title="Chỉnh sửa thông báo"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa thông báo "${ann.title}"?`)) {
                            deleteNewsPost(ann.id);
                          }
                        }}
                        title="Xóa thông báo"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Tab 3.3: Tasks & Mobilization Notices */}
          {mediaHubSubTab === 'tasks_notices' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between pb-1">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">THÔNG BÁO ĐIỀU ĐỘNG & NHIỆM VỤ LAO ĐỘNG</h4>
                  <p className="text-[11px] text-slate-400">Phát lệnh điều động đoàn viên 18 chi đoàn tham gia lao động vệ sinh, họp BCH và chuẩn bị sự kiện</p>
                </div>
                <button
                  onClick={() => {
                    setEditingNotice(null);
                    setNoticeForm({
                      title: '',
                      content: '',
                      type: 'lao_dong',
                      targetClasses: ['ALL'],
                      deadline: '2026-09-05 17:00',
                      assignedBy: currentUser?.name ? `${currentUser.name} - ${currentUser.roleTitle || 'Ban Bí thư'}` : 'Cô Zdrăm Thị Thành Thương - Bí thư Đoàn',
                      status: 'pending'
                    });
                    setIsNoticeModalOpen(true);
                  }}
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Phát Lệnh Điều Động Mới</span>
                </button>
              </div>

              <div className="space-y-3">
                {notices.map(item => (
                  <div
                    key={item.id}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center font-black text-xl shrink-0">
                        {item.type === 'lao_dong' ? '🧹' : item.type === 'cuoc_hop' ? '👥' : '📋'}
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-red-950 text-red-300 font-extrabold text-[9px] border border-red-800">
                            {item.type === 'lao_dong' ? 'LAO ĐỘNG' : item.type === 'cuoc_hop' ? 'CUỘC HỌP' : 'ĐIỀU ĐỘNG'}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${item.status === 'completed'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : 'bg-amber-950 text-amber-300 border border-amber-800'
                            }`}>
                            {item.status === 'completed' ? '✓ ĐÃ HOÀN THÀNH' : '⏳ ĐANG TRIỂN KHAI'}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 font-mono text-[9px] border border-blue-800">
                            🎯 Đối tượng: {item.targetClasses.includes('ALL') ? 'Tất cả 18 chi đoàn' : item.targetClasses.join(', ')}
                          </span>
                          <span className="text-amber-400 text-[10px]">⏰ Hạn: {item.deadline}</span>
                        </div>

                        <h4 className="font-extrabold text-white text-sm">{item.title}</h4>
                        <div className="text-slate-300 text-[11px] leading-relaxed bg-slate-900/50 p-2.5 rounded-xl border border-slate-800/80">
                          <RichTextViewer content={item.content} compact />
                        </div>
                        <p className="text-[10px] text-slate-400 pt-0.5">
                          Người phát lệnh: <strong>{item.assignedBy}</strong> • Tạo lúc: {item.createdAt}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                      <button
                        onClick={() => {
                          const nextStatus = item.status === 'completed' ? 'pending' : 'completed';
                          updateNotice(item.id, { status: nextStatus });
                        }}
                        title="Đổi trạng thái hoàn thành"
                        className={`px-3 py-1.5 rounded-xl border text-[11px] font-bold transition-colors ${item.status === 'completed'
                          ? 'bg-slate-900 border-slate-700 text-slate-400'
                          : 'bg-emerald-950 border-emerald-800 text-emerald-300'
                          }`}
                      >
                        {item.status === 'completed' ? 'Mở Lại' : '✓ Hoàn Thành'}
                      </button>

                      <button
                        onClick={() => {
                          setEditingNotice(item);
                          setNoticeForm({
                            title: item.title,
                            content: item.content,
                            type: item.type,
                            targetClasses: item.targetClasses,
                            deadline: item.deadline,
                            assignedBy: item.assignedBy,
                            status: item.status
                          });
                          setIsNoticeModalOpen(true);
                        }}
                        title="Chỉnh sửa nhiệm vụ"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Bạn có chắc muốn xóa thông báo nhiệm vụ "${item.title}"?`)) {
                            deleteNotice(item.id);
                          }
                        }}
                        title="Xóa nhiệm vụ"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-rose-950 text-rose-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                {notices.length === 0 && (
                  <div className="p-8 text-center bg-slate-950 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                    Chưa có lệnh điều động hoặc nhiệm vụ lao động nào. Nhấn "Phát Lệnh Điều Động Mới" để tạo.
                  </div>
                )}
              </div>
            </div>
          )}



          {/* Sub-Tab 3.5: Activity Participant Reports from Youth Secretaries */}
          {mediaHubSubTab === 'activity_reports' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Header & Excel Export Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span>QUẢN LÝ BÁO CÁO HỌC SINH THAM GIA PHONG TRÀO TỪ 18 CHI ĐOÀN</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Theo dõi danh sách và số lượng học sinh tham gia phong trào, giải thể thao, tình nguyện do Bí thư Chi đoàn báo cáo
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleExportActivityParticipantsExcel()}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-glow active:scale-95 transition-all"
                  >
                    <Download className="w-4 h-4" />
                    <span>📥 Xuất Excel Danh Sách Học Sinh Tham Gia (.xlsx)</span>
                  </button>
                </div>
              </div>

              {/* KPI Summary Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400">Tổng Số Báo Cáo</span>
                  <p className="text-xl font-black text-white mt-1">{activityReports.length} <span className="text-xs font-normal text-slate-500">lượt</span></p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400">Lượt HS Tham Gia</span>
                  <p className="text-xl font-black text-purple-400 mt-1">
                    {activityReports.reduce((sum, r) => sum + (r.participantCount || r.participants.length), 0)} <span className="text-xs font-normal text-slate-500">học sinh</span>
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400">Chi Đoàn Đã Nộp</span>
                  <p className="text-xl font-black text-emerald-400 mt-1">
                    {new Set(activityReports.map(r => r.classId)).size} / 18 <span className="text-xs font-normal text-slate-500">lớp</span>
                  </p>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400">Chờ Đoàn Trường Duyệt</span>
                  <p className="text-xl font-black text-amber-400 mt-1">
                    {activityReports.filter(r => r.status === 'submitted').length} <span className="text-xs font-normal text-slate-500">báo cáo</span>
                  </p>
                </div>
              </div>

              {/* Filters Toolbar */}
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 flex flex-wrap items-center gap-2.5">
                <div className="flex-1 min-w-[200px]">
                  <input
                    type="text"
                    value={activitySearch}
                    onChange={(e) => setActivitySearch(e.target.value)}
                    placeholder="🔍 Tìm theo tên hoạt động, tên học sinh, mã HS, bí thư..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Lớp:</span>
                  <select
                    value={activityClassFilter}
                    onChange={(e) => setActivityClassFilter(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none"
                  >
                    <option value="ALL">Tất cả 18 lớp</option>
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Loại:</span>
                  <select
                    value={activityTypeFilter}
                    onChange={(e) => setActivityTypeFilter(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none"
                  >
                    <option value="ALL">Tất cả loại hình</option>
                    <option value="the_thao">Hội thao / Thể thao</option>
                    <option value="tinh_nguyen">Tình nguyện</option>
                    <option value="van_nghe">Văn nghệ</option>
                    <option value="lao_dong">Lao động</option>
                    <option value="phong_trao">Phong trào chung</option>
                  </select>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400">Trạng thái:</span>
                  <select
                    value={activityStatusFilter}
                    onChange={(e) => setActivityStatusFilter(e.target.value)}
                    className="px-2.5 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold focus:outline-none"
                  >
                    <option value="ALL">Tất cả</option>
                    <option value="submitted">Chờ xác nhận</option>
                    <option value="verified">Đã duyệt</option>
                  </select>
                </div>
              </div>

              {/* Reports List */}
              <div className="space-y-4">
                {filteredActivityReports.map(report => {
                  const currentTab = activeReportTab[report.id] || 'participating';
                  const nonParticipants = getReportNonParticipants(report);
                  const totalInClass = report.participants.length + nonParticipants.length;
                  const participantRate = totalInClass > 0 ? Math.round((report.participants.length / totalInClass) * 100) : 100;
                  
                  const sortedParticipants = sortDataList(report.participants, 'name', 'asc');
                  const sortedNonParticipants = sortDataList(nonParticipants, 'name', 'asc');

                  return (
                    <div
                      key={report.id}
                      className="p-5 rounded-3xl bg-slate-950 border border-slate-800/90 shadow-md hover:border-slate-700 transition-all space-y-4"
                    >
                      {/* Top Row of Card */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
                        <div className="space-y-1">
                          <div className="flex items-center flex-wrap gap-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${report.activityType === 'the_thao' ? 'bg-amber-950 text-amber-300 border-amber-800' :
                              report.activityType === 'tinh_nguyen' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
                                report.activityType === 'van_nghe' ? 'bg-purple-950 text-purple-300 border-purple-800' :
                                  'bg-blue-950 text-blue-300 border-blue-800'
                              }`}>
                              {report.activityType === 'the_thao' ? '🏅 Hội Thao' :
                                report.activityType === 'tinh_nguyen' ? '🌱 Tình Nguyện' :
                                  report.activityType === 'van_nghe' ? '🎭 Văn Nghệ' :
                                    report.activityType === 'lao_dong' ? '🛠️ Lao Động' : '🚩 Phong Trào'}
                            </span>
                            <h5 className="text-base font-black text-white">{report.activityTitle}</h5>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-900 text-amber-400 font-extrabold text-xs border border-slate-700">
                              Chi đoàn {report.className}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                            <span>👤 Bí thư báo cáo: <strong className="text-slate-300">{report.secretaryName}</strong></span>
                            <span>🕒 Thời gian: <strong className="text-slate-300">{report.reportedAt}</strong></span>
                            <span>👥 Sĩ số lớp: <strong className="text-slate-300">{totalInClass} học sinh</strong></span>
                            <span>✅ Tham gia: <strong className="text-purple-400 font-bold">{report.participants.length} ({participantRate}%)</strong></span>
                            <span>❌ Không tham gia: <strong className="text-rose-400 font-bold">{nonParticipants.length} ({100 - participantRate}%)</strong></span>
                          </p>
                        </div>

                        {/* Status badge & Action buttons */}
                        <div className="flex items-center flex-wrap gap-2 shrink-0">
                          {report.status === 'verified' ? (
                            <span className="px-3 py-1 rounded-xl bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Đã Xác Nhận</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => verifyActivityReport(report.id, 'Đoàn trường đã ghi nhận và biểu dương tập thể Chi đoàn!')}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-glow transition-all"
                              title="Xác nhận duyệt danh sách và biểu dương chi đoàn"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Duyệt & Biểu Dương</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => handleExportActivityParticipantsExcel([report])}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-emerald-300 border border-slate-700 hover:border-emerald-600 text-xs font-bold flex items-center gap-1 transition-all"
                            title="Tải riêng file Excel danh sách đầy đủ của Chi đoàn này"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5" />
                            <span>Xuất Excel</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Bạn có chắc muốn xóa báo cáo phong trào "${report.activityTitle}" của Chi đoàn ${report.className}?`)) {
                                deleteActivityReport(report.id);
                              }
                            }}
                            className="p-1.5 rounded-xl bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-800 hover:border-rose-800 transition-colors"
                            title="Xóa báo cáo"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Segmented View Switcher: Tham Gia vs Không Tham Gia */}
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
                            <span>❌ Học Sinh / Đoàn Viên Không Tham Gia ({nonParticipants.length})</span>
                          </button>
                        </div>

                        <span className="text-[11px] text-slate-500 font-medium italic">
                          {currentTab === 'participating'
                            ? `Hiển thị danh sách ${report.participants.length} học sinh tham gia phong trào`
                            : `Hiển thị danh sách ${nonParticipants.length} học sinh trong chi đoàn không tham gia đợt này`}
                        </span>
                      </div>

                      {/* Table of Students */}
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
                                <th className="p-2.5">Thành Tích / Giải Thưởng</th>
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
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${p.gender === 'Nữ' ? 'bg-pink-950 text-pink-300' : 'bg-blue-950 text-blue-300'
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
                                <th className="p-2.5">Trạng Thái / Lý Do Không Tham Gia</th>
                                <th className="p-2.5">Ghi Chú</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60">
                              {sortedNonParticipants.length === 0 ? (
                                <tr>
                                  <td colSpan={8} className="p-6 text-center text-emerald-400 font-bold">
                                    🎉 100% học sinh trong chi đoàn đều tham gia hoạt động phong trào này!
                                  </td>
                                </tr>
                              ) : (
                                sortedNonParticipants.map((np, npIdx) => (
                                  <tr key={np.studentId || npIdx} className="hover:bg-rose-950/20 transition-colors">
                                    <td className="p-2.5 text-center text-slate-400 font-mono font-bold">{npIdx + 1}</td>
                                    <td className="p-2.5 font-mono text-slate-400 font-bold">{np.studentId}</td>
                                    <td className="p-2.5 font-bold text-white whitespace-nowrap">{np.name}</td>
                                    <td className="p-2.5 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${np.gender === 'Nữ' ? 'bg-pink-950 text-pink-300' : 'bg-blue-950 text-blue-300'
                                        }`}>
                                        {np.gender}
                                      </span>
                                    </td>
                                    <td className="p-2.5 text-center">
                                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${np.isUnionMember ? 'bg-blue-950 text-blue-300 border border-blue-800' : 'bg-slate-800 text-slate-400'
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

                      {/* Admin feedback notes */}
                      {report.adminFeedback && (
                        <div className="p-2.5 rounded-xl bg-purple-950/30 border border-purple-900/50 text-purple-200 text-xs flex items-center gap-2">
                          <Sparkles className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                          <span><strong>Đoàn trường phản hồi:</strong> {report.adminFeedback}</span>
                        </div>
                      )}
                    </div>
                  );
                })}

                {filteredActivityReports.length === 0 && (
                  <div className="p-12 text-center bg-slate-950 rounded-3xl border border-slate-800 text-slate-400 text-xs space-y-2">
                    <p className="text-base font-bold text-slate-300">Chưa có báo cáo phong trào nào phù hợp với bộ lọc</p>
                    <p className="text-slate-500">Các báo cáo do Bí thư Chi đoàn nộp sẽ tự động xuất hiện tại đây để Đoàn trường kiểm tra và xuất Excel.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sub-Tab 3.6: Centralized Media & Image Library Hub */}
          {mediaHubSubTab === 'media_library' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 text-pink-400" />
                    <span>QUẢN TRỊ TÀI NGUYÊN & KHO MEDIA TOÀN TRƯỜNG</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Quản lý tập trung toàn bộ thư mục hình ảnh, tư liệu minh chứng, tài nguyên công khai & nội bộ theo cấu trúc cây thư mục
                  </p>
                </div>
              </div>
              <ResourceManagerView isEmbedded={true} />
            </div>
          )}

          {/* Sub-Tab 3.7: Document & Folder Repository Management */}
          {mediaHubSubTab === 'documents' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Header & Quick Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-amber-400 flex items-center gap-2">
                    <Folder className="w-4 h-4 text-amber-500" />
                    <span>KHO VĂN BẢN, BIỂU MẪU & TÀI LIỆU ĐOÀN THANH NIÊN</span>
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Quản trị cây thư mục phân cấp, văn bản chỉ đạo, nghị quyết, biểu mẫu sinh hoạt Đoàn và cẩm nang công tác
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsGlobalDocumentModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold flex items-center gap-2 shadow-glow transition-all active:scale-95"
                  >
                    <FolderPlus className="w-4 h-4" />
                    <span>Mở Trình Quản Lý Thư Mục Toàn Diện</span>
                  </button>
                </div>
              </div>

              {/* KPI Stat Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tổng văn bản</p>
                    <p className="text-lg font-black text-white">{documentFiles?.length || 0}</p>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                    <Folder className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Thư mục phân cấp</p>
                    <p className="text-lg font-black text-blue-400">{documentFolders?.length || 0}</p>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Công khai cổng Đoàn</p>
                    <p className="text-lg font-black text-emerald-400">
                      {documentFiles?.filter((d) => d.isPublic).length || 0}
                    </p>
                  </div>
                </div>

                <div className="bg-slate-900/60 border border-slate-800 p-3 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <Download className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Tổng lượt tải</p>
                    <p className="text-lg font-black text-purple-400">
                      {documentFiles?.reduce((acc, f) => acc + (f.downloadCount || 0), 0) || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* Folder Quick Filter Bar */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                <button
                  type="button"
                  onClick={() => setDocFolderFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                    docFolderFilter === 'ALL'
                      ? 'bg-amber-600 text-white shadow-glow'
                      : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  <Folder className="w-3.5 h-3.5" />
                  <span>Tất cả thư mục ({documentFiles?.length || 0})</span>
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
                          ? 'bg-amber-600 text-white shadow-glow'
                          : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <Folder className="w-3.5 h-3.5" style={{ color: folder.color || '#f59e0b' }} />
                      <span>{folder.name}</span>
                      <span className="text-[10px] opacity-75 bg-black/30 px-1.5 py-0.2 rounded-full">
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Search & Category Filter */}
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <div className="relative flex-1 w-full">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={docSearchQuery}
                    onChange={(e) => setDocSearchQuery(e.target.value)}
                    placeholder="Tìm theo tên tài liệu, số hiệu văn bản (Số: ...), người ký hoặc thẻ tag..."
                    className="w-full pl-9 pr-8 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
                  />
                  {docSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setDocSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <select
                    value={docCategoryFilter}
                    onChange={(e) => setDocCategoryFilter(e.target.value)}
                    className="px-3 py-2 bg-slate-900/80 border border-slate-800 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-amber-500 w-full sm:w-auto"
                  >
                    <option value="ALL">Tất cả chuyên mục</option>
                    <option value="form">📋 Biểu mẫu & Đơn từ</option>
                    <option value="directive">⚖️ Chỉ đạo & Nghị quyết</option>
                    <option value="plan">📅 Kế hoạch & Chương trình</option>
                    <option value="report">📊 Báo cáo & Tổng kết</option>
                    <option value="handbook">📘 Cẩm nang & Hướng dẫn</option>
                  </select>
                </div>
              </div>

              {/* Document List Display */}
              {(() => {
                const filteredDocs = (documentFiles || []).filter((doc) => {
                  const matchFolder = docFolderFilter === 'ALL' || doc.folderId === docFolderFilter;
                  const matchCategory = docCategoryFilter === 'ALL' || doc.category === docCategoryFilter;
                  const matchSearch =
                    !docSearchQuery ||
                    doc.title.toLowerCase().includes(docSearchQuery.toLowerCase()) ||
                    (doc.documentNumber && doc.documentNumber.toLowerCase().includes(docSearchQuery.toLowerCase())) ||
                    (doc.signer && doc.signer.toLowerCase().includes(docSearchQuery.toLowerCase())) ||
                    (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(docSearchQuery.toLowerCase()))) ||
                    (doc.description && doc.description.toLowerCase().includes(docSearchQuery.toLowerCase()));
                  return matchFolder && matchCategory && matchSearch;
                });

                if (filteredDocs.length === 0) {
                  return (
                    <div className="py-12 text-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30">
                      <FileText className="w-10 h-10 text-slate-600 mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-semibold text-slate-400">Không tìm thấy tài liệu / văn bản phù hợp</p>
                      <p className="text-xs text-slate-500 mt-1">Thử thay đổi bộ lọc tìm kiếm hoặc mở Trình Quản Lý Thư Mục để tải tệp mới</p>
                      <button
                        type="button"
                        onClick={() => setIsGlobalDocumentModalOpen(true)}
                        className="mt-4 px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-glow"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Tải tệp văn bản mới lên</span>
                      </button>
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
                          className="bg-slate-900/70 border border-slate-800 hover:border-amber-500/40 rounded-2xl p-3.5 space-y-3 transition-all hover:shadow-lg flex flex-col justify-between group"
                        >
                          <div className="space-y-2">
                            {/* Badges row */}
                            <div className="flex items-center justify-between gap-1.5">
                              <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${fmt.bg} ${fmt.text} ${fmt.border}`}>
                                {fmt.label}
                              </span>
                              <div className="flex items-center gap-1">
                                {doc.isPinned && (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-0.5">
                                    <Star className="w-2.5 h-2.5 fill-amber-400" /> Ghim
                                  </span>
                                )}
                                {doc.isPublic ? (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-0.5">
                                    <Globe className="w-2.5 h-2.5" /> Công khai
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                                    Nội bộ
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Title */}
                            <div>
                              <h5
                                onClick={() => {
                                  incrementDocumentViews(doc.id);
                                  setPreviewDocumentFile(doc);
                                }}
                                className="text-xs font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-2 cursor-pointer leading-relaxed"
                                title={doc.title}
                              >
                                {doc.title}
                              </h5>
                              {doc.documentNumber && (
                                <p className="text-[11px] font-mono text-amber-400/90 mt-0.5">
                                  {doc.documentNumber}
                                </p>
                              )}
                            </div>

                            {/* Folder & Signer Info */}
                            <div className="text-[11px] text-slate-400 space-y-1">
                              {folder && (
                                <div className="flex items-center gap-1">
                                  <Folder className="w-3 h-3" style={{ color: folder.color || '#f59e0b' }} />
                                  <span className="truncate">{folder.name}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between text-[10px] text-slate-500">
                                <span>{doc.signer ? `Ký: ${doc.signer}` : (typeof doc.uploadedBy === 'object' ? (doc.uploadedBy?.name || 'Hệ thống') : (doc.uploadedBy || 'Hệ thống'))}</span>
                                <span>{doc.fileSize}</span>
                              </div>
                            </div>
                          </div>

                          {/* Action footer */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1">
                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                              <span className="flex items-center gap-1">
                                <Download className="w-3 h-3" /> {doc.downloadCount || 0}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" /> {doc.viewCount || 0}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  incrementDocumentViews(doc.id);
                                  setPreviewDocumentFile(doc);
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="Xem chi tiết văn bản"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(doc.fileUrl || doc.url || '');
                                  alert('📋 Đã sao chép liên kết tài liệu vào bộ nhớ tạm!');
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                                title="Sao chép link tải tài liệu"
                              >
                                <Copy className="w-3.5 h-3.5" />
                              </button>

                              <a
                                href={doc.fileUrl || doc.url}
                                download={doc.title}
                                target="_blank"
                                rel="noreferrer"
                                onClick={() => incrementDocumentDownloads(doc.id)}
                                className="p-1.5 rounded-lg bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-white transition-colors flex items-center gap-1 text-[10px] font-bold px-2"
                                title="Tải xuống tệp tin"
                              >
                                <Download className="w-3 h-3" />
                                <span>Tải</span>
                              </a>

                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Bạn có chắc muốn xóa văn bản "${doc.title}" khỏi hệ thống?`)) {
                                    deleteDocumentFile(doc.id);
                                  }
                                }}
                                className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-slate-400 hover:text-rose-400 transition-colors"
                                title="Xóa văn bản"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })()}
            </div>
          )}
        </div>
      )}

      {/* ================= MAIN TAB 4: CRITERIA MANAGEMENT ================= */}
      {adminTab === 'criteria' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-red-500" />
                <span>QUẢN TRỊ BỘ TIÊU CHÍ CHẤM ĐIỂM THI ĐUA NỀ NẾP</span>
              </h3>
              <p className="text-xs text-slate-400">Toàn quyền tìm kiếm, thêm, chỉnh sửa mức điểm, định dạng đơn vị và bật/tắt các tiêu chí đánh giá</p>
            </div>
            <button
              onClick={() => {
                setEditingCrit(null);
                setCritForm({
                  code: `${criteria.length + 1}.1`,
                  name: '',
                  groupId: 'I.1',
                  groupName: 'Chuyên cần',
                  groupStandardScore: 40,
                  type: 'deduction',
                  points: 2,
                  unit: 'đ / HS',
                  isSevere: false,
                  isEnabled: true,
                  description: ''
                });
                setIsCriteriaModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm Tiêu Chí Mới</span>
            </button>
          </div>

          {/* SEARCH & FILTER CONTROLS FOR CRITERIA */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3.5">
            {/* Search input */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="text"
                value={critSearch}
                onChange={(e) => setCritSearch(e.target.value)}
                placeholder="🔍 Tìm nhanh theo mã lỗi (1.1, 2.1...), tên hành vi vi phạm, quy định hoặc nhóm tiêu chí..."
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-red-500 focus:outline-none"
              />
              {critSearch && (
                <button
                  type="button"
                  onClick={() => setCritSearch('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs font-bold px-1.5 py-0.5 rounded-md bg-slate-800"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Filter Buttons By Group */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-bold flex items-center gap-1">
                  <span>📂 Lọc theo Nhóm Nội Dung:</span>
                </span>
                <span className="text-[11px] text-amber-400 font-semibold">
                  Hiển thị: <strong>{criteria.filter(c => {
                    if (critGroupFilter !== 'ALL' && c.groupName !== critGroupFilter) return false;
                    if (critTypeFilter !== 'ALL' && c.type !== critTypeFilter) return false;
                    if (critStatusFilter === 'active' && !c.isEnabled) return false;
                    if (critStatusFilter === 'inactive' && c.isEnabled) return false;
                    if (critStatusFilter === 'severe' && !c.isSevere) return false;
                    if (critSearch.trim()) {
                      const q = critSearch.toLowerCase().trim();
                      return (
                        c.name.toLowerCase().includes(q) ||
                        c.code.toLowerCase().includes(q) ||
                        c.groupName.toLowerCase().includes(q) ||
                        (c.description && c.description.toLowerCase().includes(q))
                      );
                    }
                    return true;
                  }).length}</strong> / {criteria.length} tiêu chí
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setCritGroupFilter('ALL')}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${critGroupFilter === 'ALL'
                    ? 'bg-red-600 text-white shadow-glow'
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                    }`}
                >
                  Tất cả nhóm ({criteria.length})
                </button>
                {Array.from(new Set(criteria.map(c => c.groupName))).map(grp => {
                  const count = criteria.filter(c => c.groupName === grp).length;
                  return (
                    <button
                      type="button"
                      key={grp}
                      onClick={() => setCritGroupFilter(grp)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${critGroupFilter === grp
                        ? 'bg-red-600 text-white shadow-glow'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                      <span>{grp}</span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${critGroupFilter === grp ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-300'
                        }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Secondary Filter Buttons: Type & Status */}
            <div className="pt-2 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs">
              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold mr-1">Loại:</span>
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'deduction', label: '⛔ Điểm Trừ (Vi phạm)' },
                  { id: 'addition', label: '⭐ Điểm Cộng (Khen thưởng)' },
                ].map(tf => (
                  <button
                    type="button"
                    key={tf.id}
                    onClick={() => setCritTypeFilter(tf.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${critTypeFilter === tf.id
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              {/* Status & Severity Filter Buttons */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500 font-bold mr-1">Trạng thái:</span>
                {[
                  { id: 'ALL', label: 'Tất cả' },
                  { id: 'severe', label: '🚨 Nghiêm trọng' },
                  { id: 'active', label: '✅ Đang Bật' },
                  { id: 'inactive', label: '🔒 Tạm Tắt' },
                ].map(sf => (
                  <button
                    type="button"
                    key={sf.id}
                    onClick={() => setCritStatusFilter(sf.id as any)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${critStatusFilter === sf.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-slate-900 text-slate-400 hover:text-white'
                      }`}
                  >
                    {sf.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* CRITERIA CARDS GRID */}
          {criteria.filter(c => {
            if (critGroupFilter !== 'ALL' && c.groupName !== critGroupFilter) return false;
            if (critTypeFilter !== 'ALL' && c.type !== critTypeFilter) return false;
            if (critStatusFilter === 'active' && !c.isEnabled) return false;
            if (critStatusFilter === 'inactive' && c.isEnabled) return false;
            if (critStatusFilter === 'severe' && !c.isSevere) return false;
            if (critSearch.trim()) {
              const q = critSearch.toLowerCase().trim();
              return (
                c.name.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q) ||
                c.groupName.toLowerCase().includes(q) ||
                (c.description && c.description.toLowerCase().includes(q))
              );
            }
            return true;
          }).length === 0 ? (
            <div className="p-8 text-center bg-slate-950/60 rounded-2xl border border-slate-800 text-slate-400 space-y-2">
              <p className="text-sm font-bold text-white">Không tìm thấy tiêu chí nào phù hợp với bộ lọc</p>
              <p className="text-xs">Hãy thử đổi từ khóa tìm kiếm hoặc nhấn "Tất cả nhóm" để xem danh sách</p>
              <button
                type="button"
                onClick={() => {
                  setCritSearch('');
                  setCritGroupFilter('ALL');
                  setCritTypeFilter('ALL');
                  setCritStatusFilter('ALL');
                }}
                className="mt-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-amber-300 rounded-xl text-xs font-bold"
              >
                Xóa Bộ Lọc
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {criteria.filter(c => {
                if (critGroupFilter !== 'ALL' && c.groupName !== critGroupFilter) return false;
                if (critTypeFilter !== 'ALL' && c.type !== critTypeFilter) return false;
                if (critStatusFilter === 'active' && !c.isEnabled) return false;
                if (critStatusFilter === 'inactive' && c.isEnabled) return false;
                if (critStatusFilter === 'severe' && !c.isSevere) return false;
                if (critSearch.trim()) {
                  const q = critSearch.toLowerCase().trim();
                  return (
                    c.name.toLowerCase().includes(q) ||
                    c.code.toLowerCase().includes(q) ||
                    c.groupName.toLowerCase().includes(q) ||
                    (c.description && c.description.toLowerCase().includes(q))
                  );
                }
                return true;
              }).map(c => (
                <div
                  key={c.id}
                  className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-amber-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {c.code}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold">{c.groupName}</span>
                      {c.isSevere && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-950 text-rose-300 text-[9px] font-extrabold border border-rose-800 animate-pulse">
                          Nghiêm trọng
                        </span>
                      )}
                    </div>
                    <p className="font-bold text-white">{c.name}</p>
                    <p className="text-[11px] text-slate-400">
                      Mức tính: <strong className={c.type === 'deduction' ? 'text-rose-400' : 'text-emerald-400'}>
                        {c.type === 'deduction' ? `-${c.points}` : `+${c.points}`}{c.unit}
                      </strong>
                      {c.description && <span className="text-slate-500 block text-[10px] italic">{c.description}</span>}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingCrit(c);
                        setCritForm({
                          code: c.code,
                          name: c.name,
                          groupId: c.groupId,
                          groupName: c.groupName,
                          groupStandardScore: c.groupStandardScore,
                          type: c.type,
                          points: c.points,
                          unit: c.unit,
                          isSevere: !!c.isSevere,
                          isEnabled: c.isEnabled,
                          description: c.description || ''
                        });
                        setIsCriteriaModalOpen(true);
                      }}
                      title="Chỉnh sửa tiêu chí"
                      className="p-1.5 rounded-lg bg-slate-900 text-amber-400 hover:bg-amber-950"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => toggleCriterion(c.id)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${c.isEnabled
                        ? 'bg-emerald-950/80 border-emerald-600 text-emerald-300'
                        : 'bg-slate-900 border-slate-700 text-slate-500'
                        }`}
                    >
                      {c.isEnabled ? 'Đang Bật' : 'Tạm Tắt'}
                    </button>

                    <button
                      onClick={() => {
                        if (confirm(`Bạn có chắc muốn xóa hoặc ẩn tiêu chí "${c.name}"?`)) {
                          const res = deleteCriterion(c.id);
                          alert(res.message);
                        }
                      }}
                      title="Xóa hoặc Ẩn tiêu chí"
                      className="p-1.5 rounded-lg bg-slate-900 text-slate-500 hover:text-rose-400"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ================= MAIN TAB 5: SYSTEM HUB (TÀI KHOẢN, PHÂN QUYỀN & CÀI ĐẶT NHẬN DIỆN TRƯỜNG GỘP CHUNG) ================= */}
      {adminTab === 'system_hub' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-5">
          {/* Sub-tabs Header inside System Hub */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                <Settings className="w-5 h-5 text-purple-500" />
                <span>QUẢN LÝ TÀI KHOẢN, CÀI ĐẶT TRƯỜNG & XUẤT BÁO CÁO</span>
              </h3>
              <p className="text-xs text-slate-400">Quản trị 5 nhóm tài khoản, tùy biến nhận diện, chốt sổ thi đua tuần và kiểm soát nhật ký hệ thống</p>
            </div>

            {/* Sub-tabs pills (5 Tabs) */}
            <div className="flex flex-wrap bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold gap-1">
              <button
                type="button"
                onClick={() => setSystemHubSubTab('users')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${systemHubSubTab === 'users'
                  ? 'bg-purple-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>👥 Tài Khoản & Phân Quyền ({users.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemHubSubTab('settings')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${systemHubSubTab === 'settings'
                  ? 'bg-red-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>🎨 Nhận Diện Trường</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemHubSubTab('slides')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${systemHubSubTab === 'slides'
                  ? 'bg-amber-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>📸 Slide Ảnh Hoạt Động ({activitySlides.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setIsGlobalDocumentModalOpen(true)}
                className="px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 bg-gradient-to-r from-amber-600/30 to-orange-600/30 border border-amber-500/50 text-amber-300 hover:text-white hover:from-amber-600 hover:to-orange-600 shadow-sm"
                title="Mở kho tài liệu, biểu mẫu và cẩm nang Đoàn"
              >
                <Folder className="w-3.5 h-3.5 text-amber-400" />
                <span>📁 Kho Văn Bản ({documentFiles?.length || 0})</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemHubSubTab('export')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${systemHubSubTab === 'export'
                  ? 'bg-emerald-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>📑 Chốt Sổ & Báo Cáo</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemHubSubTab('backup')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${systemHubSubTab === 'backup'
                  ? 'bg-cyan-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>💾 Sao Lưu & CSDL</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemHubSubTab('rollover')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${systemHubSubTab === 'rollover'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-glow'
                  : 'text-amber-400 hover:text-white'
                  }`}
              >
                <span>🔄 Chuyển Giao Năm Học</span>
              </button>

              <button
                type="button"
                onClick={() => setSystemHubSubTab('logs')}
                className={`px-3 py-1.5 rounded-xl transition-all flex items-center gap-1.5 ${systemHubSubTab === 'logs'
                  ? 'bg-blue-600 text-white shadow-glow'
                  : 'text-slate-400 hover:text-white'
                  }`}
              >
                <span>📜 Nhật Ký ({auditLogs.length})</span>
              </button>
            </div>
          </div>

          {/* Sub-Tab 5.1: USERS & ROLES */}
          {systemHubSubTab === 'users' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                <div>
                  <h4 className="text-xs font-bold text-slate-300">DANH SÁCH TÀI KHOẢN 5 NHÓM VAI TRÒ</h4>
                  <p className="text-[11px] text-slate-400">Admin, Giáo viên Chủ nhiệm, Đội Cờ đỏ, Bí thư Chi đoàn, Đoàn viên / Học sinh</p>
                </div>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setUserForm({
                      username: '',
                      password: '',
                      name: '',
                      role: 'manager',
                      roleTitle: 'Giáo viên Chủ nhiệm',
                      classId: '10/1',
                      assignedZone: 'Khối 10',
                      phone: '',
                      email: ''
                    });
                    setIsUserModalOpen(true);
                  }}
                  className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm Tài Khoản Mới</span>
                </button>
              </div>

              {/* User Filters & Search */}
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-slate-400 font-bold mr-1">Lọc vai trò:</span>
                  {[
                    { id: 'ALL', label: `Tất cả (${users.length})` },
                    { id: 'admin', label: `Admin (${users.filter(u => u.role === 'admin').length})` },
                    { id: 'manager', label: `GVCN (${users.filter(u => u.role === 'manager').length})` },
                    { id: 'auditor', label: `Cờ Đỏ (${users.filter(u => u.role === 'auditor').length})` },
                    { id: 'youth_secretary', label: `Bí Thư Chi Đoàn (${users.filter(u => u.role === 'youth_secretary').length})` },
                    { id: 'user', label: `Đoàn Viên / HS (${users.filter(u => u.role === 'user').length})` },
                  ].map(rf => (
                    <button
                      key={rf.id}
                      onClick={() => setUserRoleFilter(rf.id)}
                      className={`px-3 py-1.5 rounded-xl font-bold transition-all ${userRoleFilter === rf.id
                        ? 'bg-purple-600 text-white shadow-glow'
                        : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
                        }`}
                    >
                      {rf.label}
                    </button>
                  ))}
                </div>

                <div className="relative pt-1 border-t border-slate-900">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-4 text-slate-500" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Tìm kiếm tài khoản, họ tên, lớp phụ trách, khu vực trực, số điện thoại..."
                    className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:border-purple-500"
                  />
                </div>
              </div>

              {/* User Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-950 text-slate-300 border-b border-slate-800">
                      <th className="p-3 font-bold text-center w-12 text-slate-400">STT</th>
                      <SortableTh
                        label="Mã / Tài Khoản"
                        columnKey="username"
                        currentSortKey={userTableSort.key}
                        currentSortDir={userTableSort.direction}
                        onSort={(k) => handleToggleSort(setUserTableSort, k)}
                      />
                      <SortableTh
                        label="Họ và Tên"
                        columnKey="name"
                        currentSortKey={userTableSort.key}
                        currentSortDir={userTableSort.direction}
                        onSort={(k) => handleToggleSort(setUserTableSort, k)}
                      />
                      <SortableTh
                        label="Vai Trò / Phân Quyền"
                        columnKey="role"
                        currentSortKey={userTableSort.key}
                        currentSortDir={userTableSort.direction}
                        onSort={(k) => handleToggleSort(setUserTableSort, k)}
                      />
                      <SortableTh
                        label="Phụ Trách (Lớp / Khu Vực)"
                        columnKey="classId"
                        currentSortKey={userTableSort.key}
                        currentSortDir={userTableSort.direction}
                        onSort={(k) => handleToggleSort(setUserTableSort, k)}
                      />
                      <th className="p-3 font-bold">Liên Hệ</th>
                      <th className="p-3 text-center font-bold">Trạng Thái</th>
                      <th className="p-3 text-right font-bold">Thao Tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {filteredSortedUsers.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-500">
                          Không tìm thấy tài khoản người dùng nào phù hợp bộ lọc!
                        </td>
                      </tr>
                    ) : (
                      filteredSortedUsers.map((u, index) => (
                        <tr key={u.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-3 text-center font-mono font-bold text-slate-400">
                            <span className="px-2 py-0.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                              {index + 1}
                            </span>
                          </td>
                          <td className="p-3 font-mono font-bold text-amber-400 whitespace-nowrap">{u.username}</td>
                          <td className="p-3 font-bold text-white whitespace-nowrap">{u.name}</td>
                          <td className="p-3">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${u.role === 'admin' ? 'bg-red-950 text-red-300 border-red-700' :
                              u.role === 'manager' ? 'bg-blue-950 text-blue-300 border-blue-700' :
                                u.role === 'auditor' ? 'bg-amber-950 text-amber-300 border-amber-700' :
                                  u.role === 'youth_secretary' ? 'bg-emerald-950 text-emerald-300 border-emerald-700' :
                                    'bg-slate-800 text-slate-300 border-slate-700'
                              }`}>
                              {u.roleTitle}
                            </span>
                          </td>
                          <td className="p-3 text-slate-300">
                            {u.role === 'admin' ? (
                              <span className="text-red-400 font-bold">🏛️ Toàn trường</span>
                            ) : u.role === 'auditor' ? (
                              <span className="text-amber-400 font-bold">📍 {u.assignedZone || 'Khối 10'}</span>
                            ) : u.classId ? (
                              <span className="text-blue-400 font-bold">🏫 {u.classId}</span>
                            ) : (
                              <span className="text-slate-500 italic">Toàn trường</span>
                            )}
                          </td>
                          <td className="p-3 text-slate-400 text-[11px]">
                            {u.phone && <div>📞 {u.phone}</div>}
                            {u.email && <div>✉️ {u.email}</div>}
                            {!u.phone && !u.email && <span className="text-slate-600">Chưa cập nhật</span>}
                          </td>
                          <td className="p-3 text-center">
                            <button
                              onClick={() => toggleUserActive(u.id)}
                              title="Bấm để Khóa / Mở khóa tài khoản"
                              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${u.isActive
                                ? 'bg-emerald-950 text-emerald-300 border-emerald-700 hover:bg-emerald-900'
                                : 'bg-rose-950 text-rose-300 border-rose-700 hover:bg-rose-900'
                                }`}
                            >
                              {u.isActive ? '✅ Hoạt động' : '🔒 Bị khóa'}
                            </button>
                          </td>
                        <td className="p-3 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => { const p = resetPassword(u.id); alert(`Đã reset mật khẩu tài khoản ${u.username} về mặc định: ${p}`); }}
                            title="Cấp lại mật khẩu mặc định (123456@Password)"
                            className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-400 text-[11px] font-bold inline-flex items-center gap-1 border border-slate-700"
                          >
                            <KeyRound className="w-3 h-3 text-amber-400" />
                            <span>Reset Pass</span>
                          </button>

                          <button
                            onClick={() => {
                              setEditingUser(u);
                              setUserForm({
                                username: u.username,
                                name: u.name,
                                role: u.role,
                                roleTitle: u.roleTitle,
                                classId: u.classId || '10/1',
                                assignedZone: u.assignedZone || 'Khối 10',
                                phone: u.phone || '',
                                email: u.email || ''
                              });
                              setIsUserModalOpen(true);
                            }}
                            title="Sửa tài khoản"
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-amber-950 text-amber-400 border border-slate-700"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>

                          {u.role !== 'admin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Bạn có chắc chắn muốn xóa tài khoản ${u.username} (${u.name})? Hành động này không thể hoàn tác.`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              title="Xóa tài khoản"
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-950 text-rose-400 border border-slate-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Sub-Tab 5.2: TÙY BIẾN THÔNG TIN NHẬN DIỆN TRƯỜNG */}
          {systemHubSubTab === 'settings' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-2">
                <h4 className="text-xs font-bold text-slate-300">TÙY BIẾN THÔNG TIN NHẬN DIỆN TRƯỜNG</h4>
                <p className="text-[11px] text-slate-400">Cập nhật Tên trường, Khẩu hiệu, Logo, Banner đầu trang, Banner chân trang, Thông tin liên hệ và 6 Bảng màu sắc giao diện chủ đạo</p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setIsSavingSettings(true);
                  try {
                    const ok = await updateSchoolSettings(settingsForm);
                    setSettingsSaved(true);
                    setTimeout(() => setSettingsSaved(false), 4000);
                    if (ok) {
                      alert('🎉 Đã lưu và đồng bộ cài đặt nhận diện trường lên Cloud & toàn bộ các thiết bị thành công!');
                    }
                  } catch (err: any) {
                    alert('Lỗi khi lưu cài đặt: ' + (err?.message || 'Không xác định'));
                  } finally {
                    setIsSavingSettings(false);
                  }
                }}
                className="space-y-6 text-xs max-w-4xl"
              >
                {settingsSaved && (
                  <div className="p-3.5 rounded-2xl bg-emerald-950 border border-emerald-700 text-emerald-300 font-bold flex items-center gap-2 animate-fadeIn">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span>Đã lưu & phát tín hiệu đồng bộ nhận diện trường tới tất cả các thiết bị thành công!</span>
                  </div>
                )}

                {/* SECTION 1: THEME COLOR PALETTE */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <label className="block font-bold text-white text-sm">
                      🎨 Màu Sắc Chủ Đạo:
                    </label>
                    <p className="text-[11px] text-slate-400">Lựa chọn nhanh giữa 6 bảng màu hiện đại cho toàn hệ thống</p>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5">
                    {[
                      { id: 'emerald', name: 'Xanh Lá Cây', bg: 'bg-emerald-600', border: 'border-emerald-500' },
                      { id: 'red', name: 'Đỏ Đoàn viên', bg: 'bg-red-600', border: 'border-red-500' },
                      { id: 'blue', name: 'Xanh Dương Thanh Niên', bg: 'bg-blue-600', border: 'border-blue-500' },
                      { id: 'purple', name: 'Tím Hoàng Gia', bg: 'bg-purple-600', border: 'border-purple-500' },
                      { id: 'amber', name: 'Cam Nhiệt Huyết', bg: 'bg-amber-600', border: 'border-amber-500' },
                      { id: 'slate', name: 'Xám Titan', bg: 'bg-slate-600', border: 'border-slate-500' },
                    ].map(theme => {
                      const isSelected = settingsForm.themeColor === theme.id || (theme.id === 'emerald' && (settingsForm.themeColor as any) === 'green');
                      return (
                        <button
                          type="button"
                          key={theme.id}
                          onClick={() => setSettingsForm({ ...settingsForm, themeColor: theme.id as any })}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-all ${isSelected
                            ? `${theme.bg} text-white border-white shadow-glow ring-2 ring-white/50 scale-105`
                            : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-white hover:border-slate-500'
                            }`}
                        >
                          <div className={`w-5 h-5 rounded-full ${theme.bg} border-2 border-white`} />
                          <span className="font-bold text-[11px] text-center">{theme.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SECTION 2: BRANDING IMAGES (LOGO, TOP BANNER, FOOTER BANNER) */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-white text-sm flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-amber-400" />
                      <span>Hình Ảnh Nhận Diện: Logo, Banner Đầu Trang & Banner Chân Trang</span>
                    </h4>
                  </div>

                  {/* Logo Trường Học */}
                  <div className="space-y-2">
                    <label className="block font-bold text-slate-300">Logo Trường Học (Hỗ trợ tải trực tiếp hoặc chọn từ Kho Media):</label>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      {settingsForm.logoUrl && (
                        <img
                          src={settingsForm.logoUrl}
                          alt="Logo trường"
                          className="w-14 h-14 object-cover rounded-xl border border-slate-700 bg-slate-900 shrink-0 shadow-md"
                        />
                      )}
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex flex-wrap sm:flex-nowrap gap-2">
                          <input
                            type="text"
                            value={settingsForm.logoUrl || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, logoUrl: e.target.value })}
                            placeholder="https://... hoặc chọn từ Kho Media"
                            className="flex-1 min-w-[200px] p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                          />
                          <MediaPickerButton
                            category="branding"
                            value={settingsForm.logoUrl}
                            onSelect={(url) => setSettingsForm(prev => ({ ...prev, logoUrl: Array.isArray(url) ? url[0] : url }))}
                            label="Kho Media Logo"
                            className="!py-2"
                          />
                          <button
                            type="button"
                            disabled={isUploadingImage === 'logo'}
                            onClick={() => logoFileInputRef.current?.click()}
                            className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-sm text-xs"
                          >
                            {isUploadingImage === 'logo' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <span>{isUploadingImage === 'logo' ? 'Đang tải...' : 'Tải File Máy'}</span>
                          </button>
                        </div>
                        <input
                          ref={logoFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Logo Đoàn Thanh Niên (Huy hiệu Đoàn) */}
                  <div className="space-y-2 pt-3 border-t border-slate-900">
                    <div className="flex items-center justify-between">
                      <label className="block font-bold text-slate-300">
                        Logo Đoàn Thanh Niên (Huy hiệu Đoàn):
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          const defaultUnionLogo = 'https://upload.wikimedia.org/wikipedia/vi/8/87/Huy_hi%E1%BB%87u_%C4%90o%C3%A0n.svg';
                          setSettingsForm(prev => ({ ...prev, youthUnionLogoUrl: defaultUnionLogo }));
                          updateSchoolSettings({ ...settingsForm, youthUnionLogoUrl: defaultUnionLogo });
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                      >
                        ⭐ Khôi phục Huy hiệu Đoàn chuẩn
                      </button>
                    </div>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                      <div className="w-14 h-14 rounded-xl p-1 bg-gradient-to-tr from-red-600 via-amber-500 to-emerald-600 border border-amber-400/40 bg-slate-950 shrink-0 shadow-glow flex items-center justify-center">
                        <img
                          src={settingsForm.youthUnionLogoUrl || 'https://upload.wikimedia.org/wikipedia/vi/8/87/Huy_hi%E1%BB%87u_%C4%90o%C3%A0n.svg'}
                          alt="Huy hiệu Đoàn"
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://upload.wikimedia.org/wikipedia/vi/8/87/Huy_hi%E1%BB%87u_%C4%90o%C3%A0n.svg';
                          }}
                        />
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        <div className="flex flex-wrap sm:flex-nowrap gap-2">
                          <input
                            type="text"
                            value={settingsForm.youthUnionLogoUrl || ''}
                            onChange={(e) => setSettingsForm({ ...settingsForm, youthUnionLogoUrl: e.target.value })}
                            placeholder="https://... hoặc chọn từ Kho Media"
                            className="flex-1 min-w-[200px] p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                          />
                          <MediaPickerButton
                            category="branding"
                            value={settingsForm.youthUnionLogoUrl}
                            onSelect={(url) => setSettingsForm(prev => ({ ...prev, youthUnionLogoUrl: Array.isArray(url) ? url[0] : url }))}
                            label="Kho Media Huy Hiệu"
                            className="!py-2"
                          />
                          <button
                            type="button"
                            disabled={isUploadingImage === 'youth_logo'}
                            onClick={() => youthUnionLogoFileInputRef.current?.click()}
                            className="px-3.5 py-2 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0 shadow-glow cursor-pointer disabled:opacity-50 text-xs"
                          >
                            {isUploadingImage === 'youth_logo' ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                            ) : (
                              <Upload className="w-3.5 h-3.5" />
                            )}
                            <span>{isUploadingImage === 'youth_logo' ? 'Đang tải...' : 'Tải File Máy'}</span>
                          </button>
                        </div>
                        <input
                          ref={youthUnionLogoFileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleYouthUnionLogoUpload}
                          className="hidden"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Top Banner */}
                  <div className="space-y-2 pt-3 border-t border-slate-900">
                    <label className="block font-bold text-slate-300">
                      Banner Đầu Trang (Top Banner - Hiển thị đầu Cổng thông tin):
                    </label>
                    {settingsForm.bannerTopImage && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-700 h-28 w-full group">
                        <img
                          src={settingsForm.bannerTopImage}
                          alt="Top Banner Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                          <span className="text-[11px] font-bold text-white">Xem trước hiển thị: {settingsForm.schoolName}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap sm:flex-nowrap gap-2">
                      <input
                        type="text"
                        value={settingsForm.bannerTopImage || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, bannerTopImage: e.target.value })}
                        placeholder="https://... hoặc chọn từ Kho Media"
                        className="flex-1 min-w-[200px] p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                      <MediaPickerButton
                        category="branding"
                        value={settingsForm.bannerTopImage}
                        onSelect={(url) => setSettingsForm(prev => ({ ...prev, bannerTopImage: Array.isArray(url) ? url[0] : url }))}
                        label="Kho Media Banner"
                        className="!py-2"
                      />
                      <button
                        type="button"
                        disabled={isUploadingImage === 'top_banner'}
                        onClick={() => topBannerFileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-sm text-xs"
                      >
                        {isUploadingImage === 'top_banner' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingImage === 'top_banner' ? 'Đang tải...' : 'Tải File Máy'}</span>
                      </button>
                      <input
                        ref={topBannerFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleTopBannerUpload}
                        className="hidden"
                      />
                    </div>
                  </div>

                  {/* Footer Banner */}
                  <div className="space-y-2 pt-3 border-t border-slate-900">
                    <label className="block font-bold text-slate-300">
                      Banner Chân Trang (Footer Banner - Hiển thị cuối trang web):
                    </label>
                    {settingsForm.footerBannerImage && (
                      <div className="relative rounded-xl overflow-hidden border border-slate-700 h-28 w-full group">
                        <img
                          src={settingsForm.footerBannerImage}
                          alt="Footer Banner Preview"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
                          <span className="text-[11px] font-bold text-white">Xem trước chân trang: {settingsForm.slogan}</span>
                        </div>
                      </div>
                    )}
                    <div className="flex flex-wrap sm:flex-nowrap gap-2">
                      <input
                        type="text"
                        value={settingsForm.footerBannerImage || ''}
                        onChange={(e) => setSettingsForm({ ...settingsForm, footerBannerImage: e.target.value })}
                        placeholder="https://... hoặc chọn từ Kho Media"
                        className="flex-1 min-w-[200px] p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                      />
                      <MediaPickerButton
                        category="branding"
                        value={settingsForm.footerBannerImage}
                        onSelect={(url) => setSettingsForm(prev => ({ ...prev, footerBannerImage: Array.isArray(url) ? url[0] : url }))}
                        label="Kho Media Banner"
                        className="!py-2"
                      />
                      <button
                        type="button"
                        disabled={isUploadingImage === 'footer_banner'}
                        onClick={() => footerBannerFileInputRef.current?.click()}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl flex items-center gap-1.5 shrink-0 disabled:opacity-50 cursor-pointer shadow-sm text-xs"
                      >
                        {isUploadingImage === 'footer_banner' ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        ) : (
                          <Upload className="w-3.5 h-3.5" />
                        )}
                        <span>{isUploadingImage === 'footer_banner' ? 'Đang tải...' : 'Tải File Máy'}</span>
                      </button>
                      <input
                        ref={footerBannerFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFooterBannerUpload}
                        className="hidden"
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 3: TEXT INFO & CONTACT */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                  <h4 className="font-bold text-white text-sm">
                    📝 Thông Tin Liên Hệ & Pháp Nhân
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Tên Trường Học (Hiển thị Header):</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.schoolName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, schoolName: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Tên Đơn Vị Đoàn Thanh Niên:</label>
                      <input
                        type="text"
                        required
                        value={settingsForm.youthUnionName}
                        onChange={(e) => setSettingsForm({ ...settingsForm, youthUnionName: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Khẩu Hiệu / Slogan:</label>
                    <input
                      type="text"
                      value={settingsForm.slogan}
                      onChange={(e) => setSettingsForm({ ...settingsForm, slogan: e.target.value })}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Địa Chỉ:</label>
                    <input
                      type="text"
                      value={settingsForm.address}
                      onChange={(e) => setSettingsForm({ ...settingsForm, address: e.target.value })}
                      placeholder="Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng"
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Hotline Đoàn:</label>
                      <input
                        type="text"
                        value={settingsForm.phone}
                        onChange={(e) => setSettingsForm({ ...settingsForm, phone: e.target.value })}
                        placeholder="0988806194"
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-amber-400"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Email Liên Hệ:</label>
                      <input
                        type="email"
                        value={settingsForm.email}
                        onChange={(e) => setSettingsForm({ ...settingsForm, email: e.target.value })}
                        placeholder="doantruongquangtrungdonggiang@gmail.com"
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono font-bold text-blue-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-bold text-sm shadow-glow flex items-center gap-2 cursor-pointer transition-all"
                  >
                    {isSavingSettings ? (
                      <Loader2 className="w-4 h-4 animate-spin text-white" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    <span>{isSavingSettings ? 'Đang lưu & đồng bộ Cloud...' : 'Lưu Thay Đổi Nhận Diện Trường'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Sub-Tab 5.3: ACTIVITY PHOTO SLIDESHOW CONFIGURATION */}
          {systemHubSubTab === 'slides' && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                    QUẢN LÝ SLIDE ẢNH HOẠT ĐỘNG PHONG TRÀO ĐOÀN TRƯỜNG
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Cấu hình hình ảnh, tiêu đề, tag sự kiện và thứ tự hiển thị của Slide ảnh hoạt động trên Cổng thông tin công cộng
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 border border-slate-800 text-amber-400">
                    Đang hiển thị: {activitySlides.filter(s => s.isActive).length}/{activitySlides.length} ảnh
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSlide(null);
                      setSlideForm({
                        title: '',
                        subtitle: '',
                        imageUrl: '',
                        date: new Date().toLocaleDateString('vi-VN'),
                        tag: 'Phong trào',
                        isActive: true,
                        order: activitySlides.length + 1
                      });
                      setIsSlideModalOpen(true);
                    }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm Slide Ảnh Mới</span>
                  </button>
                </div>
              </div>

              {/* Slides Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activitySlides.sort((a, b) => a.order - b.order).map(slide => (
                  <div
                    key={slide.id}
                    className={`glass-panel rounded-2xl p-4 border flex flex-col justify-between space-y-3 transition-all ${slide.isActive
                      ? 'border-slate-800 hover:border-slate-700 bg-slate-900/60'
                      : 'border-slate-800/50 bg-slate-950/40 opacity-70'
                      }`}
                  >
                    <div className="space-y-3">
                      {/* Image Preview with Badges */}
                      <div className="w-full h-44 rounded-xl overflow-hidden relative border border-slate-800 bg-slate-950">
                        <img
                          src={slide.imageUrl}
                          alt={slide.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute top-2 left-2 flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-600 text-white shadow">
                            {slide.tag || 'Phong trào'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-slate-950/80 text-amber-300 border border-slate-700">
                            Thứ tự: #{slide.order}
                          </span>
                        </div>

                        <div className="absolute top-2 right-2">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${slide.isActive
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                            : 'bg-slate-900 text-slate-400 border-slate-800'
                            }`}>
                            {slide.isActive ? '🟢 Đang Bật' : '🔒 Đang Tắt'}
                          </span>
                        </div>

                        {slide.date && (
                          <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-[10px] text-slate-300 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {slide.date}
                          </div>
                        )}
                      </div>

                      {/* Content details */}
                      <div>
                        <h5 className="font-extrabold text-white text-sm line-clamp-2">{slide.title}</h5>
                        {slide.subtitle && (
                          <p className="text-xs text-slate-400 line-clamp-2 mt-1">{slide.subtitle}</p>
                        )}
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => toggleActivitySlideStatus(slide.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${slide.isActive
                          ? 'bg-slate-800 hover:bg-slate-700 text-amber-300'
                          : 'bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200'
                          }`}
                      >
                        {slide.isActive ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        <span>{slide.isActive ? 'Tạm Ẩn Slide' : 'Bật Hiển Thị'}</span>
                      </button>

                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingSlide(slide);
                            setSlideForm({
                              title: slide.title,
                              subtitle: slide.subtitle || '',
                              imageUrl: slide.imageUrl,
                              date: slide.date || new Date().toLocaleDateString('vi-VN'),
                              tag: slide.tag || 'Phong trào',
                              isActive: slide.isActive,
                              order: slide.order
                            });
                            setIsSlideModalOpen(true);
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-blue-600 text-slate-300 hover:text-white transition-colors"
                          title="Chỉnh sửa slide"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`Bạn có chắc chắn muốn xóa slide ảnh "${slide.title}" không?`)) {
                              deleteActivitySlide(slide.id);
                            }
                          }}
                          className="p-2 rounded-xl bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white transition-colors"
                          title="Xóa slide"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sub-Tab 5.4: EXPORT & STATISTICAL REPORTS (CHỐT SỔ, THỐNG KÊ & BÁO CÁO TOÀN DIỆN) */}
          {systemHubSubTab === 'export' && (
            <div className="space-y-6 animate-fadeIn">
              {/* Header with Quick Actions */}
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-emerald-400" />
                    <span>CHỐT SỔ, BÁO CÁO & THỐNG KÊ THI ĐUA TOÀN TRƯỜNG</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Tự động tổng hợp dữ liệu {weeksConfig.length} tuần đã tạo, theo dõi điểm lũy kế 18 lớp đến nay, biểu đồ phân tích và xuất sổ Excel
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportCumulativeExcel}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-2 shadow-glow active:scale-95 transition-all shrink-0"
                  >
                    <Download className="w-4 h-4" />
                    <span>Xuất Thống Kê Lũy Kế (.xlsx)</span>
                  </button>

                  {/* Thanh công cụ tùy chỉnh theo tuần: Chọn tuần + Tải Excel + Khóa/Mở Khóa sổ */}
                  <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-2xl bg-slate-900/90 border border-slate-700 shadow-md">
                    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <span className="text-[11px] font-bold text-slate-400">Chọn Tuần:</span>
                      <select
                        value={selectedReportWeek}
                        onChange={(e) => setSelectedReportWeek(Number(e.target.value))}
                        className="bg-transparent text-amber-400 font-extrabold text-xs focus:outline-none cursor-pointer pr-1"
                        title="Tùy chọn tuần xuất Excel và Khóa sổ"
                      >
                        {weeksConfig.map(w => (
                          <option key={w.weekNumber} value={w.weekNumber} className="bg-slate-900 text-white font-medium">
                            {w.title} {w.isCurrent ? '(Hiện tại)' : ''} {w.isLocked ? '🔒 Đã Khóa' : ''}
                          </option>
                        ))}
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExportSingleWeekExcel(selectedReportWeek)}
                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all shadow-glow"
                      title={`Tải file Excel báo cáo chi tiết Tuần ${selectedReportWeek}`}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Tải Excel Tuần {selectedReportWeek}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        const isTargetLocked = Boolean(weeksConfig.find(w => w.weekNumber === selectedReportWeek)?.isLocked);
                        if (isTargetLocked) {
                          setPinAction('unlock');
                        } else {
                          setPinAction('lock');
                        }
                        setPinInput('');
                        setPinError('');
                      }}
                      className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 active:scale-95 transition-all ${Boolean(weeksConfig.find(w => w.weekNumber === selectedReportWeek)?.isLocked)
                        ? 'bg-amber-600 hover:bg-amber-500 text-white'
                        : 'bg-rose-600 hover:bg-rose-500 text-white shadow-glow'
                        }`}
                      title={`Khóa / Mở khóa sổ điểm thi đua Tuần ${selectedReportWeek}`}
                    >
                      {Boolean(weeksConfig.find(w => w.weekNumber === selectedReportWeek)?.isLocked) ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                      <span>{Boolean(weeksConfig.find(w => w.weekNumber === selectedReportWeek)?.isLocked) ? `Mở Khóa Tuần ${selectedReportWeek}` : `Khóa Sổ Tuần ${selectedReportWeek}`}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sub-Navigation Pills within Report Hub */}
              <div className="flex flex-wrap bg-slate-950 p-1 rounded-2xl border border-slate-800 text-xs font-bold gap-1.5">
                <button
                  type="button"
                  onClick={() => setReportViewTab('weeks_grid')}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${reportViewTab === 'weeks_grid'
                    ? 'bg-emerald-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Calendar className="w-4 h-4" />
                  <span>1. Thống Kê Theo Tuần ({weeksConfig.length} Tuần)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportViewTab('cumulative_ranking')}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${reportViewTab === 'cumulative_ranking'
                    ? 'bg-amber-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Trophy className="w-4 h-4" />
                  <span>2. Bảng Điểm Tổng Hợp Lũy Kế 18 Lớp</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportViewTab('charts')}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${reportViewTab === 'charts'
                    ? 'bg-blue-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>3. Biểu Đồ Thống Kê Trực Quan</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportViewTab('weekly_analysis')}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${reportViewTab === 'weekly_analysis'
                    ? 'bg-purple-600 text-white shadow-glow'
                    : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <Search className="w-4 h-4" />
                  <span>4. Phân Tích Chi Tiết Theo Tuần</span>
                </button>

                <button
                  type="button"
                  onClick={() => setReportViewTab('semester_summary')}
                  className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${reportViewTab === 'semester_summary'
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-glow'
                    : 'text-amber-400 hover:text-white bg-slate-900/60 border border-amber-500/20'
                    }`}
                >
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>5. Sơ Kết & Tổng Kết Học Kỳ (Excel & PDF)</span>
                </button>
              </div>

              {/* SECTION 1: WEEKS GRID (TỰ ĐỘNG HIỂN THỊ CÁC TUẦN ĐÃ TẠO) */}
              {reportViewTab === 'weeks_grid' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        DANH SÁCH {weeksConfig.length} TUẦN THI ĐUA ĐÃ CẤU HÌNH TRÊN HỆ THỐNG
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Tự động đồng bộ trạng thái khóa sổ, tính điểm trung bình và xếp hạng top 3 của từng tuần
                      </p>
                    </div>

                    <span className="text-xs text-slate-400">
                      Gốc hiển thị: <strong className="text-amber-400 font-bold">Tuần {activeWeek}</strong>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {weeksConfig.map(week => {
                      const weekScores = getWeeklyScores(week.weekNumber);
                      const weekVios = violations.filter(v => v.weekNumber === week.weekNumber && v.status !== 'approved_appeal');
                      const avg = weekScores.length > 0 ? (weekScores.reduce((sum, s) => sum + s.finalScore, 0) / weekScores.length).toFixed(1) : '1440';
                      const top1 = weekScores[0];
                      const top2 = weekScores[1];
                      const top3 = weekScores[2];

                      return (
                        <div
                          key={week.weekNumber}
                          className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${week.weekNumber === activeWeek
                            ? 'bg-slate-900 border-amber-500/60 shadow-lg ring-1 ring-amber-500/30'
                            : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
                            }`}
                        >
                          <div className="space-y-2">
                            {/* Card Header */}
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="p-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs font-mono font-bold text-amber-400">
                                  T{week.weekNumber < 10 ? `0${week.weekNumber}` : week.weekNumber}
                                </span>
                                <div>
                                  <h6 className="font-extrabold text-white text-sm">{week.title}</h6>
                                  <p className="text-[10px] text-slate-400 font-mono">
                                    {week.startDate} ➔ {week.endDate}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-col items-end gap-1">
                                {week.isCurrent && (
                                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-amber-500 text-slate-950 uppercase">
                                    Tuần Hiện Tại
                                  </span>
                                )}
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${week.isLocked
                                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                                  }`}>
                                  {week.isLocked ? '🔒 Đã Khóa' : '🟢 Mở Điểm'}
                                </span>
                              </div>
                            </div>

                            {/* Stat Summary Box */}
                            <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
                              <div>
                                <span className="text-[10px] text-slate-400 block">Điểm Trung Bình:</span>
                                <span className="font-black text-white">{avg}đ</span>
                              </div>
                              <div>
                                <span className="text-[10px] text-slate-400 block">Lỗi Vi Phạm:</span>
                                <span className="font-bold text-rose-400">{weekVios.length} lượt</span>
                              </div>
                            </div>

                            {/* Top 3 Podium Mini */}
                            <div className="space-y-1 pt-1">
                              <span className="text-[10px] text-slate-400 block font-bold">Top 3 Dẫn Đầu:</span>
                              <div className="flex items-center gap-1.5 text-xs">
                                <span className="px-2 py-0.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-[11px]">
                                  🥇 {top1 ? `${top1.className} (${top1.finalScore}đ)` : '-'}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 font-bold text-[11px]">
                                  🥈 {top2 ? top2.className : '-'}
                                </span>
                                <span className="px-2 py-0.5 rounded-lg bg-slate-800 text-slate-400 font-bold text-[11px]">
                                  🥉 {top3 ? top3.className : '-'}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Card Action Buttons */}
                          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedReportWeek(week.weekNumber);
                                setReportViewTab('weekly_analysis');
                              }}
                              className="px-3 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white border border-purple-500/30 text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Search className="w-3 h-3" />
                              <span>Thống Kê Chi Tiết</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleExportSingleWeekExcel(week.weekNumber)}
                              className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-600 text-slate-300 hover:text-white transition-all"
                              title={`Tải file Excel Tuần ${week.weekNumber}`}
                            >
                              <Download className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* SECTION 2: CUMULATIVE MULTI-WEEK LEADERBOARD (ĐIỂM THI ĐUA TỔNG HỢP LŨY KẾ ĐẾN NAY) */}
              {reportViewTab === 'cumulative_ranking' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
                    <div>
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        BẢNG ĐIỂM THI ĐUA TỔNG HỢP LŨY KẾ 18 LỚP (TÍNH ĐẾN THỜI ĐIỂM HIỆN TẠI)
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Cộng dồn điểm số của tất cả {weeksConfig.length} tuần thi đua đã diễn ra để xếp hạng toàn trường và xét thi đua
                      </p>
                    </div>

                    {/* Grade Filter */}
                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                      {(['ALL', 10, 11, 12] as const).map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setCumulativeGradeFilter(g)}
                          className={`px-3 py-1 rounded-lg transition-all ${cumulativeGradeFilter === g
                            ? 'bg-amber-600 text-white shadow-glow'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          {g === 'ALL' ? 'Tất Cả 18 Lớp' : `Khối ${g}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-amber-950/20 border border-amber-800/40 space-y-1">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">🏆 Lớp Dẫn Đầu Toàn Trường</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-white">{multiWeekSummary[0]?.className || '-'}</span>
                        <span className="text-xs font-mono font-bold text-amber-400">{multiWeekSummary[0]?.totalCumulativeScore || 0}đ</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block">GVCN: {multiWeekSummary[0]?.homeroomTeacher || '-'}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">📈 Điểm TB Toàn Trường</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-emerald-400">
                          {multiWeekSummary.length > 0
                            ? (multiWeekSummary.reduce((sum, c) => sum + c.avgScore, 0) / multiWeekSummary.length).toFixed(1)
                            : '1440'}đ
                        </span>
                        <span className="text-xs font-mono text-slate-400">/ tuần</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Tổng {weeksConfig.length} tuần thi đua</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">⭐ Chi Đoàn Xuất Sắc</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-purple-400">
                          {multiWeekSummary.filter(c => c.rating === 'Xuất sắc').length} Lớp
                        </span>
                        <span className="text-xs font-bold text-purple-300">
                          {Math.round((multiWeekSummary.filter(c => c.rating === 'Xuất sắc').length / 18) * 100)}%
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Đạt điểm TB ≥ 1425đ</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">🚨 Tổng Lỗi Vi Phạm</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-rose-400">
                          {multiWeekSummary.reduce((sum, c) => sum + c.totalViolations, 0)} Lượt
                        </span>
                        <span className="text-xs font-bold text-rose-300">toàn trường</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Tính từ đầu học kỳ</span>
                    </div>
                  </div>

                  {/* Cumulative Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                          <th className="p-3 font-bold text-center w-12 text-slate-400">STT</th>
                          <SortableTh
                            label="Hạng"
                            columnKey="cumulativeRank"
                            currentSortKey={cumulativeSort.key}
                            currentSortDir={cumulativeSort.direction}
                            onSort={(k) => handleToggleSort(setCumulativeSort, k)}
                            align="center"
                            width="60px"
                          />
                          <SortableTh
                            label="Lớp"
                            columnKey="className"
                            currentSortKey={cumulativeSort.key}
                            currentSortDir={cumulativeSort.direction}
                            onSort={(k) => handleToggleSort(setCumulativeSort, k)}
                          />
                          <SortableTh
                            label="Khối"
                            columnKey="grade"
                            currentSortKey={cumulativeSort.key}
                            currentSortDir={cumulativeSort.direction}
                            onSort={(k) => handleToggleSort(setCumulativeSort, k)}
                          />
                          <SortableTh
                            label="Giáo Viên Chủ Nhiệm"
                            columnKey="homeroomTeacher"
                            currentSortKey={cumulativeSort.key}
                            currentSortDir={cumulativeSort.direction}
                            onSort={(k) => handleToggleSort(setCumulativeSort, k)}
                          />
                          {weeksConfig.map(w => (
                            <th key={w.weekNumber} className="p-3 font-bold text-center font-mono">
                              T{w.weekNumber}
                            </th>
                          ))}
                          <SortableTh
                            label="Tổng Điểm"
                            columnKey="totalCumulativeScore"
                            currentSortKey={cumulativeSort.key}
                            currentSortDir={cumulativeSort.direction}
                            onSort={(k) => handleToggleSort(setCumulativeSort, k)}
                            align="center"
                            className="text-amber-400 bg-amber-950/20"
                          />
                          <SortableTh
                            label="Điểm TB"
                            columnKey="avgScore"
                            currentSortKey={cumulativeSort.key}
                            currentSortDir={cumulativeSort.direction}
                            onSort={(k) => handleToggleSort(setCumulativeSort, k)}
                            align="center"
                            className="text-emerald-400"
                          />
                          <SortableTh
                            label="Lỗi VP"
                            columnKey="totalViolations"
                            currentSortKey={cumulativeSort.key}
                            currentSortDir={cumulativeSort.direction}
                            onSort={(k) => handleToggleSort(setCumulativeSort, k)}
                            align="center"
                            className="text-rose-400"
                          />
                          <th className="p-3 font-bold text-center">Danh Hiệu</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {sortedCumulativeSummary.map((item, idx) => (
                          <tr key={item.classId} className="hover:bg-slate-900/60 transition-colors">
                            <td className="p-3 text-center font-mono font-bold text-slate-400">
                              {idx + 1}
                            </td>
                              <td className="p-3 text-center font-black">
                                {item.cumulativeRank === 1 ? (
                                  <span className="px-2 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-glow">
                                    🥇 #1
                                  </span>
                                ) : item.cumulativeRank === 2 ? (
                                  <span className="px-2 py-1 rounded-lg bg-slate-300 text-slate-950 font-black text-xs">
                                    🥈 #2
                                  </span>
                                ) : item.cumulativeRank === 3 ? (
                                  <span className="px-2 py-1 rounded-lg bg-amber-700 text-white font-black text-xs">
                                    🥉 #3
                                  </span>
                                ) : (
                                  <span className="text-slate-400 font-mono">#{item.cumulativeRank}</span>
                                )}
                              </td>

                              <td className="p-3 font-extrabold text-white text-sm">
                                {item.className}
                              </td>

                              <td className="p-3">
                                <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                                  Khối {item.grade}
                                </span>
                              </td>

                              <td className="p-3 text-slate-300 font-medium">
                                {item.homeroomTeacher}
                              </td>

                              {/* Weekly Score Columns */}
                              {item.weeklyBreakdowns.map((wb) => (
                                <td key={wb.weekNumber} className="p-3 text-center font-mono text-slate-300">
                                  <span className={wb.finalScore >= 1430 ? 'text-emerald-400 font-bold' : wb.finalScore < 1400 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                                    {wb.finalScore}
                                  </span>
                                </td>
                              ))}

                              {/* Total Cumulative Score */}
                              <td className="p-3 text-center font-mono font-black text-sm text-amber-400 bg-amber-950/20">
                                {item.totalCumulativeScore}đ
                              </td>

                              {/* Average Score */}
                              <td className="p-3 text-center font-mono font-bold text-emerald-400">
                                {item.avgScore}đ
                              </td>

                              {/* Total Violations */}
                              <td className="p-3 text-center font-bold text-rose-400">
                                {item.totalViolations > 0 ? `-${item.totalViolations}` : '0'}
                              </td>

                              {/* Rating / Tier Badge */}
                              <td className="p-3 text-center">
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.cumulativeRank === 1
                                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                  : item.rating === 'Xuất sắc'
                                    ? 'bg-purple-950/40 text-purple-300 border-purple-800/50'
                                    : item.rating === 'Tiên tiến'
                                      ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                                      : 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                                  }`}>
                                  {item.cumulativeRank === 1 ? '🏆 Cờ Luân Lưu' : item.rating}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 3: STATISTICAL CHARTS (BỔ XUNG BIỂU ĐỒ THỐNG KÊ) */}
              {reportViewTab === 'charts' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Top Bar Filters */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-400" />
                        <span>HỆ THỐNG BIỂU ĐỒ THỐNG KÊ THI ĐUA TRỰC QUAN</span>
                      </h5>
                      <p className="text-[11px] text-slate-400">So sánh điểm số giữa 18 lớp, theo dõi xu hướng qua các tuần và phân tích cơ cấu lỗi vi phạm</p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
                      {(['ALL', 10, 11, 12] as const).map(g => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setChartGradeFilter(g)}
                          className={`px-3 py-1 rounded-lg transition-all ${chartGradeFilter === g
                            ? 'bg-blue-600 text-white shadow-glow'
                            : 'text-slate-400 hover:text-white'
                            }`}
                        >
                          {g === 'ALL' ? 'Toàn Trường (18 Lớp)' : `Khối ${g}`}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Chart 1: Bar Chart comparing 18 classes */}
                  <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h6 className="font-extrabold text-white text-sm flex items-center gap-2">
                          <BarChart3 className="w-4 h-4 text-amber-400" />
                          <span>1. Biểu Đồ So Sánh Điểm Thi Đua Trung Bình 18 Lớp</span>
                        </h6>
                        <p className="text-[11px] text-slate-400">Cột điểm tính theo điểm trung bình qua {weeksConfig.length} tuần thi đua (Điểm chuẩn tối đa 1440đ)</p>
                      </div>

                      <div className="flex items-center gap-3 text-[11px] font-bold">
                        <span className="flex items-center gap-1.5 text-blue-400">
                          <span className="w-2.5 h-2.5 rounded bg-blue-500"></span> Khối 10
                        </span>
                        <span className="flex items-center gap-1.5 text-purple-400">
                          <span className="w-2.5 h-2.5 rounded bg-purple-500"></span> Khối 11
                        </span>
                        <span className="flex items-center gap-1.5 text-rose-400">
                          <span className="w-2.5 h-2.5 rounded bg-rose-500"></span> Khối 12
                        </span>
                      </div>
                    </div>

                    {/* Interactive Horizontal Bar Chart Container */}
                    <div className="space-y-2.5 pt-2">
                      {multiWeekSummary
                        .filter(cls => chartGradeFilter === 'ALL' || cls.grade === chartGradeFilter)
                        .map((cls) => {
                          const percent = Math.min(100, Math.max(0, ((cls.avgScore - 1300) / (1440 - 1300)) * 100));
                          const colorGradient = cls.grade === 10
                            ? 'from-blue-600 to-cyan-500'
                            : cls.grade === 11
                              ? 'from-purple-600 to-indigo-500'
                              : 'from-rose-600 to-amber-500';

                          return (
                            <div key={cls.classId} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <div className="flex items-center gap-2">
                                  <span className="font-black text-white w-12">{cls.className}</span>
                                  <span className="text-[10px] text-slate-400">GVCN: {cls.homeroomTeacher}</span>
                                </div>

                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] text-slate-400">Hạng #{cls.cumulativeRank}</span>
                                  <span className="font-mono font-extrabold text-white">{cls.avgScore}đ</span>
                                </div>
                              </div>

                              <div className="w-full h-3 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${colorGradient} transition-all duration-700`}
                                  style={{ width: `${percent}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                    </div>
                  </div>

                  {/* Chart 2: Category Violation Breakdown & Multi-Week Trend Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Donut/Progress Criteria Breakdown */}
                    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
                      <div>
                        <h6 className="font-extrabold text-white text-sm flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-emerald-400" />
                          <span>2. Phân Bố Vi Phạm Theo 5 Nhóm Tiêu Chí</span>
                        </h6>
                        <p className="text-[11px] text-slate-400">Tỉ lệ phần trăm các nhóm hành vi vi phạm nề nếp toàn trường</p>
                      </div>

                      <div className="space-y-3 pt-1">
                        {criteriaBreakdown.map((item, idx) => {
                          const colors = [
                            'from-rose-600 to-pink-500',
                            'from-amber-600 to-yellow-500',
                            'from-blue-600 to-indigo-500',
                            'from-emerald-600 to-teal-500',
                            'from-purple-600 to-violet-500'
                          ];
                          return (
                            <div key={item.group} className="space-y-1">
                              <div className="flex items-center justify-between text-xs">
                                <span className="font-bold text-slate-300">{item.group}</span>
                                <span className="font-mono font-bold text-white">
                                  {item.count} lượt ({item.percent}%)
                                </span>
                              </div>

                              <div className="w-full h-2 rounded-full bg-slate-900 overflow-hidden border border-slate-800">
                                <div
                                  className={`h-full rounded-full bg-gradient-to-r ${colors[idx % colors.length]} transition-all duration-700`}
                                  style={{ width: `${Math.max(5, item.percent)}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Multi-Week Trend Overview */}
                    <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4">
                      <div>
                        <h6 className="font-extrabold text-white text-sm flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-purple-400" />
                          <span>3. Biến Động Điểm Của Top 5 Lớp Dẫn Đầu Qua Các Tuần</span>
                        </h6>
                        <p className="text-[11px] text-slate-400">Theo dõi sự duy trì phong độ qua từng tuần học</p>
                      </div>

                      <div className="space-y-3 pt-1">
                        {multiWeekSummary.slice(0, 5).map((cls) => (
                          <div key={cls.classId} className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-2">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="font-black text-white text-xs">{cls.className}</span>
                                <span className="px-2 py-0.5 rounded text-[10px] bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                                  Hạng #{cls.cumulativeRank}
                                </span>
                              </div>

                              <span className="font-mono font-extrabold text-amber-400 text-xs">
                                Tổng {cls.totalCumulativeScore}đ
                              </span>
                            </div>

                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                              {cls.weeklyBreakdowns.map((wb) => (
                                <span key={wb.weekNumber} className="flex-1 text-center py-1 rounded bg-slate-950 border border-slate-800">
                                  T{wb.weekNumber}: <strong className="text-white">{wb.finalScore}</strong>
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SECTION 4: WEEKLY DEEP-DIVE ANALYSIS (TẠO THỐNG KÊ THEO TUẦN) */}
              {reportViewTab === 'weekly_analysis' && (
                <div className="space-y-4 animate-fadeIn">
                  {/* Selector Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-800">
                    <div>
                      <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                        BÁO CÁO PHÂN TÍCH THỐNG KÊ CHI TIẾT - TUẦN {selectedReportWeek}
                      </h5>
                      <p className="text-[11px] text-slate-400">
                        Chi tiết xếp hạng 18 lớp, tổng điểm trừ, top lỗi vi phạm và danh sách lớp cần chấn chỉnh
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs text-slate-400 font-bold">Chọn Tuần:</label>
                      <select
                        value={selectedReportWeek}
                        onChange={(e) => setSelectedReportWeek(Number(e.target.value))}
                        className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs focus:outline-none"
                      >
                        {weeksConfig.map(w => (
                          <option key={w.weekNumber} value={w.weekNumber}>
                            {w.title} {w.isCurrent ? '(Hiện tại)' : ''} {w.isLocked ? '🔒' : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Top 3 Best & Top 3 Need Improvement */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Top 3 Best */}
                    <div className="glass-panel rounded-2xl p-4 border border-emerald-800/40 bg-emerald-950/10 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-emerald-600/20 text-emerald-400 font-bold text-xs">
                          🥇
                        </span>
                        <h6 className="font-extrabold text-white text-xs uppercase tracking-wider">
                          TOP 3 LỚP THI ĐUA XUẤT SẮC NHẤT (TUẦN {selectedReportWeek})
                        </h6>
                      </div>

                      <div className="space-y-2">
                        {selectedWeekScores.slice(0, 3).map((s, idx) => (
                          <div key={s.classId} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-300 font-black flex items-center justify-center text-xs">
                                #{idx + 1}
                              </span>
                              <div>
                                <p className="font-extrabold text-white">{s.className}</p>
                                <span className="text-[10px] text-slate-400">Khối {s.grade}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-mono font-black text-emerald-400 text-sm">{s.finalScore}đ</span>
                              <span className="text-[10px] text-slate-400 block">-{s.totalDeduction}đ vi phạm</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Top 3 Need Improvement */}
                    <div className="glass-panel rounded-2xl p-4 border border-rose-800/40 bg-rose-950/10 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="p-1.5 rounded-xl bg-rose-600/20 text-rose-400 font-bold text-xs">
                          ⚠️
                        </span>
                        <h6 className="font-extrabold text-white text-xs uppercase tracking-wider">
                          CÁC LỚP CÓ ĐIỂM TRỪ CAO CẦN CHẤN CHỈNH (TUẦN {selectedReportWeek})
                        </h6>
                      </div>

                      <div className="space-y-2">
                        {selectedWeekScores.slice(-3).reverse().map((s) => (
                          <div key={s.classId} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-300 font-black flex items-center justify-center text-xs">
                                #{s.rank}
                              </span>
                              <div>
                                <p className="font-extrabold text-white">{s.className}</p>
                                <span className="text-[10px] text-slate-400">GVCN: {classes.find(c => c.id === s.classId)?.gvcnName || '-'}</span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className="font-mono font-black text-rose-400 text-sm">{s.finalScore}đ</span>
                              <span className="text-[10px] text-rose-300 block font-bold">-{s.totalDeduction}đ ({s.violationCount} lỗi)</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Weekly Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                          <th className="p-3 font-bold text-center w-12 text-slate-400">STT</th>
                          <SortableTh
                            label="Hạng"
                            columnKey="rank"
                            currentSortKey={weeklyMatrixSort.key}
                            currentSortDir={weeklyMatrixSort.direction}
                            onSort={(k) => handleToggleSort(setWeeklyMatrixSort, k)}
                            align="center"
                            width="60px"
                          />
                          <SortableTh
                            label="Lớp"
                            columnKey="className"
                            currentSortKey={weeklyMatrixSort.key}
                            currentSortDir={weeklyMatrixSort.direction}
                            onSort={(k) => handleToggleSort(setWeeklyMatrixSort, k)}
                          />
                          <SortableTh
                            label="Khối"
                            columnKey="grade"
                            currentSortKey={weeklyMatrixSort.key}
                            currentSortDir={weeklyMatrixSort.direction}
                            onSort={(k) => handleToggleSort(setWeeklyMatrixSort, k)}
                          />
                          <th className="p-3 font-bold text-center">T2</th>
                          <th className="p-3 font-bold text-center">T3</th>
                          <th className="p-3 font-bold text-center">T4</th>
                          <th className="p-3 font-bold text-center">T5</th>
                          <th className="p-3 font-bold text-center">T6</th>
                          <th className="p-3 font-bold text-center">T7</th>
                          <SortableTh
                            label="Điểm Trừ"
                            columnKey="totalDeduction"
                            currentSortKey={weeklyMatrixSort.key}
                            currentSortDir={weeklyMatrixSort.direction}
                            onSort={(k) => handleToggleSort(setWeeklyMatrixSort, k)}
                            align="center"
                            className="text-rose-400"
                          />
                          <SortableTh
                            label="Điểm Thưởng"
                            columnKey="totalBonus"
                            currentSortKey={weeklyMatrixSort.key}
                            currentSortDir={weeklyMatrixSort.direction}
                            onSort={(k) => handleToggleSort(setWeeklyMatrixSort, k)}
                            align="center"
                            className="text-emerald-400"
                          />
                          <SortableTh
                            label="Điểm Tổng"
                            columnKey="finalScore"
                            currentSortKey={weeklyMatrixSort.key}
                            currentSortDir={weeklyMatrixSort.direction}
                            onSort={(k) => handleToggleSort(setWeeklyMatrixSort, k)}
                            align="center"
                            className="text-amber-400 font-black"
                          />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {sortedWeeklyScores.map((s, idx) => (
                          <tr key={s.classId} className="hover:bg-slate-900/60 transition-colors">
                            <td className="p-3 text-center font-mono font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="p-3 text-center font-black">
                              {s.rank === 1 ? '🥇 #1' : s.rank === 2 ? '🥈 #2' : s.rank === 3 ? '🥉 #3' : `#${s.rank}`}
                            </td>
                            <td className="p-3 font-extrabold text-white">{s.className}</td>
                            <td className="p-3 text-slate-300">Khối {s.grade}</td>
                            <td className="p-2.5 text-center font-mono text-slate-300">{s.dailyScores.T2.final}</td>
                            <td className="p-2.5 text-center font-mono text-slate-300">{s.dailyScores.T3.final}</td>
                            <td className="p-2.5 text-center font-mono text-slate-300">{s.dailyScores.T4.final}</td>
                            <td className="p-2.5 text-center font-mono text-slate-300">{s.dailyScores.T5.final}</td>
                            <td className="p-2.5 text-center font-mono text-slate-300">{s.dailyScores.T6.final}</td>
                            <td className="p-2.5 text-center font-mono text-slate-300">{s.dailyScores.T7.final}</td>
                            <td className="p-2.5 text-center font-mono font-bold text-rose-400">-{s.totalDeduction}đ</td>
                            <td className="p-2.5 text-center font-mono font-bold text-emerald-400">+{s.totalBonus}đ</td>
                            <td className="p-2.5 text-center font-mono font-black text-amber-400 text-sm">{s.finalScore}đ</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* SECTION 5: SEMESTER & ANNUAL EVALUATION SUMMARY (SƠ KẾT & TỔNG KẾT HỌC KỲ / CẢ NĂM) */}
              {reportViewTab === 'semester_summary' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Filter & Action Header */}
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Award className="w-5 h-5 text-amber-400 shrink-0" />
                        <h5 className="text-sm sm:text-base font-black text-white uppercase tracking-wider">
                          SƠ KẾT & TỔNG KẾT THI ĐUA NỀ NẾP (ĐA ĐỊNH DẠNG EXCEL & PDF)
                        </h5>
                      </div>
                      <p className="text-xs text-slate-400">
                        Tính điểm trung bình tuần, tổng hợp lỗi vi phạm, cộng điểm phong trào và xếp hạng danh hiệu Chi đoàn toàn trường
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {/* Term Selector */}
                      <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700 text-xs font-bold">
                        {[
                          { id: 'HK1', label: 'Học Kỳ I (Tuần 1-18)' },
                          { id: 'HK2', label: 'Học Kỳ II (Tuần 19-35)' },
                          { id: 'YEAR', label: 'Cả Năm (Tuần 1-35)' }
                        ].map(t => (
                          <button
                            key={t.id}
                            type="button"
                            onClick={() => setSemesterReportType(t.id as any)}
                            className={`px-3 py-1.5 rounded-lg transition-all ${semesterReportType === t.id
                              ? 'bg-amber-600 text-white shadow-glow'
                              : 'text-slate-400 hover:text-white'
                              }`}
                          >
                            {t.label}
                          </button>
                        ))}
                      </div>

                      {/* Export Actions */}
                      <button
                        type="button"
                        onClick={handleExportSemesterExcel}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow transition-all active:scale-95"
                        title="Xuất bảng sơ kết ra file Excel với đầy đủ điểm số chi tiết từng tuần để dễ dàng tùy chỉnh"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        <span>Xuất Excel Sơ Kết (.xlsx)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportSemesterPDF}
                        className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow transition-all active:scale-95"
                        title="Xuất báo cáo sơ kết ra file PDF trang trọng có quốc hiệu, tiêu ngữ và chữ ký Đoàn trường / BGH"
                      >
                        <Download className="w-4 h-4" />
                        <span>Xuất Báo Cáo PDF Có Chữ Ký</span>
                      </button>
                    </div>
                  </div>

                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-950/40 to-slate-900 border border-amber-800/40 space-y-1">
                      <span className="text-[10px] text-amber-300 font-bold uppercase tracking-wider block">🏆 Dẫn Đầu {semesterReportType}</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-white">{semesterClassScores[0]?.className || '-'}</span>
                        <span className="text-xs font-mono font-bold text-amber-400">{semesterClassScores[0]?.finalSemesterScore || 0}đ</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block truncate">GVCN: {classes.find(c => c.id === semesterClassScores[0]?.classId)?.gvcnName || '-'}</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">📊 Điểm TB Toàn Trường</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-emerald-400">
                          {semesterClassScores.length > 0
                            ? Math.round(semesterClassScores.reduce((sum, c) => sum + c.finalSemesterScore, 0) / semesterClassScores.length)
                            : 1440}đ
                        </span>
                        <span className="text-xs font-mono text-slate-400">/ tuần</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Xét trên {semesterClassScores[0]?.totalWeeksEvaluated || 0} tuần thi đua</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">🎖️ Chi Đoàn Vững Mạnh XS</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-purple-400">
                          {semesterClassScores.filter(c => c.rank <= 3).length} Chi Đoàn
                        </span>
                        <span className="text-xs font-bold text-purple-300">Top 3 Toàn Trường</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Được tặng Cờ thi đua Đoàn</span>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">⚖️ Khiếu Nại Đã Duyệt</span>
                      <div className="flex items-center justify-between">
                        <span className="text-base font-black text-blue-400">
                          {semesterClassScores.reduce((sum, c) => sum + c.resolvedAppeals, 0)} Vụ
                        </span>
                        <span className="text-xs font-bold text-blue-300">Đã hoàn điểm</span>
                      </div>
                      <span className="text-[10px] text-slate-500 block">Bảo vệ quyền lợi công bằng</span>
                    </div>
                  </div>

                  {/* Semester Leaderboard Table */}
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60 shadow-inner">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                          <th className="p-3 font-bold text-center w-12 text-slate-400">STT</th>
                          <SortableTh
                            label="Hạng"
                            columnKey="rank"
                            currentSortKey={semesterSort.key}
                            currentSortDir={semesterSort.direction}
                            onSort={(k) => handleToggleSort(setSemesterSort, k)}
                            align="center"
                            width="60px"
                          />
                          <SortableTh
                            label="Chi Đoàn / Lớp"
                            columnKey="className"
                            currentSortKey={semesterSort.key}
                            currentSortDir={semesterSort.direction}
                            onSort={(k) => handleToggleSort(setSemesterSort, k)}
                          />
                          <SortableTh
                            label="Khối"
                            columnKey="grade"
                            currentSortKey={semesterSort.key}
                            currentSortDir={semesterSort.direction}
                            onSort={(k) => handleToggleSort(setSemesterSort, k)}
                          />
                          <th className="p-3 font-bold">Giáo Viên Chủ Nhiệm</th>
                          <SortableTh
                            label="Số Tuần"
                            columnKey="totalWeeksEvaluated"
                            currentSortKey={semesterSort.key}
                            currentSortDir={semesterSort.direction}
                            onSort={(k) => handleToggleSort(setSemesterSort, k)}
                            align="center"
                          />
                          <SortableTh
                            label="Tổng Trừ"
                            columnKey="totalDeductions"
                            currentSortKey={semesterSort.key}
                            currentSortDir={semesterSort.direction}
                            onSort={(k) => handleToggleSort(setSemesterSort, k)}
                            align="center"
                            className="text-rose-400"
                          />
                          <SortableTh
                            label="Tổng Thưởng"
                            columnKey="totalBonuses"
                            currentSortKey={semesterSort.key}
                            currentSortDir={semesterSort.direction}
                            onSort={(k) => handleToggleSort(setSemesterSort, k)}
                            align="center"
                            className="text-emerald-400"
                          />
                          <SortableTh
                            label="Lỗi VP"
                            columnKey="totalViolations"
                            currentSortKey={semesterSort.key}
                            currentSortDir={semesterSort.direction}
                            onSort={(k) => handleToggleSort(setSemesterSort, k)}
                            align="center"
                          />
                          <SortableTh
                            label="Điểm TB Học Kỳ"
                            columnKey="finalSemesterScore"
                            currentSortKey={semesterSort.key}
                            currentSortDir={semesterSort.direction}
                            onSort={(k) => handleToggleSort(setSemesterSort, k)}
                            align="center"
                            className="text-amber-400 bg-amber-950/20 font-black"
                          />
                          <th className="p-3 font-bold text-center">Danh Hiệu Thi Đua</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {sortedSemesterScores.map((item, idx) => (
                          <tr key={item.classId} className="hover:bg-slate-900/60 transition-colors">
                            <td className="p-3 text-center font-mono font-bold text-slate-400">
                              {idx + 1}
                            </td>
                            <td className="p-3 text-center font-black">
                              {item.rank === 1 ? (
                                <span className="px-2 py-1 rounded-lg bg-amber-500 text-slate-950 font-black text-xs shadow-glow">
                                  🥇 #1
                                </span>
                              ) : item.rank === 2 ? (
                                <span className="px-2 py-1 rounded-lg bg-slate-300 text-slate-950 font-black text-xs">
                                  🥈 #2
                                </span>
                              ) : item.rank === 3 ? (
                                <span className="px-2 py-1 rounded-lg bg-amber-700 text-white font-black text-xs">
                                  🥉 #3
                                </span>
                              ) : (
                                <span className="text-slate-400 font-mono">#{item.rank}</span>
                              )}
                            </td>

                            <td className="p-3 font-extrabold text-white text-sm">
                              {item.className}
                            </td>

                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-300">
                                Khối {item.grade}
                              </span>
                            </td>

                            <td className="p-3 text-slate-300 font-medium">
                              {classes.find(c => c.id === item.classId)?.gvcnName || 'Chưa gán'}
                            </td>

                            <td className="p-3 text-center font-mono text-slate-400">
                              {item.totalWeeksEvaluated} tuần
                            </td>

                            <td className="p-3 text-center font-mono font-bold text-rose-400">
                              -{item.totalDeductions}đ
                            </td>

                            <td className="p-3 text-center font-mono font-bold text-emerald-400">
                              +{item.totalBonuses}đ
                            </td>

                            <td className="p-3 text-center font-bold text-slate-300">
                              {item.totalViolations} lượt
                            </td>

                            <td className="p-3 text-center font-mono font-black text-sm text-amber-400 bg-amber-950/20">
                              {item.finalSemesterScore}đ
                            </td>

                            <td className="p-3 text-center">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${item.rank <= 3
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                                : item.rank <= 9
                                  ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/50'
                                  : item.rank <= 15
                                    ? 'bg-blue-950/40 text-blue-300 border-blue-800/50'
                                    : 'bg-rose-950/40 text-rose-300 border-rose-800/50'
                                }`}>
                                {item.awardTitle}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Sub-Tab 5.5: DATABASE BACKUP & RESTORE (QUẢN TRỊ SAO LƯU & CSDL ĐÁM MÂY) */}
          {systemHubSubTab === 'backup' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="pb-3 border-b border-slate-800">
                <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <span>QUẢN TRỊ LƯU TRỮ ĐÁM MÂY & SAO LƯU PHỤC HỒI CSDL (DATA SNAPSHOT & BACKUP)</span>
                </h4>
                <p className="text-xs text-slate-400">
                  Sao lưu toàn diện 100% CSDL (Học sinh, Lớp học, Tiêu chí, Vi phạm, Báo cáo phong trào, Lịch trực, Phân quyền) sang định dạng JSON Snapshot và Multi-Sheet Excel
                </p>
              </div>

              {/* Action Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Backup JSON Card */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-cyan-400">
                      <Download className="w-5 h-5" />
                      <h5 className="font-extrabold text-sm text-white">1. Sao Lưu Toàn Bộ CSDL (File JSON Snapshot)</h5>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Tạo một bản sao chụp (Snapshot) hoàn chỉnh của toàn bộ hệ thống gồm 18 lớp, danh sách học sinh, điểm nề nếp tất cả các tuần, khiếu nại, sự kiện và tài khoản quản trị.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportFullJSONBackup}
                    className="w-full py-2.5 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95"
                  >
                    <Download className="w-4 h-4" />
                    <span>Tải File Snapshot JSON (.json)</span>
                  </button>
                </div>

                {/* Backup Multi-Sheet Excel Card */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <FileSpreadsheet className="w-5 h-5" />
                      <h5 className="font-extrabold text-sm text-white">2. Sao Lưu CSDL Ra File Excel Multi-Sheet (.xlsx)</h5>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Tự động phân tách CSDL thành các bảng tính riêng biệt: [Lớp Học], [Học Sinh], [Tiêu Chí], [Vi Phạm], [Phong Trào], [Nhật Ký] để lưu trữ văn thư và chỉnh sửa độc lập.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleExportMultiSheetExcelBackup}
                    className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95"
                  >
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>Xuất File Excel Multi-Sheet (.xlsx)</span>
                  </button>
                </div>

                {/* Restore JSON Card */}
                <div className="glass-panel rounded-2xl p-5 border border-purple-800/40 bg-purple-950/10 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-purple-400">
                      <Upload className="w-5 h-5" />
                      <h5 className="font-extrabold text-sm text-white">3. Khôi Phục Dữ Liệu Từ File Snapshot JSON</h5>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Nạp lại dữ liệu từ tệp sao lưu JSON đã tải về trước đó. Hệ thống sẽ tự động đối chiếu và cập nhật CSDL ngay lập tức.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <input
                      ref={backupFileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleImportJSONBackup}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => backupFileInputRef.current?.click()}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Chọn Tệp JSON Để Khôi Phục</span>
                    </button>
                  </div>
                </div>

                {/* Storage Optimizer & Cache Cleaner */}
                <div className="glass-panel rounded-2xl p-5 border border-slate-800 bg-slate-900/40 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-amber-400">
                      <HardDrive className="w-5 h-5" />
                      <h5 className="font-extrabold text-sm text-white">4. Tối Ưu Bộ Nhớ & Dọn Dữ Liệu Tạm</h5>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Dọn dẹp các bản ghi nhật ký kiểm toán cũ, tối ưu bộ nhớ đệm LocalStorage và tăng tốc độ xử lý của bảng điểm 18 lớp.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const res = cleanOldStorageData(60);
                      alert(res.message);
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all active:scale-95"
                  >
                    <RefreshCw className="w-4 h-4 text-amber-400" />
                    <span>Dọn Dẹp & Tối Ưu Hóa Bộ Nhớ</span>
                  </button>
                </div>

                {/* Cloud Sync Supabase Card */}
                <div className="glass-panel rounded-2xl p-5 border border-emerald-800/40 bg-emerald-950/10 flex flex-col justify-between space-y-4 md:col-span-2">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Database className="w-5 h-5" />
                      <h5 className="font-extrabold text-sm text-white">5. Đồng Bộ Toàn Diện Dữ Liệu Lên CSDL Đám Mây Supabase Cloud</h5>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Đẩy toàn bộ 18 lớp học, danh sách đoàn viên/học sinh, tiêu chí thi đua, cài đặt nhận diện trường và vi phạm lên hệ thống cơ sở dữ liệu PostgreSQL đám mây của Supabase. Dữ liệu sẽ được bảo vệ vĩnh viễn và tự động chia sẻ cho toàn bộ giáo viên và học sinh.
                    </p>
                    {cloudSyncResult && (
                      <div className={`p-3 rounded-xl text-xs font-bold ${
                        cloudSyncResult.success 
                          ? 'bg-emerald-950/80 border border-emerald-700 text-emerald-300' 
                          : 'bg-rose-950/80 border border-rose-700 text-rose-300'
                      }`}>
                        {cloudSyncResult.message}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    disabled={isSyncingCloud}
                    onClick={handleSyncToSupabaseCloud}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs flex items-center justify-center gap-2 shadow-glow transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSyncingCloud ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Đang đồng bộ dữ liệu lên Supabase Cloud...</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw className="w-4 h-4" />
                        <span>Đồng Bộ Ngay Toàn Bộ Dữ Liệu Lên Supabase Cloud</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 5.6: ACADEMIC YEAR ROLLOVER (QUẢN TRỊ & CHUYỂN GIAO NĂM HỌC) */}
          {systemHubSubTab === 'rollover' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <h4 className="text-sm sm:text-base font-black text-white flex items-center gap-2">
                    <RefreshCw className="w-5 h-5 text-amber-400" />
                    <span>QUẢN LÝ & CHUYỂN GIAO NĂM HỌC (ACADEMIC YEAR ROLLOVER)</span>
                  </h4>
                  <p className="text-xs text-slate-400">
                    Bảo tồn vĩnh viễn dữ liệu thi đua năm cũ, tự động tốt nghiệp Khối 12, nâng lớp Khối 10 & 11 và tích lũy điểm Đoàn 3 năm
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setIsRolloverModalOpen(true)}
                  className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs flex items-center gap-2 shadow-glow transition-all active:scale-95 shrink-0"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Khởi Động Trình Chuyển Giao 4 Bước</span>
                </button>
              </div>

              {/* Current Active Year Highlight Card */}
              <div className="p-5 rounded-3xl bg-gradient-to-br from-red-950/40 via-slate-900 to-amber-950/30 border border-red-800/40 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1">
                    <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">📌 Năm Học Hiện Hành (Active Year)</span>
                    <h3 className="text-lg sm:text-xl font-black text-white">{currentAcademicYear.name}</h3>
                    <p className="text-xs text-slate-400">
                      Thời gian: <strong className="text-slate-200">{currentAcademicYear.startDate}</strong> đến <strong className="text-slate-200">{currentAcademicYear.endDate}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-black text-xs flex items-center gap-1.5 shadow-glow">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                      ĐANG TÍNH ĐIỂM
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-800/80">
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">Số Chi Đoàn Đang Xét</span>
                    <span className="text-base font-black text-white">{classes.length} Lớp (K10, K11, K12)</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">Tổng Số Học Sinh</span>
                    <span className="text-base font-black text-amber-400">{students.filter(s => s.status === 'active').length} Học sinh</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">Đã Tốt Nghiệp Ra Trường</span>
                    <span className="text-base font-black text-purple-400">{students.filter(s => s.status === 'graduated').length} Học sinh</span>
                  </div>
                  <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-bold">Tổng Lượt Vi Phạm Ghi Nhận</span>
                    <span className="text-base font-black text-rose-400">{violations.length} Lỗi</span>
                  </div>
                </div>
              </div>

              {/* List of All Academic Years in System */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-black text-white text-xs uppercase tracking-wider">
                    DANH SÁCH CÁC NĂM HỌC ĐÃ LƯU TRỮ TRÊN HỆ THỐNG ({academicYears.length} Năm)
                  </h5>
                  <span className="text-[11px] text-slate-400">
                    Đang xem: <strong className="text-amber-400">{academicYears.find(y => y.id === selectedAcademicYearId)?.name || currentAcademicYear.name}</strong>
                  </span>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-slate-300 border-b border-slate-800">
                        <th className="p-3 font-bold text-center w-12 text-slate-400">STT</th>
                        <SortableTh
                          label="Mã Định Danh"
                          columnKey="id"
                          currentSortKey={academicYearSort.key}
                          currentSortDir={academicYearSort.direction}
                          onSort={(k) => handleToggleSort(setAcademicYearSort, k)}
                        />
                        <SortableTh
                          label="Tên Năm Học"
                          columnKey="name"
                          currentSortKey={academicYearSort.key}
                          currentSortDir={academicYearSort.direction}
                          onSort={(k) => handleToggleSort(setAcademicYearSort, k)}
                        />
                        <SortableTh
                          label="Thời Gian Áp Dụng"
                          columnKey="startDate"
                          currentSortKey={academicYearSort.key}
                          currentSortDir={academicYearSort.direction}
                          onSort={(k) => handleToggleSort(setAcademicYearSort, k)}
                          align="center"
                        />
                        <th className="p-3 font-bold text-center">Trạng Thái</th>
                        <th className="p-3 font-bold text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {sortedAcademicYears.map((y, index) => (
                        <tr key={y.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 text-center font-mono font-bold text-slate-400">
                            {index + 1}
                          </td>
                          <td className="p-3 font-mono font-bold text-slate-300">{y.id}</td>
                          <td className="p-3 font-extrabold text-white text-sm">
                            {y.name}
                          </td>
                          <td className="p-3 text-center text-slate-400 font-mono">
                            {y.startDate} ➔ {y.endDate}
                          </td>
                          <td className="p-3 text-center">
                            {y.isCurrent ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                                🟢 Hiện Hành (Active)
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
                                🔒 Đóng Băng (Read-Only)
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right">
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedAcademicYearId(y.id);
                                alert(`Đã chuyển chế độ xem sang ${y.name}`);
                              }}
                              className={`px-3 py-1.5 rounded-xl font-bold text-xs transition-all ${selectedAcademicYearId === y.id
                                ? 'bg-amber-600 text-white shadow-glow'
                                : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700'
                                }`}
                            >
                              {selectedAcademicYearId === y.id ? '✓ Đang Xem' : '👁️ Xem Dữ Liệu'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Business Rules Cards (4 Core Principles) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-amber-400 font-bold">
                    <Shield className="w-4 h-4" />
                    <h6>1. Cơ Chế Cô Lập Dữ Liệu & Đóng Băng Vĩnh Viễn</h6>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Khi chuyển sang xem năm học cũ, toàn bộ hệ thống tự động kích hoạt chế độ Read-only. Toàn bộ dữ liệu vi phạm, khiếu nại, điểm số không thể bị chỉnh sửa hay xóa nhầm.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <Flame className="w-4 h-4" />
                    <h6>2. Tích Lũy Điểm Phong Trào Đoàn 3 Năm THPT</h6>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Điểm nề nếp tập thể (1440đ) được làm mới theo tuần và năm học, nhưng điểm phong trào cá nhân của học sinh được bảo toàn liên tục 3 năm để xét Đoàn viên Xuất sắc toàn khóa.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-purple-400 font-bold">
                    <GraduationCap className="w-4 h-4" />
                    <h6>3. Lưu Trữ Mềm (Soft Archiving) Khối 12</h6>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Học sinh Khối 12 ra trường chuyển sang trạng thái Tốt nghiệp (Graduated), ẩn khỏi bảng tìm kiếm thường nhật nhưng vẫn sẵn sàng khi BGH cần trích lục hồ sơ quá khứ.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5">
                  <div className="flex items-center gap-2 text-blue-400 font-bold">
                    <Sparkles className="w-4 h-4" />
                    <h6>4. Nối Khóa & Nâng Lớp Tự Động Hàng Loạt</h6>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Trình hướng dẫn chuyển giao tự động đẩy hàng trăm học sinh từ Khối 10 lên Khối 11, Khối 11 lên Khối 12 chỉ với 1 thao tác mà không cần nhập lại từ đầu.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Sub-Tab 5.7: AUDIT LOGS */}
          {systemHubSubTab === 'logs' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="pb-2 border-b border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">NHẬT KÝ HOẠT ĐỘNG HỆ THỐNG (ACCESS & AUDIT LOGS)</h4>
                <p className="text-[11px] text-slate-400">Theo dõi toàn bộ lịch sử đăng nhập, chấm điểm, sửa lỗi vi phạm, xử lý khiếu nại và đổi mật khẩu</p>
              </div>

              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {auditLogs.map(log => (
                  <div key={log.id} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition-colors">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white">{log.userName}</span>
                        <span className="text-[10px] text-amber-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800 font-mono">
                          {log.action}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px]">{log.details}</p>
                    </div>
                    <div className="text-right text-[10px] text-slate-500 font-mono shrink-0">
                      <p className="font-bold text-slate-400">{log.timestamp}</p>
                      <p>IP: {log.ipAddress}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= MODAL: VIOLATION DIRECT CRUD ================= */}
      {isViolationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600 text-white font-bold">🚩</span>
                <h3 className="text-base font-black text-white">
                  {editingViolation ? 'Chỉnh Sửa Bản Ghi Vi Phạm' : 'Ghi Nhận Lỗi / Điểm Thi Đua Trực Tiếp'}
                </h3>
              </div>
              <button onClick={() => { setIsViolationModalOpen(false); setEditingViolation(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveViolation} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Lớp Vi Phạm:</label>
                  <select
                    value={violationForm.classId}
                    onChange={(e) => setViolationForm({ ...violationForm, classId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ngày Ghi Nhận:</label>
                  <select
                    value={violationForm.day}
                    onChange={(e) => setViolationForm({ ...violationForm, day: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                  >
                    {['T2', 'T3', 'T4', 'T5', 'T6', 'T7'].map(d => (
                      <option key={d} value={d}>Thứ {d.replace('T', '')}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Chọn Tiêu Chí Nề Nếp / Khen Thưởng:</label>
                <select
                  value={violationForm.criterionId}
                  onChange={(e) => setViolationForm({ ...violationForm, criterionId: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                >
                  {criteria.map(c => (
                    <option key={c.id} value={c.id}>
                      [{c.groupName}] {c.code} - {c.name} ({c.type === 'deduction' ? `-${c.points}` : `+${c.points}`}{c.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Số Lượng Vi Phạm:</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={violationForm.quantity}
                    onChange={(e) => setViolationForm({ ...violationForm, quantity: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Trạng Thái:</label>
                  <select
                    value={violationForm.status}
                    onChange={(e) => setViolationForm({ ...violationForm, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="accepted">Đã xác nhận (Trừ điểm)</option>
                    <option value="pending">Chờ GVCN xem</option>
                    <option value="approved_appeal">Hủy lỗi (Hoàn điểm)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tên Học Sinh Vi Phạm (Cách nhau dấu phẩy):</label>
                <input
                  type="text"
                  value={violationForm.studentNames}
                  onChange={(e) => setViolationForm({ ...violationForm, studentNames: e.target.value })}
                  placeholder="VD: Nguyễn Văn A, Trần Thị B (để trống nếu lỗi tập thể)"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Ghi Chú Chi Tiết:</label>
                <textarea
                  rows={2}
                  value={violationForm.note}
                  onChange={(e) => setViolationForm({ ...violationForm, note: e.target.value })}
                  placeholder="Ghi rõ thời gian, địa điểm, bối cảnh vi phạm..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              {/* Upload Ảnh Minh Chứng Trực Tiếp Từ Máy Tính hoặc Kho Media */}
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="font-bold text-slate-300">📷 Ảnh Minh Chứng Vi Phạm:</label>
                  <div className="flex items-center gap-1.5">
                    <MediaPickerButton
                      category="violations"
                      classId={violationForm.classId}
                      weekNumber={activeWeek}
                      value={violationForm.proofImage}
                      onSelect={(url) => setViolationForm(prev => ({ ...prev, proofImage: Array.isArray(url) ? url[0] : url }))}
                      label="Kho Ảnh Lỗi"
                    />
                    <label className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-950 hover:bg-red-900 text-red-300 rounded-xl border border-red-800 cursor-pointer font-bold transition-colors text-xs">
                      <Upload className="w-3 h-3" />
                      <span>Tải Máy</span>
                      <input
                        ref={violationFileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleViolationPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {violationForm.proofImage && (
                  <div className="relative inline-block mt-1">
                    <img
                      src={violationForm.proofImage}
                      alt="Minh chứng vi phạm"
                      className="w-24 h-24 object-cover rounded-xl border border-slate-700"
                    />
                    <button
                      type="button"
                      onClick={() => setViolationForm(prev => ({ ...prev, proofImage: '' }))}
                      className="absolute -top-1 -right-1 p-1 rounded-full bg-rose-600 text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}

                <p className="text-[11px] text-slate-500">Hoặc dán URL ảnh trực tiếp:</p>
                <input
                  type="text"
                  value={violationForm.proofImage}
                  onChange={(e) => setViolationForm({ ...violationForm, proofImage: e.target.value })}
                  placeholder="https://images.unsplash.com/..."
                  className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsViolationModalOpen(false); setEditingViolation(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-glow"
                >
                  {editingViolation ? 'Lưu Thay Đổi' : 'Ghi Nhận Vi Phạm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CRITERIA BUILDER ================= */}
      {isCriteriaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600 text-white font-bold">⚙️</span>
                <h3 className="text-base font-black text-white">
                  {editingCrit ? 'Chỉnh Sửa Tiêu Chí Chấm Điểm' : 'Thêm Tiêu Chí Chấm Điểm Mới'}
                </h3>
              </div>
              <button
                onClick={() => { setIsCriteriaModalOpen(false); setEditingCrit(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCriteria} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Thuộc Nhóm Tiêu Chí:</label>
                  <select
                    value={critForm.groupId}
                    onChange={(e) => setCritForm({ ...critForm, groupId: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="I.1">Nhóm I.1: Chuyên cần (40đ/ngày)</option>
                    <option value="I.2">Nhóm I.2: Vệ sinh (30đ/ngày)</option>
                    <option value="I.3">Nhóm I.3: Nề nếp tự quản (65đ/ngày)</option>
                    <option value="I.4">Nhóm I.4: Tác phong (90đ/ngày)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mã Tiêu Chí (Code):</label>
                  <input
                    type="text"
                    required
                    value={critForm.code}
                    onChange={(e) => setCritForm({ ...critForm, code: e.target.value })}
                    placeholder="VD: 1.7, 2.3, 4.5"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tên Tiêu Chí Vi Phạm / Khen Thưởng:</label>
                <input
                  type="text"
                  required
                  value={critForm.name}
                  onChange={(e) => setCritForm({ ...critForm, name: e.target.value })}
                  placeholder="VD: Sử dụng điện thoại không phép, Ăn quà vặt trong lớp..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Loại Tiêu Chí:</label>
                  <select
                    value={critForm.type}
                    onChange={(e) => setCritForm({ ...critForm, type: e.target.value as any })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="deduction">Trừ Điểm (-)</option>
                    <option value="bonus">Cộng Điểm (+)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Số Điểm (Mỗi lần):</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    required
                    value={critForm.points}
                    onChange={(e) => setCritForm({ ...critForm, points: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Đơn Vị Tính:</label>
                  <select
                    value={critForm.unit}
                    onChange={(e) => setCritForm({ ...critForm, unit: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  >
                    <option value="đ / HS">đ / HS</option>
                    <option value="đ / HS / buổi">đ / HS / buổi</option>
                    <option value="đ / lần">đ / lần</option>
                    <option value="đ / buổi">đ / buổi</option>
                    <option value="đ / giải">đ / giải</option>
                    <option value="đ / chi đoàn">đ / chi đoàn</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mô Tả Chi Tiết / Quy Định Chấm:</label>
                <textarea
                  rows={3}
                  value={critForm.description}
                  onChange={(e) => setCritForm({ ...critForm, description: e.target.value })}
                  placeholder="Ghi chú rõ cách phát hiện, minh chứng yêu cầu khi trừ điểm..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={critForm.isSevere}
                    onChange={(e) => setCritForm({ ...critForm, isSevere: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-red-600"
                  />
                  <span className="text-rose-400 font-bold">Lỗi nghiêm trọng (Báo động đỏ)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-200">
                  <input
                    type="checkbox"
                    checked={critForm.isEnabled}
                    onChange={(e) => setCritForm({ ...critForm, isEnabled: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-emerald-600"
                  />
                  <span className="text-emerald-400 font-bold">Kích hoạt áp dụng ngay</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsCriteriaModalOpen(false); setEditingCrit(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-glow"
                >
                  {editingCrit ? 'Lưu Thay Đổi' : 'Tạo Tiêu Chí Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: NEWS EDIT / ADD ================= */}
      {isNewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-2xl w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600 text-white font-bold">📰</span>
                <h3 className="text-base font-black text-white">
                  {editingNews ? 'Chỉnh Sửa Bài Viết Bản Tin' : 'Thêm Bài Viết Thông Báo Mới'}
                </h3>
              </div>
              <button onClick={() => setIsNewsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNews} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tiêu đề bài viết:</label>
                <input
                  type="text"
                  required
                  value={newsForm.title}
                  onChange={(e) => setNewsForm({ ...newsForm, title: e.target.value })}
                  placeholder="Tiêu đề bài viết thông báo hoặc hoạt động..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:border-red-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Đoạn trích dẫn ngắn (Excerpt):</label>
                <input
                  type="text"
                  required
                  value={newsForm.excerpt}
                  onChange={(e) => setNewsForm({ ...newsForm, excerpt: e.target.value })}
                  placeholder="Tóm tắt 1-2 câu hiển thị ở thẻ tin ngoài trang chủ..."
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <RichTextEditor
                value={newsForm.content}
                onChange={(content) => setNewsForm({ ...newsForm, content })}
                label="Toàn văn nội dung bài viết phong trào"
                placeholder="Soạn thảo bài viết phong trào, định dạng văn bản (tiêu đề, danh sách, bảng biểu, hộp thông báo [KHẨN], [KHEN THƯỞNG]), chèn ảnh từ Thư viện..."
                category="news_events"
                toolbarPreset="full"
                minHeight="240px"
              />

              {/* Upload Ảnh Thumbnail Từ Máy Tính Hoặc Chọn Từ Kho Media */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <label className="block font-bold text-slate-300">🖼️ Ảnh Đại Diện (Thumbnail):</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {newsForm.thumbnail && (
                    <img
                      src={newsForm.thumbnail}
                      alt="Thumbnail preview"
                      className="w-20 h-20 object-cover rounded-xl border border-slate-700 shrink-0"
                    />
                  )}
                  <div className="space-y-2 flex-1 w-full">
                    <div className="flex flex-wrap items-center gap-2">
                      <MediaPickerButton
                        category="news_events"
                        value={newsForm.thumbnail}
                        onSelect={(url) => setNewsForm(prev => ({ ...prev, thumbnail: Array.isArray(url) ? url[0] : url }))}
                        label="Kho Media Bản Tin"
                      />
                      <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl border border-slate-700 cursor-pointer font-bold transition-colors text-xs">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Chọn từ máy</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                    <p className="text-[11px] text-slate-500">Hoặc dán URL ảnh trực tiếp bên dưới:</p>
                    <input
                      type="text"
                      value={newsForm.thumbnail}
                      onChange={(e) => setNewsForm({ ...newsForm, thumbnail: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              {/* Upload Tài Liệu / File Đính Kèm Từ Máy Tính */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tài Liệu / File Đính Kèm (PDF, Word, Excel, Ảnh...):</span>
                  </label>
                  <label className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 rounded-lg border border-blue-800 cursor-pointer font-bold transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Tải File Lên</span>
                    <input
                      type="file"
                      multiple
                      onChange={async (e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          for (const file of Array.from(files)) {
                            let fileUrl: string | null = null;
                            if (isSupabaseConfigured()) {
                              fileUrl = await SupabaseService.uploadImage(file, 'media');
                            }
                            if (!fileUrl) {
                              fileUrl = await new Promise<string>((resolve) => {
                                const reader = new FileReader();
                                reader.onload = (ev) => resolve((ev.target?.result as string) || '');
                                reader.readAsDataURL(file);
                              });
                            }
                            const sizeInKb = (file.size / 1024).toFixed(1) + ' KB';
                            setNewsForm(prev => ({
                              ...prev,
                              attachments: [
                                ...prev.attachments,
                                {
                                  name: file.name,
                                  url: fileUrl!,
                                  size: sizeInKb,
                                  type: file.type
                                }
                              ]
                            }));
                          }
                        }
                        e.target.value = '';
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {newsForm.attachments && newsForm.attachments.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {newsForm.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <File className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-bold text-white line-clamp-1">{file.name}</span>
                          {file.size && <span className="text-[10px] text-slate-500 font-mono">({file.size})</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveAttachment(idx)}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">Chưa có file đính kèm nào được tải lên.</p>
                )}
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Thẻ phân loại (Tags):</label>
                <input
                  type="text"
                  value={newsForm.tags}
                  onChange={(e) => setNewsForm({ ...newsForm, tags: e.target.value })}
                  placeholder="#PhongTrao, #NeNep, #TuyenDuong"
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                />
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                  <input
                    type="checkbox"
                    checked={newsForm.isPinned}
                    onChange={(e) => setNewsForm({ ...newsForm, isPinned: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-red-600"
                  />
                  <span>Ghim bài viết lên đầu trang chủ (Thông báo khẩn cấp)</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-glow"
                >
                  {editingNews ? 'Lưu Cập Nhật' : 'Đăng Bài Viết'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ANNOUNCEMENT ADD & EDIT (THÔNG BÁO & CÔNG VĂN CHỈ ĐẠO) ================= */}
      {isAnnouncementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-2xl w-full rounded-3xl p-6 border border-amber-500/40 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-600 text-white font-bold">📢</span>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingAnnouncement ? 'Chỉnh Sửa Thông Báo / Công Văn' : 'Ban Hành Thông Báo / Công Văn Chỉ Đạo Mới'}
                  </h3>
                  <p className="text-[11px] text-slate-400">Hiển thị nổi bật tại Trang chủ và gửi thông báo tới toàn trường</p>
                </div>
              </div>
              <button onClick={() => setIsAnnouncementModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAnnouncement} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Tiêu Đề Thông Báo / Công Văn:</label>
                  <input
                    type="text"
                    required
                    value={announcementForm.title}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                    placeholder="VD: [HỎA TỐC] Kế hoạch chuẩn bị Lễ Kỷ niệm 26/3..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mức Độ Khẩn / Tính Chất:</label>
                  <select
                    value={announcementForm.urgency}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, urgency: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                  >
                    <option value="normal">⚪ Bình Thường</option>
                    <option value="urgent">⚠️ KHẨN CẤP</option>
                    <option value="critical">🔥 HỎA TỐC (Ưu Tiên Số 1)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Trích yếu nội dung (Excerpt):</label>
                <input
                  type="text"
                  required
                  value={announcementForm.excerpt}
                  onChange={(e) => setAnnouncementForm({ ...announcementForm, excerpt: e.target.value })}
                  placeholder="Tóm tắt ngắn gọn mục đích và đối tượng thực hiện thông báo..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <RichTextEditor
                value={announcementForm.content}
                onChange={(content) => setAnnouncementForm({ ...announcementForm, content })}
                label="Toàn Văn Nội Dung Chỉ Đạo / Công Văn"
                placeholder="Nội dung chi tiết thông báo: 1. Mục đích yêu cầu; 2. Nội dung thực hiện; 3. Tổ chức thực hiện (Hỗ trợ định dạng in đậm, danh sách, hộp cảnh báo [KHẨN], bảng biểu)..."
                category="news_events"
                toolbarPreset="full"
                minHeight="240px"
              />

              {/* Upload Tài Liệu / File Đính Kèm Công Văn */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Paperclip className="w-3.5 h-3.5 text-blue-400" />
                    <span>File Đính Kèm Công Văn (PDF, Word, Excel từ máy tính):</span>
                  </label>
                  <label className="inline-flex items-center gap-1 px-3 py-1 bg-blue-950 hover:bg-blue-900 text-blue-300 rounded-lg border border-blue-800 cursor-pointer font-bold transition-colors">
                    <Upload className="w-3 h-3" />
                    <span>Tải File Văn Bản</span>
                    <input
                      ref={announcementAttachmentRef}
                      type="file"
                      multiple
                      onChange={(e) => {
                        const files = e.target.files;
                        if (files && files.length > 0) {
                          Array.from(files).forEach(file => {
                            const reader = new FileReader();
                            reader.onload = (event) => {
                              if (event.target?.result) {
                                const sizeInKb = (file.size / 1024).toFixed(1) + ' KB';
                                setAnnouncementForm(prev => ({
                                  ...prev,
                                  attachments: [
                                    ...prev.attachments,
                                    {
                                      name: file.name,
                                      url: event.target!.result as string,
                                      size: sizeInKb,
                                      type: file.type
                                    }
                                  ]
                                }));
                              }
                            };
                            reader.readAsDataURL(file);
                          });
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {announcementForm.attachments && announcementForm.attachments.length > 0 ? (
                  <div className="space-y-1.5 pt-1">
                    {announcementForm.attachments.map((file, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded-xl bg-slate-900 border border-slate-800"
                      >
                        <div className="flex items-center gap-2">
                          <File className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span className="font-bold text-white line-clamp-1">{file.name}</span>
                          {file.size && <span className="text-[10px] text-slate-500 font-mono">({file.size})</span>}
                        </div>
                        <button
                          type="button"
                          onClick={() => setAnnouncementForm(prev => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== idx) }))}
                          className="p-1 text-slate-500 hover:text-rose-400"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 italic">Chưa có file công văn đính kèm.</p>
                )}
              </div>

              {/* Upload Ảnh Minh Họa */}
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <label className="block font-bold text-slate-300">🖼️ Ảnh Minh Họa / Baner Thông Báo:</label>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  {announcementForm.thumbnail && (
                    <img
                      src={announcementForm.thumbnail}
                      alt="Thumbnail preview"
                      className="w-20 h-20 object-cover rounded-xl border border-slate-700"
                    />
                  )}
                  <div className="space-y-1.5 flex-1">
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-300 rounded-xl border border-slate-700 cursor-pointer font-bold transition-colors">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Chọn ảnh từ máy tính</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const compressed = await compressImageToDataURL(file, { maxWidth: 1200, maxHeight: 1200, quality: 0.82, outputFormat: 'image/webp' });
                            if (compressed) {
                              setAnnouncementForm(prev => ({ ...prev, thumbnail: compressed }));
                            }
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <input
                      type="text"
                      value={announcementForm.thumbnail}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, thumbnail: e.target.value })}
                      placeholder="https://images.unsplash.com/..."
                      className="w-full p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-[11px]"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                  <input
                    type="checkbox"
                    checked={announcementForm.isPinned}
                    onChange={(e) => setAnnouncementForm({ ...announcementForm, isPinned: e.target.checked })}
                    className="rounded bg-slate-800 border-slate-700 text-amber-600"
                  />
                  <span>Ghim thông báo này lên vị trí đầu tiên của Bảng Tin Công Cộng</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAnnouncementModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-glow"
                >
                  {editingAnnouncement ? 'Lưu Thay Đổi' : 'Ban Hành Thông Báo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: STUDENT / ĐOÀN VIÊN ADD & EDIT ================= */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600 text-white font-bold">👤</span>
                <h3 className="text-base font-black text-white">
                  {editingStudent ? 'Chỉnh Sửa Hồ Sơ Đoàn Viên / Học Sinh' : 'Thêm Đoàn Viên / Học Sinh Mới'}
                </h3>
              </div>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => setStudentModalTab('basic')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${studentModalTab === 'basic' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
              >
                1. Thông Tin Cơ Bản
              </button>
              <button
                type="button"
                onClick={() => setStudentModalTab('union')}
                className={`flex-1 py-1.5 rounded-lg transition-all ${studentModalTab === 'union' ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
              >
                2. Hồ Sơ & Quản Lý Đoàn
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-3 text-xs">
              {studentModalTab === 'basic' ? (
                <div className="space-y-3">
                  {/* Avatar Picker */}
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-amber-500 p-0.5 shrink-0 shadow-md">
                      <img
                        src={studentForm.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${studentForm.studentId || 'student'}`}
                        alt="Avatar học sinh"
                        className="w-full h-full object-cover rounded-[14px] bg-slate-900"
                      />
                    </div>
                    <div className="flex-1 space-y-1.5">
                      <label className="block font-bold text-slate-300 text-xs">Ảnh Thẻ / Chân Dung Đoàn Viên:</label>
                      <div className="flex items-center gap-2">
                        <MediaPickerButton
                          category="students"
                          classId={studentForm.classId}
                          value={studentForm.avatar}
                          onSelect={(url) => setStudentForm(prev => ({ ...prev, avatar: Array.isArray(url) ? url[0] : url }))}
                          label="Chọn / Đổi Ảnh Thẻ"
                        />
                        {studentForm.avatar && (
                          <button
                            type="button"
                            onClick={() => setStudentForm(prev => ({ ...prev, avatar: '' }))}
                            className="text-[11px] text-slate-400 hover:text-rose-400 font-medium"
                          >
                            Xóa ảnh
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Mã Học Sinh:</label>
                      <input
                        type="text"
                        required
                        value={studentForm.studentId}
                        onChange={(e) => setStudentForm({ ...studentForm, studentId: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Lớp Học:</label>
                      <select
                        value={studentForm.classId}
                        onChange={(e) => setStudentForm({ ...studentForm, classId: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Họ và Tên:</label>
                    <input
                      type="text"
                      required
                      value={studentForm.name}
                      onChange={(e) => setStudentForm({ ...studentForm, name: e.target.value })}
                      placeholder="Nhập họ và tên đầy đủ..."
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:border-red-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Ngày Tháng Năm Sinh:</label>
                      <input
                        type="date"
                        required
                        value={studentForm.dob}
                        onChange={(e) => setStudentForm({ ...studentForm, dob: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Giới Tính:</label>
                      <select
                        value={studentForm.gender}
                        onChange={(e) => setStudentForm({ ...studentForm, gender: e.target.value as any })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                      >
                        <option value="Nam">Nam</option>
                        <option value="Nữ">Nữ</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Dân Tộc:</label>
                      <input
                        type="text"
                        required
                        value={studentForm.ethnicity}
                        onChange={(e) => setStudentForm({ ...studentForm, ethnicity: e.target.value })}
                        placeholder="VD: Kinh, Cơ Tu, Tày..."
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Số Điện Thoại:</label>
                      <input
                        type="text"
                        value={studentForm.phone}
                        onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                        placeholder="0988.xxx.xxx"
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Địa Chỉ Liên Hệ / Thường Trú:</label>
                    <input
                      type="text"
                      value={studentForm.address}
                      onChange={(e) => setStudentForm({ ...studentForm, address: e.target.value })}
                      placeholder="VD: Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng..."
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium focus:border-red-500"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800">
                    <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                      <input
                        type="checkbox"
                        checked={studentForm.isUnionMember}
                        onChange={(e) => setStudentForm({ ...studentForm, isUnionMember: e.target.checked })}
                        className="rounded bg-slate-800 border-slate-700 text-red-600"
                      />
                      <span className="text-emerald-400">Đã kết nạp Đoàn viên TNCS Hồ Chí Minh</span>
                    </label>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Số Thẻ Đoàn / Mã ĐV:</label>
                      <input
                        type="text"
                        value={studentForm.unionCardNumber}
                        onChange={(e) => setStudentForm({ ...studentForm, unionCardNumber: e.target.value })}
                        placeholder="VD: ĐV2024-1025"
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Chức Vụ Đoàn:</label>
                      <input
                        type="text"
                        value={studentForm.unionPosition}
                        onChange={(e) => setStudentForm({ ...studentForm, unionPosition: e.target.value })}
                        placeholder="Bí thư / UV BCH / Đoàn viên"
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Ngày Vào Đoàn:</label>
                      <input
                        type="date"
                        value={studentForm.unionJoinedDate}
                        onChange={(e) => setStudentForm({ ...studentForm, unionJoinedDate: e.target.value })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Nơi Kết Nạp Đoàn:</label>
                      <input
                        type="text"
                        value={studentForm.unionJoinedPlace}
                        onChange={(e) => setStudentForm({ ...studentForm, unionJoinedPlace: e.target.value })}
                        placeholder="Đoàn trường THPT..."
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Đoàn Phí:</label>
                      <select
                        value={studentForm.unionFeeStatus}
                        onChange={(e) => setStudentForm({ ...studentForm, unionFeeStatus: e.target.value as any })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                      >
                        <option value="paid">Đã Nộp</option>
                        <option value="unpaid">Chưa Nộp</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Sổ Đoàn:</label>
                      <select
                        value={studentForm.unionBookletStatus}
                        onChange={(e) => setStudentForm({ ...studentForm, unionBookletStatus: e.target.value as any })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                      >
                        <option value="submitted">Đã Nộp Sổ</option>
                        <option value="not_submitted">Chưa Nộp</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">Xếp Loại Đoàn:</label>
                      <select
                        value={studentForm.conductRating}
                        onChange={(e) => setStudentForm({ ...studentForm, conductRating: e.target.value as any })}
                        className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold"
                      >
                        <option value="Xuất sắc">Xuất sắc</option>
                        <option value="Khá">Khá</option>
                        <option value="Trung bình">Trung bình</option>
                        <option value="Yếu">Yếu</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Ghi Chú Quản Lý:</label>
                    <input
                      type="text"
                      value={studentForm.customNotes}
                      onChange={(e) => setStudentForm({ ...studentForm, customNotes: e.target.value })}
                      placeholder="Thông tin khen thưởng, kỷ luật hoặc nhiệm vụ..."
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsStudentModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-glow"
                >
                  Lưu Hồ Sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: CLASS ADD / EDIT ================= */}
      {isClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600 text-white font-bold">🏫</span>
                <h3 className="text-base font-black text-white">
                  {editingClass ? 'Chỉnh Sửa Thông Tin Lớp Học' : 'Thêm Lớp Học Mới'}
                </h3>
              </div>
              <button onClick={() => { setIsClassModalOpen(false); setEditingClass(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveClass} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mã Lớp (ID):</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingClass}
                    value={classForm.id}
                    onChange={(e) => setClassForm({ ...classForm, id: e.target.value, name: `Lớp ${e.target.value}` })}
                    placeholder="10/7"
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Khối:</label>
                  <select
                    value={classForm.grade}
                    onChange={(e) => setClassForm({ ...classForm, grade: Number(e.target.value) as any })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value={10}>Khối 10</option>
                    <option value={11}>Khối 11</option>
                    <option value={12}>Khối 12</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tên Hiển Thị Của Lớp:</label>
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="VD: Lớp 10/7"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tổng Sĩ Số (Học Sinh):</label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    required
                    value={classForm.totalStudents}
                    onChange={(e) => setClassForm({ ...classForm, totalStudents: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Số Đoàn Viên:</label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    required
                    value={classForm.unionMembers}
                    onChange={(e) => setClassForm({ ...classForm, unionMembers: Number(e.target.value) })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                  />
                </div>
              </div>

              {/* GVCN */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Họ Tên Giáo Viên Chủ Nhiệm (GVCN):</label>
                <input
                  type="text"
                  value={classForm.gvcnName}
                  onChange={(e) => setClassForm({ ...classForm, gvcnName: e.target.value })}
                  placeholder="VD: Thầy Nguyễn Văn Thành / Cô Rapát Thị Mận"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold placeholder-slate-500 focus:border-red-500"
                />
              </div>

              {/* Ban Cán Sự Lớp & BCH Chi Đoàn (4 Vị Trí) */}
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 text-xs font-black text-amber-400 border-b border-slate-800 pb-1.5">
                  <span>🎖️ BAN CÁN SỰ & BCH CHI ĐOÀN LỚP</span>
                </div>

                {/* 1. Lớp Trưởng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Họ Tên Lớp Trưởng:</label>
                    <input
                      type="text"
                      value={classForm.classPresidentName}
                      onChange={(e) => setClassForm({ ...classForm, classPresidentName: e.target.value })}
                      placeholder="VD: Lâm Xuân Tín"
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Số ĐT Lớp Trưởng:</label>
                    <input
                      type="text"
                      value={classForm.classPresidentPhone}
                      onChange={(e) => setClassForm({ ...classForm, classPresidentPhone: e.target.value })}
                      placeholder="VD: 0372076304"
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* 2. Lớp Phó Học Tập */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Lớp Phó Học Tập:</label>
                    <input
                      type="text"
                      value={classForm.academicVicePresidentName}
                      onChange={(e) => setClassForm({ ...classForm, academicVicePresidentName: e.target.value })}
                      placeholder="VD: Phạm Nguyễn Bảo Vi"
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Số ĐT Lớp Phó HT:</label>
                    <input
                      type="text"
                      value={classForm.academicVicePresidentPhone}
                      onChange={(e) => setClassForm({ ...classForm, academicVicePresidentPhone: e.target.value })}
                      placeholder="VD: 0343226894"
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* 3. Bí Thư Chi Đoàn */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Bí Thư Chi Đoàn:</label>
                    <input
                      type="text"
                      value={classForm.bithuName}
                      onChange={(e) => setClassForm({ ...classForm, bithuName: e.target.value })}
                      placeholder="VD: Nguyễn Thị Bảo Yến"
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Số ĐT Bí Thư:</label>
                    <input
                      type="text"
                      value={classForm.bithuPhone}
                      onChange={(e) => setClassForm({ ...classForm, bithuPhone: e.target.value })}
                      placeholder="VD: 0978819242"
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-mono text-xs"
                    />
                  </div>
                </div>

                {/* 4. Phó Bí Thư */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Phó Bí Thư Chi Đoàn:</label>
                    <input
                      type="text"
                      value={classForm.deputySecretaryName}
                      onChange={(e) => setClassForm({ ...classForm, deputySecretaryName: e.target.value })}
                      placeholder="VD: Võ Viết Tới"
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Số ĐT Phó Bí Thư:</label>
                    <input
                      type="text"
                      value={classForm.deputySecretaryPhone}
                      onChange={(e) => setClassForm({ ...classForm, deputySecretaryPhone: e.target.value })}
                      placeholder="VD: 0923150635"
                      className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsClassModalOpen(false); setEditingClass(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-glow"
                >
                  {editingClass ? 'Cập Nhật Lớp & Ban Cán Sự' : 'Thêm Lớp Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: STUDENT TRANSFER CLASS ================= */}
      {transferingStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-sm w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white">Chuyển Lớp Học Sinh</h3>
              <button onClick={() => setTransferingStudent(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Chuyển học sinh <strong>{transferingStudent.name}</strong> ({transferingStudent.studentId}) hiện đang ở lớp <strong>{transferingStudent.classId}</strong> sang lớp mới:
            </p>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Chọn lớp mới:</label>
              <select
                value={targetTransferClass}
                onChange={(e) => setTargetTransferClass(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs"
              >
                {classes.filter(c => c.id !== transferingStudent.classId).map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setTransferingStudent(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  transferStudent(transferingStudent.id, targetTransferClass);
                  setTransferingStudent(null);
                }}
                className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-glow"
              >
                Xác Nhận Chuyển
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EXCEL IMPORT & UPSERT STUDENTS ================= */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-600 text-white font-bold">📤</span>
                <h3 className="text-base font-black text-white">Đồng Bộ & Cập Nhật Dữ Liệu Từ Excel</h3>
              </div>
              <button onClick={() => setIsImportModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Upload File Excel Trực Tiếp */}
            <div className="p-4 bg-slate-950 rounded-2xl border-2 border-dashed border-emerald-700/60 text-center space-y-3">
              <FileSpreadsheet className="w-10 h-10 text-emerald-400 mx-auto" />
              <div>
                <p className="font-bold text-white text-xs">Tải lên file Excel (.xlsx, .xls) từ máy tính</p>
                <p className="text-[11px] text-slate-400">Tự động cập nhật nếu trùng Mã HS hoặc thêm mới nếu chưa có</p>
              </div>

              <input
                ref={excelFileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelFileUpload}
                className="hidden"
              />

              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => excelFileInputRef.current?.click()}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-glow"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Chọn File Excel</span>
                </button>

                <button
                  type="button"
                  onClick={handleDownloadSampleExcel}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold flex items-center gap-1"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Tải Mẫu Excel</span>
                </button>
              </div>
            </div>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[11px] text-slate-500 font-bold uppercase">Hoặc Dán Văn Bản Dạng Text</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleImportSubmit} className="space-y-3">
              <textarea
                rows={4}
                value={importText}
                onChange={(e) => setImportText(e.target.value)}
                placeholder={`HS20241030, Phạm Minh Đức, 10/1, Nam, 2009-02-15, Kinh, Đoàn viên\nHS20241031, Đặng Thu Trang, 10/1, Nữ, 2009-07-20, Cơ Tu, Đoàn viên`}
                className="w-full p-3 rounded-2xl bg-slate-950 border border-slate-700 text-white font-mono text-xs"
              />

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={!importText.trim()}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-glow disabled:opacity-40"
                >
                  Đồng Bộ Dữ Liệu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT WEEK ================= */}
      {isWeekModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-sm w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600 text-white font-bold">📅</span>
                <h3 className="text-base font-black text-white">
                  {editingWeek ? 'Chỉnh Sửa Tuần Học' : 'Tạo Mới Tuần Học'}
                </h3>
              </div>
              <button onClick={() => { setIsWeekModalOpen(false); setEditingWeek(null); }} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveWeek} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Số Thứ Tự Tuần (1-40):</label>
                <input
                  type="number"
                  required
                  disabled={!!editingWeek}
                  value={weekForm.weekNumber}
                  onChange={(e) => setWeekForm({ ...weekForm, weekNumber: Number(e.target.value), title: `Tuần ${e.target.value}` })}
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold font-mono disabled:opacity-60"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Tiêu Đề Tuần:</label>
                <input
                  type="text"
                  required
                  value={weekForm.title}
                  onChange={(e) => setWeekForm({ ...weekForm, title: e.target.value })}
                  placeholder="Tuần 26"
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ngày Bắt Đầu:</label>
                  <input
                    type="date"
                    required
                    value={weekForm.startDate}
                    onChange={(e) => setWeekForm({ ...weekForm, startDate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ngày Kết Thúc:</label>
                  <input
                    type="date"
                    required
                    value={weekForm.endDate}
                    onChange={(e) => setWeekForm({ ...weekForm, endDate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Ghi Chú Kế Hoạch:</label>
                <input
                  type="text"
                  value={weekForm.note}
                  onChange={(e) => setWeekForm({ ...weekForm, note: e.target.value })}
                  placeholder="Kế hoạch thi đua tuần..."
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsWeekModalOpen(false); setEditingWeek(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-glow"
                >
                  {editingWeek ? 'Lưu Thay Đổi' : 'Tạo Tuần Học'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: USER ADD / EDIT ================= */}
      {isUserModalOpen && (() => {
        const studentsOfClass = students.filter(s => s.classId === (userForm.classId || '10/1'));
        const currentClassInfo = classes.find(c => c.id === (userForm.classId || '10/1'));

        const handleFillDefaultAccount = () => {
          const rolePrefixes: Record<string, string> = {
            admin: 'admin_bch',
            manager: `gvcn_${(userForm.classId || '10_1').replace('/', '_')}`,
            auditor: `codo_${(userForm.assignedZone || 'k10').toLowerCase().replace(/\s+/g, '_')}`,
            youth_secretary: `bithu_${(userForm.classId || '10_1').replace('/', '_')}`,
            user: `hs_${(userForm.classId || '10_1').replace('/', '_')}_01`
          };

          const defaultNames: Record<string, string> = {
            admin: 'Cán bộ BCH Đoàn Trường',
            manager: currentClassInfo?.gvcnName || 'Thầy/Cô Giáo Viên Chủ Nhiệm',
            auditor: 'Cán bộ Đội Cờ Đỏ Giám Sát',
            youth_secretary: currentClassInfo?.bithuName || 'Bí thư Chi Đoàn',
            user: studentsOfClass[0]?.name || 'Đoàn viên Học sinh'
          };

          const username = rolePrefixes[userForm.role] || 'user_demo';
          const name = defaultNames[userForm.role] || 'Người dùng mới';

          setUserForm(prev => ({
            ...prev,
            username,
            name,
            password: '123456@Password',
            phone: prev.phone || '0988.123.456',
            email: `${username}@thpt.edu.vn`
          }));
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="glass-modal max-w-lg w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">

              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-2 rounded-xl bg-red-600 text-white font-bold">👥</span>
                  <div>
                    <h3 className="text-base font-black text-white">
                      {editingUser ? 'Chỉnh Sửa Tài Khoản' : 'Thêm Tài Khoản Mới'}
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Cấp phát và phân quyền người dùng trong hệ thống
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!editingUser && (
                    <button
                      type="button"
                      onClick={handleFillDefaultAccount}
                      className="px-2.5 py-1 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-600/80 text-amber-300 font-bold text-[11px] flex items-center gap-1 transition-all shadow-sm"
                      title="Tự động điền dữ liệu tài khoản mặc định theo vai trò"
                    >
                      <Sparkles className="w-3 h-3 text-amber-400" />
                      <span>⚡ Điền Tài Khoản Mặc Định</span>
                    </button>
                  )}
                  <button onClick={() => { setIsUserModalOpen(false); setEditingUser(null); }} className="p-1 rounded-lg text-slate-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  if (editingUser) {
                    updateUser(editingUser.id, userForm);
                    alert(`Đã cập nhật tài khoản ${userForm.username} thành công!`);
                  } else {
                    addUser({
                      ...userForm,
                      isActive: true
                    });
                    alert(`Đã thêm mới tài khoản ${userForm.username} (Mật khẩu: ${userForm.password || '123456@Password'})!`);
                  }
                  setIsUserModalOpen(false);
                  setEditingUser(null);
                }}
                className="space-y-3 text-xs"
              >

                {/* Role & Scope Selection First */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Vai Trò / Phân Quyền:</label>
                    <select
                      value={userForm.role}
                      onChange={(e) => {
                        const r = e.target.value as 'admin' | 'manager' | 'auditor' | 'youth_secretary' | 'user';
                        const titles: Record<string, string> = {
                          admin: 'Bí thư Đoàn Trường / Quản trị viên',
                          manager: 'Giáo viên Chủ nhiệm',
                          auditor: 'Cán bộ Đội Cờ Đỏ',
                          youth_secretary: 'Bí thư Chi đoàn',
                          user: 'Đoàn viên / Học sinh'
                        };
                        setUserForm({ 
                          ...userForm, 
                          role: r, 
                          roleTitle: titles[r] || 'Người dùng',
                          classId: r === 'admin' ? 'Toàn Trường' : (userForm.classId === 'Toàn Trường' ? (classes[0]?.id || '10/1') : userForm.classId)
                        });
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-red-500"
                    >
                      <option value="admin">1. Bí Thư Đoàn / Admin</option>
                      <option value="manager">2. Giáo Viên Chủ Nhiệm (GVCN)</option>
                      <option value="auditor">3. Đội Cờ Đỏ / Giám Sát</option>
                      <option value="youth_secretary">4. Bí Thư Chi Đoàn Lớp</option>
                      <option value="user">5. Đoàn Viên / Học Sinh</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      {userForm.role === 'admin' ? 'Phạm Vi Quản Lý:' : userForm.role === 'auditor' ? 'Khu Vực Phụ Trách:' : 'Lớp Phụ Trách / Lớp Học:'}
                    </label>
                    {userForm.role === 'admin' ? (
                      <div className="w-full p-2.5 rounded-xl bg-red-950/50 border border-red-800/80 text-red-200 font-bold flex items-center justify-between text-xs min-h-[42px]">
                        <div className="flex items-center gap-2">
                          <span className="text-base">🏛️</span>
                          <span>Toàn Trường (Tất cả {classes.length} lớp)</span>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-red-800/60 text-[10px] text-red-100 font-bold uppercase tracking-wider whitespace-nowrap">
                          Toàn Quyền
                        </span>
                      </div>
                    ) : userForm.role === 'auditor' ? (
                      <select
                        value={userForm.assignedZone || (zones[0]?.name || 'Khối 10')}
                        onChange={(e) => setUserForm({ ...userForm, assignedZone: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-red-500"
                      >
                        {zones.map(z => (
                          <option key={z.id} value={z.name}>{z.icon || '📍'} {z.name}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={userForm.classId}
                        onChange={(e) => setUserForm({ ...userForm, classId: e.target.value })}
                        className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold focus:border-red-500"
                      >
                        {classes.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Autocomplete Student Picker when Role is Student / Union Member */}
                {(userForm.role === 'user' || userForm.role === 'youth_secretary') && (
                  <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-1.5 animate-fadeIn">
                    <label className="block font-bold text-amber-300 text-xs flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <span>🎯 Lấy Dữ Liệu Từ Danh Sách Học Sinh Lớp {userForm.classId || '10/1'}:</span>
                      </span>
                      <span className="text-[10px] text-amber-400 font-mono">({studentsOfClass.length} học sinh)</span>
                    </label>
                    <select
                      onChange={(e) => {
                        const selectedSt = studentsOfClass.find(s => s.id === e.target.value || s.studentId === e.target.value);
                        if (selectedSt) {
                          let cleanPhone = selectedSt.phone ? String(selectedSt.phone).trim() : '';
                          if (/[a-zA-Zà-ỹÀ-Ỹ]/.test(cleanPhone)) {
                            cleanPhone = '';
                          }

                          setUserForm(prev => ({
                            ...prev,
                            name: selectedSt.name,
                            username: selectedSt.studentId.toLowerCase(),
                            phone: cleanPhone || prev.phone || '',
                            email: `${selectedSt.studentId.toLowerCase()}@thpt.edu.vn`,
                            password: prev.password || '123456@Password',
                            studentId: selectedSt.studentId
                          }));
                        }
                      }}
                      className="w-full p-2.5 rounded-xl bg-slate-900 border border-amber-600/70 text-amber-300 font-bold text-xs focus:outline-none focus:border-amber-400 cursor-pointer"
                    >
                      <option value="">-- Click để chọn học sinh (Tự động điền họ tên, mã HS, email) --</option>
                      {studentsOfClass.map(st => (
                        <option key={st.id} value={st.id}>
                          {st.name} — Mã: {st.studentId} ({st.isUnionMember ? 'Đoàn viên' : 'Học sinh'})
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-slate-400">
                      💡 Chọn học sinh để tự động điền Tên đăng nhập ({'{Mã_HS}'}), Họ tên, Email và Mật khẩu mặc định.
                    </p>
                  </div>
                )}

                {/* Quick Auto-fill for GVCN */}
                {userForm.role === 'manager' && currentClassInfo && (
                  <div className="p-2.5 rounded-2xl bg-blue-950/40 border border-blue-600/50 flex items-center justify-between text-xs animate-fadeIn">
                    <span className="text-blue-300">
                      GVCN {currentClassInfo.name}: <strong>{currentClassInfo.gvcnName}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setUserForm(prev => ({
                          ...prev,
                          name: currentClassInfo.gvcnName,
                          username: `gvcn_${currentClassInfo.id.replace('/', '_')}`,
                          email: `gvcn_${currentClassInfo.id.replace('/', '_')}@thpt.edu.vn`,
                          password: prev.password || '123456@Password'
                        }));
                      }}
                      className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] transition-all flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>⚡ Điền nhanh thông tin</span>
                    </button>
                  </div>
                )}

                {/* Username & Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Tên Đăng Nhập (Username):</label>
                    <input
                      type="text"
                      required
                      disabled={!!editingUser}
                      value={userForm.username}
                      onChange={(e) => setUserForm({ ...userForm, username: e.target.value })}
                      placeholder="VD: gv_huong, codo_nam..."
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold disabled:opacity-60 focus:border-red-500"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="font-bold text-slate-300">
                        {editingUser ? 'Mật Khẩu Mới:' : 'Mật Khẩu Ban Đầu:'}
                      </label>
                      <button
                        type="button"
                        onClick={() => setUserForm({ ...userForm, password: '123456@Password' })}
                        className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-0.5 hover:underline"
                        title="Đặt mật khẩu về mặc định: 123456@Password"
                      >
                        <Sparkles className="w-3 h-3" />
                        <span>⚡ 123456@Password</span>
                      </button>
                    </div>
                    <input
                      type="text"
                      value={userForm.password || ''}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      placeholder="123456@Password"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Full Name */}
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Họ và Tên Người Dùng:</label>
                  <input
                    type="text"
                    required
                    value={userForm.name}
                    onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                    placeholder="Nhập họ và tên hoặc chọn từ danh sách học sinh..."
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:border-red-500"
                  />
                </div>

                {/* Phone & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Số Điện Thoại:</label>
                    <input
                      type="text"
                      value={userForm.phone}
                      onChange={(e) => setUserForm({ ...userForm, phone: e.target.value })}
                      placeholder="0912.xxx.xxx"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">Email:</label>
                    <input
                      type="email"
                      value={userForm.email}
                      onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                      placeholder="email@thpt.edu.vn"
                      className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono focus:border-red-500"
                    />
                  </div>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setIsUserModalOpen(false); setEditingUser(null); }}
                    className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-glow flex items-center gap-1.5"
                  >
                    <span>{editingUser ? 'Lưu Thay Đổi' : 'Tạo Tài Khoản'}</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* ================= MODAL: DUTY FORM (THÊM / SỬA CA TRỰC) ================= */}
      {isDutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-lg w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600 text-white font-bold">🛡️</span>
                <h3 className="text-base font-black text-white">
                  {editingDuty ? 'Chỉnh Sửa Ca Trực Cờ Đỏ' : 'Thêm Phân Công Trực Mới'}
                </h3>
              </div>
              <button
                onClick={() => { setIsDutyModalOpen(false); setEditingDuty(null); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDuty} className="space-y-3 text-xs">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Buổi Trực:</label>
                  <select
                    value={dutyForm.session}
                    onChange={(e) => {
                      const newSession = e.target.value as 'Sáng' | 'Chiều';
                      setDutyForm({ 
                        ...dutyForm, 
                        session: newSession,
                        shiftTime: newSession === 'Sáng' ? '06:45 - 07:15 & 11:15 - 11:45' : '12:45 - 13:15 & 16:45 - 17:15'
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                  >
                    <option value="Sáng">Buổi Sáng</option>
                    <option value="Chiều">Buổi Chiều</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Tuần Trực:</label>
                  <select
                    value={dutyForm.weekNumber}
                    onChange={(e) => setDutyForm({ ...dutyForm, weekNumber: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    {weeksConfig.map(w => (
                      <option key={w.weekNumber} value={w.weekNumber}>{w.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Thứ Trực:</label>
                  <select
                    value={dutyForm.day}
                    onChange={(e) => setDutyForm({ ...dutyForm, day: e.target.value as DayOfWeek })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="T2">Thứ Hai (T2)</option>
                    <option value="T3">Thứ Ba (T3)</option>
                    <option value="T4">Thứ Tư (T4)</option>
                    <option value="T5">Thứ Năm (T5)</option>
                    <option value="T6">Thứ Sáu (T6)</option>
                    <option value="T7">Thứ Bảy (T7)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Khu Vực / Phòng Trực:</label>
                  <input
                    type="text"
                    value={dutyForm.zone}
                    onChange={(e) => setDutyForm({ ...dutyForm, zone: e.target.value })}
                    placeholder="VD: Phòng 8 (tầng 2), Phòng 7 (tầng 2)"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-medium"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Chấm Điểm Lớp (Mục Tiêu):</label>
                  <input
                    type="text"
                    value={dutyForm.targetClasses}
                    onChange={(e) => setDutyForm({ ...dutyForm, targetClasses: e.target.value })}
                    placeholder="VD: 10/1, 10/2"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Cán Bộ Cờ Đỏ Trực:</label>
                  <select
                    value={dutyForm.auditorId}
                    onChange={(e) => {
                      const selAuditor = auditors.find(a => a.id === e.target.value) || users.find(u => u.id === e.target.value);
                      setDutyForm({
                        ...dutyForm,
                        auditorId: e.target.value,
                        auditorName: selAuditor?.name || '',
                        auditorClass: selAuditor?.classId || '11/2'
                      });
                    }}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    {auditors.length > 0 ? (
                      auditors.map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} (Chi đoàn {a.classId}){a.isActive ? '' : ' [Tạm nghỉ]'}
                        </option>
                      ))
                    ) : (
                      users.filter(u => u.role === 'auditor').map(a => (
                        <option key={a.id} value={a.id}>{a.name} ({a.classId || 'Cờ đỏ'})</option>
                      ))
                    )}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Chi Đoàn / Lớp:</label>
                  <input
                    type="text"
                    value={dutyForm.auditorClass}
                    onChange={(e) => setDutyForm({ ...dutyForm, auditorClass: e.target.value })}
                    placeholder="vd: 11/2"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Khung Giờ Ca Trực:</label>
                <input
                  type="text"
                  value={dutyForm.shiftTime}
                  onChange={(e) => setDutyForm({ ...dutyForm, shiftTime: e.target.value })}
                  placeholder="06:45 - 07:15 & 11:15 - 11:45"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="dutyLiveNow"
                  checked={dutyForm.isLiveNow}
                  onChange={(e) => setDutyForm({ ...dutyForm, isLiveNow: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <label htmlFor="dutyLiveNow" className="text-slate-300 cursor-pointer">
                  Đánh dấu ca trực đang hoạt động trực tiếp (Live Now)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsDutyModalOpen(false); setEditingDuty(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-glow"
                >
                  {editingDuty ? 'Cập Nhật Ca Trực' : 'Lưu Phân Công'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: AUDITOR MEMBER ADD / EDIT ================= */}
      {isAuditorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600 text-white font-bold">🚩</span>
                <h3 className="text-base font-black text-white">
                  {editingAuditor ? 'Chỉnh Sửa Thành Viên Cờ Đỏ' : 'Thêm Cán Bộ Cờ Đỏ Mới'}
                </h3>
              </div>
              <button
                onClick={() => { setIsAuditorModalOpen(false); setEditingAuditor(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAuditor} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Họ và Tên Cán Bộ:</label>
                <input
                  type="text"
                  required
                  value={auditorForm.name}
                  onChange={(e) => setAuditorForm({ ...auditorForm, name: e.target.value })}
                  placeholder="VD: Nguyễn Văn Nam"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Chi Đoàn / Lớp:</label>
                  <select
                    value={auditorForm.classId}
                    onChange={(e) => setAuditorForm({ ...auditorForm, classId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    {classes.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Số Điện Thoại:</label>
                  <input
                    type="text"
                    value={auditorForm.phone}
                    onChange={(e) => setAuditorForm({ ...auditorForm, phone: e.target.value })}
                    placeholder="0988.xxx.xxx"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Khu Vực Trực Ưu Tiên:</label>
                <select
                  value={auditorForm.assignedZone}
                  onChange={(e) => setAuditorForm({ ...auditorForm, assignedZone: e.target.value })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                >
                  {zones.map(z => (
                    <option key={z.id} value={z.name}>{z.icon || '📍'} {z.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Khung Giờ Ca Mặc Định:</label>
                <input
                  type="text"
                  value={auditorForm.defaultShiftTime}
                  onChange={(e) => setAuditorForm({ ...auditorForm, defaultShiftTime: e.target.value })}
                  placeholder="06:45 - 07:15 & 11:15 - 11:45"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="auditorActiveState"
                  checked={auditorForm.isActive}
                  onChange={(e) => setAuditorForm({ ...auditorForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-red-600 focus:ring-0 bg-slate-900 border-slate-700 cursor-pointer"
                />
                <label htmlFor="auditorActiveState" className="text-slate-300 cursor-pointer">
                  Đang hoạt động trực tiếp (Sẵn sàng nhận ca trực)
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsAuditorModalOpen(false); setEditingAuditor(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold shadow-glow"
                >
                  {editingAuditor ? 'Lưu Thay Đổi' : 'Thêm Thành Viên'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ZONE ADD / EDIT ================= */}
      {isZoneModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-600 text-white font-bold">📍</span>
                <h3 className="text-base font-black text-white">
                  {editingZone ? 'Chỉnh Sửa Khu Vực Giám Sát' : 'Thêm Khu Vực Giám Sát Mới'}
                </h3>
              </div>
              <button
                onClick={() => { setIsZoneModalOpen(false); setEditingZone(null); }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveZone} className="space-y-3 text-xs">
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Icon:</label>
                  <input
                    type="text"
                    value={zoneForm.icon}
                    onChange={(e) => setZoneForm({ ...zoneForm, icon: e.target.value })}
                    placeholder="🏢"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-center text-lg font-bold"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block font-bold text-slate-300 mb-1">Tên Khu Vực / Vị Trí:</label>
                  <input
                    type="text"
                    required
                    value={zoneForm.name}
                    onChange={(e) => setZoneForm({ ...zoneForm, name: e.target.value })}
                    placeholder="VD: Khu Căn Tin & Nhà Thi Đấu"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mô Tả / Vị Trí Cụ Thể:</label>
                <textarea
                  rows={2}
                  value={zoneForm.description}
                  onChange={(e) => setZoneForm({ ...zoneForm, description: e.target.value })}
                  placeholder="Ghi rõ phạm vi giám sát nề nếp, vệ sinh..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsZoneModalOpen(false); setEditingZone(null); }}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-glow"
                >
                  {editingZone ? 'Lưu Thay Đổi' : 'Thêm Khu Vực'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: COPY DUTIES TO ANOTHER WEEK ================= */}
      {isCopyDutyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-sm w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-600 text-white font-bold">📋</span>
                <h3 className="text-base font-black text-white">Sao Chép Lịch Trực</h3>
              </div>
              <button
                onClick={() => setIsCopyDutyModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Sao chép toàn bộ {duties.filter(d => d.weekNumber === dutyWeekFilter).length} ca trực từ <strong>Tuần {dutyWeekFilter}</strong> sang tuần mục tiêu.
            </p>

            <form onSubmit={handleCopyDuties} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Chọn Tuần Nhận Lịch:</label>
                <select
                  value={copyTargetWeek}
                  onChange={(e) => setCopyTargetWeek(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold"
                >
                  {weeksConfig.filter(w => w.weekNumber !== dutyWeekFilter).map(w => (
                    <option key={w.weekNumber} value={w.weekNumber}>{w.title}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCopyDutyModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-glow"
                >
                  Xác Nhận Sao Chép
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: LOCK PIN ================= */}
      {pinAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-sm w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600 text-white font-bold">🔒</span>
                <h3 className="text-base font-black text-white">
                  {pinAction === 'lock' ? 'Khóa Dữ Liệu Tuần' : 'Mở Khóa Dữ Liệu'}
                </h3>
              </div>
              <button
                onClick={() => setPinAction(null)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              {pinAction === 'lock'
                ? `Sau khi khóa sổ Tuần ${activeWeek}, dữ liệu sẽ đóng băng và không ai có thể sửa đổi điểm số.`
                : `Nhập mã PIN để mở khóa cho phép Cờ đỏ và GVCN tiếp tục cập nhật điểm Tuần ${activeWeek}.`}
            </p>

            <form onSubmit={handlePinSubmit} className="space-y-3">
              {pinError && (
                <div className="p-2 rounded-xl bg-rose-950 border border-rose-800 text-rose-300 text-xs">
                  {pinError}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Mã PIN Bảo Mật (Mặc định: 123456)</label>
                <input
                  type="password"
                  required
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="Nhập 6 số mã PIN"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-center font-mono tracking-widest text-base focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPinAction(null)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-white text-xs font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-glow"
                >
                  Xác Nhận
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT ACTIVITY SLIDE ================= */}
      {isSlideModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-xl w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-amber-600 text-white font-bold">📸</span>
                <div>
                  <h3 className="text-base font-black text-white">
                    {editingSlide ? 'Chỉnh Sửa Slide Ảnh Hoạt Động' : 'Thêm Slide Ảnh Hoạt Động Mới'}
                  </h3>
                  <p className="text-xs text-slate-400">Hiển thị nổi bật trên trang chủ Cổng thông tin đoàn trường</p>
                </div>
              </div>
              <button
                onClick={() => { setIsSlideModalOpen(false); setEditingSlide(null); }}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSlideFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">
                  Tiêu Đề Hoạt Động / Sự Kiện <span className="text-red-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={slideForm.title}
                  onChange={(e) => setSlideForm({ ...slideForm, title: e.target.value })}
                  placeholder="vd: Lễ Kết Nạp Đoàn Viên Mới – Đợt 26/03"
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Chú Thích / Mô Tả Phụ (Subtitle):</label>
                <textarea
                  rows={2}
                  value={slideForm.subtitle}
                  onChange={(e) => setSlideForm({ ...slideForm, subtitle: e.target.value })}
                  placeholder="Mô tả tóm tắt không khí, ý nghĩa hoặc thông điệp của hoạt động..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:border-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Chủ Đề / Tag:</label>
                  <select
                    value={slideForm.tag}
                    onChange={(e) => setSlideForm({ ...slideForm, tag: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="Kết nạp Đoàn">Kết nạp Đoàn</option>
                    <option value="Hội thao">Hội thao</option>
                    <option value="Tình nguyện">Tình nguyện</option>
                    <option value="Kỹ năng sống">Kỹ năng sống</option>
                    <option value="Phong trào">Phong trào</option>
                    <option value="Học tập">Học tập</option>
                    <option value="Văn nghệ">Văn nghệ</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ngày Diễn Ra:</label>
                  <input
                    type="text"
                    value={slideForm.date}
                    onChange={(e) => setSlideForm({ ...slideForm, date: e.target.value })}
                    placeholder="vd: 26/03/2026"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Thứ Tự Hiển Thị:</label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={slideForm.order}
                    onChange={(e) => setSlideForm({ ...slideForm, order: Number(e.target.value) })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>
              </div>

              {/* Image Source Selection */}
              <div className="space-y-2 p-3 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="block font-bold text-slate-300">
                  Hình Ảnh Slide <span className="text-red-500">*</span>:
                </label>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    required
                    value={slideForm.imageUrl}
                    onChange={(e) => setSlideForm({ ...slideForm, imageUrl: e.target.value })}
                    placeholder="Dán link ảnh hoặc chọn từ Kho Media..."
                    className="flex-1 p-2 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs"
                  />

                  <MediaPickerButton
                    category="branding"
                    value={slideForm.imageUrl}
                    onSelect={(url) => setSlideForm(prev => ({ ...prev, imageUrl: Array.isArray(url) ? url[0] : url }))}
                    label="Kho Media Slide"
                  />

                  <label className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shrink-0 border border-slate-700">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Từ Máy</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleSlideImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Sample Preset Images */}
                <div className="space-y-1 pt-1">
                  <p className="text-[10px] text-slate-400">Hoặc chọn nhanh ảnh mẫu hoạt động chất lượng cao:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Lễ Kết Nạp', url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1000&auto=format&fit=crop&q=80' },
                      { name: 'Hội Thao Thể Dục', url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=1000&auto=format&fit=crop&q=80' },
                      { name: 'Tình Nguyện Xung Kích', url: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1000&auto=format&fit=crop&q=80' },
                      { name: 'Diễn Đàn Học Sinh', url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1000&auto=format&fit=crop&q=80' },
                      { name: 'Văn Nghệ Chào Mừng', url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1000&auto=format&fit=crop&q=80' },
                    ].map(preset => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => setSlideForm({ ...slideForm, imageUrl: preset.url })}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[10px] text-slate-300 hover:text-white"
                      >
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Preview */}
                {slideForm.imageUrl && (
                  <div className="mt-2 w-full h-36 rounded-xl overflow-hidden border border-slate-700 relative bg-black">
                    <img
                      src={slideForm.imageUrl}
                      alt="Xem trước ảnh slide"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 text-[10px] text-emerald-400 font-bold border border-slate-800">
                      ✓ Ảnh hợp lệ
                    </div>
                  </div>
                )}
              </div>

              {/* Status Switch */}
              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="slideActiveCheck"
                  checked={slideForm.isActive}
                  onChange={(e) => setSlideForm({ ...slideForm, isActive: e.target.checked })}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-0 cursor-pointer"
                />
                <label htmlFor="slideActiveCheck" className="font-bold text-slate-200 cursor-pointer">
                  Kích hoạt hiển thị slide này ngay trên Cổng thông tin công cộng
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsSlideModalOpen(false); setEditingSlide(null); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white font-bold shadow-glow"
                >
                  {editingSlide ? 'Lưu Thay Đổi' : 'Thêm Slide Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= NOTICE / MOBILIZATION MODAL ================= */}
      {isNoticeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-600/30">
                  <Bell className="w-5 h-5" />
                </span>
                <h3 className="text-base font-black text-white">
                  {editingNotice ? 'CHỈNH SỬA LỆNH ĐIỀU ĐỘNG & NHIỆM VỤ' : 'PHÁT LỆNH ĐIỀU ĐỘNG & NHIỆM VỤ MỚI'}
                </h3>
              </div>
              <button
                onClick={() => { setIsNoticeModalOpen(false); setEditingNotice(null); }}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!noticeForm.title.trim() || !noticeForm.content.trim()) {
                  alert('Vui lòng nhập đầy đủ tiêu đề và nội dung nhiệm vụ!');
                  return;
                }
                if (editingNotice) {
                  updateNotice(editingNotice.id, noticeForm);
                } else {
                  addNotice(noticeForm);
                }
                setIsNoticeModalOpen(false);
                setEditingNotice(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tiêu Đề Lệnh Điều Động / Nhiệm Vụ *:</label>
                <input
                  type="text"
                  required
                  value={noticeForm.title}
                  onChange={(e) => setNoticeForm({ ...noticeForm, title: e.target.value })}
                  placeholder="VD: Điều động lao động dọn vệ sinh Sân bóng chuẩn bị Hội thao..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Loại Nhiệm Vụ:</label>
                  <select
                    value={noticeForm.type}
                    onChange={(e) => setNoticeForm({ ...noticeForm, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="lao_dong">🧹 Lao Động Vệ Sinh</option>
                    <option value="cuoc_hop">👥 Cuộc Họp BCH Chi Đoàn</option>
                    <option value="dieu_dong">📋 Điều Động Nhiệm Vụ</option>
                    <option value="khac">📌 Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Thời Hạn / Deadline:</label>
                  <input
                    type="text"
                    required
                    value={noticeForm.deadline}
                    onChange={(e) => setNoticeForm({ ...noticeForm, deadline: e.target.value })}
                    placeholder="VD: 2026-09-05 17:00"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>

              <RichTextEditor
                value={noticeForm.content}
                onChange={(content) => setNoticeForm({ ...noticeForm, content })}
                label="Nội Dung Chi Tiết Hướng Dẫn / Lệnh Điều Động"
                placeholder="Phân công chi đoàn, số lượng đoàn viên, dụng cụ mang theo, địa điểm tập trung và quy định chấm điểm chuyên cần..."
                toolbarPreset="standard"
                minHeight="180px"
              />

              <div>
                <label className="block font-bold text-slate-300 mb-1">Đối Tượng Phân Công (Chi Đoàn):</label>
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                    <input
                      type="checkbox"
                      checked={noticeForm.targetClasses.includes('ALL')}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setNoticeForm({ ...noticeForm, targetClasses: ['ALL'] });
                        } else {
                          setNoticeForm({ ...noticeForm, targetClasses: ['10/1'] });
                        }
                      }}
                      className="rounded bg-slate-800 border-slate-700 text-red-600"
                    />
                    <span className="text-emerald-400">Tất cả 18 Chi đoàn (Toàn trường)</span>
                  </label>

                  {!noticeForm.targetClasses.includes('ALL') && (
                    <div className="grid grid-cols-6 gap-1.5 pt-2 border-t border-slate-800">
                      {classes.map(c => {
                        const isChecked = noticeForm.targetClasses.includes(c.id);
                        return (
                          <label
                            key={c.id}
                            className={`p-1.5 rounded-lg border text-center font-bold text-[11px] cursor-pointer transition-all ${isChecked
                              ? 'bg-red-950 text-white border-red-700'
                              : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                              }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNoticeForm({ ...noticeForm, targetClasses: [...noticeForm.targetClasses.filter(x => x !== 'ALL'), c.id] });
                                } else {
                                  setNoticeForm({ ...noticeForm, targetClasses: noticeForm.targetClasses.filter(x => x !== c.id) });
                                }
                              }}
                              className="hidden"
                            />
                            {c.name}
                          </label>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Người / Ban Phát Lệnh:</label>
                  <input
                    type="text"
                    required
                    value={noticeForm.assignedBy}
                    onChange={(e) => setNoticeForm({ ...noticeForm, assignedBy: e.target.value })}
                    placeholder="VD: Cô Zdrăm Thị Thành Thương - Bí thư Đoàn"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Trạng Thái Ban Đầu:</label>
                  <select
                    value={noticeForm.status}
                    onChange={(e) => setNoticeForm({ ...noticeForm, status: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  >
                    <option value="pending">⏳ Đang Triển Khai</option>
                    <option value="completed">✓ Đã Hoàn Thành</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsNoticeModalOpen(false); setEditingNotice(null); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold shadow-glow"
                >
                  {editingNotice ? 'Lưu Thay Đổi' : 'Phát Lệnh Điều Động'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= YOUTH EVENT MODAL ================= */}
      {isEventModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-panel w-full max-w-xl rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
                  <Award className="w-5 h-5" />
                </span>
                <h3 className="text-base font-black text-white">
                  {editingEvent ? 'CHỈNH SỬA SỰ KIỆN PHONG TRÀO ĐOÀN' : 'TẠO SỰ KIỆN PHONG TRÀO ĐOÀN MỚI'}
                </h3>
              </div>
              <button
                onClick={() => { setIsEventModalOpen(false); setEditingEvent(null); }}
                className="p-1.5 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!eventForm.title.trim() || !eventForm.description.trim()) {
                  alert('Vui lòng nhập tiêu đề và mô tả sự kiện!');
                  return;
                }
                if (editingEvent) {
                  updateEvent(editingEvent.id, eventForm);
                } else {
                  addEvent(eventForm);
                }
                setIsEventModalOpen(false);
                setEditingEvent(null);
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tên Sự Kiện / Phong Trào *:</label>
                <input
                  type="text"
                  required
                  value={eventForm.title}
                  onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
                  placeholder="VD: Hội trại truyền thống 26/03 - Tiến bước lên Đoàn..."
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-sm focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Thể Loại Sự Kiện:</label>
                <select
                  value={eventForm.category}
                  onChange={(e) => setEventForm({ ...eventForm, category: e.target.value as any })}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                >
                  <option value="Phong trào">🏆 Phong Trào Thi Đua</option>
                  <option value="Tình nguyện">💚 Hoạt Động Tình Nguyện</option>
                  <option value="Thể thao">⚽ Hội Thao Thể Dục</option>
                  <option value="Học thuật">📚 Học Thuật & Sáng Tạo</option>
                  <option value="Văn nghệ">🎭 Văn Nghệ & Diễn Đàn</option>
                </select>
              </div>

              <RichTextEditor
                value={eventForm.description}
                onChange={(description) => setEventForm({ ...eventForm, description })}
                label="Mô Tả Chi Tiết Hoạt Động Đoàn"
                placeholder="Mô tả mục đích, nội dung chương trình, quyền lợi đoàn viên khi tham gia..."
                category="news_events"
                toolbarPreset="standard"
                minHeight="180px"
              />

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Địa Điểm Tổ Chức:</label>
                  <input
                    type="text"
                    required
                    value={eventForm.location}
                    onChange={(e) => setEventForm({ ...eventForm, location: e.target.value })}
                    placeholder="VD: Sân lễ / Nhà đa năng"
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Giới Hạn Số Lượng (Slots):</label>
                  <input
                    type="number"
                    min={1}
                    max={1000}
                    required
                    value={eventForm.maxSlots}
                    onChange={(e) => setEventForm({ ...eventForm, maxSlots: parseInt(e.target.value) || 50 })}
                    className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ngày Bắt Đầu:</label>
                  <input
                    type="date"
                    required
                    value={eventForm.startDate}
                    onChange={(e) => setEventForm({ ...eventForm, startDate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ngày Kết Thúc:</label>
                  <input
                    type="date"
                    required
                    value={eventForm.endDate}
                    onChange={(e) => setEventForm({ ...eventForm, endDate: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                  />
                </div>
              </div>

              {/* Thumbnail image */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Ảnh Bìa Sự Kiện:</label>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={eventForm.thumbnail}
                    onChange={(e) => setEventForm({ ...eventForm, thumbnail: e.target.value })}
                    placeholder="URL ảnh hoặc chọn từ Kho Media..."
                    className="flex-1 min-w-[200px] p-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs"
                  />
                  <MediaPickerButton
                    category="news_events"
                    value={eventForm.thumbnail}
                    onSelect={(url) => setEventForm(prev => ({ ...prev, thumbnail: Array.isArray(url) ? url[0] : url }))}
                    label="Kho Media Sự Kiện"
                  />
                  <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-slate-700 shrink-0">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Tải Ảnh</span>
                    <input
                      type="file"
                      ref={eventThumbnailRef}
                      accept="image/*"
                      onChange={handleEventThumbnailUpload}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Mã Token QR Check-in:</label>
                  <input
                    type="text"
                    required
                    value={eventForm.qrCodeValue}
                    onChange={(e) => setEventForm({ ...eventForm, qrCodeValue: e.target.value })}
                    className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-mono font-bold"
                  />
                </div>
                <div className="flex items-center pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                    <input
                      type="checkbox"
                      checked={eventForm.isRegistrationOpen}
                      onChange={(e) => setEventForm({ ...eventForm, isRegistrationOpen: e.target.checked })}
                      className="rounded bg-slate-800 border-slate-700 text-emerald-600"
                    />
                    <span className="text-emerald-400">Đang mở đăng ký tham gia</span>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => { setIsEventModalOpen(false); setEditingEvent(null); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-white font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold shadow-glow"
                >
                  {editingEvent ? 'Lưu Thay Đổi' : 'Tạo Sự Kiện Mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: QUẢN LÝ & THÊM/XÓA ĐIỂM THƯỞNG CHO LỚP ================= */}
      {bonusModalClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-xl w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-400 font-black text-xl flex items-center justify-center">
                  ⭐
                </div>
                <div>
                  <h3 className="text-base font-black text-white flex items-center gap-2">
                    <span>ĐIỂM THƯỞNG PHONG TRÀO & THI ĐUA</span>
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800 text-xs font-bold">
                      {bonusModalClass.className}
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400">Cộng hoặc xóa điểm thưởng trực tiếp cho lớp • Tuần {activeWeek}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setBonusModalClass(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Section 1: Form Thêm Điểm Thưởng Mới */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (bonusPointsInput <= 0) {
                  alert('Vui lòng nhập số điểm thưởng lớn hơn 0!');
                  return;
                }
                addViolation({
                  classId: bonusModalClass.classId,
                  className: bonusModalClass.className,
                  day: bonusDayInput,
                  date: new Date().toLocaleDateString('vi-VN'),
                  weekNumber: activeWeek,
                  criterionId: 'bonus_custom',
                  criterionName: bonusReasonInput.trim() || 'Khen thưởng phong trào Đoàn',
                  groupName: 'Khen thưởng & Điểm cộng',
                  quantity: 1,
                  pointsDeducted: 0,
                  bonusPoints: Number(bonusPointsInput),
                  type: 'bonus',
                  note: bonusNoteInput.trim(),
                  proofImages: [],
                  reportedBy: {
                    id: currentUser?.id || 'admin',
                    name: currentUser?.name || 'Bí thư Đoàn',
                    role: 'Bí thư Đoàn'
                  }
                });
                setBonusReasonInput('Khen thưởng phong trào Đoàn');
                setBonusNoteInput('');
                alert(`Đã cộng +${bonusPointsInput} điểm thưởng cho ${bonusModalClass.className} thành công!`);
              }}
              className="p-4 rounded-2xl bg-slate-900/90 border border-emerald-800/40 space-y-3.5"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span>➕</span>
                  <span>Nhập Điểm Thưởng Mới:</span>
                </h4>
                <span className="text-[10px] text-slate-400">Admin toàn quyền ghi nhận</span>
              </div>

              {/* Điểm thưởng & Quick Presets */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Số điểm thưởng cộng thêm:
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-2.5 text-emerald-400 font-bold">+</span>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      required
                      value={bonusPointsInput}
                      onChange={(e) => setBonusPointsInput(Number(e.target.value))}
                      className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-emerald-300 font-black text-sm focus:outline-none focus:border-emerald-500 font-mono"
                    />
                  </div>
                  <span className="text-xs font-bold text-slate-400">điểm</span>
                </div>

                {/* Presets */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[5, 10, 15, 20, 30, 50].map(pt => (
                    <button
                      key={pt}
                      type="button"
                      onClick={() => setBonusPointsInput(pt)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-colors ${bonusPointsInput === pt
                        ? 'bg-emerald-600 text-white shadow-glow'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                        }`}
                    >
                      +{pt}đ
                    </button>
                  ))}
                </div>
              </div>

              {/* Lý do thưởng & Ngày ghi nhận */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="sm:col-span-2 space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Lý do khen thưởng / Tiêu chí cộng:</label>
                  <input
                    type="text"
                    required
                    placeholder="VD: Nhất hội thi văn nghệ, Trực nhật xuất sắc..."
                    value={bonusReasonInput}
                    onChange={(e) => setBonusReasonInput(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Ngày ghi nhận:</label>
                  <select
                    value={bonusDayInput}
                    onChange={(e) => setBonusDayInput(e.target.value as DayOfWeek)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs focus:outline-none focus:border-emerald-500"
                  >
                    {(['T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as DayOfWeek[]).map(d => (
                      <option key={d} value={d} className="bg-slate-900 text-white">Thứ {d.replace('T', '')}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Gợi ý lý do thưởng */}
              <div className="flex flex-wrap gap-1 text-[10px]">
                <span className="text-slate-400">Gợi ý:</span>
                {[
                  'Giải Nhất phong trào 26/3',
                  'Tập thể xuất sắc tuần',
                  'Ủng hộ Kế hoạch nhỏ',
                  'Giải Nhất Thể thao cấp trường',
                  'Khen thưởng đột xuất'
                ].map(r => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setBonusReasonInput(r)}
                    className="px-2 py-0.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
                  >
                    {r}
                  </button>
                ))}
              </div>

              {/* Ghi chú */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">Ghi chú thêm (tùy chọn):</label>
                <input
                  type="text"
                  placeholder="Ghi chú chi tiết hoặc số quyết định khen thưởng..."
                  value={bonusNoteInput}
                  onChange={(e) => setBonusNoteInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black shadow-glow flex items-center justify-center gap-1.5 transition-all"
              >
                <span>➕</span>
                <span>CỘNG ĐIỂM THƯỞNG CHO {bonusModalClass.className.toUpperCase()}</span>
              </button>
            </form>

            {/* Section 2: Danh sách các lần đã cộng điểm thưởng trong tuần */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black text-slate-300 uppercase">
                  Lịch Sử Điểm Thưởng Tuần {activeWeek}:
                </h4>
                {(() => {
                  const classBonuses = violations.filter(v =>
                    v.classId === bonusModalClass.classId &&
                    v.weekNumber === activeWeek &&
                    ((v.bonusPoints && v.bonusPoints > 0) || v.type === 'bonus')
                  );
                  const total = classBonuses.reduce((s, v) => s + (v.bonusPoints || 0), 0);
                  return (
                    <span className="text-xs font-black text-emerald-400 font-mono">
                      Tổng thưởng: +{total}đ
                    </span>
                  );
                })()}
              </div>

              {(() => {
                const classBonuses = violations.filter(v =>
                  v.classId === bonusModalClass.classId &&
                  v.weekNumber === activeWeek &&
                  ((v.bonusPoints && v.bonusPoints > 0) || v.type === 'bonus')
                );

                if (classBonuses.length === 0) {
                  return (
                    <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                      Lớp {bonusModalClass.className} chưa có điểm thưởng nào trong Tuần {activeWeek}.
                    </div>
                  );
                }

                return (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {classBonuses.map(b => (
                      <div
                        key={b.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-emerald-300">{b.criterionName}</span>
                            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-[10px] text-amber-400 font-bold font-mono">
                              {b.day}
                            </span>
                          </div>
                          {b.note && <p className="text-[11px] text-slate-400">{b.note}</p>}
                          <p className="text-[10px] text-slate-500">Người ghi nhận: {b.reportedBy.name} • {b.reportedAt}</p>
                        </div>

                        <div className="flex items-center gap-2.5 shrink-0">
                          <span className="text-sm font-black text-emerald-400 font-mono">
                            +{b.bonusPoints}đ
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`Bạn có chắc chắn muốn xóa điểm thưởng "${b.criterionName}" (+${b.bonusPoints}đ) của lớp ${bonusModalClass.className}?`)) {
                                deleteViolation(b.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-900 hover:bg-rose-950 text-slate-400 hover:text-rose-400 border border-slate-800 hover:border-rose-800 transition-colors"
                            title="Xóa điểm thưởng này"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            <div className="pt-3 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setBonusModalClass(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= DIRECT SCORE INPUT MODAL (SINGLE CLASS) ================= */}
      {directScoreModalClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-600/30 text-base">
                  ✏️
                </span>
                <div>
                  <h3 className="text-base font-black text-white">
                    NHẬP / ĐIỀU CHỈNH ĐIỂM TRỰC TIẾP
                  </h3>
                  <p className="text-xs text-slate-400">
                    Lớp: <strong className="text-amber-400">{directScoreModalClass.className}</strong> • <strong className="text-white">Tuần {violationHubWeek}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDirectScoreModalClass(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Current Score Summary Card */}
            <div className="grid grid-cols-4 gap-2 p-3 rounded-2xl bg-slate-950 border border-slate-800 text-center text-xs">
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block">Định mức</span>
                <span className="font-mono font-bold text-slate-300">1440đ</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block">Tổng trừ</span>
                <span className="font-mono font-bold text-rose-400">-{directScoreModalClass.currentDeduct}đ</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-slate-400 font-bold block">Điểm thưởng</span>
                <span className="font-mono font-bold text-emerald-400">+{directScoreModalClass.currentBonus}đ</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-[10px] text-amber-400 font-bold block">Điểm hiện tại</span>
                <span className="font-mono font-black text-amber-300 text-sm">{directScoreModalClass.currentScore}đ</span>
              </div>
            </div>

            <form onSubmit={handleSaveDirectScore} className="space-y-4 text-xs">
              {/* Target Score Input */}
              <div className="space-y-1.5">
                <label className="block font-bold text-slate-200">
                  🎯 Nhập Tổng Điểm Mong Muốn Cho Tuần {violationHubWeek} (*):
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="0"
                    max="2000"
                    required
                    value={directScoreTarget}
                    onChange={(e) => setDirectScoreTarget(Number(e.target.value))}
                    className="w-full px-4 py-2.5 rounded-2xl bg-slate-950 border border-slate-700 text-amber-300 font-mono font-black text-lg focus:outline-none focus:border-amber-500 shadow-inner"
                    placeholder="Ví dụ: 1425, 1450, 1440..."
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">
                    điểm
                  </span>
                </div>

                {/* Fast Preset Buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] text-slate-400 self-center mr-1">Điểm mẫu:</span>
                  {[1440, 1435, 1430, 1420, 1410, 1400, 1450, 1460].map(preset => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDirectScoreTarget(preset)}
                      className={`px-2 py-0.5 rounded-lg font-mono text-[11px] font-bold border transition-all ${directScoreTarget === preset
                        ? 'bg-amber-600 border-amber-500 text-white shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white hover:border-slate-600'
                        }`}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Delta Calculation Preview */}
              {(() => {
                const delta = Number(directScoreTarget) - directScoreModalClass.currentScore;
                if (delta > 0) {
                  return (
                    <div className="p-2.5 rounded-xl bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>🟢</span>
                        <span>Điểm tổng kết sẽ <strong>TĂNG</strong> thêm:</span>
                      </div>
                      <span className="font-mono font-black text-sm text-emerald-400">+{delta} điểm thưởng</span>
                    </div>
                  );
                } else if (delta < 0) {
                  return (
                    <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-300 text-xs flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span>🔴</span>
                        <span>Điểm tổng kết sẽ <strong>GIẢM</strong> đi:</span>
                      </div>
                      <span className="font-mono font-black text-sm text-rose-400">{delta} điểm</span>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 text-xs flex items-center gap-1.5">
                      <span>⚪</span>
                      <span>Điểm giữ nguyên không đổi (0đ chênh lệch).</span>
                    </div>
                  );
                }
              })()}

              {/* Reason Input */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">
                  Lý do / Căn cứ điều chỉnh điểm (*):
                </label>
                <input
                  type="text"
                  required
                  value={directScoreReason}
                  onChange={(e) => setDirectScoreReason(e.target.value)}
                  placeholder="Ví dụ: BGH duyệt điểm tuần; Khen thưởng thành tích đột xuất; Khấu trừ vi phạm phát sinh..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              {/* Day Selector */}
              <div className="space-y-1">
                <label className="block font-bold text-slate-300">
                  Gán vào ngày / thứ trong tuần:
                </label>
                <select
                  value={directScoreDay}
                  onChange={(e) => setDirectScoreDay(e.target.value as DayOfWeek)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="T2">Thứ Hai (T2)</option>
                  <option value="T3">Thứ Ba (T3)</option>
                  <option value="T4">Thứ Tư (T4)</option>
                  <option value="T5">Thứ Năm (T5)</option>
                  <option value="T6">Thứ Sáu (T6)</option>
                  <option value="T7">Thứ Bảy (T7)</option>
                </select>
              </div>

              {/* Modal Buttons */}
              <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setDirectScoreModalClass(null)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-bold shadow-glow flex items-center gap-1.5 active:scale-95"
                >
                  <span>💾</span>
                  <span>Lưu & Cập Nhật Điểm Lớp {directScoreModalClass.className}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= BATCH DIRECT SCORE ENTRY MODAL (18 CLASSES) ================= */}
      {isBatchDirectScoreModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col animate-scaleUp">

            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 shrink-0">
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-amber-600/20 text-amber-400 border border-amber-600/30 text-lg">
                  ⚡
                </span>
                <div>
                  <h3 className="text-base font-black text-white">
                    BẢNG NHẬP ĐIỂM TRỰC TIẾP HÀNG LOẠT 18 LỚP
                  </h3>
                  <p className="text-xs text-slate-400">
                    Toàn quyền thiết lập và điều chỉnh nhanh điểm thi đua tổng kết cho tất cả các Chi đoàn trong <strong className="text-amber-400">Tuần {violationHubWeek}</strong>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBatchDirectScoreModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Presets Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-2xl bg-slate-950 border border-slate-800 text-xs shrink-0">
              <span className="text-slate-400 text-[11px]">Thao tác nhanh cho tất cả:</span>
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    const updated: Record<string, { targetScore: number; reason: string }> = {};
                    scores.forEach(s => {
                      updated[s.classId] = {
                        targetScore: 1440,
                        reason: 'Đặt về điểm chuẩn 1440đ'
                      };
                    });
                    setBatchScores(updated);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-amber-300 border border-slate-700 text-[11px] font-bold"
                >
                  ⚡ Đặt tất cả về 1440đ (Điểm chuẩn)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const reset: Record<string, { targetScore: number; reason: string }> = {};
                    scores.forEach(s => {
                      reset[s.classId] = {
                        targetScore: s.finalScore,
                        reason: 'Điều chỉnh điểm tuần hàng loạt'
                      };
                    });
                    setBatchScores(reset);
                  }}
                  className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-700 text-[11px] font-bold"
                >
                  ↺ Khôi phục điểm hiện tại
                </button>
              </div>
            </div>

            {/* Editable Spreadsheet Table */}
            <div className="overflow-y-auto flex-1 rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-950 z-10 border-b border-slate-800">
                  <tr className="text-slate-300">
                    <th className="p-2.5 text-center font-bold">Hạng</th>
                    <th className="p-2.5 font-bold">Lớp</th>
                    <th className="p-2.5 font-bold">GVCN</th>
                    <th className="p-2.5 text-center font-bold">Điểm Hiện Tại</th>
                    <th className="p-2.5 text-center font-bold text-amber-400">Điểm Mới Mong Muốn</th>
                    <th className="p-2.5 text-center font-bold">Chênh Lệch</th>
                    <th className="p-2.5 font-bold">Lý Do / Ghi Chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 bg-slate-900/50">
                  {scores.map(s => {
                    const entry = batchScores[s.classId] || { targetScore: s.finalScore, reason: '' };
                    const delta = Number(entry.targetScore) - s.finalScore;

                    return (
                      <tr key={s.classId} className="hover:bg-slate-800/40 transition-colors">
                        <td className="p-2 text-center font-black text-slate-400">
                          #{s.rank}
                        </td>
                        <td className="p-2 font-bold text-white whitespace-nowrap">
                          {s.className}
                        </td>
                        <td className="p-2 text-slate-400 whitespace-nowrap text-[11px]">
                          {classes.find(c => c.id === s.classId)?.gvcnName.replace('Thầy ', '').replace('Cô ', '')}
                        </td>
                        <td className="p-2 text-center font-mono font-bold text-slate-300">
                          {s.finalScore}đ
                        </td>
                        <td className="p-2 text-center">
                          <input
                            type="number"
                            min="0"
                            max="2000"
                            value={entry.targetScore}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              setBatchScores(prev => ({
                                ...prev,
                                [s.classId]: {
                                  targetScore: val,
                                  reason: prev[s.classId]?.reason || 'Điều chỉnh điểm trực tiếp (Admin)'
                                }
                              }));
                            }}
                            className={`w-24 px-2 py-1 rounded-lg text-center font-mono font-black text-xs border focus:outline-none ${delta !== 0
                              ? 'bg-amber-950 text-amber-300 border-amber-500 shadow-sm'
                              : 'bg-slate-950 text-slate-200 border-slate-700'
                              }`}
                          />
                        </td>
                        <td className="p-2 text-center font-mono font-bold text-xs">
                          {delta > 0 ? (
                            <span className="text-emerald-400">+{delta}đ</span>
                          ) : delta < 0 ? (
                            <span className="text-rose-400">{delta}đ</span>
                          ) : (
                            <span className="text-slate-600">0đ</span>
                          )}
                        </td>
                        <td className="p-2">
                          <input
                            type="text"
                            value={entry.reason}
                            onChange={(e) => {
                              const r = e.target.value;
                              setBatchScores(prev => ({
                                ...prev,
                                [s.classId]: {
                                  targetScore: prev[s.classId]?.targetScore ?? s.finalScore,
                                  reason: r
                                }
                              }));
                            }}
                            placeholder="Lý do điều chỉnh..."
                            className="w-full px-2 py-1 rounded-lg bg-slate-950 border border-slate-800 text-white text-[11px] focus:outline-none focus:border-slate-600"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer Buttons */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-between shrink-0">
              <span className="text-xs text-slate-400">
                Lưu ý: Hệ thống sẽ tự động tính chênh lệch và cập nhật vị thứ thi đua toàn trường.
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsBatchDirectScoreModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors"
                >
                  Hủy Bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSaveBatchDirectScores}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-glow flex items-center gap-1.5 active:scale-95 transition-all"
                >
                  <span>💾</span>
                  <span>Lưu Toàn Bộ Bảng Điểm 18 Lớp</span>
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Academic Year Rollover 4-Step Wizard Modal */}
      {isRolloverModalOpen && (
        <AcademicYearRolloverModal
          isOpen={isRolloverModalOpen}
          onClose={() => setIsRolloverModalOpen(false)}
        />
      )}

      {/* Photo Lightbox */}
      {viewingPhoto && (
        <PhotoViewerModal
          isOpen={true}
          onClose={() => setViewingPhoto(null)}
          imageUrl={viewingPhoto}
          title="Minh chứng vi phạm / khiếu nại"
        />
      )}

      {/* Media Item Detail Lightbox */}
      {previewMediaItem && (
        <PhotoViewerModal
          isOpen={true}
          onClose={() => setPreviewMediaItem(null)}
          imageUrl={previewMediaItem.url}
          title={previewMediaItem.title || 'Chi tiết hình ảnh Media'}
          caption={
            previewMediaItem.description ||
            `Phân loại: ${previewMediaItem.category} • Lớp: ${previewMediaItem.classId || 'Toàn trường'} • Tải bởi: ${typeof previewMediaItem.uploadedBy === 'object' ? (previewMediaItem.uploadedBy?.name || 'Hệ thống') : (previewMediaItem.uploadedBy || 'Hệ thống')}`
          }
        />
      )}

      {/* Global Full Media Manager Modal */}
      {isGlobalMediaModalOpen && (
        <MediaManagerModal
          isOpen={isGlobalMediaModalOpen}
          onClose={() => setIsGlobalMediaModalOpen(false)}
          defaultCategory="all"
          allowSelect={false}
          title="HỆ THỐNG TRÌNH QUẢN LÝ MEDIA & HÌNH ẢNH TOÀN TRƯỜNG"
        />
      )}

      {/* Global Full Document & Folder Manager Modal */}
      {isGlobalDocumentModalOpen && (
        <DocumentManagerModal
          isOpen={isGlobalDocumentModalOpen}
          onClose={() => setIsGlobalDocumentModalOpen(false)}
          title="HỆ THỐNG QUẢN TRỊ KHO VĂN BẢN, BIỂU MẪU & THƯ MỤC PHÂN CẤP"
          allowManageFolders={true}
          allowUpload={true}
          allowDelete={true}
          onPreview={(doc: import('../../types').DocumentFile) => setPreviewDocumentFile(doc)}
        />
      )}

      {/* Document Detail / Preview Lightbox */}
      {previewDocumentFile && (
        <DocumentViewerModal
          isOpen={true}
          onClose={() => setPreviewDocumentFile(null)}
          document={previewDocumentFile}
        />
      )}

    </div>
  );
};
