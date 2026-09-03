export type Role = 'admin' | 'manager' | 'auditor' | 'youth_secretary' | 'user';

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  roleTitle: string;
  avatar?: string;
  classId?: string; // For GVCN, Bí thư, Học sinh (e.g. '10/1')
  assignedZone?: string; // For Cờ đỏ (e.g. 'Khối 10')
  phone?: string;
  email?: string;
  isActive: boolean;
  points?: number; // Youth activity points for students
  rankTitle?: string; // e.g. "Đoàn viên Tích cực", "Đoàn viên Xuất sắc"
  joinedDate?: string;
  studentId?: string;
}

export interface Student {
  id: string;
  studentId: string; // e.g. "HS20241001"
  name: string;
  classId: string; // "10/1"
  grade: 10 | 11 | 12;
  gender: 'Nam' | 'Nữ';
  dob: string;
  ethnicity: string; // "Kinh", "Cơ Tu", "Tày", "Nùng", v.v.
  phone?: string;
  address?: string; // Địa chỉ liên hệ / Thường trú
  isUnionMember: boolean; // Đã kết nạp Đoàn chưa
  unionCardNumber?: string; // Số thẻ đoàn / Mã đoàn viên
  unionPosition?: string; // Chức vụ Đoàn (Bí thư, Phó Bí thư, UV BCH, Đoàn viên, Cán bộ Cờ đỏ...)
  unionJoinedDate?: string; // Ngày vào Đoàn
  unionJoinedPlace?: string; // Nơi kết nạp Đoàn
  unionFeeStatus?: 'paid' | 'unpaid'; // Tình trạng đoàn phí (Đã nộp / Chưa nộp)
  monthlyUnionFees?: Record<string, 'paid' | 'unpaid'>; // Tình trạng nộp đoàn phí theo từng tháng
  unionBookletStatus?: 'submitted' | 'not_submitted'; // Sổ đoàn (Đã nộp / Chưa nộp)
  conductRating?: 'Xuất sắc' | 'Khá' | 'Trung bình' | 'Yếu'; // Đánh giá xếp loại Đoàn viên
  customNotes?: string; // Ghi chú quản lý bổ sung
  points: number; // Điểm phong trào
  rankTitle: string; // Cấp bậc đoàn viên
  violationsCount: number;
  status: 'active' | 'archived' | 'graduated' | 'transferred' | 'inactive';
}

export interface ClassInfo {
  id: string; // '10/1', '10/2', ..., '12/6'
  name: string; // 'Lớp 10/1'
  grade: 10 | 11 | 12;
  gvcnName: string;
  gvcnId: string;
  bithuName: string;
  bithuId: string;
  totalStudents: number;
  unionMembers: number; // Số đoàn viên
  standardScore: number; // 1440
  isArchived?: boolean; // Lưu trữ
  academicYearId?: string; // e.g. "2025_2026"
}

export type DayOfWeek = 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7';

export interface Criterion {
  id: string; // '1.1', '1.2', '2.1', ...
  groupId: 'I.1' | 'I.2' | 'I.3' | 'I.4';
  groupName: string; // 'Chuyên cần', 'Vệ sinh', 'Nề nếp tự quản', 'Tác phong'
  groupStandardScore: number; // 40, 30, 65, 90
  code: string;
  name: string;
  type: 'deduction' | 'bonus';
  points: number; // e.g. 1, 2, 5
  unit: string; // 'đ / HS', 'đ / HS / buổi', 'đ / buổi', 'đ / lần'
  isSevere?: boolean; // Lỗi nghiêm trọng
  isEnabled: boolean;
  description?: string;
}

export type ViolationStatus = 'pending' | 'accepted' | 'appealed' | 'rejected_appeal' | 'approved_appeal' | 'cancelled';

export interface Violation {
  id: string;
  classId: string;
  className: string;
  day: DayOfWeek;
  session?: 'morning' | 'afternoon' | 'Sáng' | 'Chiều'; // Buổi sáng hoặc Buổi chiều
  date: string;
  weekNumber: number;
  criterionId: string;
  criterionName: string;
  groupName: string;
  quantity: number;
  pointsDeducted: number; // Điểm trừ
  bonusPoints?: number; // Điểm thưởng cộng thêm (nếu là điểm thưởng)
  type?: 'deduction' | 'bonus';
  studentNames?: string[]; // Học sinh vi phạm (nếu có)
  note?: string;
  proofImages: string[];
  reportedBy: {
    id: string;
    name: string;
    role: string;
  };
  reportedAt: string;
  status: ViolationStatus;
  appeal?: {
    reason: string;
    proofImages: string[];
    appealedBy: string;
    appealedAt: string;
    adminResponse?: string;
    resolvedAt?: string;
    resolvedBy?: string;
  };
  locked: boolean;
  academicYearId?: string;
}

export interface DayScore {
  standard: number; // 240
  deduction: number;
  bonus: number;
  final: number;
}

export interface ClassWeeklyScore {
  classId: string;
  className: string;
  grade: 10 | 11 | 12;
  weekNumber: number;
  standardScore: number; // 1440
  dailyScores: Record<DayOfWeek, DayScore>;
  totalDeduction: number;
  totalBonus: number;
  finalScore: number;
  rank: number;
  previousRank: number;
  trend: 'up' | 'down' | 'same';
  rating: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Trung bình' | 'Yếu';
  violationCount: number;
  resolvedAppealCount: number;
}

export interface DutyZone {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}

export interface AuditorMember {
  id: string;
  name: string;
  classId: string;
  phone?: string;
  assignedZone?: string;
  defaultShiftTime?: string;
  isActive: boolean;
}

export interface DutyAssignment {
  id: string;
  weekNumber: number;
  day: DayOfWeek;
  zone: string; // Dynamic zone name
  auditorId: string;
  auditorName: string;
  auditorClass: string;
  shiftTime: string; // e.g. '06:45 - 07:15 & 11:15 - 11:45'
  isLiveNow?: boolean;
}

export interface YouthEvent {
  id: string;
  title: string;
  description: string;
  category: 'Phong trào' | 'Tình nguyện' | 'Thể thao' | 'Học thuật' | 'Văn nghệ';
  thumbnail: string;
  location: string;
  startDate: string;
  endDate: string;
  bonusPoints: number;
  maxSlots: number;
  registeredCount: number;
  registeredStudentIds: string[];
  checkedInStudentIds: string[];
  isRegistrationOpen: boolean;
  qrCodeValue: string;
}

export interface NewsPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  author: string;
  authorRole: string;
  publishDate: string;
  isPinned: boolean;
  isHidden?: boolean; // Ẩn khỏi trang chủ
  status?: 'Published' | 'Hidden'; // Trạng thái hiển thị theo chuẩn Database
  category?: 'news' | 'announcement'; // Phân biệt: Bản tin / Hoạt động vs Thông báo / Chỉ đạo
  urgency?: 'normal' | 'urgent' | 'critical'; // Mức độ khẩn: Bình thường / Khẩn cấp / Hỏa tốc
  tags: string[];
  views: number;
  attachments?: Array<{
    name: string;
    url: string;
    size?: string;
    type?: string;
  }>;
}

export interface TaskNotice {
  id: string;
  title: string;
  content: string;
  type: 'lao_dong' | 'dieu_dong' | 'cuoc_hop' | 'khac';
  targetClasses: string[]; // ['10/1', '10/2'] or ['ALL']
  deadline: string;
  createdAt: string;
  assignedBy: string;
  status: 'pending' | 'completed';
}

export interface ActivityParticipant {
  studentId: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  phone?: string;
  role?: string; // e.g. "Vận động viên", "Đội trưởng", "Tình nguyện viên", "Cổ động viên", "Thành viên"
  achievement?: string; // e.g. "Giải Nhất", "Giải Nhì", "Hoàn thành xuất sắc"
  note?: string;
}

export interface ActivityNonParticipant {
  studentId: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  phone?: string;
  isUnionMember?: boolean;
  reason?: string; // e.g. "Vắng có phép", "Vắng không phép", "Bị ốm", "Trùng lịch bồi dưỡng HSG", "Bận việc gia đình", "Không tham gia"
  note?: string;
}

export interface ActivityReport {
  id: string;
  activityId?: string; // id của NewsPost hoặc YouthEvent hoặc Custom Activity
  activityTitle: string;
  activityType: 'phong_trao' | 'tinh_nguyen' | 'the_thao' | 'van_nghe' | 'lao_dong' | 'khac';
  classId: string;
  className: string;
  secretaryName: string;
  reportedAt: string;
  participantCount: number;
  participants: ActivityParticipant[];
  nonParticipants?: ActivityNonParticipant[];
  status: 'submitted' | 'verified';
  adminFeedback?: string;
  proofImages?: string[];
  academicYearId?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  ipAddress?: string;
  academicYearId?: string;
}

export interface WeekConfig {
  weekNumber: number;
  title: string; // "Tuần 24"
  startDate: string; // "2026-08-25"
  endDate: string; // "2026-08-30"
  isCurrent: boolean;
  isLocked: boolean;
  isHidden?: boolean;
  note?: string;
  semester?: 1 | 2;
  academicYearId?: string;
}

export interface SchoolSettings {
  schoolName: string;
  youthUnionName: string;
  slogan: string;
  address: string;
  email: string;
  phone: string;
  themeColor: 'red' | 'blue' | 'emerald' | 'amber' | 'purple' | 'slate' | 'cyan';
  logoUrl?: string;
  youthUnionLogoUrl?: string; // Ảnh logo / huy hiệu Đoàn Thanh Niên
  bannerTopImage?: string; // Ảnh banner đầu trang
  footerBannerImage?: string; // Ảnh banner chân trang
  semester1EndWeek?: number; // Mặc định: 18 (Tuần kết thúc HK1)
  semester1Name?: string; // Mặc định: "Học Kỳ 1"
  semester2Name?: string; // Mặc định: "Học Kỳ 2"
}

export interface ActivitySlide {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  date?: string;
  tag?: string; // e.g. "Phong trào", "Tình nguyện", "Hội thao", "Kết nạp Đoàn"
  isActive: boolean;
  order: number;
}

export interface AppNotification {
  id: string;
  targetRole?: 'all' | 'admin' | 'manager' | 'auditor' | 'youth_secretary' | 'user';
  targetClassId?: string; // '10/1', '10/2' or 'ALL'
  targetUserId?: string;
  title: string;
  message: string;
  type: 'violation' | 'appeal' | 'event' | 'system' | 'fee' | 'report';
  createdAt: string;
  isRead: boolean;
  linkView?: string;
}

export interface SemesterClassScore {
  classId: string;
  className: string;
  grade: 10 | 11 | 12;
  totalWeeksEvaluated: number;
  averageWeeklyScore: number;
  totalDeductions: number;
  totalBonuses: number;
  totalViolations: number;
  resolvedAppeals: number;
  finalSemesterScore: number;
  rank: number;
  awardTitle: string; // 'Chi đoàn Xuất sắc vững mạnh', 'Chi đoàn Tiên tiến', 'Chi đoàn Khá', 'Chi đoàn Trung bình'
  weeklyScores: Record<number, number>; // weekNumber -> finalScore
}

export interface AcademicYear {
  id: string; // e.g. "2024_2025", "2025_2026", "2026_2027"
  name: string; // "Năm học 2025 - 2026"
  startDate: string; // "2025-09-05"
  endDate: string; // "2026-05-31"
  isCurrent: boolean; // Duy nhất 1 năm mang giá trị true
  isFrozen: boolean;
  createdAt: string;
  notes?: string;
}

export interface RolloverPayload {
  newYearId: string; // e.g. "2026_2027"
  newYearName: string; // "Năm học 2026 - 2027"
  startDate: string; // "2026-09-05"
  endDate: string; // "2027-05-31"
  cloneCriteria: boolean;
  graduatedGrade12ClassIds: string[];
  promotionMapping: Record<string, string>; // e.g. { "10/1": "11/1", "11/1": "12/1" }
  gvcnAssignments: Record<string, { gvcnName: string; gvcnId: string }>;
  auditorMemberIds: string[];
}



