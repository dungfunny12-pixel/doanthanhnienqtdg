# TỔNG KẾT PHIÊN LÀM VIỆC & ĐẶC TẢ HỆ THỐNG QUẢN LÝ NỀ NẾP & THI ĐUA ĐIỆN TỬ
**Đơn vị:** Đoàn trường THPT Quang Trung - Đông Giang  
**Thời gian cập nhật:** Tháng 09/2026  
**Địa chỉ:** Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng  
**Email:** doantruongquangtrungdonggiang@gmail.com  
**Hotline Đoàn:** 0988806194  
**Khẩu hiệu (Slogan):** *Tuổi trẻ Quang Trung – Tiên phong, Gương mẫu, Bản lĩnh, Sáng tạo*  

---

## 🌟 1. KIẾN TRÚC MENU QUẢN TRỊ ADMIN (5 HUBS TINH GỌN)

Thanh menu Admin đã được gom nhóm khoa học thành **5 Menu Hub chính**, đảm bảo hiển thị sắc nét, cân đối và không bị tràn viền:

### Hub 1: 🚩 Quản Lý Vi Phạm & Thi Đua (`violations_hub`)
* **📊 Bảng Điểm 18 Lớp**: Xếp hạng thi đua trực tiếp theo thời gian thực (Realtime), tính điểm từ chuẩn 1440đ, trừ điểm vi phạm từ Thứ 2 đến Thứ 7, cộng điểm phong trào, phân hạng Nhất/Nhì/Ba và xếp loại Tốt/Khá/TB/Yếu.
* **🚩 Danh Sách Vi Phạm**: Toàn quyền Thêm mới, Chỉnh sửa, Xóa lỗi vi phạm, lọc theo Ngày, Lớp, Tiêu chí, xem ảnh minh chứng chụp từ hiện trường.
* **⚖️ Xử Lý Khiếu Nại**: Giao diện so sánh đối chiếu song song:
  * **Cột trái:** Minh chứng vi phạm do Đội Cờ Đỏ chụp & ghi nhận.
  * **Cột phải:** Giải trình của GVCN kèm minh chứng xin miễn giảm / hủy lỗi.
  * Nút **Chấp thuận hủy lỗi** (hoàn lại điểm cho lớp) hoặc **Bác bỏ khiếu nại** (giữ nguyên điểm trừ).

### Hub 2: 🎓 Đoàn Viên, Lớp Học & Lịch Trực (`operations_hub`)
* **👨‍🎓 Học Sinh & Đoàn Viên**:
  * Quản lý hồ sơ học sinh toàn diện: Họ tên, Ngày sinh, Dân tộc, Giới tính, Lớp, Sổ Đoàn, Đoàn phí, Điểm phong trào, Xếp loại hạnh kiểm.
  * Chức năng: Thêm mới 1 HS, Chuyển lớp, Sửa thông tin, Xóa HS, Cập nhật trạng thái Đoàn viên.
  * **Import Excel**: Tải lên danh sách học sinh từ file Excel tự động map cột.
* **🏫 Danh Sách 18 Lớp Học**:
  * Quản lý 18 lớp (Khối 10: 10/1 - 10/6; Khối 11: 11/1 - 11/6; Khối 12: 12/1 - 12/6).
  * Chỉ định / Thay đổi Giáo viên Chủ nhiệm (GVCN) và Bí thư Chi đoàn.
  * Quản lý sĩ số lớp và Lưu trữ (Archive) lớp cũ khi chuyển năm học.
* **🛡️ Phân Công Trực Tuần**:
  * Ma trận phân công nhiệm vụ từ Thứ 2 đến Thứ 7 theo từng Khu vực giám sát.
  * Tự động sinh lịch trực chuẩn, sao chép lịch trực sang tuần kế tiếp.
  * Quản lý danh sách Đội Cờ Đỏ (Thêm/Sửa/Xóa thành viên, phân ca).
  * Quản lý Khu Vực Giám Sát (Khối 10, Khối 11, Khối 12, Cổng trường, Sân lễ, Căn tin).
* **📅 Cấu Hình Tuần Học**:
  * Thiết lập cấu trúc năm học: Tạo tuần mới, đặt ngày bắt đầu và kết thúc.
  * Chọn **"Tuần hiện tại"** làm gốc hiển thị mặc định trên toàn hệ thống.
  * Khóa / Mở khóa sổ thi đua tuần cũ để chốt kết quả chung cuộc.

### Hub 3: 📰 Truyền Thông, Bản Tin, Điều Động & Sự Kiện (`media_hub`)
* **📰 Bản Tin & Phong Trào Đoàn**: Đăng tải bài viết tin tức hoạt động thanh niên, tải ảnh bìa trực tiếp từ máy tính, ghim bài viết lên đầu trang, chuyển trạng thái ẩn/hiện, chỉnh sửa và xóa bài viết.
* **📢 Công Văn & Thông Báo Chỉ Đạo**: Ban hành thông báo điều hành với cấp độ khẩn (**HỎA TỐC** / **KHẨN CẤP**), đính kèm tệp văn bản công văn (.pdf, .docx, .xlsx), ghim nổi bật ra Trang chủ Cổng thông tin công cộng.
* **🛠️ Điều Động & Nhiệm Vụ Lao Động**: Quản trị viên/Admin phát lệnh điều động đoàn viên 18 chi đoàn tham gia lao động vệ sinh, họp BCH, chuẩn bị sự kiện, phân công đối tượng (tất cả hoặc chi đoàn cụ thể), đặt hạn deadline, chuyển trạng thái Đang triển khai / Đã hoàn thành.
* **🏆 Sự Kiện & Phong Trào Đoàn Trường**: Admin tạo mới, chỉnh sửa, xóa sự kiện phong trào, thiết lập điểm thưởng (+10đ, +15đ, +20đ), giới hạn suất tham gia (slots), mở/đóng đăng ký và quản lý điểm danh bằng mã QR Token.

### Hub 4: ⚙️ Quản Lý Tiêu Chí (`criteria`)
* Quản trị bộ tiêu chí chấm điểm động: Thêm mới, sửa mức điểm (+/-), đơn vị tính (đ/lần, đ/HS), gắn cờ vi phạm nghiêm trọng (hạ bậc thi đua), bật/tắt kích hoạt, ẩn/xóa tiêu chí.
* **🔍 Bộ công cụ tìm kiếm & Lọc nội dung**:
  * Ô tìm kiếm nhanh theo mã lỗi (`1.1`, `2.1`...), tên hành vi vi phạm, quy định.
  * Nút lọc theo Nhóm nội dung: Chuyên cần, Tác phong, Kỷ luật, Vệ sinh, Phong trào Đoàn.
  * Nút lọc theo Loại điểm: Điểm Trừ (Vi phạm) / Điểm Cộng (Khen thưởng).
  * Nút lọc theo Trạng thái: Vi phạm Nghiêm trọng / Đang Bật / Tạm Tắt.

### Hub 5: 🛠️ Tài Khoản, Cài Đặt & Báo Cáo (`system_hub` - Gộp chung)
* **👥 Tài Khoản & Phân Quyền**:
  * Quản lý tài khoản cho đủ 5 nhóm vai trò: **Quản trị viên (Admin)**, **Giáo viên Chủ nhiệm (GVCN)**, **Đội Cờ Đỏ (Auditor)**, **Bí thư Chi đoàn**, **Đoàn viên / Học sinh**.
  * Phân công Lớp phụ trách hoặc Khu vực trực tương ứng cho từng tài khoản.
  * Cấp lại mật khẩu mặc định (`123456@Password`) chỉ với 1 click.
  * Khóa / Mở khóa tài khoản trực tiếp ngay trên bảng.
  * Xóa tài khoản kèm hộp thoại xác nhận an toàn.
* **🎨 Tùy Biến Thông Tin Nhận Diện Trường**:
  * **6 Bảng màu sắc chủ đạo (Theme Colors)**:
    1. 🔴 *Đỏ Đoàn viên* (`red`)
    2. 🔵 *Xanh Dương Thanh Niên* (`blue`)
    3. 🟢 *Xanh Lá Cây* (`emerald`)
    4. 🟣 *Tím Hoàng Gia* (`purple`)
    5. 🟠 *Cam Nhiệt Huyết* (`amber`)
    6. ⚪ *Xám Titan* (`slate`)
  * **Hình ảnh nhận diện**: Tải Logo trường từ máy tính, Tải Banner đầu trang (Top Banner), Tải Banner chân trang (Footer Banner).
  * **Thông tin liên hệ**: Cập nhật Địa chỉ (*Thôn Trung Sơn, xã Đông Giang, TP Đà Nẵng*), Email (*doantruongquangtrungdonggiang@gmail.com*), Hotline (*0988806194*), Slogan.
* **📊 Chốt Sổ, Báo Cáo & Thống Kê Thi Đua**:
  * **Tự động hiển thị các tuần đã tạo**: Lưới các tuần thi đua với trạng thái khóa/mở, điểm trung bình toàn trường và Top 3 lớp.
  * **Bảng điểm thi đua tổng hợp lũy kế tính đến hiện tại**: Ma trận tổng hợp điểm 18 lớp qua tất cả các tuần, tính điểm TB, tổng lỗi và trao danh hiệu (Cờ Luân Lưu, Xuất Sắc, Tiên Tiến).
  * **Bộ 3 biểu đồ thống kê trực quan**: Biểu đồ cột so sánh 18 lớp (phân màu theo khối), Biểu đồ cơ cấu phân bố vi phạm 5 nhóm tiêu chí, Biểu đồ biến động điểm Top 5 lớp dẫn đầu.
  * **Thống kê chi tiết theo tuần**: Phân tích chuyên sâu Top 3 lớp dẫn đầu & Top 3 lớp có điểm trừ cao cần chấn chỉnh.
  * **Xuất Thống Kê Thi Đua Lũy Kế (.xlsx)**: Xuất file Excel đa trang gồm: Tổng hợp lũy kế 18 lớp, Danh sách kết quả các tuần, Danh sách chi tiết vi phạm toàn trường.
  * **Khóa sổ tuần**: Chốt kết quả thi đua bằng mã PIN bí mật.
* **📜 Nhật Ký Hệ Thống**: Access & Audit logs chi tiết thời gian thực (ghi nhận người thực hiện, thời gian, IP và hành vi).

---

## 🔑 2. DANH SÁCH TÀI KHOẢN MẪU DÙNG ĐĂNG NHẬP THỬ NGHIỆM

| Nhóm Phân Quyền | Tài Khoản (Username) | Mật Khẩu Mặc Định | Họ Tên Đại Diện | Quyền Hạn Chính |
| :--- | :--- | :--- | :--- | :--- |
| **Quản trị viên (Admin)** | `admin` | `123456@Password` | Thầy Lê Hoàng Long | Toàn quyền điều hành toàn hệ thống |
| **Giáo viên Chủ nhiệm** | `gvcn_10_1` | `123456@Password` | Cô Nguyễn Thị Lan | Quản lý lớp 10/1, gửi giải trình khiếu nại |
| **Đội Cờ Đỏ** | `codo_nam` | `123456@Password` | Nguyễn Văn Nam (11/2) | Trực ban, quét lỗi, chụp ảnh minh chứng |
| **Bí thư Chi đoàn** | `bithu_10_1` | `123456@Password` | Lê Tuấn Kiệt (10/1) | Quản lý sổ đoàn, đoàn phí chi đoàn 10/1 |
| **Đoàn viên / Học sinh** | `hs_minh` | `123456@Password` | Nguyễn Quang Minh | Xem điểm nề nếp, thẻ học sinh QR cá nhân |

---

---

## 🚩 3. PHÂN HỆ APP ĐỘI CỜ ĐỎ (AUDITOR APP - CHẤM ĐIỂM 1-CHẠM)

* **☀️ / ⛅ Lựa chọn Ca trực & Buổi chấm**:
  * Chuyển đổi nhanh 1-click giữa **`☀️ Buổi Sáng`** và **`⛅ Buổi Chiều`** ngay tại dòng chọn Ngày chấm.
* **⚡ Tối ưu hóa giao diện chọn tiêu chí vi phạm**:
  * Bộ lọc phân nhóm tiêu chí hiện đại kèm huy hiệu đếm số lượng lỗi (`I.1 Chuyên cần`, `I.2 Vệ sinh`, `I.3 Nề nếp`, `I.4 Tác phong`, `Khen thưởng 🏆`).
  * 6 phím tắt gợi ý nhanh cho các vi phạm phổ biến nhất (`Đi muộn 5p`, `Sai đồng phục`, `Không trực nhật`, `Dùng ĐT`, `Vắng không phép`, `Đầu tóc`).
  * Thanh tìm kiếm lỗi thông minh hỗ trợ tìm theo tên hoặc mã lỗi (`1.1`, `4.1`...).
  * Lưới thẻ 2 cột 1-chạm có viền sáng và dấu check `✓` khi đang chọn.
* **👨‍🎓 Tự động tích hợp danh sách học sinh theo từng lớp**:
  * Tự động hiển thị danh sách học sinh của lớp đang được chọn (`10/1`, `10/2`, ..., `12/6`).
  * Tìm kiếm học sinh nhanh theo Họ tên hoặc Mã học sinh (`HS20241001`).
  * Chọn nhanh học sinh vi phạm bằng cách nhấp chọn, hiển thị các thẻ tên (chips) kèm nút `✕` xóa.
  * Tự động nhảy số lượng vi phạm tương ứng với số học sinh được chọn để tính điểm chính xác.
  * Tùy chọn "Lỗi tập thể lớp (Không quy gán đích danh cá nhân)" và ô nhập thêm học sinh ngoài danh sách.

---

---

## 🎖️ 4. KHÔNG GIAN BÍ THƯ CHI ĐOÀN & THEO DÕI ĐOÀN PHÍ THEO THÁNG

---

## 6. Tối Ưu Hóa Bảng Theo Dõi Thu Đoàn Phí 9 Tháng & Bổ Sung Nút Lưu (Save)

Theo đúng yêu cầu từ ảnh phản hồi của Thầy/Cô:
- **Loại bỏ giao diện chọn tháng rời rạc**: Tối ưu hóa trực tiếp thành **Bảng Ma Trận 9 Tháng Toàn Năm (`T9` -> `T5`)** hiển thị đầy đủ, trực quan và tiện dụng nhất.
- **Bổ Sung Nút "💾 Lưu Thay Đổi" (Save Button)**:
  - Nút lưu nổi bật với hiệu ứng phát sáng khi có chỉnh sửa dữ liệu thu nộp.
  - Khi bấm **`💾 Lưu Thay Đổi`**: Hiển thị thông báo xác nhận thành công `✓ Đã lưu bảng theo dõi đoàn phí thành công!` và lưu giữ liệu bền vững vào hệ thống.
- **Thao Tác 1-Chạm Siêu Nhanh Trên Bảng**:
  - Nhấp trực tiếp vào bất kỳ ô tháng nào (`T9` -> `T5`) để đổi trạng thái `✓ Đã nộp` (xanh) hoặc `✕ Chưa nộp` (đỏ).
  - Nút **`✓ Thu Đủ Cả Năm`**: Đánh dấu hoàn thành toàn bộ 9 tháng cho tất cả đoàn viên trong chi đoàn chỉ với 1 click.
  - Nút **`🚀 Cả năm`** và **`🔄 Đặt lại`** trên từng dòng học sinh.
  - Phân loại rõ ràng học sinh chưa kết nạp Đoàn (`— Chưa vào Đoàn`).
- **Nút "🔒 Khóa Sổ Thu"**: Khóa/mở khóa sổ thu đoàn phí cả năm để bảo vệ số liệu sau khi hoàn tất nộp cho Đoàn trường.

---

## 🏫 5. BẢNG ĐIỀU KHIỂN GIÁO VIÊN CHỦ NHIỆM (GVCN DASHBOARD)

* **🕸️ Biểu Đồ Màng Nhện 6 Trục (Radar Chart) Thể Hiện Rõ Ràng**:
  * Các trục hiển thị đầy đủ và rõ nét: **`I.1 Chuyên cần`**, **`I.2 Vệ sinh`**, **`I.3 Nề nếp tự quản`**, **`I.4 Tác phong`**, **`Phong trào Đoàn`**, **`Sự kiện phong trào`** kèm phần trăm đạt chuẩn (100%, 90%...).
  * Màu sắc phân định chuyên nghiệp, trực quan giúp GVCN nắm bắt ngay điểm yếu cần nhắc nhở trong tiết sinh hoạt lớp đầu tuần.
* **🏆 Vị Thứ Thi Đua & Điểm Thi Đua Tuần**:
  * Hiển thị rõ **`Vị thứ: #1 / 18`** thay vì nhãn chung chung, đồng bộ chính xác với điểm chuẩn (1440đ) và điểm trừ nề nếp thực tế.
  * Khắc phục triệt để tình trạng lệch điểm trừ ảo khi lớp không có vi phạm.
* **💵 Thống Kê & Thu Đoàn Phí 4 Tháng (`Tháng 9` - `Tháng 12`)**:
  * Tinh giản bảng: Loại bỏ cột *Điểm phong trào* và *Xếp loại đoàn*, thay bằng **Đoàn Phí theo từng tháng**.
  * Chuyển đổi nhanh 4 tháng với tỷ lệ nộp đoàn phí tức thì (`Đã nộp: X / Y Đoàn viên (Z%)`).
  * Nút **`✓ Đã Nộp Tất Cả`** và nút thao tác 1-chạm **`Đánh dấu: Đã nộp`** / **`Đổi: Chưa nộp`** tiện dụng cho GVCN.

---

## 📸 6. MODULE SLIDE ẢNH HOẠT ĐỘNG & THỜI TIẾT ĐÔNG GIANG

1. **Slide Ảnh Hoạt Động Phong Trào (Public Portal)**:
   - Đặt tại **Cột 1 (dưới Bảng điểm 18 lớp)** theo đúng yêu cầu khoanh vùng.
   - Tự động phát chuyển slide mỗi 4.5 giây, tạm dừng khi rê chuột.
   - Hiển thị badge chủ đề (`Kết nạp Đoàn`, `Hội thao`, `Tình nguyện`...), ngày tháng, tiêu đề và chú thích.
   - Nhấp vào ảnh để mở popup xem ảnh kích thước lớn full-size sắc nét.
2. **Quản trị Slide trong Admin Hub 5**:
   - Thêm mới, chỉnh sửa, xóa, bật/tắt hiển thị và sắp xếp thứ tự hiển thị của từng slide.
   - Hỗ trợ tải ảnh trực tiếp từ máy tính hoặc dán link URL.

---

## 💻 6. HƯỚNG DẪN THAO TÁC LƯU LÊN NOTEBOOKLM

Để đưa toàn bộ tài liệu dự án này vào Google NotebookLM của Thầy/Cô:
1. Mở trình duyệt web và truy cập: [https://notebooklm.google.com](https://notebooklm.google.com)
2. Chọn hoặc tạo mới Sổ ghi chú: **"Hệ thống Quản lý Nề nếp & Thi đua - THPT Quang Trung Đông Giang"**.
3. Bấm **"Thêm nguồn" (Add source)** ➡️ Chọn tải lên tệp tin `NOTEBOOKLM_SESSION_SUMMARY.md` hoặc dán trực tiếp nội dung văn bản này vào một ghi chú mới (New Note).
4. Giờ đây Thầy/Cô có thể đặt câu hỏi hoặc yêu cầu NotebookLM tóm tắt, xuất báo cáo hay phân tích bất kỳ khía cạnh nào của hệ thống!
