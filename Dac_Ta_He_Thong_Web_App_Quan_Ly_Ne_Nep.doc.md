# **ĐẶC TẢ HỆ THỐNG WEB APP QUẢN LÝ NỀ NẾP – THI ĐUA – HOẠT ĐỘNG ĐOÀN THANH NIÊN THPT**

## **I. TỔNG QUAN HỆ THỐNG**

> * **Tên hệ thống:** Web App Quản lý Nề nếp – Thi đua – Hoạt động Đoàn Thanh niên THPT.  
> * **Mục tiêu:** Số hóa toàn diện quy trình đánh giá nề nếp, tính điểm thi đua và quản lý phong trào Đoàn; thay thế hoàn toàn sổ sách giấy; đảm bảo tính minh bạch, tức thời và giảm tải áp lực hành chính cho Ban Chấp hành Đoàn trường và Giáo viên Chủ nhiệm.  
> * **Nền tảng:** Ứng dụng Web (Web App) áp dụng kiến trúc Mobile-First / PWA (Progressive Web App), tối ưu hiển thị và thao tác trên cả Smartphone, Tablet và PC.

## **II. PHÂN QUYỀN VÀ NHÓM NGƯỜI DÙNG (ROLES)**

| Nhóm người dùng | Vai trò & Chức năng chính   |
| :---- | :---- |
| **Admin (Quản trị)** | Bí thư Đoàn trường, Ban Giám hiệu, Trợ lý Thanh niên. Toàn quyền thiết lập hệ thống, bộ tiêu chí, duyệt bảng điểm, quản lý tài khoản và xuất báo cáo tổng. |
| **Quản lý (Manager)** | Giáo viên chủ nhiệm (GVCN), Giám thị. Xem chi tiết điểm thi đua lớp mình, xử lý khiếu nại, theo dõi hoạt động của học sinh/đoàn viên trong lớp. |
| **Giám sát (Auditor)** | Đội Cờ đỏ, Ban cán sự lớp, Bí thư chi đoàn. Nhập điểm, ghi nhận vi phạm nề nếp hàng ngày, tải lên minh chứng, điểm danh sự kiện. |
| **Người dùng (User)** | Học sinh, Phụ huynh. Theo dõi điểm số cá nhân/tập thể, xem thông báo, bảng xếp hạng, đăng ký tham gia các hoạt động Đoàn. |

## **III. YÊU CẦU CHỨC NĂNG CHI TIẾT (FUNCTIONAL REQUIREMENTS)**

### **1\. Module Quản trị Hệ thống & Tùy chỉnh (Cốt lõi tạo sự linh hoạt)**

> * **Thiết lập Cấu trúc Thời gian:** Quản lý linh hoạt theo Năm học, Học kỳ, Tuần học (hỗ trợ điều chỉnh tuần học do nghỉ lễ, thiên tai).  
> * **Quản lý Khối/Lớp & Nhân sự:** Nhập (Import) danh sách học sinh, giáo viên, phân công GVCN, phân công Cờ đỏ trực chéo theo tuần/tháng.  
> * **Xây dựng Bộ Tiêu chí Động (Dynamic Criteria):**  
  * Cho phép Admin tự tạo/chỉnh sửa các hạng mục chấm điểm (Vd: Đi học muộn, Đồng phục, Vệ sinh, Truy bài).  
  * Tự định nghĩa loại điểm: Điểm trừ (vi phạm), Điểm cộng (thành tích), Hệ số nhân (các dịp đặc biệt như 20/11, 26/3).  
  * Thiết lập công thức tính điểm chuẩn (Vd: Điểm thi đua tuần \= Điểm nền (100) \+ Tổng điểm cộng \- Tổng điểm trừ).

### **2\. Module Quản lý Nề nếp (Thiết kế tối ưu cho Mobile)**

> * **Ghi nhận vi phạm (Dành cho Cờ đỏ/Giám thị):**  
  * Giao diện nhập liệu một chạm trên điện thoại: Chọn Lớp \-\> Chọn Lỗi vi phạm \-\> Chọn Học sinh vi phạm (tùy chọn) \-\> Thêm Ghi chú/Minh chứng.  
  * **Tải lên minh chứng:** Hỗ trợ chụp ảnh trực tiếp từ camera điện thoại (Vd: chụp ảnh rác trong ngăn bàn, học sinh không mặc đồng phục) để tăng tính minh bạch.  
  * Lưu nháp offline và đồng bộ khi có mạng (phòng trường hợp sân trường/hành lang sóng yếu).  
> * **Xác nhận & Khiếu nại (Dành cho GVCN):**  
  * Hệ thống gửi thông báo (Notification) ngay khi lớp có vi phạm mới.  
  * GVCN có quyền ấn nút "Yêu cầu phúc khảo" kèm lý do giải trình trong thời gian quy định (Vd: 24h sau khi ghi nhận).  
  * Bí thư Đoàn duyệt và chốt lỗi cuối cùng.

### **3\. Module Quản lý Thi đua & Xếp hạng**

> * **Tự động hóa Bảng điểm:**  
  * Hệ thống tự động cộng/trừ điểm theo thời gian thực (Real-time) và kết xuất thành Bảng điểm Tuần, Tháng, Học kỳ, Năm học.  
  * Tích hợp điểm phong trào, điểm học tập (nếu có liên kết với sổ điểm điện tử) vào tổng điểm thi đua chung.  
> * **Bảng xếp hạng (Leaderboard):**  
  * Hiển thị trực quan xếp hạng các lớp toàn trường hoặc theo từng khối.  
  * Biểu đồ xu hướng (Trendline) hiển thị sự thăng tiến/tụt hạng của lớp qua các tuần.  
> * **Xếp loại thi đua:** Tự động quy đổi điểm ra xếp loại (Xuất sắc, Tốt, Khá, Trung bình) dựa trên thang chuẩn do Admin thiết lập.

### **4\. Module Quản lý Hoạt động Đoàn Thanh niên**

> * **Quản lý Sự kiện & Phong trào:**  
  * Tạo sự kiện (Mùa hè xanh, Lễ 20/11, Giải bóng đá, Hội thao).  
  * Mở cổng đăng ký tham gia trực tuyến cho các Chi đoàn/Cá nhân.  
> * **Điểm danh thông minh (QR Code Check-in):**  
  * Mỗi học sinh/đoàn viên có một mã QR định danh trên hệ thống.  
  * Sử dụng điện thoại để quét mã QR điểm danh tham gia hoạt động, đảm bảo nhanh chóng cho các sự kiện đông người.  
> * **Hồ sơ Đoàn viên:**  
  * Quản lý danh sách Đoàn viên, quá trình kết nạp, đóng đoàn phí.  
  * Hệ thống đánh giá, phân loại Đoàn viên cuối năm (Tích hợp dựa trên số lần tham gia hoạt động và điểm nề nếp cá nhân).

### **5\. Module Cổng thông tin & Báo cáo**

> * **Bảng tin (Newsfeed):** Đăng tải thông báo, vinh danh tập thể/cá nhân xuất sắc, kế hoạch công tác Đoàn.  
> * **Dashboard Thống kê trực quan:**  
  * Biểu đồ thống kê các lỗi vi phạm phổ biến nhất (giúp nhà trường nắm bắt tình hình để chấn chỉnh).  
  * Báo cáo xuất file đa định dạng (Excel, PDF) chuẩn form báo cáo để trình Ban Giám hiệu, Hội đồng Sư phạm.

## **IV. YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL)**

> * **Responsive UI/UX (Giao diện đáp ứng):**  
  * Giao diện Mobile (dành cho Cờ đỏ, Học sinh) cần thiết kế theo dạng App (Nút bấm to, thao tác vuốt, menu dưới đáy màn hình \- Bottom Navigation).  
  * Giao diện Desktop (dành cho Admin, GVCN) dùng thiết kế dạng Dashboard (Nhiều biểu đồ, bảng biểu dữ liệu rộng, công cụ lọc đa lớp).  
> * **Hiệu suất (Performance):** Tải trang dưới 2 giây. Hỗ trợ hàng ngàn truy cập đồng thời vào các giờ cao điểm (ví dụ: sáng thứ 2 chốt điểm, xem xếp hạng).  
> * **Bảo mật & Toàn vẹn dữ liệu:**  
  * Mã hóa mật khẩu, phân quyền chặt chẽ (Role-based access control).  
  * Khóa dữ liệu (Lock data) sau khi chốt điểm tuần để chống chỉnh sửa trái phép.  
  * Ghi log hệ thống (Lưu lại lịch sử: Ai đã sửa điểm, sửa khi nào).  
> * **Khả năng nâng cấp (Scalability):** Thiết kế API mở để tương lai có thể tích hợp với các hệ thống Quản lý trường học khác (VnEdu, SMAS) qua API.

## **V. KIẾN TRÚC & ĐỀ XUẤT CÔNG NGHỆ**

Để hệ thống vừa nhẹ, linh hoạt và hoạt động hoàn hảo như một ứng dụng di động mà không cần tải qua App Store/Google Play, kiến trúc công nghệ đề xuất bao gồm:

> * **Frontend (Giao diện):**  
  * **Framework:** ReactJS, VueJS hoặc NextJS.  
  * **UI/UX:** Tailwind CSS (tối ưu Responsive), kết hợp với PWA (Progressive Web App) để người dùng có thể "Cài đặt ra màn hình chính" (Add to Homescreen) và nhận thông báo Push Notification.  
> * **Backend (Xử lý logic):**  
  * Node.js (Express/NestJS) hoặc Laravel (PHP). Node.js tối ưu tốt cho các tương tác thời gian thực (real-time).  
> * **Cơ sở dữ liệu (Database):**  
  * PostgreSQL hoặc MySQL. Kiến trúc quan hệ (RDBMS) rất phù hợp để ràng buộc dữ liệu chặt chẽ giữa Khối \-\> Lớp \-\> Học sinh \-\> Tiêu chí \-\> Điểm số.  
> * **Hạ tầng (Hosting/Cloud):**  
  * Triển khai trên VPS (Google Cloud, AWS, hoặc nhà cung cấp trong nước như Vietgeeks, CMC) để đảm bảo tốc độ băng thông tại Việt Nam.  
  * Lưu trữ hình ảnh minh chứng sử dụng AWS S3 hoặc Cloudinary để giảm tải cho server chính.

## **VI. ĐẶC TẢ CHỨC NĂNG CHI TIẾT (FUNCTIONAL SPECIFICATIONS)**

Bảng dưới đây mô tả cụ thể luồng dữ liệu (Input \- Process \- Output) của các tính năng cốt lõi trong hệ thống.

### **1\. Module Quản lý Nề nếp**

| Tên chức năng | Đầu vào (Input) | Xử lý logic (Process) | Đầu ra (Output)   |
| :---- | :---- | :---- | :---- |
| **Ghi nhận vi phạm** | Chọn Lớp \-\> Học sinh (tùy chọn) \-\> Tiêu chí lỗi \-\> Chụp/Tải ảnh minh chứng \-\> Ghi chú. | Hệ thống kiểm tra quyền người nhập (Cờ đỏ có đang trong ca trực không). Lưu bản ghi với trạng thái "Chờ duyệt". | Hiển thị thông báo thành công. Gửi thông báo (Push/Zalo) đến GVCN lớp đó. |
| **Duyệt / Khiếu nại lỗi** | ID bản ghi vi phạm. Nút "Chấp nhận" hoặc "Khiếu nại" (kèm text lý do). | Nếu chấp nhận: Trạng thái \-\> "Đã duyệt", cập nhật trừ điểm lớp. Nếu khiếu nại: Trạng thái \-\> "Chờ Admin xử lý", tạm thời giữ nguyên điểm. | Cập nhật lại danh sách vi phạm của lớp. Thông báo kết quả cho Cờ đỏ nhập lỗi. |
| **Xử lý khiếu nại** | ID bản ghi. Quyết định của Admin (Hủy lỗi / Giữ lỗi). | Admin xem xét lý do của GVCN và minh chứng của Cờ đỏ. Cập nhật trạng thái cuối cùng ("Đã duyệt" hoặc "Đã hủy"). | Điểm được tính lại (nếu hủy). Gửi thông báo chốt đến GVCN. |

### **2\. Module Quản lý Thi đua**

| Tên chức năng | Đầu vào (Input) | Xử lý logic (Process) | Đầu ra (Output)   |
| :---- | :---- | :---- | :---- |
| **Tính điểm tuần** | Thời gian (Vd: Tuần 1, từ 04/09 đến 10/09). Nút "Chốt điểm". | Điểm Tuần \= Điểm Nền (100) \+ Tổng điểm cộng \- Tổng điểm trừ. Khóa (Lock) mọi bản ghi vi phạm trong tuần đó, không cho phép sửa đổi. | Bảng điểm tổng kết tuần của toàn trường (dạng Data Table). |
| **Bảng xếp hạng (Leaderboard)** | Lọc theo Khối / Toàn trường. Lọc theo Tuần / Tháng. | Truy vấn DB lấy tổng điểm, sắp xếp giảm dần (DESC). Gắn cờ xếp loại (Nhất, Nhì, Ba). | Giao diện xếp hạng trực quan. |

### **3\. Module Hoạt động Đoàn & Điểm danh**

| Tên chức năng | Đầu vào (Input) | Xử lý logic (Process) | Đầu ra (Output)   |
| :---- | :---- | :---- | :---- |
| **Khởi tạo Sự kiện** | Tên sự kiện, Thời gian bắt đầu/kết thúc, Điểm cộng, Giới hạn số lượng (nếu có). | Lưu thông tin sự kiện, sinh ra một ID Sự kiện duy nhất để phục vụ check-in. | Sự kiện xuất hiện trên Bảng tin (Newsfeed). |
| **Quét QR Điểm danh** | ID Sự kiện. Chuỗi hash mã QR từ điện thoại quét được. | Giải mã hash \-\> Lấy ID Học sinh. Kiểm tra xem học sinh đã check-in chưa. Cộng điểm sự kiện vào hồ sơ học sinh. | Màn hình hiển thị "Thành công" màu xanh (hiện tên, lớp) hoặc "Thất bại" màu đỏ. |

## **VII. ĐẶC TẢ GIAO DIỆN: CỔNG THÔNG TIN CÔNG CỘNG & ĐĂNG NHẬP (PUBLIC PORTAL)**

Việc biến Màn hình đăng nhập thành một Cổng thông tin công cộng (Public Portal) là một bước đi cực kỳ tối ưu. Thiết kế này giúp minh bạch hóa điểm số, kích thích sự cạnh tranh tích cực giữa các lớp và cho phép Phụ huynh/Học sinh theo dõi tin tức mà không cần tạo hay nhớ tài khoản.  
**Nguyên tắc hiển thị:** Toàn bộ dữ liệu hiển thị trên màn hình này là Read-Only (Chỉ đọc). Dữ liệu công khai chỉ bao gồm điểm tập thể (Lớp) và tin tức chung. Tuyệt đối không hiển thị lỗi vi phạm của cá nhân học sinh (để bảo vệ quyền riêng tư).

### **1\. Bố cục tổng thể (Layout)**

> * **Trên Desktop/Tablet (Màn hình ngang): Layout chia 3 cột**  
  * Cột Trái (25%): Bảng Xếp hạng Thi đua Tuần (Leaderboard).  
  * Cột Giữa (50%): Bản tin & Thông báo Đoàn trường (Newsfeed).  
  * Cột Phải (25%): Form Đăng nhập hệ thống (Sticky \- luôn ghim cố định khi cuộn trang).  
> * **Trên Mobile (Màn hình dọc): Layout xếp chồng (Stacked)**  
  * Khung trên cùng: Nút "Đăng nhập" nằm ở góc phải Header (Bấm vào sẽ trượt ra một ngăn kéo chứa Form đăng nhập).  
  * Khung giữa 1: Khối Bảng xếp hạng Tuần (Vuốt ngang \- Carousel để xem Top 10).  
  * Khung giữa 2: Khối Bản tin & Thông báo (Cuộn dọc vô hạn).

### **2\. Chi tiết các thành phần UI (UI Components)**

#### **A. Khối Header (Thanh điều hướng trên cùng)**

> * **Logo & Tiêu đề:** Logo trường/Đoàn thanh niên. Tiêu đề: "Cổng Thông tin Nề nếp & Phong trào Đoàn".  
> * **Đồng hồ đếm ngược (Tùy chọn):** Đếm ngược đến sự kiện lớn tiếp theo (Vd: "Còn 12 ngày đến Hội trại 26/03").

#### **B. Khối Bảng Xếp Hạng Thi Đua (Public Leaderboard)**

> * **Bộ lọc (Read-only Filter):** Dropdown cho phép người xem tự chọn "Tuần hiển thị" (Mặc định luôn là Tuần hiện tại) và chọn "Cấp độ" (Toàn trường / Khối 10 / Khối 11 / Khối 12).  
> * **Giao diện Top 3 (Podium):** 3 Lớp đứng đầu được thiết kế nổi bật dạng bục vinh quang. Lớp Hạng 1 có icon Vương miện/Cúp vàng, Hạng 2 Cúp bạc, Hạng 3 Cúp đồng.  
> * **Danh sách các lớp còn lại:** Hiển thị dạng danh sách trượt. Mỗi dòng gồm:  
  * Thứ hạng (Vd: \#4, \#5).  
  * Tên Lớp (Vd: 11A1).  
  * Tổng điểm chuẩn (Vd: 98.5).  
  * Trendline (Xu hướng): Icon mũi tên xanh lá hướng lên (Tăng hạng so với tuần trước), mũi tên đỏ hướng xuống (Tụt hạng), hoặc dấu gạch ngang màu xám (Giữ nguyên).  
> * **Giới hạn dữ liệu:** Người xem bấm vào tên Lớp chỉ xem được cơ cấu điểm (Vd: Điểm nền 100, Cộng 5, Trừ 6.5), không xem được chi tiết ai vi phạm lỗi gì (yêu cầu GVCN đăng nhập mới xem được).

#### **C. Khối Bản Tin & Thông Báo (Public Newsfeed & Announcements)**

> * **Ghim Thông báo Khẩn (Pinned Alerts):** Khung màu đỏ/cam nằm trên cùng để thông báo quan trọng. (Vd: THÔNG BÁO: Hủy sự kiện lao động chiều thứ 6 do áp thấp nhiệt đới).  
> * **Bản tin Phong trào (News Cards):** Hiển thị các bài đăng của Ban chấp hành Đoàn. Mỗi thẻ tin (Card) bao gồm:  
  * Ảnh Thumbnail (Ảnh chụp hoạt động, lễ chào cờ).  
  * Tiêu đề in đậm (Vd: Kết quả kiểm tra nề nếp đột xuất sáng Thứ 2).  
  * Ngày đăng & Thẻ phân loại (Tag: \#PhongTrao, \#NeNep, \#TuyenDuong).  
  * Đoạn trích dẫn ngắn (2-3 dòng).  
  * Nút "Xem chi tiết" (Click vào mở pop-up đọc toàn văn văn bản/thông báo).

#### **D. Khối Đăng Nhập (Login Section)**

> * **Thiết kế:** Thay vì chiếm toàn bộ màn hình như trước, form đăng nhập giờ là một khối hộp (Box/Card) gọn gàng nằm ở cột phải (Desktop) hoặc ẩn trong nút Đăng nhập trên thanh Header (Mobile).  
> * **Trường dữ liệu:** Mã định danh (Tài khoản) và Mật khẩu.  
> * **Nút Action:** Đăng nhập. Ngay khi bấm, hệ thống sẽ xác thực và tự động đưa người dùng vào giao diện làm việc (Dashboard) tùy theo Role (Cờ đỏ đi thẳng vào màn hình chấm lỗi, Admin vào bảng điều khiển).  
> * **Phân luồng:** Khách qua đường (Học sinh, Phụ huynh) không cần tài khoản, cứ ở ngoài trang chủ này xem tin tức và thứ hạng tuần. Ai có nhiệm vụ (Cờ đỏ, Giáo viên) mới cần điền form này.

### **3\. Tích hợp Lịch Trực Cờ Đỏ vào Cổng Thông Tin**

Việc đưa Lịch trực Cờ Đỏ ra ngoài Cổng thông tin công cộng là một ý tưởng xuất sắc để tăng tính minh bạch. Nó giúp học sinh biết ai đang giám sát khu vực của mình, và chính các em Cờ đỏ cũng dễ dàng xem lịch mà không cần phải đăng nhập.

#### **A. Bố cục tổng thể (Điều chỉnh Layout)**

> * **Trên Desktop/Tablet:** Thêm một khối (Widget) nằm ở Cột Phải, ngay bên dưới Khối Đăng nhập. (Hoặc thiết kế dạng thanh chạy ngang \- Ticker Marquee ngay dưới thanh Header, giống như thanh tin vắn của các kênh tin tức).  
> * **Trên Mobile:** Thêm một Khối vuốt ngang (Swipeable Card) nằm ngay giữa Khối Bảng xếp hạng và Khối Bản tin.

#### **B. Chi tiết Thành phần UI (UI Components) cho Lịch trực**

Khối này sẽ được thiết kế với tiêu chí: Trực quan, Nhanh gọn và Bảo mật thông tin (Chỉ hiện thông tin cần thiết, không lộ số điện thoại hay thông tin cá nhân của Cờ đỏ).

> * **Tiêu đề & Công cụ chuyển đổi**  
  * Tiêu đề (Header): 🛡️ Đội Cờ Đỏ Trực Ban Hôm Nay (Nhấn mạnh vào Hôm nay để thông tin có tính thời sự nhất).  
  * Nút Chuyển đổi (Toggle/Tabs): Hai tab nhỏ trên góc: \[Hôm nay\] và \[Cả tuần\]. Mặc định hệ thống luôn hiển thị tab \[Hôm nay\].  
> * **Giao diện hiển thị "Hôm nay" (Today's Duty)**  
>   Hiển thị dạng các thẻ nhỏ (Mini-cards) chia theo từng khu vực, thiết kế bắt mắt:  
  * Khu vực (Zone): Tiêu đề in đậm, có màu nền riêng (Vd: Khối 10 \- Nền Xanh, Khối 11 \- Nền Cam, Cổng trường \- Nền Đỏ).  
  * Danh sách Cờ đỏ: Dưới mỗi khu vực là danh sách nhân sự phụ trách.  
    * Định dạng: \[Icon Huy hiệu\] Tên học sinh \- (Lớp)  
    * Ví dụ: 🛡️ Nguyễn Văn A \- (11A2)  
  * Trạng thái "Live" (Tùy chọn nâng cao): Nếu đang trong khung giờ trực (vd: từ 6h45 \- 7h15 sáng), cạnh tên Cờ đỏ sẽ có một chấm tròn màu xanh lá cây nhấp nháy 🟢 kèm chữ Đang làm nhiệm vụ để tăng tính răn đe, nhắc nhở học sinh toàn trường chú ý nề nếp.  
> * **Giao diện hiển thị "Cả tuần" (Weekly Schedule)**  
>   Khi người xem bấm sang tab \[Cả tuần\], hệ thống sẽ mở ra một Pop-up (Modal) hoặc bảng cuộn ngang hiển thị toàn bộ lịch trình:  
  * Cột dọc: Danh sách các khu vực trực (Khối 10, Khối 11, Nhà xe, Cổng chính).  
  * Cột ngang: Các ngày trong tuần (Thứ 2 đến Thứ 7).  
  * Nội dung ô giao điểm: Tên và Lớp của nhóm Cờ đỏ được phân công. Ô của ngày hiện tại (Today) sẽ được tô viền sáng (Highlight) để người xem dễ định vị.

#### **C. Tác dụng của việc công khai Lịch trực**

> * **Với Học sinh:** Nắm được danh tính người kiểm tra lớp mình, tránh tình trạng "cờ đỏ giả mạo" (học sinh lớp khác tự ý vào bắt lỗi) hoặc cờ đỏ chấm sai khu vực được phân công.  
> * **Với Giáo viên chủ nhiệm:** Dễ dàng biết được ai là người đã chấm điểm lớp mình ngày hôm đó để tiện liên hệ, hỏi thăm tình hình hoặc đối chất khiếu nại.  
> * **Với Admin/Trợ lý thanh niên:** Đóng vai trò như một "bảng thông báo phân công lao động" tự động, không cần phải in file Excel dán lên bảng tin giấy của trường hàng tuần nữa.

## **VIII. ĐẶC TẢ GIAO DIỆN CHO TỪNG NHÓM NGƯỜI DÙNG (ROLES)**

Hệ thống sẽ tự động điều hướng người dùng về giao diện tương ứng sau khi đăng nhập thành công.

### **1\. Nhóm Giám sát / Cờ đỏ (Auditor) \- GIAO DIỆN TÁC NGHIỆP TRÊN MOBILE**

Được thiết kế chuẩn Mobile-First, tối giản để Cờ đỏ thao tác bằng một tay trong lúc đi dọc hành lang.

> * **Layout chính:** Màn hình không có Sidebar. Sử dụng Bottom Navigation Bar (Thanh điều hướng dưới đáy màn hình) gồm 4 tab: Trang chủ, Chấm lỗi, Quét QR, Tài khoản.  
> * **Tab "Trang chủ" (Home):**  
  * Card thông báo: "Bạn có ca trực tại Khối 10 hôm nay".  
  * Danh sách lỗi vi phạm do chính tài khoản này vừa nhập trong ngày (hiển thị trạng thái màu: Vàng \= Chờ duyệt, Xanh \= Đã duyệt).  
> * **Màn hình "Ghi nhận vi phạm" (Core Screen):**  
  * **Thanh trạng thái mạng:** Hiển thị icon Đám mây màu xanh (Online) hoặc Đám mây gạch chéo màu xám (Offline). Dữ liệu nhập lúc Offline sẽ tự động đẩy lên server khi có mạng lại.  
  * **Bước 1 \- Chọn vị trí:** Dropdown menu dạng vuốt cuộn chọn Khối \-\> Lớp (Hệ thống tự động ưu tiên đẩy lên đầu danh sách các lớp thuộc ca trực của Cờ đỏ đó trong ngày).  
  * **Bước 2 \- Chọn lỗi:** Thay vì danh sách dài, sử dụng thanh tìm kiếm (Search bar) kết hợp các Nút (Tag) gợi ý nhanh các lỗi phổ biến (Vd: Đi muộn, Sai đồng phục, Vệ sinh kém).  
  * **Bước 3 \- Gắn thẻ học sinh (Tùy chọn):** Nút \[+ Thêm học sinh\] mở ra danh sách lớp để checkmark nhiều học sinh cùng lúc, hoặc nút \[Lỗi tập thể\] để bỏ qua bước này.  
  * **Bước 4 \- Minh chứng:** Khung hình chữ nhật nét đứt với icon Camera ở giữa. Chạm vào mở ngay Camera sau chụp trực tiếp. Hỗ trợ chụp tối đa 3 ảnh/lỗi.  
  * **Nút Submit:** Nút bấm chiếm toàn bộ chiều ngang màn hình (Full-width button) dán chặt ở cạnh dưới cùng (Sticky bottom), màu Xanh lá: \[Gửi Báo Cáo\].  
> * **Tab "Quét QR" Điểm danh:**  
  * **Giao diện:** Camera View chiếm 80% màn hình, có khung viền vuông ngắm mục tiêu ở giữa. 20% bên dưới hiển thị số lượng quét thành công (Vd: Đã điểm danh: 45/100).  
  * **Luồng hoạt động:** Quét mã QR \-\> Máy rung (Haptic feedback) và phát âm thanh "Tít" ngắn \-\> Hiển thị Popup màu xanh lá (Tên, Lớp của học sinh) bay lên góc phải rồi biến mất trong 1 giây \-\> Camera ngắm chuẩn bị quét mã tiếp theo liên tục không cần chờ đợi.

### **2\. Nhóm Quản lý / Giáo viên chủ nhiệm (Manager) \- BẢNG ĐIỀU KHIỂN LỚP HỌC**

Thiết kế tối ưu cho máy tính bảng (Tablet) và PC, giúp GVCN nắm bắt mọi tình hình của lớp ngay khi mở máy.

> * **Layout chính:** Dạng Dashboard đơn giản.  
> * **Màn hình "Tổng quan Lớp" (Dashboard):**  
  * Hiển thị thẻ điểm số hiện tại của lớp: Tổng điểm tuần này: 85/100 (Màu đỏ nếu thấp hơn tuần trước, màu xanh nếu cao hơn).  
  * Biểu đồ tròn (Pie Chart) phân tích các loại lỗi lớp hay mắc phải (Vd: 50% Đi muộn, 30% Đồng phục).  
> * **Màn hình "Hộp thư Nề nếp" (Violation Inbox):**  
  * **Bố cục danh sách:** Các lỗi chưa duyệt xếp thành từng dòng, có gắn nhãn thời gian đếm ngược (Vd: Còn 12h để phản hồi).  
  * **Chi tiết lỗi (Expandable Row):** Click vào dòng lỗi sẽ xổ ra (Dropdown) ảnh minh chứng phóng to, tên cờ đỏ ghi nhận và ghi chú chi tiết.  
  * **Thao tác xử lý:** Hai nút nổi bật trên mỗi dòng:  
    * Nút Xanh: \[Xác nhận lỗi\] \-\> Lỗi chính thức được ghi nhận, điểm lớp bị trừ.  
    * Nút Đỏ: \[Khiếu nại/Phúc khảo\] \-\> Mở ra một Modal pop-up bắt buộc nhập Lý do giải trình (Vd: Học sinh bị ốm vào phòng y tế, không phải đi muộn) kèm theo nút tải lên ảnh minh chứng (giấy xin phép của phụ huynh).  
> * **Màn hình "Hồ sơ Học sinh của lớp":**  
  * **Giao diện Bảng (Data Grid):** Liệt kê toàn bộ học sinh trong lớp. Cột thông tin gồm: Tên, Tổng lỗi đã vi phạm, Tổng điểm phong trào đã tích lũy.  
  * **Chi tiết cá nhân (Student Profile):** Bấm vào tên một học sinh sẽ xem được dòng thời gian (Timeline) lịch sử: Ngày nào bị trừ điểm nề nếp, ngày nào được cộng điểm tham gia hoạt động Đoàn. Giúp GVCN có cơ sở đánh giá hạnh kiểm cuối kỳ.

### **3\. Nhóm Quản trị / Bí thư Đoàn (Admin) \- TRUNG TÂM ĐIỀU HÀNH**

Thiết kế giao diện Dashboard chuyên nghiệp trên Desktop (PC) để xử lý lượng lớn dữ liệu.

> * **Layout chính:** Sidebar Navigation bên trái (Thu gọn/Mở rộng được), Nội dung chính chiếm 85% màn hình bên phải.  
> * **Màn hình Tổng quan (Command Center):**  
  * Các Widget thống kê nhanh: Số vi phạm trong ngày, Lớp đang bét bảng, Số điểm danh hoạt động.  
  * Biểu đồ đường (Line Chart) so sánh mức độ vi phạm nề nếp toàn trường theo từng tuần.  
> * **Màn hình "Phân xử Khiếu nại" (Resolution Center):**  
  * **Split-view (Giao diện chia đôi):**  
    * Nửa bên trái hiển thị nội dung Cờ đỏ báo cáo (Ảnh rác trong lớp, thời gian chụp).  
    * Nửa bên phải hiển thị nội dung GVCN giải trình (Văn bản lý do, ảnh giấy xin phép).  
  * **Thao tác quyết định:**  
    * Nút \[Bác bỏ khiếu nại \- Giữ nguyên lỗi\] (Thông báo về cho GVCN).  
    * Nút \[Chấp nhận khiếu nại \- Hủy lỗi\] (Thông báo về cho Cờ đỏ để rút kinh nghiệm).  
> * **Màn hình "Quản lý Bộ tiêu chí" (Criteria Builder):**  
  * Hệ thống bảng cho phép Admin thiết lập Công thức thi đua động.  
  * Thêm/Sửa Tiêu chí: Mở Form nhập liệu gồm: Tên tiêu chí, Loại (Radio button: Cộng / Trừ), Số điểm (Input số), Mức độ ưu tiên (Đánh dấu lỗi nghiêm trọng như Đánh nhau, Gian lận thi cử).  
  * Nút Toggle Trạng thái: Bật/Tắt (Enable/Disable) một tiêu chí ngay lập tức. (Ví dụ: Tạm tắt tiêu chí "Đi học muộn" trong tuần mưa bão, lụt lội).  
> * **Màn hình "Chốt sổ & Xuất báo cáo" (Data Export):**  
  * Bảng điều khiển thời gian: Cho phép chọn khoảng thời gian (Tuần/Tháng/Kỳ).  
  * Nút \[Khóa Dữ Liệu\] (Lock Data): Nút đỏ cảnh báo. Yêu cầu nhập mã PIN. Sau khi bấm, toàn bộ dữ liệu của tuần đó bị khóa (Freeze), không Cờ đỏ hay GVCN nào có thể sửa, thêm hay khiếu nại nữa.  
  * Tạo Báo cáo: Hiển thị 3 nút download:  
    * \[Xuất PDF Bản in\]: Tự động generate layout có sẵn chữ ký, mộc đỏ định dạng A4 để dán lên bảng tin trường.  
    * \[Xuất Excel Tổng hợp\]: Trả về file .xlsx chứa nhiều sheet (Sheet tổng hợp điểm lớp, Sheet danh sách học sinh vi phạm nhiều nhất).  
    * \[Xuất Zalo Broadcast\]: Nút liên kết API tự động đẩy thông báo kết quả tuần đến toàn bộ nhóm Zalo của các GVCN.

### **4\. Module Quản lý Người dùng & Phân quyền (Dành cho Admin)**

Nhóm Quản trị (Admin) bắt buộc phải có Module Quản lý Tài khoản & Cấp quyền.

#### **A. Đặc tả chức năng**

| Tên chức năng | Đầu vào (Input) | Xử lý logic (Process) | Đầu ra (Output)   |
| :---- | :---- | :---- | :---- |
| **Quản lý Tài khoản (CRUD)** | Thông tin cơ bản: Mã định danh, Họ Tên, Mật khẩu mặc định. Lệnh: Thêm mới / Sửa / Xóa / Khóa tài khoản. | Cập nhật dữ liệu vào bảng Users. Nếu chọn "Khóa" (Ban/Deactivate), user đó ngay lập tức bị văng ra khỏi hệ thống và không thể đăng nhập. | Tài khoản được tạo/cập nhật. |
| **Reset Mật khẩu** | ID Tài khoản cần reset. | Đặt lại mật khẩu về mặc định (Vd: 123456aA@ hoặc ngày tháng năm sinh) khi học sinh/giáo viên quên mật khẩu. | Thông báo thành công để Admin gửi lại cho người dùng. |
| **Phân quyền Hệ thống (Roles)** | ID Tài khoản và Nhóm Quyền (Admin, Manager, Auditor, User). | Cập nhật field Role trong Database. Tự động thay đổi giao diện/menu tương ứng khi user đó đăng nhập lại. | Trạng thái quyền mới được hiển thị. |
| **Phân công Nhiệm vụ (Mapping)** | Mapping tài khoản với đối tượng: \- Gán Giáo viên A vào Lớp 11A1. \- Gán Học sinh B làm Cờ đỏ trực Khối 10\. | Tạo liên kết (Foreign Key) giữa bảng Users và bảng Classes hoặc Inspection\_Shifts. Hệ thống sẽ chỉ gửi thông báo vi phạm của lớp 11A1 cho Giáo viên A. | Cập nhật thành công danh sách GVCN và Đội Cờ đỏ trực tuần. |

#### **B. Đặc tả Giao diện**

Module này được thiết kế theo dạng Quản trị Bảng dữ liệu (Data Management Grid) trên màn hình Desktop để Admin thao tác nhanh nhất.

> * **Màn hình "Danh sách Hệ thống" (User Management)**  
  * **Thanh công cụ (Toolbar) ở trên cùng:**  
    * Thanh tìm kiếm nhanh (Search by Name, Mã định danh).  
    * Bộ lọc (Dropdown Filters): Lọc theo Khối/Lớp, Lọc theo Vai trò (Tìm tất cả các tài khoản đang là Cờ đỏ), Lọc theo Trạng thái (Đang hoạt động / Bị khóa).  
    * Nút Hành động: \[+ Thêm mới 1 user\], \[Tải lên danh sách Excel\], \[Xuất file Excel\].  
  * **Giao diện Bảng lưới (Data Table):**  
    * Hiển thị các cột: Mã định danh, Họ và tên, Lớp/Đơn vị, Vai trò hiện tại, Trạng thái (Icon Nút gạt Toggle Bật/Tắt màu xanh/xám).  
    * Cột cuối cùng là các thao tác nhanh (Quick Actions): Icon ✏️ (Sửa thông tin), Icon 🔑 (Khôi phục mật khẩu gốc).  
> * **Màn hình "Phân công GVCN & Đội Cờ Đỏ" (Assignment Matrix)**  
>   Việc gán quyền không đơn thuần là chọn Role, mà là gắn quyền đó với phạm vi quản lý. Thiết kế giao diện này cực kỳ quan trọng để hệ thống không gửi thông báo nhầm người.  
  * **Tab 1: Phân công GVCN (Manager Mapping):**  
    * Giao diện gồm danh sách các Lớp học.  
    * Cạnh mỗi lớp là một Dropdown có chức năng Tìm kiếm (Searchable Dropdown) để gõ tên và chọn Giáo viên phụ trách lớp đó.  
  * **Tab 2: Lập lịch trực Cờ Đỏ (Auditor Scheduling):**  
    * Giao diện dạng Bảng Ma trận (Matrix Table) hoặc Lịch (Calendar).  
    * Cột dọc là Danh sách các học sinh thuộc Đội Cờ đỏ (Auditors).  
    * Cột ngang là các Khu vực trực (Khối 10, Khối 11, Khu vực Sân trường, Nhà xe).  
    * Admin click vào ô giao điểm để chọn "Tuần trực" cho Cờ đỏ đó. (Vd: Phân công em Nguyễn Văn A trực Khối 10 vào Tuần 1, 2, 3).  
    * Tự động hóa thông minh: Khi đến Tuần 1, trên app di động của em Nguyễn Văn A sẽ tự động hiện danh sách Lớp Khối 10 để chấm điểm. Hết Tuần 3, em A mở app ra sẽ không còn thấy danh sách lớp đó nữa.  
> * **Màn hình "Kiểm soát quyền truy cập" (Access Logs) \- Nâng cao:**  
  * Dành cho Admin IT (Trợ lý thanh niên rành công nghệ): Hiển thị lịch sử hoạt động (Logs).  
  * Ví dụ: Biết được tài khoản của GV A đăng nhập lúc mấy giờ, tài khoản Cờ đỏ B vừa sửa một lỗi vi phạm vào lúc nào. Tính năng này giúp giải quyết triệt để các tranh cãi nếu có nghi ngờ "hack mật khẩu sửa điểm".

### **5\. Nhóm Học sinh (User) \- KHÔNG GIAN CÁ NHÂN & GAMIFICATION**

Giao diện Mobile mang phong cách ứng dụng thẻ sinh viên/mạng xã hội mini.

> * **Layout chính:** Bottom Navigation Bar (Bảng tin, Mã QR, Xếp hạng, Cá nhân).  
> * **Màn hình "Thẻ Học Sinh Số" (Digital ID) (Tab "Mã QR"):**  
  * Trực quan: Thiết kế mô phỏng thẻ nhựa. Nền là màu sắc tương ứng với Khối (Vd: Khối 10 Xanh dương, Khối 11 Cam, Khối 12 Đỏ).  
  * Nội dung cốt lõi: Một mã QR siêu lớn ở trung tâm, tự động tăng độ sáng màn hình điện thoại khi mở trang này. Mã QR này chứa chuỗi Token thay đổi mỗi 5 phút (Dynamic QR) để chống việc chụp màn hình điểm danh hộ.  
  * Thống kê cá nhân: Hiển thị cấp độ/Rank của học sinh (Vd: Đoàn viên Tích cực) và thanh tiến trình (Progress Bar) để đạt cấp độ tiếp theo.  
> * **Tab "Xếp hạng" (Leaderboard):**  
  * Giao diện danh sách vinh danh. Top 1, 2, 3 được đánh dấu bằng các Icon Cúp Vàng, Bạc, Đồng và size chữ to hơn, có hiệu ứng đổ bóng.  
  * Dòng dữ liệu lớp của chính học sinh đó (dù ở hạng 20\) luôn được highlight (Ghim gạch chân/tô màu nền khác) để học sinh dễ nhận biết vị trí của lớp mình.  
> * **Tab "Cá nhân" (Profile & Lịch sử):**  
  * Hiển thị "Điểm phong trào" hiện có (Số Coin/Point).  
  * Timeline lịch sử: Danh sách các hoạt động Đoàn đã tham gia và các lỗi nề nếp đã bị trừ điểm (Hiển thị chi tiết ngày giờ và ảnh minh chứng để học sinh "tâm phục khẩu phục").  
> * **Màn hình "Cổng đăng ký Hoạt động":**  
  * Danh sách các sự kiện sắp diễn ra dạng thẻ bài (Cards) với hình ảnh bắt mắt.  
  * Nhấn vào xem chi tiết: Thông tin địa điểm, thời gian, số điểm cộng phong trào nhận được, số lượng slot (chỗ) còn lại.  
  * Nút \[Đăng ký Tham gia\]: Nếu còn slot, hiển thị màn hình chúc mừng. Nếu hết slot, hiển thị nút \[Vào danh sách chờ\].

## **IX. KHỞI TẠO DỮ LIỆU MẪU (MOCK DATA) DỰA TRÊN FILE EXCEL**

### **1\. Bảng Khối & Lớp Học (Classes)**

Dựa theo các cột dữ liệu trong sheet Tổng điểm và T2, toàn trường có 18 lớp chia đều cho 3 khối:

> * Khối 10 (6 lớp): 10/1; 10/2; 10/3; 10/4; 10/5; 10/6.  
> * Khối 11 (6 lớp): 11/1; 11/2; 11/3; 11/4; 11/5; 11/6.  
> * Khối 12 (6 lớp): 12/1; 12/2; 12/3; 12/4; 12/5; 12/6.

### **2\. Bảng Tiêu Chí Chấm Điểm (Criteria)**

Theo sheet Tiêu chí trong file, bộ tiêu chí được chia thành 4 nhóm lớn với định mức điểm chuẩn mỗi ngày là 240 điểm. Dưới đây là dữ liệu mẫu bám sát nội dung để đưa vào Database:

| Mã | Nhóm tiêu chí | Tên Tiêu chí (Trích lược) | Loại | Mức trừ   |
| :---- | :---- | :---- | :---- | :---- |
| **I.1** | **Chuyên cần** | **(Điểm chuẩn nhóm: 40 điểm/ngày)** |  |  |
| 1.1 | Chuyên cần | Vào lớp sinh hoạt trễ 5p đầu giờ | Trừ điểm | \-1đ / HS |
| 1.2 | Chuyên cần | Vắng có phép (có xác nhận của GVCN) | Trừ điểm | \-1đ / HS / buổi |
| 1.3 | Chuyên cần | Vắng không phép | Trừ điểm | \-2đ / HS / buổi |
| 1.4 | Chuyên cần | Bỏ tiết (kể cả tiết chào cờ) | Trừ điểm | \-2đ / HS / tiết |
| 1.5 | Chuyên cần | Báo cáo gian lận / sai sĩ số | Trừ điểm | \-5đ / lần |
| **I.2** | **Vệ sinh** | **(Điểm chuẩn nhóm: 30 điểm/ngày)** |  |  |
| 2.1 | Vệ sinh | Không trực nhật | Trừ điểm | \-5đ / buổi |
| 2.2 | Vệ sinh | Trực nhật trễ, không đổ rác, vệ sinh kém | Trừ điểm | \-2đ / buổi |
| 2.4 | Vệ sinh | Thiếu khăn bảng, bình hoa, dung dịch sát khuẩn | Trừ điểm | \-1đ / loại |
| **I.3** | **Nề nếp tự quản** | **(Điểm chuẩn nhóm: 65 điểm/ngày)** |  |  |
| 3.1 | Tự quản | Ồn ào 5p đầu giờ, đi lại hành lang | Trừ điểm | \-5đ / buổi |
| 3.5 | Tự quản | Không tắt điện, quạt sau giờ học | Trừ điểm | \-5đ / buổi |
| 3.7 | Tự quản | Sử dụng điện thoại không được phép | Trừ điểm | \-5đ / HS / lần |
| **I.4** | **Tác phong** | **(Điểm chuẩn nhóm: 90 điểm/ngày)** |  |  |
| 4.1 | Tác phong | Không đúng đồng phục, sai giày dép | Trừ điểm | \-2đ / HS |
| 4.2 | Tác phong | Đầu tóc không đúng quy định (uốn, nhuộm...) | Trừ điểm | \-2đ / HS |

Công thức tính điểm tuần của hệ thống sẽ là:  
**Tổng điểm Tuần \= 1440 \- (Tổng điểm trừ từ T2 đến T7).**

## **X. ĐẶC TẢ PHÂN HỆ ĐĂNG NHẬP (USER ACCOUNTS & ROUTING)**

Hệ thống sẽ dựa vào dữ liệu ở trên để thiết lập danh sách tài khoản cho các nhóm người dùng. Mật khẩu mặc định là 123456@Password.

> * **1\. Nhóm Ban Thường Vụ / Admin (Quản trị viên)**  
  * **Tài khoản:** admin | **Mật khẩu:** 123456@Password  
  * **Chức năng sau đăng nhập:**  
    * Truy cập màn hình Tổng điểm (hiển thị giống như sheet Tổng điểm trong Excel, với cột Điểm Chuẩn là 1440 và tự động tính điểm trừ của 18 lớp trong tuần).  
    * Có quyền khóa dữ liệu vào thứ 7 hàng tuần và xuất bảng Excel gửi Ban Giám hiệu.  
> * **2\. Nhóm Đội Cờ Đỏ / Giám Sát (Người chấm điểm)**  
  * **Tài khoản:** codo\_nam | **Mật khẩu:** 123456@Password  
  * **Chức năng sau đăng nhập:**  
    * Truy cập giao diện Mobile Form.  
    * Mỗi ngày, Cờ đỏ sẽ chọn "Thứ" (T2, T3... T7), chọn Lớp (Vd: 10/1) và nhập đúng số lượng học sinh vi phạm vào các ô tiêu chí.  
    * Ví dụ (Theo sheet T2 của file excel): Tại lớp 10/2, vắng có phép 10 HS \-\> nhập số 10 vào lỗi 1.2; Vắng không phép 2 HS \-\> Nhập 2 vào lỗi 1.3... Hệ thống sẽ tự động nhân hệ số để ra tổng điểm bị trừ.  
> * **3\. Nhóm Giáo Viên Chủ Nhiệm (Theo dõi & Phúc khảo)**  
  * **Tài khoản mẫu 1:** gvcn\_10\_1 (Đại diện GVCN lớp 10/1)  
  * **Tài khoản mẫu 2:** gvcn\_11\_5 (Đại diện GVCN lớp 11/5)  
  * **Chức năng sau đăng nhập:**  
    * GVCN lớp 10/1 chỉ xem được bảng điểm trừ chi tiết của lớp 10/1 từ T2 đến T7.  
    * Nếu phát hiện cờ đỏ báo cáo sai (VD: lớp 10/1 không có em nào vắng vô phép ngày T2), thầy/cô có quyền ấn nút "Khiếu nại" ngay trên dòng lỗi đó để BCH Đoàn trường kiểm tra lại sổ ghi đầu bài.  
> * **4\. Nhóm Bí Thư Chi Đoàn**  
  * **Tài khoản mẫu 1:** bithu\_10\_1 (Bí thư lớp 10/1)  
  * **Tài khoản mẫu 2:** bithu\_12\_4 (Bí thư lớp 12/4)  
  * **Chức năng sau đăng nhập:**  
    * Đại diện lớp xem Bảng xếp hạng Vị thứ toàn trường để thông báo trong giờ sinh hoạt lớp cuối tuần (Giống cột "VỊ THỨ" trong sheet Tổng điểm).  
    * Nhận các thông báo điều động lao động từ nhà trường (Liên quan đến lỗi 1.6: Vắng nhiệm vụ lao động).  
> * **5\. Nhóm Đoàn Viên / Học Sinh (User)**  
  * **Tài khoản mẫu 1:** doanvien\_minh (Minh \- Học sinh 10/1)  
  * **Tài khoản mẫu 2:** doanvien\_hoa (Hoa \- Học sinh 12/4)  
  * **Chức năng sau đăng nhập:**  
    * Chỉ thấy được thông báo, bảng điểm công khai và thẻ QR Code cá nhân của mình.  
    * Theo dõi lý do vì sao lớp mình bị trừ điểm ngày hôm đó (Vd: Bị trừ 5đ do không lau bảng ngày thứ 3) để cùng rút kinh nghiệm.

---

## **VI. ĐẶC TẢ MODULE: BẢN TIN & THÔNG BÁO ĐOÀN (NEWS & ANNOUNCEMENTS)**

Module này đóng vai trò như một kênh truyền thông chính thức của Ban Chấp hành Đoàn trường, cho phép Admin phát thông báo khẩn, vinh danh tập thể, và cập nhật tin tức phong trào đến toàn bộ học sinh, phụ huynh và giáo viên thông qua Cổng thông tin công cộng (Public Portal).

### **1. Đặc tả Cấu trúc Dữ liệu (Database Schema - Bảng `Posts`)**

Để dữ liệu hiển thị chính xác như thiết kế (Có ảnh bìa, danh sách Tags, Tác giả, Thời gian), cơ sở dữ liệu trên Supabase/PostgreSQL thiết lập bảng `Posts` với cấu trúc sau:

| Trường dữ liệu (Field) | Kiểu dữ liệu (Type) | Ràng buộc & Chức năng UI |
| :--- | :--- | :--- |
| `post_id` | `UUID` | **Primary Key**, sinh tự động `gen_random_uuid()`. |
| `title` | `VARCHAR` | Tiêu đề bài viết (In đậm, kích thước lớn trên Card). |
| `excerpt` | `TEXT` | Trích dẫn ngắn (2-3 dòng hiển thị dưới tiêu đề). |
| `content` | `TEXT` | Nội dung chi tiết (Mã HTML sinh ra từ Rich Text Editor). |
| `thumbnail_url` | `VARCHAR` | Link ảnh đại diện hiển thị bên trái của Card bài viết. |
| `tags` | `TEXT[]` (Array) | Mảng chứa các thẻ phân loại (VD: `["#NeNep", "#ThongBaoKhan"]`). |
| `author_name` | `VARCHAR` | Tên người đăng hiển thị (VD: "Thầy Lê Hoàng Long", "Ban Thi Đua"). Tự động lấy từ `full_name` của Admin hoặc cho phép nhập tay. |
| `is_pinned` | `BOOLEAN` | Nếu `true`, bài viết có giao diện cảnh báo (VD: THÔNG BÁO KHẨN) và ghim lên đầu danh sách. |
| `status` | `VARCHAR` | Enum: `Published` (Đang hiển thị), `Hidden` (Tạm ẩn). |
| `created_at` | `TIMESTAMPTZ` | Lưu mốc thời gian đăng (Hiển thị định dạng: YYYY-MM-DD HH:MM). |
| `is_deleted` | `BOOLEAN` | Cơ chế Soft Delete (Mặc định `false`). |

### **2. Đặc tả Logic Hiển thị trên Cổng Thông tin (Public View)**

* **Sắp xếp (Sorting):** Bài viết luôn được sắp xếp theo thời gian đăng giảm dần (`ORDER BY created_at DESC`). Ưu tiên hiển thị các bài viết có `is_pinned = true` lên vị trí đầu tiên.
* **Phân trang (Pagination):** Hiển thị danh sách các bài viết mới nhất hoặc cơ chế cuộn mượt mà để tối ưu tải trang.
* **Nhận diện thị giác (Visual Cues):**
  * Thẻ Tag (Ví dụ: `#ThongBaoKhan`, `#TopLopXuatSac`) có viền đỏ đô/nền tối để nổi bật.
  * Badge màu đỏ/xanh dương `[📰 BẢN TIN]` ghim trên góc trái ảnh Thumbnail.

---

## **VII. HƯỚNG DẪN SỬ DỤNG & CẤU HÌNH (DÀNH CHO ADMIN)**

Khu vực quản trị Bản tin được tích hợp sẵn trong **Trung tâm Điều hành Admin**. Để thực hiện phát một thông báo mới hoặc quản lý tin bài, Admin thực hiện theo các bước chuẩn hóa sau:

### **Quy trình 1: Khởi tạo và Đăng tải Bài viết mới**

1. **Truy cập Module:** Từ thanh Menu Sidebar, chọn **[Bản tin & Thông báo]** $\rightarrow$ Nhấn nút **[+ Thêm Bản Tin Mới]**.
2. **Nhập Thông tin Cơ bản:**
   * **Tiêu đề:** Gõ tiêu đề rõ ràng, súc tích (VD: *Kế Hoạch Tổ Chức Hội Thao Thanh Niên*). Nếu là tin khẩn, hệ thống khuyến nghị viết hoa toàn bộ hoặc thêm tiền tố "THÔNG BÁO KHẨN:".
   * **Mô tả ngắn (Excerpt):** Nhập 2-3 câu tóm tắt nội dung để người xem nắm bắt nhanh trước khi click vào xem chi tiết.
3. **Soạn thảo Nội dung (Content Editor):**
   * Sử dụng trình soạn thảo văn bản (Rich Text) để nhập chi tiết nội dung công văn, kế hoạch.
   * Admin có thể sử dụng thanh công cụ để **in đậm**, *in nghiêng*, chèn danh sách (bullet points), chèn bảng biểu, hoặc chèn các liên kết (link) tải file đính kèm (PDF kế hoạch).
4. **Cấu hình Hiển thị (Media & Tags):**
   * **Ảnh đại diện (Thumbnail):** Bấm `[Tải ảnh lên]` để đính kèm hình ảnh minh họa cho bài viết (Tỷ lệ khuyến nghị 16:9). Ảnh này sẽ hiển thị bên trái giao diện Cổng thông tin.
   * **Gắn Thẻ (Tags):** Nhập các từ khóa phân loại cách nhau bằng dấu phẩy hoặc nhấn Enter (VD: *#HoiThao, #TheThao, #DoanVien*). Các thẻ này giúp người dùng phân loại tin tức trực quan.
   * **Người đăng (Tác giả):** Hệ thống tự động lấy tên tài khoản Admin hiện tại. Tuy nhiên, Admin có thể gõ đè tên khác (VD: gõ *Ban Thi Đua Đoàn Trường* thay vì tên cá nhân) để đảm bảo tính danh nghĩa tập thể.
5. **Xuất bản:** Nhấn **[Đăng Bài]**. Bài viết lập tức xuất hiện (Real-time) trên trang chủ của toàn bộ học sinh và giáo viên.

### **Quy trình 2: Quản lý Trạng thái & Xử lý Bài đăng cũ**

Tại giao diện danh sách các bài đã đăng (Bảng Quản lý), Admin sử dụng các công cụ thao tác nhanh (Quick Actions) ở cuối mỗi dòng bài viết:

* **Chỉnh sửa (Icon ✏️):** Mở lại form soạn thảo để sửa lỗi chính tả, thay đổi ảnh hoặc cập nhật thêm thông tin mới vào kế hoạch.
* **Ghim Bài viết Khẩn:** Bật công tắc `[Ghim lên đầu]`. Hệ thống sẽ đẩy bài viết này vượt lên trên tất cả các bài mới khác. Chỉ dùng cho các thông báo khẩn cấp (VD: *Tăng cường kiểm tra nề nếp tháng 9, Nghỉ học do mưa bão*).
* **Tạm Ẩn (Icon 👁️ có gạch chéo):** Chuyển trạng thái `status = Hidden`. Bài viết sẽ biến mất khỏi Cổng thông tin nhưng vẫn còn trong kho lưu trữ của Admin. Áp dụng cho các bản tin bị lỗi cần rút lại để sửa chữa trước khi đăng lại.
* **Xóa Bài viết (Icon 🗑️):** Đưa bài viết vào thùng rác (Kích hoạt `is_deleted = true`). Hệ thống yêu cầu xác nhận *"Bạn có chắc chắn muốn xóa bản tin này?"* để tránh thao tác nhầm.

---

## **VIII. ĐẶC TẢ VÀ TỐI ƯU MODULE: BẢNG XẾP HẠNG THI ĐUA (LEADERBOARD)**

Bảng xếp hạng là "trái tim" của Cổng thông tin, tạo động lực cạnh tranh tích cực giữa các tập thể lớp. Khu vực này được thiết kế theo nguyên tắc **Privacy by Design** (Bảo mật từ trong thiết kế): Chỉ hiển thị số liệu tổng hợp của tập thể, tuyệt đối che giấu danh tính cá nhân vi phạm.

### **1. Đặc tả Thành phần Giao diện (UI Components)**

Khu vực Bảng xếp hạng được chia thành 4 thành phần theo thứ bậc thị giác (Visual Hierarchy) từ trên xuống dưới:

* **Bộ lọc Khối (Segmented Control):**
  * Các nút tab: `[Toàn trường]`, `[Khối 10]`, `[Khối 11]`, `[Khối 12]`.
  * Tab đang chọn (Active) có màu nền Đỏ/Cam nổi bật. Khi click vào các tab Khối, toàn bộ dữ liệu bên dưới tự động lọc lại (Client-side filtering) mà không cần tải lại trang.

* **Bục Vinh Danh Top 3 (Podium):**
  * Thiết kế dạng thẻ nổi (Elevated Cards) với hiệu ứng thị giác 3D.
  * **Hạng 1 (Quán Quân):** Đặt ở giữa, kích thước to nhất, viền và text màu Vàng Gold, kèm Icon Cúp Vàng.
  * **Hạng 2 & Hạng 3:** Đặt đối xứng hai bên, kích thước nhỏ hơn, sử dụng màu Bạc (Silver) và Đồng (Bronze).
  * *Dữ liệu hiển thị trên thẻ:* Tên lớp (VD: Lớp 10/2), Tổng điểm (VD: 1440), Xếp loại (VD: Xuất sắc).

* **Danh sách các hạng còn lại (List View):**
  * Hiển thị từ Hạng 4 trở đi dưới dạng danh sách cuộn dọc (Scrollable List).
  * *Dữ liệu mỗi dòng:*
    * Số thứ hạng (`#4`).
    * Tên lớp & Tên khối (`Lớp 10/5` - `Khối 10`).
    * **Mũi tên Xu hướng (Trendline):** Mũi tên xanh hướng lên (Tăng hạng), Mũi tên đỏ hướng xuống (Tụt hạng), Gạch ngang xám (Giữ nguyên).
    * Tổng điểm hiện tại và Số điểm bị trừ ghi nhỏ bên dưới (VD: `1440đ` / `-0đ`).

* **Footer Cảnh báo Quyền riêng tư:**
  * Dòng text cố định dưới cùng: *"🔒 Dữ liệu công khai chỉ hiển thị tổng điểm tập thể để bảo vệ quyền riêng tư học sinh"*.

---

### **2. Đặc tả Logic Hệ thống (System Logic) & Giải pháp Tối ưu**

#### **A. Logic Xử lý Đồng Hạng (Tie-breaker Logic) - Cực kỳ quan trọng**
Khi các lớp có cùng số điểm tổng kết (VD: cùng 1440đ), hệ thống áp dụng thuật toán phân định 3 tầng ưu tiên:
1. **Ưu tiên 1:** Lớp có **`Tổng Điểm Trừ` ít hơn** sẽ xếp trên.
2. **Ưu tiên 2:** Lớp có **`Tổng Điểm Cộng Phong Trào` cao hơn** sẽ xếp trên.
3. **Ưu tiên 3:** Lớp có **`Sĩ số đông hơn`** sẽ xếp trên (do công tác quản lý nề nếp lớp đông học sinh đòi hỏi nỗ lực cao hơn).

#### **B. Logic Tính toán Xu hướng (Trendline Calculation)**
* Hệ thống so sánh: $\text{Biến động} = \text{Hạng Tuần Trước} - \text{Hạng Tuần Này}$.
  * Nếu $\text{Hạng Hiện Tại} < \text{Hạng Tuần Trước} \implies$ **Tăng hạng (Mũi tên Xanh $\uparrow$)**.
  * Nếu $\text{Hạng Hiện Tại} > \text{Hạng Tuần Trước} \implies$ **Tụt hạng (Mũi tên Đỏ $\downarrow$)**.
  * Nếu bằng nhau $\implies$ **Giữ nguyên (Gạch xám $-$)**.
* *Lưu ý:* Khi ở **Tuần 1** (chưa có dữ liệu tuần trước để đối chiếu), toàn bộ xu hướng mặc định là dấu gạch xám.

#### **C. Tối ưu Trải nghiệm Nhấp chuột (Privacy Drill-down Modal)**
* Khi người xem click vào một lớp trên Bảng xếp hạng, hệ thống **KHÔNG** hiển thị danh sách tên học sinh vi phạm.
* Thay vào đó, mở **Pop-up phân bổ ẩn danh** với biểu đồ thanh tỷ lệ phần trăm theo 4 nhóm nề nếp: *Chuyên cần (%), Vệ sinh (%), Nề nếp tự quản (%), Tác phong (%)*.
* Đáp ứng nhu cầu minh bạch thông tin của phụ huynh/học sinh nhưng bảo vệ tuyệt đối danh tính cá nhân.

---

## **IX. ĐẶC TẢ KIẾN TRÚC VÀ TOÀN VẸN DỮ LIỆU CƠ SỞ (DATABASE SCHEMA & INTEGRITY - POSTGRESQL / SUPABASE)**

*Môi trường triển khai mục tiêu: PostgreSQL 15+ / Supabase Backend*

### **1. NGUYÊN TẮC TOÀN VẸN DỮ LIỆU VÀ CHỐNG TRÙNG LẶP (DATA INTEGRITY & CONSTRAINTS)**

* **Ràng buộc Duy nhất (UNIQUE Constraints):**
  * `student_id` (Mã học sinh) trong bảng `Students` là duy nhất (`PRIMARY KEY`). Khóa chặt nguy cơ tạo trùng 2 hồ sơ cho cùng 1 học sinh.
  * `username` trong bảng `Users` là duy nhất.
  * Tên lớp (`class_name`) kết hợp với Năm học (`academic_year`) là duy nhất (`UNIQUE (class_name, academic_year)`) để tránh tạo nhầm lớp giữa các năm học.
  * `(week_number, class_id)` trong bảng `weekly_final_scores` và `manual_weekly_overrides` là duy nhất.

* **Ràng buộc Kiểm tra (CHECK Constraints):**
  * **Tiêu chí chấm điểm (`Criteria`):** Ràng buộc `score_value > 0`. Phân biệt loại `type = 'Cộng'` hoặc `type = 'Trừ'`.
  * **Số lượng vi phạm (`Violations`):** Cột `quantity` trong bảng ghi nhận lỗi luôn bắt buộc `quantity > 0`.
  * **Khối lớp (`Classes`, `Students`):** Ràng buộc `grade IN (10, 11, 12)`.
  * **Sĩ số lớp:** `total_students >= 0`, `union_members_count >= 0 AND union_members_count <= total_students`.

* **Ràng buộc Khóa ngoại (Foreign Keys - FK):**
  * `class_id` trong bảng `Students` tham chiếu chính xác đến bảng `Classes` (`ON UPDATE CASCADE ON DELETE RESTRICT`).
  * `gvcn_id` trong bảng `Classes` tham chiếu đến bảng `Users` có Role là `Manager` / `GVCN`.
  * Dữ liệu nhập lỗi (`Violations`) bắt buộc ánh chiếu đúng `criteria_code` (Mã tiêu chí), `class_id` (Lớp vi phạm), `week_number` (Tuần học), và `reported_by_id` (Cán bộ ghi nhận).

---

### **2. XỬ LÝ LOGIC DỮ LIỆU CHUYÊN SÂU TRÊN DATABASE**

* **Bảo toàn lịch sử với Xóa mềm (Soft Delete):**
  * Tuyệt đối không dùng lệnh `DELETE` vật lý cho các Dữ liệu cơ sở (Master Data).
  * Mọi bảng `Students`, `Classes`, `Criteria`, `Users`, `Violations` đều có cột `is_deleted` (Boolean, default: `false`).
  * Khi Admin xóa, hệ thống chuyển `is_deleted = true`. Mọi truy vấn vận hành hiện tại bắt buộc kèm điều kiện `WHERE is_deleted = false`.

* **Đóng băng dữ liệu bằng Trình kích hoạt (PostgreSQL Triggers):**
  * Bảng `Weeks` (Tuần học) có cột `is_locked` (Boolean, default: `false`).
  * Trigger `trg_freeze_violations_on_locked_week` kích hoạt hàm `check_week_locked_before_violation_dml()`: Chặn mọi thao tác `INSERT`, `UPDATE`, `DELETE` vào bảng `Violations` nếu `week_number` tương ứng có `is_locked = true`. Hệ thống trả về Exception cấp độ Database `P0001` chống gian lận điểm.

* **Giao dịch an toàn (Database Transactions / Supabase RPC):**
  * Hàm RPC `record_violation_transaction`: Thực thi việc upload ảnh, kiểm tra tuần khóa, kiểm tra tiêu chí, insert bản ghi vi phạm và cập nhật trừ điểm/tăng lỗi học sinh trong một khối Transaction nguyên tử (`BEGIN ... COMMIT / ROLLBACK`).
  * Hàm RPC `lock_week_and_snapshot`: Khóa tuần và kết xuất điểm tĩnh sang bảng Snapshot `weekly_final_scores`.

---

### **3. NGUỒN SỰ THẬT DUY NHẤT (SINGLE SOURCE OF TRUTH) VÀ TÍNH ĐIỂM**

* **Không lưu trữ điểm tĩnh trong quá trình vận hành (No Static Total Columns):**
  * Điểm tổng kết trong tuần không lưu cứng tại bảng Lớp.
  * Sử dụng PostgreSQL View `leaderboard_view` để tự động tổng hợp (`SUM`, `COUNT`) dữ liệu từ bảng `Violations` theo thời gian thực:
    $$\text{Điểm Tính Toán} = \text{Điểm Chuẩn (1440)} + \sum \text{Điểm Cộng} - \sum \text{Điểm Trừ}$$
* **Cơ chế Ghi đè điểm (Manual Fallback / Override):**
  * Bảng `manual_weekly_overrides` bổ sung cột `manual_score`, `manual_bonus`, `manual_penalty`.
  * `leaderboard_view` ưu tiên: `COALESCE(manual_score, calculated_score + manual_bonus - manual_penalty)`. Nếu Admin nhập điểm tay, hệ thống tự động ưu tiên điểm này để xếp hạng.
* **Chốt điểm cá nhân & tập thể (Snapshot):**
  * Khi Admin nhấn "Khóa Tuần" (nhập mã PIN), hàm `lock_week_and_snapshot` sao chép toàn bộ kết quả vào bảng độc lập `weekly_final_scores`. Bảng này lưu giữ giá trị tĩnh vĩnh viễn, không bị ảnh hưởng khi sau này thay đổi tiêu chí động.

---

### **4. BẢO MẬT CẤP DÒNG (ROW LEVEL SECURITY - RLS)**

* **Chính sách cho Cờ đỏ (Auditor):**
  * Chỉ được `INSERT` vào bảng `Violations` khi `auth.uid()` có Role = `auditor`, tuần học hiện tại `is_current = true` và chưa bị khóa (`is_locked = false`).
  * Quyền `SELECT` chỉ xem danh sách các lỗi do chính mình ghi nhận.
* **Chính sách cho Giáo viên Chủ nhiệm (Manager):**
  * Quyền `SELECT` bảng `Violations` chỉ trả về các dòng dữ liệu có `class_id` khớp với lớp mà `auth.uid()` đang làm chủ nhiệm (`c.gvcn_id = auth.uid()`).
  * Quyền `UPDATE` chỉ được phép cập nhật trạng thái `status = 'appealed'` kèm lý do khiếu nại `appeal_reason`.
* **Chính sách cho Học sinh (User):**
  * Quyền `SELECT` bảng `Students` chỉ trả về duy nhất 1 dòng hồ sơ khớp với `auth.uid()`.
* **Chính sách cho Quản trị viên (Admin):**
  * Quyền `ALL` (toàn quyền Đọc, Thêm, Sửa, Xóa mềm) trên tất cả các bảng.

---

### **5. ĐẶC TẢ CẤU TRÚC DỮ LIỆU CỐT LÕI (CORE SCHEMA TABLES)**

#### 1. Bảng Hồ sơ Học sinh / Đoàn viên (`students`)
| Trường dữ liệu (Field) | Kiểu dữ liệu (Type) | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| `student_id` | `VARCHAR(50)` | Primary Key, Mã duy nhất (VD: `HS20241001`). |
| `full_name` | `VARCHAR(150)` | Tên đầy đủ học sinh. |
| `class_id` | `VARCHAR(20)` | Foreign Key $\rightarrow$ `classes(class_id)`. |
| `grade` | `INT` | Khối học (10, 11, 12). |
| `gender` | `gender_type` | `Nam` / `Nữ`. |
| `dob` | `DATE` | Ngày sinh. |
| `ethnicity` | `VARCHAR(50)` | Dân tộc (Kinh, Cơ Tu, Tày...). |
| `phone_number` | `VARCHAR(20)` | Số điện thoại liên hệ cá nhân / phụ huynh. |
| `address` | `TEXT` | Nơi ở hiện tại / thường trú (VD: Thôn Trung Sơn...). |
| `member_type` | `VARCHAR(50)` | `Học sinh` hoặc `Đoàn viên`. |
| `is_union_member` | `BOOLEAN` | Đã kết nạp Đoàn hay chưa. |
| `union_card_number` | `VARCHAR(50)` | Số thẻ đoàn / Mã đoàn viên. |
| `title` | `VARCHAR(100)` | Chức vụ (Bí thư, Cờ đỏ, Đoàn viên...). Nullable. |
| `union_joined_date` | `DATE` | Ngày vào Đoàn. |
| `union_joined_place` | `VARCHAR(200)` | Nơi kết nạp Đoàn. |
| `union_fee_status` | `fee_status` | `paid` / `unpaid`. |
| `union_booklet_status` | `booklet_status` | `submitted` / `not_submitted`. |
| `conduct_rating` | `VARCHAR(50)` | Xếp loại rèn luyện (Xuất sắc, Khá...). |
| `monthly_union_fees` | `JSONB` | Trạng thái đóng đoàn phí 9 tháng. |
| `points` | `DECIMAL(10,2)` | Điểm phong trào cá nhân. |
| `rank_title` | `VARCHAR(100)` | Cấp bậc thi đua đoàn viên. |
| `violations_count` | `INT` | Số lần vi phạm đã ghi nhận. |
| `status` | `VARCHAR(20)` | `active`, `archived`, `transferred`. |
| `is_deleted` | `BOOLEAN` | Mặc định `false`. Soft delete. |

#### 2. Bảng Tài khoản Người dùng (`users`)
| Trường dữ liệu (Field) | Kiểu dữ liệu (Type) | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| `user_id` | `UUID` | Primary Key, `gen_random_uuid()`. |
| `auth_id` | `UUID` | UNIQUE, liên kết Supabase Auth ID. |
| `username` | `VARCHAR(50)` | UNIQUE, Dùng để đăng nhập. |
| `full_name` | `VARCHAR(150)` | Tên hiển thị người dùng. |
| `phone_number` | `VARCHAR(20)` | Bắt buộc để nhận Zalo/SMS Notify. |
| `email` | `VARCHAR(150)` | Email liên lạc. |
| `role` | `user_role` | Enum: `admin`, `manager` (GVCN), `auditor` (Cờ đỏ), `youth_secretary`, `user`. |
| `role_title` | `VARCHAR(100)` | Chức danh hiển thị. |
| `assigned_zone` | `VARCHAR(100)` | Khu vực trực được phân công (nếu là Cờ đỏ). |
| `is_active` | `BOOLEAN` | Mặc định `true`. |
| `is_deleted` | `BOOLEAN` | Mặc định `false`. Soft delete. |

#### 3. Bảng Lớp học (`classes`)
| Trường dữ liệu (Field) | Kiểu dữ liệu (Type) | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| `class_id` | `VARCHAR(20)` | Primary Key (VD: `10/1`, `11/2`, `12/6`). |
| `class_name` | `VARCHAR(50)` | Tên lớp hiển thị (VD: `Lớp 10/1`). |
| `grade` | `INT` | Khối học (10, 11, 12). |
| `academic_year` | `VARCHAR(20)` | Năm học (VD: `2024-2025`). |
| `gvcn_id` | `UUID` | Foreign Key $\rightarrow$ `users(user_id)` (Role = Manager). |
| `bithu_id` | `UUID` | Foreign Key $\rightarrow$ `users(user_id)`. |
| `total_students` | `INT` | Sĩ số học sinh (mặc định 40). |
| `union_members_count` | `INT` | Số lượng đoàn viên. |
| `standard_score` | `DECIMAL(10,2)` | Điểm chuẩn xuất phát tuần (1440.00đ). |
| `is_archived` | `BOOLEAN` | Mặc định `false`. |
| `is_deleted` | `BOOLEAN` | Mặc định `false`. |

#### 4. Bảng Bộ Tiêu chí Chấm điểm (`criteria`)
| Trường dữ liệu (Field) | Kiểu dữ liệu (Type) | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| `criteria_code` | `VARCHAR(20)` | Primary Key (VD: `1.1`, `1.2`, `2.1`). |
| `group_id` | `VARCHAR(10)` | Mã nhóm (`I.1`, `I.2`, `I.3`, `I.4`). |
| `group_name` | `VARCHAR(100)` | Tên nhóm (Chuyên cần, Vệ sinh, Nề nếp...). |
| `group_standard_score` | `DECIMAL(10,2)` | Điểm chuẩn nhóm tiêu chí. |
| `name` | `TEXT` | Nội dung vi phạm / Khen thưởng. |
| `type` | `criteria_type` | Enum: `Cộng` hoặc `Trừ`. |
| `score_value` | `DECIMAL(10,2)` | Điểm định mức (Check: `score_value > 0`). |
| `unit` | `VARCHAR(50)` | Đơn vị tính (`đ / HS`, `đ / lần`...). |
| `is_severe` | `BOOLEAN` | Lỗi nghiêm trọng đặc biệt. |
| `is_active` | `BOOLEAN` | Mặc định `true` (Toggle Bật/Tắt). |
| `is_deleted` | `BOOLEAN` | Mặc định `false`. |

#### 5. Bảng Vi phạm & Điểm cộng Nề nếp (`violations`)
| Trường dữ liệu (Field) | Kiểu dữ liệu (Type) | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| `violation_id` | `UUID` | Primary Key, `gen_random_uuid()`. |
| `week_number` | `INT` | Foreign Key $\rightarrow$ `weeks(week_number)`. |
| `class_id` | `VARCHAR(20)` | Foreign Key $\rightarrow$ `classes(class_id)`. |
| `criteria_code` | `VARCHAR(20)` | Foreign Key $\rightarrow$ `criteria(criteria_code)`. |
| `day` | `day_of_week` | `T2`, `T3`, `T4`, `T5`, `T6`, `T7`. |
| `session` | `VARCHAR(20)` | `Sáng` / `Chiều`. |
| `date_recorded` | `DATE` | Ngày ghi nhận lỗi. |
| `quantity` | `INT` | Check: `quantity > 0`. |
| `points_applied` | `DECIMAL(10,2)` | Điểm quy đổi (`quantity * score_value`). |
| `student_ids` | `TEXT[]` | Mảng mã học sinh vi phạm. |
| `student_names` | `TEXT[]` | Mảng họ tên học sinh vi phạm. |
| `proof_images` | `TEXT[]` | Mảng URL ảnh minh chứng. |
| `reported_by_id` | `UUID` | Foreign Key $\rightarrow$ `users(user_id)`. |
| `status` | `violation_status` | `pending`, `accepted`, `appealed`, `approved_appeal`, `rejected_appeal`. |
| `appeal_reason` | `TEXT` | Lý do khiếu nại của GVCN. |
| `is_deleted` | `BOOLEAN` | Mặc định `false`. |

#### 6. Bảng Chốt Điểm Tuần Tĩnh Snapshot (`weekly_final_scores`)
| Trường dữ liệu (Field) | Kiểu dữ liệu (Type) | Ràng buộc & Ghi chú |
| :--- | :--- | :--- |
| `snapshot_id` | `UUID` | Primary Key, `gen_random_uuid()`. |
| `week_number` | `INT` | Foreign Key $\rightarrow$ `weeks(week_number)`. |
| `class_id` | `VARCHAR(20)` | Foreign Key $\rightarrow$ `classes(class_id)`. |
| `standard_score` | `DECIMAL(10,2)` | Điểm chuẩn xuất phát (1440.00). |
| `total_deductions` | `DECIMAL(10,2)` | Tổng điểm trừ chốt. |
| `total_bonuses` | `DECIMAL(10,2)` | Tổng điểm cộng chốt. |
| `calculated_score` | `DECIMAL(10,2)` | Điểm tính toán hệ thống. |
| `manual_score` | `DECIMAL(10,2)` | Điểm ghi đè nếu có. |
| `final_score` | `DECIMAL(10,2)` | Điểm thi đua chung cuộc sau chốt. |
| `rank_overall` | `INT` | Hạng toàn trường (1 $\rightarrow$ 18). |
| `rank_grade` | `INT` | Hạng trong khối (1 $\rightarrow$ 6). |
| `is_locked` | `BOOLEAN` | Luôn là `true` khi đã chốt. |
| `snapshotted_at` | `TIMESTAMPTZ` | Thời điểm khóa và đóng băng dữ liệu. |
