import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  User, 
  ClassInfo, 
  Criterion, 
  Violation, 
  DutyAssignment, 
  DutyZone,
  AuditorMember,
  YouthEvent, 
  NewsPost, 
  TaskNotice, 
  AuditLog, 
  ClassWeeklyScore,
  DayOfWeek,
  DayScore,
  ViolationStatus,
  Student,
  WeekConfig,
  SchoolSettings,
  ActivitySlide,
  ActivityReport,
  ActivityParticipant,
  AppNotification,
  SemesterClassScore,
  AcademicYear,
  RolloverPayload
} from '../types';
import { 
  INITIAL_CLASSES, 
  INITIAL_CRITERIA, 
  INITIAL_USERS, 
  INITIAL_VIOLATIONS, 
  INITIAL_DUTIES, 
  INITIAL_ZONES,
  INITIAL_AUDITORS,
  INITIAL_EVENTS, 
  INITIAL_NEWS, 
  INITIAL_NOTICES, 
  INITIAL_LOGS,
  INITIAL_STUDENTS,
  INITIAL_WEEKS,
  INITIAL_SCHOOL_SETTINGS,
  INITIAL_ACTIVITY_SLIDES,
  INITIAL_ACTIVITY_REPORTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_ACADEMIC_YEARS
} from '../data/initialData';
import { SupabaseService } from '../services/supabaseService';
import { isSupabaseConfigured } from '../lib/supabase';

interface AppContextType {
  currentUser: User | null;
  activeWeek: number;
  setActiveWeek: (week: number) => void;
  isWeekLocked: boolean;
  classes: ClassInfo[];
  students: Student[];
  criteria: Criterion[];
  violations: Violation[];
  duties: DutyAssignment[];
  zones: DutyZone[];
  auditors: AuditorMember[];
  events: YouthEvent[];
  news: NewsPost[];
  notices: TaskNotice[];
  users: User[];
  auditLogs: AuditLog[];
  weeksConfig: WeekConfig[];
  schoolSettings: SchoolSettings;
  activitySlides: ActivitySlide[];
  activeView: string;
  setActiveView: (view: string) => void;
  
  // Auth
  login: (username: string, password?: string) => boolean;
  loginAsUser: (user: User) => void;
  logout: () => void;

  // School Settings Customizer
  updateSchoolSettings: (settings: Partial<SchoolSettings>) => void;

  // Activity Slides CRUD
  addActivitySlide: (slide: Omit<ActivitySlide, 'id'>) => void;
  updateActivitySlide: (id: string, updates: Partial<ActivitySlide>) => void;
  deleteActivitySlide: (id: string) => void;
  toggleActivitySlideStatus: (id: string) => void;

  // Week / Time Configuration
  addWeek: (week: WeekConfig) => void;
  updateWeek: (weekNum: number, updates: Partial<WeekConfig>) => void;
  deleteWeek: (weekNum: number) => { success: boolean; message: string };
  toggleWeekLockDirect: (weekNum: number) => void;
  setCurrentWeek: (weekNum: number) => void;

  // Master Data - Classes
  addClass: (newClass: Omit<ClassInfo, 'standardScore'>) => void;
  updateClass: (id: string, updates: Partial<ClassInfo>) => void;
  deleteClass: (id: string) => { success: boolean; message: string };
  archiveClass: (id: string, isArchived: boolean) => void;

  // Master Data - Students
  addStudent: (student: Omit<Student, 'id' | 'violationsCount'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  transferStudent: (studentId: string, newClassId: string) => void;
  importStudents: (studentsList: Array<Omit<Student, 'id' | 'violationsCount'>>) => number;
  upsertStudentsFromExcel: (studentsList: Array<Partial<Student> & { studentId: string; name: string; classId: string }>) => { added: number; updated: number };

  // Violations & Scoring
  addViolation: (violation: Omit<Violation, 'id' | 'reportedAt' | 'status' | 'locked'>) => Violation;
  updateViolation: (id: string, updates: Partial<Violation>) => void;
  updateViolationStatus: (id: string, status: ViolationStatus) => void;
  submitAppeal: (violationId: string, reason: string, proofImages: string[]) => boolean;
  resolveAppeal: (violationId: string, decision: 'approved_appeal' | 'rejected_appeal', adminResponse: string) => boolean;
  deleteViolation: (id: string) => void;

  // Criteria
  addCriterion: (criterion: Omit<Criterion, 'id'>) => void;
  updateCriterion: (id: string, updates: Partial<Criterion>) => void;
  deleteCriterion: (id: string) => { success: boolean; message: string };
  toggleCriterion: (id: string) => void;

  // Lock Data
  lockWeek: (pin: string, targetWeekNum?: number) => { success: boolean; message: string };
  unlockWeek: (pin: string, targetWeekNum?: number) => { success: boolean; message: string };

  // Activity Reports from Youth Secretaries (Báo cáo học sinh tham gia phong trào)
  activityReports: ActivityReport[];
  submitActivityReport: (report: Omit<ActivityReport, 'id' | 'reportedAt' | 'status'>) => void;
  deleteActivityReport: (id: string) => void;
  verifyActivityReport: (id: string, feedback?: string) => void;

  // User Management
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, updates: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserActive: (id: string) => void;
  resetPassword: (userId: string) => string;
  changePassword: (userId: string, newPassword: string, oldPassword?: string) => { success: boolean; message: string };

  // Duty Schedule
  addDutyAssignment: (duty: Omit<DutyAssignment, 'id'>) => void;
  updateDutyAssignment: (id: string, updates: Partial<DutyAssignment>) => void;
  deleteDutyAssignment: (id: string) => void;
  generateDefaultDutiesForWeek: (weekNum: number) => void;
  copyDutiesToWeek: (sourceWeek: number, targetWeek: number) => void;
  assignGvcnToClass: (classId: string, gvcnName: string, gvcnId: string) => void;
  removeGvcnFromClass: (classId: string) => void;

  // Zones & Auditors
  addZone: (zone: Omit<DutyZone, 'id'>) => void;
  updateZone: (id: string, updates: Partial<DutyZone>) => void;
  deleteZone: (id: string) => void;

  addAuditorMember: (auditor: Omit<AuditorMember, 'id'>) => void;
  updateAuditorMember: (id: string, updates: Partial<AuditorMember>) => void;
  deleteAuditorMember: (id: string) => void;
  toggleAuditorActive: (id: string) => void;

  // Events & QR Check-in
  registerForEvent: (eventId: string, studentId: string) => { success: boolean; message: string };
  checkInEvent: (eventId: string, studentIdOrQr: string) => { success: boolean; message: string; studentName?: string; className?: string };
  addEvent: (event: Omit<YouthEvent, 'id' | 'registeredCount' | 'registeredStudentIds' | 'checkedInStudentIds'>) => void;
  updateEvent: (id: string, updates: Partial<YouthEvent>) => void;
  deleteEvent: (id: string) => void;

  // News & Announcements CRUD
  addNewsPost: (post: Omit<NewsPost, 'id' | 'views'>) => void;
  updateNewsPost: (id: string, updates: Partial<NewsPost>) => void;
  deleteNewsPost: (id: string) => void;
  toggleNewsVisibility: (id: string) => void;

  // Task Notices & Mobilization CRUD
  addTaskNotice: (notice: Omit<TaskNotice, 'id' | 'createdAt' | 'status'>) => void;
  addNotice: (notice: Omit<TaskNotice, 'id' | 'createdAt'>) => void;
  updateNotice: (id: string, updates: Partial<TaskNotice>) => void;
  deleteNotice: (id: string) => void;

  // Union Fee & Month Locks
  feeLocks: Record<string, boolean>;
  toggleFeeLock: (classId: string, month: string) => void;
  isFeeMonthLocked: (classId: string, month: string) => boolean;
  batchUpdateUnionFee: (studentIds: string[], month: string, status: 'paid' | 'unpaid') => void;
  payYearlyFee: (studentId: string, status: 'paid' | 'unpaid') => void;

  // Score calculations
  getWeeklyScores: (weekNum?: number) => ClassWeeklyScore[];
  getClassScore: (classId: string, weekNum?: number) => ClassWeeklyScore | undefined;
  getSemesterScores: (semester: 'HK1' | 'HK2' | 'YEAR', customWeeks?: number[]) => SemesterClassScore[];

  // Notifications & Real-time Web Push
  notifications: AppNotification[];
  sendNotification: (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  clearAllNotifications: () => void;
  requestPushPermission: () => Promise<boolean>;

  // Backup & Storage Management
  createFullBackupSnapshot: () => any;
  restoreFullBackup: (backupData: any) => { success: boolean; message: string };
  cleanOldStorageData: (daysToKeep?: number) => { freedCount: number; message: string };

  // Academic Year Management & Rollover
  academicYears: AcademicYear[];
  selectedAcademicYearId: string;
  currentAcademicYear: AcademicYear;
  isHistoricalYear: boolean;
  setSelectedAcademicYearId: (id: string) => void;
  addAcademicYear: (year: Omit<AcademicYear, 'id'>) => AcademicYear;
  executeAcademicYearRollover: (payload: RolloverPayload) => { success: boolean; message: string };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'DOANTHANHNIEN_APP_DATA_V2';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => loadStored('currentUser', null));
  const [activeWeek, setActiveWeekState] = useState<number>(() => loadStored('activeWeek', 24));
  const [isWeekLocked, setIsWeekLocked] = useState<boolean>(() => loadStored('isWeekLocked', false));
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => loadStored('schoolSettings', INITIAL_SCHOOL_SETTINGS));
  const [activitySlides, setActivitySlides] = useState<ActivitySlide[]>(() => loadStored('activitySlides', INITIAL_ACTIVITY_SLIDES));
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => loadStored('academicYears', INITIAL_ACADEMIC_YEARS));
  const currentAcademicYear = academicYears.find(y => y.isCurrent) || academicYears[0] || INITIAL_ACADEMIC_YEARS[0];
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(() => loadStored('selectedAcademicYearId', currentAcademicYear?.id || '2025_2026'));
  const isHistoricalYear = Boolean(currentAcademicYear && selectedAcademicYearId !== currentAcademicYear.id);

  const [weeksConfig, setWeeksConfig] = useState<WeekConfig[]>(() => loadStored('weeksConfig', INITIAL_WEEKS));
  const [classes, setClasses] = useState<ClassInfo[]>(() => loadStored('classes', INITIAL_CLASSES));
  const [students, setStudents] = useState<Student[]>(() => loadStored('students', INITIAL_STUDENTS));
  const [criteria, setCriteria] = useState<Criterion[]>(() => loadStored('criteria', INITIAL_CRITERIA));
  const [violations, setViolations] = useState<Violation[]>(() => loadStored('violations', INITIAL_VIOLATIONS));
  const [duties, setDuties] = useState<DutyAssignment[]>(() => loadStored('duties', INITIAL_DUTIES));
  const [zones, setZones] = useState<DutyZone[]>(() => loadStored('zones', INITIAL_ZONES));
  const [auditors, setAuditors] = useState<AuditorMember[]>(() => loadStored('auditors', INITIAL_AUDITORS));
  const [events, setEvents] = useState<YouthEvent[]>(() => loadStored('events', INITIAL_EVENTS));
  const [news, setNews] = useState<NewsPost[]>(() => loadStored('news', INITIAL_NEWS));
  const [notices, setNotices] = useState<TaskNotice[]>(() => loadStored('notices', INITIAL_NOTICES));
  const [users, setUsers] = useState<User[]>(() => loadStored('users', INITIAL_USERS));
  const [feeLocks, setFeeLocks] = useState<Record<string, boolean>>(() => loadStored('feeLocks', {}));
  const [activityReports, setActivityReports] = useState<ActivityReport[]>(() => loadStored('activityReports', INITIAL_ACTIVITY_REPORTS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStored('auditLogs', INITIAL_LOGS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStored('notifications', INITIAL_NOTIFICATIONS));
  const [activeView, setActiveView] = useState<string>('portal');

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_activeWeek`, JSON.stringify(activeWeek));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_isWeekLocked`, JSON.stringify(isWeekLocked));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_schoolSettings`, JSON.stringify(schoolSettings));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_activitySlides`, JSON.stringify(activitySlides));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_academicYears`, JSON.stringify(academicYears));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_selectedAcademicYearId`, JSON.stringify(selectedAcademicYearId));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_weeksConfig`, JSON.stringify(weeksConfig));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_classes`, JSON.stringify(classes));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_students`, JSON.stringify(students));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_criteria`, JSON.stringify(criteria));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_violations`, JSON.stringify(violations));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_duties`, JSON.stringify(duties));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_zones`, JSON.stringify(zones));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auditors`, JSON.stringify(auditors));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_events`, JSON.stringify(events));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_news`, JSON.stringify(news));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_notices`, JSON.stringify(notices));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_users`, JSON.stringify(users));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_feeLocks`, JSON.stringify(feeLocks));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_activityReports`, JSON.stringify(activityReports));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_notifications`, JSON.stringify(notifications));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [currentUser, activeWeek, isWeekLocked, schoolSettings, activitySlides, academicYears, selectedAcademicYearId, weeksConfig, classes, students, criteria, violations, duties, zones, auditors, events, news, notices, users, feeLocks, activityReports, auditLogs, notifications]);

  // Sync lock status with active week config
  const setActiveWeek = (week: number) => {
    setActiveWeekState(week);
    const targetWeek = weeksConfig.find(w => w.weekNumber === week);
    if (targetWeek) {
      setIsWeekLocked(Boolean(targetWeek.isLocked));
    } else {
      setIsWeekLocked(false);
    }
  };

  useEffect(() => {
    const targetWeek = weeksConfig.find(w => w.weekNumber === activeWeek);
    if (targetWeek !== undefined) {
      setIsWeekLocked(Boolean(targetWeek.isLocked));
    }
  }, [activeWeek, weeksConfig]);

  // Auto-sync with Supabase Cloud on startup
  useEffect(() => {
    if (isSupabaseConfigured()) {
      SupabaseService.loadAllDataFromSupabase().then(cloudData => {
        if (cloudData) {
          if (cloudData.classes && cloudData.classes.length > 0) setClasses(cloudData.classes);
          if (cloudData.criteria && cloudData.criteria.length > 0) setCriteria(cloudData.criteria);
          if (cloudData.students && cloudData.students.length > 0) setStudents(cloudData.students);
          if (cloudData.violations) setViolations(cloudData.violations);
          if (cloudData.news && cloudData.news.length > 0) setNews(cloudData.news);
          if (cloudData.notices && cloudData.notices.length > 0) setNotices(cloudData.notices);
          if (cloudData.schoolSettings) setSchoolSettings(cloudData.schoolSettings);
          if (cloudData.activitySlides && cloudData.activitySlides.length > 0) setActivitySlides(cloudData.activitySlides);
          console.log('✅ Đã đồng bộ dữ liệu mới nhất từ Supabase Cloud!');
        }
      }).catch(err => {
        console.warn('Không thể nạp dữ liệu từ Cloud, tiếp tục với LocalStorage:', err);
      });
    }
  }, []);

  const addLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleString('vi-VN'),
      userId: currentUser?.id || 'anonymous',
      userName: currentUser?.name || 'Khách truy cập',
      userRole: currentUser?.role || 'user',
      action,
      details,
      ipAddress: '192.168.1.50'
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Auth
  const login = (username: string, password?: string): boolean => {
    const cleanUser = username.trim().toLowerCase();
    const user = users.find(u => (u.username.toLowerCase() === cleanUser || u.id.toLowerCase() === cleanUser) && u.isActive);
    if (user) {
      setCurrentUser(user);
      addLog('Đăng nhập', `Tài khoản ${user.username} (${user.name}) đăng nhập vào hệ thống`);
      if (user.role === 'admin') {
        setActiveView('admin');
      } else {
        // Non-admin roles are always locked to current active academic year
        if (currentAcademicYear) {
          setSelectedAcademicYearId(currentAcademicYear.id);
        }
        if (user.role === 'manager') setActiveView('manager');
        else if (user.role === 'auditor') setActiveView('auditor');
        else if (user.role === 'youth_secretary') setActiveView('secretary');
        else setActiveView('student');
      }
      return true;
    }
    return false;
  };

  const loginAsUser = (user: User) => {
    setCurrentUser(user);
    addLog('Chuyển tài khoản thử nghiệm', `Đăng nhập nhanh với tư cách ${user.roleTitle} (${user.name})`);
    if (user.role === 'admin') {
      setActiveView('admin');
    } else {
      // Non-admin roles are always locked to current active academic year
      if (currentAcademicYear) {
        setSelectedAcademicYearId(currentAcademicYear.id);
      }
      if (user.role === 'manager') setActiveView('manager');
      else if (user.role === 'auditor') setActiveView('auditor');
      else if (user.role === 'youth_secretary') setActiveView('secretary');
      else setActiveView('student');
    }
  };

  const logout = () => {
    if (currentUser) {
      addLog('Đăng xuất', `Tài khoản ${currentUser.username} đăng xuất`);
    }
    setCurrentUser(null);
    if (currentAcademicYear) {
      setSelectedAcademicYearId(currentAcademicYear.id);
    }
    setActiveView('portal');
  };

  // School Settings
  const updateSchoolSettings = (updates: Partial<SchoolSettings>) => {
    const updated = { ...schoolSettings, ...updates };
    setSchoolSettings(updated);
    if (isSupabaseConfigured()) {
      SupabaseService.saveSchoolSettings(updated);
    }
    addLog('Cập nhật cài đặt trường', 'Thay đổi thông tin nhận diện, tên trường hoặc màu sắc giao diện');
  };

  // Weeks Configuration
  const addWeek = (week: WeekConfig) => {
    setWeeksConfig(prev => [...prev, week]);
    addLog('Tạo tuần học mới', `Thêm ${week.title} (${week.startDate} đến ${week.endDate})`);
  };

  const updateWeek = (weekNum: number, updates: Partial<WeekConfig>) => {
    setWeeksConfig(prev => prev.map(w => w.weekNumber === weekNum ? { ...w, ...updates } : w));
    if (updates.isLocked !== undefined && weekNum === activeWeek) {
      setIsWeekLocked(updates.isLocked);
    }
    addLog('Cập nhật tuần học', `Cập nhật cấu hình Tuần ${weekNum}`);
  };

  const deleteWeek = (weekNum: number): { success: boolean; message: string } => {
    const targetWeek = weeksConfig.find(w => w.weekNumber === weekNum);
    if (!targetWeek) return { success: false, message: 'Tuần học không tồn tại!' };
    if (targetWeek.isCurrent) return { success: false, message: 'Không thể xóa Tuần đang được chọn làm Tuần hiện tại!' };
    
    setWeeksConfig(prev => prev.filter(w => w.weekNumber !== weekNum));
    addLog('Xóa tuần học', `Xóa cấu hình ${targetWeek.title}`);
    return { success: true, message: `Đã xóa ${targetWeek.title} thành công!` };
  };

  const toggleWeekLockDirect = (weekNum: number) => {
    let nextLockedState = false;
    setWeeksConfig(prev => prev.map(w => {
      if (w.weekNumber === weekNum) {
        nextLockedState = !w.isLocked;
        if (weekNum === activeWeek) setIsWeekLocked(nextLockedState);
        return { ...w, isLocked: nextLockedState };
      }
      return w;
    }));
    setViolations(prev => prev.map(v => v.weekNumber === weekNum ? { ...v, locked: nextLockedState } : v));
    addLog('Đổi trạng thái khóa tuần', `${nextLockedState ? 'Khóa' : 'Mở khóa'} sổ thi đua Tuần ${weekNum}`);
  };

  const setCurrentWeek = (weekNum: number) => {
    setWeeksConfig(prev => prev.map(w => ({
      ...w,
      isCurrent: w.weekNumber === weekNum
    })));
    setActiveWeek(weekNum);
    addLog('Thiết lập tuần hiện tại', `Chọn Tuần ${weekNum} làm gốc hiển thị mặc định`);
  };

  // Master Data - Classes
  const addClass = (newClass: Omit<ClassInfo, 'standardScore'>) => {
    const classObj: ClassInfo = {
      ...newClass,
      standardScore: 1440,
      isArchived: false
    };
    setClasses(prev => [...prev, classObj]);
    if (isSupabaseConfigured()) SupabaseService.saveClass(classObj);
    addLog('Thêm lớp học mới', `Tạo mới ${classObj.name} (Khối ${classObj.grade})`);
  };

  const updateClass = (id: string, updates: Partial<ClassInfo>) => {
    setClasses(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        if (isSupabaseConfigured()) SupabaseService.saveClass(updated);
        return updated;
      }
      return c;
    }));
    addLog('Cập nhật lớp học', `Sửa thông tin Lớp ID: ${id}`);
  };

  const deleteClass = (id: string): { success: boolean; message: string } => {
    const targetClass = classes.find(c => c.id === id);
    if (!targetClass) return { success: false, message: 'Lớp học không tồn tại!' };
    
    // Check if class has violations
    const hasVios = violations.some(v => v.classId === id);
    if (hasVios) {
      archiveClass(id, true);
      return { 
        success: true, 
        message: `Lớp ${targetClass.name} đã có dữ liệu chấm thi đua nên hệ thống đã tự động chuyển sang trạng thái "Lưu trữ" để bảo toàn dữ liệu.` 
      };
    }
    
    setClasses(prev => prev.filter(c => c.id !== id));
    setStudents(prev => prev.filter(s => s.classId !== id));
    if (isSupabaseConfigured()) SupabaseService.deleteClass(id);
    addLog('Xóa lớp học', `Xóa lớp ${targetClass.name} (${id})`);
    return { success: true, message: `Đã xóa lớp ${targetClass.name} thành công!` };
  };

  const archiveClass = (id: string, isArchived: boolean) => {
    setClasses(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, isArchived };
        if (isSupabaseConfigured()) SupabaseService.saveClass(updated);
        return updated;
      }
      return c;
    }));
    addLog(isArchived ? 'Lưu trữ lớp học' : 'Khôi phục lớp học', `${isArchived ? 'Lưu trữ' : 'Khôi phục'} Lớp ID: ${id}`);
  };

  // Master Data - Students
  const addStudent = (studentData: Omit<Student, 'id' | 'violationsCount'>) => {
    const newStudent: Student = {
      ...studentData,
      id: studentData.studentId || `st-${Date.now()}`,
      violationsCount: 0
    };
    setStudents(prev => [...prev, newStudent]);
    if (isSupabaseConfigured()) SupabaseService.saveStudent(newStudent);
    // Also update class total count
    setClasses(prev => prev.map(c => c.id === studentData.classId ? { ...c, totalStudents: c.totalStudents + 1, unionMembers: studentData.isUnionMember ? c.unionMembers + 1 : c.unionMembers } : c));
    addLog('Thêm học sinh mới', `Thêm em ${newStudent.name} (${newStudent.studentId}) vào lớp ${newStudent.classId}`);
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(prev => prev.map(s => {
      if (s.id === id || s.studentId === id) {
        const updated = { ...s, ...updates };
        if (isSupabaseConfigured()) SupabaseService.saveStudent(updated);
        return updated;
      }
      return s;
    }));
    addLog('Cập nhật học sinh', `Cập nhật hồ sơ học sinh ID: ${id}`);
  };

  const deleteStudent = (id: string) => {
    const st = students.find(s => s.id === id || s.studentId === id);
    setStudents(prev => prev.filter(s => s.id !== id && s.studentId !== id));
    if (isSupabaseConfigured()) SupabaseService.deleteStudent(id);
    if (st) {
      setClasses(prev => prev.map(c => c.id === st.classId ? { ...c, totalStudents: Math.max(0, c.totalStudents - 1) } : c));
      addLog('Xóa học sinh', `Xóa học sinh ${st.name} khỏi danh sách`);
    }
  };

  const transferStudent = (studentId: string, newClassId: string) => {
    const st = students.find(s => s.id === studentId);
    if (!st) return;
    const oldClassId = st.classId;
    const newClass = classes.find(c => c.id === newClassId);
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, classId: newClassId, grade: newClass?.grade || s.grade } : s));
    setClasses(prev => prev.map(c => {
      if (c.id === oldClassId) return { ...c, totalStudents: Math.max(0, c.totalStudents - 1) };
      if (c.id === newClassId) return { ...c, totalStudents: c.totalStudents + 1 };
      return c;
    }));
    addLog('Chuyển lớp học sinh', `Chuyển học sinh ${st.name} từ Lớp ${oldClassId} sang Lớp ${newClassId}`);
  };

  const importStudents = (studentsList: Array<Omit<Student, 'id' | 'violationsCount'>>): number => {
    const newStudents: Student[] = studentsList.map((s, idx) => ({
      ...s,
      id: `st-${Date.now()}-${idx}`,
      violationsCount: 0
    }));
    setStudents(prev => [...prev, ...newStudents]);
    addLog('Import Excel Học Sinh', `Đã import thành công ${newStudents.length} học sinh từ file Excel`);
    return newStudents.length;
  };

  const upsertStudentsFromExcel = (studentsList: Array<Partial<Student> & { studentId: string; name: string; classId: string }>): { added: number; updated: number } => {
    let added = 0;
    let updated = 0;

    setStudents(prev => {
      let currentList = [...prev];
      studentsList.forEach(incoming => {
        const existingIdx = currentList.findIndex(s => s.studentId === incoming.studentId);
        const gradeVal = Number(incoming.classId.split('/')[0] || 10) as 10 | 11 | 12;

        if (existingIdx >= 0) {
          // Update existing
          currentList[existingIdx] = {
            ...currentList[existingIdx],
            ...incoming,
            grade: gradeVal
          };
          updated++;
        } else {
          // Add new
          const newStudent: Student = {
            id: `st-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            studentId: incoming.studentId,
            name: incoming.name,
            classId: incoming.classId,
            grade: gradeVal,
            gender: incoming.gender || 'Nam',
            dob: incoming.dob || '2009-01-01',
            ethnicity: incoming.ethnicity || 'Kinh',
            phone: incoming.phone || '',
            isUnionMember: incoming.isUnionMember !== undefined ? incoming.isUnionMember : true,
            unionCardNumber: incoming.unionCardNumber || '',
            unionPosition: incoming.unionPosition || 'Đoàn viên',
            unionJoinedDate: incoming.unionJoinedDate || '',
            unionJoinedPlace: incoming.unionJoinedPlace || '',
            unionFeeStatus: incoming.unionFeeStatus || 'paid',
            unionBookletStatus: incoming.unionBookletStatus || 'submitted',
            conductRating: incoming.conductRating || 'Khá',
            customNotes: incoming.customNotes || '',
            points: incoming.points !== undefined ? incoming.points : 100,
            rankTitle: incoming.rankTitle || 'Đoàn viên Tích cực',
            violationsCount: 0,
            status: 'active'
          };
          currentList.push(newStudent);
          added++;
        }
      });
      return currentList;
    });

    addLog('Cập nhật dữ liệu từ Excel', `Đã đồng bộ Excel: Thêm mới ${added} học sinh, Cập nhật ${updated} hồ sơ`);
    return { added, updated };
  };

  // Calculate scores for active classes (exclude archived)
  const getWeeklyScores = (weekNum: number = activeWeek): ClassWeeklyScore[] => {
    const days: DayOfWeek[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const activeClasses = classes.filter(c => !c.isArchived);

    const scores: ClassWeeklyScore[] = activeClasses.map(c => {
      const classVios = violations.filter(v => 
        v.classId === c.id && 
        v.weekNumber === weekNum && 
        v.status !== 'approved_appeal' && 
        v.status !== 'cancelled'
      );

      const dailyScores: Record<DayOfWeek, DayScore> = {
        T2: { standard: 240, deduction: 0, bonus: 0, final: 240 },
        T3: { standard: 240, deduction: 0, bonus: 0, final: 240 },
        T4: { standard: 240, deduction: 0, bonus: 0, final: 240 },
        T5: { standard: 240, deduction: 0, bonus: 0, final: 240 },
        T6: { standard: 240, deduction: 0, bonus: 0, final: 240 },
        T7: { standard: 240, deduction: 0, bonus: 0, final: 240 },
      };

      let totalDeduction = 0;
      let totalBonus = 0;

      days.forEach(day => {
        const dayVios = classVios.filter(v => v.day === day);
        const dayDeduct = dayVios.reduce((sum, v) => sum + (v.pointsDeducted || 0), 0);
        const dayBonus = dayVios.reduce((sum, v) => sum + (v.bonusPoints || 0), 0);
        dailyScores[day].deduction = dayDeduct;
        dailyScores[day].bonus = dayBonus;
        dailyScores[day].final = Math.max(0, 240 - dayDeduct + dayBonus);
        totalDeduction += dayDeduct;
        totalBonus += dayBonus;
      });

      // Week-level bonuses without a specific standard day if any
      const nonDayBonuses = classVios.filter(v => !days.includes(v.day)).reduce((sum, v) => sum + (v.bonusPoints || 0), 0);
      totalBonus += nonDayBonuses;

      const finalScore = Math.max(0, 1440 - totalDeduction + totalBonus);

      const gradeOffset = c.grade === 10 ? 3 : c.grade === 11 ? 1 : -2;
      const parsedNum = parseInt(c.id.split('/')[1] || '1');
      const mockPrevRank = Math.min(18, Math.max(1, parsedNum * 3 - gradeOffset));
      const resolvedAppeals = violations.filter(v => v.classId === c.id && v.status === 'approved_appeal').length;

      return {
        classId: c.id,
        className: c.name,
        grade: c.grade,
        weekNumber: weekNum,
        standardScore: 1440,
        dailyScores,
        totalDeduction,
        totalBonus,
        finalScore,
        rank: 0,
        previousRank: mockPrevRank,
        trend: 'same',
        rating: finalScore >= 1430 ? 'Xuất sắc' : finalScore >= 1410 ? 'Tốt' : finalScore >= 1380 ? 'Khá' : 'Trung bình',
        violationCount: classVios.length,
        resolvedAppealCount: resolvedAppeals
      };
    });

    // 3-tier Tie-breaker ranking algorithm
    scores.sort((a, b) => {
      // Priority 1: Higher final score
      if (b.finalScore !== a.finalScore) {
        return b.finalScore - a.finalScore;
      }
      // Priority 2: Lower total deductions (less violations)
      if (a.totalDeduction !== b.totalDeduction) {
        return a.totalDeduction - b.totalDeduction;
      }
      // Priority 3: Higher total bonus points
      if (b.totalBonus !== a.totalBonus) {
        return b.totalBonus - a.totalBonus;
      }
      // Priority 4: Higher class student count
      const classA = classes.find(c => c.id === a.classId);
      const classB = classes.find(c => c.id === b.classId);
      const countA = classA?.totalStudents || 40;
      const countB = classB?.totalStudents || 40;
      return countB - countA;
    });

    scores.forEach((s, idx) => {
      s.rank = idx + 1;
      if (weekNum === 1) {
        // Week 1 has no previous benchmark
        s.trend = 'same';
      } else {
        if (s.rank < s.previousRank) s.trend = 'up';
        else if (s.rank > s.previousRank) s.trend = 'down';
        else s.trend = 'same';
      }
    });

    return scores;
  };

  const getClassScore = (classId: string, weekNum: number = activeWeek): ClassWeeklyScore | undefined => {
    const scores = getWeeklyScores(weekNum);
    return scores.find(s => s.classId === classId);
  };

  // Violations actions
  const addViolation = (data: Omit<Violation, 'id' | 'reportedAt' | 'status' | 'locked'>): Violation => {
    const newVio: Violation = {
      ...data,
      id: `vio-${Date.now()}`,
      reportedAt: new Date().toLocaleString('vi-VN'),
      status: 'pending',
      locked: isWeekLocked
    };
    setViolations(prev => [newVio, ...prev]);

    // Update violation count for students if named
    if (data.studentNames && data.studentNames.length > 0) {
      setStudents(prev => prev.map(s => {
        if (data.studentNames?.some(name => s.name.toLowerCase().includes(name.toLowerCase()))) {
          return { ...s, violationsCount: s.violationsCount + 1 };
        }
        return s;
      }));
    }

    addLog('Ghi nhận vi phạm', `Cờ đỏ ghi nhận lỗi "${data.criterionName}" cho ${data.className} (Trừ ${data.pointsDeducted}đ)`);

    // Realtime notification dispatch
    sendNotification({
      title: `⚠️ Ghi nhận vi phạm: ${data.className}`,
      message: `Cờ đỏ ${data.reportedBy?.name || ''} vừa ghi nhận lỗi "${data.criterionName}" (-${data.pointsDeducted}đ) vào buổi ${data.session || 'Sáng'}.`,
      type: 'violation',
      targetClassId: data.classId,
      targetRole: 'manager',
      linkView: 'manager'
    });
    sendNotification({
      title: `🚩 Báo cáo nề nếp mới: ${data.className}`,
      message: `Lỗi: "${data.criterionName}" (-${data.pointsDeducted}đ) - Cờ đỏ: ${data.reportedBy?.name || ''}.`,
      type: 'violation',
      targetRole: 'admin',
      linkView: 'admin'
    });

    // Cloud Database Persistence
    if (isSupabaseConfigured()) {
      SupabaseService.saveViolation(newVio).catch(err => {
        console.warn('Lỗi ghi vi phạm lên Supabase:', err);
      });
    }

    return newVio;
  };

  const updateViolationStatus = (id: string, status: ViolationStatus) => {
    setViolations(prev => prev.map(v => {
      if (v.id === id) {
        const updated = { ...v, status };
        if (isSupabaseConfigured()) SupabaseService.saveViolation(updated);
        return updated;
      }
      return v;
    }));
    const target = violations.find(v => v.id === id);
    if (target) {
      addLog('Cập nhật trạng thái lỗi', `Chuyển trạng thái lỗi [${target.criterionName}] của ${target.className} sang "${status}"`);
    }
  };

  const submitAppeal = (violationId: string, reason: string, proofImages: string[]): boolean => {
    setViolations(prev => prev.map(v => {
      if (v.id === violationId) {
        const updated: Violation = {
          ...v,
          status: 'appealed',
          appeal: {
            reason,
            proofImages,
            appealedBy: currentUser?.name || 'Giáo viên Chủ nhiệm',
            appealedAt: new Date().toLocaleString('vi-VN')
          }
        };
        if (isSupabaseConfigured()) SupabaseService.saveViolation(updated);
        return updated;
      }
      return v;
    }));
    const target = violations.find(v => v.id === violationId);
    addLog('Gửi khiếu nại phúc khảo', `GVCN gửi yêu cầu phúc khảo lỗi vi phạm ID: ${violationId}`);

    // Realtime notification to Admin
    sendNotification({
      title: `📩 Khiếu nại phúc khảo từ GVCN ${target?.className || ''}`,
      message: `Lớp ${target?.className || ''} gửi đơn khiếu nại lỗi "${target?.criterionName || ''}": "${reason}"`,
      type: 'appeal',
      targetRole: 'admin',
      linkView: 'admin'
    });

    return true;
  };

  const resolveAppeal = (violationId: string, decision: 'approved_appeal' | 'rejected_appeal', adminResponse: string): boolean => {
    setViolations(prev => prev.map(v => {
      if (v.id === violationId) {
        const updated: Violation = {
          ...v,
          status: decision,
          appeal: v.appeal ? {
            ...v.appeal,
            adminResponse,
            resolvedAt: new Date().toLocaleString('vi-VN'),
            resolvedBy: currentUser?.name || 'Bí thư Đoàn trường'
          } : undefined
        };
        if (isSupabaseConfigured()) SupabaseService.saveViolation(updated);
        return updated;
      }
      return v;
    }));
    const target = violations.find(v => v.id === violationId);
    addLog(
      decision === 'approved_appeal' ? 'Chấp nhận khiếu nại (Hủy lỗi)' : 'Bác bỏ khiếu nại (Giữ nguyên)',
      `Admin xử lý khiếu nại cho ${target?.className || 'Lớp'}: ${adminResponse}`
    );

    // Realtime notification to GVCN
    if (target) {
      sendNotification({
        title: `⚖️ Phản hồi khiếu nại lớp ${target.className}`,
        message: decision === 'approved_appeal'
          ? `Đoàn trường ĐÃ CHẤP NHẬN khiếu nại lỗi "${target.criterionName}" (Hủy lỗi & hoàn trả điểm).`
          : `Đoàn trường ĐÃ BÁC BỎ khiếu nại lỗi "${target.criterionName}". Phản hồi: ${adminResponse}`,
        type: 'appeal',
        targetClassId: target.classId,
        targetRole: 'manager',
        linkView: 'manager'
      });
    }

    return true;
  };

  const updateViolation = (id: string, updates: Partial<Violation>) => {
    setViolations(prev => prev.map(v => {
      if (v.id === id) {
        const updated = { ...v, ...updates };
        if (isSupabaseConfigured()) SupabaseService.saveViolation(updated);
        return updated;
      }
      return v;
    }));
    addLog('Chỉnh sửa vi phạm', `Admin cập nhật thông tin vi phạm ID: ${id}`);
  };

  const deleteViolation = (id: string) => {
    setViolations(prev => prev.filter(v => v.id !== id));
    if (isSupabaseConfigured()) {
      SupabaseService.deleteViolation(id).catch(err => {
        console.warn('Lỗi xóa vi phạm trên Supabase:', err);
      });
    }
    addLog('Xóa vi phạm', `Admin xóa bản ghi vi phạm ID: ${id}`);
  };

  // Criteria
  const addCriterion = (critData: Omit<Criterion, 'id'>) => {
    const newCrit: Criterion = {
      ...critData,
      id: critData.code || `crit-${Date.now()}`
    };
    setCriteria(prev => [...prev, newCrit]);
    if (isSupabaseConfigured()) SupabaseService.saveCriterion(newCrit);
    addLog('Thêm tiêu chí mới', `Tạo tiêu chí "${critData.name}" (${critData.points}${critData.unit})`);
  };

  const updateCriterion = (id: string, updates: Partial<Criterion>) => {
    setCriteria(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, ...updates };
        if (isSupabaseConfigured()) SupabaseService.saveCriterion(updated);
        return updated;
      }
      return c;
    }));
    addLog('Cập nhật tiêu chí', `Sửa thông tin tiêu chí ID: ${id}`);
  };

  const deleteCriterion = (id: string): { success: boolean; message: string } => {
    const isUsed = violations.some(v => v.criterionId === id);
    if (isUsed) {
      setCriteria(prev => prev.map(c => {
        if (c.id === id) {
          const updated = { ...c, isEnabled: false };
          if (isSupabaseConfigured()) SupabaseService.saveCriterion(updated);
          return updated;
        }
        return c;
      }));
      addLog('Ẩn tiêu chí đã dùng', `Tiêu chí ID ${id} đã có lịch sử chấm điểm nên được chuyển sang trạng thái Tắt/Ẩn thay vì xóa.`);
      return { 
        success: false, 
        message: 'Tiêu chí này đã có lịch sử ghi nhận vi phạm nên hệ thống đã tự động chuyển sang chế độ Ẩn/Tắt thay vì xóa cứng để đảm bảo toàn vẹn dữ liệu.' 
      };
    }
    setCriteria(prev => prev.filter(c => c.id !== id));
    if (isSupabaseConfigured()) SupabaseService.deleteCriterion(id);
    addLog('Xóa tiêu chí', `Xóa hoàn toàn tiêu chí ID: ${id}`);
    return { success: true, message: 'Đã xóa tiêu chí thành công!' };
  };

  const toggleCriterion = (id: string) => {
    setCriteria(prev => prev.map(c => {
      if (c.id === id) {
        const nextState = !c.isEnabled;
        const updated = { ...c, isEnabled: nextState };
        if (isSupabaseConfigured()) SupabaseService.saveCriterion(updated);
        addLog('Đổi trạng thái tiêu chí', `${nextState ? 'Bật' : 'Tắt'} tiêu chí "${c.name}"`);
        return updated;
      }
      return c;
    }));
  };

  // Lock / Unlock Week
  const lockWeek = (pin: string, targetWeekNum?: number) => {
    if (pin !== '123456') {
      return { success: false, message: 'Mã PIN bảo mật không chính xác (Mặc định: 123456)' };
    }
    const wNum = targetWeekNum !== undefined ? targetWeekNum : activeWeek;
    if (wNum === activeWeek) setIsWeekLocked(true);
    setWeeksConfig(prev => prev.map(w => w.weekNumber === wNum ? { ...w, isLocked: true } : w));
    setViolations(prev => prev.map(v => v.weekNumber === wNum ? { ...v, locked: true } : v));
    addLog('Khóa sổ thi đua tuần', `Admin đã khóa dữ liệu Tuần ${wNum} thành công. Dữ liệu đã đóng băng.`);
    return { success: true, message: `Đã khóa toàn bộ dữ liệu thi đua Tuần ${wNum} thành công!` };
  };

  const unlockWeek = (pin: string, targetWeekNum?: number) => {
    if (pin !== '123456') {
      return { success: false, message: 'Mã PIN bảo mật không chính xác (Mặc định: 123456)' };
    }
    const wNum = targetWeekNum !== undefined ? targetWeekNum : activeWeek;
    if (wNum === activeWeek) setIsWeekLocked(false);
    setWeeksConfig(prev => prev.map(w => w.weekNumber === wNum ? { ...w, isLocked: false } : w));
    setViolations(prev => prev.map(v => v.weekNumber === wNum ? { ...v, locked: false } : v));
    addLog('Mở khóa sổ thi đua tuần', `Admin đã mở khóa dữ liệu Tuần ${wNum}.`);
    return { success: true, message: `Đã mở khóa dữ liệu Tuần ${wNum}!` };
  };

  // User CRUD
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `user-${Date.now()}`
    };
    setUsers(prev => [...prev, newUser]);
    addLog('Thêm người dùng', `Tạo tài khoản mới: ${userData.username} (${userData.name})`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    addLog('Cập nhật người dùng', `Cập nhật thông tin tài khoản ID: ${id}`);
  };

  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    addLog('Xóa tài khoản', `Admin xóa người dùng ID: ${id}`);
  };

  const toggleUserActive = (id: string) => {
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const nextState = !u.isActive;
        addLog('Đổi trạng thái tài khoản', `${nextState ? 'Kích hoạt' : 'Khóa'} tài khoản ${u.username}`);
        return { ...u, isActive: nextState };
      }
      return u;
    }));
  };

  const resetPassword = (userId: string): string => {
    const defPass = '123456@Password';
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, password: defPass };
      }
      return u;
    }));
    addLog('Reset mật khẩu', `Khôi phục mật khẩu mặc định (${defPass}) cho tài khoản ID: ${userId}`);
    return defPass;
  };

  const changePassword = (userId: string, newPassword: string, oldPassword?: string): { success: boolean; message: string } => {
    const user = users.find(u => u.id === userId);
    if (!user) {
      return { success: false, message: 'Không tìm thấy tài khoản người dùng!' };
    }
    const currentPass = user.password || '123456@Password';
    if (oldPassword && oldPassword !== currentPass && oldPassword !== '123456' && oldPassword !== '123456@Password') {
      return { success: false, message: 'Mật khẩu cũ không chính xác!' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự!' };
    }

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return { ...u, password: newPassword };
      }
      return u;
    }));

    if (currentUser && currentUser.id === userId) {
      setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
    }

    addLog('Đổi mật khẩu', `Tài khoản ${user.username} (${user.name}) đã đổi mật khẩu thành công`);
    return { success: true, message: 'Đổi mật khẩu mới thành công!' };
  };

  // Duty assignments (Cấu hình phân công trực tuần)
  const addDutyAssignment = (duty: Omit<DutyAssignment, 'id'>) => {
    const newDuty: DutyAssignment = {
      ...duty,
      id: `duty-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`
    };
    setDuties(prev => [...prev, newDuty]);
    addLog('Thêm phân công trực', `Phân công ${newDuty.auditorName} trực ${newDuty.zone} (${newDuty.day} - Tuần ${newDuty.weekNumber})`);
  };

  const updateDutyAssignment = (dutyId: string, updates: Partial<DutyAssignment>) => {
    setDuties(prev => prev.map(d => d.id === dutyId ? { ...d, ...updates } : d));
    addLog('Cập nhật phân công trực', `Cập nhật ca trực ID: ${dutyId}`);
  };

  const deleteDutyAssignment = (dutyId: string) => {
    setDuties(prev => prev.filter(d => d.id !== dutyId));
    addLog('Xóa phân công trực', `Xóa ca trực ID: ${dutyId}`);
  };

  const generateDefaultDutiesForWeek = (weekNum: number) => {
    const activeZones = zones.map(z => z.name);
    const days: DayOfWeek[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const activeAuditors = auditors.filter(a => a.isActive);

    const generated: DutyAssignment[] = [];
    days.forEach(day => {
      activeZones.forEach((zone, zIdx) => {
        const auditor = activeAuditors[zIdx % (activeAuditors.length || 1)] || {
          id: 'codo_nam',
          name: 'Nguyễn Văn Nam',
          classId: '11/2'
        };
        generated.push({
          id: `duty-w${weekNum}-${day}-${zIdx}`,
          weekNumber: weekNum,
          day,
          zone,
          auditorId: auditor.id,
          auditorName: auditor.name,
          auditorClass: auditor.classId || '11/2',
          shiftTime: zone.includes('Cổng') ? '06:30 - 07:15 & 11:15 - 12:00' : '06:45 - 07:15 & 11:15 - 11:45',
          isLiveNow: day === 'T2'
        });
      });
    });

    setDuties(prev => [
      ...prev.filter(d => d.weekNumber !== weekNum),
      ...generated
    ]);
    addLog('Tạo lịch trực tự động', `Tạo lịch phân công trực chuẩn cho Tuần ${weekNum} (${generated.length} ca trực)`);
  };

  const copyDutiesToWeek = (fromWeek: number, toWeek: number) => {
    const sourceDuties = duties.filter(d => d.weekNumber === fromWeek);
    if (sourceDuties.length === 0) return;

    const copiedDuties: DutyAssignment[] = sourceDuties.map((d, idx) => ({
      ...d,
      id: `duty-w${toWeek}-${idx}-${Date.now()}`,
      weekNumber: toWeek
    }));

    setDuties(prev => [
      ...prev.filter(d => d.weekNumber !== toWeek),
      ...copiedDuties
    ]);
    addLog('Sao chép lịch trực', `Sao chép ${copiedDuties.length} ca trực từ Tuần ${fromWeek} sang Tuần ${toWeek}`);
  };

  const assignGvcnToClass = (classId: string, gvcnId: string) => {
    const gvcn = users.find(u => u.id === gvcnId);
    if (!gvcn) return;
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          gvcnId: gvcn.id,
          gvcnName: gvcn.name
        };
      }
      return c;
    }));
    addLog('Phân công GVCN', `Phân công thầy/cô ${gvcn.name} phụ trách lớp ${classId}`);
  };

  const removeGvcnFromClass = (classId: string) => {
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        return {
          ...c,
          gvcnId: '',
          gvcnName: 'Chưa phân công'
        };
      }
      return c;
    }));
    addLog('Gỡ phân công GVCN', `Gỡ giáo viên chủ nhiệm của lớp ${classId}`);
  };

  // Duty Zones Management (Khu vực giám sát)
  const addZone = (zoneData: Omit<DutyZone, 'id'>) => {
    const newZone: DutyZone = {
      ...zoneData,
      id: `zone-${Date.now()}`
    };
    setZones(prev => [...prev, newZone]);
    addLog('Thêm khu vực trực', `Thêm khu vực giám sát: ${zoneData.name}`);
  };

  const updateZone = (id: string, updates: Partial<DutyZone>) => {
    const target = zones.find(z => z.id === id);
    const oldName = target?.name;
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
    if (oldName && updates.name && oldName !== updates.name) {
      setDuties(prev => prev.map(d => d.zone === oldName ? { ...d, zone: updates.name! } : d));
    }
    addLog('Cập nhật khu vực', `Sửa thông tin khu vực ID: ${id}`);
  };

  const deleteZone = (id: string): { success: boolean; message: string } => {
    const target = zones.find(z => z.id === id);
    if (!target) return { success: false, message: 'Khu vực không tồn tại!' };
    setZones(prev => prev.filter(z => z.id !== id));
    addLog('Xóa khu vực trực', `Xóa khu vực giám sát: ${target.name}`);
    return { success: true, message: `Đã xóa khu vực "${target.name}" thành công!` };
  };

  // Auditor Team Management (Đội Cờ Đỏ)
  const addAuditorMember = (auditorData: Omit<AuditorMember, 'id'>) => {
    const newId = `codo_${Date.now()}`;
    const newAuditor: AuditorMember = {
      ...auditorData,
      id: newId
    };
    setAuditors(prev => [...prev, newAuditor]);
    
    // Automatically create a corresponding user account if not exists
    const existingUser = users.find(u => u.name.toLowerCase() === auditorData.name.toLowerCase());
    if (!existingUser) {
      const newUser: User = {
        id: newId,
        username: newId,
        name: auditorData.name,
        role: 'auditor',
        roleTitle: 'Cán bộ Cờ đỏ',
        classId: auditorData.classId,
        assignedZone: auditorData.assignedZone || 'Khối 10',
        phone: auditorData.phone,
        isActive: auditorData.isActive
      };
      setUsers(prev => [...prev, newUser]);
    }
    addLog('Thêm cán bộ cờ đỏ', `Thêm ${auditorData.name} (${auditorData.classId}) vào Đội Cờ đỏ`);
  };

  const updateAuditorMember = (id: string, updates: Partial<AuditorMember>) => {
    setAuditors(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    setUsers(prev => prev.map(u => u.id === id ? { ...u, ...updates } : u));
    if (updates.name) {
      setDuties(prev => prev.map(d => d.auditorId === id ? { ...d, auditorName: updates.name! } : d));
    }
    addLog('Cập nhật cán bộ cờ đỏ', `Sửa thông tin thành viên ID: ${id}`);
  };

  const deleteAuditorMember = (id: string) => {
    const target = auditors.find(a => a.id === id);
    setAuditors(prev => prev.filter(a => a.id !== id));
    setUsers(prev => prev.filter(u => u.id !== id));
    setDuties(prev => prev.filter(d => d.auditorId !== id));
    addLog('Xóa cán bộ cờ đỏ', `Xóa thành viên cờ đỏ: ${target?.name || id}`);
  };

  const toggleAuditorActive = (id: string) => {
    setAuditors(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));
  };

  // Events & QR Check-in
  const registerForEvent = (eventId: string, studentId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Sự kiện không tồn tại' };
    if (event.registeredStudentIds.includes(studentId)) {
      return { success: false, message: 'Bạn đã đăng ký tham gia sự kiện này rồi!' };
    }
    if (event.registeredCount >= event.maxSlots) {
      return { success: false, message: 'Sự kiện đã hết chỗ đăng ký! Bạn đã được thêm vào danh sách chờ.' };
    }

    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          registeredCount: e.registeredCount + 1,
          registeredStudentIds: [...e.registeredStudentIds, studentId]
        };
      }
      return e;
    }));

    addLog('Đăng ký sự kiện', `Học sinh ${studentId} đăng ký tham gia "${event.title}"`);
    return { success: true, message: `Đăng ký thành công! Bạn sẽ nhận được +${event.bonusPoints} điểm phong trào sau khi check-in.` };
  };

  const checkInEvent = (eventId: string, studentIdOrQr: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return { success: false, message: 'Không tìm thấy sự kiện!' };

    let student = users.find(u => u.id === studentIdOrQr || u.username === studentIdOrQr || u.studentId === studentIdOrQr);
    if (!student) {
      student = users.find(u => u.role === 'user') || users[0];
    }

    if (event.checkedInStudentIds.includes(student.id)) {
      return { 
        success: false, 
        message: `Đoàn viên ${student.name} (${student.classId}) ĐÃ ĐIỂM DANH TRƯỚC ĐÓ rồi!`,
        studentName: student.name,
        className: student.classId
      };
    }

    setEvents(prev => prev.map(e => {
      if (e.id === eventId) {
        return {
          ...e,
          checkedInStudentIds: [...e.checkedInStudentIds, student.id]
        };
      }
      return e;
    }));

    setUsers(prev => prev.map(u => {
      if (u.id === student.id) {
        const nextPoints = (u.points || 0) + event.bonusPoints;
        const nextRank = nextPoints >= 200 ? 'Cán bộ Đoàn Tiêu biểu' : nextPoints >= 150 ? 'Đoàn viên Xuất sắc' : nextPoints >= 80 ? 'Đoàn viên Tích cực' : 'Đoàn viên';
        return {
          ...u,
          points: nextPoints,
          rankTitle: nextRank
        };
      }
      return u;
    }));

    addLog('Điểm danh QR Code', `Quét QR thành công: ${student.name} (${student.classId}) tham gia "${event.title}" (+${event.bonusPoints}đ)`);

    return {
      success: true,
      message: `Điểm danh thành công! +${event.bonusPoints} điểm phong trào`,
      studentName: student.name,
      className: student.classId || '10/1'
    };
  };

  // Events CRUD
  const addEvent = (eventData: Omit<YouthEvent, 'id' | 'registeredCount' | 'registeredStudentIds' | 'checkedInStudentIds'>) => {
    const newEvent: YouthEvent = {
      ...eventData,
      id: `evt-${Date.now()}`,
      registeredCount: 0,
      registeredStudentIds: [],
      checkedInStudentIds: []
    };
    setEvents(prev => [newEvent, ...prev]);
    addLog('Tạo sự kiện phong trào', `Tạo sự kiện mới: "${eventData.title}" (+${eventData.bonusPoints}đ)`);
  };

  const updateEvent = (id: string, updates: Partial<YouthEvent>) => {
    setEvents(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
    addLog('Cập nhật sự kiện', `Chỉnh sửa thông tin sự kiện ID: ${id}`);
  };

  const deleteEvent = (id: string) => {
    const target = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    addLog('Xóa sự kiện', `Xóa sự kiện "${target?.title || id}"`);
  };

  // News CRUD
  const addNewsPost = (postData: Omit<NewsPost, 'id' | 'views'>) => {
    const newPost: NewsPost = {
      ...postData,
      id: `news-${Date.now()}`,
      views: 1,
      isHidden: false
    };
    setNews(prev => [newPost, ...prev]);
    if (isSupabaseConfigured()) SupabaseService.saveNews(newPost);
    addLog('Đăng tin tức mới', `Đăng bài viết "${postData.title}"`);
  };

  const updateNewsPost = (id: string, updates: Partial<NewsPost>) => {
    setNews(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, ...updates };
        if (isSupabaseConfigured()) SupabaseService.saveNews(updated);
        return updated;
      }
      return n;
    }));
    addLog('Cập nhật bài viết', `Chỉnh sửa bài viết ID: ${id}`);
  };

  const deleteNewsPost = (id: string) => {
    setNews(prev => prev.filter(n => n.id !== id));
    if (isSupabaseConfigured()) SupabaseService.deleteNews(id);
    addLog('Xóa bài viết', `Xóa bài viết ID: ${id}`);
  };

  const toggleNewsVisibility = (id: string) => {
    setNews(prev => prev.map(n => {
      if (n.id === id) {
        const nextHidden = !n.isHidden;
        const updated = { ...n, isHidden: nextHidden };
        if (isSupabaseConfigured()) SupabaseService.saveNews(updated);
        addLog('Đổi trạng thái bài viết', `${nextHidden ? 'Ẩn' : 'Hiển thị'} bài viết "${n.title}"`);
        return updated;
      }
      return n;
    }));
  };

  // Task Notice & Mobilization CRUD
  const addTaskNotice = (noticeData: Omit<TaskNotice, 'id' | 'createdAt' | 'status'>) => {
    const newNotice: TaskNotice = {
      ...noticeData,
      id: `not-${Date.now()}`,
      createdAt: new Date().toLocaleString('vi-VN'),
      status: 'pending'
    };
    setNotices(prev => [newNotice, ...prev]);
    if (isSupabaseConfigured()) SupabaseService.saveTaskNotice(newNotice);
    addLog('Phát thông báo điều động', `Tạo thông báo nhiệm vụ "${noticeData.title}"`);
  };

  const addNotice = (noticeData: Omit<TaskNotice, 'id' | 'createdAt'>) => {
    const newNotice: TaskNotice = {
      ...noticeData,
      id: `not-${Date.now()}`,
      createdAt: new Date().toLocaleString('vi-VN'),
      status: noticeData.status || 'pending'
    };
    setNotices(prev => [newNotice, ...prev]);
    if (isSupabaseConfigured()) SupabaseService.saveTaskNotice(newNotice);
    addLog('Tạo thông báo điều động', `Tạo nhiệm vụ "${noticeData.title}"`);
  };

  const updateNotice = (id: string, updates: Partial<TaskNotice>) => {
    setNotices(prev => prev.map(n => {
      if (n.id === id) {
        const updated = { ...n, ...updates };
        if (isSupabaseConfigured()) SupabaseService.saveTaskNotice(updated);
        return updated;
      }
      return n;
    }));
    addLog('Cập nhật nhiệm vụ điều động', `Chỉnh sửa nhiệm vụ ID: ${id}`);
  };

  const deleteNotice = (id: string) => {
    const target = notices.find(n => n.id === id);
    setNotices(prev => prev.filter(n => n.id !== id));
    if (isSupabaseConfigured()) SupabaseService.deleteTaskNotice(id);
    addLog('Xóa nhiệm vụ điều động', `Xóa nhiệm vụ "${target?.title || id}"`);
  };

  // Activity Slides CRUD
  const addActivitySlide = (slideData: Omit<ActivitySlide, 'id'>) => {
    const newSlide: ActivitySlide = {
      ...slideData,
      id: `slide-${Date.now()}`
    };
    setActivitySlides(prev => [...prev, newSlide]);
    if (isSupabaseConfigured()) SupabaseService.saveActivitySlide(newSlide);
    addLog('Thêm slide ảnh hoạt động', `Thêm slide "${newSlide.title}"`);
  };

  const updateActivitySlide = (id: string, updates: Partial<ActivitySlide>) => {
    setActivitySlides(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, ...updates };
        if (isSupabaseConfigured()) SupabaseService.saveActivitySlide(updated);
        return updated;
      }
      return s;
    }));
    addLog('Cập nhật slide ảnh', `Chỉnh sửa slide ID: ${id}`);
  };

  const deleteActivitySlide = (id: string) => {
    const target = activitySlides.find(s => s.id === id);
    setActivitySlides(prev => prev.filter(s => s.id !== id));
    if (isSupabaseConfigured()) SupabaseService.deleteActivitySlide(id);
    addLog('Xóa slide ảnh hoạt động', `Xóa slide "${target?.title || id}"`);
  };

  const toggleActivitySlideStatus = (id: string) => {
    setActivitySlides(prev => prev.map(s => {
      if (s.id === id) {
        const updated = { ...s, isActive: !s.isActive };
        if (isSupabaseConfigured()) SupabaseService.saveActivitySlide(updated);
        return updated;
      }
      return s;
    }));
    addLog('Đổi trạng thái slide ảnh', `Bật/Tắt hiển thị slide ID: ${id}`);
  };

  // Union Fee Locks & Batch Operations
  const toggleFeeLock = (classId: string, month: string) => {
    const key = month === 'ALL_YEAR' ? `${classId}_ALL_YEAR` : `${classId}_${month}`;
    setFeeLocks(prev => {
      const nextLocked = !prev[key];
      const updated = {
        ...prev,
        [key]: nextLocked
      };
      try {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_feeLocks`, JSON.stringify(updated));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
    addLog(
      'Khóa/Mở sổ đoàn phí',
      `Lớp ${classId}: ${month === 'ALL_YEAR' ? 'Toàn bộ năm học' : month}`
    );
  };

  const isFeeMonthLocked = (classId: string, month: string) => {
    return Boolean(feeLocks[`${classId}_ALL_YEAR`] || feeLocks[`${classId}_${month}`]);
  };

  const batchUpdateUnionFee = (studentIds: string[], month: string, status: 'paid' | 'unpaid') => {
    setStudents(prev => prev.map(st => {
      if (studentIds.includes(st.id) && st.isUnionMember) {
        return {
          ...st,
          monthlyUnionFees: {
            ...(st.monthlyUnionFees || {}),
            [month]: status
          },
          unionFeeStatus: status
        };
      }
      return st;
    }));
  };

  const payYearlyFee = (studentId: string, status: 'paid' | 'unpaid') => {
    const ALL_MONTHS = ['Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'];
    const updated: Record<string, 'paid' | 'unpaid'> = {};
    ALL_MONTHS.forEach(m => {
      updated[m] = status;
    });

    setStudents(prev => prev.map(st => {
      if (st.id === studentId) {
        return {
          ...st,
          monthlyUnionFees: updated,
          unionFeeStatus: status
        };
      }
      return st;
    }));
  };

  // Activity Reports from Youth Secretaries (Báo cáo tham gia phong trào)
  const submitActivityReport = (reportData: Omit<ActivityReport, 'id' | 'reportedAt' | 'status'>) => {
    const newReport: ActivityReport = {
      ...reportData,
      id: `act-rep-${Date.now()}`,
      reportedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'submitted'
    };
    setActivityReports(prev => [newReport, ...prev]);
    addLog('Báo cáo phong trào', `Bí thư Chi đoàn ${reportData.className} gửi danh sách ${reportData.participantCount} học sinh tham gia "${reportData.activityTitle}"`);

    // Realtime notification to Admin
    sendNotification({
      title: `🏆 Báo cáo phong trào: Chi đoàn ${reportData.className}`,
      message: `Bí thư ${reportData.secretaryName} vừa nộp danh sách ${reportData.participantCount} học sinh tham gia "${reportData.activityTitle}".`,
      type: 'report',
      targetRole: 'admin',
      linkView: 'admin'
    });
  };

  const deleteActivityReport = (id: string) => {
    const target = activityReports.find(r => r.id === id);
    setActivityReports(prev => prev.filter(r => r.id !== id));
    addLog('Xóa báo cáo phong trào', `Xóa báo cáo "${target?.activityTitle || id}" của lớp ${target?.className || ''}`);
  };

  const verifyActivityReport = (id: string, feedback?: string) => {
    setActivityReports(prev => prev.map(r => r.id === id ? {
      ...r,
      status: 'verified',
      adminFeedback: feedback || 'Đoàn trường đã ghi nhận và xác nhận danh sách tham gia.'
    } : r));
    const target = activityReports.find(r => r.id === id);
    addLog('Duyệt báo cáo phong trào', `Đoàn trường duyệt báo cáo "${target?.activityTitle}" của Chi đoàn ${target?.className}`);
    if (target) {
      sendNotification({
        title: `🎉 Đoàn trường đã duyệt Báo cáo phong trào`,
        message: `Danh sách học sinh tham gia "${target.activityTitle}" của Chi đoàn ${target.className} đã được xác nhận.`,
        type: 'report',
        targetClassId: target.classId,
        targetRole: 'youth_secretary',
        linkView: 'secretary'
      });
    }
  };
  const sendNotification = (notif: Omit<AppNotification, 'id' | 'createdAt' | 'isRead'>) => {
    const newNotif: AppNotification = {
      ...notif,
      id: `notif-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isRead: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    // Trigger Browser Web Push Notification if permission granted
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        new Notification(newNotif.title, {
          body: newNotif.message,
          icon: schoolSettings.logoUrl || '/favicon.ico'
        });
      }
    } catch {
      // Ignore notification policy errors
    }
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const markAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const requestPushPermission = async (): Promise<boolean> => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch {
        return false;
      }
    }
    return false;
  };

  // Semester / Annual Summary Score Calculations
  const getSemesterScores = (semester: 'HK1' | 'HK2' | 'YEAR', customWeeks?: number[]): SemesterClassScore[] => {
    let targetWeeks: number[] = [];
    if (customWeeks && customWeeks.length > 0) {
      targetWeeks = customWeeks;
    } else if (semester === 'HK1') {
      targetWeeks = Array.from({ length: 18 }, (_, i) => i + 1);
    } else if (semester === 'HK2') {
      targetWeeks = Array.from({ length: 17 }, (_, i) => i + 19);
    } else {
      targetWeeks = Array.from({ length: 35 }, (_, i) => i + 1);
    }

    const activeClasses = classes.filter(c => !c.isArchived);

    const semesterResults: SemesterClassScore[] = activeClasses.map(c => {
      let sumWeeklyFinalScores = 0;
      let totalDeductions = 0;
      let totalBonuses = 0;
      let totalViolations = 0;
      let resolvedAppeals = 0;
      const weeklyScores: Record<number, number> = {};

      targetWeeks.forEach(wNum => {
        const wScore = getClassScore(c.id, wNum);
        if (wScore) {
          sumWeeklyFinalScores += wScore.finalScore;
          totalDeductions += wScore.totalDeduction;
          totalBonuses += wScore.totalBonus;
          totalViolations += wScore.violationCount;
          resolvedAppeals += wScore.resolvedAppealCount;
          weeklyScores[wNum] = wScore.finalScore;
        } else {
          weeklyScores[wNum] = 1440;
          sumWeeklyFinalScores += 1440;
        }
      });

      const totalWeeksEvaluated = targetWeeks.length;
      const averageWeeklyScore = totalWeeksEvaluated > 0 ? Math.round(sumWeeklyFinalScores / totalWeeksEvaluated) : 1440;

      return {
        classId: c.id,
        className: c.name,
        grade: c.grade,
        totalWeeksEvaluated,
        averageWeeklyScore,
        totalDeductions,
        totalBonuses,
        totalViolations,
        resolvedAppeals,
        finalSemesterScore: averageWeeklyScore,
        rank: 0,
        awardTitle: '',
        weeklyScores
      };
    });

    // Sort ranking
    semesterResults.sort((a, b) => {
      if (b.finalSemesterScore !== a.finalSemesterScore) {
        return b.finalSemesterScore - a.finalSemesterScore;
      }
      if (a.totalDeductions !== b.totalDeductions) {
        return a.totalDeductions - b.totalDeductions;
      }
      return b.totalBonuses - a.totalBonuses;
    });

    // Assign rank and awards
    semesterResults.forEach((res, idx) => {
      res.rank = idx + 1;
      if (res.rank <= 3) {
        res.awardTitle = 'Chi đoàn Vững mạnh Xuất sắc (Cờ Thi Đua)';
      } else if (res.rank <= 9) {
        res.awardTitle = 'Chi đoàn Tiên tiến';
      } else if (res.rank <= 15) {
        res.awardTitle = 'Chi đoàn Khá';
      } else {
        res.awardTitle = 'Chi đoàn Trung bình';
      }
    });

    return semesterResults;
  };

  // Full Backup & Storage Management
  const createFullBackupSnapshot = () => {
    return {
      version: '2.5',
      systemName: 'Hệ thống Quản lý Nề nếp & Thi đua Đoàn THPT Quang Trung',
      exportedAt: new Date().toISOString(),
      exportedBy: currentUser?.name || 'Administrator',
      schoolSettings,
      activitySlides,
      academicYears,
      selectedAcademicYearId,
      weeksConfig,
      classes,
      students,
      criteria,
      violations,
      duties,
      zones,
      auditors,
      events,
      news,
      notices,
      users,
      feeLocks,
      activityReports,
      auditLogs,
      notifications
    };
  };

  const restoreFullBackup = (backupData: any): { success: boolean; message: string } => {
    try {
      if (!backupData || typeof backupData !== 'object') {
        return { success: false, message: 'Tệp sao lưu không hợp lệ hoặc bị hỏng!' };
      }
      if (backupData.schoolSettings) setSchoolSettings(backupData.schoolSettings);
      if (backupData.activitySlides) setActivitySlides(backupData.activitySlides);
      if (backupData.academicYears) setAcademicYears(backupData.academicYears);
      if (backupData.selectedAcademicYearId) setSelectedAcademicYearId(backupData.selectedAcademicYearId);
      if (backupData.weeksConfig) setWeeksConfig(backupData.weeksConfig);
      if (backupData.classes) setClasses(backupData.classes);
      if (backupData.students) setStudents(backupData.students);
      if (backupData.criteria) setCriteria(backupData.criteria);
      if (backupData.violations) setViolations(backupData.violations);
      if (backupData.duties) setDuties(backupData.duties);
      if (backupData.zones) setZones(backupData.zones);
      if (backupData.auditors) setAuditors(backupData.auditors);
      if (backupData.events) setEvents(backupData.events);
      if (backupData.news) setNews(backupData.news);
      if (backupData.notices) setNotices(backupData.notices);
      if (backupData.users) setUsers(backupData.users);
      if (backupData.feeLocks) setFeeLocks(backupData.feeLocks);
      if (backupData.activityReports) setActivityReports(backupData.activityReports);
      if (backupData.auditLogs) setAuditLogs(backupData.auditLogs);
      if (backupData.notifications) setNotifications(backupData.notifications);

      addLog('Khôi phục hệ thống', 'Khôi phục toàn bộ CSDL từ file sao lưu snapshot JSON.');
      return { success: true, message: 'Khôi phục dữ liệu hệ thống thành công 100%!' };
    } catch (err: any) {
      return { success: false, message: `Lỗi khôi phục: ${err.message || 'Không xác định'}` };
    }
  };

  const cleanOldStorageData = (daysToKeep: number = 60): { freedCount: number; message: string } => {
    const initialLogCount = auditLogs.length;
    setAuditLogs(prev => prev.slice(0, 100)); // keep last 100 logs
    const freed = Math.max(0, initialLogCount - 100);
    addLog('Dọn dẹp lưu trữ', `Đã dọn dẹp ${freed} bản ghi nhật ký kiểm toán cũ để tối ưu dung lượng.`);
    return { freedCount: freed, message: `Đã giải phóng thành công ${freed} bản ghi dữ liệu cũ!` };
  };

  // Academic Year Management Methods
  const addAcademicYear = (yearData: Omit<AcademicYear, 'id'>): AcademicYear => {
    const newYear: AcademicYear = {
      ...yearData,
      id: `year_${Date.now()}`
    };
    setAcademicYears(prev => [...prev, newYear]);
    addLog('Tạo Năm Học Mới', `Admin khởi tạo ${newYear.name}`);
    return newYear;
  };

  const executeAcademicYearRollover = (payload: RolloverPayload): { success: boolean; message: string } => {
    try {
      // 1. Freeze previous academic years and create new year with isCurrent = true
      const updatedYears: AcademicYear[] = academicYears.map(y => ({
        ...y,
        isCurrent: false,
        isFrozen: true
      }));

      const newYearRecord: AcademicYear = {
        id: payload.newYearId,
        name: payload.newYearName,
        startDate: payload.startDate,
        endDate: payload.endDate,
        isCurrent: true,
        isFrozen: false,
        createdAt: new Date().toLocaleString('vi-VN'),
        notes: `Kích hoạt chuyển giao từ năm học trước`
      };

      updatedYears.push(newYearRecord);
      setAcademicYears(updatedYears);
      setSelectedAcademicYearId(payload.newYearId);

      // 2. Graduate Grade 12 students & Promote Grade 10 & 11 students
      let graduatedCount = 0;
      let promotedCount = 0;

      setStudents(prev => prev.map(s => {
        // If in graduating Grade 12 classes or already Grade 12
        if (payload.graduatedGrade12ClassIds.includes(s.classId) || s.grade === 12) {
          graduatedCount++;
          return {
            ...s,
            status: 'graduated' as const
          };
        }

        // If in mapped class for promotion (e.g. 10/1 -> 11/1, 11/1 -> 12/1)
        const targetClass = payload.promotionMapping[s.classId];
        if (targetClass) {
          promotedCount++;
          const newGrade = (s.grade === 10 ? 11 : s.grade === 11 ? 12 : s.grade) as 10 | 11 | 12;
          return {
            ...s,
            classId: targetClass,
            grade: newGrade,
            // 3-Year cumulative union points are preserved!
            violationsCount: 0 // Reset annual violation counters for fresh year
          };
        }

        return s;
      }));

      // 3. Update Classes configuration for the new year
      setClasses(prev => prev.map(c => {
        const assignment = payload.gvcnAssignments[c.id];
        return {
          ...c,
          standardScore: 1440,
          gvcnName: assignment ? assignment.gvcnName : c.gvcnName,
          gvcnId: assignment ? assignment.gvcnId : c.gvcnId,
          academicYearId: payload.newYearId
        };
      }));

      // 4. Update Auditor members - remove graduated Grade 12 auditors
      setAuditors(prev => prev.filter(a => {
        if (payload.auditorMemberIds.length > 0) {
          return payload.auditorMemberIds.includes(a.id);
        }
        return !a.classId.startsWith('12/');
      }));

      // 5. Reset Weeks configuration to 35 fresh weeks for new academic year
      const startDateTime = new Date(payload.startDate).getTime();
      const newWeeksList: WeekConfig[] = Array.from({ length: 35 }, (_, i) => ({
        weekNumber: i + 1,
        title: `Tuần ${i + 1}`,
        startDate: new Date(startDateTime + i * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date(startDateTime + (i * 7 + 5) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        isCurrent: i === 0,
        isLocked: false,
        academicYearId: payload.newYearId
      }));
      setWeeksConfig(newWeeksList);
      setActiveWeekState(1);
      setIsWeekLocked(false);

      // 6. Send broadcast notification
      sendNotification({
        targetRole: 'all',
        targetClassId: 'ALL',
        title: `🎉 KÍCH HOẠT NĂM HỌC MỚI: ${payload.newYearName}`,
        message: `Hệ thống thi đua đã chuyển giao thành công sang ${payload.newYearName}. ${graduatedCount} học sinh K12 đã tốt nghiệp, ${promotedCount} học sinh K10-K11 đã nâng lớp. Chúc toàn trường năm học mới gặt hái nhiều thành tích rực rỡ!`,
        type: 'system',
        linkView: 'portal'
      });

      addLog(
        'Chuyển Giao Năm Học',
        `Admin kích hoạt ${payload.newYearName}. Tốt nghiệp: ${graduatedCount} HS, Nâng lớp: ${promotedCount} HS.`
      );

      return {
        success: true,
        message: `Chuyển giao năm học thành công! Đã kích hoạt ${payload.newYearName}, hoàn tất tốt nghiệp ${graduatedCount} học sinh K12 và nâng lớp cho ${promotedCount} học sinh.`
      };
    } catch (err: any) {
      console.error(err);
      return { success: false, message: `Có lỗi khi chuyển giao năm học: ${err.message}` };
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeWeek,
        setActiveWeek,
        isWeekLocked,
        feeLocks,
        toggleFeeLock,
        isFeeMonthLocked,
        batchUpdateUnionFee,
        payYearlyFee,
        classes,
        students,
        criteria,
        violations,
        duties,
        zones,
        auditors,
        events,
        news,
        notices,
        users,
        auditLogs,
        activityReports,
        submitActivityReport,
        deleteActivityReport,
        verifyActivityReport,
        weeksConfig,
        schoolSettings,
        activitySlides,
        academicYears,
        selectedAcademicYearId,
        currentAcademicYear,
        isHistoricalYear,
        setSelectedAcademicYearId,
        addAcademicYear,
        executeAcademicYearRollover,
        activeView,
        setActiveView,
        login,
        loginAsUser,
        logout,
        updateSchoolSettings,
        addActivitySlide,
        updateActivitySlide,
        deleteActivitySlide,
        toggleActivitySlideStatus,
        addWeek,
        updateWeek,
        deleteWeek,
        toggleWeekLockDirect,
        setCurrentWeek,
        addClass,
        updateClass,
        deleteClass,
        archiveClass,
        addStudent,
        updateStudent,
        deleteStudent,
        transferStudent,
        importStudents,
        upsertStudentsFromExcel,
        addViolation,
        updateViolation,
        updateViolationStatus,
        submitAppeal,
        resolveAppeal,
        deleteViolation,
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
        changePassword,
        addDutyAssignment,
        updateDutyAssignment,
        deleteDutyAssignment,
        generateDefaultDutiesForWeek,
        copyDutiesToWeek,
        assignGvcnToClass,
        removeGvcnFromClass,
        addZone,
        updateZone,
        deleteZone,
        addAuditorMember,
        updateAuditorMember,
        deleteAuditorMember,
        toggleAuditorActive,
        registerForEvent,
        checkInEvent,
        addEvent,
        updateEvent,
        deleteEvent,
        addNewsPost,
        updateNewsPost,
        deleteNewsPost,
        toggleNewsVisibility,
        addTaskNotice,
        addNotice,
        updateNotice,
        deleteNotice,
        getWeeklyScores,
        getClassScore,
        getSemesterScores,
        notifications,
        sendNotification,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        clearAllNotifications,
        requestPushPermission,
        createFullBackupSnapshot,
        restoreFullBackup,
        cleanOldStorageData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
};
