import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Sparkles, 
  Calendar, 
  CheckCircle2, 
  GraduationCap, 
  ArrowRight, 
  Users, 
  Shield, 
  FileSpreadsheet, 
  AlertTriangle, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Flame,
  Award,
  Check,
  RefreshCw,
  Info
} from 'lucide-react';
import * as XLSX from 'xlsx';

interface AcademicYearRolloverModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AcademicYearRolloverModal: React.FC<AcademicYearRolloverModalProps> = ({ isOpen, onClose }) => {
  const { 
    classes, 
    students, 
    criteria, 
    users, 
    auditors, 
    academicYears, 
    currentAcademicYear, 
    executeAcademicYearRollover,
    importStudents
  } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: New Academic Year Details
  const [newYearId, setNewYearId] = useState('2026_2027');
  const [newYearName, setNewYearName] = useState('Năm học 2026 - 2027');
  const [startDate, setStartDate] = useState('2026-09-05');
  const [endDate, setEndDate] = useState('2027-05-31');

  // Step 2: Criteria
  const [cloneCriteria, setCloneCriteria] = useState(true);

  // Step 3: Promotion Mapping & Grade 12 Graduation
  const grade12Classes = useMemo(() => classes.filter(c => c.grade === 12), [classes]);
  const grade11Classes = useMemo(() => classes.filter(c => c.grade === 11), [classes]);
  const grade10Classes = useMemo(() => classes.filter(c => c.grade === 10), [classes]);

  const [graduatedGrade12ClassIds, setGraduatedGrade12ClassIds] = useState<string[]>(() => 
    classes.filter(c => c.grade === 12).map(c => c.id)
  );

  // Default auto-mapping: 10/1 -> 11/1, 11/1 -> 12/1
  const [promotionMapping, setPromotionMapping] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    // 10 -> 11
    classes.filter(c => c.grade === 10).forEach(c => {
      const suffix = c.id.split('/')[1] || '1';
      map[c.id] = `11/${suffix}`;
    });
    // 11 -> 12
    classes.filter(c => c.grade === 11).forEach(c => {
      const suffix = c.id.split('/')[1] || '1';
      map[c.id] = `12/${suffix}`;
    });
    return map;
  });

  // Step 4: GVCN & Auditor Reassignments
  const [gvcnAssignments, setGvcnAssignments] = useState<Record<string, { gvcnName: string; gvcnId: string }>>(() => {
    const map: Record<string, { gvcnName: string; gvcnId: string }> = {};
    classes.forEach(c => {
      map[c.id] = { gvcnName: c.gvcnName, gvcnId: c.gvcnId };
    });
    return map;
  });

  const [selectedAuditors, setSelectedAuditors] = useState<string[]>(() => 
    auditors.filter(a => !a.classId.startsWith('12/')).map(a => a.id)
  );

  const [confirmPin, setConfirmPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Count metrics for summary
  const grade12StudentsCount = useMemo(() => {
    return students.filter(s => s.grade === 12 && s.status !== 'graduated').length;
  }, [students]);

  const promotedStudentsCount = useMemo(() => {
    return students.filter(s => (s.grade === 10 || s.grade === 11) && s.status === 'active').length;
  }, [students]);

  const teacherUsers = useMemo(() => {
    return users.filter(u => u.role === 'manager' || u.role === 'admin');
  }, [users]);

  // Handle Excel download template for new Grade 10 students
  const handleDownloadGrade10Template = () => {
    const ws = XLSX.utils.json_to_sheet([
      { 'Mã Học Sinh': 'HS20261001', 'Họ Và Tên': 'Nguyễn Văn An', 'Lớp': '10/1', 'Khối': 10, 'Giới Tính': 'Nam', 'Ngày Sinh': '2011-03-15', 'Dân Tộc': 'Kinh', 'Số Điện Thoại': '0901234567', 'Đã Vào Đoàn': 'Chưa', 'Địa Chỉ': 'Xã Đông Giang' },
      { 'Mã Học Sinh': 'HS20261002', 'Họ Và Tên': 'Trần Thị Bình', 'Lớp': '10/1', 'Khối': 10, 'Giới Tính': 'Nữ', 'Ngày Sinh': '2011-06-20', 'Dân Tộc': 'Kinh', 'Số Điện Thoại': '0907654321', 'Đã Vào Đoàn': 'Đã vào', 'Địa Chỉ': 'Thôn Trung Sơn' },
      { 'Mã Học Sinh': 'HS20261003', 'Họ Và Tên': 'Alăng Thị Mai', 'Lớp': '10/2', 'Khối': 10, 'Giới Tính': 'Nữ', 'Ngày Sinh': '2011-09-10', 'Dân Tộc': 'Cơ Tu', 'Số Điện Thoại': '0912345678', 'Đã Vào Đoàn': 'Chưa', 'Địa Chỉ': 'Xã Đông Giang' }
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tan_Binh_Khoi_10');
    XLSX.writeFile(wb, `Mau_Nhap_Hoc_Sinh_Khoi_10_${newYearId}.xlsx`);
  };

  // Handle Excel upload for Grade 10
  const handleImportGrade10Excel = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const rawRows: any[] = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet]);

          const parsedList: any[] = rawRows.map((r, idx) => ({
            studentId: r['Mã Học Sinh'] || `HS${Date.now()}${idx}`,
            name: r['Họ Và Tên'] || r['Họ và tên'] || 'Học sinh mới',
            classId: String(r['Lớp'] || '10/1'),
            grade: 10 as const,
            gender: r['Giới Tính'] === 'Nữ' ? 'Nữ' : 'Nam',
            dob: r['Ngày Sinh'] || '2011-01-01',
            ethnicity: r['Dân Tộc'] || 'Kinh',
            phone: r['Số Điện Thoại'] || '',
            address: r['Địa Chỉ'] || 'Đông Giang',
            isUnionMember: String(r['Đã Vào Đoàn']).toLowerCase().includes('đã') || false,
            points: 100,
            rankTitle: 'Đoàn viên',
            status: 'active' as const
          }));

          const count = importStudents(parsedList);
          alert(`Đã nạp thành công ${count} tân binh Khối 10 vào hệ thống!`);
        } catch (err: any) {
          alert('Lỗi đọc file Excel: ' + err.message);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Final Action: Execute Rollover
  const handleFinalSubmit = () => {
    if (confirmPin !== 'KICHHOAT') {
      alert('Vui lòng nhập chính xác chữ "KICHHOAT" để xác nhận chuyển giao năm học!');
      return;
    }

    setIsSubmitting(true);
    const res = executeAcademicYearRollover({
      newYearId,
      newYearName,
      startDate,
      endDate,
      cloneCriteria,
      graduatedGrade12ClassIds,
      promotionMapping,
      gvcnAssignments,
      auditorMemberIds: selectedAuditors
    });

    setIsSubmitting(false);
    if (res.success) {
      alert(res.message);
      onClose();
    } else {
      alert(res.message);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-modal max-w-4xl w-full rounded-3xl border border-slate-700 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 bg-gradient-to-r from-red-950/60 via-slate-900 to-amber-950/40 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white shadow-glow">
              <RefreshCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
                <span>TRÌNH HƯỚNG DẪN CHUYỂN GIAO NĂM HỌC (ROLLOVER WIZARD)</span>
              </h3>
              <p className="text-xs text-slate-400">
                Chuyển giao năm học mới an toàn 100%, bảo tồn lịch sử năm cũ, tốt nghiệp K12 và nâng khóa học sinh
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Progress Bar (4 Steps) */}
        <div className="grid grid-cols-4 bg-slate-950 border-b border-slate-800 text-xs font-bold shrink-0">
          {[
            { num: 1, title: '1. Đóng Băng & Tạo Mới', icon: Calendar },
            { num: 2, title: '2. Tiêu Chí Thi Đua', icon: Award },
            { num: 3, title: '3. Nâng Khóa & K12', icon: GraduationCap },
            { num: 4, title: '4. Gán GVCN & Kích Hoạt', icon: Sparkles }
          ].map((s) => (
            <button
              key={s.num}
              type="button"
              onClick={() => setStep(s.num as any)}
              className={`p-3 text-center border-r border-slate-800 last:border-r-0 flex items-center justify-center gap-2 transition-all ${
                step === s.num
                  ? 'bg-gradient-to-r from-red-600/30 to-amber-600/30 text-amber-300 border-b-2 border-b-amber-500 font-black'
                  : step > s.num
                    ? 'text-emerald-400 hover:bg-slate-900/60'
                    : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono ${
                step === s.num ? 'bg-amber-500 text-slate-950 font-black' : step > s.num ? 'bg-emerald-500 text-white' : 'bg-slate-800 text-slate-400'
              }`}>
                {step > s.num ? '✓' : s.num}
              </span>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
          ))}
        </div>

        {/* Step Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* ================= STEP 1: CREATE NEW YEAR ================= */}
          {step === 1 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-800/40 flex items-start gap-3">
                <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="font-bold text-amber-300">Nguyên tắc Đóng Băng & Cô Lập Dữ Liệu Năm Học</h4>
                  <p className="text-slate-300 leading-relaxed">
                    Năm học hiện tại (<strong className="text-white">{currentAcademicYear.name}</strong>) sẽ tự động được chuyển sang trạng thái <strong>Đóng Băng (Frozen - Read Only)</strong>. 
                    Mọi điểm số, bảng vi phạm và kết quả xếp hạng của năm cũ sẽ được bảo tồn vĩnh viễn và có thể xem lại bất cứ lúc nào qua Menu chọn Năm học trên Header.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">Mã định danh năm học (ID)</label>
                  <input
                    type="text"
                    value={newYearId}
                    onChange={(e) => setNewYearId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-mono focus:border-red-500 focus:outline-none"
                    placeholder="2026_2027"
                  />
                  <span className="text-[10px] text-slate-500">Định dạng chuẩn: YYYY_YYYY (VD: 2026_2027)</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">Tên hiển thị năm học</label>
                  <input
                    type="text"
                    value={newYearName}
                    onChange={(e) => setNewYearName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white font-bold focus:border-red-500 focus:outline-none"
                    placeholder="Năm học 2026 - 2027"
                  />
                  <span className="text-[10px] text-slate-500">Tên sẽ xuất hiện trên bảng điểm và báo cáo PDF</span>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">Ngày Khai Giảng / Bắt đầu</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-300 font-bold block">Ngày Bế Giảng / Kết thúc</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 2: CRITERIA ================= */}
          {step === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-white text-sm">Kế Thừa Bộ Tiêu Chí Nề Nếp Hiện Hành ({criteria.length} Tiêu Chí)</h4>
                  <p className="text-slate-400 text-xs">Sử dụng lại hệ thống thang điểm trừ/thưởng nề nếp đã được cấu hình tối ưu</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cloneCriteria}
                    onChange={(e) => setCloneCriteria(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <span className="font-bold text-slate-300 block">Xem trước các nhóm tiêu chí được kế thừa:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {['I.1. Chuyên cần & Giờ giấc (40đ)', 'I.2. Đồng phục & Tác phong (30đ)', 'I.3. Học tập & Kỷ luật lớp (65đ)', 'I.4. Vệ sinh & Môi trường (90đ)'].map((g, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2 text-slate-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>{g}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 italic">
                  * Thầy/Cô có thể tùy chỉnh thêm, sửa, tắt/bật các tiêu chí sau khi kích hoạt năm học mới tại mục Quản lý Tiêu chí.
                </p>
              </div>
            </div>
          )}

          {/* ================= STEP 3: PROMOTION & GRADUATION ================= */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Section 1: Grade 12 Graduation */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-red-950/40 to-slate-900 border border-red-800/40 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="space-y-0.5">
                    <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                      <GraduationCap className="w-5 h-5 text-amber-400" />
                      <span>Xử Lý Học Sinh Khối 12 Ra Trường ({grade12StudentsCount} Học Sinh)</span>
                    </h4>
                    <p className="text-slate-400 text-xs">
                      Tự động chuyển trạng thái học sinh Khối 12 sang <code className="text-amber-400 bg-slate-950 px-1.5 py-0.5 rounded">status: 'graduated'</code> và lưu trữ mềm vào kho hồ sơ.
                    </p>
                  </div>
                  <span className="px-3 py-1.5 rounded-xl bg-red-600/30 border border-red-500/40 text-red-300 font-bold text-xs shrink-0 flex items-center gap-1.5">
                    <Check className="w-4 h-4" /> 6 Lớp 12 Tốt Nghiệp
                  </span>
                </div>
              </div>

              {/* Section 2: Promotion Mapping Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Nối Khóa & Nâng Lớp (Khối 10 lên 11 & Khối 11 lên 12)</h4>
                    <p className="text-slate-400 text-xs">
                      Hệ thống tự động cập nhật lớp mới cho <strong className="text-emerald-400">{promotedStudentsCount} học sinh</strong> trong khi bảo toàn 100% điểm phong trào Đoàn tích lũy 3 năm.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-56 overflow-y-auto pr-1">
                  {[...grade10Classes, ...grade11Classes].map((c) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white bg-slate-900 px-2 py-1 rounded border border-slate-800">
                          {c.name}
                        </span>
                        <span className="text-[10px] text-slate-400">({students.filter(s => s.classId === c.id && s.status === 'active').length} HS)</span>
                      </div>

                      <ArrowRight className="w-4 h-4 text-slate-600 shrink-0" />

                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-400">Lên lớp:</span>
                        <select
                          value={promotionMapping[c.id] || ''}
                          onChange={(e) => setPromotionMapping(prev => ({ ...prev, [c.id]: e.target.value }))}
                          className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-emerald-400 font-bold text-xs focus:outline-none"
                        >
                          {classes.map(target => (
                            <option key={target.id} value={target.id}>{target.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: Grade 10 Freshmen Import */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">Nhập Danh Sách Tân Binh Khối 10 Năm Học Mới</h4>
                    <p className="text-slate-400 text-xs">Tải mẫu Excel và nạp học sinh trúng tuyển lớp 10 vào Database</p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleDownloadGrade10Template}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-700 flex items-center gap-1.5 transition-all"
                    >
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>Tải Mẫu Excel</span>
                    </button>

                    <label className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-glow transition-all active:scale-95">
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Nạp File Excel</span>
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleImportGrade10Excel}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= STEP 4: REASSIGNMENT & ACTIVATION ================= */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              {/* Summary Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Năm học mới</span>
                  <span className="text-sm font-black text-amber-400 block truncate">{newYearName}</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">K12 Tốt Nghiệp</span>
                  <span className="text-sm font-black text-red-400 block">{grade12StudentsCount} Học sinh</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">K10 & K11 Nâng Lớp</span>
                  <span className="text-sm font-black text-emerald-400 block">{promotedStudentsCount} Học sinh</span>
                </div>
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Tuần thi đua</span>
                  <span className="text-sm font-black text-blue-400 block">35 Tuần (Khởi tạo mới)</span>
                </div>
              </div>

              {/* Homeroom Teachers Assignment */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-white text-sm">Phân Công Giáo Viên Chủ Nhiệm Cho 18 Lớp Mới:</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                  {classes.map((c) => (
                    <div key={c.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
                      <span className="font-extrabold text-white text-xs block">{c.name}</span>
                      <select
                        value={gvcnAssignments[c.id]?.gvcnId || ''}
                        onChange={(e) => {
                          const teacher = teacherUsers.find(t => t.id === e.target.value);
                          setGvcnAssignments(prev => ({
                            ...prev,
                            [c.id]: {
                              gvcnName: teacher ? teacher.name : c.gvcnName,
                              gvcnId: e.target.value
                            }
                          }));
                        }}
                        className="w-full px-2 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300 text-xs focus:outline-none"
                      >
                        {teacherUsers.map(t => (
                          <option key={t.id} value={t.id}>{t.name} ({t.role === 'admin' ? 'BGH/Admin' : 'GVCN'})</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Confirmation PIN */}
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-800/50 space-y-3">
                <div className="flex items-center gap-2 text-red-400">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <h4 className="font-black text-white text-sm uppercase">XÁC NHẬN KÍCH HOẠT NĂM HỌC MỚI</h4>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Hành động này sẽ chính thức đóng băng năm học cũ, reset Bảng xếp hạng thi đua nề nếp về Tuần 1, và kích hoạt hệ thống cho <strong className="text-white">{newYearName}</strong>.
                </p>

                <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-1">
                  <input
                    type="text"
                    value={confirmPin}
                    onChange={(e) => setConfirmPin(e.target.value.toUpperCase())}
                    placeholder="Nhập chữ KICHHOAT"
                    className="px-4 py-2.5 rounded-xl bg-slate-950 border border-red-700 text-white font-mono font-bold tracking-widest text-center uppercase focus:outline-none focus:border-red-400"
                  />
                  <span className="text-[11px] text-slate-400">Nhập đúng chữ <code className="text-red-400 font-bold">KICHHOAT</code> để mở khóa nút kích hoạt</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.max(1, prev - 1) as any)}
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center gap-1.5 border border-slate-700 transition-all"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Quay Lại</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white font-bold text-xs transition-colors"
            >
              Hủy Bỏ
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={() => setStep((prev) => Math.min(4, prev + 1) as any)}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-glow transition-all active:scale-95"
              >
                <span>Tiếp Tục</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting || confirmPin !== 'KICHHOAT'}
                className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 shadow-glow transition-all active:scale-95 ${
                  confirmPin === 'KICHHOAT' && !isSubmitting
                    ? 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>{isSubmitting ? 'ĐANG CHUYỂN GIAO...' : '🚀 KÍCH HOẠT NĂM HỌC MỚI'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
