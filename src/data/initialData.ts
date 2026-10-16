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
  AcademicYear,
  MediaFolder,
  MediaItem,
  DocumentFolder,
  DocumentFile
} from '../types';

export const INITIAL_SCHOOL_SETTINGS: SchoolSettings = {
  schoolName: 'Trường THPT Quang Trung - Đông Giang',
  youthUnionName: 'Đoàn trường THPT Quang Trung - Đông Giang',
  slogan: 'Tuổi trẻ Quang Trung – Tiên phong, Gương mẫu, Bản lĩnh, Sáng tạo',
  address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng',
  email: 'doantruongquangtrungdonggiang@gmail.com',
  phone: '0988806194',
  themeColor: 'emerald',
  logoUrl: '/brand/logo_truong.svg',
  youthUnionLogoUrl: '/brand/huy_hieu_doan.svg',
  bannerTopImage: '/brand/banner_top.svg',
  footerBannerImage: '/brand/banner_footer.svg',
  semester1EndWeek: 18,
  semester1Name: 'Học Kỳ 1',
  semester2Name: 'Học Kỳ 2'
};

export const INITIAL_ZONES: DutyZone[] = [
  { id: 'zone-1', name: 'Phòng 1 & 2 (Tầng 1)', description: 'Giám sát dãy phòng học 1, 2 tầng trệt', icon: '🏫' },
  { id: 'zone-2', name: 'Phòng 3 (Tầng 1) & Phòng 10 (Tầng 2)', description: 'Giám sát phòng 3 tầng trệt & phòng 10 tầng 2', icon: '🏢' },
  { id: 'zone-3', name: 'Phòng 6, 7, 8 & 9 (Tầng 2)', description: 'Giám sát dãy phòng học tầng 2', icon: '🎓' },
  { id: 'zone-4', name: 'Phòng 11, 12, 13, 14 & 15 (Tầng 3)', description: 'Giám sát dãy phòng học tầng 3', icon: '📚' },
  { id: 'zone-5', name: 'Cổng trường & Nhà xe', description: 'Cổng chính, bãi đỗ xe học sinh & GV', icon: '🚲' },
  { id: 'zone-6', name: 'Sân trường & Khu Căn tin', description: 'Sân lễ, cột cờ & khu căng tin', icon: '🌳' },
];

export const INITIAL_AUDITORS: AuditorMember[] = [
  // Khối 12 (8 cán bộ Cờ đỏ)
  { id: 'codo_12_1_dieu', name: 'Đặng Cát Diệu', classId: '12/1', phone: '0905.111.201', assignedZone: 'Phòng 7 & 8 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_12_1_dan', name: 'Lê Nguyễn Linh Đan', classId: '12/1', phone: '0905.111.202', assignedZone: 'Phòng 7 & 8 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_12_2_thuy', name: 'Bríu Thị Xuân Thủy', classId: '12/2', phone: '0905.111.203', assignedZone: 'Phòng 6 & 9 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_12_2_sam', name: 'Arâl Sâm', classId: '12/2', phone: '0905.111.204', assignedZone: 'Phòng 6 & 9 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_12_3_sy', name: 'Aria Văn Sỹ', classId: '12/3', phone: '0905.111.205', assignedZone: 'Phòng 1 & 2 (tầng 1)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_12_3_tri', name: 'Hốih Minh Trí', classId: '12/3', phone: '0905.111.206', assignedZone: 'Phòng 1 & 2 (tầng 1)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_12_4_maia', name: 'Pơloong Thị Mai A', classId: '12/4', phone: '0905.111.207', assignedZone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_12_4_my', name: 'Pơloong Thị Hoài Mỹ', classId: '12/4', phone: '0905.111.208', assignedZone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },

  // Khối 11 (10 cán bộ Cờ đỏ)
  { id: 'codo_11_1_truc', name: 'Lê Thị Thanh Trúc', classId: '11/1', phone: '0905.222.101', assignedZone: 'Phòng 14 & 15 (tầng 3)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_11_1_uyen', name: 'Đỗ Nguyễn Tường Uyên', classId: '11/1', phone: '0905.222.102', assignedZone: 'Phòng 14 & 15 (tầng 3)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_11_2_thai', name: 'Alăng Hồng Thái', classId: '11/2', phone: '0905.222.103', assignedZone: 'Phòng 12 & 13 (tầng 3)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_11_2_thu', name: 'Alăng Thị Anh Thư', classId: '11/2', phone: '0905.222.104', assignedZone: 'Phòng 12 & 13 (tầng 3)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_11_3_hoang', name: 'Bríu Lâm Hoàng', classId: '11/3', phone: '0905.222.105', assignedZone: 'Phòng 15 (tầng 3) & Phòng 9 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_11_3_na', name: 'A Lăng Sa-A Na', classId: '11/3', phone: '0905.222.106', assignedZone: 'Phòng 15 (tầng 3) & Phòng 9 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_11_4_sen', name: 'Ploong Sên', classId: '11/4', phone: '0905.222.107', assignedZone: 'Phòng 14 (tầng 3)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_11_4_unh', name: 'Pơloong Thị Unh', classId: '11/4', phone: '0905.222.108', assignedZone: 'Phòng 14 (tầng 3)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_11_5_dat', name: 'Alăng Đạt', classId: '11/5', phone: '0905.222.109', assignedZone: 'Phòng 12 & 13 (tầng 3)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_11_5_nhu', name: 'A lăng Thị Quỳnh Như', classId: '11/5', phone: '0905.222.110', assignedZone: 'Phòng 12 & 13 (tầng 3)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },

  // Khối 10 (12 cán bộ Cờ đỏ)
  { id: 'codo_10_1_sao', name: 'Hôih Thị Ánh Sao', classId: '10/1', phone: '0905.333.101', assignedZone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_10_1_thanh', name: 'Ngô Nguyễn Công Thành', classId: '10/1', phone: '0905.333.102', assignedZone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_10_2_hao', name: 'A ting Thị Hạo', classId: '10/2', phone: '0905.333.103', assignedZone: 'Phòng 1 & 2 (tầng 1)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_10_2_duy', name: 'Võ Thanh Duy', classId: '10/2', phone: '0905.333.104', assignedZone: 'Phòng 1 & 2 (tầng 1)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_10_3_nuong', name: 'Arất Thị Nương', classId: '10/3', phone: '0905.333.105', assignedZone: 'Phòng 1 & 3 (tầng 1)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_10_3_nhu', name: 'Bríu Thị Bảo Như', classId: '10/3', phone: '0905.333.106', assignedZone: 'Phòng 1 & 3 (tầng 1)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_10_4_thy', name: 'Ating Dương Khánh Thy', classId: '10/4', phone: '0905.333.107', assignedZone: 'Phòng 9 & 10 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_10_4_diem', name: 'Bhnướch Thị Diễm', classId: '10/4', phone: '0905.333.108', assignedZone: 'Phòng 9 & 10 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_10_5_gai', name: 'Bling Thị Gái', classId: '10/5', phone: '0905.333.109', assignedZone: 'Phòng 1 & 2 (tầng 1)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_10_5_hue', name: 'Arâl Thị Huế', classId: '10/5', phone: '0905.333.110', assignedZone: 'Phòng 1 & 2 (tầng 1)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_10_6_mi', name: 'A lăng Thị Hoạ Mi', classId: '10/6', phone: '0905.333.111', assignedZone: 'Phòng 3 (tầng 1) & Phòng 9 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
  { id: 'codo_10_6_thuat', name: 'Alăng Thuật', classId: '10/6', phone: '0905.333.112', assignedZone: 'Phòng 3 (tầng 1) & Phòng 9 (tầng 2)', defaultShiftTime: '06:45 - 07:15 & 11:15 - 11:45', isActive: true },
];

export const INITIAL_WEEKS: WeekConfig[] = [
  { weekNumber: 1, title: 'Tuần 1', startDate: '2026-09-07', endDate: '2026-09-12', isCurrent: true, isLocked: false, note: 'Khai giảng & Bắt đầu HK1', semester: 1 },
  { weekNumber: 2, title: 'Tuần 2', startDate: '2026-09-14', endDate: '2026-09-19', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 1 },
  { weekNumber: 3, title: 'Tuần 3', startDate: '2026-09-21', endDate: '2026-09-26', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 1 },
  { weekNumber: 4, title: 'Tuần 4', startDate: '2026-09-28', endDate: '2026-10-03', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 1 },
  { weekNumber: 5, title: 'Tuần 5', startDate: '2026-10-05', endDate: '2026-10-10', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 1 },
  { weekNumber: 6, title: 'Tuần 6', startDate: '2026-10-12', endDate: '2026-10-17', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 1 },
  { weekNumber: 7, title: 'Tuần 7', startDate: '2026-10-19', endDate: '2026-10-24', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 1 },
  { weekNumber: 8, title: 'Tuần 8', startDate: '2026-10-26', endDate: '2026-10-31', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 1 },
  { weekNumber: 9, title: 'Tuần 9', startDate: '2026-11-02', endDate: '2026-11-07', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 1 },
  { weekNumber: 10, title: 'Tuần 10', startDate: '2026-11-09', endDate: '2026-11-14', isCurrent: false, isLocked: false, note: 'Thi đua chào mừng Ngày Nhà giáo VN 20/11', semester: 1 },
  { weekNumber: 11, title: 'Tuần 11', startDate: '2026-11-16', endDate: '2026-11-21', isCurrent: false, isLocked: false, note: 'Tuần lễ cao điểm 20/11', semester: 1 },
  { weekNumber: 12, title: 'Tuần 12', startDate: '2026-11-23', endDate: '2026-11-28', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 1 },
  { weekNumber: 13, title: 'Tuần 13', startDate: '2026-11-30', endDate: '2026-12-05', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 1 },
  { weekNumber: 14, title: 'Tuần 14', startDate: '2026-12-07', endDate: '2026-12-12', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 1 },
  { weekNumber: 15, title: 'Tuần 15', startDate: '2026-12-14', endDate: '2026-12-19', isCurrent: false, isLocked: false, note: 'Ôn tập & kiểm tra định kỳ HK1', semester: 1 },
  { weekNumber: 16, title: 'Tuần 16', startDate: '2026-12-21', endDate: '2026-12-26', isCurrent: false, isLocked: false, note: 'Thi đua chào mừng Ngày QĐND VN 22/12', semester: 1 },
  { weekNumber: 17, title: 'Tuần 17', startDate: '2026-12-28', endDate: '2027-01-02', isCurrent: false, isLocked: false, note: 'Tuần học cuối năm dương lịch', semester: 1 },
  { weekNumber: 18, title: 'Tuần 18', startDate: '2027-01-04', endDate: '2027-01-09', isCurrent: false, isLocked: false, note: 'Tổng kết thi đua Học kỳ 1', semester: 1 },
  { weekNumber: 19, title: 'Tuần 19', startDate: '2027-01-11', endDate: '2027-01-16', isCurrent: false, isLocked: false, note: 'Bắt đầu Học kỳ 2', semester: 2 },
  { weekNumber: 20, title: 'Tuần 20', startDate: '2027-01-18', endDate: '2027-01-23', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 2 },
  { weekNumber: 21, title: 'Tuần 21', startDate: '2027-01-25', endDate: '2027-01-30', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 2 },
  { weekNumber: 22, title: 'Tuần 22', startDate: '2027-02-01', endDate: '2027-02-06', isCurrent: false, isLocked: false, note: 'Thi đua chào mừng Ngày thành lập Đảng 3/2', semester: 2 },
  { weekNumber: 23, title: 'Tuần 23', startDate: '2027-02-08', endDate: '2027-02-13', isCurrent: false, isLocked: false, note: 'Tuần học trước Tết Nguyên Đán', semester: 2 },
  { weekNumber: 24, title: 'Tuần 24', startDate: '2027-02-15', endDate: '2027-02-20', isCurrent: false, isLocked: false, note: 'Tuần học thi đua sau Tết', semester: 2 },
  { weekNumber: 25, title: 'Tuần 25', startDate: '2027-02-22', endDate: '2027-02-27', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 2 },
  { weekNumber: 26, title: 'Tuần 26', startDate: '2027-03-01', endDate: '2027-03-06', isCurrent: false, isLocked: false, note: 'Khởi động Tháng Thanh Niên', semester: 2 },
  { weekNumber: 27, title: 'Tuần 27', startDate: '2027-03-08', endDate: '2027-03-13', isCurrent: false, isLocked: false, note: 'Thi đua chào mừng Ngày Quốc tế Phụ nữ 8/3', semester: 2 },
  { weekNumber: 28, title: 'Tuần 28', startDate: '2027-03-15', endDate: '2027-03-20', isCurrent: false, isLocked: false, note: 'Cao điểm phong trào Tháng Thanh Niên', semester: 2 },
  { weekNumber: 29, title: 'Tuần 29', startDate: '2027-03-22', endDate: '2027-03-27', isCurrent: false, isLocked: false, note: 'Kỷ niệm Ngày thành lập Đoàn TNCS HCM 26/3', semester: 2 },
  { weekNumber: 30, title: 'Tuần 30', startDate: '2027-03-29', endDate: '2027-04-03', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 2 },
  { weekNumber: 31, title: 'Tuần 31', startDate: '2027-04-05', endDate: '2027-04-10', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 2 },
  { weekNumber: 32, title: 'Tuần 32', startDate: '2027-04-12', endDate: '2027-04-17', isCurrent: false, isLocked: false, note: 'Ôn tập kiểm tra cuối năm', semester: 2 },
  { weekNumber: 33, title: 'Tuần 33', startDate: '2027-04-19', endDate: '2027-04-24', isCurrent: false, isLocked: false, note: 'Tuần học thi đua nề nếp', semester: 2 },
  { weekNumber: 34, title: 'Tuần 34', startDate: '2027-04-26', endDate: '2027-05-01', isCurrent: false, isLocked: false, note: 'Chào mừng 30/4 & 1/5', semester: 2 },
  { weekNumber: 35, title: 'Tuần 35', startDate: '2027-05-03', endDate: '2027-05-08', isCurrent: false, isLocked: false, note: 'Tổng kết năm học & Chốt thi đua toàn trường', semester: 2 }
];

export const INITIAL_CLASSES: ClassInfo[] = [
  // Khối 10 (6 Lớp)
  {
    id: '10/1',
    name: 'Lớp 10/1',
    grade: 10,
    gvcnName: 'Rapát Thị Mận',
    gvcnId: 'gvcn_10_1',
    classPresidentName: 'Lâm Xuân Tín',
    classPresidentPhone: '0372076304',
    academicVicePresidentName: 'Phạm Nguyễn Bảo Vi',
    academicVicePresidentPhone: '0343226894',
    bithuName: 'Lâm Xuân Tín',
    bithuId: 'bithu_10_1',
    bithuPhone: '0372076304',
    deputySecretaryName: 'Phạm Nguyễn Bảo Vi',
    deputySecretaryPhone: '0343226894',
    totalStudents: 42,
    unionMembers: 35,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '10/2',
    name: 'Lớp 10/2',
    grade: 10,
    gvcnName: 'ALăng Thị Moáy',
    gvcnId: 'gvcn_10_2',
    classPresidentName: 'Nguyễn Hữu Tùng Giang',
    classPresidentPhone: '0398765432',
    academicVicePresidentName: 'Lê Gia Hân',
    academicVicePresidentPhone: '0812777515',
    bithuName: 'Nguyễn Hữu Tùng Giang',
    bithuId: 'bithu_10_2',
    bithuPhone: '0398765432',
    deputySecretaryName: 'Lê Gia Hân',
    deputySecretaryPhone: '0812777515',
    totalStudents: 40,
    unionMembers: 32,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '10/3',
    name: 'Lớp 10/3',
    grade: 10,
    gvcnName: 'Nguyễn Văn Tiểu',
    gvcnId: 'gvcn_10_3',
    classPresidentName: 'Arất Thị Bảo Châu',
    classPresidentPhone: '0326043242',
    academicVicePresidentName: 'Đinh Đoàn Hà Anh',
    academicVicePresidentPhone: '0867371025',
    bithuName: 'Arất Thị Bảo Châu',
    bithuId: 'bithu_10_3',
    bithuPhone: '0326043242',
    deputySecretaryName: 'Đinh Đoàn Hà Anh',
    deputySecretaryPhone: '0867371025',
    totalStudents: 43,
    unionMembers: 36,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '10/4',
    name: 'Lớp 10/4',
    grade: 10,
    gvcnName: 'Bùi Ngọc Giao',
    gvcnId: 'gvcn_10_4',
    classPresidentName: 'Alăng Thị Hồng Vân',
    classPresidentPhone: '0366852391',
    academicVicePresidentName: 'Alăng Thị Thảo My',
    academicVicePresidentPhone: '0352180084',
    bithuName: 'Alăng Thị Hồng Vân',
    bithuId: 'bithu_10_4',
    bithuPhone: '0366852391',
    deputySecretaryName: 'Alăng Thị Thảo My',
    deputySecretaryPhone: '0352180084',
    totalStudents: 41,
    unionMembers: 34,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '10/5',
    name: 'Lớp 10/5',
    grade: 10,
    gvcnName: 'Pơloong Thị Lý',
    gvcnId: 'gvcn_10_5',
    classPresidentName: 'Bríu Long Thịnh',
    classPresidentPhone: '0399374288',
    academicVicePresidentName: 'Trần Lâm',
    academicVicePresidentPhone: '',
    bithuName: 'Bríu Long Thịnh',
    bithuId: 'bithu_10_5',
    bithuPhone: '0399374288',
    deputySecretaryName: 'Trần Lâm',
    deputySecretaryPhone: '',
    totalStudents: 40,
    unionMembers: 30,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '10/6',
    name: 'Lớp 10/6',
    grade: 10,
    gvcnName: 'Đinh Thị Thu',
    gvcnId: 'gvcn_10_6',
    classPresidentName: 'Alăng Thị Lung Linh',
    classPresidentPhone: '',
    academicVicePresidentName: 'Arất Thị Nhậm',
    academicVicePresidentPhone: '',
    bithuName: 'Alăng Thị Lung Linh',
    bithuId: 'bithu_10_6',
    bithuPhone: '',
    deputySecretaryName: 'Arất Thị Nhậm',
    deputySecretaryPhone: '',
    totalStudents: 44,
    unionMembers: 38,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },

  // Khối 11 (5 Lớp)
  {
    id: '11/1',
    name: 'Lớp 11/1',
    grade: 11,
    gvcnName: 'Phát Xuân Quý',
    gvcnId: 'gvcn_11_1',
    classPresidentName: 'Nguyễn Hữu Quang Huy',
    classPresidentPhone: '0818777565',
    academicVicePresidentName: 'Nguyễn Phương Thúy',
    academicVicePresidentPhone: '0325098321',
    bithuName: 'Nguyễn Thị Bảo Yến',
    bithuId: 'bithu_11_1',
    bithuPhone: '0978819242',
    deputySecretaryName: 'Võ Viết Tới',
    deputySecretaryPhone: '0923150635',
    totalStudents: 42,
    unionMembers: 40,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '11/2',
    name: 'Lớp 11/2',
    grade: 11,
    gvcnName: 'Phạm Thanh Phương',
    gvcnId: 'gvcn_11_2',
    classPresidentName: 'Arất Thị Ngọc Ánh',
    classPresidentPhone: '0387650317',
    academicVicePresidentName: 'Alăng Thị Phi Yến',
    academicVicePresidentPhone: '0961640577',
    bithuName: 'Bnuớch Thị Như Tuệ',
    bithuId: 'bithu_11_2',
    bithuPhone: '',
    deputySecretaryName: 'Alăng Thị Phi Yến',
    deputySecretaryPhone: '0961640577',
    totalStudents: 41,
    unionMembers: 39,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '11/3',
    name: 'Lớp 11/3',
    grade: 11,
    gvcnName: 'Alăng Thị Đặng',
    gvcnId: 'gvcn_11_3',
    classPresidentName: 'Alăng Quân',
    classPresidentPhone: '0359845008',
    academicVicePresidentName: 'A lăng Thị Kyn Sun',
    academicVicePresidentPhone: '',
    bithuName: 'Ating Thị Ánh Nguyệt',
    bithuId: 'bithu_11_3',
    bithuPhone: '0393906020',
    deputySecretaryName: 'Arâl Thị Phi',
    deputySecretaryPhone: '',
    totalStudents: 43,
    unionMembers: 41,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '11/4',
    name: 'Lớp 11/4',
    grade: 11,
    gvcnName: 'Blúp Thị Viết',
    gvcnId: 'gvcn_11_4',
    classPresidentName: 'Alăng Nhật Lâm',
    classPresidentPhone: '0395561653',
    academicVicePresidentName: 'Bnuớch Thị Võng',
    academicVicePresidentPhone: '0348768641',
    bithuName: 'Bnuớch Thị Võng',
    bithuId: 'bithu_11_4',
    bithuPhone: '0348768641',
    deputySecretaryName: 'Alăng Nhật Lâm',
    deputySecretaryPhone: '0961026044',
    totalStudents: 40,
    unionMembers: 38,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '11/5',
    name: 'Lớp 11/5',
    grade: 11,
    gvcnName: 'Lê Quang Hét',
    gvcnId: 'gvcn_11_5',
    classPresidentName: 'A Lăng Thị Sương',
    classPresidentPhone: '0378783550',
    academicVicePresidentName: 'Zơ Đêl Thị Mai Xuyến',
    academicVicePresidentPhone: '0342415450',
    bithuName: 'Arâl Thị My My',
    bithuId: 'bithu_11_5',
    bithuPhone: '',
    deputySecretaryName: 'Hôih Thị Kiên Thy',
    deputySecretaryPhone: '',
    totalStudents: 42,
    unionMembers: 41,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },

  // Khối 12 (4 Lớp)
  {
    id: '12/1',
    name: 'Lớp 12/1',
    grade: 12,
    gvcnName: 'Zơrâm Thị Thủy',
    gvcnId: 'gvcn_12_1',
    classPresidentName: 'Nguyễn Tấn Dũng',
    classPresidentPhone: '0347150114',
    academicVicePresidentName: 'Plinh Thị Mai Châu',
    academicVicePresidentPhone: '0336349705',
    bithuName: 'Đặng Cát Diệu',
    bithuId: 'bithu_12_1',
    bithuPhone: '0367031635',
    deputySecretaryName: 'Lê Nguyễn Linh Đan',
    deputySecretaryPhone: '0865738443',
    totalStudents: 44,
    unionMembers: 44,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '12/2',
    name: 'Lớp 12/2',
    grade: 12,
    gvcnName: 'Thông Thị Bông',
    gvcnId: 'gvcn_12_2',
    classPresidentName: 'Ating Mía',
    classPresidentPhone: '0369206085',
    academicVicePresidentName: 'Bnuớch Thị Mỹ',
    academicVicePresidentPhone: '0973919231',
    bithuName: 'Arất Thị Tiểu Liên',
    bithuId: 'bithu_12_2',
    bithuPhone: '0969645607',
    deputySecretaryName: 'Alăng Thị Ni',
    deputySecretaryPhone: '0354393342',
    totalStudents: 43,
    unionMembers: 43,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '12/3',
    name: 'Lớp 12/3',
    grade: 12,
    gvcnName: 'Sava Thị Hòa',
    gvcnId: 'gvcn_12_3',
    classPresidentName: 'Alăng Tình',
    classPresidentPhone: '0325003571',
    academicVicePresidentName: 'Alăng Phú Lộc',
    academicVicePresidentPhone: '0372890142',
    bithuName: 'Alăng Tình',
    bithuId: 'bithu_12_3',
    bithuPhone: '0325003571',
    deputySecretaryName: 'Alăng Thị Tiết',
    deputySecretaryPhone: '',
    totalStudents: 42,
    unionMembers: 42,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  },
  {
    id: '12/4',
    name: 'Lớp 12/4',
    grade: 12,
    gvcnName: 'Lê Nguyên Trưởng',
    gvcnId: 'gvcn_12_4',
    classPresidentName: 'Lê Thị Thảo Nguyên',
    classPresidentPhone: '0346562789',
    academicVicePresidentName: 'Pơloong Thị Khuyên',
    academicVicePresidentPhone: '0326406714',
    bithuName: 'Lê Thị Thảo Nguyên',
    bithuId: 'bithu_12_4',
    bithuPhone: '0346562789',
    deputySecretaryName: 'Pơloong Thị Mai A',
    deputySecretaryPhone: '0335300049',
    totalStudents: 45,
    unionMembers: 45,
    standardScore: 1440,
    isArchived: false,
    academicYearId: '2026_2027'
  }
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
  },
  {
    id: 'bonus_custom',
    groupId: 'I.1',
    groupName: 'Khen thưởng & Điểm cộng',
    groupStandardScore: 0,
    code: 'bonus_custom',
    name: 'Khen thưởng phong trào Đoàn',
    type: 'bonus',
    points: 1,
    unit: 'điểm',
    isEnabled: true,
    description: 'Điểm thưởng phong trào, hoạt động Đoàn, khen thưởng đột xuất'
  }
];

export const INITIAL_USERS: User[] = [
  // ================= 1. BAN GIÁM HIỆU & BCH ĐOÀN TRƯỜNG (ADMIN) =================
  {
    id: 'admin',
    username: 'admin',
    name: 'Zơ râm Thị Thành Thương',
    role: 'admin',
    roleTitle: 'Bí thư Đoàn Trường / Quản trị viên',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    email: 'bithudoan@thpt-quangtrung-donggiang.edu.vn',
    phone: '0912.345.678',
    isActive: true
  },
  {
    id: 'admin_diu',
    username: 'admin_diu',
    name: 'B nướch Dịu',
    role: 'admin',
    roleTitle: 'Phó Bí thư Đoàn Trường',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    email: 'diu.bn@thpt-quangtrung-donggiang.edu.vn',
    phone: '0912.999.888',
    isActive: true
  },

  // ================= 2. BAN CỜ ĐỎ (ĐỘI CỜ ĐỎ TOÀN TRƯỜNG - AUDITOR) =================
  // Khối 12
  {
    id: 'codo_12_1_dieu',
    username: 'codo_12_1',
    name: 'Đặng Cát Diệu',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 12/1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    classId: '12/1',
    assignedZone: 'Phòng 7 & 8 (tầng 2)',
    phone: '0367031635',
    isActive: true
  },
  {
    id: 'codo_12_1_dan',
    username: 'codo_12_1_dan',
    name: 'Lê Nguyễn Linh Đan',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 12/1',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    classId: '12/1',
    assignedZone: 'Phòng 7 & 8 (tầng 2)',
    phone: '0865738443',
    isActive: true
  },
  {
    id: 'codo_12_2_thuy',
    username: 'codo_12_2',
    name: 'Bríu Thị Xuân Thủy',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 12/2',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: '12/2',
    assignedZone: 'Phòng 6 & 9 (tầng 2)',
    phone: '0905.111.203',
    isActive: true
  },
  {
    id: 'codo_12_2_sam',
    username: 'codo_12_2_sam',
    name: 'Arâl Sâm',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 12/2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    classId: '12/2',
    assignedZone: 'Phòng 6 & 9 (tầng 2)',
    phone: '0905.111.204',
    isActive: true
  },
  {
    id: 'codo_12_3_sy',
    username: 'codo_12_3',
    name: 'Aria Văn Sỹ',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 12/3',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    classId: '12/3',
    assignedZone: 'Phòng 1 & 2 (tầng 1)',
    phone: '0905.111.205',
    isActive: true
  },
  {
    id: 'codo_12_3_tri',
    username: 'codo_12_3_tri',
    name: 'Hốih Minh Trí',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 12/3',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    classId: '12/3',
    assignedZone: 'Phòng 1 & 2 (tầng 1)',
    phone: '0905.111.206',
    isActive: true
  },
  {
    id: 'codo_12_4_maia',
    username: 'codo_12_4',
    name: 'Pơloong Thị Mai A',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 12/4',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classId: '12/4',
    assignedZone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)',
    phone: '0335300049',
    isActive: true
  },
  {
    id: 'codo_12_4_my',
    username: 'codo_12_4_my',
    name: 'Pơloong Thị Hoài Mỹ',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 12/4',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    classId: '12/4',
    assignedZone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)',
    phone: '0905.111.208',
    isActive: true
  },

  // Khối 11
  {
    id: 'codo_11_1_truc',
    username: 'codo_11_1',
    name: 'Lê Thị Thanh Trúc',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 11/1',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    classId: '11/1',
    assignedZone: 'Phòng 14 & 15 (tầng 3)',
    phone: '0905.222.101',
    isActive: true
  },
  {
    id: 'codo_11_1_uyen',
    username: 'codo_11_1_uyen',
    name: 'Đỗ Nguyễn Tường Uyên',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 11/1',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classId: '11/1',
    assignedZone: 'Phòng 14 & 15 (tầng 3)',
    phone: '0905.222.102',
    isActive: true
  },
  {
    id: 'codo_11_2_thai',
    username: 'codo_11_2',
    name: 'Alăng Hồng Thái',
    role: 'auditor',
    roleTitle: 'Đội trưởng Cờ Đỏ - Chi đoàn 11/2',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    classId: '11/2',
    assignedZone: 'Phòng 12 & 13 (tầng 3)',
    phone: '0905.222.103',
    isActive: true
  },
  {
    id: 'codo_11_2_thu',
    username: 'codo_11_2_thu',
    name: 'Alăng Thị Anh Thư',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 11/2',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: '11/2',
    assignedZone: 'Phòng 12 & 13 (tầng 3)',
    phone: '0905.222.104',
    isActive: true
  },
  {
    id: 'codo_11_3_hoang',
    username: 'codo_11_3',
    name: 'Bríu Lâm Hoàng',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 11/3',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    classId: '11/3',
    assignedZone: 'Phòng 15 (tầng 3) & Phòng 9 (tầng 2)',
    phone: '0905.222.105',
    isActive: true
  },
  {
    id: 'codo_11_3_na',
    username: 'codo_11_3_na',
    name: 'A Lăng Sa-A Na',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 11/3',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    classId: '11/3',
    assignedZone: 'Phòng 15 (tầng 3) & Phòng 9 (tầng 2)',
    phone: '0905.222.106',
    isActive: true
  },
  {
    id: 'codo_11_4_sen',
    username: 'codo_11_4',
    name: 'Ploong Sên',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 11/4',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    classId: '11/4',
    assignedZone: 'Phòng 14 (tầng 3)',
    phone: '0905.222.107',
    isActive: true
  },
  {
    id: 'codo_11_4_unh',
    username: 'codo_11_4_unh',
    name: 'Pơloong Thị Unh',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 11/4',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    classId: '11/4',
    assignedZone: 'Phòng 14 (tầng 3)',
    phone: '0905.222.108',
    isActive: true
  },
  {
    id: 'codo_11_5_dat',
    username: 'codo_11_5',
    name: 'Alăng Đạt',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 11/5',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    classId: '11/5',
    assignedZone: 'Phòng 12 & 13 (tầng 3)',
    phone: '0905.222.109',
    isActive: true
  },
  {
    id: 'codo_11_5_nhu',
    username: 'codo_11_5_nhu',
    name: 'A lăng Thị Quỳnh Như',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 11/5',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classId: '11/5',
    assignedZone: 'Phòng 12 & 13 (tầng 3)',
    phone: '0905.222.110',
    isActive: true
  },

  // Khối 10
  {
    id: 'codo_10_1_sao',
    username: 'codo_10_1',
    name: 'Hôih Thị Ánh Sao',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/1',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    classId: '10/1',
    assignedZone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)',
    phone: '0905.333.101',
    isActive: true
  },
  {
    id: 'codo_10_1_thanh',
    username: 'codo_10_1_thanh',
    name: 'Ngô Nguyễn Công Thành',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    classId: '10/1',
    assignedZone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)',
    phone: '0905.333.102',
    isActive: true
  },
  {
    id: 'codo_10_2_hao',
    username: 'codo_10_2',
    name: 'A ting Thị Hạo',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/2',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: '10/2',
    assignedZone: 'Phòng 1 & 2 (tầng 1)',
    phone: '0905.333.103',
    isActive: true
  },
  {
    id: 'codo_10_2_duy',
    username: 'codo_10_2_duy',
    name: 'Võ Thanh Duy',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/2',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    classId: '10/2',
    assignedZone: 'Phòng 1 & 2 (tầng 1)',
    phone: '0905.333.104',
    isActive: true
  },
  {
    id: 'codo_10_3_nuong',
    username: 'codo_10_3',
    name: 'Arất Thị Nương',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/3',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    classId: '10/3',
    assignedZone: 'Phòng 1 & 3 (tầng 1)',
    phone: '0905.333.105',
    isActive: true
  },
  {
    id: 'codo_10_3_nhu',
    username: 'codo_10_3_nhu',
    name: 'Bríu Thị Bảo Như',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/3',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    classId: '10/3',
    assignedZone: 'Phòng 1 & 3 (tầng 1)',
    phone: '0905.333.106',
    isActive: true
  },
  {
    id: 'codo_10_4_thy',
    username: 'codo_10_4',
    name: 'Ating Dương Khánh Thy',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/4',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classId: '10/4',
    assignedZone: 'Phòng 9 & 10 (tầng 2)',
    phone: '0905.333.107',
    isActive: true
  },
  {
    id: 'codo_10_4_diem',
    username: 'codo_10_4_diem',
    name: 'Bhnướch Thị Diễm',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/4',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    classId: '10/4',
    assignedZone: 'Phòng 9 & 10 (tầng 2)',
    phone: '0905.333.108',
    isActive: true
  },
  {
    id: 'codo_10_5_gai',
    username: 'codo_10_5',
    name: 'Bling Thị Gái',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/5',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    classId: '10/5',
    assignedZone: 'Phòng 1 & 2 (tầng 1)',
    phone: '0905.333.109',
    isActive: true
  },
  {
    id: 'codo_10_5_hue',
    username: 'codo_10_5_hue',
    name: 'Arâl Thị Huế',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/5',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: '10/5',
    assignedZone: 'Phòng 1 & 2 (tầng 1)',
    phone: '0905.333.110',
    isActive: true
  },
  {
    id: 'codo_10_6_mi',
    username: 'codo_10_6',
    name: 'A lăng Thị Hoạ Mi',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/6',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: '10/6',
    assignedZone: 'Phòng 3 (tầng 1) & Phòng 9 (tầng 2)',
    phone: '0905.333.111',
    isActive: true
  },
  {
    id: 'codo_10_6_thuat',
    username: 'codo_10_6_thuat',
    name: 'Alăng Thuật',
    role: 'auditor',
    roleTitle: 'Cán bộ Cờ Đỏ - Chi đoàn 10/6',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    classId: '10/6',
    assignedZone: 'Phòng 3 (tầng 1) & Phòng 9 (tầng 2)',
    phone: '0905.333.112',
    isActive: true
  },

  // ================= 3. GIÁO VIÊN CHỦ NHIỆM (15 LỚP) =================
  { id: 'gvcn_10_1', username: 'gvcn_10_1', name: 'Rapát Thị Mận', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 10/1', classId: '10/1', phone: '0903.123.456', isActive: true },
  { id: 'gvcn_10_2', username: 'gvcn_10_2', name: 'ALăng Thị Moáy', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 10/2', classId: '10/2', phone: '0903.123.457', isActive: true },
  { id: 'gvcn_10_3', username: 'gvcn_10_3', name: 'Nguyễn Văn Tiểu', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 10/3', classId: '10/3', phone: '0903.123.458', isActive: true },
  { id: 'gvcn_10_4', username: 'gvcn_10_4', name: 'Bùi Ngọc Giao', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 10/4', classId: '10/4', phone: '0903.123.459', isActive: true },
  { id: 'gvcn_10_5', username: 'gvcn_10_5', name: 'Pơloong Thị Lý', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 10/5', classId: '10/5', phone: '0903.123.460', isActive: true },
  { id: 'gvcn_10_6', username: 'gvcn_10_6', name: 'Đinh Thị Thu', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 10/6', classId: '10/6', phone: '0903.123.461', isActive: true },

  { id: 'gvcn_11_1', username: 'gvcn_11_1', name: 'Phát Xuân Quý', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 11/1', classId: '11/1', phone: '0904.123.456', isActive: true },
  { id: 'gvcn_11_2', username: 'gvcn_11_2', name: 'Phạm Thanh Phương', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 11/2', classId: '11/2', phone: '0904.123.457', isActive: true },
  { id: 'gvcn_11_3', username: 'gvcn_11_3', name: 'Alăng Thị Đặng', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 11/3', classId: '11/3', phone: '0904.123.458', isActive: true },
  { id: 'gvcn_11_4', username: 'gvcn_11_4', name: 'Blúp Thị Viết', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 11/4', classId: '11/4', phone: '0904.123.459', isActive: true },
  { id: 'gvcn_11_5', username: 'gvcn_11_5', name: 'Lê Quang Hét', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 11/5', classId: '11/5', phone: '0904.123.460', isActive: true },

  { id: 'gvcn_12_1', username: 'gvcn_12_1', name: 'Zơrâm Thị Thủy', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 12/1', classId: '12/1', phone: '0905.123.456', isActive: true },
  { id: 'gvcn_12_2', username: 'gvcn_12_2', name: 'Thông Thị Bông', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 12/2', classId: '12/2', phone: '0905.123.457', isActive: true },
  { id: 'gvcn_12_3', username: 'gvcn_12_3', name: 'Sava Thị Hòa', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 12/3', classId: '12/3', phone: '0905.123.458', isActive: true },
  { id: 'gvcn_12_4', username: 'gvcn_12_4', name: 'Lê Nguyên Trưởng', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 12/4', classId: '12/4', phone: '0905.123.459', isActive: true },

  // ================= 4. BÍ THƯ CHI ĐOÀN 15 LỚP (ROLE: YOUTH_SECRETARY) =================
  {
    id: 'bithu_10_1',
    username: 'bithu_10_1',
    name: 'Lâm Xuân Tín',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 10/1 (Kiêm Lớp trưởng)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    classId: '10/1',
    phone: '0372076304',
    isActive: true,
    points: 120,
    rankTitle: 'Đoàn viên Xuất sắc',
    joinedDate: '26/03/2026',
    studentId: 'HS20261001'
  },
  {
    id: 'bithu_10_2',
    username: 'bithu_10_2',
    name: 'Nguyễn Hữu Tùng Giang',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 10/2 (Kiêm Lớp trưởng)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    classId: '10/2',
    phone: '0398765432',
    isActive: true,
    points: 115,
    rankTitle: 'Đoàn viên Tích cực',
    joinedDate: '26/03/2026',
    studentId: 'HS20261011'
  },
  {
    id: 'bithu_10_3',
    username: 'bithu_10_3',
    name: 'Arất Thị Bảo Châu',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 10/3 (Kiêm Lớp trưởng)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    classId: '10/3',
    phone: '0326043242',
    isActive: true,
    points: 125,
    rankTitle: 'Đoàn viên Xuất sắc',
    joinedDate: '26/03/2026',
    studentId: 'HS20261021'
  },
  {
    id: 'bithu_10_4',
    username: 'bithu_10_4',
    name: 'Alăng Thị Hồng Vân',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 10/4 (Kiêm Lớp trưởng)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classId: '10/4',
    phone: '0366852391',
    isActive: true,
    points: 110,
    rankTitle: 'Đoàn viên Tích cực',
    joinedDate: '26/03/2026',
    studentId: 'HS20261031'
  },
  {
    id: 'bithu_10_5',
    username: 'bithu_10_5',
    name: 'Bríu Long Thịnh',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 10/5 (Kiêm Lớp trưởng)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    classId: '10/5',
    phone: '0399374288',
    isActive: true,
    points: 110,
    rankTitle: 'Đoàn viên Tích cực',
    joinedDate: '26/03/2026',
    studentId: 'HS20261041'
  },
  {
    id: 'bithu_10_6',
    username: 'bithu_10_6',
    name: 'Alăng Thị Lung Linh',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 10/6 (Kiêm Lớp trưởng)',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    classId: '10/6',
    phone: '0388123456',
    isActive: true,
    points: 115,
    rankTitle: 'Đoàn viên Tích cực',
    joinedDate: '26/03/2026',
    studentId: 'HS20261051'
  },
  {
    id: 'bithu_11_1',
    username: 'bithu_11_1',
    name: 'Nguyễn Thị Bảo Yến',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 11/1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    classId: '11/1',
    phone: '0978819242',
    isActive: true,
    points: 145,
    rankTitle: 'Đoàn viên Xuất sắc',
    joinedDate: '26/03/2025',
    studentId: 'HS20251101'
  },
  {
    id: 'bithu_11_2',
    username: 'bithu_11_2',
    name: 'Bnuớch Thị Như Tuệ',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 11/2',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    classId: '11/2',
    phone: '0961640578',
    isActive: true,
    points: 135,
    rankTitle: 'Đoàn viên Xuất sắc',
    joinedDate: '26/03/2025',
    studentId: 'HS20251111'
  },
  {
    id: 'bithu_11_3',
    username: 'bithu_11_3',
    name: 'Ating Thị Ánh Nguyệt',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 11/3',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: '11/3',
    phone: '0393906020',
    isActive: true,
    points: 140,
    rankTitle: 'Đoàn viên Xuất sắc',
    joinedDate: '26/03/2025',
    studentId: 'HS20251121'
  },
  {
    id: 'bithu_11_4',
    username: 'bithu_11_4',
    name: 'Bnuớch Thị Võng',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 11/4 (Kiêm Lớp phó HT)',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classId: '11/4',
    phone: '0348768641',
    isActive: true,
    points: 130,
    rankTitle: 'Đoàn viên Xuất sắc',
    joinedDate: '26/03/2025',
    studentId: 'HS20251131'
  },
  {
    id: 'bithu_11_5',
    username: 'bithu_11_5',
    name: 'Arâl Thị My My',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 11/5',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    classId: '11/5',
    phone: '0378783551',
    isActive: true,
    points: 125,
    rankTitle: 'Đoàn viên Tích cực',
    joinedDate: '26/03/2025',
    studentId: 'HS20251141'
  },
  {
    id: 'bithu_12_1',
    username: 'bithu_12_1',
    name: 'Đặng Cát Diệu',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 12/1',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    classId: '12/1',
    phone: '0367031635',
    isActive: true,
    points: 180,
    rankTitle: 'Cán bộ Đoàn Tiêu biểu',
    joinedDate: '26/03/2024',
    studentId: 'HS20241201'
  },
  {
    id: 'bithu_12_2',
    username: 'bithu_12_2',
    name: 'Arất Thị Tiểu Liên',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 12/2',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    classId: '12/2',
    phone: '0969645607',
    isActive: true,
    points: 175,
    rankTitle: 'Đoàn viên Ưu tú',
    joinedDate: '26/03/2024',
    studentId: 'HS20241211'
  },
  {
    id: 'bithu_12_3',
    username: 'bithu_12_3',
    name: 'Alăng Tình',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 12/3 (Kiêm Lớp trưởng)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    classId: '12/3',
    phone: '0325003571',
    isActive: true,
    points: 165,
    rankTitle: 'Đoàn viên Xuất sắc',
    joinedDate: '26/03/2024',
    studentId: 'HS20241221'
  },
  {
    id: 'bithu_12_4',
    username: 'bithu_12_4',
    name: 'Lê Thị Thảo Nguyên',
    role: 'youth_secretary',
    roleTitle: 'Bí thư Chi đoàn 12/4 (Kiêm Lớp trưởng)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    classId: '12/4',
    phone: '0346562789',
    isActive: true,
    points: 215,
    rankTitle: 'Cán bộ Đoàn Tiêu biểu',
    joinedDate: '26/03/2024',
    studentId: 'HS20241231'
  },

  // ================= 5. LỚP TRƯỞNG CÁC LỚP (ROLE: YOUTH_SECRETARY / USER) =================
  {
    id: 'loptruong_11_1',
    username: 'loptruong_11_1',
    name: 'Nguyễn Hữu Quang Huy',
    role: 'youth_secretary',
    roleTitle: 'Lớp trưởng 11/1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    classId: '11/1',
    phone: '0818777565',
    isActive: true,
    points: 140,
    rankTitle: 'Ban Cán Sự Xuất Sắc',
    studentId: 'HS20251102'
  },
  {
    id: 'loptruong_11_2',
    username: 'loptruong_11_2',
    name: 'Arất Thị Ngọc Ánh',
    role: 'youth_secretary',
    roleTitle: 'Lớp trưởng 11/2',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    classId: '11/2',
    phone: '0387650317',
    isActive: true,
    points: 135,
    rankTitle: 'Ban Cán Sự Xuất Sắc',
    studentId: 'HS20251112'
  },
  {
    id: 'loptruong_11_3',
    username: 'loptruong_11_3',
    name: 'Alăng Quân',
    role: 'youth_secretary',
    roleTitle: 'Lớp trưởng 11/3',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    classId: '11/3',
    phone: '0359845008',
    isActive: true,
    points: 130,
    rankTitle: 'Ban Cán Sự Xuất Sắc',
    studentId: 'HS20251122'
  },
  {
    id: 'loptruong_11_4',
    username: 'loptruong_11_4',
    name: 'Alăng Nhật Lâm',
    role: 'youth_secretary',
    roleTitle: 'Lớp trưởng 11/4 (Kiêm Phó Bí thư)',
    avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
    classId: '11/4',
    phone: '0395561653',
    isActive: true,
    points: 135,
    rankTitle: 'Ban Cán Sự Xuất Sắc',
    studentId: 'HS20251132'
  },
  {
    id: 'loptruong_11_5',
    username: 'loptruong_11_5',
    name: 'A Lăng Thị Sương',
    role: 'youth_secretary',
    roleTitle: 'Lớp trưởng 11/5',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80',
    classId: '11/5',
    phone: '0378783550',
    isActive: true,
    points: 130,
    rankTitle: 'Ban Cán Sự Xuất Sắc',
    studentId: 'HS20251142'
  },
  {
    id: 'loptruong_12_1',
    username: 'loptruong_12_1',
    name: 'Nguyễn Tấn Dũng',
    role: 'youth_secretary',
    roleTitle: 'Lớp trưởng 12/1',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    classId: '12/1',
    phone: '0347150114',
    isActive: true,
    points: 170,
    rankTitle: 'Ban Cán Sự Tiêu Biểu',
    studentId: 'HS20241202'
  },
  {
    id: 'loptruong_12_2',
    username: 'loptruong_12_2',
    name: 'Ating Mía',
    role: 'youth_secretary',
    roleTitle: 'Lớp trưởng 12/2',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    classId: '12/2',
    phone: '0369206085',
    isActive: true,
    points: 160,
    rankTitle: 'Ban Cán Sự Tiêu Biểu',
    studentId: 'HS20241212'
  },

  // ================= 6. LỚP PHÓ HỌC TẬP & PHÓ BÍ THƯ (ROLE: USER) =================
  // Lớp phó Khối 10
  { id: 'loppho_10_1', username: 'loppho_10_1', name: 'Phạm Nguyễn Bảo Vi', role: 'user', roleTitle: 'Lớp phó Học tập 10/1', classId: '10/1', phone: '0343226894', isActive: true },
  { id: 'loppho_10_2', username: 'loppho_10_2', name: 'Lê Gia Hân', role: 'user', roleTitle: 'Lớp phó Học tập 10/2', classId: '10/2', phone: '0812777515', isActive: true },
  { id: 'loppho_10_3', username: 'loppho_10_3', name: 'Đinh Đoàn Hà Anh', role: 'user', roleTitle: 'Lớp phó Học tập 10/3', classId: '10/3', phone: '0867371025', isActive: true },
  { id: 'loppho_10_4', username: 'loppho_10_4', name: 'Alăng Thị Thảo My', role: 'user', roleTitle: 'Lớp phó Học tập 10/4', classId: '10/4', phone: '0352180084', isActive: true },
  { id: 'loppho_10_5', username: 'loppho_10_5', name: 'Trần Lâm', role: 'user', roleTitle: 'Lớp phó Học tập 10/5', classId: '10/5', phone: '', isActive: true },
  { id: 'loppho_10_6', username: 'loppho_10_6', name: 'Arất Thị Nhậm', role: 'user', roleTitle: 'Lớp phó Học tập 10/6', classId: '10/6', phone: '', isActive: true },

  // Lớp phó & Phó Bí thư Khối 11
  { id: 'loppho_11_1', username: 'loppho_11_1', name: 'Nguyễn Phương Thúy', role: 'user', roleTitle: 'Lớp phó Học tập 11/1', classId: '11/1', phone: '0325098321', isActive: true },
  { id: 'phobithu_11_1', username: 'phobithu_11_1', name: 'Võ Viết Tới', role: 'user', roleTitle: 'Phó Bí thư Chi đoàn 11/1', classId: '11/1', phone: '0923150635', isActive: true },
  { id: 'loppho_11_2', username: 'loppho_11_2', name: 'Alăng Thị Phi Yến', role: 'user', roleTitle: 'Lớp phó Học tập & Phó Bí thư 11/2', classId: '11/2', phone: '0961640577', isActive: true },
  { id: 'loppho_11_3', username: 'loppho_11_3', name: 'A lăng Thị Kyn Sun', role: 'user', roleTitle: 'Lớp phó Học tập 11/3', classId: '11/3', phone: '', isActive: true },
  { id: 'phobithu_11_3', username: 'phobithu_11_3', name: 'Arâl Thị Phi', role: 'user', roleTitle: 'Phó Bí thư Chi đoàn 11/3', classId: '11/3', phone: '', isActive: true },
  { id: 'loppho_11_4', username: 'loppho_11_4', name: 'Bnuớch Thị Võng', role: 'user', roleTitle: 'Lớp phó Học tập 11/4', classId: '11/4', phone: '0348768641', isActive: true },
  { id: 'loppho_11_5', username: 'loppho_11_5', name: 'Zơ Đêl Thị Mai Xuyến', role: 'user', roleTitle: 'Lớp phó Học tập 11/5', classId: '11/5', phone: '0342415450', isActive: true },
  { id: 'phobithu_11_5', username: 'phobithu_11_5', name: 'Hôih Thị Kiên Thy', role: 'user', roleTitle: 'Phó Bí thư Chi đoàn 11/5', classId: '11/5', phone: '', isActive: true },

  // Lớp phó & Phó Bí thư Khối 12
  { id: 'loppho_12_1', username: 'loppho_12_1', name: 'Plinh Thị Mai Châu', role: 'user', roleTitle: 'Lớp phó Học tập 12/1', classId: '12/1', phone: '0336349705', isActive: true },
  { id: 'phobithu_12_1', username: 'phobithu_12_1', name: 'Lê Nguyễn Linh Đan', role: 'user', roleTitle: 'Phó Bí thư Chi đoàn 12/1', classId: '12/1', phone: '0865738443', isActive: true },
  { id: 'loppho_12_2', username: 'loppho_12_2', name: 'Bnuớch Thị Mỹ', role: 'user', roleTitle: 'Lớp phó Học tập 12/2', classId: '12/2', phone: '0973919231', isActive: true },
  { id: 'phobithu_12_2', username: 'phobithu_12_2', name: 'Alăng Thị Ni', role: 'user', roleTitle: 'Phó Bí thư Chi đoàn 12/2', classId: '12/2', phone: '0354393342', isActive: true },
  { id: 'loppho_12_3', username: 'loppho_12_3', name: 'Alăng Phú Lộc', role: 'user', roleTitle: 'Lớp phó Học tập 12/3', classId: '12/3', phone: '0372890142', isActive: true },
  { id: 'phobithu_12_3', username: 'phobithu_12_3', name: 'Alăng Thị Tiết', role: 'user', roleTitle: 'Phó Bí thư Chi đoàn 12/3', classId: '12/3', phone: '', isActive: true },
  { id: 'loppho_12_4', username: 'loppho_12_4', name: 'Pơloong Thị Khuyên', role: 'user', roleTitle: 'Lớp phó Học tập 12/4', classId: '12/4', phone: '0326406714', isActive: true },

  // ================= 7. ĐOÀN VIÊN / HỌC SINH TIÊU BIỂU =================
  {
    id: 'hs_10_1',
    username: 'hs_10_1',
    name: 'Nguyễn Quang Minh',
    role: 'user',
    roleTitle: 'Đoàn viên - Học sinh Lớp 10/1',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    classId: '10/1',
    phone: '0919.888.999',
    isActive: true,
    points: 85,
    rankTitle: 'Đoàn viên Tích cực',
    joinedDate: '19/05/2026',
    studentId: 'HS20261001'
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
    joinedDate: '26/03/2024',
    studentId: 'HS20241232'
  }
];

export const INITIAL_VIOLATIONS: Violation[] = [
  // Lớp 10/1 - T2: 1.1 Đến trễ 2 HS (-2đ) -> Đã duyệt
  {
    id: 'vio-001',
    classId: '10/1',
    className: 'Lớp 10/1',
    day: 'T2',
    date: '2026-09-07',
    weekNumber: 1,
    criterionId: '1.1',
    criterionName: 'Vào lớp sinh hoạt trễ 5p đầu giờ',
    groupName: 'Chuyên cần',
    quantity: 2,
    pointsDeducted: 2,
    studentNames: ['Nguyễn Văn Đức', 'Lê Hữu Đạt'],
    note: 'Đến trường lúc 07:05 (sau hiệu lệnh trống 5 phút)',
    proofImages: ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-09-07 07:10',
    status: 'accepted',
    locked: false
  },
  // Lớp 10/1 - T3: 2.2 Vệ sinh kém (-2đ) -> GVCN đang khiếu nại (ĐỂ TEST SPLIT VIEW ADMIN & GVCN)
  {
    id: 'vio-002',
    classId: '10/1',
    className: 'Lớp 10/1',
    day: 'T3',
    date: '2026-09-08',
    weekNumber: 1,
    criterionId: '2.2',
    criterionName: 'Trực nhật trễ, không đổ rác, vệ sinh kém',
    groupName: 'Vệ sinh',
    quantity: 1,
    pointsDeducted: 2,
    studentNames: ['Tổ 2 trực nhật'],
    note: 'Thùng rác cuối lớp chưa đổ ra xe gom rác hành lang',
    proofImages: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-09-08 07:15',
    status: 'appealed',
    appeal: {
      reason: 'Kính gửi BCH Đoàn trường: Lớp 10/1 đã trực nhật sạch sẽ lúc 6h45. Thùng rác trong ảnh là do lớp học thêm buổi chiều hôm trước để lại, học sinh Tổ 2 đã mang đi đổ ngay lúc 7h00 trước khi Cờ đỏ vào chấm. Kèm theo cam kết của Ban cán sự lớp.',
      proofImages: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80'],
      appealedBy: 'Thầy Nguyễn Văn Thành (GVCN 10/1)',
      appealedAt: '2026-09-08 09:30'
    },
    locked: false
  },
  // Lớp 10/2 - T2: 1.2 Vắng có phép 10 HS (-10đ), 1.3 Vắng không phép 2 HS (-4đ)
  {
    id: 'vio-003',
    classId: '10/2',
    className: 'Lớp 10/2',
    day: 'T2',
    date: '2026-09-07',
    weekNumber: 1,
    criterionId: '1.2',
    criterionName: 'Vắng có phép (có xác nhận của GVCN)',
    groupName: 'Chuyên cần',
    quantity: 10,
    pointsDeducted: 10,
    studentNames: ['Danh sách 10 HS tham gia đội tuyển bồi dưỡng HSG'],
    note: 'Đội tuyển HSG tập trung tại phòng Hội đồng có giấy báo',
    proofImages: [],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-09-07 07:20',
    status: 'accepted',
    locked: false
  },
  {
    id: 'vio-004',
    classId: '10/2',
    className: 'Lớp 10/2',
    day: 'T2',
    date: '2026-09-07',
    weekNumber: 1,
    criterionId: '1.3',
    criterionName: 'Vắng không phép',
    groupName: 'Chuyên cần',
    quantity: 2,
    pointsDeducted: 4,
    studentNames: ['Hoàng Văn Khải', 'Trần Đình Trọng'],
    note: 'Vắng tiết 1 chào cờ không lý do',
    proofImages: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-09-07 07:30',
    status: 'accepted',
    locked: false
  },
  // Lớp 11/5 - T4: 4.1 Sai đồng phục (-4đ) -> Chờ duyệt
  {
    id: 'vio-005',
    classId: '11/5',
    className: 'Lớp 11/5',
    day: 'T4',
    date: '2026-09-09',
    weekNumber: 1,
    criterionId: '4.1',
    criterionName: 'Không đúng đồng phục, sai giày dép, thiếu phù hiệu',
    groupName: 'Tác phong',
    quantity: 2,
    pointsDeducted: 4,
    studentNames: ['Đỗ Minh Tuấn', 'Vũ Hồng Quang'],
    note: 'Đi dép lê không quai hậu, không đeo thẻ học sinh',
    proofImages: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-09-09 07:12',
    status: 'pending',
    locked: false
  },
  // Lớp 12/4 - T3: 3.5 Không tắt quạt (-5đ)
  {
    id: 'vio-006',
    classId: '12/4',
    className: 'Lớp 12/4',
    day: 'T3',
    date: '2026-09-08',
    weekNumber: 1,
    criterionId: '3.5',
    criterionName: 'Không tắt điện, quạt sau giờ học',
    groupName: 'Nề nếp tự quản',
    quantity: 1,
    pointsDeducted: 5,
    studentNames: ['Tập thể 12/4'],
    note: 'Tan học tiết 5 để 4 quạt trần quay liên tục',
    proofImages: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-09-08 11:45',
    status: 'accepted',
    locked: false
  },
  // Lớp 10/4 - T5: 3.7 Sử dụng ĐT không phép (-5đ)
  {
    id: 'vio-007',
    classId: '10/4',
    className: 'Lớp 10/4',
    day: 'T5',
    date: '2026-09-10',
    weekNumber: 1,
    criterionId: '3.7',
    criterionName: 'Sử dụng điện thoại không được phép',
    groupName: 'Nề nếp tự quản',
    quantity: 1,
    pointsDeducted: 5,
    studentNames: ['Nguyễn Hữu Đạt'],
    note: 'Chơi game trong giờ truy bài 15 phút',
    proofImages: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-09-10 07:05',
    status: 'accepted',
    locked: false
  },
  // Lớp 11/2 - T2: 2.1 Không trực nhật (-5đ)
  {
    id: 'vio-008',
    classId: '11/2',
    className: 'Lớp 11/2',
    day: 'T2',
    date: '2026-09-07',
    weekNumber: 1,
    criterionId: '2.1',
    criterionName: 'Không trực nhật',
    groupName: 'Vệ sinh',
    quantity: 1,
    pointsDeducted: 5,
    studentNames: ['Tổ 1 lớp 11/2'],
    note: 'Không lau bảng, bục giảng nhiều phấn vụn',
    proofImages: ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'Đội Cờ Đỏ' },
    reportedAt: '2026-09-07 07:15',
    status: 'accepted',
    locked: false
  }
];

// LỊCH PHÂN CÔNG TRỰC CỜ ĐỎ CHUẨN XÁC NĂM HỌC 2026 - 2027 (THEO VĂN BẢN ĐOÀN TRƯỜNG THPT QUANG TRUNG - ĐÔNG GIANG)
export const OFFICIAL_DUTY_SCHEDULE_TEMPLATE: Array<Omit<DutyAssignment, 'id' | 'weekNumber'>> = [
  // ================= I. LỊCH TRỰC PHÂN CÔNG BUỔI SÁNG =================
  // Thứ 2 (Sáng)
  { day: 'T2', session: 'Sáng', auditorClass: '12/1', auditorName: 'Đặng Cát Diệu & Lê Nguyễn Linh Đan', auditorId: 'codo_12_1_dieu', targetClasses: '10/1, 10/2', zone: 'Phòng 7 & 8 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45', isLiveNow: true },
  { day: 'T2', session: 'Sáng', auditorClass: '12/2', auditorName: 'Bríu Thị Xuân Thủy & Arâl Sâm', auditorId: 'codo_12_2_thuy', targetClasses: '10/3, 11/5', zone: 'Phòng 6 & 9 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45', isLiveNow: true },
  { day: 'T2', session: 'Sáng', auditorClass: '10/1', auditorName: 'Hôih Thị Ánh Sao & Ngô Nguyễn Công Thành', auditorId: 'codo_10_1_sao', targetClasses: '11/3, 11/4', zone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45', isLiveNow: true },
  { day: 'T2', session: 'Sáng', auditorClass: '10/2', auditorName: 'A ting Thị Hạo & Võ Thanh Duy', auditorId: 'codo_10_2_hao', targetClasses: '11/1, 11/2', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45', isLiveNow: true },
  { day: 'T2', session: 'Sáng', auditorClass: '11/1', auditorName: 'Lê Thị Thanh Trúc & Đỗ Nguyễn Tường Uyên', auditorId: 'codo_11_1_truc', targetClasses: '12/1, 12/2', zone: 'Phòng 14 & 15 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45', isLiveNow: true },
  { day: 'T2', session: 'Sáng', auditorClass: '11/2', auditorName: 'Alăng Hồng Thái & Alăng Thị Anh Thư', auditorId: 'codo_11_2_thai', targetClasses: '12/3, 12/4', zone: 'Phòng 12 & 13 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45', isLiveNow: true },

  // Thứ 3 (Sáng)
  { day: 'T3', session: 'Sáng', auditorClass: '12/3', auditorName: 'Aria Văn Sỹ & Hốih Minh Trí', auditorId: 'codo_12_3_sy', targetClasses: '11/1, 11/2', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T3', session: 'Sáng', auditorClass: '12/4', auditorName: 'Pơloong Thị Mai A & Pơloong Thị Hoài Mỹ', auditorId: 'codo_12_4_maia', targetClasses: '11/3, 11/4', zone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T3', session: 'Sáng', auditorClass: '11/3', auditorName: 'Bríu Lâm Hoàng & A Lăng Sa-A Na', auditorId: 'codo_11_3_hoang', targetClasses: '12/1, 11/5', zone: 'Phòng 15 (tầng 3) & Phòng 9 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T3', session: 'Sáng', auditorClass: '11/4', auditorName: 'Ploong Sên & Pơloong Thị Unh', auditorId: 'codo_11_4_sen', targetClasses: '12/2', zone: 'Phòng 14 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T3', session: 'Sáng', auditorClass: '11/5', auditorName: 'Alăng Đạt & A lăng Thị Quỳnh Như', auditorId: 'codo_11_5_dat', targetClasses: '12/3, 12/4', zone: 'Phòng 12 & 13 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },

  // Thứ 4 (Sáng)
  { day: 'T4', session: 'Sáng', auditorClass: '10/5', auditorName: 'Bling Thị Gái & Arâl Thị Huế', auditorId: 'codo_10_5_gai', targetClasses: '11/1, 11/2', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/1', auditorName: 'Lê Thị Thanh Trúc & Đỗ Nguyễn Tường Uyên', auditorId: 'codo_11_1_truc', targetClasses: '12/3, 12/4', zone: 'Phòng 12 & 13 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '11/2', auditorName: 'Alăng Hồng Thái & Alăng Thị Anh Thư', auditorId: 'codo_11_2_thai', targetClasses: '12/1, 12/2', zone: 'Phòng 14 & 15 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '12/1', auditorName: 'Đặng Cát Diệu & Lê Nguyễn Linh Đan', auditorId: 'codo_12_1_dieu', targetClasses: '10/5, 11/5', zone: 'Phòng 8 & 9 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T4', session: 'Sáng', auditorClass: '12/2', auditorName: 'Bríu Thị Xuân Thủy & Arâl Sâm', auditorId: 'codo_12_2_thuy', targetClasses: '11/3, 11/4', zone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },

  // Thứ 5 (Sáng)
  { day: 'T5', session: 'Sáng', auditorClass: '11/3', auditorName: 'Bríu Lâm Hoàng & A Lăng Sa-A Na', auditorId: 'codo_11_3_hoang', targetClasses: '12/2, 12/3', zone: 'Phòng 13 & 14 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T5', session: 'Sáng', auditorClass: '11/4', auditorName: 'Ploong Sên & Pơloong Thị Unh', auditorId: 'codo_11_4_sen', targetClasses: '12/1, 12/4', zone: 'Phòng 12 & 15 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T5', session: 'Sáng', auditorClass: '11/5', auditorName: 'Alăng Đạt & A lăng Thị Quỳnh Như', auditorId: 'codo_11_5_dat', targetClasses: '10/4, 10/6', zone: 'Phòng 6 (tầng 2) & Phòng 11 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T5', session: 'Sáng', auditorClass: '12/3', auditorName: 'Aria Văn Sỹ & Hốih Minh Trí', auditorId: 'codo_12_3_sy', targetClasses: '11/3, 11/4', zone: 'Phòng 3 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T5', session: 'Sáng', auditorClass: '12/4', auditorName: 'Pơloong Thị Mai A & Pơloong Thị Hoài Mỹ', auditorId: 'codo_12_4_maia', targetClasses: '11/1, 11/5', zone: 'Phòng 1 (tầng 1) & Phòng 9 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },

  // Thứ 6 (Sáng)
  { day: 'T6', session: 'Sáng', auditorClass: '12/1', auditorName: 'Đặng Cát Diệu & Lê Nguyễn Linh Đan', auditorId: 'codo_12_1_dieu', targetClasses: '11/2', zone: 'Phòng 2 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '11/1', auditorName: 'Lê Thị Thanh Trúc & Đỗ Nguyễn Tường Uyên', auditorId: 'codo_11_1_truc', targetClasses: '11/2, 11/3', zone: 'Phòng 2 & 3 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '11/2', auditorName: 'Alăng Hồng Thái & Alăng Thị Anh Thư', auditorId: 'codo_11_2_thai', targetClasses: '11/1, 11/4', zone: 'Phòng 1 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '12/2', auditorName: 'Bríu Thị Xuân Thủy & Arâl Sâm', auditorId: 'codo_12_2_thuy', targetClasses: '12/1, 12/3', zone: 'Phòng 14 & 15 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '12/3', auditorName: 'Aria Văn Sỹ & Hốih Minh Trí', auditorId: 'codo_12_3_sy', targetClasses: '11/5, 12/4', zone: 'Phòng 9 (tầng 2) & Phòng 12 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T6', session: 'Sáng', auditorClass: '12/4', auditorName: 'Pơloong Thị Mai A & Pơloong Thị Hoài Mỹ', auditorId: 'codo_12_4_maia', targetClasses: '12/2', zone: 'Phòng 14 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },

  // Thứ 7 (Sáng)
  { day: 'T7', session: 'Sáng', auditorClass: '10/3', auditorName: 'Arất Thị Nương & Bríu Thị Bảo Như', auditorId: 'codo_10_3_nuong', targetClasses: '11/1, 11/3', zone: 'Phòng 1 & 3 (tầng 1)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T7', session: 'Sáng', auditorClass: '10/4', auditorName: 'Ating Dương Khánh Thy & Bhnướch Thị Diễm', auditorId: 'codo_10_4_thy', targetClasses: '11/4, 11/5', zone: 'Phòng 9 & 10 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T7', session: 'Sáng', auditorClass: '11/3', auditorName: 'Bríu Lâm Hoàng & A Lăng Sa-A Na', auditorId: 'codo_11_3_hoang', targetClasses: '10/1, 10/3', zone: 'Phòng 6 & 8 (tầng 2)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T7', session: 'Sáng', auditorClass: '11/4', auditorName: 'Ploong Sên & Pơloong Thị Unh', auditorId: 'codo_11_4_sen', targetClasses: '12/3, 10/4', zone: 'Phòng 13 & 14 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },
  { day: 'T7', session: 'Sáng', auditorClass: '11/5', auditorName: 'Alăng Đạt & A lăng Thị Quỳnh Như', auditorId: 'codo_11_5_dat', targetClasses: '12/1, 10/5', zone: 'Phòng 2 (tầng 1) & Phòng 15 (tầng 3)', shiftTime: '06:45 - 07:15 & 11:15 - 11:45' },

  // ================= II. LỊCH TRỰC PHÂN CÔNG BUỔI CHIỀU =================
  // Thứ 2 (Chiều)
  { day: 'T2', session: 'Chiều', auditorClass: '10/1', auditorName: 'Hôih Thị Ánh Sao & Ngô Nguyễn Công Thành', auditorId: 'codo_10_1_sao', targetClasses: '10/2, 10/3', zone: 'Phòng 2 & 3 (tầng 1)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T2', session: 'Chiều', auditorClass: '10/2', auditorName: 'A ting Thị Hạo & Võ Thanh Duy', auditorId: 'codo_10_2_hao', targetClasses: '10/1, 10/4', zone: 'Phòng 1 (tầng 1) & Phòng 10 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T2', session: 'Chiều', auditorClass: '10/3', auditorName: 'Arất Thị Nương & Bríu Thị Bảo Như', auditorId: 'codo_10_3_nuong', targetClasses: '10/5, 10/6', zone: 'Phòng 8 & 9 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },

  // Thứ 3 (Chiều)
  { day: 'T3', session: 'Chiều', auditorClass: '10/4', auditorName: 'Ating Dương Khánh Thy & Bhnướch Thị Diễm', auditorId: 'codo_10_4_thy', targetClasses: '10/1, 10/2', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T3', session: 'Chiều', auditorClass: '10/5', auditorName: 'Bling Thị Gái & Arâl Thị Huế', auditorId: 'codo_10_5_gai', targetClasses: '10/4, 10/6', zone: 'Phòng 8 & 10 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T3', session: 'Chiều', auditorClass: '10/6', auditorName: 'A lăng Thị Hoạ Mi & Alăng Thuật', auditorId: 'codo_10_6_mi', targetClasses: '10/3, 10/5', zone: 'Phòng 3 (tầng 1) & Phòng 9 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },

  // Thứ 4 (Chiều)
  { day: 'T4', session: 'Chiều', auditorClass: '10/1', auditorName: 'Hôih Thị Ánh Sao & Ngô Nguyễn Công Thành', auditorId: 'codo_10_1_sao', targetClasses: '10/4, 10/5', zone: 'Phòng 9 & 10 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T4', session: 'Chiều', auditorClass: '10/2', auditorName: 'A ting Thị Hạo & Võ Thanh Duy', auditorId: 'codo_10_2_hao', targetClasses: '10/3, 10/6', zone: 'Phòng 3 (tầng 1) & Phòng 8 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T4', session: 'Chiều', auditorClass: '10/3', auditorName: 'Arất Thị Nương & Bríu Thị Bảo Như', auditorId: 'codo_10_3_nuong', targetClasses: '10/1, 10/2', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },

  // Thứ 6 (Chiều)
  { day: 'T6', session: 'Chiều', auditorClass: '10/4', auditorName: 'Ating Dương Khánh Thy & Bhnướch Thị Diễm', auditorId: 'codo_10_4_thy', targetClasses: '10/3, 10/5', zone: 'Phòng 3 (tầng 1) & Phòng 9 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T6', session: 'Chiều', auditorClass: '10/5', auditorName: 'Bling Thị Gái & Arâl Thị Huế', auditorId: 'codo_10_5_gai', targetClasses: '10/1, 10/2', zone: 'Phòng 1 & 2 (tầng 1)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' },
  { day: 'T6', session: 'Chiều', auditorClass: '10/6', auditorName: 'A lăng Thị Hoạ Mi & Alăng Thuật', auditorId: 'codo_10_6_mi', targetClasses: '10/4, 10/6', zone: 'Phòng 8 & 10 (tầng 2)', shiftTime: '12:45 - 13:15 & 16:45 - 17:15' }
];

export const generateWeekDuties = (weekNum: number): DutyAssignment[] => {
  return OFFICIAL_DUTY_SCHEDULE_TEMPLATE.map((tpl, idx) => ({
    ...tpl,
    id: `duty-w${weekNum}-${String(idx + 1).padStart(2, '0')}`,
    weekNumber: weekNum,
    isLiveNow: weekNum === 1 && tpl.day === 'T2' && tpl.session === 'Sáng'
  }));
};

export const INITIAL_DUTIES: DutyAssignment[] = Array.from({ length: 35 }, (_, i) => generateWeekDuties(i + 1)).flat();

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
    content: `[KHẨN] YÊU CẦU 100% ĐOÀN VIÊN, THANH NIÊN VÀ HỌC SINH 18 CHI ĐOÀN NGHIÊM TÚC THỰC HIỆN KỂ TỪ NGÀY 01/09/2026.

### I. MỤC ĐÍCH & YÊU CẦU
Nhằm chấn chỉnh kỷ cương học đường, nâng cao ý thức tự giác và xây dựng môi trường học đường văn minh, Ban Chấp hành Đoàn trường THPT Quang Trung - Đông Giang quán triệt:
- **Tác phong & Trang phục**: Mặc đúng đồng phục áo sơ mi trắng, quần tối màu, mang dép có quai hậu hoặc giày thể thao.
- **Thẻ học sinh**: 100% học sinh phải đeo thẻ học sinh khi vào cổng trường và trong suốt buổi học.
- **Vệ sinh & Nề nếp**: Tuyệt đối **không mang đồ ăn sáng, trà sữa, nước ngọt** vào phòng học.

### II. LỊCH KIỂM TRA ĐỘI CỜ ĐỎ
| Khung Giờ | Vị Trí Giám Sát | Nội Dung Kiểm Tra Trọng Tâm |
| :--- | :--- | :--- |
| **06h30 - 07h00** | Cổng chính & Nhà xe | Đi muộn, thẻ học sinh, trang phục, an toàn giao thông |
| **07h15 - 07h45** | Dãy phòng học Khối 10, 11, 12 | Sĩ số, truy bài 15 phút đầu giờ, vệ sinh phòng học |
| **Giờ ra chơi** | Sân trường & Khu Căn tin | Vứt rác đúng nơi quy định, không tụ tập gây ồn ào |

[LƯU Ý] Các trường hợp vi phạm cố tình tái phạm nhiều lần sẽ bị trừ điểm theo thang điểm thi đua và mời GVCN làm việc trực tiếp.`,
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    author: 'Cô Zdrăm Thị Thành Thương',
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
    content: `[QUAN TRỌNG] TRIỆU TẬP PHIÊN HỌP MỞ RỘNG BAN CHẤP HÀNH 18 CHI ĐOÀN KHỐI 10, 11, 12.

### I. THỜI GIAN & ĐỊA ĐIỂM
- **⏰ Thời gian**: 16h30 Chiều Thứ 5 (Đúng giờ).
- **📍 Địa điểm**: Phòng Hội Đồng Sư Phạm (Tầng 2 - Nhà Hiệu Bộ).
- **👥 Thành phần bắt buộc**:
  1. Bí thư Chi đoàn 18 lớp.
  2. Lớp phó Lao động / Trưởng ban Thể thao Chi đoàn.

### II. NỘI DUNG LÀM VIỆC
1. Bốc thăm vị trí dựng lều trại và bốc thăm thứ tự thi diễn văn nghệ.
2. Thống nhất quy định an toàn vệ sinh thực phẩm và phòng cháy chữa cháy trong Hội trại.
3. Hướng dẫn nộp danh sách đoàn viên tham gia các trò chơi vận động (Kéo co, Nhảy bao bố, Chạy tiếp sức).

[LƯU Ý] Yêu cầu các đồng chí Bí thư mang theo sổ tay công tác Đoàn và danh sách đoàn viên chi đoàn có chữ ký của GVCN.`,
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
  {
    id: 'news-daihoi-2026',
    title: 'ĐẠI HỘI ĐẠI BIỂU ĐOÀN TNCS HỒ CHÍ MINH TRƯỜNG THPT QUANG TRUNG – ĐÔNG GIANG LẦN THỨ II, NHIỆM KỲ 2026–2027',
    excerpt: '💙 Tuổi trẻ Quang Trung – Đông Giang: Đoàn kết – Tiên phong – Sáng tạo – Phát triển! 💙',
    content: `[TRỌNG THỂ] ĐẠI HỘI ĐẠI BIỂU ĐOÀN TNCS HỒ CHÍ MINH TRƯỜNG THPT QUANG TRUNG - ĐÔNG GIANG LẦN THỨ II, NHIỆM KỲ 2026 - 2027 THÀNH CÔNG RỰC RỠ.

Đại hội đã tổng kết công tác Đoàn và phong trào thanh niên nhiệm kỳ 2025 - 2026, đồng thời đề ra phương hướng, mục tiêu và nhiệm vụ công tác Đoàn nhiệm kỳ mới 2026 - 2027.

Khẩu hiệu hành động: Tuổi trẻ THPT Quang Trung - Đông Giang Tiên phong - Bản lĩnh - Đoàn kết - Sáng tạo!

*(Bài viết và hình ảnh được đồng bộ từ Fanpage Tuổi trẻ THPT Quang Trung - Đông Giang)*`,
    thumbnail: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
    author: 'Tuổi trẻ THPT Quang Trung - Đông Giang',
    authorRole: 'Fanpage Chính Thức',
    publishDate: '2026-09-03 08:00',
    isPinned: true,
    isHidden: false,
    category: 'news',
    urgency: 'critical',
    tags: ['#Facebook', '#DaiHoiDoan', '#TuoiTreQuangTrung', '#NhiemKy2026_2027'],
    views: 1850,
    sourceUrl: 'https://www.facebook.com/profile.php?id=100065567376763',
    sourcePlatform: 'facebook',
    images: [
      'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&auto=format&fit=crop&q=80'
    ]
  },

  // 2. BẢN TIN & HOẠT ĐỘNG PHONG TRÀO ĐOÀN
  {
    id: 'news-01',
    title: 'Vinh Danh Top 3 Chi Đoàn Xuất Sắc Nhất Tuần 23 & Khen Thưởng Đội Cờ Đỏ',
    excerpt: 'Chúc mừng Chi đoàn 12/1 (Hạng Nhất), Chi đoàn 11/3 (Hạng Nhì) và Chi đoàn 10/1 (Hạng Ba) đã đạt số điểm thi đua xuất sắc trên 1430 điểm.',
    content: `[KHEN THƯỞNG] TUYÊN DƯƠNG CÁC TẬP THỂ LỚP XUẤT SẮC DẪN ĐẦU THI ĐUA NỀ NẾP TUẦN 23.

Ban Thi đua - Khen thưởng Đoàn trường THPT Quang Trung - Đông Giang nhiệt liệt chúc mừng thành tích xuất sắc của các chi đoàn:

### 🏆 BẢNG VÀNG THÀNH TÍCH TUẦN 23
| Hạng | Chi Đoàn | Điểm Thi Đua | Giáo Viên Chủ Nhiệm | Khen Thưởng |
| :---: | :---: | :---: | :--- | :--- |
| 🥇 **Hạng Nhất** | **Chi đoàn 12/1** | **1438 / 1440** | Thầy Hoàng Văn Sơn | Cờ thi đua Tuần + Cúp Luân Lưu |
| 🥈 **Hạng Nhì** | **Chi đoàn 11/3** | **1432 / 1440** | Cô Nguyễn Thị Lan | Giấy biểu dương của BGH |
| 🥉 **Hạng Ba** | **Chi đoàn 10/1** | **1428 / 1440** | Thầy Lê Minh Trí | Khen thưởng phong trào Khối 10 |

### 👏 ĐÁNH GIÁ CHUNG TỪ BAN CHẤP HÀNH
- **Ưu điểm**: 100% các lớp duy trì tốt giờ tự quản 15 phút đầu giờ, đồng phục nghiêm túc, không có học sinh vi phạm an toàn giao thông.
- **Biểu dương Đội Cờ đỏ**: Các đồng chí thành viên cờ đỏ đã làm việc khách quan, có minh chứng ảnh chụp rõ ràng và giải đáp khiếu nại minh bạch.`,
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
    content: `Chào mừng năm học mới và kỷ niệm ngày thành lập trường, Đoàn trường THPT Quang Trung - Đông Giang ban hành điều lệ Hội thao Thanh niên 2026:

### I. CÁC MÔN THI ĐẤU
1. **Kéo Co Nam Nữ**: Đội hình 10 VĐV (5 nam + 5 nữ), thi đấu theo thể thức loại trực tiếp.
2. **Cầu Lông**: Đơn nam, Đơn nữ và Đôi nam nữ.
3. **Bóng Đá Mini 5 Người**: Khối 11 & Khối 12.
4. **Điền Kinh 100m & Tiếp Sức 4x100m**: Đại diện mỗi lớp 2 VĐV nam và 2 VĐV nữ.

### II. ĐIỂM CỘNG THI ĐUA ĐOÀN THỂ
- 🥇 Giải Nhất: **+20 điểm** vào bảng điểm thi đua học kỳ.
- 🥈 Giải Nhì: **+15 điểm**.
- 🥉 Giải Ba: **+10 điểm**.
- 🎖️ Giải Khuyến khích: **+5 điểm**.

[LƯU Ý] Hạn chót đăng ký danh sách vận động viên qua Cổng Bí Thư Chi Đoàn: **17h00 ngày 08/09/2026**.`,
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
    content: `Sáng Chủ nhật vừa qua, hơn 150 đoàn viên thanh niên xung kích 18 chi đoàn đã tham gia chiến dịch **"Chủ Nhật Xanh"** với tinh thần nhiệt huyết, hăng say:

### 🌿 KẾT QUẢ ĐẠT ĐƯỢC
- Trồng mới và chăm sóc **20 cây hoa thanh niên** dọc lối đi sân trường.
- Làm sạch và tỉa cây cảnh tại Vườn thực nghiệm sinh học.
- Phân loại và tái chế **hơn 50kg rác nhựa**, gây quỹ học bổng *"Thắp sáng ước mơ tuổi trẻ"*.

[KHEN THƯỞNG] Tuyên dương tinh thần xung kích của tập thể **Chi đoàn 10/1**, **Chi đoàn 11/4** và **Chi đoàn 12/2** đã hoàn thành xuất sắc công việc vượt tiến độ!`,
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
  },
  // --- BẢN TIN CHÍNH THỨC TỪ FANPAGE TUỔI TRẺ THPT QUANG TRUNG - ĐÔNG GIANG ---
  {
    id: 'fb-100065567376763-chunhatxanh-2026',
    title: 'Đoàn trường THPT Quang Trung - Đông Giang ra quân hưởng ứng "Ngày Chủ nhật xanh" năm 2026',
    excerpt: 'Sáng ngày 20/09/2026, Đoàn trường THPT Quang Trung - Đông Giang phối hợp Đoàn xã Đông Giang tổ chức ra quân Ngày Chủ nhật xanh...',
    content: `🌿💚 ĐOÀN TRƯỜNG THPT QUANG TRUNG - ĐÔNG GIANG RA QUÂN HƯỞNG ỨNG “NGÀY CHỦ NHẬT XANH” NĂM 2026 🌱🌍

Thực hiện chương trình công tác Đoàn và phong trào thanh niên trường học năm học 2026 - 2027, phát huy tinh thần xung kích, tình nguyện của tuổi trẻ vì môi trường sáng - xanh - sạch - đẹp.

Sáng ngày 20/09/2026, Đoàn trường THPT Quang Trung - Đông Giang phối hợp cùng Đoàn xã Đông Giang tổ chức lễ ra quân "Ngày Chủ nhật xanh" với sự tham gia nhiệt tình của đông đảo đoàn viên, thanh niên các chi đoàn.

Các hoạt động trọng tâm:
✅ Tổng vệ sinh, phát quang bụi rậm, chỉnh trang đường hoa thanh niên tại khuôn viên nhà trường.
✅ Trồng mới cây xanh, chăm sóc các bồn hoa, cây cảnh.
✅ Tuyên truyền nâng cao ý thức phân loại rác thải, bảo vệ cảnh quan sư phạm học đường.

Đây là hoạt động ý nghĩa nhằm lan tỏa thông điệp sống xanh, nâng cao trách nhiệm của mỗi đoàn viên, học sinh đối với môi trường học đường và cộng đồng! 🌳✨`,
    thumbnail: '/images/fb/chunhatxanh_2026.jpg',
    author: 'Tuổi trẻ THPT Quang Trung - Đông Giang',
    authorRole: 'Trang Facebook Đoàn Trường',
    publishDate: '2026-09-20 10:45',
    isPinned: false,
    isHidden: false,
    category: 'news',
    urgency: 'normal',
    tags: ['Facebook', 'Đoàn Trường', 'Ngày Chủ Nhật Xanh', 'Thanh Niên Tình Nguyện'],
    views: 382,
    sourceUrl: 'https://www.facebook.com/profile.php?id=100065567376763',
    sourcePlatform: 'facebook'
  },
  {
    id: 'fb-100065567376763-thientai-2026',
    title: 'Trường THPT Quang Trung - Đông Giang tăng cường công tác phòng, chống thiên tai và ứng phó thời tiết bất thường',
    excerpt: 'Cảnh báo thời tiết và hướng dẫn ứng phó khẩn cấp dành cho giáo viên, nhân viên, bảo vệ và học sinh trường THPT Quang Trung - Đông Giang.',
    content: `📢🌧️ TRƯỜNG THPT QUANG TRUNG - ĐÔNG GIANG TĂNG CƯỜNG CÔNG TÁC PHÒNG, CHỐNG THIÊN TAI VÀ ỨNG PHÓ THỜI TIẾT BẤT THƯỜNG 🌧️📢

Trước diễn biến bất thường của thời tiết mùa mưa bão tại vùng cao Đông Giang, Ban Giám hiệu và Ban Chấp hành Đoàn trường THPT Quang Trung ban hành hướng dẫn ứng phó khẩn cấp:

1. Đối với học sinh:
- Tuyệt đối không băng qua các ngầm tràn, khe suối khi nước dâng cao, dòng chảy xiết.
- Chủ động liên lạc với GVCN và theo dõi cập nhật các bản tin thời tiết của nhà trường.
- Học sinh bán trú, nội trú nghiêm túc chấp hành hướng dẫn của thầy cô quản nhiệm.

2. Đối với cán bộ, giáo viên, nhân viên & tổ bảo vệ:
- Kiểm tra an toàn hệ thống cây xanh, mái che, hệ thống điện và phòng học.
- Sẵn sàng phương án di chuyển tài liệu, thiết bị dạy học lên khu vực cao ráo, an toàn.
- Đảm bảo trực ban 24/24 và phối hợp chặt chẽ với lực lượng cứu hộ địa phương.`,
    thumbnail: '/images/fb/thientai_2026.png',
    author: 'Tuổi trẻ THPT Quang Trung - Đông Giang',
    authorRole: 'Trang Facebook Đoàn Trường',
    publishDate: '2026-09-09 08:15',
    isPinned: true,
    isHidden: false,
    category: 'news',
    urgency: 'urgent',
    tags: ['Facebook', 'Đoàn Trường', 'Thông Báo Khẩn', 'An Toàn Học Đường'],
    views: 520,
    sourceUrl: 'https://www.facebook.com/profile.php?id=100065567376763',
    sourcePlatform: 'facebook'
  },
  {
    id: 'fb-100065567376763-daihoi-2026',
    title: 'Đại hội Đại biểu Đoàn TNCS Hồ Chí Minh Trường THPT Quang Trung – Đông Giang Lần thứ II, Nhiệm kỳ 2026–2027',
    excerpt: 'Đại hội điểm của khối các trường THPT huyện Đông Giang, bầu ra Ban Chấp hành Đoàn trường khóa mới đoàn kết, sáng tạo và xung kích.',
    content: `🚩 ĐẠI HỘI ĐẠI BIỂU ĐOÀN TNCS HỒ CHÍ MINH TRƯỜNG THPT QUANG TRUNG – ĐÔNG GIANG LẦN THỨ II, NHIỆM KỲ 2026–2027 THÀNH CÔNG TỐT ĐẸP!

Đại hội đã nghiêm túc đánh giá kết quả triển khai Nghị quyết Đại hội khóa I; kiểm điểm sự lãnh đạo của Ban Chấp hành khóa cũ và xác định mục tiêu, phương hướng, nhiệm vụ công tác Đoàn và phong trào thanh niên trường học nhiệm kỳ 2026 - 2027.

Với khẩu hiệu hành động: "Tuổi trẻ THPT Quang Trung: Đoàn kết - Bản lĩnh - Tiên phong - Sáng tạo - Phát triển", Đại hội đã sáng suốt bầu ra 15 đồng chí ưu tú vào Ban Chấp hành Đoàn trường khóa mới.

Xin chúc mừng Ban Chấp hành khóa mới hoàn thành xuất sắc mọi nhiệm vụ được giao! 💐✨`,
    thumbnail: '/images/fb/daihoi_doan_2026.jpg',
    author: 'Tuổi trẻ THPT Quang Trung - Đông Giang',
    authorRole: 'Trang Facebook Đoàn Trường',
    publishDate: '2026-09-03 09:00',
    isPinned: false,
    isHidden: false,
    category: 'news',
    urgency: 'normal',
    tags: ['Facebook', 'Đoàn Trường', 'Đại Hội Đoàn', 'Tuổi Trẻ Quang Trung'],
    views: 615,
    sourceUrl: 'https://www.facebook.com/profile.php?id=100065567376763',
    sourcePlatform: 'facebook'
  },
  {
    id: 'fb-100065567376763-khaigiang-2026',
    title: 'Rộn ràng Lễ Khai giảng Năm học mới 2026 - 2027 tại Trường THPT Quang Trung - Đông Giang',
    excerpt: 'Chào đón các em học sinh Khối 10 gia nhập mái trường THPT Quang Trung thân yêu trong niềm hân hoan, quyết tâm thi đua dạy tốt - học tốt.',
    content: `🎉 HÒA CHUNG KHÔNG KHÍ HÂN HOAN TOÀN QUỐC: TRƯỜNG THPT QUANG TRUNG - ĐÔNG GIANG LONG TRỌNG TỔ CHỨC LỄ KHAI GIẢNG NĂM HỌC 2026 - 2027 🌸🔔

Sáng ngày 05/09/2026, tiếng trống trường rộn rã đã chính thức vang lên, đánh dấu một năm học mới với nhiều niềm tin và kỳ vọng của thầy và trò nhà trường.

Đoàn trường vinh dự đón nhận sự quan tâm chỉ đạo của Lãnh đạo huyện Đông Giang, Ban Giám hiệu nhà trường và đại diện Hội Cha mẹ học sinh. Tại buổi lễ, Đoàn trường đã trao tặng các suất học bổng "Tiếp sức đến trường" cho các bạn học sinh có hoàn cảnh khó khăn vươn lên trong học tập.

Chúc toàn thể thầy cô giáo và các em học sinh có một năm học mới tràn đầy niềm vui, gặt hái nhiều thành tích rực rỡ! 🎈📚`,
    thumbnail: '/images/fb/daihoi_doan_2026.jpg',
    author: 'Tuổi trẻ THPT Quang Trung - Đông Giang',
    authorRole: 'Trang Facebook Đoàn Trường',
    publishDate: '2026-09-05 08:00',
    isPinned: false,
    isHidden: false,
    category: 'news',
    urgency: 'normal',
    tags: ['Facebook', 'Đoàn Trường', 'Khai Giảng 2026', 'Năm Học Mới'],
    views: 489,
    sourceUrl: 'https://www.facebook.com/profile.php?id=100065567376763',
    sourcePlatform: 'facebook'
  }
];

export const INITIAL_NOTICES: TaskNotice[] = [
  {
    id: 'not-01',
    title: 'Điều động lao động dọn vệ sinh Sân bóng chuẩn bị Hội thao',
    content: `[KHẨN] Phân công nhiệm vụ lao động dọn vệ sinh khuôn viên Sân vận động:
- **Đối tượng**: Chi đoàn **10/1** và **11/5** (Mỗi lớp cử đúng **10 đoàn viên**).
- **Thời gian**: 14h00 Chiều Thứ 6 (04/09).
- **Dụng cụ**: Chổi rễ, bao đựng rác, găng tay bảo hộ.
- **Kỷ luật**: Điểm danh đầu giờ và cuối giờ. Lỗi vắng mặt trừ điểm theo tiêu chí 1.6.`,
    type: 'lao_dong',
    targetClasses: ['10/1', '11/5'],
    deadline: '2026-09-04 17:00',
    createdAt: '2026-09-01 09:00',
    assignedBy: 'Cô Zdrăm Thị Thành Thương - Bí thư Đoàn',
    status: 'pending'
  },
  {
    id: 'not-02',
    title: 'Triệu tập cuộc họp Ban Chấp Hành Chi đoàn 18 lớp',
    content: `[QUAN TRỌNG] Triệu tập phiên họp mở rộng Ban Chấp hành Chi đoàn:
- **Thành phần**: Bí thư và Lớp phó Lao động của 18 chi đoàn.
- **Thời gian**: **16h30 Thứ 5** tại **Phòng Hội đồng Sư phạm**.
- **Nội dung**: Triển khai kế hoạch Hội trại 26/03 và bốc thăm vị trí lều trại.`,
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
    userName: 'Cô Zdrăm Thị Thành Thương',
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
    id: '2026_2027',
    name: 'Năm học 2026 - 2027',
    startDate: '2026-09-07',
    endDate: '2027-05-31',
    isCurrent: true,
    isFrozen: false,
    createdAt: '2026-08-15 08:00',
    notes: 'Năm học hiện hành của toàn trường THPT Quang Trung'
  },
  {
    id: '2025_2026',
    name: 'Năm học 2025 - 2026 (Lịch sử)',
    startDate: '2025-09-05',
    endDate: '2026-05-31',
    isCurrent: false,
    isFrozen: true,
    createdAt: '2025-08-15 08:00',
    notes: 'Dữ liệu lưu trữ năm học trước (Chỉ xem)'
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

export const INITIAL_MEDIA_FOLDERS: MediaFolder[] = [
  // 1. CÔNG KHAI (Public)
  {
    id: 'album-branding',
    name: 'Logo & Nhận Diện Đoàn Trường',
    description: 'Logo trường, huy hiệu Đoàn, mẫu banner sự kiện và nhận diện',
    parentId: null,
    scope: 'public',
    color: '#3b82f6',
    icon: 'folder',
    category: 'branding',
    isSystem: false,
    order: 1,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  },
  {
    id: 'album-activities',
    name: 'Hoạt Động Phong Trào & Sự Kiện',
    description: 'Hình ảnh hoạt động tình nguyện, phong trào, hội thi và sự kiện Đoàn',
    parentId: null,
    scope: 'public',
    color: '#f59e0b',
    icon: 'folder',
    category: 'activities',
    isSystem: false,
    order: 2,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  },
  {
    id: 'album-atgt',
    name: 'Tuyên truyền an toàn giao thông',
    description: 'Hình ảnh hoạt động tuyên truyền phổ biến kiến thức an toàn giao thông',
    parentId: 'album-activities',
    scope: 'public',
    color: '#ef4444',
    icon: 'folder',
    category: 'activities',
    isSystem: false,
    order: 1,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  },
  {
    id: 'album-chunhatxanh',
    name: 'Ngày Chủ Nhật Xanh',
    description: 'Chiến dịch Ngày Chủ Nhật Xanh, dọn vệ sinh trường lớp và bảo vệ môi trường',
    parentId: 'album-activities',
    scope: 'public',
    color: '#10b981',
    icon: 'folder',
    category: 'activities',
    isSystem: false,
    order: 2,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  },
  {
    id: 'album-daihoidoan',
    name: 'Đại Hội Đoàn Trường',
    description: 'Hình ảnh Đại hội Đại biểu Đoàn TNCS Hồ Chí Minh các nhiệm kỳ',
    parentId: 'album-activities',
    scope: 'public',
    color: '#3b82f6',
    icon: 'folder',
    category: 'activities',
    isSystem: false,
    order: 3,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  },
  {
    id: 'album-news',
    name: 'Bản Tin Đại Hội & Hội Thi Đoàn',
    description: 'Hình ảnh bản tin tuyên truyền, hội thi, diễn đàn thanh niên',
    parentId: null,
    scope: 'public',
    color: '#10b981',
    icon: 'folder',
    category: 'news_events',
    isSystem: false,
    order: 3,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  },
  {
    id: 'album-violations',
    name: 'Minh Chứng Vi Phạm Nề Nếp',
    description: 'Hình ảnh minh chứng nề nếp thi đua, vi phạm và điểm cộng các chi đoàn',
    parentId: null,
    scope: 'public',
    color: '#ef4444',
    icon: 'folder',
    category: 'violations',
    isSystem: false,
    order: 4,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  },
  {
    id: 'album-students',
    name: 'Ảnh Thẻ & Hồ Sơ Đoàn Viên',
    description: 'Ảnh chân dung 3x4, ảnh thẻ học sinh và đoàn viên các khối lớp',
    parentId: null,
    scope: 'public',
    color: '#8b5cf6',
    icon: 'folder',
    category: 'students',
    isSystem: false,
    order: 5,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  },
  {
    id: 'album-general',
    name: 'Kho Tư Liệu Dùng Chung',
    description: 'Kho ảnh tư liệu tổng hợp, tài nguyên chung toàn trường',
    parentId: null,
    scope: 'public',
    color: '#06b6d4',
    icon: 'folder',
    category: 'general',
    isSystem: false,
    order: 6,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  },

  // 2. NỘI BỘ (Internal)
  {
    id: 'album-int-codo',
    name: 'Minh Chứng Xử Lý Nề Nếp & Cờ Đỏ',
    description: 'Ảnh chụp minh chứng vi phạm nội bộ và biên bản xác minh',
    parentId: null,
    scope: 'internal',
    color: '#ef4444',
    icon: 'folder',
    category: 'violations',
    isSystem: false,
    order: 1,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  },
  {
    id: 'album-int-the-doan',
    name: 'Hồ Sơ Sổ Đoàn & Thẻ Đoàn Viên',
    description: 'Ảnh hồ sơ đoàn viên lưu trữ nội bộ',
    parentId: null,
    scope: 'internal',
    color: '#8b5cf6',
    icon: 'folder',
    category: 'students',
    isSystem: false,
    order: 2,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  },
  {
    id: 'album-int-bch',
    name: 'Tài Liệu & Ảnh Họp BCH Đoàn Trường',
    description: 'Hình ảnh hội nghị, sinh hoạt chi đoàn nội bộ và biên bản họp',
    parentId: null,
    scope: 'internal',
    color: '#3b82f6',
    icon: 'folder',
    category: 'general',
    isSystem: false,
    order: 3,
    createdAt: '2026-08-20 08:00',
    updatedAt: '2026-08-20 08:00'
  }
];

export const INITIAL_MEDIA_ASSETS: MediaItem[] = [
  // 1. Nhận diện thương hiệu (Branding)
  {
    id: 'media-brand-01',
    title: 'Logo Trường THPT Quang Trung',
    url: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?auto=format&fit=crop&q=80&w=400',
    category: 'branding',
    folderId: 'album-branding',
    bucket: 'media',
    size: 64200,
    sizeFormatted: '64 KB',
    format: 'webp',
    uploadedAt: '2026-08-20 08:30',
    tags: ['Logo', 'Trường', 'Nhận diện'],
    isSystemAsset: true
  },
  {
    id: 'media-brand-02',
    title: 'Huy Hiệu Đoàn TNCS Hồ Chí Minh',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a2/Huy_Hi%E1%BB%87u_%C4%90o%C3%A0n.svg/500px-Huy_Hi%E1%BB%87u_%C4%90o%C3%A0n.svg.png',
    category: 'branding',
    folderId: 'album-branding',
    bucket: 'media',
    size: 58400,
    sizeFormatted: '58 KB',
    format: 'png',
    uploadedAt: '2026-08-20 08:35',
    tags: ['Huy hiệu', 'Đoàn Thanh Niên', 'Nhận diện'],
    isSystemAsset: true
  },
  {
    id: 'media-brand-03',
    title: 'Banner Đầu Trang - Cổng Thông Tin Đoàn Trường',
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&q=80&w=1200',
    category: 'branding',
    folderId: 'album-branding',
    bucket: 'media',
    size: 142000,
    sizeFormatted: '142 KB',
    format: 'jpg',
    uploadedAt: '2026-08-20 08:40',
    tags: ['Banner', 'Header', 'Trang chủ'],
    isSystemAsset: true
  },
  {
    id: 'media-brand-04',
    title: 'Banner Chân Trang - Khẩu Hiệu Tuổi Trẻ',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=1200',
    category: 'branding',
    folderId: 'album-branding',
    bucket: 'media',
    size: 118000,
    sizeFormatted: '118 KB',
    format: 'jpg',
    uploadedAt: '2026-08-20 08:45',
    tags: ['Banner', 'Footer', 'Slogan'],
    isSystemAsset: true
  },

  // 2. Slide Hoạt Động Đoàn & Phong Trào
  {
    id: 'media-slide-01',
    title: 'Lễ Khai Giảng Năm Học Mới 2026 - 2027',
    url: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?auto=format&fit=crop&q=80&w=1200',
    category: 'activities',
    folderId: 'album-activities',
    bucket: 'media',
    size: 128000,
    sizeFormatted: '128 KB',
    format: 'jpg',
    uploadedAt: '2026-09-07 09:30',
    tags: ['Khai giảng', 'Slide', 'Năm học mới']
  },
  {
    id: 'media-slide-02',
    title: 'Lễ Kết Nạp Đoàn Viên Mới - Đợt 1',
    url: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&q=80&w=1200',
    category: 'activities',
    folderId: 'album-activities',
    bucket: 'media',
    size: 135000,
    sizeFormatted: '135 KB',
    format: 'jpg',
    uploadedAt: '2026-09-15 14:00',
    tags: ['Kết nạp Đoàn', 'Chi đoàn', 'Lớp 10']
  },
  {
    id: 'media-slide-03',
    title: 'Hội Thao & Giải Bóng Đá Thanh Niên Truyền Thống',
    url: 'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&q=80&w=1200',
    category: 'activities',
    folderId: 'album-activities',
    bucket: 'media',
    size: 148000,
    sizeFormatted: '148 KB',
    format: 'jpg',
    uploadedAt: '2026-09-20 16:30',
    tags: ['Hội thao', 'Bóng đá', 'Thể thao']
  },
  {
    id: 'media-slide-04',
    title: 'Chiến Dịch Tình Nguyện Tiếp Sức Đến Trường',
    url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&q=80&w=1200',
    category: 'activities',
    folderId: 'album-activities',
    bucket: 'media',
    size: 122000,
    sizeFormatted: '122 KB',
    format: 'jpg',
    uploadedAt: '2026-09-28 10:15',
    tags: ['Tình nguyện', 'Mùa hè xanh', 'Tiếp sức']
  },

  // 3. Bản Tin & Sự Kiện (News & Events)
  {
    id: 'media-news-01',
    title: 'Đại Hội Đại Biểu Đoàn TNCS Hồ Chí Minh Trường THPT Quang Trung',
    url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&q=80&w=1200',
    category: 'news_events',
    folderId: 'album-news',
    bucket: 'media',
    size: 165000,
    sizeFormatted: '165 KB',
    format: 'jpg',
    uploadedAt: '2026-09-01 08:00',
    tags: ['Đại hội', 'BCH Đoàn', 'Bản tin']
  },
  {
    id: 'media-news-02',
    title: 'Hội Thi Rung Chuông Vàng Tìm Hiểu Pháp Luật & Luật ATGT',
    url: 'https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?auto=format&fit=crop&q=80&w=1200',
    category: 'news_events',
    folderId: 'album-news',
    bucket: 'media',
    size: 154000,
    sizeFormatted: '154 KB',
    format: 'jpg',
    uploadedAt: '2026-09-10 15:20',
    tags: ['Rung chuông vàng', 'ATGT', 'Học thuật']
  },

  // 4. Minh Chứng Vi Phạm & Điểm Cộng (Violations & Discipline)
  {
    id: 'media-violation-01',
    title: 'Minh chứng vi phạm: Không mặc áo đồng phục đầu tuần',
    url: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&q=80&w=800',
    category: 'violations',
    folderId: 'album-violations',
    bucket: 'proof_images',
    size: 92000,
    sizeFormatted: '92 KB',
    format: 'jpg',
    uploadedAt: '2026-09-08 07:10',
    classId: '10/2',
    weekNumber: 1,
    tags: ['Đồng phục', 'Tác phong', '10/2']
  },
  {
    id: 'media-violation-02',
    title: 'Minh chứng vi phạm: Học sinh đi xe máy không đội mũ bảo hiểm',
    url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&q=80&w=800',
    category: 'violations',
    folderId: 'album-violations',
    bucket: 'proof_images',
    size: 104000,
    sizeFormatted: '104 KB',
    format: 'jpg',
    uploadedAt: '2026-09-14 06:55',
    classId: '11/3',
    weekNumber: 2,
    tags: ['Mũ bảo hiểm', 'ATGT', '11/3']
  },
  {
    id: 'media-violation-03',
    title: 'Minh chứng vệ sinh: Khu vực hành lang chưa quét dọn đầu giờ',
    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=800',
    category: 'violations',
    folderId: 'album-violations',
    bucket: 'proof_images',
    size: 88000,
    sizeFormatted: '88 KB',
    format: 'jpg',
    uploadedAt: '2026-09-22 07:05',
    classId: '12/4',
    weekNumber: 3,
    tags: ['Vệ sinh', 'Hành lang', '12/4']
  },

  // 5. Ảnh Thẻ Học Sinh & Đoàn Viên (Students)
  {
    id: 'media-student-01',
    title: 'Ảnh thẻ học sinh: Rapát Minh Quang (Chi đoàn 10/1)',
    url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=500',
    category: 'students',
    folderId: 'album-students',
    bucket: 'media',
    size: 45000,
    sizeFormatted: '45 KB',
    format: 'jpg',
    uploadedAt: '2026-09-05 08:00',
    classId: '10/1',
    tags: ['Ảnh thẻ', 'Học sinh', '10/1']
  },
  {
    id: 'media-student-02',
    title: 'Ảnh thẻ đoàn viên: ALăng Thị Lan (Chi đoàn 11/2)',
    url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=500',
    category: 'students',
    folderId: 'album-students',
    bucket: 'media',
    size: 48000,
    sizeFormatted: '48 KB',
    format: 'jpg',
    uploadedAt: '2026-09-05 08:15',
    classId: '11/2',
    tags: ['Ảnh thẻ', 'Đoàn viên', '11/2']
  }
];

// ==========================================
// KHO VĂN BẢN & BIỂU MẪU ĐOÀN DÙNG CHUNG
// ==========================================

export const INITIAL_DOCUMENT_FOLDERS: DocumentFolder[] = [
  {
    id: 'folder-forms',
    name: '01. Biểu Mẫu Chuẩn Đoàn Trường',
    code: '01_BIEU_MAU',
    description: 'Các mẫu đơn xin vào Đoàn, chuyển sinh hoạt Đoàn, trích biên bản, phiếu đánh giá xếp loại đoàn viên',
    parentId: null,
    icon: 'file-text',
    color: 'blue',
    isSystem: true,
    order: 1,
    allowedRoles: ['admin', 'manager', 'youth_secretary', 'auditor', 'user', 'public'],
    createdAt: '2026-09-01 08:00',
    updatedAt: '2026-09-01 08:00'
  },
  {
    id: 'folder-directives',
    name: '02. Văn Bản Chỉ Đạo & Nghị Quyết',
    code: '02_CHI_DAO',
    description: 'Nghị quyết đại hội, quy chế thi đua nề nếp, hướng dẫn công tác Đoàn và phong trào thanh niên',
    parentId: null,
    icon: 'shield',
    color: 'red',
    isSystem: true,
    order: 2,
    allowedRoles: ['admin', 'manager', 'youth_secretary', 'auditor', 'user', 'public'],
    createdAt: '2026-09-01 08:00',
    updatedAt: '2026-09-01 08:00'
  },
  {
    id: 'folder-plans',
    name: '03. Kế Hoạch Phong Trào & Điều Lệ',
    code: '03_KE_HOACH',
    description: 'Điều lệ Hội thao, kế hoạch Hội trại truyền thống 26/03, kế hoạch Chủ nhật xanh',
    parentId: null,
    icon: 'award',
    color: 'emerald',
    isSystem: true,
    order: 3,
    allowedRoles: ['admin', 'manager', 'youth_secretary', 'auditor', 'user', 'public'],
    createdAt: '2026-09-01 08:00',
    updatedAt: '2026-09-01 08:00'
  },
  {
    id: 'folder-handbooks',
    name: '04. Sổ Tay & Cẩm Nang Đoàn Viên',
    code: '04_CAM_NANG',
    description: 'Điều lệ Đoàn TNCS Hồ Chí Minh, sổ tay Bí thư Chi đoàn, tài liệu bồi dưỡng cảm tình Đoàn',
    parentId: null,
    icon: 'book',
    color: 'purple',
    isSystem: true,
    order: 4,
    allowedRoles: ['admin', 'manager', 'youth_secretary', 'auditor', 'user', 'public'],
    createdAt: '2026-09-01 08:00',
    updatedAt: '2026-09-01 08:00'
  },
  {
    id: 'folder-reports',
    name: '05. Báo Cáo Thi Đua & Lưu Chiểu',
    code: '05_BAO_CAO',
    description: 'Báo cáo tổng hợp điểm thi đua hàng tuần, xếp loại nề nếp tháng và sơ kết học kỳ',
    parentId: null,
    icon: 'folder',
    color: 'amber',
    isSystem: true,
    order: 5,
    allowedRoles: ['admin', 'manager', 'youth_secretary'],
    createdAt: '2026-09-01 08:00',
    updatedAt: '2026-09-01 08:00'
  }
];

export const INITIAL_DOCUMENT_FILES: DocumentFile[] = [
  {
    id: 'doc-01',
    title: 'Mẫu 01: Đơn Xin Vào Đoàn TNCS Hồ Chí Minh (Quy Chuẩn 2026)',
    fileNumber: 'BM-01/ĐTN',
    fileName: 'Mau_01_Don_Xin_Vao_Doan_2026.docx',
    fileUrl: 'https://bqrozmqorvxpwjfmgkfk.supabase.co/storage/v1/object/public/media/Mau_01_Don_Xin_Vao_Doan.docx',
    fileSize: '124 KB',
    fileSizeBytes: 126976,
    fileType: 'docx',
    folderId: 'folder-forms',
    category: 'form',
    publishDate: '2026-09-01',
    signer: 'BCH Đoàn Trường',
    signerRole: 'Ban Thường Vụ',
    tags: ['Đơn vào Đoàn', 'Biểu mẫu', 'Kết nạp', 'Khối 10'],
    downloadsCount: 342,
    viewsCount: 680,
    isPublic: true,
    isPinned: true,
    description: 'Mẫu đơn chuẩn dành cho thanh niên ưu tú đã hoàn thành lớp Cảm tình Đoàn nộp xét kết nạp Đoàn viên mới.',
    version: 'v2.1',
    uploadedBy: 'Cô Zdrăm Thị Thành Thương',
    createdAt: '2026-09-01 08:30',
    updatedAt: '2026-09-01 08:30'
  },
  {
    id: 'doc-02',
    title: 'Mẫu 02: Giấy Giới Thiệu Chuyển Sinh Hoạt Đoàn (Học Sinh Tốt Nghiệp / Chuyển Trường)',
    fileNumber: 'BM-02/ĐTN',
    fileName: 'Mau_02_Giay_Chuyen_Sinh_Hoat_Doan.docx',
    fileUrl: 'https://bqrozmqorvxpwjfmgkfk.supabase.co/storage/v1/object/public/media/Mau_02_Chuyen_Sinh_Hoat.docx',
    fileSize: '98 KB',
    fileSizeBytes: 100352,
    fileType: 'docx',
    folderId: 'folder-forms',
    category: 'form',
    publishDate: '2026-09-01',
    signer: 'Cô Zdrăm Thị Thành Thương',
    signerRole: 'Bí thư Đoàn Trường',
    tags: ['Chuyển sinh hoạt', 'Sổ đoàn', 'Khối 12'],
    downloadsCount: 195,
    viewsCount: 420,
    isPublic: true,
    description: 'Giấy giới thiệu rút sổ Đoàn và chuyển sinh hoạt Đoàn về địa phương hoặc trường Đại học/Cao đẳng.',
    version: 'v1.0',
    uploadedBy: 'Cô Zdrăm Thị Thành Thương',
    createdAt: '2026-09-01 08:35',
    updatedAt: '2026-09-01 08:35'
  },
  {
    id: 'doc-03',
    title: 'Mẫu 03: Bản Tự Kiểm Điểm Rèn Luyện Đoàn Viên Cuối Năm Học',
    fileNumber: 'BM-03/ĐTN',
    fileName: 'Mau_03_Ban_Tu_Kiem_Diem_Doan_Vien.docx',
    fileUrl: 'https://bqrozmqorvxpwjfmgkfk.supabase.co/storage/v1/object/public/media/Mau_03_Ban_Tu_Kiem_Diem.docx',
    fileSize: '115 KB',
    fileSizeBytes: 117760,
    fileType: 'docx',
    folderId: 'folder-forms',
    category: 'form',
    publishDate: '2026-09-01',
    signer: 'Ban Thi Đua',
    signerRole: 'BCH Đoàn Trường',
    tags: ['Tự kiểm điểm', 'Xếp loại', 'Đoàn viên'],
    downloadsCount: 410,
    viewsCount: 890,
    isPublic: true,
    description: 'Phiếu tự đánh giá xếp loại chất lượng Đoàn viên (Xuất sắc, Khá, Trung bình) dành cho 18 chi đoàn.',
    version: 'v1.2',
    uploadedBy: 'BCH Đoàn Trường',
    createdAt: '2026-09-01 08:40',
    updatedAt: '2026-09-01 08:40'
  },
  {
    id: 'doc-04',
    title: 'Mẫu 04: Trích Biên Bản Đại Hội Chi Đoàn & Danh Sách Trích Ngang Ban Chấp Hành Mới',
    fileNumber: 'BM-04/ĐTN',
    fileName: 'Mau_04_Bien_Ban_Dai_Hoi_Chi_Doan.docx',
    fileUrl: 'https://bqrozmqorvxpwjfmgkfk.supabase.co/storage/v1/object/public/media/Mau_04_Bien_Ban_Dai_Hoi.docx',
    fileSize: '142 KB',
    fileSizeBytes: 145408,
    fileType: 'docx',
    folderId: 'folder-forms',
    category: 'form',
    publishDate: '2026-09-01',
    signer: 'BCH Đoàn Trường',
    signerRole: 'Ban Thường Vụ',
    tags: ['Đại hội chi đoàn', 'Biên bản', 'Bí thư chi đoàn'],
    downloadsCount: 156,
    viewsCount: 310,
    isPublic: true,
    description: 'Mẫu biên bản đại hội chi đoàn đầu năm học và danh sách đề nghị chuẩn y BCH Chi đoàn.',
    version: 'v1.0',
    uploadedBy: 'BCH Đoàn Trường',
    createdAt: '2026-09-01 08:45',
    updatedAt: '2026-09-01 08:45'
  },
  {
    id: 'doc-05',
    title: 'Nghị Quyết Đại Hội Đại Biểu Đoàn TNCS Hồ Chí Minh Trường THPT Quang Trung - Đông Giang',
    fileNumber: '01/NQ-ĐTN',
    fileName: '01_Nghi_Quyet_Dai_Hoi_Doan_Truong.pdf',
    fileUrl: 'https://bqrozmqorvxpwjfmgkfk.supabase.co/storage/v1/object/public/media/Nghi_Quyet_Dai_Hoi_Doan_Truong.pdf',
    fileSize: '1.4 MB',
    fileSizeBytes: 1468006,
    fileType: 'pdf',
    folderId: 'folder-directives',
    category: 'directive',
    publishDate: '2026-09-01',
    signDate: '2026-08-28',
    signer: 'Cô Zdrăm Thị Thành Thương',
    signerRole: 'Bí thư Đoàn Trường',
    tags: ['Nghị quyết', 'Đại hội', 'Chỉ đạo', 'Năm học 2026-2027'],
    downloadsCount: 520,
    viewsCount: 1150,
    isPublic: true,
    isPinned: true,
    description: 'Nghị quyết toàn văn phương hướng, mục tiêu và chỉ tiêu phấn đấu công tác Đoàn nhiệm kỳ mới.',
    version: 'Chính thức',
    uploadedBy: 'Cô Zdrăm Thị Thành Thương',
    createdAt: '2026-09-01 09:00',
    updatedAt: '2026-09-01 09:00'
  },
  {
    id: 'doc-06',
    title: 'Quy Chế Thi Đua Nề Nếp & Tiêu Chí Chấm Điểm Cờ Đỏ Năm Học 2026 - 2027',
    fileNumber: '02/QC-ĐTN',
    fileName: '02_Quy_Che_Thi_Dua_Va_Cham_Diem_Co_Do.pdf',
    fileUrl: 'https://bqrozmqorvxpwjfmgkfk.supabase.co/storage/v1/object/public/media/Quy_Che_Thi_Dua_2026.pdf',
    fileSize: '890 KB',
    fileSizeBytes: 911360,
    fileType: 'pdf',
    folderId: 'folder-directives',
    category: 'directive',
    publishDate: '2026-09-01',
    signDate: '2026-08-30',
    signer: 'Cô Zdrăm Thị Thành Thương',
    signerRole: 'Bí thư Đoàn Trường',
    tags: ['Quy chế', 'Thi đua', 'Cờ đỏ', 'Nề nếp', 'Thang điểm'],
    downloadsCount: 890,
    viewsCount: 2150,
    isPublic: true,
    isPinned: true,
    description: 'Quy chế ban hành 15 tiêu chí trừ điểm và 8 tiêu chí cộng điểm thi đua nề nếp áp dụng cho 18 lớp.',
    version: 'Ban hành lần 1',
    uploadedBy: 'Cô Zdrăm Thị Thành Thương',
    createdAt: '2026-09-01 09:15',
    updatedAt: '2026-09-01 09:15'
  },
  {
    id: 'doc-07',
    title: 'Điều Lệ Hội Thao Thanh Niên & Giải Kéo Co Chào Mừng Thành Lập Trường',
    fileNumber: '05/ĐL-ĐTN',
    fileName: '05_Dieu_Le_Hoi_Thao_Thanh_Nien_2026.pdf',
    fileUrl: 'https://bqrozmqorvxpwjfmgkfk.supabase.co/storage/v1/object/public/media/Dieu_Le_Hoi_Thao_2026.pdf',
    fileSize: '650 KB',
    fileSizeBytes: 665600,
    fileType: 'pdf',
    folderId: 'folder-plans',
    category: 'plan',
    publishDate: '2026-08-29',
    signDate: '2026-08-29',
    signer: 'Ủy viên Thể dục Thể thao',
    signerRole: 'BCH Đoàn Trường',
    tags: ['Hội thao', 'Điều lệ', 'Kéo co', 'Cầu lông', 'Bóng đá'],
    downloadsCount: 310,
    viewsCount: 720,
    isPublic: true,
    description: 'Quy định độ tuổi, thể thức thi đấu, cơ cấu giải thưởng và điểm cộng phong trào cho các lớp.',
    version: 'v1.0',
    uploadedBy: 'BCH Đoàn Trường',
    createdAt: '2026-08-29 16:00',
    updatedAt: '2026-08-29 16:00'
  },
  {
    id: 'doc-08',
    title: 'Kế Hoạch Tổ Chức Hội Trại Truyền Thống 26/03 & Diễn Văn Nghệ Thanh Niên',
    fileNumber: '08/KH-ĐTN',
    fileName: '08_Ke_Hoach_To_Chuc_Hoi_Trai_26_03.pdf',
    fileUrl: 'https://bqrozmqorvxpwjfmgkfk.supabase.co/storage/v1/object/public/media/Ke_Hoach_Hoi_Trai_2603.pdf',
    fileSize: '2.3 MB',
    fileSizeBytes: 2411724,
    fileType: 'pdf',
    folderId: 'folder-plans',
    category: 'plan',
    publishDate: '2026-08-30',
    signDate: '2026-08-30',
    signer: 'Cô Zdrăm Thị Thành Thương',
    signerRole: 'Bí thư Đoàn Trường',
    tags: ['Hội trại', '26/03', 'Kế hoạch', 'Văn nghệ', 'Cắm trại'],
    downloadsCount: 920,
    viewsCount: 1980,
    isPublic: true,
    isPinned: true,
    description: 'Kế hoạch tổng thể 2 ngày 1 đêm Hội trại 26/03: Dựng trại, trò chơi lớn, đêm lửa trại, ẩm thực thanh niên.',
    version: 'Chính thức',
    uploadedBy: 'Cô Zdrăm Thị Thành Thương',
    createdAt: '2026-08-30 14:30',
    updatedAt: '2026-08-30 14:30'
  },
  {
    id: 'doc-09',
    title: 'Cẩm Nang Nghiệp Vụ Bí Thư Chi Đoàn & Kỹ Năng Điều Hành Sinh Hoạt Chi Đoàn',
    fileNumber: 'CN-01/ĐTN',
    fileName: 'Cam_Nang_Nghiep_Vu_Bi_Thu_Chi_Doan.pdf',
    fileUrl: 'https://bqrozmqorvxpwjfmgkfk.supabase.co/storage/v1/object/public/media/Cam_Nang_Bi_Thu.pdf',
    fileSize: '3.6 MB',
    fileSizeBytes: 3774873,
    fileType: 'pdf',
    folderId: 'folder-handbooks',
    category: 'handbook',
    publishDate: '2026-09-01',
    signer: 'Ban Thường Vụ Đoàn Trường',
    signerRole: 'BCH Đoàn',
    tags: ['Cẩm nang', 'Bí thư chi đoàn', 'Sổ chi đoàn', 'Kỹ năng'],
    downloadsCount: 245,
    viewsCount: 560,
    isPublic: true,
    description: 'Tài liệu hướng dẫn ghi chép sổ chi đoàn, thu nộp đoàn phí, tổ chức trò chơi sinh hoạt và tuyên truyền.',
    version: 'Tái bản 2026',
    uploadedBy: 'BCH Đoàn Trường',
    createdAt: '2026-09-01 09:30',
    updatedAt: '2026-09-01 09:30'
  },
  {
    id: 'doc-10',
    title: 'Bảng Điểm Tổng Hợp Thi Đua Tuần 23 & Xếp Hạng 18 Chi Đoàn Toàn Trường',
    fileNumber: 'BC-23/TĐ',
    fileName: 'Bang_Tong_Sap_Thi_Dua_Tuan_23.xlsx',
    fileUrl: 'https://bqrozmqorvxpwjfmgkfk.supabase.co/storage/v1/object/public/media/Bang_Thi_Dua_Tuan_23.xlsx',
    fileSize: '340 KB',
    fileSizeBytes: 348160,
    fileType: 'xlsx',
    folderId: 'folder-reports',
    category: 'report',
    publishDate: '2026-08-31',
    signDate: '2026-08-31',
    signer: 'Ban Thi Đua Đoàn Trường',
    signerRole: 'BCH Đoàn',
    tags: ['Báo cáo tuần', 'Thi đua', 'Tuần 23', 'Xếp hạng'],
    downloadsCount: 110,
    viewsCount: 230,
    isPublic: false,
    description: 'Bản snapshot lưu trữ kết quả thi đua sau khi khóa sổ tuần 23, có đầy đủ chữ ký GVCN và cờ đỏ.',
    version: 'Lưu chiểu',
    uploadedBy: 'Ban Thi Đua',
    createdAt: '2026-08-31 17:00',
    updatedAt: '2026-08-31 17:00'
  }
];




