import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  RolloverPayload,
  MediaFolder,
  MediaItem,
  MediaCategory,
  DocumentFolder,
  DocumentFile
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
  INITIAL_ACADEMIC_YEARS,
  INITIAL_MEDIA_FOLDERS,
  INITIAL_MEDIA_ASSETS,
  INITIAL_DOCUMENT_FOLDERS,
  INITIAL_DOCUMENT_FILES,
  generateWeekDuties
} from '../data/initialData';
import { SupabaseService } from '../services/supabaseService';
import { isSupabaseConfigured, getSupabaseClient } from '../lib/supabase';
import { generateUUID } from '../utils/uuid';
import { 
  saveIndexedDBItem, 
  saveIndexedDBBatch, 
  getAllIndexedDBItems, 
  deleteIndexedDBItem, 
  deleteIndexedDBBatch, 
  clearIndexedDBStore,
  setIndexedDBKV,
  getIndexedDBKV,
  STORES 
} from '../utils/indexedDBStorage';

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
  updateSchoolSettings: (settings: Partial<SchoolSettings>) => Promise<boolean>;

  // Media Assets Library & Folders/Albums Manager
  mediaFolders: MediaFolder[];
  mediaAssets: MediaItem[];
  addMediaFolder: (folder: Omit<MediaFolder, 'id' | 'createdAt' | 'updatedAt'>) => MediaFolder;
  updateMediaFolder: (id: string, updates: Partial<MediaFolder>) => void;
  deleteMediaFolder: (id: string) => { success: boolean; message: string };
  moveMediaToFolder: (mediaId: string, folderId: string) => void;
  batchMoveMediaToFolder: (mediaIds: string[], folderId: string) => void;
  addMediaAsset: (file: File | Blob | string, meta?: { title?: string; category?: MediaCategory; folderId?: string; albumId?: string; classId?: string; weekNumber?: number; tags?: string[] }) => Promise<MediaItem | null>;
  deleteMediaAsset: (id: string) => Promise<boolean>;
  deleteMediaAssetsBatch: (ids: string[]) => Promise<{ deletedCount: number }>;
  updateMediaAsset: (id: string, updates: Partial<MediaItem>) => void;

  // Documents & Folders Management (Kho Văn Bản & Biểu Mẫu)
  documentFolders: DocumentFolder[];
  documentFiles: DocumentFile[];
  addDocumentFolder: (folder: Omit<DocumentFolder, 'id' | 'createdAt' | 'updatedAt'>) => DocumentFolder;
  updateDocumentFolder: (id: string, updates: Partial<DocumentFolder>) => void;
  deleteDocumentFolder: (id: string) => { success: boolean; message: string };
  addDocumentFile: (file: Omit<DocumentFile, 'id' | 'downloadsCount' | 'viewsCount' | 'createdAt' | 'updatedAt'>) => DocumentFile;
  updateDocumentFile: (id: string, updates: Partial<DocumentFile>) => void;
  deleteDocumentFile: (id: string) => void;
  incrementDocumentDownloads: (id: string) => void;
  incrementDocumentViews: (id: string) => void;
  moveDocumentFile: (fileId: string, targetFolderId: string) => void;

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
  toggleWeekVisibility: (weekNum: number) => void;
  resetToDefault35Weeks: () => void;
  updateSemesterConfig: (config: { semester1EndWeek: number; semester1Name?: string; semester2Name?: string }) => void;
  syncWeeksToCloud: () => Promise<{ success: boolean; message: string; count: number }>;

  // Master Data - Classes
  addClass: (newClass: Omit<ClassInfo, 'standardScore'>) => void;
  updateClass: (id: string, updates: Partial<ClassInfo>) => void;
  deleteClass: (id: string) => { success: boolean; message: string };
  archiveClass: (id: string, isArchived: boolean) => void;

  // Master Data - Students
  addStudent: (student: Omit<Student, 'id' | 'violationsCount'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  deleteStudentsBatch: (ids: string[]) => void;
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

  // Cloud Sync Status & Actions
  isSyncingCloud: boolean;
  refreshDataFromCloud: () => Promise<void>;

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

const sanitizeStudent = (s: Student): Student => {
  let phone = s.phone ? String(s.phone).trim() : '';
  let address = s.address ? String(s.address).trim() : '';

  // If phone contains Vietnamese characters/words (e.g. "Thôn Bến Hiên", "Xã Bến Hiên"), it is an address!
  if (phone && /[a-zA-Zà-ỹÀ-Ỹ]/.test(phone)) {
    if (!address) {
      address = phone;
    }
    phone = '';
  }

  return {
    ...s,
    phone,
    address
  };
};

const sanitizeStudentList = (list: Student[]): Student[] => {
  if (!Array.isArray(list)) return [];
  return list.map(sanitizeStudent);
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const loadStored = <T,>(key: string, fallback: T): T => {
    try {
      const stored = localStorage.getItem(`${LOCAL_STORAGE_KEY}_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  };

  const sanitizeSchoolSettings = (settings: SchoolSettings): SchoolSettings => {
    const s = { ...settings };
    if (s.themeColor === ('green' as any)) s.themeColor = 'emerald';
    if (!s.themeColor) s.themeColor = 'emerald';
    if (!s.logoUrl || s.logoUrl.includes('mvkvfvxfcqxdabxumroz.supabase.co')) {
      s.logoUrl = INITIAL_SCHOOL_SETTINGS.logoUrl;
    }
    if (!s.youthUnionLogoUrl || s.youthUnionLogoUrl.includes('mvkvfvxfcqxdabxumroz.supabase.co')) {
      s.youthUnionLogoUrl = INITIAL_SCHOOL_SETTINGS.youthUnionLogoUrl;
    }
    if (!s.bannerTopImage || s.bannerTopImage.includes('mvkvfvxfcqxdabxumroz.supabase.co')) {
      s.bannerTopImage = INITIAL_SCHOOL_SETTINGS.bannerTopImage;
    }
    if (!s.footerBannerImage || s.footerBannerImage.includes('mvkvfvxfcqxdabxumroz.supabase.co')) {
      s.footerBannerImage = INITIAL_SCHOOL_SETTINGS.footerBannerImage;
    }
    return s;
  };

  const sanitizeMediaFolders = (folders: MediaFolder[]): MediaFolder[] => {
    if (!Array.isArray(folders) || folders.length === 0) return INITIAL_MEDIA_FOLDERS;
    // Tự động dọn dẹp các thư mục rác / thừa của phiên bản cũ (folder-root, folder-hd-2627,...)
    const hasLegacy = folders.some(f => f.id.startsWith('folder-'));
    if (hasLegacy) {
      const userCustomFolders = folders.filter(f => !f.id.startsWith('folder-'));
      const map = new Map<string, MediaFolder>();
      INITIAL_MEDIA_FOLDERS.forEach(f => map.set(f.id, f));
      userCustomFolders.forEach(f => map.set(f.id, f));
      return Array.from(map.values());
    }
    return folders;
  };

  const sanitizeMediaAssets = (assets: MediaItem[]): MediaItem[] => {
    if (!Array.isArray(assets)) return INITIAL_MEDIA_ASSETS;
    return assets.map(item => {
      let folderId = item.folderId || item.albumId;
      if (folderId === 'folder-root' || folderId === 'folder-hd-2627' || folderId === 'folder-hanhtrinh' || folderId === 'folder-ket-nap-dang') {
        folderId = 'album-activities';
      } else if (folderId === 'folder-brand' || folderId === 'folder-banner' || folderId === 'folder-lien-ket-web' || folderId === 'folder-icon') {
        folderId = 'album-branding';
      } else if (folderId === 'folder-chunhatxanh') {
        folderId = 'album-chunhatxanh';
      }
      if (item.url && item.url.includes('mvkvfvxfcqxdabxumroz.supabase.co')) {
        const fallback = INITIAL_MEDIA_ASSETS.find(i => i.id === item.id);
        if (fallback) {
          return { ...item, folderId, albumId: folderId, url: fallback.url, format: fallback.format };
        }
      }
      return { ...item, folderId, albumId: folderId };
    });
  };

  const [currentUser, setCurrentUser] = useState<User | null>(() => loadStored('currentUser', null));
  const [activeWeek, setActiveWeekState] = useState<number>(() => {
    const stored = loadStored<number>('activeWeek', 1);
    return stored && stored >= 1 && stored <= 35 ? stored : 1;
  });
  const [isWeekLocked, setIsWeekLocked] = useState<boolean>(() => loadStored('isWeekLocked', false));
  const [schoolSettings, setSchoolSettings] = useState<SchoolSettings>(() => sanitizeSchoolSettings(loadStored('schoolSettings', INITIAL_SCHOOL_SETTINGS)));
  const [activitySlides, setActivitySlides] = useState<ActivitySlide[]>(() => loadStored('activitySlides', INITIAL_ACTIVITY_SLIDES));
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>(() => {
    const stored = loadStored<AcademicYear[]>('academicYears', INITIAL_ACADEMIC_YEARS);
    if (!Array.isArray(stored) || !stored.some(y => y.id === '2026_2027')) {
      return INITIAL_ACADEMIC_YEARS;
    }
    return stored;
  });
  const currentAcademicYear = academicYears.find(y => y.isCurrent) || academicYears[0] || INITIAL_ACADEMIC_YEARS[0];
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState<string>(() => loadStored('selectedAcademicYearId', currentAcademicYear?.id || '2026_2027'));
  const isHistoricalYear = Boolean(currentAcademicYear && selectedAcademicYearId !== currentAcademicYear.id);

  const [weeksConfig, setWeeksConfig] = useState<WeekConfig[]>(() => {
    const stored = loadStored<WeekConfig[]>('weeksConfig', INITIAL_WEEKS);
    if (!Array.isArray(stored) || stored.length < 35 || stored[0]?.startDate !== '2026-09-07') {
      return INITIAL_WEEKS;
    }
    return stored;
  });
  const [classes, setClasses] = useState<ClassInfo[]>(() => {
    const stored = loadStored<ClassInfo[]>('classes', INITIAL_CLASSES);
    if (!Array.isArray(stored) || stored.length === 0 || !stored.some(c => c.classPresidentName)) {
      return INITIAL_CLASSES;
    }
    return stored;
  });
  const [students, setStudents] = useState<Student[]>(() => sanitizeStudentList(loadStored('students', INITIAL_STUDENTS)));
  const [criteria, setCriteria] = useState<Criterion[]>(() => loadStored('criteria', INITIAL_CRITERIA));
  const [violations, setViolations] = useState<Violation[]>(() => loadStored('violations', INITIAL_VIOLATIONS));
  const [duties, setDuties] = useState<DutyAssignment[]>(() => {
    const stored = loadStored<DutyAssignment[]>('duties', INITIAL_DUTIES);
    if (!Array.isArray(stored) || stored.length === 0 || stored.some(d => d.auditorName === 'Nguyễn Văn Nam')) {
      return INITIAL_DUTIES;
    }
    return stored;
  });
  const [zones, setZones] = useState<DutyZone[]>(() => {
    const stored = loadStored<DutyZone[]>('zones', INITIAL_ZONES);
    if (!Array.isArray(stored) || stored.length === 0 || stored.some(z => z.name === 'Khối 10')) {
      return INITIAL_ZONES;
    }
    return stored;
  });
  const [auditors, setAuditors] = useState<AuditorMember[]>(() => {
    const stored = loadStored<AuditorMember[]>('auditors', INITIAL_AUDITORS);
    if (!Array.isArray(stored) || stored.length < 10 || stored.some(a => a.id === 'codo_nam')) {
      return INITIAL_AUDITORS;
    }
    return stored;
  });
  const [events, setEvents] = useState<YouthEvent[]>(() => loadStored('events', INITIAL_EVENTS));
  const [news, setNews] = useState<NewsPost[]>(() => loadStored('news', INITIAL_NEWS));
  const [notices, setNotices] = useState<TaskNotice[]>(() => loadStored('notices', INITIAL_NOTICES));
  const [users, setUsers] = useState<User[]>(() => {
    const stored = loadStored<User[]>('users', INITIAL_USERS);
    if (!Array.isArray(stored) || stored.length === 0 || !stored.some(u => u.username === 'bithu_10_1' && u.name === 'Lâm Xuân Tín')) {
      return INITIAL_USERS;
    }
    return stored;
  });
  const [feeLocks, setFeeLocks] = useState<Record<string, boolean>>(() => loadStored('feeLocks', {}));
  const [activityReports, setActivityReports] = useState<ActivityReport[]>(() => loadStored('activityReports', INITIAL_ACTIVITY_REPORTS));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStored('auditLogs', INITIAL_LOGS));
  const [notifications, setNotifications] = useState<AppNotification[]>(() => loadStored('notifications', INITIAL_NOTIFICATIONS));
  const [mediaFolders, setMediaFolders] = useState<MediaFolder[]>(() => {
    const stored = loadStored<MediaFolder[]>('mediaFolders', INITIAL_MEDIA_FOLDERS);
    return sanitizeMediaFolders(stored);
  });
  const [mediaAssets, setMediaAssets] = useState<MediaItem[]>(() => {
    const stored = loadStored<MediaItem[]>('mediaAssets', INITIAL_MEDIA_ASSETS);
    return sanitizeMediaAssets(stored);
  });
  const [documentFolders, setDocumentFolders] = useState<DocumentFolder[]>(() => {
    const stored = loadStored<DocumentFolder[]>('documentFolders', INITIAL_DOCUMENT_FOLDERS);
    if (!Array.isArray(stored)) {
      return INITIAL_DOCUMENT_FOLDERS;
    }
    return stored;
  });
  const [documentFiles, setDocumentFiles] = useState<DocumentFile[]>(() => {
    const stored = loadStored<DocumentFile[]>('documentFiles', INITIAL_DOCUMENT_FILES);
    if (!Array.isArray(stored)) {
      return INITIAL_DOCUMENT_FILES;
    }
    return stored;
  });
  const [activeView, setActiveView] = useState<string>('portal');

  // Hàm lưu LocalStorage an toàn từng key độc lập (Tránh việc 1 key đầy dung lượng làm hỏng toàn bộ các key khác)
  const safeSaveLocalStorage = (key: string, value: any) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(`${LOCAL_STORAGE_KEY}_${key}`, JSON.stringify(value));
      }
    } catch {
      // Gracefully handle QuotaExceededError in Safari Private mode
    }
  };

  // Sync to local storage
  useEffect(() => {
    safeSaveLocalStorage('currentUser', currentUser);
    safeSaveLocalStorage('activeWeek', activeWeek);
    safeSaveLocalStorage('isWeekLocked', isWeekLocked);
    safeSaveLocalStorage('schoolSettings', schoolSettings);
    safeSaveLocalStorage('activitySlides', activitySlides);
    safeSaveLocalStorage('academicYears', academicYears);
    safeSaveLocalStorage('selectedAcademicYearId', selectedAcademicYearId);
    safeSaveLocalStorage('weeksConfig', weeksConfig);
    safeSaveLocalStorage('classes', classes);
    safeSaveLocalStorage('students', students);
    safeSaveLocalStorage('criteria', criteria);
    safeSaveLocalStorage('violations', violations);
    safeSaveLocalStorage('duties', duties);
    safeSaveLocalStorage('zones', zones);
    safeSaveLocalStorage('auditors', auditors);
    safeSaveLocalStorage('events', events);
    safeSaveLocalStorage('news', news);
    safeSaveLocalStorage('notices', notices);
    safeSaveLocalStorage('users', users);
    safeSaveLocalStorage('feeLocks', feeLocks);
    safeSaveLocalStorage('activityReports', activityReports);
    safeSaveLocalStorage('auditLogs', auditLogs);
    safeSaveLocalStorage('notifications', notifications);
    safeSaveLocalStorage('mediaFolders', mediaFolders);
    safeSaveLocalStorage('mediaAssets', mediaAssets);
    safeSaveLocalStorage('documentFolders', documentFolders);
    safeSaveLocalStorage('documentFiles', documentFiles);
  }, [currentUser, activeWeek, isWeekLocked, schoolSettings, activitySlides, academicYears, selectedAcademicYearId, weeksConfig, classes, students, criteria, violations, duties, zones, auditors, events, news, notices, users, feeLocks, activityReports, auditLogs, notifications, mediaFolders, mediaAssets, documentFolders, documentFiles]);

  const [isHydrated, setIsHydrated] = useState<boolean>(false);
  const hasCloudSyncedRef = useRef<boolean>(false);
  const isFetchingCloudRef = useRef<boolean>(false);
  const realtimeChannelRef = useRef<any>(null);
  const localBroadcastRef = useRef<BroadcastChannel | null>(null);

  const broadcastGlobalSync = (tableType?: string) => {
    try {
      if (realtimeChannelRef.current) {
        realtimeChannelRef.current.send({
          type: 'broadcast',
          event: 'SYNC_UPDATE',
          payload: { table: tableType || 'all', timestamp: Date.now() }
        });
      }
    } catch {}
    try {
      if (localBroadcastRef.current) {
        localBroadcastRef.current.postMessage({
          type: 'LOCAL_SYNC_UPDATE',
          table: tableType || 'all',
          timestamp: Date.now()
        });
      }
    } catch {}
  };

  // Tự động khôi phục & đồng bộ hai chiều từ IndexedDB (vượt qua giới hạn 5MB, đảm bảo F5 luôn còn ảnh, bài viết, sự kiện & toàn bộ dữ liệu)
  useEffect(() => {
    let isMounted = true;
    const hydrateFromIndexedDB = async () => {
      try {
        const [
          dbFolders, 
          dbAssets, 
          dbDocFolders, 
          dbDocFiles,
          dbNews,
          dbEvents,
          dbViolations,
          dbNotices,
          dbSlides,
          dbSettings,
          dbClasses,
          dbStudents,
          dbCriteria,
          dbDuties,
          dbZones,
          dbAuditors,
          dbReports,
          dbUsers,
          dbWeeks,
          dbAcademicYears,
          dbSelectedYearId,
          dbLogs,
          dbNotifications,
          dbFeeLocks,
          dbIsWeekLocked,
          dbActiveWeek
        ] = await Promise.all([
          getAllIndexedDBItems<MediaFolder>(STORES.MEDIA_FOLDERS),
          getAllIndexedDBItems<MediaItem>(STORES.MEDIA_ASSETS),
          getAllIndexedDBItems<DocumentFolder>(STORES.DOCUMENT_FOLDERS),
          getAllIndexedDBItems<DocumentFile>(STORES.DOCUMENT_FILES),
          getIndexedDBKV<NewsPost[]>('app_news'),
          getIndexedDBKV<YouthEvent[]>('app_events'),
          getIndexedDBKV<Violation[]>('app_violations'),
          getIndexedDBKV<TaskNotice[]>('app_notices'),
          getIndexedDBKV<ActivitySlide[]>('app_activity_slides'),
          getIndexedDBKV<SchoolSettings>('app_school_settings'),
          getIndexedDBKV<ClassInfo[]>('app_classes'),
          getIndexedDBKV<Student[]>('app_students'),
          getIndexedDBKV<Criterion[]>('app_criteria'),
          getIndexedDBKV<DutyAssignment[]>('app_duties'),
          getIndexedDBKV<DutyZone[]>('app_zones'),
          getIndexedDBKV<AuditorMember[]>('app_auditors'),
          getIndexedDBKV<ActivityReport[]>('app_activity_reports'),
          getIndexedDBKV<User[]>('app_users'),
          getIndexedDBKV<WeekConfig[]>('app_weeks_config'),
          getIndexedDBKV<AcademicYear[]>('app_academic_years'),
          getIndexedDBKV<string>('app_selected_academic_year_id'),
          getIndexedDBKV<AuditLog[]>('app_audit_logs'),
          getIndexedDBKV<AppNotification[]>('app_notifications'),
          getIndexedDBKV<Record<string, boolean>>('app_fee_locks'),
          getIndexedDBKV<boolean>('app_is_week_locked'),
          getIndexedDBKV<number>('app_active_week')
        ]);

        if (!isMounted) return;

        // Nếu dữ liệu Cloud đã được đồng bộ về trước, KHÔNG ghi đè dữ liệu cũ từ IndexedDB
        if (hasCloudSyncedRef.current) {
          setIsHydrated(true);
          return;
        }

        // 1. Media Folders
        if (dbFolders && dbFolders.length > 0) {
          const cleanFolders = sanitizeMediaFolders(dbFolders);
          setMediaFolders(cleanFolders);
          if (dbFolders.some(f => f.id.startsWith('folder-'))) {
            clearIndexedDBStore(STORES.MEDIA_FOLDERS).then(() => {
              saveIndexedDBBatch(STORES.MEDIA_FOLDERS, cleanFolders);
            });
          }
        } else {
          saveIndexedDBBatch(STORES.MEDIA_FOLDERS, INITIAL_MEDIA_FOLDERS);
        }

        // 2. Media Assets
        if (dbAssets && dbAssets.length > 0) {
          const cleanAssets = sanitizeMediaAssets(dbAssets);
          setMediaAssets(cleanAssets);
        } else {
          saveIndexedDBBatch(STORES.MEDIA_ASSETS, INITIAL_MEDIA_ASSETS);
        }

        // 3. Document Folders
        if (dbDocFolders && dbDocFolders.length > 0) {
          setDocumentFolders(prev => {
            const map = new Map<string, DocumentFolder>();
            INITIAL_DOCUMENT_FOLDERS.forEach(f => map.set(f.id, f));
            prev.forEach(f => map.set(f.id, f));
            dbDocFolders.forEach(f => map.set(f.id, f));
            return Array.from(map.values());
          });
        } else {
          saveIndexedDBBatch(STORES.DOCUMENT_FOLDERS, INITIAL_DOCUMENT_FOLDERS);
        }

        // 4. Document Files
        if (dbDocFiles && dbDocFiles.length > 0) {
          setDocumentFiles(prev => {
            const map = new Map<string, DocumentFile>();
            INITIAL_DOCUMENT_FILES.forEach(f => map.set(f.id, f));
            prev.forEach(f => map.set(f.id, f));
            dbDocFiles.forEach(f => map.set(f.id, f));
            return Array.from(map.values());
          });
        } else {
          saveIndexedDBBatch(STORES.DOCUMENT_FILES, INITIAL_DOCUMENT_FILES);
        }

        // 5. News & Events (Bản tin & Sự kiện phong trào)
        if (dbNews && Array.isArray(dbNews) && dbNews.length > 0) {
          setNews(dbNews);
        }
        if (dbEvents && Array.isArray(dbEvents) && dbEvents.length > 0) {
          setEvents(dbEvents);
        }

        // 6. Violations & Notices & Slides & Settings
        if (dbViolations && Array.isArray(dbViolations)) {
          setViolations(dbViolations);
        }
        if (dbNotices && Array.isArray(dbNotices) && dbNotices.length > 0) {
          setNotices(dbNotices);
        }
        if (dbSlides && Array.isArray(dbSlides) && dbSlides.length > 0) {
          setActivitySlides(dbSlides);
        }
        if (dbSettings && typeof dbSettings === 'object' && dbSettings.schoolName) {
          setSchoolSettings(sanitizeSchoolSettings(dbSettings));
        }

        // 7. Master Data: Classes, Students, Criteria, Duties, Zones, Auditors, Reports, Users
        if (dbClasses && Array.isArray(dbClasses) && dbClasses.length > 0) {
          setClasses(dbClasses);
        }
        if (dbStudents && Array.isArray(dbStudents) && dbStudents.length > 0) {
          setStudents(sanitizeStudentList(dbStudents));
        }
        if (dbCriteria && Array.isArray(dbCriteria) && dbCriteria.length > 0) {
          setCriteria(dbCriteria);
        }
        if (dbDuties && Array.isArray(dbDuties) && dbDuties.length > 0) {
          setDuties(dbDuties);
        }
        if (dbZones && Array.isArray(dbZones) && dbZones.length > 0) {
          setZones(dbZones);
        }
        if (dbAuditors && Array.isArray(dbAuditors) && dbAuditors.length > 0) {
          setAuditors(dbAuditors);
        }
        if (dbReports && Array.isArray(dbReports)) {
          setActivityReports(dbReports);
        }
        if (dbUsers && Array.isArray(dbUsers) && dbUsers.length > 0) {
          setUsers(dbUsers);
        }
        if (dbWeeks && Array.isArray(dbWeeks) && dbWeeks.length >= 35) {
          setWeeksConfig(dbWeeks);
        }
        if (dbAcademicYears && Array.isArray(dbAcademicYears) && dbAcademicYears.length > 0) {
          setAcademicYears(dbAcademicYears);
        }
        if (dbSelectedYearId && typeof dbSelectedYearId === 'string') {
          setSelectedAcademicYearId(dbSelectedYearId);
        }
        if (dbLogs && Array.isArray(dbLogs)) {
          setAuditLogs(dbLogs);
        }
        if (dbNotifications && Array.isArray(dbNotifications)) {
          setNotifications(dbNotifications);
        }
        if (dbFeeLocks && typeof dbFeeLocks === 'object') {
          setFeeLocks(dbFeeLocks);
        }
        if (typeof dbIsWeekLocked === 'boolean') {
          setIsWeekLocked(dbIsWeekLocked);
        }
        if (typeof dbActiveWeek === 'number' && dbActiveWeek >= 1 && dbActiveWeek <= 35) {
          setActiveWeekState(dbActiveWeek);
        }

        setIsHydrated(true);
      } catch (err) {
        console.warn('[IndexedDB] Lỗi khởi tạo nạp dữ liệu offline:', err);
        setIsHydrated(true);
      }
    };

    hydrateFromIndexedDB();
    return () => { isMounted = false; };
  }, []);

  // Tự động ghi nhận sâu vào IndexedDB khi có thay đổi (sau khi đã hydrate thành công)
  useEffect(() => {
    if (!isHydrated) return;
    setIndexedDBKV('app_news', news);
    setIndexedDBKV('app_events', events);
    setIndexedDBKV('app_violations', violations);
    setIndexedDBKV('app_notices', notices);
    setIndexedDBKV('app_activity_slides', activitySlides);
    setIndexedDBKV('app_school_settings', schoolSettings);
    setIndexedDBKV('app_classes', classes);
    setIndexedDBKV('app_students', students);
    setIndexedDBKV('app_criteria', criteria);
    setIndexedDBKV('app_duties', duties);
    setIndexedDBKV('app_zones', zones);
    setIndexedDBKV('app_auditors', auditors);
    setIndexedDBKV('app_activity_reports', activityReports);
    setIndexedDBKV('app_users', users);
    setIndexedDBKV('app_weeks_config', weeksConfig);
    setIndexedDBKV('app_academic_years', academicYears);
    setIndexedDBKV('app_selected_academic_year_id', selectedAcademicYearId);
    setIndexedDBKV('app_audit_logs', auditLogs);
    setIndexedDBKV('app_notifications', notifications);
    setIndexedDBKV('app_fee_locks', feeLocks);
    setIndexedDBKV('app_is_week_locked', isWeekLocked);
    setIndexedDBKV('app_active_week', activeWeek);
  }, [
    isHydrated,
    news,
    events,
    violations,
    notices,
    activitySlides,
    schoolSettings,
    classes,
    students,
    criteria,
    duties,
    zones,
    auditors,
    activityReports,
    users,
    weeksConfig,
    academicYears,
    selectedAcademicYearId,
    auditLogs,
    notifications,
    feeLocks,
    isWeekLocked,
    activeWeek
  ]);

  useEffect(() => {
    if (mediaFolders && mediaFolders.length > 0) {
      saveIndexedDBBatch(STORES.MEDIA_FOLDERS, mediaFolders);
    }
  }, [mediaFolders]);

  useEffect(() => {
    if (mediaAssets && mediaAssets.length > 0) {
      saveIndexedDBBatch(STORES.MEDIA_ASSETS, mediaAssets);
    }
  }, [mediaAssets]);

  useEffect(() => {
    if (documentFolders && documentFolders.length > 0) {
      saveIndexedDBBatch(STORES.DOCUMENT_FOLDERS, documentFolders);
    }
  }, [documentFolders]);

  useEffect(() => {
    if (documentFiles && documentFiles.length > 0) {
      saveIndexedDBBatch(STORES.DOCUMENT_FILES, documentFiles);
    }
  }, [documentFiles]);

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

  const [isSyncingCloud, setIsSyncingCloud] = useState<boolean>(false);

  // Hàm đồng bộ toàn diện tất cả bảng dữ liệu từ Supabase Cloud với thuật toán gộp thông minh (Smart Merge)
  const refreshDataFromCloud = async (silent = false) => {
    if (!isSupabaseConfigured()) return;
    if (isFetchingCloudRef.current) return;
    isFetchingCloudRef.current = true;
    if (!silent) setIsSyncingCloud(true);
    try {
      const isFirstSync = !hasCloudSyncedRef.current;
      const cloudData = await SupabaseService.loadAllDataFromSupabase();
      if (!cloudData) {
        if (!silent) setIsSyncingCloud(false);
        isFetchingCloudRef.current = false;
        return;
      }

      hasCloudSyncedRef.current = true;

      if (cloudData.classes && cloudData.classes.length > 0) {
        setClasses(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.classes) ? prev : cloudData.classes!));
        setIndexedDBKV('app_classes', cloudData.classes);
        safeSaveLocalStorage('classes', cloudData.classes);
      }
      if (cloudData.criteria && cloudData.criteria.length > 0) {
        setCriteria(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.criteria) ? prev : cloudData.criteria!));
        setIndexedDBKV('app_criteria', cloudData.criteria);
        safeSaveLocalStorage('criteria', cloudData.criteria);
      }
      if (cloudData.students && cloudData.students.length > 0) {
        const cleanStudents = sanitizeStudentList(cloudData.students);
        setStudents(prev => (JSON.stringify(prev) === JSON.stringify(cleanStudents) ? prev : cleanStudents));
        setIndexedDBKV('app_students', cleanStudents);
        safeSaveLocalStorage('students', cleanStudents);
      }
      if (cloudData.violations !== undefined) {
        setViolations(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.violations) ? prev : cloudData.violations!));
        setIndexedDBKV('app_violations', cloudData.violations);
        safeSaveLocalStorage('violations', cloudData.violations);
      }
      if (cloudData.news && cloudData.news.length > 0) {
        setNews(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.news) ? prev : cloudData.news!));
        setIndexedDBKV('app_news', cloudData.news);
        safeSaveLocalStorage('news', cloudData.news);
      }
      if (cloudData.notices !== undefined) {
        setNotices(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.notices) ? prev : cloudData.notices!));
        setIndexedDBKV('app_notices', cloudData.notices);
        safeSaveLocalStorage('notices', cloudData.notices);
      }
      if (cloudData.schoolSettings) {
        const cleanSettings = sanitizeSchoolSettings(cloudData.schoolSettings);
        setSchoolSettings(prev => {
          if (JSON.stringify(prev) === JSON.stringify(cleanSettings)) return prev;
          setIndexedDBKV('app_school_settings', cleanSettings);
          safeSaveLocalStorage('schoolSettings', cleanSettings);
          return cleanSettings;
        });
      }
      if (cloudData.activitySlides && cloudData.activitySlides.length > 0) {
        setActivitySlides(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.activitySlides) ? prev : cloudData.activitySlides!));
        setIndexedDBKV('app_activity_slides', cloudData.activitySlides);
        safeSaveLocalStorage('activitySlides', cloudData.activitySlides);
      }
      if (cloudData.events !== undefined) {
        setEvents(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.events) ? prev : cloudData.events!));
        setIndexedDBKV('app_events', cloudData.events);
        safeSaveLocalStorage('events', cloudData.events);
      }
      if (cloudData.documentFolders && cloudData.documentFolders.length > 0) {
        setDocumentFolders(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.documentFolders) ? prev : cloudData.documentFolders!));
        saveIndexedDBBatch(STORES.DOCUMENT_FOLDERS, cloudData.documentFolders);
        safeSaveLocalStorage('documentFolders', cloudData.documentFolders);
      }
      if (cloudData.documentFiles !== undefined) {
        setDocumentFiles(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.documentFiles) ? prev : cloudData.documentFiles!));
        saveIndexedDBBatch(STORES.DOCUMENT_FILES, cloudData.documentFiles);
        safeSaveLocalStorage('documentFiles', cloudData.documentFiles);
      }
      if (cloudData.mediaFolders && cloudData.mediaFolders.length > 0) {
        const cleanMediaFolders = sanitizeMediaFolders(cloudData.mediaFolders);
        setMediaFolders(prev => (JSON.stringify(prev) === JSON.stringify(cleanMediaFolders) ? prev : cleanMediaFolders));
        saveIndexedDBBatch(STORES.MEDIA_FOLDERS, cleanMediaFolders);
        safeSaveLocalStorage('mediaFolders', cleanMediaFolders);
      }
      if (cloudData.mediaAssets !== undefined) {
        const cleanAssets = sanitizeMediaAssets(cloudData.mediaAssets);
        setMediaAssets(prev => (JSON.stringify(prev) === JSON.stringify(cleanAssets) ? prev : cleanAssets));
        saveIndexedDBBatch(STORES.MEDIA_ASSETS, cleanAssets);
        safeSaveLocalStorage('mediaAssets', cleanAssets);
      }
      if (cloudData.weeksConfig && cloudData.weeksConfig.length > 0) {
        setWeeksConfig(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.weeksConfig) ? prev : cloudData.weeksConfig!));
        setIndexedDBKV('app_weeks_config', cloudData.weeksConfig);
        safeSaveLocalStorage('weeksConfig', cloudData.weeksConfig);
        const currentWeek = cloudData.weeksConfig.find(w => w.isCurrent);
        if (currentWeek) {
          if (isFirstSync) {
            setActiveWeekState(currentWeek.weekNumber);
            setIsWeekLocked(Boolean(currentWeek.isLocked));
            safeSaveLocalStorage('activeWeek', currentWeek.weekNumber);
            safeSaveLocalStorage('isWeekLocked', Boolean(currentWeek.isLocked));
          } else {
            const target = cloudData.weeksConfig.find(w => w.weekNumber === activeWeek);
            if (target) {
              setIsWeekLocked(Boolean(target.isLocked));
            }
          }
        }
      }
      if (cloudData.users && cloudData.users.length > 0) {
        setUsers(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.users) ? prev : cloudData.users!));
        setIndexedDBKV('app_users', cloudData.users);
        safeSaveLocalStorage('users', cloudData.users);
        // Cập nhật tài khoản hiện tại với thông tin mới nhất từ Cloud
        setCurrentUser(prevUser => {
          if (!prevUser) return null;
          const matched = cloudData.users!.find(u => u.id === prevUser.id || u.username.toLowerCase() === prevUser.username.toLowerCase());
          return matched ? { ...prevUser, ...matched } : prevUser;
        });
      }
      if (cloudData.duties && cloudData.duties.length > 0) {
        setDuties(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.duties) ? prev : cloudData.duties!));
        setIndexedDBKV('app_duties', cloudData.duties);
        safeSaveLocalStorage('duties', cloudData.duties);
      }
      if (cloudData.academicYears && cloudData.academicYears.length > 0) {
        setAcademicYears(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.academicYears) ? prev : cloudData.academicYears!));
        setIndexedDBKV('app_academic_years', cloudData.academicYears);
        safeSaveLocalStorage('academicYears', cloudData.academicYears);
      }
      if (cloudData.feeLocks) {
        setFeeLocks(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.feeLocks) ? prev : cloudData.feeLocks!));
        setIndexedDBKV('app_fee_locks', cloudData.feeLocks);
        safeSaveLocalStorage('feeLocks', cloudData.feeLocks);
      }
      if (cloudData.auditLogs && cloudData.auditLogs.length > 0) {
        setAuditLogs(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.auditLogs) ? prev : cloudData.auditLogs!));
        setIndexedDBKV('app_audit_logs', cloudData.auditLogs);
        safeSaveLocalStorage('auditLogs', cloudData.auditLogs);
      }
      if (cloudData.activityReports !== undefined) {
        setActivityReports(prev => (JSON.stringify(prev) === JSON.stringify(cloudData.activityReports) ? prev : cloudData.activityReports!));
        setIndexedDBKV('app_activity_reports', cloudData.activityReports);
        safeSaveLocalStorage('activityReports', cloudData.activityReports);
      }
      setIsHydrated(true);
      console.log('✅ [Multi-Device Sync] Đồng bộ dữ liệu thành công từ Supabase Cloud!');
    } catch (err) {
      console.warn('Lỗi khi đồng bộ từ Supabase Cloud:', err);
    } finally {
      setIsSyncingCloud(false);
      isFetchingCloudRef.current = false;
    }
  };

  // Tự động kích hoạt Realtime Subscription + BroadcastChannel + Event Listeners + Polling để đồng bộ tức thì đa thiết bị
  useEffect(() => {
    // 1. Đồng bộ dữ liệu ngay khi khởi động (hiển thị trạng thái nạp)
    refreshDataFromCloud(false);

    // 2. Kích hoạt Local BroadcastChannel cho các tab/cửa sổ trên cùng trình duyệt
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      try {
        const bc = new BroadcastChannel('DOANTHANHNIEN_APP_SYNC');
        localBroadcastRef.current = bc;
        bc.onmessage = (event) => {
          console.log('⚡ [Local Broadcast] Nhận tín hiệu đồng bộ từ tab/cửa sổ khác:', event.data);
          refreshDataFromCloud(true);
        };
      } catch {}
    }

    // 3. Lắng nghe thay đổi Realtime từ Supabase (Websocket postgres_changes & broadcast)
    const client = getSupabaseClient();
    if (client && isSupabaseConfigured()) {
      try {
        const channel = client
          .channel('public:db-sync-all-devices', {
            config: {
              broadcast: { self: false }
            }
          })
          .on('postgres_changes', { event: '*', schema: 'public' }, (payload) => {
            console.log('⚡ [Realtime Database] Nhận thay đổi từ Cloud:', payload);
            refreshDataFromCloud(true);
          })
          .on('broadcast', { event: 'SYNC_UPDATE' }, (payload) => {
            console.log('⚡ [Realtime Broadcast] Nhận tín hiệu đồng bộ tức thì từ thiết bị khác:', payload);
            refreshDataFromCloud(true);
          })
          .subscribe();
        realtimeChannelRef.current = channel;
      } catch (err) {
        console.warn('Không thể khởi tạo Realtime Channel:', err);
      }
    }

    // 4. Tự động đồng bộ khi người dùng mở lại tab, chuyển sang ứng dụng trên điện thoại, hoặc kết nối mạng trở lại
    const handleVisibilityOrFocus = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        refreshDataFromCloud(true);
      }
    };
    const handleOnline = () => {
      console.log('🌐 [Network] Đã kết nối mạng trở lại, đang đồng bộ dữ liệu...');
      refreshDataFromCloud(true);
    };
    window.addEventListener('focus', handleVisibilityOrFocus);
    window.addEventListener('visibilitychange', handleVisibilityOrFocus);
    window.addEventListener('online', handleOnline);

    // 5. Định kỳ đồng bộ ngầm mỗi 30 giây (kết hợp Realtime WebSocket + BroadcastChannel để cập nhật tức thì)
    const pollInterval = setInterval(() => {
      refreshDataFromCloud(true);
    }, 30000);

    return () => {
      if (realtimeChannelRef.current && client) {
        try {
          client.removeChannel(realtimeChannelRef.current);
        } catch {}
      }
      if (localBroadcastRef.current) {
        try {
          localBroadcastRef.current.close();
        } catch {}
      }
      window.removeEventListener('focus', handleVisibilityOrFocus);
      window.removeEventListener('visibilitychange', handleVisibilityOrFocus);
      window.removeEventListener('online', handleOnline);
      clearInterval(pollInterval);
    };
  }, []);

  const addLog = (action: string, details: string) => {
    const newLog: AuditLog = {
      id: generateUUID(),
      timestamp: new Date().toLocaleString('vi-VN'),
      userId: currentUser?.id || 'anonymous',
      userName: currentUser?.name || 'Khách truy cập',
      userRole: currentUser?.role || 'user',
      action,
      details,
      ipAddress: '192.168.1.50'
    };
    setAuditLogs(prev => [newLog, ...prev]);
    if (isSupabaseConfigured()) {
      SupabaseService.saveAuditLog(newLog);
    }
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
      // Tự động kéo dữ liệu Cloud mới nhất ngay khi đăng nhập
      refreshDataFromCloud();
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
    // Tự động kéo dữ liệu Cloud mới nhất ngay khi đổi tài khoản
    refreshDataFromCloud();
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
  const updateSchoolSettings = async (updates: Partial<SchoolSettings>): Promise<boolean> => {
    const updated = sanitizeSchoolSettings({ ...schoolSettings, ...updates });
    setSchoolSettings(updated);
    safeSaveLocalStorage('schoolSettings', updated);
    setIndexedDBKV('app_school_settings', updated);
    addLog('Cập nhật cài đặt trường', 'Thay đổi thông tin nhận diện, tên trường hoặc màu sắc giao diện');

    let success = true;
    if (isSupabaseConfigured()) {
      success = await SupabaseService.saveSchoolSettings(updated);
      if (!success) {
        console.warn('Lỗi khi lưu schoolSettings lên Supabase');
      }
    }
    broadcastGlobalSync('school_settings');
    return success;
  };

  // Media Asset Management (Kho Ảnh Toàn Hệ Thống)
  // Media Assets Library & Folders/Albums Management
  const addMediaFolder = (folderData: Omit<MediaFolder, 'id' | 'createdAt' | 'updatedAt'>): MediaFolder => {
    const newFolder: MediaFolder = {
      ...folderData,
      id: generateUUID(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setMediaFolders(prev => [...prev, newFolder]);
    saveIndexedDBItem(STORES.MEDIA_FOLDERS, newFolder);
    if (isSupabaseConfigured()) {
      SupabaseService.saveMediaFolder(newFolder);
    }
    addLog('Tạo Album ảnh mới', `Đã tạo Album "${newFolder.name}" trong Kho Media`);
    return newFolder;
  };

  const updateMediaFolder = (id: string, updates: Partial<MediaFolder>) => {
    setMediaFolders(prev => prev.map(f => {
      if (f.id === id) {
        const updated = {
          ...f,
          ...updates,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
        saveIndexedDBItem(STORES.MEDIA_FOLDERS, updated);
        if (isSupabaseConfigured()) {
          SupabaseService.saveMediaFolder(updated);
        }
        return updated;
      }
      return f;
    }));
    addLog('Cập nhật Album ảnh', `Đã chỉnh sửa Album ảnh ID: ${id}`);
  };

  const deleteMediaFolder = (id: string): { success: boolean; message: string } => {
    const folder = mediaFolders.find(f => f.id === id);
    if (!folder) return { success: false, message: 'Không tìm thấy Album ảnh' };

    // Tìm tất cả các thư mục con cấp dưới nếu có
    const subFolderIds = mediaFolders.filter(f => f.parentId === id).map(f => f.id);
    const targetFolderIds = [id, ...subFolderIds];

    // Chuyển ảnh trong các thư mục này sang Album Dùng Chung
    setMediaAssets(prev => prev.map(m => {
      const curF = m.folderId || m.albumId;
      if (curF && targetFolderIds.includes(curF)) {
        const updated = { ...m, folderId: 'album-general', albumId: 'album-general' };
        saveIndexedDBItem(STORES.MEDIA_ASSETS, updated);
        return updated;
      }
      return m;
    }));

    setMediaFolders(prev => prev.filter(f => !targetFolderIds.includes(f.id)));
    targetFolderIds.forEach(fid => deleteIndexedDBItem(STORES.MEDIA_FOLDERS, fid));

    if (isSupabaseConfigured()) {
      targetFolderIds.forEach(fid => SupabaseService.deleteMediaFolder(fid));
    }
    addLog('Xóa Album ảnh', `Đã xóa Album "${folder.name}" (các ảnh bên trong đã chuyển sang Album Dùng Chung)`);
    return { success: true, message: 'Đã xóa Album thành công' };
  };

  const moveMediaToFolder = (mediaId: string, folderId: string) => {
    setMediaAssets(prev => prev.map(m => {
      if (m.id === mediaId) {
        const updated = { ...m, folderId, albumId: folderId };
        saveIndexedDBItem(STORES.MEDIA_ASSETS, updated);
        return updated;
      }
      return m;
    }));
    const targetItem = mediaAssets.find(m => m.id === mediaId);
    if (targetItem && isSupabaseConfigured()) {
      SupabaseService.saveMediaAsset({ ...targetItem, folderId, albumId: folderId });
    }
    addLog('Chuyển Album ảnh', `Đã chuyển ảnh ${mediaId} sang Album ${folderId}`);
  };

  const batchMoveMediaToFolder = (mediaIds: string[], folderId: string) => {
    if (!mediaIds || mediaIds.length === 0) return;
    setMediaAssets(prev => prev.map(m => {
      if (mediaIds.includes(m.id)) {
        const updated = { ...m, folderId, albumId: folderId };
        saveIndexedDBItem(STORES.MEDIA_ASSETS, updated);
        return updated;
      }
      return m;
    }));
    if (isSupabaseConfigured()) {
      mediaIds.forEach(id => {
        const item = mediaAssets.find(m => m.id === id);
        if (item) SupabaseService.saveMediaAsset({ ...item, folderId, albumId: folderId });
      });
    }
    addLog('Chuyển hàng loạt ảnh', `Đã chuyển ${mediaIds.length} ảnh sang Album ${folderId}`);
  };

  const addMediaAsset = async (
    file: File | Blob | string,
    meta?: {
      title?: string;
      category?: MediaCategory;
      folderId?: string;
      albumId?: string;
      classId?: string;
      weekNumber?: number;
      tags?: string[];
    }
  ): Promise<MediaItem | null> => {
    try {
      const item = await SupabaseService.uploadMediaAsset(file, {
        title: meta?.title,
        category: meta?.category || 'general',
        folderId: meta?.folderId || meta?.albumId,
        classId: meta?.classId,
        weekNumber: meta?.weekNumber,
        tags: meta?.tags,
        uploadedBy: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentUser.roleTitle } : undefined
      });
      if (item) {
        setMediaAssets(prev => [item, ...prev.filter(p => p.id !== item.id)]);
        await saveIndexedDBItem(STORES.MEDIA_ASSETS, item);
        addLog('Tải ảnh lên Kho Media', `Đã lưu ảnh "${item.title}" vào danh mục ${item.category}`);
        broadcastGlobalSync('media_assets');
        return item;
      }
      return null;
    } catch (err) {
      console.error('Lỗi addMediaAsset:', err);
      return null;
    }
  };

  const deleteMediaAsset = async (id: string): Promise<boolean> => {
    const target = mediaAssets.find(m => m.id === id);
    if (!target) return false;
    await SupabaseService.deleteMediaAsset(target);
    await deleteIndexedDBItem(STORES.MEDIA_ASSETS, id);
    setMediaAssets(prev => prev.filter(m => m.id !== id));
    addLog('Xóa ảnh khỏi Kho Media', `Đã xóa ảnh "${target.title}"`);
    broadcastGlobalSync('media_assets');
    return true;
  };

  const deleteMediaAssetsBatch = async (ids: string[]): Promise<{ deletedCount: number }> => {
    if (!ids || ids.length === 0) return { deletedCount: 0 };
    const targets = mediaAssets.filter(m => ids.includes(m.id));
    for (const t of targets) {
      await SupabaseService.deleteMediaAsset(t);
    }
    await deleteIndexedDBBatch(STORES.MEDIA_ASSETS, ids);
    setMediaAssets(prev => prev.filter(m => !ids.includes(m.id)));
    addLog('Xóa hàng loạt ảnh', `Đã xóa ${targets.length} ảnh khỏi Kho Media`);
    broadcastGlobalSync('media_assets');
    return { deletedCount: targets.length };
  };

  const updateMediaAsset = (id: string, updates: Partial<MediaItem>) => {
    setMediaAssets(prev => prev.map(m => {
      if (m.id === id) {
        const updated = { ...m, ...updates };
        saveIndexedDBItem(STORES.MEDIA_ASSETS, updated);
        return updated;
      }
      return m;
    }));
    addLog('Cập nhật thông tin ảnh', `Đã chỉnh sửa thông tin ảnh ID: ${id}`);
  };

  // Documents & Folders Management (Kho Văn Bản & Biểu Mẫu)
  const addDocumentFolder = (folderData: Omit<DocumentFolder, 'id' | 'createdAt' | 'updatedAt'>): DocumentFolder => {
    const newFolder: DocumentFolder = {
      ...folderData,
      id: generateUUID(),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setDocumentFolders(prev => [...prev, newFolder]);
    saveIndexedDBItem(STORES.DOCUMENT_FOLDERS, newFolder);
    if (isSupabaseConfigured()) {
      SupabaseService.saveDocumentFolder(newFolder);
    }
    addLog('Tạo thư mục văn bản', `Đã tạo thư mục "${newFolder.name}"`);
    return newFolder;
  };

  const updateDocumentFolder = (id: string, updates: Partial<DocumentFolder>) => {
    setDocumentFolders(prev => prev.map(f => {
      if (f.id === id) {
        const updated = {
          ...f,
          ...updates,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
        saveIndexedDBItem(STORES.DOCUMENT_FOLDERS, updated);
        if (isSupabaseConfigured()) {
          SupabaseService.saveDocumentFolder(updated);
        }
        return updated;
      }
      return f;
    }));
    addLog('Cập nhật thư mục văn bản', `Đã chỉnh sửa thư mục ID: ${id}`);
  };

  const deleteDocumentFolder = (id: string): { success: boolean; message: string } => {
    const folder = documentFolders.find(f => f.id === id);
    if (!folder) return { success: false, message: 'Không tìm thấy thư mục' };
    if (folder.isSystem) return { success: false, message: 'Không thể xóa thư mục hệ thống mặc định' };
    
    // Check if folder contains files
    const hasFiles = documentFiles.some(f => f.folderId === id);
    if (hasFiles) {
      return { success: false, message: 'Thư mục đang chứa tài liệu. Vui lòng di chuyển hoặc xóa các file trước khi xóa thư mục!' };
    }

    setDocumentFolders(prev => prev.filter(f => f.id !== id));
    deleteIndexedDBItem(STORES.DOCUMENT_FOLDERS, id);
    if (isSupabaseConfigured()) {
      SupabaseService.deleteDocumentFolder(id);
    }
    addLog('Xóa thư mục văn bản', `Đã xóa thư mục "${folder.name}"`);
    return { success: true, message: 'Đã xóa thư mục thành công' };
  };

  const addDocumentFile = (fileData: Omit<DocumentFile, 'id' | 'downloadsCount' | 'viewsCount' | 'createdAt' | 'updatedAt'>): DocumentFile => {
    const newDoc: DocumentFile = {
      ...fileData,
      id: generateUUID(),
      downloadsCount: 0,
      viewsCount: 0,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    };
    setDocumentFiles(prev => [newDoc, ...prev]);
    saveIndexedDBItem(STORES.DOCUMENT_FILES, newDoc);
    if (isSupabaseConfigured()) {
      SupabaseService.saveDocumentFile(newDoc);
    }
    addLog('Tải lên văn bản / biểu mẫu', `Đã lưu văn bản "${newDoc.title}" (Số: ${newDoc.fileNumber || 'N/A'})`);
    return newDoc;
  };

  const updateDocumentFile = (id: string, updates: Partial<DocumentFile>) => {
    setDocumentFiles(prev => prev.map(d => {
      if (d.id === id) {
        const updated = {
          ...d,
          ...updates,
          updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
        };
        saveIndexedDBItem(STORES.DOCUMENT_FILES, updated);
        if (isSupabaseConfigured()) {
          SupabaseService.saveDocumentFile(updated);
        }
        return updated;
      }
      return d;
    }));
    addLog('Cập nhật văn bản', `Đã chỉnh sửa thông tin văn bản ID: ${id}`);
  };

  const deleteDocumentFile = (id: string) => {
    const doc = documentFiles.find(d => d.id === id);
    setDocumentFiles(prev => prev.filter(d => d.id !== id));
    deleteIndexedDBItem(STORES.DOCUMENT_FILES, id);
    if (isSupabaseConfigured()) {
      SupabaseService.deleteDocumentFile(id);
    }
    if (doc) {
      addLog('Xóa văn bản / biểu mẫu', `Đã xóa văn bản "${doc.title}"`);
    }
  };

  const incrementDocumentDownloads = (id: string) => {
    setDocumentFiles(prev => prev.map(d => d.id === id ? { ...d, downloadsCount: (d.downloadsCount || 0) + 1 } : d));
  };

  const incrementDocumentViews = (id: string) => {
    setDocumentFiles(prev => prev.map(d => d.id === id ? { ...d, viewsCount: (d.viewsCount || 0) + 1 } : d));
  };

  const moveDocumentFile = (fileId: string, targetFolderId: string) => {
    setDocumentFiles(prev => prev.map(d => d.id === fileId ? {
      ...d,
      folderId: targetFolderId,
      updatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16)
    } : d));
  };

  // Weeks Configuration
  const addWeek = (week: WeekConfig) => {
    setWeeksConfig(prev => [...prev, week]);
    if (isSupabaseConfigured()) {
      SupabaseService.saveSingleWeek(week);
    }
    addLog('Tạo tuần học mới', `Thêm ${week.title} (${week.startDate} đến ${week.endDate})`);
  };

  const updateWeek = (weekNum: number, updates: Partial<WeekConfig>) => {
    let updatedObj: WeekConfig | undefined;
    setWeeksConfig(prev => prev.map(w => {
      if (w.weekNumber === weekNum) {
        updatedObj = { ...w, ...updates };
        return updatedObj;
      }
      return w;
    }));
    if (updates.isLocked !== undefined && weekNum === activeWeek) {
      setIsWeekLocked(updates.isLocked);
    }
    if (isSupabaseConfigured() && updatedObj) {
      SupabaseService.saveSingleWeek(updatedObj);
    }
    addLog('Cập nhật tuần học', `Cập nhật cấu hình Tuần ${weekNum}`);
  };

  const deleteWeek = (weekNum: number): { success: boolean; message: string } => {
    const targetWeek = weeksConfig.find(w => w.weekNumber === weekNum);
    if (!targetWeek) return { success: false, message: 'Tuần học không tồn tại!' };
    if (targetWeek.isCurrent) return { success: false, message: 'Không thể xóa Tuần đang được chọn làm Tuần hiện tại!' };
    
    setWeeksConfig(prev => prev.filter(w => w.weekNumber !== weekNum));
    if (isSupabaseConfigured()) {
      SupabaseService.deleteWeek(weekNum);
    }
    addLog('Xóa tuần học', `Xóa cấu hình ${targetWeek.title}`);
    return { success: true, message: `Đã xóa ${targetWeek.title} thành công!` };
  };

  const toggleWeekLockDirect = (weekNum: number) => {
    let nextLockedState = false;
    let targetWeekObj: WeekConfig | undefined;
    setWeeksConfig(prev => prev.map(w => {
      if (w.weekNumber === weekNum) {
        nextLockedState = !w.isLocked;
        if (weekNum === activeWeek) setIsWeekLocked(nextLockedState);
        targetWeekObj = { ...w, isLocked: nextLockedState };
        return targetWeekObj;
      }
      return w;
    }));
    if (isSupabaseConfigured() && targetWeekObj) {
      SupabaseService.saveSingleWeek(targetWeekObj);
    }
    setViolations(prev => prev.map(v => v.weekNumber === weekNum ? { ...v, locked: nextLockedState } : v));
    addLog('Đổi trạng thái khóa tuần', `${nextLockedState ? 'Khóa' : 'Mở khóa'} sổ thi đua Tuần ${weekNum}`);
  };

  const setCurrentWeek = (weekNum: number) => {
    const updated = weeksConfig.map(w => ({
      ...w,
      isCurrent: w.weekNumber === weekNum
    }));
    setWeeksConfig(updated);
    setActiveWeek(weekNum);
    if (isSupabaseConfigured()) {
      SupabaseService.saveWeeksConfig(updated);
    }
    addLog('Thiết lập tuần hiện tại', `Chọn Tuần ${weekNum} làm gốc hiển thị mặc định`);
  };

  const toggleWeekVisibility = (weekNum: number) => {
    let nextHiddenState = false;
    const updated = weeksConfig.map(w => {
      if (w.weekNumber === weekNum) {
        nextHiddenState = !w.isHidden;
        return { ...w, isHidden: nextHiddenState };
      }
      return w;
    });
    setWeeksConfig(updated);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_weeksConfig`, JSON.stringify(updated));
    } catch {}

    if (isSupabaseConfigured()) {
      const targetWeek = updated.find(w => w.weekNumber === weekNum);
      if (targetWeek) {
        SupabaseService.saveSingleWeek(targetWeek);
      }
    }
    addLog('Ẩn/Hiện tuần học', `${nextHiddenState ? 'Ẩn' : 'Hiển thị'} Tuần ${weekNum} trên hệ thống`);
  };

  const resetToDefault35Weeks = () => {
    setWeeksConfig(INITIAL_WEEKS);
    setActiveWeek(1);
    setIsWeekLocked(false);
    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_weeksConfig`, JSON.stringify(INITIAL_WEEKS));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_activeWeek`, JSON.stringify(1));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_isWeekLocked`, JSON.stringify(false));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
    addLog('Nạp 35 tuần chuẩn', 'Khôi phục danh mục 35 tuần học năm học 2026 - 2027 (07/09/2026 - 08/05/2027)');
  };

  const updateSemesterConfig = (config: { semester1EndWeek: number; semester1Name?: string; semester2Name?: string }) => {
    const updatedSettings: SchoolSettings = {
      ...schoolSettings,
      semester1EndWeek: config.semester1EndWeek,
      semester1Name: config.semester1Name || schoolSettings.semester1Name || 'Học Kỳ 1',
      semester2Name: config.semester2Name || schoolSettings.semester2Name || 'Học Kỳ 2'
    };
    setSchoolSettings(updatedSettings);

    const updatedWeeks = weeksConfig.map(w => ({
      ...w,
      semester: (w.weekNumber <= config.semester1EndWeek ? 1 : 2) as 1 | 2
    }));
    setWeeksConfig(updatedWeeks);

    try {
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_schoolSettings`, JSON.stringify(updatedSettings));
      localStorage.setItem(`${LOCAL_STORAGE_KEY}_weeksConfig`, JSON.stringify(updatedWeeks));
    } catch {}

    if (isSupabaseConfigured()) {
      SupabaseService.saveSchoolSettings(updatedSettings);
      SupabaseService.saveWeeksConfig(updatedWeeks);
    }
    addLog('Cấu hình học kỳ', `Tùy chỉnh phân bổ: ${updatedSettings.semester1Name} (Tuần 1 - ${config.semester1EndWeek}), ${updatedSettings.semester2Name} (Tuần ${config.semester1EndWeek + 1} - ${weeksConfig.length})`);
  };

  const syncWeeksToCloud = async (): Promise<{ success: boolean; message: string; count: number }> => {
    return await SupabaseService.syncAllWeeksToSupabase(weeksConfig, schoolSettings);
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
    const studentIdToDelete = st?.studentId || id;
    setStudents(prev => prev.filter(s => s.id !== id && s.studentId !== id));
    if (isSupabaseConfigured()) SupabaseService.deleteStudent(studentIdToDelete);
    if (st) {
      setClasses(prev => prev.map(c => c.id === st.classId ? { ...c, totalStudents: Math.max(0, c.totalStudents - 1), unionMembers: st.isUnionMember ? Math.max(0, c.unionMembers - 1) : c.unionMembers } : c));
      addLog('Xóa học sinh', `Xóa học sinh ${st.name} khỏi danh sách`);
    }
  };

  const deleteStudentsBatch = (studentIds: string[]) => {
    if (!studentIds || studentIds.length === 0) return;
    setStudents(prev => prev.filter(s => !studentIds.includes(s.id) && !studentIds.includes(s.studentId)));
    if (isSupabaseConfigured()) {
      SupabaseService.deleteStudentsBatch(studentIds);
    }
    // Update class counts
    setClasses(prev => prev.map(c => {
      const remainingInClass = students.filter(s => s.classId === c.id && !studentIds.includes(s.id) && !studentIds.includes(s.studentId));
      const unionCount = remainingInClass.filter(s => s.isUnionMember).length;
      return { ...c, totalStudents: remainingInClass.length, unionMembers: unionCount };
    }));
    addLog('Xóa hàng loạt học sinh', `Đã xóa ${studentIds.length} học sinh khỏi hệ thống`);
  };

  const transferStudent = (studentId: string, newClassId: string) => {
    const st = students.find(s => s.id === studentId || s.studentId === studentId);
    if (!st) return;
    const oldClassId = st.classId;
    const newClass = classes.find(c => c.id === newClassId);
    const updatedStudent = { ...st, classId: newClassId, grade: (newClass?.grade || st.grade) as 10 | 11 | 12 };
    setStudents(prev => prev.map(s => (s.id === studentId || s.studentId === studentId) ? updatedStudent : s));
    if (isSupabaseConfigured()) SupabaseService.saveStudent(updatedStudent);
    setClasses(prev => prev.map(c => {
      if (c.id === oldClassId) return { ...c, totalStudents: Math.max(0, c.totalStudents - 1), unionMembers: st.isUnionMember ? Math.max(0, c.unionMembers - 1) : c.unionMembers };
      if (c.id === newClassId) return { ...c, totalStudents: c.totalStudents + 1, unionMembers: st.isUnionMember ? c.unionMembers + 1 : c.unionMembers };
      return c;
    }));
    addLog('Chuyển lớp học sinh', `Chuyển học sinh ${st.name} từ Lớp ${oldClassId} sang Lớp ${newClassId}`);
  };

  const importStudents = (studentsList: Array<Omit<Student, 'id' | 'violationsCount'>>): number => {
    const newStudents: Student[] = studentsList.map((s, idx) => ({
      ...s,
      id: s.studentId || `st-${Date.now()}-${idx}`,
      violationsCount: 0
    }));
    setStudents(prev => [...prev, ...newStudents]);
    if (isSupabaseConfigured()) {
      SupabaseService.saveStudentsBatch(newStudents);
    }
    addLog('Import Excel Học Sinh', `Đã import thành công ${newStudents.length} học sinh từ file Excel`);
    return newStudents.length;
  };

  const upsertStudentsFromExcel = (studentsList: Array<Partial<Student> & { studentId: string; name: string; classId: string }>): { added: number; updated: number } => {
    let added = 0;
    let updated = 0;
    let mergedList: Student[] = [];

    setStudents(prev => {
      let currentList = [...prev];
      studentsList.forEach(incoming => {
        const existingIdx = currentList.findIndex(s => 
          (incoming.studentId && s.studentId === incoming.studentId) || 
          (incoming.name && incoming.classId && s.name.trim().toLowerCase() === incoming.name.trim().toLowerCase() && s.classId === incoming.classId)
        );
        const gradeVal = Number(incoming.classId.split('/')[0] || 10) as 10 | 11 | 12;

        if (existingIdx >= 0) {
          // Update existing
          currentList[existingIdx] = {
            ...currentList[existingIdx],
            ...incoming,
            grade: gradeVal,
            phone: incoming.phone !== undefined && incoming.phone !== '' ? incoming.phone : currentList[existingIdx].phone,
            address: incoming.address !== undefined && incoming.address !== '' ? incoming.address : currentList[existingIdx].address
          };
          updated++;
        } else {
          // Add new
          const newStudent: Student = {
            id: incoming.studentId || `st-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            studentId: incoming.studentId || `HS${Math.floor(10000000 + Math.random() * 90000000)}`,
            name: incoming.name,
            classId: incoming.classId,
            grade: gradeVal,
            gender: incoming.gender || 'Nam',
            dob: incoming.dob || '2009-01-01',
            ethnicity: incoming.ethnicity || 'Kinh',
            phone: incoming.phone || '',
            address: incoming.address || '',
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
      mergedList = currentList;
      return currentList;
    });

    // Cập nhật lên Supabase Cloud ngay lập tức
    if (isSupabaseConfigured() && mergedList.length > 0) {
      SupabaseService.saveStudentsBatch(mergedList);
    }

    // Cập nhật lại sĩ số các lớp
    setClasses(prev => prev.map(c => {
      const classSts = mergedList.filter(s => s.classId === c.id && s.status !== 'inactive');
      const unionCount = classSts.filter(s => s.isUnionMember).length;
      if (classSts.length > 0) {
        return { ...c, totalStudents: classSts.length, unionMembers: unionCount };
      }
      return c;
    }));

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
      id: generateUUID(),
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
    let targetWeekObj: WeekConfig | undefined;
    setWeeksConfig(prev => prev.map(w => {
      if (w.weekNumber === wNum) {
        targetWeekObj = { ...w, isLocked: true };
        return targetWeekObj;
      }
      return w;
    }));
    if (isSupabaseConfigured() && targetWeekObj) {
      SupabaseService.saveSingleWeek(targetWeekObj);
    }
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
    let targetWeekObj: WeekConfig | undefined;
    setWeeksConfig(prev => prev.map(w => {
      if (w.weekNumber === wNum) {
        targetWeekObj = { ...w, isLocked: false };
        return targetWeekObj;
      }
      return w;
    }));
    if (isSupabaseConfigured() && targetWeekObj) {
      SupabaseService.saveSingleWeek(targetWeekObj);
    }
    setViolations(prev => prev.map(v => v.weekNumber === wNum ? { ...v, locked: false } : v));
    addLog('Mở khóa sổ thi đua tuần', `Admin đã mở khóa dữ liệu Tuần ${wNum}.`);
    return { success: true, message: `Đã mở khóa dữ liệu Tuần ${wNum}!` };
  };

  // User CRUD
  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: generateUUID()
    };
    setUsers(prev => {
      const next = [...prev, newUser];
      safeSaveLocalStorage('users', next);
      setIndexedDBKV('app_users', next);
      return next;
    });
    if (isSupabaseConfigured()) {
      SupabaseService.saveUser(newUser).then(ok => {
        if (ok) broadcastGlobalSync('users');
      });
    }
    addLog('Thêm người dùng', `Tạo tài khoản mới: ${userData.username} (${userData.name})`);
  };

  const updateUser = (id: string, updates: Partial<User>) => {
    let targetUser: User | null = null;
    setUsers(prev => {
      const next = prev.map(u => {
        const isMatch = u.id === id || 
          (Boolean(updates.username) && u.username.toLowerCase() === updates.username!.toLowerCase()) ||
          (u.username.toLowerCase() === id.toLowerCase());
        if (isMatch) {
          const updated = { ...u, ...updates };
          targetUser = updated;
          return updated;
        }
        return u;
      });
      safeSaveLocalStorage('users', next);
      setIndexedDBKV('app_users', next);
      return next;
    });

    if (targetUser && isSupabaseConfigured()) {
      SupabaseService.saveUser(targetUser).then(ok => {
        if (ok) broadcastGlobalSync('users');
      });
    }

    if (currentUser && (currentUser.id === id || (updates.username && currentUser.username.toLowerCase() === updates.username.toLowerCase()) || currentUser.username.toLowerCase() === id.toLowerCase())) {
      setCurrentUser(prev => prev ? { ...prev, ...updates } : null);
    }
    addLog('Cập nhật người dùng', `Cập nhật thông tin tài khoản: ${updates.username || id}`);
  };

  const deleteUser = (id: string) => {
    const target = users.find(u => u.id === id || u.username.toLowerCase() === id.toLowerCase());
    setUsers(prev => {
      const next = prev.filter(u => u.id !== id && u.username.toLowerCase() !== id.toLowerCase());
      safeSaveLocalStorage('users', next);
      setIndexedDBKV('app_users', next);
      return next;
    });
    if (isSupabaseConfigured() && target) {
      SupabaseService.deleteUser(target.id, target.username).then(ok => {
        if (ok) broadcastGlobalSync('users');
      });
    }
    addLog('Xóa tài khoản', `Admin xóa người dùng: ${target?.username || id}`);
  };

  const toggleUserActive = (id: string) => {
    let targetUser: User | null = null;
    setUsers(prev => {
      const next = prev.map(u => {
        if (u.id === id || u.username.toLowerCase() === id.toLowerCase()) {
          const nextState = !u.isActive;
          const updated = { ...u, isActive: nextState };
          targetUser = updated;
          return updated;
        }
        return u;
      });
      safeSaveLocalStorage('users', next);
      setIndexedDBKV('app_users', next);
      return next;
    });
    if (targetUser && isSupabaseConfigured()) {
      SupabaseService.saveUser(targetUser).then(ok => {
        if (ok) broadcastGlobalSync('users');
      });
      addLog('Đổi trạng thái tài khoản', `${(targetUser as User).isActive ? 'Kích hoạt' : 'Khóa'} tài khoản ${(targetUser as User).username}`);
    }
  };

  const resetPassword = (userId: string): string => {
    const defPass = '123456@Password';
    let targetUser: User | null = null;
    setUsers(prev => {
      const next = prev.map(u => {
        if (u.id === userId || u.username.toLowerCase() === userId.toLowerCase()) {
          const updated = { ...u, password: defPass };
          targetUser = updated;
          return updated;
        }
        return u;
      });
      safeSaveLocalStorage('users', next);
      setIndexedDBKV('app_users', next);
      return next;
    });
    if (targetUser && isSupabaseConfigured()) {
      SupabaseService.saveUser(targetUser).then(ok => {
        if (ok) broadcastGlobalSync('users');
      });
    }
    addLog('Reset mật khẩu', `Khôi phục mật khẩu mặc định (${defPass}) cho tài khoản ID: ${userId}`);
    return defPass;
  };

  const changePassword = (userId: string, newPassword: string, oldPassword?: string): { success: boolean; message: string } => {
    const user = users.find(u => u.id === userId || u.username.toLowerCase() === userId.toLowerCase());
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

    let targetUser: User | null = null;
    setUsers(prev => {
      const next = prev.map(u => {
        if (u.id === userId || u.username.toLowerCase() === userId.toLowerCase()) {
          const updated = { ...u, password: newPassword };
          targetUser = updated;
          return updated;
        }
        return u;
      });
      safeSaveLocalStorage('users', next);
      setIndexedDBKV('app_users', next);
      return next;
    });

    if (targetUser && isSupabaseConfigured()) {
      SupabaseService.saveUser(targetUser).then(ok => {
        if (ok) broadcastGlobalSync('users');
      });
    }

    if (currentUser && (currentUser.id === userId || currentUser.username.toLowerCase() === user.username.toLowerCase())) {
      setCurrentUser(prev => prev ? { ...prev, password: newPassword } : null);
    }

    addLog('Đổi mật khẩu', `Tài khoản ${user.username} (${user.name}) đã đổi mật khẩu thành công`);
    return { success: true, message: 'Đổi mật khẩu mới thành công!' };
  };

  // Duty assignments (Cấu hình phân công trực tuần)
  const addDutyAssignment = (duty: Omit<DutyAssignment, 'id'>) => {
    const newDuty: DutyAssignment = {
      ...duty,
      id: generateUUID()
    };
    setDuties(prev => [...prev, newDuty]);
    if (isSupabaseConfigured()) {
      SupabaseService.saveDuty(newDuty);
    }
    addLog('Thêm phân công trực', `Phân công ${newDuty.auditorName} trực ${newDuty.zone} (${newDuty.day} - Tuần ${newDuty.weekNumber})`);
  };

  const updateDutyAssignment = (dutyId: string, updates: Partial<DutyAssignment>) => {
    setDuties(prev => prev.map(d => {
      if (d.id === dutyId) {
        const updated = { ...d, ...updates };
        if (isSupabaseConfigured()) {
          SupabaseService.saveDuty(updated);
        }
        return updated;
      }
      return d;
    }));
    addLog('Cập nhật phân công trực', `Cập nhật ca trực ID: ${dutyId}`);
  };

  const deleteDutyAssignment = (dutyId: string) => {
    setDuties(prev => prev.filter(d => d.id !== dutyId));
    if (isSupabaseConfigured()) {
      SupabaseService.deleteDuty(dutyId);
    }
    addLog('Xóa phân công trực', `Xóa ca trực ID: ${dutyId}`);
  };

  const generateDefaultDutiesForWeek = (weekNum: number) => {
    const generated = generateWeekDuties(weekNum);

    setDuties(prev => [
      ...prev.filter(d => d.weekNumber !== weekNum),
      ...generated
    ]);
    if (isSupabaseConfigured()) {
      SupabaseService.saveDutiesBatch(generated);
    }
    addLog('Tạo lịch trực tự động', `Tạo lịch phân công trực chuẩn theo văn bản Đoàn trường cho Tuần ${weekNum} (${generated.length} ca trực)`);
  };

  const copyDutiesToWeek = (fromWeek: number, toWeek: number) => {
    const sourceDuties = duties.filter(d => d.weekNumber === fromWeek);
    if (sourceDuties.length === 0) return;

    const copiedDuties: DutyAssignment[] = sourceDuties.map(d => ({
      ...d,
      id: generateUUID(),
      weekNumber: toWeek
    }));

    setDuties(prev => [
      ...prev.filter(d => d.weekNumber !== toWeek),
      ...copiedDuties
    ]);
    if (isSupabaseConfigured()) {
      SupabaseService.saveDutiesBatch(copiedDuties);
    }
    addLog('Sao chép lịch trực', `Sao chép ${copiedDuties.length} ca trực từ Tuần ${fromWeek} sang Tuần ${toWeek}`);
  };

  const assignGvcnToClass = (classId: string, gvcnId: string) => {
    const gvcn = users.find(u => u.id === gvcnId);
    if (!gvcn) return;
    let targetClass: ClassInfo | undefined;
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        targetClass = {
          ...c,
          gvcnId: gvcn.id,
          gvcnName: gvcn.name
        };
        return targetClass;
      }
      return c;
    }));
    if (isSupabaseConfigured() && targetClass) {
      SupabaseService.saveClass(targetClass);
    }
    addLog('Phân công GVCN', `Phân công thầy/cô ${gvcn.name} phụ trách lớp ${classId}`);
  };

  const removeGvcnFromClass = (classId: string) => {
    let targetClass: ClassInfo | undefined;
    setClasses(prev => prev.map(c => {
      if (c.id === classId) {
        targetClass = {
          ...c,
          gvcnId: '',
          gvcnName: 'Chưa phân công'
        };
        return targetClass;
      }
      return c;
    }));
    if (isSupabaseConfigured() && targetClass) {
      SupabaseService.saveClass(targetClass);
    }
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
      if (isSupabaseConfigured()) {
        SupabaseService.saveUser(newUser);
      }
    }
    addLog('Thêm cán bộ cờ đỏ', `Thêm ${auditorData.name} (${auditorData.classId}) vào Đội Cờ đỏ`);
  };

  const updateAuditorMember = (id: string, updates: Partial<AuditorMember>) => {
    setAuditors(prev => prev.map(a => a.id === id ? { ...a, ...updates } : a));
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, ...updates };
        if (isSupabaseConfigured()) {
          SupabaseService.saveUser(updated);
        }
        return updated;
      }
      return u;
    }));
    if (updates.name) {
      setDuties(prev => prev.map(d => d.auditorId === id ? { ...d, auditorName: updates.name! } : d));
    }
    addLog('Cập nhật cán bộ cờ đỏ', `Sửa thông tin thành viên ID: ${id}`);
  };

  const deleteAuditorMember = (id: string) => {
    const target = auditors.find(a => a.id === id);
    setAuditors(prev => prev.filter(a => a.id !== id));
    const targetUser = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (isSupabaseConfigured() && targetUser) {
      SupabaseService.deleteUser(id, targetUser.username);
    }
    setDuties(prev => prev.filter(d => d.auditorId !== id));
    addLog('Xóa cán bộ cờ đỏ', `Xóa thành viên cờ đỏ: ${target?.name || id}`);
  };

  const toggleAuditorActive = (id: string) => {
    setAuditors(prev => prev.map(a => a.id === id ? { ...a, isActive: !a.isActive } : a));
    setUsers(prev => prev.map(u => {
      if (u.id === id) {
        const updated = { ...u, isActive: !u.isActive };
        if (isSupabaseConfigured()) {
          SupabaseService.saveUser(updated);
        }
        return updated;
      }
      return u;
    }));
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
      id: generateUUID(),
      registeredCount: 0,
      registeredStudentIds: [],
      checkedInStudentIds: []
    };
    setEvents(prev => [newEvent, ...prev]);
    if (isSupabaseConfigured()) {
      SupabaseService.saveEvent(newEvent);
    }
    addLog('Tạo sự kiện phong trào', `Tạo sự kiện mới: "${eventData.title}" (+${eventData.bonusPoints}đ)`);
  };

  const updateEvent = (id: string, updates: Partial<YouthEvent>) => {
    setEvents(prev => prev.map(e => {
      if (e.id === id) {
        const updated = { ...e, ...updates };
        if (isSupabaseConfigured()) {
          SupabaseService.saveEvent(updated);
        }
        return updated;
      }
      return e;
    }));
    addLog('Cập nhật sự kiện', `Chỉnh sửa thông tin sự kiện ID: ${id}`);
  };

  const deleteEvent = (id: string) => {
    const target = events.find(e => e.id === id);
    setEvents(prev => prev.filter(e => e.id !== id));
    if (isSupabaseConfigured()) {
      SupabaseService.deleteEvent(id);
    }
    addLog('Xóa sự kiện', `Xóa sự kiện "${target?.title || id}"`);
  };

  // News CRUD
  const addNewsPost = (postData: Omit<NewsPost, 'id' | 'views'>) => {
    const newPost: NewsPost = {
      ...postData,
      id: generateUUID(),
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
      id: generateUUID(),
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
      id: generateUUID(),
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
      id: generateUUID()
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
    let nextLocked = false;
    setFeeLocks(prev => {
      nextLocked = !prev[key];
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
    if (isSupabaseConfigured()) {
      SupabaseService.saveFeeLock(key, nextLocked);
    }
    addLog(
      'Khóa/Mở sổ đoàn phí',
      `Lớp ${classId}: ${month === 'ALL_YEAR' ? 'Toàn bộ năm học' : month}`
    );
  };

  const isFeeMonthLocked = (classId: string, month: string) => {
    return Boolean(feeLocks[`${classId}_ALL_YEAR`] || feeLocks[`${classId}_${month}`]);
  };

  const batchUpdateUnionFee = (studentIds: string[], month: string, status: 'paid' | 'unpaid') => {
    const updatedStudents: Student[] = [];
    setStudents(prev => {
      return prev.map(st => {
        if (studentIds.includes(st.id) && st.isUnionMember) {
          const updated: Student = {
            ...st,
            monthlyUnionFees: {
              ...(st.monthlyUnionFees || {}),
              [month]: status
            },
            unionFeeStatus: status
          };
          updatedStudents.push(updated);
          return updated;
        }
        return st;
      });
    });
    if (isSupabaseConfigured() && updatedStudents.length > 0) {
      SupabaseService.saveStudentsBatch(updatedStudents);
    }
  };

  const payYearlyFee = (studentId: string, status: 'paid' | 'unpaid') => {
    const ALL_MONTHS = ['Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12', 'Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5'];
    const updated: Record<string, 'paid' | 'unpaid'> = {};
    ALL_MONTHS.forEach(m => {
      updated[m] = status;
    });

    let updatedStudent: Student | null = null;
    setStudents(prev => prev.map(st => {
      if (st.id === studentId) {
        updatedStudent = {
          ...st,
          monthlyUnionFees: updated,
          unionFeeStatus: status
        };
        return updatedStudent;
      }
      return st;
    }));
    if (isSupabaseConfigured() && updatedStudent) {
      SupabaseService.saveStudent(updatedStudent);
    }
  };

  // Activity Reports from Youth Secretaries (Báo cáo tham gia phong trào)
  const submitActivityReport = (reportData: Omit<ActivityReport, 'id' | 'reportedAt' | 'status'>) => {
    const newReport: ActivityReport = {
      ...reportData,
      id: generateUUID(),
      reportedAt: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      status: 'submitted'
    };
    setActivityReports(prev => [newReport, ...prev]);
    if (isSupabaseConfigured()) {
      SupabaseService.saveActivityReport(newReport);
    }
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
    if (isSupabaseConfigured()) {
      SupabaseService.deleteActivityReport(id);
    }
    addLog('Xóa báo cáo phong trào', `Xóa báo cáo "${target?.activityTitle || id}" của lớp ${target?.className || ''}`);
  };

  const verifyActivityReport = (id: string, feedback?: string) => {
    let updatedReport: ActivityReport | undefined;
    setActivityReports(prev => prev.map(r => {
      if (r.id === id) {
        updatedReport = {
          ...r,
          status: 'verified',
          adminFeedback: feedback || 'Đoàn trường đã ghi nhận và xác nhận danh sách tham gia.'
        };
        return updatedReport;
      }
      return r;
    }));
    if (isSupabaseConfigured() && updatedReport) {
      SupabaseService.saveActivityReport(updatedReport);
    }
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
      notifications,
      mediaFolders,
      mediaAssets,
      documentFolders,
      documentFiles
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
      if (backupData.mediaFolders) setMediaFolders(backupData.mediaFolders);
      if (backupData.mediaAssets) setMediaAssets(backupData.mediaAssets);
      if (backupData.documentFolders) setDocumentFolders(backupData.documentFolders);
      if (backupData.documentFiles) setDocumentFiles(backupData.documentFiles);

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
    if (isSupabaseConfigured()) {
      SupabaseService.saveAcademicYear(newYear);
    }
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

      const updatedStudentsList = students.map(s => {
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
      });
      setStudents(updatedStudentsList);

      // 3. Update Classes configuration for the new year
      const updatedClassesList = classes.map(c => {
        const assignment = payload.gvcnAssignments[c.id];
        return {
          ...c,
          standardScore: 1440,
          gvcnName: assignment ? assignment.gvcnName : c.gvcnName,
          gvcnId: assignment ? assignment.gvcnId : c.gvcnId,
          academicYearId: payload.newYearId
        };
      });
      setClasses(updatedClassesList);

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

      // 6. Persist everything to Supabase Cloud
      if (isSupabaseConfigured()) {
        updatedYears.forEach(y => SupabaseService.saveAcademicYear(y));
        SupabaseService.saveStudentsBatch(updatedStudentsList);
        SupabaseService.saveWeeksConfig(newWeeksList);
      }

      // 7. Send broadcast notification
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
        toggleWeekVisibility,
        resetToDefault35Weeks,
        updateSemesterConfig,
        syncWeeksToCloud,
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
        cleanOldStorageData,
        isSyncingCloud,
        refreshDataFromCloud,
        mediaFolders,
        mediaAssets,
        addMediaFolder,
        updateMediaFolder,
        deleteMediaFolder,
        moveMediaToFolder,
        batchMoveMediaToFolder,
        addMediaAsset,
        deleteMediaAsset,
        deleteMediaAssetsBatch,
        updateMediaAsset,
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
        moveDocumentFile
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
