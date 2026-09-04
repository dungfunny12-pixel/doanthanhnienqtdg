process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
import pg from 'pg';

const client = new pg.Client({
  host: 'aws-0-ap-northeast-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.mvkvfvxfcqxdabxumroz',
  password: 'BDZ6OZPA7AvTkUcc',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

const INITIAL_SCHOOL_SETTINGS = {
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

const INITIAL_ACADEMIC_YEARS = [
  { id: '2024_2025', name: 'Năm học 2024 - 2025', startDate: '2024-09-05', endDate: '2025-05-31', isCurrent: false, isArchived: true, totalWeeks: 35 },
  { id: '2025_2026', name: 'Năm học 2025 - 2026', startDate: '2025-09-05', endDate: '2026-05-31', isCurrent: false, isArchived: true, totalWeeks: 35 },
  { id: '2026_2027', name: 'Năm học 2026 - 2027', startDate: '2026-09-07', endDate: '2027-05-31', isCurrent: true, isArchived: false, totalWeeks: 35 }
];

const INITIAL_CLASSES = [
  // Khối 10
  { id: '10/1', name: 'Lớp 10/1', grade: 10, gvcnName: 'Rapát Thị Mận', gvcnId: 'gvcn_10_1', bithuName: 'Nguyễn Văn An', bithuId: 'bithu_10_1', totalStudents: 42, unionMembers: 35, standardScore: 1440 },
  { id: '10/2', name: 'Lớp 10/2', grade: 10, gvcnName: 'ALăng Thị Moáy', gvcnId: 'gvcn_10_2', bithuName: 'Lê Hoàng Nam', bithuId: 'bithu_10_2', totalStudents: 40, unionMembers: 32, standardScore: 1440 },
  { id: '10/3', name: 'Lớp 10/3', grade: 10, gvcnName: 'Nguyễn Văn Tiểu', gvcnId: 'gvcn_10_3', bithuName: 'Vũ Minh Tuấn', bithuId: 'bithu_10_3', totalStudents: 43, unionMembers: 36, standardScore: 1440 },
  { id: '10/4', name: 'Lớp 10/4', grade: 10, gvcnName: 'Bùi Ngọc Giao', gvcnId: 'gvcn_10_4', bithuName: 'Hoàng Quỳnh Như', bithuId: 'bithu_10_4', totalStudents: 41, unionMembers: 34, standardScore: 1440 },
  { id: '10/5', name: 'Lớp 10/5', grade: 10, gvcnName: 'Pơloong Thị Lý', gvcnId: 'gvcn_10_5', bithuName: 'Ngô Trọng Đại', bithuId: 'bithu_10_5', totalStudents: 40, unionMembers: 30, standardScore: 1440 },
  { id: '10/6', name: 'Lớp 10/6', grade: 10, gvcnName: 'Đinh Thị Thu', gvcnId: 'gvcn_10_6', bithuName: 'Phan Bảo Ngọc', bithuId: 'bithu_10_6', totalStudents: 44, unionMembers: 38, standardScore: 1440 },

  // Khối 11
  { id: '11/1', name: 'Lớp 11/1', grade: 11, gvcnName: 'Phát Xuân Quý', gvcnId: 'gvcn_11_1', bithuName: 'Đặng Thanh Tâm', bithuId: 'bithu_11_1', totalStudents: 42, unionMembers: 40, standardScore: 1440 },
  { id: '11/2', name: 'Lớp 11/2', grade: 11, gvcnName: 'Phạm Thanh Phương', gvcnId: 'gvcn_11_2', bithuName: 'Trịnh Gia Hưng', bithuId: 'bithu_11_2', totalStudents: 41, unionMembers: 39, standardScore: 1440 },
  { id: '11/3', name: 'Lớp 11/3', grade: 11, gvcnName: 'Alăng Thị Đặng', gvcnId: 'gvcn_11_3', bithuName: 'Nguyễn Diệu Linh', bithuId: 'bithu_11_3', totalStudents: 43, unionMembers: 41, standardScore: 1440 },
  { id: '11/4', name: 'Lớp 11/4', grade: 11, gvcnName: 'Blúp Thị Viết', gvcnId: 'gvcn_11_4', bithuName: 'Lý Quốc Bảo', bithuId: 'bithu_11_4', totalStudents: 40, unionMembers: 38, standardScore: 1440 },
  { id: '11/5', name: 'Lớp 11/5', grade: 11, gvcnName: 'Lê Quang Hét', gvcnId: 'gvcn_11_5', bithuName: 'Dương Khánh An', bithuId: 'bithu_11_5', totalStudents: 42, unionMembers: 41, standardScore: 1440 },
  { id: '11/6', name: 'Lớp 11/6', grade: 11, gvcnName: 'Zơrâm Thị Thủy', gvcnId: 'gvcn_11_6', bithuName: 'Cao Viết Thắng', bithuId: 'bithu_11_6', totalStudents: 41, unionMembers: 40, standardScore: 1440 },

  // Khối 12
  { id: '12/1', name: 'Lớp 12/1', grade: 12, gvcnName: 'Zơrâm Thị Thủy', gvcnId: 'gvcn_12_1', bithuName: 'Mai Phương Thảo', bithuId: 'bithu_12_1', totalStudents: 44, unionMembers: 44, standardScore: 1440 },
  { id: '12/2', name: 'Lớp 12/2', grade: 12, gvcnName: 'Thông Thị Bông', gvcnId: 'gvcn_12_2', bithuName: 'Lương Thế Vinh', bithuId: 'bithu_12_2', totalStudents: 43, unionMembers: 43, standardScore: 1440 },
  { id: '12/3', name: 'Lớp 12/3', grade: 12, gvcnName: 'Sava Thị Hòa', gvcnId: 'gvcn_12_3', bithuName: 'Chu Đình Trọng', bithuId: 'bithu_12_3', totalStudents: 42, unionMembers: 42, standardScore: 1440 },
  { id: '12/4', name: 'Lớp 12/4', grade: 12, gvcnName: 'Lê Nguyên Trưởng', gvcnId: 'gvcn_12_4', bithuName: 'Nguyễn Thị Hoa', bithuId: 'bithu_12_4', totalStudents: 45, unionMembers: 45, standardScore: 1440 },
  { id: '12/5', name: 'Lớp 12/5', grade: 12, gvcnName: 'Nguyễn Thị Thùy', gvcnId: 'gvcn_12_5', bithuName: 'Đào Xuân Trường', bithuId: 'bithu_12_5', totalStudents: 40, unionMembers: 40, standardScore: 1440 },
  { id: '12/6', name: 'Lớp 12/6', grade: 12, gvcnName: 'Trần Văn Long', gvcnId: 'gvcn_12_6', bithuName: 'Phùng Hải Đăng', bithuId: 'bithu_12_6', totalStudents: 41, unionMembers: 41, standardScore: 1440 }
];

const INITIAL_USERS = [
  { id: 'admin', username: 'admin', name: 'Zdrăm Thị Thành Thương', role: 'admin', roleTitle: 'Bí thư Đoàn Trường / Quản trị viên', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80', email: 'bithudoan@thpt-quangtrung-donggiang.edu.vn', phone: '0912.345.678', isActive: true },
  { id: 'admin_diu', username: 'admin_diu', name: 'B nướch Dịu', role: 'admin', roleTitle: 'Phó Bí thư Đoàn Trường', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', email: 'diu.bn@thpt-quangtrung-donggiang.edu.vn', phone: '0912.999.888', isActive: true },
  
  // Cờ Đỏ
  { id: 'codo_nam', username: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'auditor', roleTitle: 'Đội trưởng Đội Cờ Đỏ (Trực Khối 10)', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80', classId: '11/2', assignedZone: 'Khối 10', phone: '0988.112.233', isActive: true },
  { id: 'codo_hai', username: 'codo_hai', name: 'Phạm Đức Hải', role: 'auditor', roleTitle: 'Cán bộ Cờ Đỏ (Trực Khối 11)', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', classId: '12/1', assignedZone: 'Khối 11', phone: '0988.223.344', isActive: true },
  { id: 'codo_linh', username: 'codo_linh', name: 'Trần Thùy Linh', role: 'auditor', roleTitle: 'Cán bộ Cờ Đỏ (Trực Khối 12)', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80', classId: '10/3', assignedZone: 'Khối 12', phone: '0988.334.455', isActive: true },
  { id: 'codo_dung', username: 'codo_dung', name: 'Lê Hoàng Dũng', role: 'auditor', roleTitle: 'Cán bộ Cờ Đỏ (Trực Cổng trường & Nhà xe)', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', classId: '11/4', assignedZone: 'Cổng trường & Nhà xe', phone: '0988.445.566', isActive: true },
  { id: 'codo_mai', username: 'codo_mai', name: 'Vũ Ngọc Mai', role: 'auditor', roleTitle: 'Cán bộ Cờ Đỏ (Trực Khu vực Sân trường)', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=80', classId: '12/5', assignedZone: 'Khu vực Sân trường', phone: '0988.556.677', isActive: true },
  { id: 'codo_quang', username: 'codo_quang', name: 'Hoàng Minh Quang', role: 'auditor', roleTitle: 'Cán bộ Cờ Đỏ (Trực Khu Căn tin & Nhà thi đấu)', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80', classId: '10/5', assignedZone: 'Khu Căn tin & Nhà thi đấu', phone: '0966.333.111', isActive: true },

  // GVCN 18 Lớp
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
  { id: 'gvcn_11_6', username: 'gvcn_11_6', name: 'Zơrâm Thị Thủy', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 11/6', classId: '11/6', phone: '0904.123.461', isActive: true },

  { id: 'gvcn_12_1', username: 'gvcn_12_1', name: 'Zơrâm Thị Thủy', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 12/1', classId: '12/1', phone: '0905.123.456', isActive: true },
  { id: 'gvcn_12_2', username: 'gvcn_12_2', name: 'Thông Thị Bông', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 12/2', classId: '12/2', phone: '0905.123.457', isActive: true },
  { id: 'gvcn_12_3', username: 'gvcn_12_3', name: 'Sava Thị Hòa', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 12/3', classId: '12/3', phone: '0905.123.458', isActive: true },
  { id: 'gvcn_12_4', username: 'gvcn_12_4', name: 'Lê Nguyên Trưởng', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 12/4', classId: '12/4', phone: '0905.123.459', isActive: true },
  { id: 'gvcn_12_5', username: 'gvcn_12_5', name: 'Nguyễn Thị Thùy', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 12/5', classId: '12/5', phone: '0905.123.460', isActive: true },
  { id: 'gvcn_12_6', username: 'gvcn_12_6', name: 'Trần Văn Long', role: 'manager', roleTitle: 'Giáo viên Chủ nhiệm Lớp 12/6', classId: '12/6', phone: '0905.123.461', isActive: true },

  // Bí thư Chi đoàn
  { id: 'bithu_10_1', username: 'bithu_10_1', name: 'Nguyễn Văn An', role: 'youth_secretary', roleTitle: 'Bí thư Chi đoàn 10/1', classId: '10/1', studentId: 'HS20241001', phone: '0912.111.222', isActive: true },
  { id: 'bithu_12_4', username: 'bithu_12_4', name: 'Nguyễn Thị Hoa', role: 'youth_secretary', roleTitle: 'Bí thư Chi đoàn 12/4', classId: '12/4', studentId: 'HS20221231', phone: '0966.778.899', isActive: true },

  // Đoàn viên / Học sinh
  { id: 'hs_10_1', username: 'hs_10_1', name: 'Trần Thị Bích', role: 'user', roleTitle: 'Đoàn viên - Lớp 10/1', classId: '10/1', studentId: 'HS20241002', phone: '0912.333.444', isActive: true },
  { id: 'doanvien_minh', username: 'doanvien_minh', name: 'Nguyễn Quang Minh', role: 'user', roleTitle: 'Đoàn viên - Lớp 10/1', classId: '10/1', studentId: 'HS20241001', phone: '0919.888.999', isActive: true },
  { id: 'doanvien_hoa', username: 'doanvien_hoa', name: 'Phan Như Hoa', role: 'user', roleTitle: 'Đoàn viên - Lớp 12/4', classId: '12/4', studentId: 'HS20221232', phone: '0912.111.222', isActive: true }
];

const INITIAL_CRITERIA = [
  { code: '1.1', groupId: 'I.1', groupName: 'Chuyên cần', groupStandardScore: 40, name: 'Vào lớp sinh hoạt trễ 5p đầu giờ', type: 'deduction', points: 1, unit: 'đ / HS', isEnabled: true, description: 'Học sinh đến sau hiệu lệnh chuông 5 phút' },
  { code: '1.2', groupId: 'I.1', groupName: 'Chuyên cần', groupStandardScore: 40, name: 'Vắng có phép (có xác nhận của GVCN)', type: 'deduction', points: 1, unit: 'đ / HS / buổi', isEnabled: true, description: 'Có giấy xin phép hợp lệ gửi GVCN trước giờ vào học' },
  { code: '1.3', groupId: 'I.1', groupName: 'Chuyên cần', groupStandardScore: 40, name: 'Vắng không phép', type: 'deduction', points: 2, unit: 'đ / HS / buổi', isEnabled: true, description: 'Vắng mặt không có giấy xin phép hoặc lý do không chính đáng' },
  { code: '1.4', groupId: 'I.1', groupName: 'Chuyên cần', groupStandardScore: 40, name: 'Bỏ tiết (kể cả tiết chào cờ)', type: 'deduction', points: 2, unit: 'đ / HS / tiết', isEnabled: true, description: 'Có mặt đầu giờ nhưng tự ý vắng tiết trong buổi học' },
  { code: '1.5', groupId: 'I.1', groupName: 'Chuyên cần', groupStandardScore: 40, name: 'Báo cáo gian lận / sai sĩ số', type: 'deduction', points: 5, unit: 'đ / lần', isEnabled: true, description: 'Ban cán sự hoặc cá nhân bao che, khai báo sai lệch sĩ số' },
  { code: '1.6', groupId: 'I.1', groupName: 'Chuyên cần', groupStandardScore: 40, name: 'Vắng nhiệm vụ lao động / điều động Đoàn', type: 'deduction', points: 5, unit: 'đ / HS', isEnabled: true, description: 'Không tham gia buổi lao động do Đoàn trường điều động' },
  { code: '2.1', groupId: 'I.2', groupName: 'Vệ sinh', groupStandardScore: 30, name: 'Không trực nhật', type: 'deduction', points: 5, unit: 'đ / buổi', isEnabled: true, description: 'Phòng học bẩn, không quét dọn, không lau bảng trước tiết 1' },
  { code: '2.2', groupId: 'I.2', groupName: 'Vệ sinh', groupStandardScore: 30, name: 'Trực nhật trễ, không đổ rác, vệ sinh kém', type: 'deduction', points: 2, unit: 'đ / buổi', isEnabled: true, description: 'Thùng rác đầy không đổ ra nơi quy định, ngăn bàn có rác' },
  { code: '2.4', groupId: 'I.2', groupName: 'Vệ sinh', groupStandardScore: 30, name: 'Thiếu khăn bảng, bình hoa, dung dịch sát khuẩn', type: 'deduction', points: 1, unit: 'đ / loại', isEnabled: true, description: 'Không trang bị đầy đủ vật dụng trên bàn giáo viên' },
  { code: '3.1', groupId: 'I.3', groupName: 'Nề nếp tự quản', groupStandardScore: 65, name: 'Ồn ào 5p đầu giờ, đi lại hành lang', type: 'deduction', points: 5, unit: 'đ / buổi', isEnabled: true, description: 'Không giữ trật tự giờ truy bài, chạy nhảy ngoài hành lang' },
  { code: '3.5', groupId: 'I.3', groupName: 'Nề nếp tự quản', groupStandardScore: 65, name: 'Không tắt điện, quạt sau giờ học', type: 'deduction', points: 5, unit: 'đ / buổi', isEnabled: true, description: 'Lớp ra về không ngắt thiết bị điện trong phòng' },
  { code: '3.7', groupId: 'I.3', groupName: 'Nề nếp tự quản', groupStandardScore: 65, name: 'Sử dụng điện thoại không được phép', type: 'deduction', points: 5, unit: 'đ / HS / lần', isEnabled: true, description: 'Sử dụng thiết bị điện tử khi giáo viên chưa cho phép' },
  { code: '4.1', groupId: 'I.4', groupName: 'Tác phong', groupStandardScore: 90, name: 'Không đúng đồng phục, sai giày dép, thiếu phù hiệu', type: 'deduction', points: 2, unit: 'đ / HS', isEnabled: true, description: 'Đi dép lê, không đeo thẻ học sinh, không mặc áo đồng phục Đoàn/trường' },
  { code: '4.2', groupId: 'I.4', groupName: 'Tác phong', groupStandardScore: 90, name: 'Đầu tóc không đúng quy định (uốn, nhuộm...)', type: 'deduction', points: 2, unit: 'đ / HS', isEnabled: true, description: 'Nhuộm tóc màu sặc sỡ, nam sinh để tóc quá dài' },
  { code: '5.1', groupId: 'I.1', groupName: 'Thành tích & Phong trào', groupStandardScore: 0, name: 'Đạt giải Nhất/Nhì/Ba phong trào cấp Trường/Thành phố', type: 'bonus', points: 10, unit: 'đ / giải', isEnabled: true, description: 'Thành tích xuất sắc trong các cuộc thi' },
  { code: '5.2', groupId: 'I.1', groupName: 'Thành tích & Phong trào', groupStandardScore: 0, name: 'Chi đoàn có 100% đoàn viên tham gia Ngày Chủ Nhật Xanh', type: 'bonus', points: 5, unit: 'đ / chi đoàn', isEnabled: true, description: 'Tham gia đầy đủ và tích cực phong trào tình nguyện' }
];

const INITIAL_STUDENTS = [
  // 10/1
  { studentId: 'HS20241001', name: 'Nguyễn Quang Minh', classId: '10/1', grade: 10, gender: 'Nam', dob: '2009-04-15', ethnicity: 'Kinh', phone: '0919.888.999', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '19/05/2024', points: 85, rankTitle: 'Đoàn viên Tích cực' },
  { studentId: 'HS20241002', name: 'Trần Thị Thu Thảo', classId: '10/1', grade: 10, gender: 'Nữ', dob: '2009-08-20', ethnicity: 'Kinh', phone: '0977.334.455', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '26/03/2024', points: 120, rankTitle: 'Đoàn viên Xuất sắc' },
  { studentId: 'HS20241003', name: 'Nguyễn Văn Đức', classId: '10/1', grade: 10, gender: 'Nam', dob: '2009-01-10', ethnicity: 'Cơ Tu', phone: '0988.333.444', address: 'Thôn Giàn Bí, xã Hòa Bắc, TP Đà Nẵng', isUnionMember: false, points: 45, rankTitle: 'Học sinh' },
  { studentId: 'HS20241004', name: 'Lê Hữu Đạt', classId: '10/1', grade: 10, gender: 'Nam', dob: '2009-06-12', ethnicity: 'Kinh', phone: '0988.555.666', address: 'Thôn Đông Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '19/05/2024', points: 60, rankTitle: 'Đoàn viên' },
  { studentId: 'HS20241005', name: 'Vũ Minh Tuấn', classId: '10/1', grade: 10, gender: 'Nam', dob: '2009-03-25', ethnicity: 'Kinh', phone: '0912.777.888', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '26/03/2024', points: 110, rankTitle: 'Đoàn viên Xuất sắc' },
  { studentId: 'HS20241006', name: 'Hoàng Thị Mai', classId: '10/1', grade: 10, gender: 'Nữ', dob: '2009-11-05', ethnicity: 'Cơ Tu', phone: '0933.222.111', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, unionJoinedDate: '19/05/2024', points: 95, rankTitle: 'Đoàn viên Tích cực' },
  { studentId: 'HS20241007', name: 'Đặng Quốc Huy', classId: '10/1', grade: 10, gender: 'Nam', dob: '2009-07-08', ethnicity: 'Kinh', phone: '0905.123.456', address: 'Thôn Nam Yên, xã Hòa Bắc, TP Đà Nẵng', isUnionMember: true, points: 70, rankTitle: 'Đoàn viên' },

  // 10/2
  { studentId: 'HS20241011', name: 'Lê Hoàng Nam', classId: '10/2', grade: 10, gender: 'Nam', dob: '2009-02-14', ethnicity: 'Kinh', phone: '0912.333.111', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 115, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: 'HS20241012', name: 'Hoàng Văn Khải', classId: '10/2', grade: 10, gender: 'Nam', dob: '2009-05-19', ethnicity: 'Cơ Tu', phone: '0934.555.666', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: false, points: 40, rankTitle: 'Học sinh' },
  { studentId: 'HS20241013', name: 'Trần Đình Trọng', classId: '10/2', grade: 10, gender: 'Nam', dob: '2009-09-01', ethnicity: 'Kinh', phone: '0977.888.999', address: 'Thôn An Ngãi, xã Hòa Phong, TP Đà Nẵng', isUnionMember: true, points: 65, rankTitle: 'Đoàn viên' },
  { studentId: 'HS20241014', name: 'Phạm Thị Thùy Dung', classId: '10/2', grade: 10, gender: 'Nữ', dob: '2009-12-10', ethnicity: 'Kinh', phone: '0988.222.333', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 90, rankTitle: 'Đoàn viên Tích cực' },

  // 10/3
  { studentId: 'HS20241021', name: 'Vũ Minh Tuấn', classId: '10/3', grade: 10, gender: 'Nam', dob: '2009-03-11', ethnicity: 'Kinh', phone: '0905.666.777', address: 'Thôn Bến Ngự, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 105, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: 'HS20241022', name: 'Trần Thùy Linh', classId: '10/3', grade: 10, gender: 'Nữ', dob: '2009-08-15', ethnicity: 'Kinh', phone: '0905.112.233', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 140, rankTitle: 'Cán bộ Cờ Đỏ' },
  { studentId: 'HS20241023', name: 'Đỗ Hữu Thắng', classId: '10/3', grade: 10, gender: 'Nam', dob: '2009-10-20', ethnicity: 'Cơ Tu', phone: '0935.111.444', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: false, points: 50, rankTitle: 'Học sinh' },

  // 10/4
  { studentId: 'HS20241031', name: 'Hoàng Quỳnh Như', classId: '10/4', grade: 10, gender: 'Nữ', dob: '2009-01-22', ethnicity: 'Kinh', phone: '0966.444.888', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 110, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: 'HS20241032', name: 'Nguyễn Văn Hùng', classId: '10/4', grade: 10, gender: 'Nam', dob: '2009-04-18', ethnicity: 'Kinh', phone: '0912.555.777', address: 'Thôn An Sơn, xã Hòa Ninh, TP Đà Nẵng', isUnionMember: true, points: 75, rankTitle: 'Đoàn viên' },

  // 10/5
  { studentId: 'HS20241041', name: 'Ngô Trọng Đại', classId: '10/5', grade: 10, gender: 'Nam', dob: '2009-06-30', ethnicity: 'Kinh', phone: '0977.111.222', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 100, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: 'HS20241042', name: 'Hoàng Minh Quang', classId: '10/5', grade: 10, gender: 'Nam', dob: '2009-09-12', ethnicity: 'Kinh', phone: '0966.333.111', address: 'Thôn Giàn Bí, xã Hòa Bắc, TP Đà Nẵng', isUnionMember: true, points: 130, rankTitle: 'Cán bộ Cờ Đỏ' },

  // 10/6
  { studentId: 'HS20241051', name: 'Phan Bảo Ngọc', classId: '10/6', grade: 10, gender: 'Nữ', dob: '2009-07-14', ethnicity: 'Kinh', phone: '0933.999.000', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 115, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: 'HS20241052', name: 'Lê Duy Khánh', classId: '10/6', grade: 10, gender: 'Nam', dob: '2009-11-28', ethnicity: 'Cơ Tu', phone: '0988.777.666', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: false, points: 55, rankTitle: 'Học sinh' },

  // 11/1
  { studentId: 'HS20231101', name: 'Đặng Thanh Tâm', classId: '11/1', grade: 11, gender: 'Nữ', dob: '2008-03-15', ethnicity: 'Kinh', phone: '0912.888.333', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 125, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: 'HS20231102', name: 'Bùi Đức Anh', classId: '11/1', grade: 11, gender: 'Nam', dob: '2008-08-20', ethnicity: 'Kinh', phone: '0977.222.444', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 80, rankTitle: 'Đoàn viên' },

  // 11/2
  { studentId: 'HS20231111', name: 'Nguyễn Văn Nam', classId: '11/2', grade: 11, gender: 'Nam', dob: '2008-05-18', ethnicity: 'Kinh', phone: '0988.112.233', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 150, rankTitle: 'Đội trưởng Cờ Đỏ' },
  { studentId: 'HS20231112', name: 'Trịnh Gia Hưng', classId: '11/2', grade: 11, gender: 'Nam', dob: '2008-09-14', ethnicity: 'Kinh', phone: '0977.444.555', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: true, points: 115, rankTitle: 'Bí thư Chi đoàn' },

  // 11/3
  { studentId: 'HS20231121', name: 'Nguyễn Diệu Linh', classId: '11/3', grade: 11, gender: 'Nữ', dob: '2008-02-10', ethnicity: 'Kinh', phone: '0966.555.999', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 130, rankTitle: 'Bí thư Chi đoàn' },

  // 11/4
  { studentId: 'HS20231131', name: 'Lý Quốc Bảo', classId: '11/4', grade: 11, gender: 'Nam', dob: '2008-04-18', ethnicity: 'Kinh', phone: '0988.444.555', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 120, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: 'HS20231132', name: 'Lê Hoàng Dũng', classId: '11/4', grade: 11, gender: 'Nam', dob: '2008-10-05', ethnicity: 'Kinh', phone: '0988.444.555', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 145, rankTitle: 'Cán bộ Cờ Đỏ' },

  // 11/5
  { studentId: 'HS20231141', name: 'Dương Khánh An', classId: '11/5', grade: 11, gender: 'Nữ', dob: '2008-01-28', ethnicity: 'Kinh', phone: '0912.666.999', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 110, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: 'HS20231142', name: 'Đỗ Minh Tuấn', classId: '11/5', grade: 11, gender: 'Nam', dob: '2008-07-19', ethnicity: 'Kinh', phone: '0977.333.888', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: true, points: 65, rankTitle: 'Đoàn viên' },
  { studentId: 'HS20231143', name: 'Vũ Hồng Quang', classId: '11/5', grade: 11, gender: 'Nam', dob: '2008-11-12', ethnicity: 'Cơ Tu', phone: '0935.222.333', address: 'Thôn Giàn Bí, xã Hòa Bắc, TP Đà Nẵng', isUnionMember: false, points: 40, rankTitle: 'Học sinh' },

  // 12/1
  { studentId: 'HS20221201', name: 'Mai Phương Thảo', classId: '12/1', grade: 12, gender: 'Nữ', dob: '2007-03-12', ethnicity: 'Kinh', phone: '0935.666.888', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 165, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: 'HS20221202', name: 'Phạm Đức Hải', classId: '12/1', grade: 12, gender: 'Nam', dob: '2007-08-15', ethnicity: 'Kinh', phone: '0935.666.888', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 155, rankTitle: 'Cán bộ Cờ Đỏ' },

  // 12/2
  { studentId: 'HS20221211', name: 'Lương Thế Vinh', classId: '12/2', grade: 12, gender: 'Nam', dob: '2007-04-10', ethnicity: 'Kinh', phone: '0977.888.111', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 140, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: '4963062041', name: 'Lê Thị Kim Yến', classId: '12/2', grade: 12, gender: 'Nữ', dob: '2009-03-24', ethnicity: 'Cơ-tu', phone: '0988.333.222', address: 'Thôn Aréh Đhrồng, Xã Đông Giang, Thành phố Đà Nẵng', isUnionMember: true, points: 110, rankTitle: 'Đoàn viên Tích cực' },

  // 12/3
  { studentId: 'HS20221221', name: 'Chu Đình Trọng', classId: '12/3', grade: 12, gender: 'Nam', dob: '2007-01-18', ethnicity: 'Kinh', phone: '0966.222.777', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 135, rankTitle: 'Bí thư Chi đoàn' },

  // 12/4
  { studentId: 'HS20221231', name: 'Nguyễn Thị Hoa', classId: '12/4', grade: 12, gender: 'Nữ', dob: '2007-02-14', ethnicity: 'Kinh', phone: '0966.778.899', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 215, rankTitle: 'Cán bộ Đoàn Tiêu biểu' },
  { studentId: 'HS20221232', name: 'Phan Như Hoa', classId: '12/4', grade: 12, gender: 'Nữ', dob: '2007-10-22', ethnicity: 'Cơ Tu', phone: '0912.111.222', address: 'Thôn Tà Lau, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 160, rankTitle: 'Đoàn viên Ưu tú' },

  // 12/5
  { studentId: 'HS20221241', name: 'Đào Xuân Trường', classId: '12/5', grade: 12, gender: 'Nam', dob: '2007-05-16', ethnicity: 'Kinh', phone: '0977.223.344', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 145, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: 'HS20221242', name: 'Vũ Ngọc Mai', classId: '12/5', grade: 12, gender: 'Nữ', dob: '2007-08-29', ethnicity: 'Kinh', phone: '0977.223.344', address: 'Thôn Tà Lang, xã Hòa Vang, TP Đà Nẵng', isUnionMember: true, points: 150, rankTitle: 'Cán bộ Cờ Đỏ' },

  // 12/6
  { studentId: 'HS20221251', name: 'Phùng Hải Đăng', classId: '12/6', grade: 12, gender: 'Nam', dob: '2007-07-21', ethnicity: 'Kinh', phone: '0935.123.789', address: 'Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng', isUnionMember: true, points: 130, rankTitle: 'Bí thư Chi đoàn' },
  { studentId: 'HS20221252', name: 'Lê Thu Uyên', classId: '12/6', grade: 12, gender: 'Nữ', dob: '2007-11-03', ethnicity: 'Kinh', phone: '0912.555.444', address: 'Thôn An Sơn, xã Hòa Ninh, TP Đà Nẵng', isUnionMember: true, points: 110, rankTitle: 'Đoàn viên Xuất sắc' }
];

const INITIAL_VIOLATIONS = [
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
    bonusPoints: 0,
    studentNames: ['Nguyễn Văn Đức', 'Lê Hữu Đạt'],
    note: 'Đến trường lúc 07:05 (sau hiệu lệnh trống 5 phút)',
    proofImages: ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'auditor' },
    status: 'approved',
    locked: false
  },
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
    bonusPoints: 0,
    studentNames: ['Tổ 2 trực nhật'],
    note: 'Thùng rác cuối lớp chưa đổ ra xe gom rác hành lang',
    proofImages: ['https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'auditor' },
    status: 'appealed',
    appeal: {
      reason: 'Lớp 10/1 đã trực nhật sạch sẽ lúc 6h45. Thùng rác là do lớp học buổi tối để lại.',
      proofImages: ['https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80']
    },
    locked: false
  },
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
    bonusPoints: 0,
    studentNames: ['Danh sách 10 HS tham gia đội tuyển bồi dưỡng HSG'],
    note: 'Đội tuyển HSG tập trung tại phòng Hội đồng có giấy báo',
    proofImages: [],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'auditor' },
    status: 'approved',
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
    bonusPoints: 0,
    studentNames: ['Hoàng Văn Khải', 'Trần Đình Trọng'],
    note: 'Vắng tiết 1 chào cờ không lý do',
    proofImages: ['https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'auditor' },
    status: 'approved',
    locked: false
  },
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
    bonusPoints: 0,
    studentNames: ['Đỗ Minh Tuấn', 'Vũ Hồng Quang'],
    note: 'Đi dép lê không quai hậu, không đeo thẻ học sinh',
    proofImages: ['https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'auditor' },
    status: 'pending',
    locked: false
  },
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
    bonusPoints: 0,
    studentNames: ['Tập thể 12/4'],
    note: 'Tan học tiết 5 để 4 quạt trần quay liên tục',
    proofImages: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'auditor' },
    status: 'approved',
    locked: false
  },
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
    bonusPoints: 0,
    studentNames: ['Nguyễn Văn Hùng'],
    note: 'Chơi game trong giờ truy bài 15 phút',
    proofImages: ['https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'auditor' },
    status: 'approved',
    locked: false
  },
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
    bonusPoints: 0,
    studentNames: ['Tổ 1 lớp 11/2'],
    note: 'Không lau bảng, bục giảng nhiều phấn vụn',
    proofImages: ['https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=600&auto=format&fit=crop&q=80'],
    reportedBy: { id: 'codo_nam', name: 'Nguyễn Văn Nam', role: 'auditor' },
    status: 'approved',
    locked: false
  }
];

const INITIAL_NEWS = [
  {
    id: 'ann-01',
    title: 'THÔNG BÁO KHẨN: Tăng Cường Kiểm Tra Nề Nếp & Quy Chế Trang Phục Tháng 9',
    excerpt: 'Ban Chấp hành Đoàn trường THPT Quang Trung - Đông Giang yêu cầu 100% đoàn viên, học sinh nghiêm túc chấp hành đồng phục.',
    content: 'Căn cứ theo kế hoạch năm học mới, Ban Chấp hành Đoàn trường thông báo tăng cường kiểm tra nề nếp từ 06h30 đến 07h00 hàng ngày.',
    thumbnail: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600&auto=format&fit=crop&q=80',
    author: 'Cô Zdrăm Thị Thành Thương',
    publishDate: '2026-09-01',
    isPinned: true,
    isHidden: false,
    category: 'announcement',
    urgency: 'critical',
    tags: ['#ThongBaoKhan', '#NeNep', '#QuyCheTrangPhuc'],
    views: 1420
  },
  {
    id: 'ann-02',
    title: 'CÔNG VĂN ĐIỀU ĐỘNG: Triệu Tập Cuộc Họp BCH Chi Đoàn 18 Lớp Triển Khai Kế Hoạch 26/03',
    excerpt: 'Mời toàn thể Bí thư và Lớp phó 18 chi đoàn tham gia phiên họp mở rộng chuẩn bị Hội trại truyền thống.',
    content: 'BCH Đoàn trường trân trọng triệu tập cuộc họp chuẩn bị Hội trại thanh niên vào 16h30 Thứ 5 tại Phòng Hội đồng.',
    thumbnail: 'https://images.unsplash.com/photo-1455849318743-b2233052fcff?w=600&auto=format&fit=crop&q=80',
    author: 'BCH Đoàn Trường',
    publishDate: '2026-08-30',
    isPinned: true,
    isHidden: false,
    category: 'announcement',
    urgency: 'urgent',
    tags: ['#CongVan', '#TrieuTap', '#HoiTrai2603'],
    views: 980
  },
  {
    id: 'news-01',
    title: 'Vinh Danh Top 3 Chi Đoàn Xuất Sắc Nhất Tuần 1 & Khen Thưởng Đội Cờ Đỏ',
    excerpt: 'Chúc mừng Chi đoàn 12/1 (Hạng Nhất), Chi đoàn 11/3 (Hạng Nhì) và Chi đoàn 10/1 (Hạng Ba) đã đạt số điểm thi đua xuất sắc.',
    content: 'Ban Thi đua - Khen thưởng Đoàn trường trân trọng tuyên dương các tập thể lớp đã có thành tích nề nếp vượt trội.',
    thumbnail: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&auto=format&fit=crop&q=80',
    author: 'Ban Thi Đua Đoàn Trường',
    publishDate: '2026-08-31',
    isPinned: false,
    isHidden: false,
    category: 'news',
    urgency: 'normal',
    tags: ['#TuyenDuong', '#PhongTrao', '#TopLopXuatSac'],
    views: 890
  }
];

const INITIAL_NOTICES = [
  {
    id: 'not-01',
    title: 'Điều động lao động dọn vệ sinh Sân bóng chuẩn bị Hội thao',
    content: 'Phân công Chi đoàn 10/1 và 11/5 cử mỗi lớp 10 đoàn viên mang theo dụng cụ lao động tập trung tại Sân bóng lúc 14h00 chiều Thứ 6.',
    type: 'lao_dong',
    deadline: '2026-09-12',
    targetClasses: ['10/1', '11/5'],
    status: 'pending',
    assignedBy: 'Bí thư Đoàn Trường'
  },
  {
    id: 'not-02',
    title: 'Thu nộp Sổ Đoàn Viên & Đoàn Phí Học Kỳ 1 (Năm học 2026 - 2027)',
    content: 'Đề nghị Bí thư 18 chi đoàn hoàn tất kiểm tra và nộp toàn bộ Sổ Đoàn viên mới kết nạp về Văn phòng Đoàn trước 17h00 ngày 25/09.',
    type: 'doan_phi',
    deadline: '2026-09-25',
    targetClasses: ['ALL'],
    status: 'pending',
    assignedBy: 'Ban Thường Vụ Đoàn Trường'
  }
];

const INITIAL_ACTIVITY_SLIDES = [
  {
    id: 'slide-01',
    title: 'Đại Hội Đại Biểu Đoàn TNCS Hồ Chí Minh - Nhiệm Kỳ 2026 - 2027',
    subtitle: 'Tuổi trẻ THPT Quang Trung Đông Giang: Tiên phong - Bản lĩnh - Đoàn kết - Sáng tạo',
    imageUrl: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=1200&auto=format&fit=crop&q=80',
    date: 'Tháng 9/2026',
    tag: 'Đại hội Đoàn',
    isActive: true,
    order: 1
  },
  {
    id: 'slide-02',
    title: 'Hội Trại Thanh Niên & Tuyên Dương Đoàn Viên Ưu Tú',
    subtitle: 'Sân chơi bùng nổ sức trẻ, rèn luyện kỹ năng sống và khát vọng cống hiến',
    imageUrl: 'https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=1200&auto=format&fit=crop&q=80',
    date: 'Tháng 3/2026',
    tag: 'Hội trại 26/03',
    isActive: true,
    order: 2
  },
  {
    id: 'slide-03',
    title: 'Chiến Dịch Tình Nguyện "Hoa Phượng Đỏ" & Chủ Nhật Xanh',
    subtitle: 'Chung tay xây dựng môi trường học đường Xanh - Sạch - Đẹp - An toàn',
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=1200&auto=format&fit=crop&q=80',
    date: 'Hàng tháng',
    tag: 'Tình nguyện',
    isActive: true,
    order: 3
  }
];

async function run() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  try {
    // 1. School Settings
    console.log('1. Syncing School Settings...');
    await client.query(`
      INSERT INTO public.school_settings (
        id, school_name, youth_union_name, slogan, address, email, phone,
        theme_color, logo_url, youth_union_logo_url, banner_top_image, footer_banner_image,
        created_at, updated_at
      )
      VALUES (
        'current', $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW(), NOW()
      )
      ON CONFLICT (id) DO UPDATE SET
        school_name = EXCLUDED.school_name,
        youth_union_name = EXCLUDED.youth_union_name,
        slogan = EXCLUDED.slogan,
        address = EXCLUDED.address,
        email = EXCLUDED.email,
        phone = EXCLUDED.phone,
        theme_color = EXCLUDED.theme_color,
        logo_url = EXCLUDED.logo_url,
        youth_union_logo_url = EXCLUDED.youth_union_logo_url,
        banner_top_image = EXCLUDED.banner_top_image,
        footer_banner_image = EXCLUDED.footer_banner_image,
        updated_at = NOW();
    `, [
      INITIAL_SCHOOL_SETTINGS.schoolName,
      INITIAL_SCHOOL_SETTINGS.youthUnionName,
      INITIAL_SCHOOL_SETTINGS.slogan,
      INITIAL_SCHOOL_SETTINGS.address,
      INITIAL_SCHOOL_SETTINGS.email,
      INITIAL_SCHOOL_SETTINGS.phone,
      INITIAL_SCHOOL_SETTINGS.themeColor,
      INITIAL_SCHOOL_SETTINGS.logoUrl,
      INITIAL_SCHOOL_SETTINGS.youthUnionLogoUrl,
      INITIAL_SCHOOL_SETTINGS.bannerTopImage,
      INITIAL_SCHOOL_SETTINGS.footerBannerImage
    ]);

    // 2. Academic Years
    console.log('2. Syncing Academic Years...');
    for (const ay of INITIAL_ACADEMIC_YEARS) {
      await client.query(`
        INSERT INTO public.academic_years (year_id, name, is_current, is_archived, start_date, end_date, total_weeks)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (year_id) DO UPDATE SET
          name = EXCLUDED.name,
          is_current = EXCLUDED.is_current,
          is_archived = EXCLUDED.is_archived,
          start_date = EXCLUDED.start_date,
          end_date = EXCLUDED.end_date,
          total_weeks = EXCLUDED.total_weeks;
      `, [ay.id, ay.name, ay.isCurrent, ay.isArchived, ay.startDate, ay.endDate, ay.totalWeeks]);
    }

    // 3. Classes
    console.log('3. Syncing 18 Classes...');
    for (const c of INITIAL_CLASSES) {
      await client.query(`
        INSERT INTO public.classes (
          class_id, class_name, grade, gvcn_name, gvcn_id, bithu_name, bithu_id,
          total_students, union_members_count, standard_score, is_archived, is_deleted,
          academic_year, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, false, false, '2026_2027', NOW(), NOW()
        )
        ON CONFLICT (class_id) DO UPDATE SET
          class_name = EXCLUDED.class_name,
          grade = EXCLUDED.grade,
          gvcn_name = EXCLUDED.gvcn_name,
          gvcn_id = EXCLUDED.gvcn_id,
          bithu_name = EXCLUDED.bithu_name,
          bithu_id = EXCLUDED.bithu_id,
          total_students = EXCLUDED.total_students,
          union_members_count = EXCLUDED.union_members_count,
          standard_score = EXCLUDED.standard_score,
          is_archived = false,
          is_deleted = false,
          updated_at = NOW();
      `, [
        c.id,
        c.name,
        c.grade,
        c.gvcnName,
        c.gvcnId,
        c.bithuName,
        c.bithuId,
        c.totalStudents,
        c.unionMembers,
        c.standardScore
      ]);
    }

    // 4. Users
    console.log('4. Syncing Users...');
    for (const u of INITIAL_USERS) {
      await client.query(`
        INSERT INTO public.users (
          username, full_name, name, role, role_title, avatar_url,
          email, phone_number, class_id, student_id, assigned_zone,
          custom_id, is_active, is_deleted, password_plain, created_at, updated_at
        )
        VALUES (
          $1, $2, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, false, '123456', NOW(), NOW()
        )
        ON CONFLICT (username) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          name = EXCLUDED.name,
          role = EXCLUDED.role,
          role_title = EXCLUDED.role_title,
          avatar_url = EXCLUDED.avatar_url,
          email = EXCLUDED.email,
          phone_number = EXCLUDED.phone_number,
          class_id = EXCLUDED.class_id,
          student_id = EXCLUDED.student_id,
          assigned_zone = EXCLUDED.assigned_zone,
          custom_id = EXCLUDED.custom_id,
          is_active = EXCLUDED.is_active,
          is_deleted = false,
          updated_at = NOW();
      `, [
        u.username,
        u.name,
        u.role,
        u.roleTitle || '',
        u.avatar || '',
        u.email || null,
        u.phone || null,
        u.classId || null,
        u.studentId || null,
        u.assignedZone || null,
        u.id || u.username,
        u.isActive ?? true
      ]);
    }

    // 5. Criteria
    console.log('5. Syncing Criteria...');
    for (const cr of INITIAL_CRITERIA) {
      await client.query(`
        INSERT INTO public.criteria (
          criteria_code, criterion_id, code, name, criterion_name,
          group_id, group_name, group_standard_score, type, score_value, default_points,
          unit, description, is_active, is_deleted, created_at, updated_at
        )
        VALUES (
          $1, $1, $1, $2, $3, $4, $5, $6, $7, $8, $8, $9, $10, $11, false, NOW(), NOW()
        )
        ON CONFLICT (criteria_code) DO UPDATE SET
          name = EXCLUDED.name,
          criterion_name = EXCLUDED.criterion_name,
          group_id = EXCLUDED.group_id,
          group_name = EXCLUDED.group_name,
          group_standard_score = EXCLUDED.group_standard_score,
          type = EXCLUDED.type,
          score_value = EXCLUDED.score_value,
          default_points = EXCLUDED.default_points,
          unit = EXCLUDED.unit,
          description = EXCLUDED.description,
          is_active = EXCLUDED.is_active,
          is_deleted = false,
          updated_at = NOW();
      `, [
        cr.code,
        cr.name,
        cr.name,
        cr.groupId,
        cr.groupName,
        cr.groupStandardScore || 40,
        cr.type === 'bonus' ? 'Cộng' : 'Trừ',
        cr.points,
        cr.unit,
        cr.description || '',
        cr.isEnabled ?? true
      ]);
    }

    // 6. Students
    console.log('6. Syncing Students...');
    for (const s of INITIAL_STUDENTS) {
      await client.query(`
        INSERT INTO public.students (
          student_id, full_name, name, class_id, grade, gender, dob, ethnicity,
          phone_number, phone, address, member_type, is_union_member,
          title, union_position, union_joined_place, union_fee_status,
          union_booklet_status, conduct_rating, points, activity_points, rank_title,
          violations_count, custom_notes, status, is_deleted, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
          'paid', 'submitted', 'Xuất sắc', $17, $18, $19, 0, '', 'active', false, NOW(), NOW()
        )
        ON CONFLICT (student_id) DO UPDATE SET
          full_name = EXCLUDED.full_name,
          name = EXCLUDED.name,
          class_id = EXCLUDED.class_id,
          grade = EXCLUDED.grade,
          gender = EXCLUDED.gender,
          dob = EXCLUDED.dob,
          ethnicity = EXCLUDED.ethnicity,
          phone_number = EXCLUDED.phone_number,
          phone = EXCLUDED.phone,
          address = EXCLUDED.address,
          member_type = EXCLUDED.member_type,
          is_union_member = EXCLUDED.is_union_member,
          title = EXCLUDED.title,
          union_position = EXCLUDED.union_position,
          union_joined_place = EXCLUDED.union_joined_place,
          points = EXCLUDED.points,
          activity_points = EXCLUDED.activity_points,
          rank_title = EXCLUDED.rank_title,
          status = 'active',
          is_deleted = false,
          updated_at = NOW();
      `, [
        s.studentId,
        s.name,
        s.name,
        s.classId,
        s.grade,
        s.gender,
        s.dob,
        s.ethnicity,
        s.phone,
        s.phone,
        s.address,
        s.isUnionMember ? 'Đoàn viên' : 'Học sinh',
        s.isUnionMember,
        s.rankTitle || (s.isUnionMember ? 'Đoàn viên' : 'Học sinh'),
        s.rankTitle || (s.isUnionMember ? 'Đoàn viên' : 'Học sinh'),
        'Đoàn trường THPT Quang Trung',
        s.points,
        s.points,
        s.rankTitle
      ]);
    }

    // 7. Violations
    console.log('7. Syncing Violations...');
    for (const v of INITIAL_VIOLATIONS) {
      await client.query(`
        INSERT INTO public.violations (
          violation_id, week_number, class_id, class_name, criterion_id, criterion_name,
          criterion_group, criteria_code, day, session, date_recorded, quantity,
          score_deducted, bonus_points, points_applied, student_names, proof_images,
          note, reported_by_id, reported_by_name, reported_by_role, reporter_id,
          status, appeal_reason, appeal_proofs, is_locked, is_deleted,
          created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, 'Sáng', $10, $11, $12, $13, $14,
          $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, false, NOW(), NOW()
        )
        ON CONFLICT (violation_id) DO UPDATE SET
          week_number = EXCLUDED.week_number,
          class_id = EXCLUDED.class_id,
          class_name = EXCLUDED.class_name,
          criterion_id = EXCLUDED.criterion_id,
          criterion_name = EXCLUDED.criterion_name,
          criterion_group = EXCLUDED.criterion_group,
          criteria_code = EXCLUDED.criteria_code,
          day = EXCLUDED.day,
          date_recorded = EXCLUDED.date_recorded,
          quantity = EXCLUDED.quantity,
          score_deducted = EXCLUDED.score_deducted,
          bonus_points = EXCLUDED.bonus_points,
          points_applied = EXCLUDED.points_applied,
          student_names = EXCLUDED.student_names,
          proof_images = EXCLUDED.proof_images,
          note = EXCLUDED.note,
          reported_by_id = EXCLUDED.reported_by_id,
          reported_by_name = EXCLUDED.reported_by_name,
          reported_by_role = EXCLUDED.reported_by_role,
          reporter_id = EXCLUDED.reporter_id,
          status = EXCLUDED.status,
          appeal_reason = EXCLUDED.appeal_reason,
          appeal_proofs = EXCLUDED.appeal_proofs,
          is_locked = EXCLUDED.is_locked,
          is_deleted = false,
          updated_at = NOW();
      `, [
        v.id,
        v.weekNumber,
        v.classId,
        v.className,
        v.criterionId,
        v.criterionName,
        v.groupName || 'Nề nếp',
        v.criterionId,
        v.day,
        v.date || '2026-09-07',
        v.quantity,
        v.pointsDeducted,
        v.bonusPoints || 0,
        v.pointsDeducted,
        v.studentNames || [],
        v.proofImages || [],
        v.note || '',
        v.reportedBy?.id || 'codo_nam',
        v.reportedBy?.name || 'Ban Cờ Đỏ',
        v.reportedBy?.role || 'auditor',
        v.reportedBy?.id || 'codo_nam',
        v.status || 'pending',
        v.appeal?.reason || null,
        v.appeal?.proofImages || null,
        v.locked || false
      ]);
    }

    // 8. News
    console.log('8. Syncing News...');
    for (const n of INITIAL_NEWS) {
      await client.query(`
        INSERT INTO public.news (
          news_id, title, excerpt, content, category, author_name,
          image_url, urgency, is_pinned, is_hidden, views, tags, is_deleted,
          created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, false, NOW(), NOW()
        )
        ON CONFLICT (news_id) DO UPDATE SET
          title = EXCLUDED.title,
          excerpt = EXCLUDED.excerpt,
          content = EXCLUDED.content,
          category = EXCLUDED.category,
          author_name = EXCLUDED.author_name,
          image_url = EXCLUDED.image_url,
          urgency = EXCLUDED.urgency,
          is_pinned = EXCLUDED.is_pinned,
          is_hidden = EXCLUDED.is_hidden,
          views = EXCLUDED.views,
          tags = EXCLUDED.tags,
          is_deleted = false,
          updated_at = NOW();
      `, [
        n.id,
        n.title,
        n.excerpt,
        n.content,
        n.category,
        n.author,
        n.thumbnail,
        n.urgency || 'normal',
        n.isPinned,
        n.isHidden,
        n.views || 0,
        n.tags || []
      ]);
    }

    // 9. Task Notices
    console.log('9. Syncing Task Notices...');
    for (const nt of INITIAL_NOTICES) {
      await client.query(`
        INSERT INTO public.task_notices (
          notice_id, title, content, type, deadline, target_classes,
          status, created_by_name, is_deleted, created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, false, NOW(), NOW()
        )
        ON CONFLICT (notice_id) DO UPDATE SET
          title = EXCLUDED.title,
          content = EXCLUDED.content,
          type = EXCLUDED.type,
          deadline = EXCLUDED.deadline,
          target_classes = EXCLUDED.target_classes,
          status = EXCLUDED.status,
          created_by_name = EXCLUDED.created_by_name,
          is_deleted = false,
          updated_at = NOW();
      `, [
        nt.id,
        nt.title,
        nt.content,
        nt.type,
        nt.deadline || '',
        nt.targetClasses || ['ALL'],
        nt.status || 'pending',
        nt.assignedBy || 'Bí thư Đoàn Trường'
      ]);
    }

    // 10. Activity Slides
    console.log('10. Syncing Activity Slides...');
    for (const sl of INITIAL_ACTIVITY_SLIDES) {
      await client.query(`
        INSERT INTO public.activity_slides (
          slide_id, title, subtitle, image_url, date, tag, is_active, order_num, is_deleted,
          created_at, updated_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, false, NOW(), NOW()
        )
        ON CONFLICT (slide_id) DO UPDATE SET
          title = EXCLUDED.title,
          subtitle = EXCLUDED.subtitle,
          image_url = EXCLUDED.image_url,
          date = EXCLUDED.date,
          tag = EXCLUDED.tag,
          is_active = EXCLUDED.is_active,
          order_num = EXCLUDED.order_num,
          is_deleted = false,
          updated_at = NOW();
      `, [
        sl.id,
        sl.title,
        sl.subtitle || '',
        sl.imageUrl,
        sl.date || '',
        sl.tag || 'Phong trào',
        sl.isActive,
        sl.order || 1
      ]);
    }

    console.log('\n🎉 ALL CANONICAL DATA HAS BEEN 100% SYNCED TO SUPABASE CLOUD!');
  } catch (err) {
    console.error('Error syncing data:', err);
  } finally {
    await client.end();
  }
}

run();
