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
  Student, 
  WeekConfig, 
  SchoolSettings,
  ActivitySlide,
  AppNotification,
  AcademicYear
} from '../types';

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'Trường THPT Quang Trung - Đông Giang',
  youthUnionName: 'Đoàn trường THPT Quang Trung - Đông Giang',
  slogan: 'Tuổi trẻ Quang Trung – Tiên phong, Gương mẫu, Bản lĩnh, Sáng tạo',
  address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
  email: 'doantruongquangtrungdonggiang@gmail.com',
  phone: '0988806194',
  themeColor: 'red',
  logoUrl: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=200&auto=format&fit=crop&q=75',
  youthUnionLogoUrl: 'https://upload.wikimedia.org/wikipedia/vi/8/87/Huy_hi%E1%BB%87u_%C4%90o%C3%A0n.svg',
  bannerTopImage: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=75',
  footerBannerImage: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=75'
};

export const INITIAL_ZONES: DutyZone[] = [
  { id: 'zone-1', name: 'Khối 10', description: 'Dãy phòng học tầng 1 & 2 khu A', icon: '🏢' },
  { id: 'zone-2', name: 'Khối 11', description: 'Dãy phòng học tầng 3 & 4 khu A', icon: '🏢' },
  { id: 'zone-3', name: 'Khối 12', description: 'Dãy phòng học khu B', icon: '🏢' },
  { id: 'zone-4', name: 'Cổng trường & Nhà xe', description: 'Cổng chính, bãi đỗ xe học sinh & GV', icon: '🚲' },
  { id: 'zone-5', name: 'Khu vực Sân trường', description: 'Sân lễ, cột cờ & ghế đá trung tâm', icon: '🌳' },
  { id: 'zone-6', name: 'Khu Căn tin & Nhà thi đấu', description: 'Khu nhà ăn, nhà đa năng & sân bóng', icon: '☕' },
];

export const INITIAL_AUDITORS: AuditorMember[] = [
  { id: 'codo_nam', name: 'Nguyễn Văn Nam', classId: '11/2', phone: '0912.888.777', assignedZone: 'Khối 10', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_hai', name: 'Phạm Đức Hải', classId: '12/1', phone: '0935.666.888', assignedZone: 'Khối 11', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_linh', name: 'Trần Thùy Linh', classId: '10/3', phone: '0905.112.233', assignedZone: 'Khối 12', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_dung', name: 'Lê Hoàng Dũng', classId: '11/4', phone: '0988.444.555', assignedZone: 'Cổng trường & Nhà xe', defaultShiftTime: '06:30 - 07:15 & 11:15 - 12:00', isActive: true },
  { id: 'codo_mai', name: 'Vũ Ngọc Mai', classId: '12/5', phone: '0977.223.344', assignedZone: 'Khu vực Sân trường', defaultShiftTime: '06:45 - 07:15 & Giờ ra chơi', isActive: true },
  { id: 'codo_quang', name: 'Hoàng Minh Quang', classId: '10/5', phone: '0966.333.111', assignedZone: 'Khu Căn tin & Nhà thi đấu', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
];

export const INITIAL_WEEKS: WeekConfig[] = [
  { weekNumber: 22, title: 'Tuần 22', startDate: '2026-08-11', endDate: '2026-08-16', isCurrent: false, isLocked: true, note: 'Đã hoàn thành chốt điểm' },
  { weekNumber: 23, title: 'Tuần 23', startDate: '2026-08-18', endDate: '2026-08-23', isCurrent: false, isLocked: true, note: 'Đã hoàn thành chốt điểm' },
  { weekNumber: 24, title: 'Tuần 24', startDate: '2026-08-25', endDate: '2026-08-30', isCurrent: true, isLocked: false, note: 'Tuần học hiện tại - Đang chấm nề nếp' },
  { weekNumber: 25, title: 'Tuần 25', startDate: '2026-09-01', endDate: '2026-09-06', isCurrent: false, isLocked: false, note: 'Tuần học kế tiếp' }
];

export const INITIAL_CLASSES: ClassInfo[] = [
  // Khối 10
  { id: '10/1', name: 'Lớp 10/1', grade: 10, gvcnName: 'Thầy Nguyễn Văn Thành', gvcnId: 'gvcn_10_1', bithuName: 'Trần Thị Thu Thảo', bithuId: 'bithu_10_1', totalStudents: 42, unionMembers: 35, standardScore: 1440, isArchived: false },
  { id: '10/2', name: 'Lớp 10/2', grade: 10, gvcnName: 'Cô Lê Thị Mai', gvcnId: 'gvcn_10_2', bithuName: 'Lê Hoàng Nam', bithuId: 'bithu_10_2', totalStudents: 40, unionMembers: 32, standardScore: 1440, isArchived: false },
  { id: '10/3', name: 'Lớp 10/3', grade: 10, gvcnName: 'Thầy Phạm Đức Hùng', gvcnId: 'gvcn_10_3', bithuName: 'Vũ Minh Tuấn', bithuId: 'bithu_10_3', totalStudents: 43, unionMembers: 36, standardScore: 1440, isArchived: false },
  { id: '10/4', name: 'Lớp 10/4', grade: 10, gvcnName: 'Cô Đỗ Thị Lan', gvcnId: 'gvcn_10_4', bithuName: 'Hoàng Quỳnh Như', bithuId: 'bithu_10_4', totalStudents: 41, unionMembers: 34, standardScore: 1440, isArchived: false },
  { id: '10/5', name: 'Lớp 10/5', grade: 10, gvcnName: 'Thầy Bùi Quang Khải', gvcnId: 'gvcn_10_5', bithuName: 'Ngô Trọng Đại', bithuId: 'bithu_10_5', totalStudents: 40, unionMembers: 30, standardScore: 1440, isArchived: false },
  { id: '10/6', name: 'Lớp 10/6', grade: 10, gvcnName: 'Cô Trần Kim Yến', gvcnId: 'gvcn_10_6', bithuName: 'Phan Bảo Ngọc', bithuId: 'bithu_10_6', totalStudents: 44, unionMembers: 38, standardScore: 1440, isArchived: false },

  // Khối 11
  { id: '11/1', name: 'Lớp 11/1', grade: 11, gvcnName: 'Thầy Vũ Văn Bình', gvcnId: 'gvcn_11_1', bithuName: 'Đặng Thanh Tâm', bithuId: 'bithu_11_1', totalStudents: 42, unionMembers: 40, standardScore: 1440, isArchived: false },
  { id: '11/2', name: 'Lớp 11/2', grade: 11, gvcnName: 'Cô Hoàng Minh Nguyệt', gvcnId: 'gvcn_11_2', bithuName: 'Trịnh Gia Hưng', bithuId: 'bithu_11_2', totalStudents: 41, unionMembers: 39, standardScore: 1440, isArchived: false },
  { id: '11/3', name: 'Lớp 11/3', grade: 11, gvcnName: 'Thầy Trương Công Định', gvcnId: 'gvcn_11_3', bithuName: 'Nguyễn Diệu Linh', bithuId: 'bithu_11_3', totalStudents: 43, unionMembers: 41, standardScore: 1440, isArchived: false },
  { id: '11/4', name: 'Lớp 11/4', grade: 11, gvcnName: 'Cô Võ Thị Hằng', gvcnId: 'gvcn_11_4', bithuName: 'Lý Quốc Bảo', bithuId: 'bithu_11_4', totalStudents: 40, unionMembers: 38, standardScore: 1440, isArchived: false },
  { id: '11/5', name: 'Lớp 11/5', grade: 11, gvcnName: 'Thầy Đinh Ngọc Tú', gvcnId: 'gvcn_11_5', bithuName: 'Dương Khánh An', bithuId: 'bithu_11_5', totalStudents: 42, unionMembers: 41, standardScore: 1440, isArchived: false },
  { id: '11/6', name: 'Lớp 11/6', grade: 11, gvcnName: 'Cô Lâm Ánh Tuyết', gvcnId: 'gvcn_11_6', bithuName: 'Cao Viết Thắng', bithuId: 'bithu_11_6', totalStudents: 41, unionMembers: 40, standardScore: 1440, isArchived: false },

  // Khối 12
  { id: '12/1', name: 'Lớp 12/1', grade: 12, gvcnName: 'Thầy Hồ Bá Khiêm', gvcnId: 'gvcn_12_1', bithuName: 'Mai Phương Thảo', bithuId: 'bithu_12_1', totalStudents: 44, unionMembers: 44, standardScore: 1440, isArchived: false },
  { id: '12/2', name: 'Lớp 12/2', grade: 12, gvcnName: 'Cô Phan Kiều Oanh', gvcnId: 'gvcn_12_2', bithuName: 'Lương Thế Vinh', bithuId: 'bithu_12_2', totalStudents: 43, unionMembers: 43, standardScore: 1440, isArchived: false },
  { id: '12/3', name: 'Lớp 12/3', grade: 12, gvcnName: 'Thầy Đoàn Nhật Nam', gvcnId: 'gvcn_12_3', bithuName: 'Chu Đình Trọng', bithuId: 'bithu_12_3', totalStudents: 42, unionMembers: 42, standardScore: 1440, isArchived: false },
  { id: '12/4', name: 'Lớp 12/4', grade: 12, gvcnName: 'Cô Huỳnh Thục Đoan', gvcnId: 'gvcn_12_4', bithuName: 'Nguyễn Thị Hoa', bithuId: 'bithu_12_4', totalStudents: 45, unionMembers: 45, standardScore: 1440, isArchived: false },
  { id: '12/5', name: 'Lớp 12/5', grade: 12, gvcnName: 'Thầy Tống Phước Hiệp', gvcnId: 'gvcn_12_5', bithuName: 'Đào Xuân Trường', bithuId: 'bithu_12_5', totalStudents: 40, unionMembers: 40, standardScore: 1440, isArchived: false },
  { id: '12/6', name: 'Lớp 12/6', grade: 12, gvcnName: 'Cô Quách Thu Hương', gvcnId: 'gvcn_12_6', bithuName: 'Phùng Hải Đăng', bithuId: 'bithu_12_6', totalStudents: 41, unionMembers: 41, standardScore: 1440, isArchived: false }
];

const generateClassStudents = (): Student[] => {
  const allClassRosters: Student[] = [
    // 10/1
    { id: 'st-101-01', studentId: 'HS20241001', name: 'Nguyễn Quang Minh', classId: '10/1', grade: 10, gender: 'Nam', dob: '2009-04-15', ethnicity: 'Kinh', phone: '0919.888.999', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '19/05/2024', points: 85, rankTitle: 'Đoàn viên Tích cực', violationsCount: 1, status: 'active' },
    { id: 'st-101-02', studentId: 'HS20241002', name: 'Trần Thị Thu Thảo', classId: '10/1', grade: 10, gender: 'Nữ', dob: '2009-08-20', ethnicity: 'Kinh', phone: '0977.334.455', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '26/03/2024', points: 120, rankTitle: 'Đoàn viên Xuất sắc', violationsCount: 0, status: 'active' },
    { id: 'st-101-03', studentId: 'HS20241003', name: 'Nguyễn Văn Đức', classId: '10/1', grade: 10, gender: 'Nam', dob: '2009-01-10', ethnicity: 'Cơ Tu', phone: '0988.333.444', address: 'Thôn Giàn Bí, xã Hòa Bắc, TP Đà Nẵng', isUnionMember: false, points: 45, rankTitle: 'Đoàn viên', violationsCount: 2, status: 'active' },
    { id: 'st-101-04', studentId: 'HS20241004', name: 'Lê Hữu Đạt', classId: '10/1', grade: 10, gender: 'Nam', dob: '2009-06-12', ethnicity: 'Kinh', phone: '0988.555.666', address: 'Thôn Đông Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '19/05/2024', points: 60, rankTitle: 'Đoàn viên', violationsCount: 1, status: 'active' },
    { id: 'st-101-05', studentId: 'HS20241005', name: 'Vũ Minh Tuấn', classId: '10/1', grade: 10, gender: 'Nam', dob: '2009-03-25', ethnicity: 'Kinh', phone: '0912.777.888', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '26/03/2024', points: 110, rankTitle: 'Đoàn viên Xuất sắc', violationsCount: 0, status: 'active' },
    { id: 'st-101-06', studentId: 'HS20241006', name: 'Hoàng Thị Mai', classId: '10/1', grade: 10, gender: 'Nữ', dob: '2009-11-05', ethnicity: 'Cơ Tu', phone: '0933.222.111', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '19/05/2024', points: 95, rankTitle: 'Đoàn viên Tích cực', violationsCount: 0, status: 'active' },
    { id: 'st-101-07', studentId: 'HS20241007', name: 'Đặng Quốc Huy', classId: '10/1', grade: 10, gender: 'Nam', dob: '2009-07-08', ethnicity: 'Kinh', phone: '0905.123.456', address: 'Thôn Nam Yên, xã Hòa Bắc, TP Đà Nẵng', isUnionMember: true, points: 70, rankTitle: 'Đoàn viên', violationsCount: 0, status: 'active' },

    // 10/2
    { id: 'st-102-01', studentId: 'HS20241011', name: 'Lê Hoàng Nam', classId: '10/2', grade: 10, gender: 'Nam', dob: '2009-02-14', ethnicity: 'Kinh', phone: '0912.333.111', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '26/03/2024', points: 115, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-102-02', studentId: 'HS20241012', name: 'Hoàng Văn Khải', classId: '10/2', grade: 10, gender: 'Nam', dob: '2009-05-19', ethnicity: 'Cơ Tu', phone: '0934.555.666', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: false, points: 40, rankTitle: 'Học sinh', violationsCount: 2, status: 'active' },
    { id: 'st-102-03', studentId: 'HS20241013', name: 'Trần Đình Trọng', classId: '10/2', grade: 10, gender: 'Nam', dob: '2009-09-01', ethnicity: 'Kinh', phone: '0977.888.999', address: 'Thôn An Ngãi, xã Hòa Phong, TP Đà Nẵng', isUnionMember: true, points: 65, rankTitle: 'Đoàn viên', violationsCount: 1, status: 'active' },
    { id: 'st-102-04', studentId: 'HS20241014', name: 'Phạm Thị Thùy Dung', classId: '10/2', grade: 10, gender: 'Nữ', dob: '2009-12-10', ethnicity: 'Kinh', phone: '0988.222.333', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 90, rankTitle: 'Đoàn viên Tích cực', violationsCount: 0, status: 'active' },

    // 10/3
    { id: 'st-103-01', studentId: 'HS20241021', name: 'Vũ Minh Tuấn', classId: '10/3', grade: 10, gender: 'Nam', dob: '2009-03-11', ethnicity: 'Kinh', phone: '0905.666.777', address: 'Thôn Bến Ngự, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 105, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-103-02', studentId: 'HS20241022', name: 'Trần Thùy Linh', classId: '10/3', grade: 10, gender: 'Nữ', dob: '2009-08-15', ethnicity: 'Kinh', phone: '0905.112.233', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 140, rankTitle: 'Cán bộ Cờ Đỏ', violationsCount: 0, status: 'active' },
    { id: 'st-103-03', studentId: 'HS20241023', name: 'Đỗ Hữu Thắng', classId: '10/3', grade: 10, gender: 'Nam', dob: '2009-10-20', ethnicity: 'Cơ Tu', phone: '0935.111.444', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: false, points: 50, rankTitle: 'Học sinh', violationsCount: 1, status: 'active' },

    // 10/4
    { id: 'st-104-01', studentId: 'HS20241031', name: 'Hoàng Quỳnh Như', classId: '10/4', grade: 10, gender: 'Nữ', dob: '2009-01-22', ethnicity: 'Kinh', phone: '0966.444.888', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 110, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-104-02', studentId: 'HS20241032', name: 'Nguyễn Văn Hùng', classId: '10/4', grade: 10, gender: 'Nam', dob: '2009-04-18', ethnicity: 'Kinh', phone: '0912.555.777', address: 'Thôn An Sơn, xã Hòa Ninh, TP Đà Nẵng', isUnionMember: true, points: 75, rankTitle: 'Đoàn viên', violationsCount: 1, status: 'active' },

    // 10/5
    { id: 'st-105-01', studentId: 'HS20241041', name: 'Ngô Trọng Đại', classId: '10/5', grade: 10, gender: 'Nam', dob: '2009-06-30', ethnicity: 'Kinh', phone: '0977.111.222', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 100, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-105-02', studentId: 'HS20241042', name: 'Hoàng Minh Quang', classId: '10/5', grade: 10, gender: 'Nam', dob: '2009-09-12', ethnicity: 'Kinh', phone: '0966.333.111', address: 'Thôn Giàn Bí, xã Hòa Bắc, TP Đà Nẵng', isUnionMember: true, points: 130, rankTitle: 'Cán bộ Cờ Đỏ', violationsCount: 0, status: 'active' },

    // 10/6
    { id: 'st-106-01', studentId: 'HS20241051', name: 'Phan Bảo Ngọc', classId: '10/6', grade: 10, gender: 'Nữ', dob: '2009-07-14', ethnicity: 'Kinh', phone: '0933.999.000', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 115, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-106-02', studentId: 'HS20241052', name: 'Lê Duy Khánh', classId: '10/6', grade: 10, gender: 'Nam', dob: '2009-11-28', ethnicity: 'Cơ Tu', phone: '0988.777.666', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: false, points: 55, rankTitle: 'Học sinh', violationsCount: 1, status: 'active' },

    // 11/1
    { id: 'st-111-01', studentId: 'HS20231101', name: 'Đặng Thanh Tâm', classId: '11/1', grade: 11, gender: 'Nữ', dob: '2008-03-15', ethnicity: 'Kinh', phone: '0912.888.333', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 125, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-111-02', studentId: 'HS20231102', name: 'Bùi Đức Anh', classId: '11/1', grade: 11, gender: 'Nam', dob: '2008-08-20', ethnicity: 'Kinh', phone: '0977.222.444', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 80, rankTitle: 'Đoàn viên', violationsCount: 0, status: 'active' },

    // 11/2
    { id: 'st-112-01', studentId: 'HS20231111', name: 'Nguyễn Văn Nam', classId: '11/2', grade: 11, gender: 'Nam', dob: '2008-05-18', ethnicity: 'Kinh', phone: '0988.112.233', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '26/03/2023', points: 150, rankTitle: 'Đội trưởng Cờ Đỏ', violationsCount: 0, status: 'active' },
    { id: 'st-112-02', studentId: 'HS20231112', name: 'Trịnh Gia Hưng', classId: '11/2', grade: 11, gender: 'Nam', dob: '2008-09-14', ethnicity: 'Kinh', phone: '0977.444.555', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '26/03/2023', points: 115, rankTitle: 'Bí thư Chi đoàn', violationsCount: 1, status: 'active' },
    { id: 'st-112-03', studentId: 'HS20231113', name: 'Lê Thu Trang', classId: '11/2', grade: 11, gender: 'Nữ', dob: '2008-12-01', ethnicity: 'Kinh', phone: '0905.777.888', address: 'Thôn Bến Ngự, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 95, rankTitle: 'Đoàn viên Tích cực', violationsCount: 0, status: 'active' },

    // 11/3
    { id: 'st-113-01', studentId: 'HS20231121', name: 'Nguyễn Diệu Linh', classId: '11/3', grade: 11, gender: 'Nữ', dob: '2008-02-10', ethnicity: 'Kinh', phone: '0966.555.999', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 130, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-113-02', studentId: 'HS20231122', name: 'Phạm Quốc Bảo', classId: '11/3', grade: 11, gender: 'Nam', dob: '2008-06-25', ethnicity: 'Kinh', phone: '0935.888.111', address: 'Thôn Giàn Bí, xã Hòa Bắc, TP Đà Nẵng', isUnionMember: true, points: 85, rankTitle: 'Đoàn viên', violationsCount: 0, status: 'active' },

    // 11/4
    { id: 'st-114-01', studentId: 'HS20231131', name: 'Lý Quốc Bảo', classId: '11/4', grade: 11, gender: 'Nam', dob: '2008-04-18', ethnicity: 'Kinh', phone: '0988.444.555', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 120, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-114-02', studentId: 'HS20231132', name: 'Lê Hoàng Dũng', classId: '11/4', grade: 11, gender: 'Nam', dob: '2008-10-05', ethnicity: 'Kinh', phone: '0988.444.555', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 145, rankTitle: 'Cán bộ Cờ Đỏ', violationsCount: 0, status: 'active' },

    // 11/5
    { id: 'st-115-01', studentId: 'HS20231141', name: 'Dương Khánh An', classId: '11/5', grade: 11, gender: 'Nữ', dob: '2008-01-28', ethnicity: 'Kinh', phone: '0912.666.999', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 110, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-115-02', studentId: 'HS20231142', name: 'Đỗ Minh Tuấn', classId: '11/5', grade: 11, gender: 'Nam', dob: '2008-07-19', ethnicity: 'Kinh', phone: '0977.333.888', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: true, points: 65, rankTitle: 'Đoàn viên', violationsCount: 2, status: 'active' },
    { id: 'st-115-03', studentId: 'HS20231143', name: 'Vũ Hồng Quang', classId: '11/5', grade: 11, gender: 'Nam', dob: '2008-11-12', ethnicity: 'Cơ Tu', phone: '0935.222.333', address: 'Thôn Giàn Bí, xã Hòa Bắc, TP Đà Nẵng', isUnionMember: false, points: 40, rankTitle: 'Học sinh', violationsCount: 1, status: 'active' },

    // 11/6
    { id: 'st-116-01', studentId: 'HS20231151', name: 'Cao Viết Thắng', classId: '11/6', grade: 11, gender: 'Nam', dob: '2008-05-09', ethnicity: 'Kinh', phone: '0966.777.111', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 105, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-116-02', studentId: 'HS20231152', name: 'Trần Ngọc Mai', classId: '11/6', grade: 11, gender: 'Nữ', dob: '2008-09-30', ethnicity: 'Kinh', phone: '0905.444.666', address: 'Thôn An Sơn, xã Hòa Ninh, TP Đà Nẵng', isUnionMember: true, points: 90, rankTitle: 'Đoàn viên Tích cực', violationsCount: 0, status: 'active' },

    // 12/1
    { id: 'st-121-01', studentId: 'HS20221201', name: 'Mai Phương Thảo', classId: '12/1', grade: 12, gender: 'Nữ', dob: '2007-03-12', ethnicity: 'Kinh', phone: '0935.666.888', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 165, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-121-02', studentId: 'HS20221202', name: 'Phạm Đức Hải', classId: '12/1', grade: 12, gender: 'Nam', dob: '2007-08-15', ethnicity: 'Kinh', phone: '0935.666.888', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 155, rankTitle: 'Cán bộ Cờ Đỏ', violationsCount: 0, status: 'active' },
    { id: 'st-121-03', studentId: 'HS20221203', name: 'Nguyễn Thành Long', classId: '12/1', grade: 12, gender: 'Nam', dob: '2007-11-20', ethnicity: 'Kinh', phone: '0912.444.555', address: 'Thôn Bến Ngự, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 130, rankTitle: 'Đoàn viên Xuất sắc', violationsCount: 0, status: 'active' },

    // 12/2
    { id: 'st-122-01', studentId: 'HS20221211', name: 'Lương Thế Vinh', classId: '12/2', grade: 12, gender: 'Nam', dob: '2007-04-10', ethnicity: 'Kinh', phone: '0977.888.111', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 140, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-122-02', studentId: 'HS20221212', name: 'Đoàn Thị Yến', classId: '12/2', grade: 12, gender: 'Nữ', dob: '2007-09-05', ethnicity: 'Kinh', phone: '0988.333.222', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: true, points: 110, rankTitle: 'Đoàn viên Xuất sắc', violationsCount: 0, status: 'active' },

    // 12/3
    { id: 'st-123-01', studentId: 'HS20221221', name: 'Chu Đình Trọng', classId: '12/3', grade: 12, gender: 'Nam', dob: '2007-01-18', ethnicity: 'Kinh', phone: '0966.222.777', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 135, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-123-02', studentId: 'HS20221222', name: 'Hoàng Bảo Trâm', classId: '12/3', grade: 12, gender: 'Nữ', dob: '2007-06-24', ethnicity: 'Kinh', phone: '0905.888.333', address: 'Thôn Giàn Bí, xã Hòa Bắc, TP Đà Nẵng', isUnionMember: true, points: 100, rankTitle: 'Đoàn viên Tích cực', violationsCount: 0, status: 'active' },

    // 12/4
    { id: 'st-124-01', studentId: 'HS20221231', name: 'Nguyễn Thị Hoa', classId: '12/4', grade: 12, gender: 'Nữ', dob: '2007-02-14', ethnicity: 'Kinh', phone: '0966.778.899', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '26/03/2022', points: 215, rankTitle: 'Cán bộ Đoàn Tiêu biểu', violationsCount: 0, status: 'active' },
    { id: 'st-124-02', studentId: 'HS20221232', name: 'Phan Như Hoa', classId: '12/4', grade: 12, gender: 'Nữ', dob: '2007-10-22', ethnicity: 'Cơ Tu', phone: '0912.111.222', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '26/03/2023', points: 160, rankTitle: 'Đoàn viên Ưu tú', violationsCount: 0, status: 'active' },
    { id: 'st-124-03', studentId: 'HS20221233', name: 'Vũ Quốc Huy', classId: '12/4', grade: 12, gender: 'Nam', dob: '2007-12-19', ethnicity: 'Kinh', phone: '0988.999.444', address: 'Thôn Bến Ngự, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 125, rankTitle: 'Đoàn viên Xuất sắc', violationsCount: 1, status: 'active' },

    // 12/5
    { id: 'st-125-01', studentId: 'HS20221241', name: 'Đào Xuân Trường', classId: '12/5', grade: 12, gender: 'Nam', dob: '2007-05-16', ethnicity: 'Kinh', phone: '0977.223.344', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 145, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-125-02', studentId: 'HS20221242', name: 'Vũ Ngọc Mai', classId: '12/5', grade: 12, gender: 'Nữ', dob: '2007-08-29', ethnicity: 'Kinh', phone: '0977.223.344', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: true, points: 150, rankTitle: 'Cán bộ Cờ Đỏ', violationsCount: 0, status: 'active' },

    // 12/6
    { id: 'st-126-01', studentId: 'HS20221251', name: 'Phùng Hải Đăng', classId: '12/6', grade: 12, gender: 'Nam', dob: '2007-07-21', ethnicity: 'Kinh', phone: '0935.123.789', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 130, rankTitle: 'Bí thư Chi đoàn', violationsCount: 0, status: 'active' },
    { id: 'st-126-02', studentId: 'HS20221252', name: 'Lê Thu Uyên', classId: '12/6', grade: 12, gender: 'Nữ', dob: '2007-11-03', ethnicity: 'Kinh', phone: '0912.555.444', address: 'Thôn An Sơn, xã Hòa Ninh, TP Đà Nẵng', isUnionMember: true, points: 110, rankTitle: 'Đoàn viên Xuất sắc', violationsCount: 0, status: 'active' }
  ];

  return allClassRosters;
};

export const INITIAL_STUDENTS: Student[] = generateClassStudents();

export const INITIAL_CRITERIA: Criterion[] = [
  // Nhóm I.1: Chuyên cần (40đ/ngày)
  {
    id: '1.1',
    groupId: 'I.1',
    groupName: 'Chuyên cần',
    groupStandardScore: 40,
    code: '1.1',
    name: 'Vào lớp sinh hoạt trễ 5p đầu giờ',
    type: 'deduction',
    points: 1,
    unit: 'đ / HS',
    isEnabled: true,
    description: 'Học sinh đến sau hiệu lệnh chuông 5 phút'
  },
  {
    id: '1.2',
    groupId: 'I.1',
    groupName: 'Chuyên cần',
    groupStandardScore: 40,
    code: '1.2',
    name: 'Vắng có phép (có xác nhận của GVCN)',
    type: 'deduction',
    points: 1,
    unit: 'đ / HS / buổi',
    isEnabled: true,
    description: 'Có giấy xin phép hợp lệ gửi GVCN trước giờ vào học'
  },
  {
    id: '1.3',
    groupId: 'I.1',
    groupName: 'Chuyên cần',
    groupStandardScore: 40,
    code: '1.3',
    name: 'Vắng không phép',
    type: 'deduction',
    points: 2,
    unit: 'đ / HS / buổi',
    isEnabled: true,
    isSevere: true,
    description: 'Vắng mặt không có giấy xin phép hoặc lý do không chính đáng'
  },
  {
    id: '1.4',
    groupId: 'I.1',
    groupName: 'Chuyên cần',
    groupStandardScore: 40,
    code: '1.4',
    name: 'Bỏ tiết (kể cả tiết chào cờ)',
    type: 'deduction',
    points: 2,
    unit: 'đ / HS / tiết',
    isEnabled: true,
    isSevere: true,
    description: 'Có mặt đầu giờ nhưng tự ý vắng tiết trong buổi học'
  },
  {
    id: '1.5',
    groupId: 'I.1',
    groupName: 'Chuyên cần',
    groupStandardScore: 40,
    code: '1.5',
    name: 'Báo cáo gian lận / sai sĩ số',
    type: 'deduction',
    points: 5,
    unit: 'đ / lần',
    isEnabled: true,
    isSevere: true,
    description: 'Ban cán sự hoặc cá nhân bao che, khai báo sai lệch sĩ số'
  },
  {
    id: '1.6',
    groupId: 'I.1',
    groupName: 'Chuyên cần',
    groupStandardScore: 40,
    code: '1.6',
    name: 'Vắng nhiệm vụ lao động / điều động Đoàn',
    type: 'deduction',
    points: 5,
    unit: 'đ / HS',
    isEnabled: true,
    description: 'Không tham gia buổi lao động do Đoàn trường điều động'
  },

  // Nhóm I.2: Vệ sinh (30đ/ngày)
  {
    id: '2.1',
    groupId: 'I.2',
    groupName: 'Vệ sinh',
    groupStandardScore: 30,
    code: '2.1',
    name: 'Không trực nhật',
    type: 'deduction',
    points: 5,
    unit: 'đ / buổi',
    isEnabled: true,
    isSevere: true,
    description: 'Phòng học bẩn, không quét dọn, không lau bảng trước tiết 1'
  },
  {
    id: '2.2',
    groupId: 'I.2',
    groupName: 'Vệ sinh',
    groupStandardScore: 30,
    code: '2.2',
    name: 'Trực nhật trễ, không đổ rác, vệ sinh kém',
    type: 'deduction',
    points: 2,
    unit: 'đ / buổi',
    isEnabled: true,
    description: 'Thùng rác đầy không đổ ra nơi quy định, ngăn bàn có rác'
  },
  {
    id: '2.4',
    groupId: 'I.2',
    groupName: 'Vệ sinh',
    groupStandardScore: 30,
    code: '2.4',
    name: 'Thiếu khăn bảng, bình hoa, dung dịch sát khuẩn',
    type: 'deduction',
    points: 1,
    unit: 'đ / loại',
    isEnabled: true,
    description: 'Không trang bị đầy đủ vật dụng trên bàn giáo viên'
  },

  // Nhóm I.3: Nề nếp tự quản (65đ/ngày)
  {
    id: '3.1',
    groupId: 'I.3',
    groupName: 'Nề nếp tự quản',
    groupStandardScore: 65,
    code: '3.1',
    name: 'Ồn ào 5p đầu giờ, đi lại hành lang',
    type: 'deduction',
    points: 5,
    unit: 'đ / buổi',
    isEnabled: true,
    description: 'Không giữ trật tự giờ truy bài, chạy nhảy ngoài hành lang'
  },
  {
    id: '3.5',
    groupId: 'I.3',
    groupName: 'Nề nếp tự quản',
    groupStandardScore: 65,
    code: '3.5',
    name: 'Không tắt điện, quạt sau giờ học',
    type: 'deduction',
    points: 5,
    unit: 'đ / buổi',
    isEnabled: true,
    description: 'Lớp ra về không ngắt thiết bị điện trong phòng'
  },
  {
    id: '3.7',
    groupId: 'I.3',
    groupName: 'Nề nếp tự quản',
    groupStandardScore: 65,
    code: '3.7',
    name: 'Sử dụng điện thoại không được phép',
    type: 'deduction',
    points: 5,
    unit: 'đ / HS / lần',
    isEnabled: true,
    isSevere: true,
    description: 'Sử dụng thiết bị điện tử khi giáo viên chưa cho phép'
  },

  // Nhóm I.4: Tác phong (90đ/ngày)
  {
    id: '4.1',
    groupId: 'I.4',
    groupName: 'Tác phong',
    groupStandardScore: 90,
    code: '4.1',
    name: 'Không đúng đồng phục, sai giày dép, thiếu phù hiệu',
    type: 'deduction',
    points: 2,
    unit: 'đ / HS',
    isEnabled: true,
    description: 'Đi dép lê, không đeo thẻ học sinh, không mặc áo đồng phục Đoàn/trường'
  },
  {
    id: '4.2',
    groupId: 'I.4',
    groupName: 'Tác phong',
    groupStandardScore: 90,
    code: '4.2',
    name: 'Đầu tóc không đúng quy định (uốn, nhuộm...)',
    type: 'deduction',
    points: 2,
    unit: 'đ / HS',
    isEnabled: true,
    description: 'Nhuộm tóc màu sặc sỡ, nam sinh để tóc quá dài'
  },

  // Điểm cộng phong trào
  {
    id: '5.1',
    groupId: 'I.1',
    groupName: 'Thành tích & Phong trào',
    groupStandardScore: 0,
    code: '5.1',
    name: 'Đạt giải Nhất/Nhì/Ba phong trào cấp Trường/Thành phố',
    type: 'bonus',
    points: 10,
    unit: 'đ / giải',
    isEnabled: true,
    description: 'Thành tích xuất sắc trong các cuộc thi văn nghệ, thể thao, học thuật'
  },
  {
    id: '5.2',
    groupId: 'I.1',
    groupName: 'Thành tích & Phong trào',
    groupStandardScore: 0,
    code: '5.2',
    name: 'Chi đoàn có 100% đoàn viên tham gia Ngày Chủ Nhật Xanh',
    type: 'bonus',
    points: 5,
    unit: 'đ / chi đoàn',
    isEnabled: true,
    description: 'Tham gia đầy đủ và tích cực phong trào tình nguyện'
  }
];

export const INITIAL_USERS: User[] = [
  // 1. Admin
  {
    id: 'admin',
    username: 'admin',
    name: 'Thầy Lê Hoàng Long',
    role: 'admin',
    roleTitle: 'Bí thư Đoàn Trường / Quản trị viên',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'bithudoan@thpt-quangtrung-donggiang.edu.vn',
    phone: '0912.345.678',
    isActive: true
  },

  // 2. Cờ Đỏ
  {
    id: 'codo_nam',
    username: 'codo_nam',
    name: 'Nguyễn Văn Nam',
    role: 'auditor',
    roleTitle: 'Đội trưởng Đội Cờ Đỏ (Trực Khối 10)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    classId: '11/2',
    assignedZone: 'Khối 10',
    phone: '0988.112.233',
    isActive: true
  },

  // 3. GVCN
  {
    id: 'gvcn_10_1',
    username: 'gvcn_10_1',
    name: 'Thầy Nguyễn Văn Thành',
    role: 'manager',
    roleTitle: 'Giáo viên Chủ nhiệm Lớp 10/1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    classId: '10/1',
    phone: '0903.123.456',
    email: 'thanh.nv@thpt-quangtrung-donggiang.edu.vn',
    isActive: true
  },
  {
    id: 'gvcn_11_5',
    username: 'gvcn_11_5',
    name: 'Thầy Đinh Ngọc Tú',
    role: 'manager',
    roleTitle: 'Giáo viên Chủ nhiệm Lớp 11/5',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    classId: '11/5',
    phone: '0904.567.890',
    email: 'tu.dn@thpt-quangtrung-donggiang.edu.vn',
    isActive: true
  },

  // 4. Bí thư chi đoàn
  {
    id: 'bithu_10_1',
    username: 'bithu_10_1',
    name: 'Trần Thị Thu Thảo',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 10/1',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classId: '10/1',
    phone: '0977.334.455',
    isActive: true,
    points: 120,
    rankTitle: 'Đoàn viên Xuất sắc',
    joinedDate: '26/03/2024',
    studentId: 'HS20241001'
  },
  {
    id: 'bithu_12_4',
    username: 'bithu_12_4',
    name: 'Nguyễn Thị Hoa',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 12/4',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: '12/4',
    phone: '0966.778.899',
    isActive: true,
    points: 215,
    rankTitle: 'Cán bộ Đoàn Tiêu biểu',
    joinedDate: '26/03/2022',
    studentId: 'HS20221204'
  },

  // 5. Học sinh / Đoàn viên
  {
    id: 'doanvien_minh',
    username: 'doanvien_minh',
    name: 'Nguyễn Quang Minh',
    role: 'user',
    roleTitle: 'Đoàn viên - Học sinh Lớp 10/1',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    classId: '10/1',
    phone: '0919.888.999',
    isActive: true,
    points: 85,
    rankTitle: 'Đoàn viên Tích cực',
    joinedDate: '19/05/2024',
    studentId: 'HS20241019'
  },
  {
    id: 'doanvien_hoa',
    username: 'doanvien_hoa',
    name: 'Phan Như Hoa',
    role: 'user',
    roleTitle: 'Đoàn viên - Học sinh Lớp 12/4',
    avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
    classId: '12/4',
    phone: '0912.111.222',
    isActive: true,
    points: 160,
    rankTitle: 'Đoàn viên Ưu tú',
    joinedDate: '26/03/2023',
    studentId: 'HS20221215'
  }
];

export const INITIAL_VIOLATIONS: Violation[] = [
  // Lớp 10/1 - T2: 1.1 Đến trễ 2 HS (-2đ) -> Đã duyệt
  {
    id: 'vio-001',
    classId: '10/1',
    className: 'Lớp 10/1',
    day: 'T2',
    date: '2026-08-25',
    weekNumber: 24,
    criterionId: '1.1',
    criterionName: 'Vào lớp sinh hoạt trễ 5p đầu giờ',
    groupName: 'Chuyên cần',
    quantity: 2,
    pointsDeducted: 2,
    studentNames: ['Nguyễn Văn Đức', 'Lê Hữu Đạt'],
    note: 'Đến trường lúc 07:05 (sau hiệu lệnh trống 5 phút)',
    proofImages: ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-08-25 07:10',
    status: 'accepted',
    locked: false
  },
  // Lớp 10/1 - T3: 2.2 Vệ sinh kém (-2đ) -> GVCN đang khiếu nại (ĐỂ TEST SPLIT VIEW ADMIN & GVCN)
  {
    id: 'vio-002',
    classId: '10/1',
    className: 'Lớp 10/1',
    day: 'T3',
    date: '2026-08-26',
    weekNumber: 24,
    criterionId: '2.2',
    criterionName: 'Trực nhật trễ, không đổ rác, vệ sinh kém',
    groupName: 'Vệ sinh',
    quantity: 1,
    pointsDeducted: 2,
    studentNames: ['Tổ 2 trực nhật'],
    note: 'Thùng rác cuối lớp chưa đổ ra xe gom rác hành lang',
    proofImages: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-08-26 07:15',
    status: 'appealed',
    appeal: {
      reason: 'Kính gửi BCH Đoàn trường: Lớp 10/1 đã trực nhật sạch sẽ lúc 6h45. Thùng rác trong ảnh là do lớp học thêm buổi chiều hôm trước để lại, học sinh Tổ 2 đã mang đi đổ ngay lúc 7h00 trước khi Cờ đỏ vào chấm. Kèm theo cam kết của Ban cán sự lớp.',
      proofImages: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80'],
      appealedBy: 'Thầy Nguyễn Văn Thành (GVCN 10/1)',
      appealedAt: '2026-08-26 09:30'
    },
    locked: false
  },
  // Lớp 10/2 - T2: 1.2 Vắng có phép 10 HS (-10đ), 1.3 Vắng không phép 2 HS (-4đ)
  {
    id: 'vio-003',
    classId: '10/2',
    className: 'Lớp 10/2',
    day: 'T2',
    date: '2026-08-25',
    weekNumber: 24,
    criterionId: '1.2',
    criterionName: 'Vắng có phép (có xác nhận của GVCN)',
    groupName: 'Chuyên cần',
    quantity: 10,
    pointsDeducted: 10,
    studentNames: ['Danh sách 10 HS tham gia đội tuyển bồi dưỡng HSG'],
    note: 'Đội tuyển HSG tập trung tại phòng Hội đồng có giấy báo',
    proofImages: [],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-08-25 07:20',
    status: 'accepted',
    locked: false
  },
  {
    id: 'vio-004',
    classId: '10/2',
    className: 'Lớp 10/2',
    day: 'T2',
    date: '2026-08-25',
    weekNumber: 24,
    criterionId: '1.3',
    criterionName: 'Vắng không phép',
    groupName: 'Chuyên cần',
    quantity: 2,
    pointsDeducted: 4,
    studentNames: ['Hoàng Văn Khải', 'Trần Đình Trọng'],
    note: 'Vắng tiết 1 chào cờ không lý do',
    proofImages: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-08-25 07:30',
    status: 'accepted',
    locked: false
  },
  // Lớp 11/5 - T4: 4.1 Sai đồng phục (-4đ) -> Chờ duyệt
  {
    id: 'vio-005',
    classId: '11/5',
    className: 'Lớp 11/5',
    day: 'T4',
    date: '2026-08-27',
    weekNumber: 24,
    criterionId: '4.1',
    criterionName: 'Không đúng đồng phục, sai giày dép, thiếu phù hiệu',
    groupName: 'Tác phong',
    quantity: 2,
    pointsDeducted: 4,
    studentNames: ['Đỗ Minh Tuấn', 'Vũ Hồng Quang'],
    note: 'Đi dép lê không quai hậu, không đeo thẻ học sinh',
    proofImages: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-08-27 07:12',
    status: 'pending',
    locked: false
  },
  // Lớp 12/4 - T3: 3.5 Không tắt quạt (-5đ)
  {
    id: 'vio-006',
    classId: '12/4',
    className: 'Lớp 12/4',
    day: 'T3',
    date: '2026-08-26',
    weekNumber: 24,
    criterionId: '3.5',
    criterionName: 'Không tắt điện, quạt sau giờ học',
    groupName: 'Nề nếp tự quản',
    quantity: 1,
    pointsDeducted: 5,
    studentNames: ['Tập thể 12/4'],
    note: 'Tan học tiết 5 để 4 quạt trần quay liên tục',
    proofImages: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-08-26 11:45',
    status: 'accepted',
    locked: false
  },
  // Lớp 10/4 - T5: 3.7 Sử dụng ĐT không phép (-5đ)
  {
    id: 'vio-007',
    classId: '10/4',
    className: 'Lớp 10/4',
    day: 'T5',
    date: '2026-08-28',
    weekNumber: 24,
    criterionId: '3.7',
    criterionName: 'Sử dụng điện thoại không được phép',
    groupName: 'Nề nếp tự quản',
    quantity: 1,
    pointsDeducted: 5,
    studentNames: ['Nguyễn Hữu Đạt'],
    note: 'Chơi game trong giờ truy bài 15 phút',
    proofImages: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-08-28 07:05',
    status: 'accepted',
    locked: false
  },
  // Lớp 11/2 - T2: 2.1 Không trực nhật (-5đ)
  {
    id: 'vio-008',
    classId: '11/2',
    className: 'Lớp 11/2',
    day: 'T2',
    date: '2026-08-25',
    weekNumber: 24,
    criterionId: '2.1',
    criterionName: 'Không trực nhật',
    groupName: 'Vệ sinh',
    quantity: 1,
    pointsDeducted: 5,
    studentNames: ['Tổ 1 lớp 11/2'],
    note: 'Không lau bảng, bục giảng nhiều phấn vụn',
    proofImages: ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-08-25 07:15',
    status: 'accepted',
    locked: false
  }
];

const generateWeekDuties = (weekNum: number): DutyAssignment[] => [
  {
    id: `duty-w${weekNum}-01`,
    weekNumber: weekNum,
    day: 'T2',
    zone: 'Khối 10',
    auditorId: 'codo_nam',
    auditorName: 'Nguyễn Văn Nam',
    auditorClass: '11/2',
    shiftTime: '06:45 - 07:15 & 11:15 - 11:45',
    isLiveNow: true
  },
  {
    id: `duty-w${weekNum}-02`,
    weekNumber: weekNum,
    day: 'T2',
    zone: 'Khối 11',
    auditorId: 'codo_hai',
    auditorName: 'Phạm Đức Hải',
    auditorClass: '12/1',
    shiftTime: '06:45 - 07:15 & 11:15 - 11:45',
    isLiveNow: true
  },
  {
    id: `duty-w${weekNum}-03`,
    weekNumber: weekNum,
    day: 'T2',
    zone: 'Khối 12',
    auditorId: 'codo_linh',
    auditorName: 'Trần Thùy Linh',
    auditorClass: '10/3',
    shiftTime: '06:45 - 07:15 & 11:15 - 11:45',
    isLiveNow: true
  },
  {
    id: `duty-w${weekNum}-04`,
    weekNumber: weekNum,
    day: 'T2',
    zone: 'Cổng trường & Nhà xe',
    auditorId: 'codo_dung',
    auditorName: 'Lê Hoàng Dũng',
    auditorClass: '11/4',
    shiftTime: '06:30 - 07:15 & 11:15 - 12:00',
    isLiveNow: true
  },
  {
    id: `duty-w${weekNum}-05`,
    weekNumber: weekNum,
    day: 'T2',
    zone: 'Khu vực Sân trường',
    auditorId: 'codo_mai',
    auditorName: 'Vũ Ngọc Mai',
    auditorClass: '12/5',
    shiftTime: '06:45 - 07:15 & Giờ ra chơi',
    isLiveNow: true
  },
  // T3
  { id: `duty-w${weekNum}-06`, weekNumber: weekNum, day: 'T3', zone: 'Khối 10', auditorId: 'codo_nam', auditorName: 'Nguyễn Văn Nam', auditorClass: '11/2', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { id: `duty-w${weekNum}-07`, weekNumber: weekNum, day: 'T3', zone: 'Khối 11', auditorId: 'codo_hai', auditorName: 'Phạm Đức Hải', auditorClass: '12/1', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { id: `duty-w${weekNum}-08`, weekNumber: weekNum, day: 'T3', zone: 'Khối 12', auditorId: 'codo_linh', auditorName: 'Trần Thùy Linh', auditorClass: '10/3', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { id: `duty-w${weekNum}-08b`, weekNumber: weekNum, day: 'T3', zone: 'Cổng trường & Nhà xe', auditorId: 'codo_dung', auditorName: 'Lê Hoàng Dũng', auditorClass: '11/4', shiftTime: '06:30 - 07:15' },
  // T4
  { id: `duty-w${weekNum}-09`, weekNumber: weekNum, day: 'T4', zone: 'Khối 10', auditorId: 'codo_nam', auditorName: 'Nguyễn Văn Nam', auditorClass: '11/2', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { id: `duty-w${weekNum}-10`, weekNumber: weekNum, day: 'T4', zone: 'Khối 11', auditorId: 'codo_hai', auditorName: 'Phạm Đức Hải', auditorClass: '12/1', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { id: `duty-w${weekNum}-10b`, weekNumber: weekNum, day: 'T4', zone: 'Khu vực Sân trường', auditorId: 'codo_mai', auditorName: 'Vũ Ngọc Mai', auditorClass: '12/5', shiftTime: '06:45 - 07:15' },
  // T5
  { id: `duty-w${weekNum}-11`, weekNumber: weekNum, day: 'T5', zone: 'Khối 10', auditorId: 'codo_nam', auditorName: 'Nguyễn Văn Nam', auditorClass: '11/2', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { id: `duty-w${weekNum}-12`, weekNumber: weekNum, day: 'T5', zone: 'Khối 12', auditorId: 'codo_linh', auditorName: 'Trần Thùy Linh', auditorClass: '10/3', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { id: `duty-w${weekNum}-12b`, weekNumber: weekNum, day: 'T5', zone: 'Cổng trường & Nhà xe', auditorId: 'codo_dung', auditorName: 'Lê Hoàng Dũng', auditorClass: '11/4', shiftTime: '06:30 - 07:15' },
  // T6
  { id: `duty-w${weekNum}-13`, weekNumber: weekNum, day: 'T6', zone: 'Khối 10', auditorId: 'codo_nam', auditorName: 'Nguyễn Văn Nam', auditorClass: '11/2', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { id: `duty-w${weekNum}-14`, weekNumber: weekNum, day: 'T6', zone: 'Khối 11', auditorId: 'codo_hai', auditorName: 'Phạm Đức Hải', auditorClass: '12/1', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { id: `duty-w${weekNum}-14b`, weekNumber: weekNum, day: 'T6', zone: 'Khu vực Sân trường', auditorId: 'codo_mai', auditorName: 'Vũ Ngọc Mai', auditorClass: '12/5', shiftTime: '06:45 - 07:15' },
  // T7
  { id: `duty-w${weekNum}-15`, weekNumber: weekNum, day: 'T7', zone: 'Khối 10', auditorId: 'codo_nam', auditorName: 'Nguyễn Văn Nam', auditorClass: '11/2', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { id: `duty-w${weekNum}-16`, weekNumber: weekNum, day: 'T7', zone: 'Cổng trường & Nhà xe', auditorId: 'codo_dung', auditorName: 'Lê Hoàng Dũng', auditorClass: '11/4', shiftTime: '06:30 - 07:15 & 11:15 - 12:00' }
];

export const INITIAL_DUTIES: DutyAssignment[] = Array.from({ length: 30 }, (_, i) => generateWeekDuties(i + 1)).flat();

export const INITIAL_EVENTS: YouthEvent[] = [
  {
    id: 'evt-001',
    title: 'Hội Trại Truyền Thống Kỷ Niệm 95 Năm Ngày Thành Lập Đoàn (26/03)',
    description: 'Chương trình Hội trại toàn trường THPT Quang Trung - Đông Giang: Thi dựng lều trại đẹp, Hội thi trò chơi dân gian, Đêm nhạc Thanh niên và Lễ tuyên dương Đoàn viên Ưu tú.',
    category: 'Phong trào',
    thumbnail: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=600&auto=format&fit=crop&q=80',
    location: 'Sân vận động Trung tâm trường',
    startDate: '2026-03-25 07:30',
    endDate: '2026-03-26 21:00',
    bonusPoints: 20,
    maxSlots: 150,
    registeredCount: 138,
    registeredStudentIds: ['st-01', 'st-21', 'bithu_10_1', 'bithu_12_4', 'doanvien_minh', 'doanvien_hoa'],
    checkedInStudentIds: ['doanvien_hoa'],
    isRegistrationOpen: true,
    qrCodeValue: 'YOUTH-EVENT-2026-HOITRAI-2603'
  },
  {
    id: 'evt-002',
    title: 'Chiến Dịch Tình Nguyện "Chủ Nhật Xanh" - Vườn Cây Thanh Niên',
    description: 'Tổng vệ sinh khuôn viên trường học, chăm sóc bồn hoa thanh niên và phân loại rác thải tái chế gây quỹ ủng hộ học sinh có hoàn cảnh khó khăn tại Đông Giang.',
    category: 'Tình nguyện',
    thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    location: 'Khuôn viên Vườn thực nghiệm sinh học',
    startDate: '2026-09-06 07:00',
    endDate: '2026-09-06 10:30',
    bonusPoints: 10,
    maxSlots: 80,
    registeredCount: 65,
    registeredStudentIds: ['doanvien_minh', 'bithu_10_1', 'st-01'],
    checkedInStudentIds: [],
    isRegistrationOpen: true,
    qrCodeValue: 'YOUTH-EVENT-2026-CHUNHATXANH-0906'
  },
  {
    id: 'evt-003',
    title: 'Giải Bóng Đá Nam Nữ Truyền Thống Khối THPT Lần Thứ XII',
    description: 'Giải đấu giao hữu giữa các chi đoàn nhằm rèn luyện thể chất, tinh thần đoàn kết và tuyển chọn VĐV tiêu biểu cho Hội khỏe Phù Đổng cấp TP Đà Nẵng.',
    category: 'Thể thao',
    thumbnail: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=600&auto=format&fit=crop&q=80',
    location: 'Sân bóng cỏ nhân tạo trường',
    startDate: '2026-09-12 14:00',
    endDate: '2026-09-20 17:30',
    bonusPoints: 15,
    maxSlots: 36,
    registeredCount: 36,
    registeredStudentIds: ['bithu_12_4', 'st-21'],
    checkedInStudentIds: [],
    isRegistrationOpen: false,
    qrCodeValue: 'YOUTH-EVENT-2026-GIAIBONGDA-KHUTHPT'
  },
  {
    id: 'evt-004',
    title: 'Cuộc Thi Trực Tuyến "Tự Hào Đoàn TNCS Hồ Chí Minh"',
    description: 'Hội thi tìm hiểu lịch sử truyền thống vẻ vang của Đoàn, phong trào thanh niên xung kích và các tấm gương anh hùng trẻ tuổi.',
    category: 'Học thuật',
    thumbnail: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&auto=format&fit=crop&q=80',
    location: 'Phòng Tin học 1 & Online App',
    startDate: '2026-09-15 19:30',
    endDate: '2026-09-18 21:00',
    bonusPoints: 10,
    maxSlots: 200,
    registeredCount: 142,
    registeredStudentIds: ['doanvien_minh', 'doanvien_hoa', 'st-01', 'st-22'],
    checkedInStudentIds: [],
    isRegistrationOpen: true,
    qrCodeValue: 'YOUTH-EVENT-2026-TIMHIEUDOAN-ONLINE'
  }
];

export const INITIAL_NEWS: NewsPost[] = [
  // 1. THÔNG BÁO CHỈ ĐẠO & CÔNG VĂN ĐOÀN TRƯỜNG
  {
    id: 'ann-01',
    title: 'THÔNG BÁO KHẨN: Tăng Cường Kiểm Tra Nề Nếp & Quy Chế Trang Phục Tháng 9',
    excerpt: 'Ban Chấp hành Đoàn trường THPT Quang Trung - Đông Giang yêu cầu 100% đoàn viên, học sinh nghiêm túc chấp hành đồng phục, thẻ học sinh và không mang đồ ăn sáng vào lớp học.',
    content: `Căn cứ theo kế hoạch năm học mới và nội quy học đường, Ban Chấp hành Đoàn trường THPT Quang Trung - Đông Giang thông báo:
1. Từ ngày 01/09, Đội Cờ đỏ sẽ tăng cường kiểm tra nề nếp tác phong tại cổng trường từ 06h30 đến 07h00.
2. Tất cả học sinh phải đeo thẻ học sinh và mặc đúng đồng phục quy định của trường (Áo sơ mi trắng, quần tối màu, mang giày hoặc dép có quai hậu).
3. Tuyệt đối không sử dụng điện thoại trong giờ học khi chưa có hiệu lệnh của giáo viên bộ môn.
4. Đề nghị các Giáo viên chủ nhiệm và Ban cán sự 18 lớp thường xuyên đôn đốc, nhắc nhở chi đoàn thực hiện tốt để giữ vững thứ hạng thi đua.`,
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    author: 'Thầy Lê Hoàng Long',
    authorRole: 'Bí thư Đoàn Trường',
    publishDate: '2026-09-01 06:30',
    isPinned: true,
    isHidden: false,
    category: 'announcement',
    urgency: 'critical',
    tags: ['#ThongBaoKhan', '#NeNep', '#QuyCheTrangPhuc'],
    views: 1420,
    attachments: [
      { name: 'Ke_Hoach_Kiem_Tra_Ne_Nep_Thang_9.pdf', url: '#', size: '245 KB', type: 'application/pdf' }
    ]
  },
  {
    id: 'ann-02',
    title: 'CÔNG VĂN ĐIỀU ĐỘNG: Triệu Tập Cuộc Họp BCH Chi Đoàn 18 Lớp Triển Khai Kế Hoạch 26/03',
    excerpt: 'Mời toàn thể Bí thư và Lớp phó 18 chi đoàn tham gia phiên họp mở rộng chuẩn bị Hội trại truyền thống.',
    content: `BCH Đoàn trường trân trọng thông báo triệu tập cuộc họp chuẩn bị Hội trại thanh niên:
- Thời gian: 16h30 Chiều Thứ 5.
- Địa điểm: Phòng Hội Đồng Sư Phạm.
- Thành phần: Bí thư và Lớp phó Lao động của 18 Chi đoàn.
- Nội dung: Bốc thăm vị trí dựng lều trại và phổ biến tiêu chí chấm điểm kỷ cương hội trại.`,
    thumbnail: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=600&auto=format&fit=crop&q=80',
    author: 'BCH Đoàn Trường',
    authorRole: 'Ban Thường Vụ',
    publishDate: '2026-08-30 14:00',
    isPinned: true,
    isHidden: false,
    category: 'announcement',
    urgency: 'urgent',
    tags: ['#CongVan', '#TrieuTap', '#HoiTrai2603'],
    views: 980,
    attachments: [
      { name: 'Ke_Hoach_To_Chuc_Hoi_Trai_2026.pdf', url: '#', size: '512 KB', type: 'application/pdf' }
    ]
  },

  // 2. BẢN TIN & HOẠT ĐỘNG PHONG TRÀO ĐOÀN
  {
    id: 'news-01',
    title: 'Vinh Danh Top 3 Chi Đoàn Xuất Sắc Nhất Tuần 23 & Khen Thưởng Đội Cờ Đỏ',
    excerpt: 'Chúc mừng Chi đoàn 12/1 (Hạng Nhất), Chi đoàn 11/3 (Hạng Nhì) và Chi đoàn 10/1 (Hạng Ba) đã đạt số điểm thi đua xuất sắc trên 1430 điểm.',
    content: `Ban Thi đua - Khen thưởng Đoàn trường trân trọng tuyên dương các tập thể lớp đã có thành tích nề nếp vượt trội trong Tuần 23:
- 🥇 Giải Nhất: Lớp 12/1 (Điểm thi đua: 1438/1440 - Giữ vững ngôi vị dẫn đầu).
- 🥈 Giải Nhì: Lớp 11/3 (Điểm thi đua: 1432/1440 - Tăng 3 bậc).
- 🥉 Giải Ba: Lớp 10/1 (Điểm thi đua: 1428/1440 - Tập thể Khối 10 xuất sắc nhất).

Đồng thời, Đoàn trường biểu dương tinh thần trách nhiệm, công tâm của Đội Cờ đỏ trong công tác chấm thi đua minh bạch, khách quan.`,
    thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80',
    author: 'Ban Thi Đua Đoàn Trường',
    authorRole: 'BCH Đoàn',
    publishDate: '2026-08-31 08:00',
    isPinned: false,
    isHidden: false,
    category: 'news',
    urgency: 'normal',
    tags: ['#TuyenDuong', '#PhongTrao', '#TopLopXuatSac'],
    views: 890
  },
  {
    id: 'news-02',
    title: 'Kế Hoạch Tổ Chức Hội Thao Thanh Niên & Giải Kéo Co Toàn Trường',
    excerpt: 'Hội thao diễn ra từ ngày 10/09 đến 20/09 nhằm chào mừng kỷ niệm thành lập trường với các môn thi đấu: Cầu lông, Kéo co, Điền kinh và Cờ vua.',
    content: `Chào mừng năm học mới, Đoàn trường ban hành kế hoạch tổ chức Hội thao Thanh niên:
- Đối tượng: 18 chi đoàn thuộc 3 khối 10, 11, 12.
- Thời gian đăng ký: Từ nay đến hết 17h00 ngày 08/09.
- Cơ cấu giải thưởng: Cúp lưu niệm, Cờ thi đua và điểm cộng trực tiếp vào bảng điểm thi đua học kỳ cho các lớp đạt giải Nhất, Nhì, Ba.`,
    thumbnail: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=600&auto=format&fit=crop&q=80',
    author: 'Ủy viên Thể dục Thể thao',
    authorRole: 'BCH Đoàn',
    publishDate: '2026-08-29 15:30',
    isPinned: false,
    isHidden: false,
    category: 'news',
    urgency: 'normal',
    tags: ['#HoiThao', '#TheThao', '#DoanVien'],
    views: 650
  },
  {
    id: 'news-03',
    title: 'Ra Quân Chiến Dịch "Chủ Nhật Xanh" - Trồng Cây & Làm Sạch Khuôn Viên Trường',
    excerpt: 'Hơn 150 đoàn viên thanh niên 18 chi đoàn đã tích cực tham gia dọn dẹp, chỉnh trang khuôn viên trường học và vườn sinh học.',
    content: `Sáng Chủ nhật vừa qua, BCH Đoàn trường đã tổ chức thành công ngày hội "Chủ Nhật Xanh":
- Trồng mới 20 cây hoa thanh niên tại lối đi chính.
- Thu gom và phân loại hơn 50kg rác tái chế để gây quỹ khuyến học.
- Tuyên dương các bạn đoàn viên Chi đoàn 10/1 và 11/4 đã hoàn thành xuất sắc nhiệm vụ được giao.`,
    thumbnail: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&auto=format&fit=crop&q=80',
    author: 'Đội Tình Nguyện Xung Kích',
    authorRole: 'BCH Đoàn',
    publishDate: '2026-08-28 10:00',
    isPinned: false,
    isHidden: false,
    category: 'news',
    urgency: 'normal',
    tags: ['#ChuNhatXanh', '#TinhNguyen', '#BaoVeMoiTruong'],
    views: 520
  }
];

export const INITIAL_NOTICES: TaskNotice[] = [
  {
    id: 'not-01',
    title: 'Điều động lao động dọn vệ sinh Sân bóng chuẩn bị Hội thao',
    content: 'Phân công Chi đoàn 10/1 và 11/5 cử mỗi lớp 10 đoàn viên mang theo dụng cụ lao động tập trung tại Sân bóng cỏ nhân tạo lúc 14h00 chiều Thứ 6 (04/09). Lỗi vắng sẽ bị trừ điểm theo tiêu chí 1.6.',
    type: 'lao_dong',
    targetClasses: ['10/1', '11/5'],
    deadline: '2026-09-04 17:00',
    createdAt: '2026-09-01 09:00',
    assignedBy: 'Thầy Lê Hoàng Long - Bí thư Đoàn',
    status: 'pending'
  },
  {
    id: 'not-02',
    title: 'Triệu tập cuộc họp Ban Chấp Hành Chi đoàn 18 lớp',
    content: 'Mời Bí thư và Lớp phó Lao động của 18 chi đoàn tham dự cuộc họp triển khai kế hoạch Hội trại 26/03 vào lúc 16h30 Thứ 5 tại Phòng Hội đồng.',
    type: 'cuoc_hop',
    targetClasses: ['ALL'],
    deadline: '2026-09-03 17:30',
    createdAt: '2026-09-01 08:00',
    assignedBy: 'BCH Đoàn Trường',
    status: 'pending'
  }
];

export const INITIAL_LOGS: AuditLog[] = [
  {
    id: 'log-01',
    timestamp: '2026-09-01 07:15:30',
    userId: 'codo_nam',
    userName: 'Nguyễn Văn Nam',
    userRole: 'auditor',
    action: 'Ghi nhận vi phạm',
    details: 'Nhập lỗi 1.1 (Đi muộn) cho Lớp 10/1 - Số lượng: 2 HS',
    ipAddress: '192.168.1.45'
  },
  {
    id: 'log-02',
    timestamp: '2026-09-01 08:30:12',
    userId: 'gvcn_10_1',
    userName: 'Thầy Nguyễn Văn Thành',
    userRole: 'manager',
    action: 'Gửi yêu cầu phúc khảo',
    details: 'Gửi đơn khiếu nại lỗi 2.2 (Vệ sinh) ngày T3 cho Lớp 10/1 kèm minh chứng',
    ipAddress: '192.168.1.102'
  },
  {
    id: 'log-03',
    timestamp: '2026-09-01 09:00:00',
    userId: 'admin',
    userName: 'Thầy Lê Hoàng Long',
    userRole: 'admin',
    action: 'Đăng tải thông báo',
    details: 'Đăng thông báo khẩn "Tăng cường kiểm tra nề nếp tháng 9"',
    ipAddress: '192.168.1.10'
  }
];

export const INITIAL_ACTIVITY_SLIDES: ActivitySlide[] = [
  {
    id: 'slide-1',
    title: 'Lễ Kết Nạp Đoàn Viên Mới – Lớp Đoàn Viên 95 Năm Thành Lập Đoàn',
    subtitle: 'Vinh dự đứng vào hàng ngũ Đoàn TNCS Hồ Chí Minh của 85 thanh niên ưu tú khối 10 & 11',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=75',
    date: '26/03/2026',
    tag: 'Kết nạp Đoàn',
    isActive: true,
    order: 1
  },
  {
    id: 'slide-2',
    title: 'Hội Thao Thanh Niên & Giải Kéo Co Truyền Thống 18 Chi Đoàn',
    subtitle: 'Sôi nổi các môn thi đấu: Bóng chuyền, Kéo co, Điền kinh và Nhảy dân vũ sân trường',
    imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=800&auto=format&fit=crop&q=75',
    date: '19/05/2026',
    tag: 'Hội thao',
    isActive: true,
    order: 2
  },
  {
    id: 'slide-3',
    title: 'Chiến Dịch Tình Nguyện "Hoa Phượng Đỏ" & Tiếp Sức Mùa Thi 2026',
    subtitle: 'Tuổi trẻ THPT Quang Trung hỗ trợ phân luồng giao thông, phát nước và cổ vũ sĩ tử',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&auto=format&fit=crop&q=75',
    date: '10/06/2026',
    tag: 'Tình nguyện',
    isActive: true,
    order: 3
  },
  {
    id: 'slide-4',
    title: 'Diễn Đàn "Xây Dựng Tình Bạn Đẹp – Nói Không Với Bạo Lực Học Đường"',
    subtitle: 'Chuyên đề giáo dục đạo đức, kỹ năng sống văn minh và văn hóa ứng xử thanh niên',
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=75',
    date: '15/08/2026',
    tag: 'Kỹ năng sống',
    isActive: true,
    order: 4
  }
];

export const INITIAL_ACTIVITY_REPORTS: import('../types').ActivityReport[] = [
  {
    id: 'act-rep-01',
    activityId: 'news-03',
    activityTitle: 'Hội Thao Thanh Niên & Giải Kéo Co Toàn Trường',
    activityType: 'the_thao',
    classId: '10/1',
    className: '10/1',
    secretaryName: 'Nguyễn Quang Minh',
    reportedAt: '01/09/2026 16:30',
    participantCount: 8,
    participants: [
      { studentId: 'HS20241001', name: 'Nguyễn Quang Minh', gender: 'Nam', phone: '0988.111.001', role: 'Đội trưởng Kéo co', achievement: 'Giải Nhì', note: 'Tham gia đầy đủ 100% các buổi tập' },
      { studentId: 'HS20241002', name: 'Trần Thị Mai', gender: 'Nữ', phone: '0988.111.002', role: 'VĐV Điền kinh', achievement: 'Giải Ba 100m Nữ' },
      { studentId: 'HS20241003', name: 'Lê Hoàng Nam', gender: 'Nam', phone: '0988.111.003', role: 'VĐV Kéo co' },
      { studentId: 'HS20241004', name: 'Phạm Thu Hà', gender: 'Nữ', phone: '0988.111.004', role: 'Cổ động viên trưởng' },
      { studentId: 'HS20241005', name: 'Võ Minh Quân', gender: 'Nam', phone: '0988.111.005', role: 'VĐV Cầu lông' },
      { studentId: 'HS20241006', name: 'Đỗ Thảo Vy', gender: 'Nữ', phone: '0988.111.006', role: 'Cổ động viên' },
      { studentId: 'HS20241007', name: 'Bùi Đức Anh', gender: 'Nam', phone: '0988.111.007', role: 'VĐV Cờ vua' },
      { studentId: 'HS20241008', name: 'Hoàng Ánh Tuyết', gender: 'Nữ', phone: '0988.111.008', role: 'Hậu cần' }
    ],
    status: 'submitted',
    adminFeedback: 'Đã tiếp nhận danh sách báo cáo Chi đoàn 10/1.'
  },
  {
    id: 'act-rep-02',
    activityId: 'news-02',
    activityTitle: 'Chiến Dịch Tình Nguyện "Mùa Hè Xanh" & Ngày Chủ Nhật Xanh',
    activityType: 'tinh_nguyen',
    classId: '12/1',
    className: '12/1',
    secretaryName: 'Lê Thị Thu',
    reportedAt: '31/08/2026 17:00',
    participantCount: 5,
    participants: [
      { studentId: 'HS20241201', name: 'Lê Thị Thu', gender: 'Nữ', phone: '0988.121.001', role: 'Trưởng nhóm', achievement: 'Hoàn thành xuất sắc' },
      { studentId: 'HS20241202', name: 'Nguyễn Văn Hùng', gender: 'Nam', phone: '0988.121.002', role: 'Tình nguyện viên' },
      { studentId: 'HS20241203', name: 'Trần Bảo Ngọc', gender: 'Nữ', phone: '0988.121.003', role: 'Tuyên truyền viên' },
      { studentId: 'HS20241204', name: 'Đặng Tuấn Kiệt', gender: 'Nam', phone: '0988.121.004', role: 'Tình nguyện viên' },
      { studentId: 'HS20241205', name: 'Phan Mỹ Duyên', gender: 'Nữ', phone: '0988.121.005', role: 'Hậu cần & Chụp ảnh' }
    ],
    status: 'verified',
    adminFeedback: 'Đã xác nhận & biểu dương tinh thần xung kích Chi đoàn 12/1!'
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: 'notif-01',
    targetRole: 'manager',
    targetClassId: '10/1',
    title: '⚠️ Ghi nhận lỗi vi phạm mới Lớp 10/1',
    message: 'Cờ đỏ Nguyễn Văn Nam vừa ghi nhận lỗi "Đi học muộn sau 7h00" (-2đ) vào sáng Thứ 2.',
    type: 'violation',
    createdAt: '01/09/2026 07:15',
    isRead: false,
    linkView: 'manager'
  },
  {
    id: 'notif-02',
    targetRole: 'admin',
    targetClassId: 'ALL',
    title: '📩 Đơn khiếu nại phúc khảo mới từ GVCN 10/1',
    message: 'Cô Trần Thị Mai Hương gửi đơn khiếu nại lỗi 2.2 (Vệ sinh) ngày T3 kèm ảnh minh chứng hợp lệ.',
    type: 'appeal',
    createdAt: '01/09/2026 08:30',
    isRead: false,
    linkView: 'admin'
  },
  {
    id: 'notif-03',
    targetRole: 'admin',
    targetClassId: 'ALL',
    title: '🚩 Báo cáo phong trào mới từ Chi đoàn 10/1',
    message: 'Bí thư Chi đoàn 10/1 đã nộp danh sách 8 học sinh tham gia Hội thao Thanh niên 26/3.',
    type: 'report',
    createdAt: '01/09/2026 09:10',
    isRead: false,
    linkView: 'admin'
  },
  {
    id: 'notif-04',
    targetRole: 'youth_secretary',
    targetClassId: '12/1',
    title: '🎉 Đoàn trường đã duyệt Báo cáo phong trào',
    message: 'Danh sách 5 học sinh tham gia "Mùa Hè Xanh" của Chi đoàn 12/1 đã được Đoàn trường biểu dương.',
    type: 'event',
    createdAt: '01/09/2026 10:00',
    isRead: true,
    linkView: 'secretary'
  },
  {
    id: 'notif-05',
    targetRole: 'all',
    targetClassId: 'ALL',
    title: '📢 Thông báo khẩn từ Đoàn trường THPT Quang Trung',
    message: 'Triển khai tuần lễ cao điểm bảo đảm an toàn giao thông và nề nếp tác phong đầu năm học.',
    type: 'system',
    createdAt: '01/09/2026 06:45',
    isRead: true,
    linkView: 'portal'
  }
];

export const INITIAL_ACADEMIC_YEARS: AcademicYear[] = [
  {
    id: '2025_2026',
    name: 'Năm học 2025 - 2026',
    startDate: '2025-09-05',
    endDate: '2026-05-31',
    isCurrent: true,
    isFrozen: false,
    createdAt: '2025-08-15 08:00',
    notes: 'Năm học hiện hành của toàn trường THPT Quang Trung'
  },
  {
    id: '2024_2025',
    name: 'Năm học 2024 - 2025 (Lịch sử)',
    startDate: '2024-09-05',
    endDate: '2025-05-31',
    isCurrent: false,
    isFrozen: true,
    createdAt: '2024-08-15 08:00',
    notes: 'Dữ liệu lưu trữ năm học trước (Chỉ xem)'
  }
];



