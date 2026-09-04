import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  Shield, 
  PlusCircle, 
  QrCode, 
  UserCheck, 
  Camera, 
  Upload, 
  Search, 
  Wifi, 
  WifiOff, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Calendar, 
  FileText, 
  Sparkles, 
  X,
  Volume2,
  Check,
  KeyRound,
  RotateCcw,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { DayOfWeek, Criterion, ClassInfo } from '../../types';
import { PhotoViewerModal } from '../common/PhotoViewerModal';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { SupabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AuditorApp: React.FC = () => {
  const { 
    currentUser, 
    activeWeek, 
    classes, 
    students,
    criteria, 
    violations, 
    addViolation, 
    deleteViolation,
    events, 
    checkInEvent,
    isWeekLocked
  } = useApp();

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'home' | 'record' | 'qr' | 'profile'>('record');
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState<boolean>(false);
  const [submitFeedback, setSubmitFeedback] = useState<{
    type: 'success' | 'error';
    title: string;
    message: string;
    details?: {
      className: string;
      criterionName: string;
      pointsDeducted: number;
      students?: string[];
      session: string;
      day: string;
    };
  } | null>(null);
  
  // Offline simulation
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [offlineDrafts, setOfflineDrafts] = useState<any[]>([]);

  // Form states for Recording Violation
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('T2');
  const [selectedSession, setSelectedSession] = useState<'Sáng' | 'Chiều'>('Sáng');
  const [selectedClassId, setSelectedClassId] = useState<string>('10/1');
  const [selectedAuditorGroup, setSelectedAuditorGroup] = useState<string>('ALL');
  const [criterionSearch, setCriterionSearch] = useState<string>('');
  const [selectedCriterion, setSelectedCriterion] = useState<Criterion | null>(() => criteria.find(c => c.id === '1.1') || criteria[0]);
  const [quantity, setQuantity] = useState<number>(1);
  const [isCollective, setIsCollective] = useState<boolean>(false);
  const [selectedStudentNames, setSelectedStudentNames] = useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState<string>('');
  const [customStudentInput, setCustomStudentInput] = useState<string>('');
  const [note, setNote] = useState<string>('');
  const [proofImages, setProofImages] = useState<string[]>([
    'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80'
  ]);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string>('');

  // QR Check-in states
  const [selectedEventId, setSelectedEventId] = useState<string>(() => events[0]?.id || '');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; name?: string; class?: string } | null>(null);
  const [manualQrInput, setManualQrInput] = useState<string>('doanvien_minh');

  // Photo viewer state
  const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter criteria by group, search and status
  const enabledCriteria = criteria.filter(c => c.isEnabled && c.type === 'deduction');
  const groupFilteredCriteria = enabledCriteria.filter(c => {
    const matchGroup = selectedAuditorGroup === 'ALL' || c.groupId === selectedAuditorGroup || c.groupName.toLowerCase().includes(selectedAuditorGroup.toLowerCase());
    const matchSearch = c.name.toLowerCase().includes(criterionSearch.toLowerCase()) || 
      c.code.includes(criterionSearch) || 
      c.groupName.toLowerCase().includes(criterionSearch.toLowerCase());
    return matchGroup && matchSearch;
  });

  // Suggested quick tags
  const quickTags = [
    { code: '1.1', label: 'Đi muộn 5p' },
    { code: '4.1', label: 'Sai đồng phục' },
    { code: '2.1', label: 'Không trực nhật' },
    { code: '3.7', label: 'Dùng ĐT' },
    { code: '1.3', label: 'Vắng không phép' },
    { code: '4.2', label: 'Đầu tóc' },
  ];

  // Auditor's violations reported today
  const myViolations = violations.filter(v => v.reportedBy.id === currentUser?.id || v.reportedBy.id === 'codo_nam');

  // Prioritize classes in assigned zone (e.g. Khối 10)
  const assignedZone = currentUser?.assignedZone || 'Khối 10';
  const prioritizedClasses = [...classes].sort((a, b) => {
    if (assignedZone.includes(String(a.grade)) && !assignedZone.includes(String(b.grade))) return -1;
    if (!assignedZone.includes(String(a.grade)) && assignedZone.includes(String(b.grade))) return 1;
    return a.id.localeCompare(b.id);
  });

  // Students of the selected class
  const classStudents = students.filter(s => s.classId === selectedClassId);

  // Handle toggling student selection
  const handleToggleStudent = (studentName: string) => {
    if (selectedStudentNames.includes(studentName)) {
      const updated = selectedStudentNames.filter(n => n !== studentName);
      setSelectedStudentNames(updated);
      setQuantity(Math.max(1, updated.length));
    } else {
      const updated = [...selectedStudentNames, studentName];
      setSelectedStudentNames(updated);
      setQuantity(updated.length);
    }
  };

  // Add custom unlisted student name
  const handleAddCustomStudent = () => {
    const trimmed = customStudentInput.trim();
    if (trimmed && !selectedStudentNames.includes(trimmed)) {
      const updated = [...selectedStudentNames, trimmed];
      setSelectedStudentNames(updated);
      setQuantity(updated.length);
      setCustomStudentInput('');
    }
  };

  // Remove student from chip list
  const handleRemoveStudent = (nameToRemove: string) => {
    const updated = selectedStudentNames.filter(n => n !== nameToRemove);
    setSelectedStudentNames(updated);
    setQuantity(Math.max(1, updated.length));
  };

  // Handle image upload with auto compression (< 500KB) & Cloud Storage
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      setIsUploadingPhoto(true);
      try {
        if (isSupabaseConfigured() && isOnline) {
          const publicUrl = await SupabaseService.uploadImage(file, 'proof_images');
          if (publicUrl) {
            if (proofImages.length < 5) {
              setProofImages(prev => [...prev, publicUrl]);
            }
            return;
          }
        }
        const reader = new FileReader();
        reader.onload = (event) => {
          const img = new Image();
          img.onload = () => {
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const maxDim = 1200;
            if (width > maxDim || height > maxDim) {
              if (width > height) {
                height = Math.round((height * maxDim) / width);
                width = maxDim;
              } else {
                width = Math.round((width * maxDim) / height);
                height = maxDim;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.7);
            if (proofImages.length < 5) {
              setProofImages(prev => [...prev, compressedDataUrl]);
            }
          };
          img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
      } catch (err) {
        console.error(err);
      } finally {
        setIsUploadingPhoto(false);
        e.target.value = '';
      }
    }
  };

  // Submit Violation Record
  const handleSubmitViolation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCriterion) {
      setSubmitFeedback({
        type: 'error',
        title: 'Chưa Chọn Tiêu Chí Vi Phạm',
        message: 'Vui lòng chọn một mục tiêu chí vi phạm cụ thể từ danh sách bên trên trước khi bấm gửi báo cáo!'
      });
      return;
    }

    if (isWeekLocked) {
      setSubmitFeedback({
        type: 'error',
        title: 'Tuần Đã Bị Khóa Sổ',
        message: `Tuần ${activeWeek} đã được Ban Quản Trị chốt khóa sổ thi đua. Không thể nhập thêm bản ghi vi phạm mới.`
      });
      return;
    }

    if (!isCollective && selectedStudentNames.length === 0 && !customStudentInput.trim()) {
      setSubmitFeedback({
        type: 'error',
        title: 'Chưa Chọn Học Sinh Vi Phạm',
        message: 'Vui lòng chọn học sinh vi phạm từ danh sách hoặc tích chọn "Lỗi tập thể lớp" nếu là lỗi chung của cả lớp!'
      });
      return;
    }

    const selectedClass = classes.find(c => c.id === selectedClassId);
    const targetClassName = selectedClass?.name || `Lớp ${selectedClassId}`;
    let studentList: string[] | undefined = undefined;
    if (isCollective) {
      studentList = ['Lỗi tập thể lớp'];
    } else if (selectedStudentNames.length > 0) {
      studentList = selectedStudentNames;
    } else if (customStudentInput.trim()) {
      studentList = [customStudentInput.trim()];
    }

    const vioData = {
      classId: selectedClassId,
      className: targetClassName,
      day: selectedDay,
      session: selectedSession,
      date: new Date().toISOString().split('T')[0],
      weekNumber: activeWeek,
      criterionId: selectedCriterion.id,
      criterionName: selectedCriterion.name,
      groupName: selectedCriterion.groupName,
      quantity: Number(quantity),
      pointsDeducted: Number(quantity) * selectedCriterion.points,
      studentNames: studentList,
      note: note || undefined,
      proofImages,
      reportedBy: {
        id: currentUser?.id || 'codo_nam',
        name: currentUser?.name || 'Nguyễn Văn Nam',
        role: currentUser?.roleTitle || 'Đội Cờ Đỏ'
      }
    };

    if (!isOnline) {
      // Save to offline draft
      setOfflineDrafts(prev => [...prev, vioData]);
      setSubmitFeedback({
        type: 'success',
        title: 'Đã Lưu Bản Nháp Offline',
        message: 'Thiết bị đang mất mạng. Bản ghi đã được lưu an toàn trong máy và sẽ tự động gửi lên máy chủ khi có kết nối trở lại!',
        details: {
          className: targetClassName,
          criterionName: selectedCriterion.name,
          pointsDeducted: vioData.pointsDeducted,
          students: studentList,
          session: selectedSession,
          day: selectedDay
        }
      });
    } else {
      addViolation(vioData);
      setSubmitFeedback({
        type: 'success',
        title: 'Đã Gửi Báo Cáo Vi Phạm Thành Công!',
        message: `Bản ghi chấm vi phạm của ${targetClassName} đã được gửi lên hệ thống và chuyển đến Ban Quản Trị cùng GVCN theo dõi.`,
        details: {
          className: targetClassName,
          criterionName: selectedCriterion.name,
          pointsDeducted: vioData.pointsDeducted,
          students: studentList,
          session: selectedSession,
          day: selectedDay
        }
      });
      setSubmitSuccessMsg(`✅ Đã gửi báo cáo vi phạm (${selectedSession}) cho ${targetClassName} (-${vioData.pointsDeducted}đ) thành công!`);
      setTimeout(() => setSubmitSuccessMsg(''), 4000);
    }

    // Reset form fields
    setNote('');
    setSelectedStudentNames([]);
    setStudentSearchTerm('');
    setCustomStudentInput('');
    setQuantity(1);
    setIsCollective(false);
  };

  // Trigger sound effect for QR scan
  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880; // A5 tone
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      // Audio context may be blocked by browser policy
    }
  };

  // Perform QR Check-in
  const handleTriggerQrScan = (tokenToScan: string) => {
    if (!selectedEventId) {
      alert('Vui lòng chọn sự kiện cần điểm danh!');
      return;
    }
    playBeep();
    const res = checkInEvent(selectedEventId, tokenToScan);
    setScanResult({
      success: res.success,
      message: res.message,
      name: res.studentName,
      class: res.className
    });

    setTimeout(() => {
      setScanResult(null);
    }, 3500);
  };

  // Sync offline drafts
  const handleSyncOfflineDrafts = () => {
    if (offlineDrafts.length === 0) return;
    offlineDrafts.forEach(draft => {
      addViolation(draft);
    });
    setOfflineDrafts([]);
    alert(`Đã đồng bộ thành công ${offlineDrafts.length} bản ghi vi phạm lên máy chủ!`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-24 space-y-4 animate-fadeIn">
      
      {/* Top Mobile Status Header */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex items-center justify-between shadow-card">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-red-600 text-white flex items-center justify-center font-black shadow-glow-gold">
            🚩
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-black text-white">{currentUser?.name || 'Nguyễn Văn Nam'}</h2>
              <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-bold">
                CỜ ĐỎ
              </span>
            </div>
            <p className="text-xs text-amber-400 font-medium">Ca trực: <strong>{assignedZone}</strong> (Tuần {activeWeek})</p>
          </div>
        </div>

        {/* Online / Offline Toggle */}
        <button
          onClick={() => setIsOnline(!isOnline)}
          className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors ${
            isOnline 
              ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-400' 
              : 'bg-rose-950/60 border-rose-700/60 text-rose-400'
          }`}
          title="Bấm để mô phỏng mất mạng / có mạng"
        >
          {isOnline ? (
            <>
              <Wifi className="w-3.5 h-3.5" />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3.5 h-3.5" />
              <span>Offline ({offlineDrafts.length})</span>
            </>
          )}
        </button>
      </div>

      {/* ================= TAB 1: GHI NHẬN VI PHẠM (CHẤM LỖI 1-CHẠM) ================= */}
      {activeTab === 'record' && (
        <div className="space-y-4">
          
          {submitSuccessMsg && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/90 border-2 border-emerald-600 text-emerald-200 text-xs font-bold flex items-center gap-2 animate-bounce">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>{submitSuccessMsg}</span>
            </div>
          )}

          <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-red-600/20 text-red-400 border border-red-600/30">
                  ✏️
                </span>
                <div>
                  <h3 className="text-sm font-black text-white">BIỂU MẪU CHẤM ĐIỂM NỀ NẾP</h3>
                  <p className="text-[11px] text-slate-400">Tối ưu thao tác 1-chạm khi đi hành lang</p>
                </div>
              </div>
              <span className="text-xs text-amber-400 font-bold">Tuần {activeWeek}</span>
            </div>

            <form onSubmit={handleSubmitViolation} className="space-y-4">
              
              {/* Bước 1: Chọn Ngày, Buổi Sáng/Chiều & Lớp học */}
              <div className="space-y-2.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Ngày chấm & Buổi chấm (Sáng/Chiều) */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">📅 Ngày & Buổi chấm</label>
                    <div className="flex items-center gap-2">
                      <select
                        value={selectedDay}
                        onChange={(e) => setSelectedDay(e.target.value as DayOfWeek)}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold text-xs focus:outline-none focus:border-red-500"
                      >
                        {(['T2', 'T3', 'T4', 'T5', 'T6', 'T7'] as DayOfWeek[]).map(d => (
                          <option key={d} value={d} className="bg-slate-900 text-white">Thứ {d.replace('T', '')} ({d})</option>
                        ))}
                      </select>

                      {/* Buổi Sáng / Chiều Selector Buttons */}
                      <div className="flex items-center bg-slate-950 p-0.5 rounded-xl border border-slate-700 shrink-0">
                        <button
                          type="button"
                          onClick={() => setSelectedSession('Sáng')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                            selectedSession === 'Sáng'
                              ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-glow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>☀️ Sáng</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedSession('Chiều')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all flex items-center gap-1 ${
                            selectedSession === 'Chiều'
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-glow'
                              : 'text-slate-400 hover:text-white'
                          }`}
                        >
                          <span>⛅ Chiều</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Chọn Lớp học */}
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-slate-300">🏫 Chọn Lớp học</label>
                    <select
                      value={selectedClassId}
                      onChange={(e) => {
                        setSelectedClassId(e.target.value);
                        setSelectedStudentNames([]);
                      }}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-400 font-bold text-xs focus:outline-none focus:border-red-500"
                    >
                      {prioritizedClasses.map(c => (
                        <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                          {c.name} {assignedZone.includes(String(c.grade)) ? '⭐ (Ca trực)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bước 2: Chọn Nhóm & Tiêu chí lỗi (GIAO DIỆN TỐI ƯU 1-CHẠM) */}
              <div className="space-y-3 pt-1">
                {/* Header with active criterion preview */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 pb-1">
                  <label className="block text-xs font-black text-white flex items-center gap-1.5">
                    <span className="text-red-400">🔍</span>
                    <span>Chọn Tiêu chí lỗi vi phạm</span>
                  </label>

                  {selectedCriterion && (
                    <div className="flex items-center gap-2 bg-red-950/60 border border-red-500/50 px-2.5 py-1 rounded-xl">
                      <span className="text-[10px] font-mono font-black text-amber-300 bg-black/40 px-1.5 py-0.5 rounded">
                        {selectedCriterion.code}
                      </span>
                      <span className="text-xs font-bold text-white truncate max-w-[180px]">
                        {selectedCriterion.name}
                      </span>
                      <span className="text-xs font-black text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-800">
                        -{selectedCriterion.points}đ
                      </span>
                    </div>
                  )}
                </div>

                {/* Category Filter Pills with counts */}
                <div className="flex flex-wrap gap-1.5 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                  {[
                    { id: 'ALL', label: 'Tất cả các nhóm', count: enabledCriteria.length, color: '#64748b', activeClass: 'bg-slate-700 text-white shadow-glow' },
                    { id: 'I.1', label: 'I.1 Chuyên cần', count: enabledCriteria.filter(c => c.groupId === 'I.1').length, color: '#f97316', activeClass: 'bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-glow' },
                    { id: 'I.2', label: 'I.2 Vệ sinh', count: enabledCriteria.filter(c => c.groupId === 'I.2').length, color: '#22c55e', activeClass: 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-glow' },
                    { id: 'I.3', label: 'I.3 Nề nếp', count: enabledCriteria.filter(c => c.groupId === 'I.3').length, color: '#3b82f6', activeClass: 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white shadow-glow' },
                    { id: 'I.4', label: 'I.4 Tác phong', count: enabledCriteria.filter(c => c.groupId === 'I.4').length, color: '#a855f7', activeClass: 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-glow' },
                    { id: 'bonus', label: 'Khen thưởng 🏆', count: criteria.filter(c => c.type === 'bonus').length, color: '#eab308', activeClass: 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black shadow-glow' },
                  ].map(g => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSelectedAuditorGroup(g.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 ${
                        selectedAuditorGroup === g.id
                          ? `${g.activeClass} border-white/30`
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: g.color }}></span>
                      <span>{g.label}</span>
                      <span className="text-[10px] opacity-75 font-mono">({g.count})</span>
                    </button>
                  ))}
                </div>

                {/* Quick 1-Tap Shortcut Tags */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Gợi ý nhanh:</span>
                  </span>
                  {quickTags.map(tag => {
                    const matchCrit = criteria.find(c => c.code === tag.code);
                    if (!matchCrit) return null;
                    const isCurrent = selectedCriterion?.code === tag.code;
                    return (
                      <button
                        key={tag.code}
                        type="button"
                        onClick={() => setSelectedCriterion(matchCrit)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition-all ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-glow'
                            : 'bg-slate-900/90 text-slate-300 border-slate-700/80 hover:border-amber-400 hover:text-white'
                        }`}
                      >
                        ⚡ {tag.label} <strong className="text-[10px]">(-{matchCrit.points}đ)</strong>
                      </button>
                    );
                  })}
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={criterionSearch}
                    onChange={(e) => setCriterionSearch(e.target.value)}
                    placeholder="Tìm theo tên lỗi, mã tiêu chí (vd: 1.1, đồng phục, đi muộn, rác...)"
                    className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  {criterionSearch && (
                    <button
                      type="button"
                      onClick={() => setCriterionSearch('')}
                      className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white p-0.5 rounded-full"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Optimized 2-Column Touch Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-950/80 rounded-2xl border border-slate-800 scrollbar-thin">
                  {groupFilteredCriteria.map(crit => {
                    const isSelected = selectedCriterion?.id === crit.id;
                    return (
                      <button
                        key={crit.id}
                        type="button"
                        onClick={() => setSelectedCriterion(crit)}
                        className={`p-3 rounded-xl text-left transition-all border flex flex-col justify-between relative group ${
                          isSelected 
                            ? 'bg-gradient-to-br from-red-950 via-slate-900 to-red-950 border-red-500 text-white shadow-glow ring-2 ring-red-500/40' 
                            : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-900'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[10px] font-black text-amber-400 bg-slate-950 px-2 py-0.5 rounded-md border border-slate-800">
                              {crit.code}
                            </span>
                            {crit.isSevere && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[9px] font-bold">
                                🚨 Nặng
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-black px-2 py-0.5 rounded-md ${
                              crit.type === 'bonus' 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                                : 'bg-rose-950 text-rose-400 border border-rose-800'
                            }`}>
                              {crit.type === 'bonus' ? `+${crit.points}đ` : `-${crit.points}đ`}
                            </span>
                            {isSelected && (
                              <span className="w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-xs shadow-glow">
                                ✓
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-xs font-bold line-clamp-2 leading-snug text-white group-hover:text-amber-300 transition-colors">
                          {crit.name}
                        </p>
                        <span className="text-[10px] text-slate-400 block mt-1">{crit.groupName} • {crit.unit}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Bước 3: Lấy dữ liệu từ danh sách học sinh & Số lượng vi phạm */}
              <div className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-3.5">
                {/* Header: Live Point Deduction & Quantity Stepper */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-bold text-slate-300 block">
                      Số lượng vi phạm: <strong className="text-amber-400 text-sm font-black">{quantity}</strong> ({selectedCriterion ? selectedCriterion.unit : 'lần'})
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Tổng trừ điểm: <strong className="text-rose-400 font-extrabold text-sm">-{selectedCriterion ? selectedCriterion.points * quantity : 0}đ</strong>
                    </span>
                  </div>

                  {/* Stepper Buttons */}
                  <div className="flex items-center space-x-2 bg-slate-900 border border-slate-700 rounded-xl p-1 shrink-0 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-black text-white text-sm font-mono">{quantity}</span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-base flex items-center justify-center active:scale-95 transition-all"
                    >
                      +
                    </button>
                  </div>
                </div>

                {/* Collective Violation Checkbox */}
                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center space-x-2.5 cursor-pointer text-slate-300 select-none">
                    <input
                      type="checkbox"
                      checked={isCollective}
                      onChange={(e) => {
                        setIsCollective(e.target.checked);
                        if (e.target.checked) {
                          setSelectedStudentNames([]);
                        }
                      }}
                      className="w-4 h-4 rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-0 cursor-pointer"
                    />
                    <span className="font-medium">Lỗi tập thể lớp (Không quy gán đích danh cá nhân)</span>
                  </label>
                </div>

                {/* Individual Student Selector from Class Roster */}
                {!isCollective && (
                  <div className="space-y-3 pt-1">
                    {/* Selected Student Chips Display */}
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <span>👨‍🎓 Học sinh vi phạm thuộc {classes.find(c => c.id === selectedClassId)?.name || `Lớp ${selectedClassId}`}:</span>
                          <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-300 border border-red-800 text-[10px] font-black">
                            Đã chọn: {selectedStudentNames.length}
                          </span>
                        </label>
                        
                        {selectedStudentNames.length > 0 && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedStudentNames([]);
                              setQuantity(1);
                            }}
                            className="text-[10px] text-rose-400 hover:underline font-bold"
                          >
                            Xóa tất cả
                          </button>
                        )}
                      </div>

                      {/* Selected Chips */}
                      {selectedStudentNames.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5 p-2 bg-slate-900 rounded-xl border border-slate-800 min-h-[38px] items-center">
                          {selectedStudentNames.map(name => (
                            <span
                              key={name}
                              className="px-2.5 py-1 rounded-lg bg-red-950/80 border border-red-700/60 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                            >
                              <span>👤 {name}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveStudent(name)}
                                className="w-4 h-4 rounded-full bg-red-800/80 hover:bg-red-700 text-white flex items-center justify-center text-[10px]"
                              >
                                ✕
                              </button>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-500 italic p-2 bg-slate-900/60 rounded-xl border border-dashed border-slate-800">
                          Chưa chọn học sinh nào từ danh sách bên dưới (Nhấp vào tên để chọn nhanh)
                        </p>
                      )}
                    </div>

                    {/* Class Student Roster Search & Picker Grid */}
                    <div className="space-y-2 p-3 bg-slate-900/60 rounded-xl border border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-500" />
                          <input
                            type="text"
                            value={studentSearchTerm}
                            onChange={(e) => setStudentSearchTerm(e.target.value)}
                            placeholder={`Tìm nhanh trong danh sách ${classes.find(c => c.id === selectedClassId)?.name || ''}...`}
                            className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-red-500"
                          />
                          {studentSearchTerm && (
                            <button
                              type="button"
                              onClick={() => setStudentSearchTerm('')}
                              className="absolute right-2 top-2 text-slate-400 hover:text-white"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* List of class students */}
                      <div className="max-h-40 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                        {classStudents
                          .filter(s => 
                            s.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || 
                            s.studentId.toLowerCase().includes(studentSearchTerm.toLowerCase())
                          )
                          .map(st => {
                            const isSelected = selectedStudentNames.includes(st.name);
                            return (
                              <div
                                key={st.id}
                                onClick={() => handleToggleStudent(st.name)}
                                className={`p-2 rounded-lg cursor-pointer transition-all flex items-center justify-between text-xs border ${
                                  isSelected
                                    ? 'bg-red-950/80 border-red-600 text-white font-bold'
                                    : 'bg-slate-950/70 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => {}} // Handled by parent div
                                    className="rounded bg-slate-800 border-slate-700 text-red-600 focus:ring-0 pointer-events-none"
                                  />
                                  <div>
                                    <span className="font-bold">{st.name}</span>
                                    <span className="text-[10px] text-slate-400 font-mono ml-2">({st.studentId})</span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-1.5 text-[10px]">
                                  <span className="text-slate-400">{st.gender}</span>
                                  {st.isUnionMember && (
                                    <span className="px-1.5 py-0.2 rounded bg-blue-950 text-blue-300 border border-blue-800 text-[9px] font-bold">
                                      Đoàn viên
                                    </span>
                                  )}
                                </div>
                              </div>
                            );
                          })}

                        {classStudents.filter(s => s.name.toLowerCase().includes(studentSearchTerm.toLowerCase())).length === 0 && (
                          <p className="text-xs text-slate-400 text-center py-2">
                            Không tìm thấy học sinh phù hợp trong lớp này
                          </p>
                        )}
                      </div>

                      {/* Custom manual student input if not in roster */}
                      <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
                        <input
                          type="text"
                          value={customStudentInput}
                          onChange={(e) => setCustomStudentInput(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              handleAddCustomStudent();
                            }
                          }}
                          placeholder="Hoặc nhập tên học sinh khác..."
                          className="flex-1 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-red-500"
                        />
                        <button
                          type="button"
                          onClick={handleAddCustomStudent}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors shrink-0"
                        >
                          + Thêm
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bước 4: Tải lên minh chứng hình ảnh (Tối đa 3 ảnh) */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  📸 Minh chứng hình ảnh (Chụp trực tiếp / Tải lên)
                </label>
                <div className="flex flex-wrap gap-2 items-center">
                  {proofImages.map((img, idx) => (
                    <div key={idx} className="relative group w-20 h-20 rounded-xl overflow-hidden border border-slate-700">
                      <img
                        src={img}
                        alt="Proof"
                        onClick={() => setViewingPhoto(img)}
                        className="w-full h-full object-cover cursor-pointer hover:opacity-80"
                      />
                      <button
                        type="button"
                        onClick={() => setProofImages(proofImages.filter((_, i) => i !== idx))}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-red-600 text-white"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {proofImages.length < 3 && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-red-500 bg-slate-950 flex flex-col items-center justify-center text-slate-400 hover:text-white transition-colors"
                    >
                      <Camera className="w-5 h-5 mb-0.5 text-amber-400" />
                      <span className="text-[9px] font-bold">Thêm ảnh</span>
                    </button>
                  )}

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Bước 5: Ghi chú */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">
                  📝 Ghi chú chi tiết (Tùy chọn)
                </label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Ghi chú cụ thể địa điểm, tiết học hoặc hoàn cảnh vi phạm..."
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-white text-xs placeholder-slate-600 focus:outline-none focus:border-red-500"
                />
              </div>

              {/* Locked Week Warning Banner */}
              {isWeekLocked && (
                <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-600/50 flex items-center justify-between gap-3 text-amber-200 text-xs animate-pulse">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
                    <div>
                      <span className="font-black text-amber-300">Tuần {activeWeek} đang bị Khóa Sổ:</span> Dữ liệu tuần này đã đóng băng bởi Ban Quản Trị.
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-amber-900/90 font-mono text-[10px] text-amber-300 font-bold border border-amber-700 shrink-0">
                    🔒 ĐÃ KHÓA
                  </span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className={`w-full py-3 rounded-2xl text-white font-extrabold text-sm shadow-glow transition-all active:scale-98 flex items-center justify-center gap-2 ${
                  isWeekLocked
                    ? 'bg-amber-700/80 hover:bg-amber-600 text-white cursor-pointer'
                    : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isWeekLocked ? `GỬI BÁO CÁO (TUẦN ${activeWeek} ĐANG KHÓA SỔ)` : 'GỬI BÁO CÁO VI PHẠM'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ================= TAB 2: QUÉT QR ĐIỂM DANH SỰ KIỆN ĐOÀN ================= */}
      {activeTab === 'qr' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-xl bg-emerald-600/20 text-emerald-400 border border-emerald-600/30">
                <QrCode className="w-5 h-5" />
              </span>
              <div>
                <h3 className="text-sm font-black text-white">QUÉT QR ĐIỂM DANH ĐOÀN VIÊN</h3>
                <p className="text-[11px] text-slate-400">Check-in tốc độ cao cho sự kiện đông người</p>
              </div>
            </div>
          </div>

          {/* Event Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">🎯 Chọn sự kiện điểm danh</label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-amber-300 font-bold text-xs focus:outline-none focus:border-emerald-500"
            >
              {events.map(evt => (
                <option key={evt.id} value={evt.id} className="bg-slate-900 text-white">
                  {evt.title} (+{evt.bonusPoints}đ)
                </option>
              ))}
            </select>
          </div>

          {/* Camera Viewfinder Scanner Simulation */}
          <div className="relative w-full h-64 bg-slate-950 rounded-3xl overflow-hidden border-2 border-slate-700 flex flex-col items-center justify-center p-4">
            
            {/* Viewfinder Target Box */}
            <div className="relative w-48 h-48 border-2 border-emerald-500 rounded-2xl overflow-hidden shadow-2xl flex items-center justify-center bg-black/40">
              {/* Corner accents */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-emerald-400"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-emerald-400"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-emerald-400"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-emerald-400"></div>

              {/* Moving Laser line */}
              <div className="scanner-laser"></div>

              <QrCode className="w-24 h-24 text-slate-600 animate-pulse" />
            </div>

            {/* Scan Counter */}
            {selectedEventId && (
              <div className="absolute bottom-3 bg-slate-900/90 border border-slate-700 px-3 py-1 rounded-full text-[11px] text-slate-300 font-medium">
                Đã điểm danh: <strong className="text-emerald-400">{events.find(e => e.id === selectedEventId)?.checkedInStudentIds.length}</strong> / {events.find(e => e.id === selectedEventId)?.registeredCount} đoàn viên
              </div>
            )}

            {/* Live Scan Notification Flyout */}
            {scanResult && (
              <div className={`absolute top-3 left-3 right-3 p-3 rounded-2xl border text-xs font-bold flex items-center justify-between animate-fadeIn z-20 ${
                scanResult.success 
                  ? 'bg-emerald-950/95 border-emerald-500 text-emerald-200' 
                  : 'bg-rose-950/95 border-rose-500 text-rose-200'
              }`}>
                <div>
                  <p className="font-extrabold">{scanResult.name} - {scanResult.class}</p>
                  <p className="text-[10px] text-slate-300 font-normal">{scanResult.message}</p>
                </div>
                <span className="p-1 rounded-full bg-emerald-500 text-black">
                  <Check className="w-4 h-4" />
                </span>
              </div>
            )}
          </div>

          {/* 1-Click Fast Scan Simulator Buttons */}
          <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-2">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              ⚡ Mô phỏng quét mã thẻ học sinh:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleTriggerQrScan('doanvien_minh')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-600 text-left text-xs transition-all"
              >
                <p className="font-bold text-white">Nguyễn Quang Minh</p>
                <p className="text-[10px] text-emerald-400">Lớp 10/1 • Quét ngay</p>
              </button>

              <button
                type="button"
                onClick={() => handleTriggerQrScan('doanvien_hoa')}
                className="p-2 rounded-xl bg-slate-900 hover:bg-emerald-950/60 border border-slate-700 hover:border-emerald-600 text-left text-xs transition-all"
              >
                <p className="font-bold text-white">Phan Như Hoa</p>
                <p className="text-[10px] text-emerald-400">Lớp 12/4 • Quét ngay</p>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: TRANG CHỦ & LỊCH SỬ NHẬP ================= */}
      {activeTab === 'home' && (
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-black text-white">VI PHẠM BẠN ĐÃ NHẬP TUẦN NÀY</h3>
              <span className="text-xs font-bold text-slate-400">{myViolations.length} bản ghi</span>
            </div>

            {myViolations.length === 0 ? (
              <div className="p-8 text-center text-slate-500 text-xs">
                Chưa có bản ghi vi phạm nào do bạn nhập trong ngày.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {myViolations.map(vio => (
                  <div
                    key={vio.id}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-start justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                          {vio.className}
                        </span>
                        <span className="text-slate-400 text-[10px]">{vio.day} • {vio.reportedAt}</span>
                      </div>
                      <p className="font-bold text-slate-200">{vio.criterionName} (x{vio.quantity})</p>
                      {vio.studentNames && (
                        <p className="text-[11px] text-slate-400">HS: {vio.studentNames.join(', ')}</p>
                      )}
                    </div>

                    <div className="text-right shrink-0 space-y-1.5 flex flex-col items-end">
                      <span className="font-black text-rose-400 text-sm">-{vio.pointsDeducted}đ</span>
                      <div>
                        {vio.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-950 text-amber-300 border border-amber-800">
                            Chờ duyệt
                          </span>
                        )}
                        {vio.status === 'accepted' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                            Đã duyệt
                          </span>
                        )}
                        {vio.status === 'appealed' && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-950 text-rose-300 border border-rose-800">
                            Khiếu nại
                          </span>
                        )}
                      </div>

                      {/* Báo chấm nhầm / Hủy lỗi button */}
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm(`Bạn có chắc chắn muốn BÁO CHẤM NHẦM / HỦY bản ghi vi phạm "${vio.criterionName}" của ${vio.className} (-${vio.pointsDeducted}đ)?\nĐiểm trừ của lớp sẽ được hoàn lại tự động.`)) {
                            deleteViolation(vio.id);
                            setSubmitSuccessMsg(`✓ Đã hủy bản ghi chấm nhầm cho ${vio.className}!`);
                            setTimeout(() => setSubmitSuccessMsg(''), 3500);
                          }
                        }}
                        className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-700 hover:border-rose-700 text-[10px] font-bold flex items-center gap-1 transition-all active:scale-95 shadow-sm"
                        title="Hủy bản ghi nếu bạn chấm nhầm lỗi hoặc ghi sai lớp"
                      >
                        <RotateCcw className="w-3 h-3 text-rose-400" />
                        <span>Báo Chấm Nhầm</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= TAB 4: PROFILE & OFFLINE DRAFTS ================= */}
      {activeTab === 'profile' && (
        <div className="glass-panel rounded-3xl p-5 border border-slate-800 shadow-card space-y-4">
          <h3 className="text-sm font-black text-white pb-3 border-b border-slate-800">HỒ SƠ CỜ ĐỎ</h3>
          
          <div className="flex items-center space-x-3 p-3 bg-slate-950/60 rounded-2xl border border-slate-800">
            <img
              src={currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
              alt={currentUser?.name}
              className="w-12 h-12 rounded-2xl object-cover border border-amber-500"
            />
            <div className="flex-1">
              <p className="font-bold text-white text-sm">{currentUser?.name}</p>
              <p className="text-xs text-amber-400">{currentUser?.roleTitle}</p>
              <p className="text-[11px] text-slate-400">Số điện thoại: {currentUser?.phone}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsChangePasswordOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-950 text-amber-300 border border-slate-700 hover:border-amber-600 text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-400" />
              <span>Đổi Mật Khẩu</span>
            </button>
          </div>

          {/* Offline drafts section */}
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300">Bản nháp Offline lưu trong máy:</span>
              <span className="px-2 py-0.5 bg-amber-950 text-amber-300 rounded font-bold text-xs">
                {offlineDrafts.length} bản ghi
              </span>
            </div>
            {offlineDrafts.length > 0 && (
              <button
                type="button"
                onClick={handleSyncOfflineDrafts}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-colors"
              >
                Đồng Bộ Lên Server Ngay
              </button>
            )}
          </div>
        </div>
      )}

      {/* ================= FIXED BOTTOM NAVIGATION BAR ================= */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-950/95 backdrop-blur-md border-t border-slate-800 py-2 px-4 shadow-2xl">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1 text-center">
          <button
            onClick={() => setActiveTab('record')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'record' ? 'text-red-400 font-extrabold bg-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <PlusCircle className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Chấm lỗi</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'qr' ? 'text-emerald-400 font-extrabold bg-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <QrCode className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Quét QR</span>
          </button>

          <button
            onClick={() => setActiveTab('home')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'home' ? 'text-amber-400 font-extrabold bg-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Clock className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Nhật ký</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center justify-center py-1.5 rounded-xl transition-all ${
              activeTab === 'profile' ? 'text-blue-400 font-extrabold bg-slate-900' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck className="w-5 h-5 mb-0.5" />
            <span className="text-[10px]">Cá nhân</span>
          </button>
        </div>
      </div>

      {/* Photo Lightbox */}
      {viewingPhoto && (
        <PhotoViewerModal
          isOpen={true}
          onClose={() => setViewingPhoto(null)}
          imageUrl={viewingPhoto}
          title="Minh chứng vi phạm"
        />
      )}

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      {/* ================= SUBMIT FEEDBACK MODAL ================= */}
      {submitFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp">
            
            {/* Header with Icon */}
            <div className="flex items-center gap-3">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                submitFeedback.type === 'success' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-glow-emerald' 
                  : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
              }`}>
                {submitFeedback.type === 'success' ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-rose-400" />
                )}
              </div>
              <div>
                <h3 className="text-base font-black text-white">{submitFeedback.title}</h3>
                <p className="text-xs text-slate-400">{submitFeedback.type === 'success' ? 'Hệ thống đã nhận bản ghi' : 'Thông báo từ hệ thống'}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-2xl border border-slate-800/80">
              {submitFeedback.message}
            </p>

            {/* Success Details Box */}
            {submitFeedback.details && (
              <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Lớp vi phạm:</span>
                  <span className="font-bold text-white bg-slate-800 px-2 py-0.5 rounded text-[11px]">
                    {submitFeedback.details.className}
                  </span>
                </div>

                <div className="flex justify-between items-start pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Nội dung lỗi:</span>
                  <span className="font-bold text-slate-200 text-right max-w-[200px]">
                    {submitFeedback.details.criterionName}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-2 border-b border-slate-800/80">
                  <span className="text-slate-400">Điểm trừ áp dụng:</span>
                  <span className="font-black text-rose-400 text-sm">
                    -{submitFeedback.details.pointsDeducted} điểm
                  </span>
                </div>

                {submitFeedback.details.students && submitFeedback.details.students.length > 0 && (
                  <div className="flex justify-between items-start pb-2 border-b border-slate-800/80">
                    <span className="text-slate-400">Học sinh vi phạm:</span>
                    <span className="font-semibold text-amber-300 text-right max-w-[200px]">
                      {submitFeedback.details.students.join(', ')}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-500">Thời điểm ghi nhận:</span>
                  <span className="text-slate-400">Thứ {submitFeedback.details.day.replace('T', '')} ({submitFeedback.details.session}) • Tuần {activeWeek}</span>
                </div>
              </div>
            )}

            {/* Modal Actions */}
            <div className="pt-2 flex items-center gap-2.5">
              {submitFeedback.type === 'success' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmitFeedback(null);
                      setActiveTab('record');
                    }}
                    className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-black text-xs shadow-glow transition-all active:scale-95 text-center"
                  >
                    + Nhập Thêm Lỗi Khác
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setSubmitFeedback(null);
                      setActiveTab('home');
                    }}
                    className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors"
                  >
                    Xem Nhật Ký
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={() => setSubmitFeedback(null)}
                  className="w-full py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors"
                >
                  Đóng & Bổ Sung Thông Tin
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
