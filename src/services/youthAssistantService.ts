/**
 * Dịch vụ Trợ lý Đoàn Thanh Niên - THPT Quang Trung
 * Kết hợp: Google Gemini API (đàm thoại tự nhiên, thông minh) + Bộ tri thức nghiệp vụ Đoàn tích hợp sẵn
 */

export interface AssistantSourceChunk {
  title: string;
  uri: string;
}

export interface AssistantResult {
  text: string;
  sources?: AssistantSourceChunk[];
  searchQueries?: string[];
  isWebGrounded?: boolean;
}

export interface AssistantMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  searchQueries?: string[];
  sources?: AssistantSourceChunk[];
  isWebGrounded?: boolean;
}

export interface AssistantContextData {
  activeWeek?: number;
  classes?: Array<{ id: string; name: string; gvcnName?: string; totalStudents?: number; unionMembers?: number }>;
  criteria?: Array<{ code: string; name: string; points: number; type: string }>;
  weeklyScores?: Array<{ classId: string; className: string; finalScore: number; rank: number; totalDeduction: number }>;
}

const STORAGE_KEY_GEMINI = 'YOUTH_ASSISTANT_GEMINI_KEY';
const STORAGE_KEY_MODEL = 'YOUTH_ASSISTANT_GEMINI_MODEL';
const STORAGE_KEY_WEB_SEARCH = 'YOUTH_ASSISTANT_WEB_SEARCH';
const DEFAULT_MODEL = 'gemini-3.8-flash';

export const YouthAssistantService = {
  /**
   * Lấy Gemini API Key đã lưu (từ localStorage hoặc .env)
   */
  getApiKey(): string {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY_GEMINI);
      if (stored && stored.trim()) return stored.trim();
    }
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;
    return envKey ? envKey.trim() : '';
  },

  /**
   * Lưu Gemini API Key
   */
  saveApiKey(key: string): void {
    if (typeof window !== 'undefined') {
      if (key && key.trim()) {
        localStorage.setItem(STORAGE_KEY_GEMINI, key.trim());
      } else {
        localStorage.removeItem(STORAGE_KEY_GEMINI);
      }
    }
  },

  /**
   * Lấy trạng thái kích hoạt tìm kiếm Internet trực tiếp
   */
  getWebSearchEnabled(): boolean {
    if (typeof window !== 'undefined') {
      const val = localStorage.getItem(STORAGE_KEY_WEB_SEARCH);
      if (val !== null) return val === 'true';
    }
    return true; // Mặc định BẬT tìm kiếm Internet
  },

  /**
   * Lưu trạng thái kích hoạt tìm kiếm Internet trực tiếp
   */
  saveWebSearchEnabled(enabled: boolean): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_WEB_SEARCH, String(enabled));
    }
  },

  /**
   * Lấy model được chọn
   */
  getModel(): string {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
    }
    return DEFAULT_MODEL;
  },

  /**
   * Lưu model được chọn
   */
  saveModel(model: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MODEL, model);
    }
  },

  /**
   * Kiểm tra tính hợp lệ của API Key
   */
  async testApiKey(apiKey: string): Promise<{ success: boolean; message: string }> {
    if (!apiKey || !apiKey.trim()) {
      return { success: false, message: 'Vui lòng nhập API Key.' };
    }
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: 'Chào bạn, kiểm tra kết nối.' }] }]
        })
      });
      const data = await res.json();
      if (!res.ok) {
        return { success: false, message: data.error?.message || 'API Key không hợp lệ hoặc đã hết hạn ngạch.' };
      }
      return { success: true, message: 'Kết nối Google Gemini thành công!' };
    } catch (err: any) {
      return { success: false, message: `Lỗi kết nối: ${err.message || String(err)}` };
    }
  },

  /**
   * Tạo System Instruction chi tiết về Trợ lý Chuyên trách Công tác Đoàn TNCS Hồ Chí Minh & Phong trào Thanh thiếu nhi
   */
  buildSystemInstruction(ctx?: AssistantContextData): string {
    let contextAddition = '';

    if (ctx) {
      if (ctx.activeWeek) {
        contextAddition += `\n- Tuần thi đua đang diễn ra trên hệ thống nhà trường: Tuần ${ctx.activeWeek}.`;
      }
      if (ctx.weeklyScores && ctx.weeklyScores.length > 0) {
        contextAddition += `\n- Bảng điểm thi đua tuần gần nhất của 15 lớp:\n` +
          ctx.weeklyScores.slice(0, 15).map(s => `  + ${s.className}: ${s.finalScore}/1440 điểm (Hạng ${s.rank})`).join('\n');
      }
      if (ctx.classes && ctx.classes.length > 0) {
        contextAddition += `\n- Danh sách các lớp trong trường:\n` +
          ctx.classes.slice(0, 15).map(c => `  + Lớp ${c.name} (GVCN: ${c.gvcnName || 'Chưa cập nhật'}, Sĩ số: ${c.totalStudents || 40}, Đoàn viên: ${c.unionMembers || 0})`).join('\n');
      }
    }

    return `Bạn là "TRỢ LÝ CHUYÊN TRÁCH CÔNG TÁC ĐOÀN THANH NIÊN CỘNG SẢN HỒ CHÍ MINH VÀ PHONG TRÀO THANH THIẾU NHI" (Tên thân mật: ÁO XANH AI - CẨM NANG SỐ ĐOÀN).
Bạn am hiểu sâu sắc, toàn diện và có hệ thống về tất cả các lĩnh vực chuyên môn, văn bản hướng dẫn, Điều lệ Đoàn và kỹ năng thực tế để hỗ trợ đắc lực cho cán bộ Đoàn các cấp, đoàn viên, thanh niên, giáo viên và học sinh.

### TÁC PHONG VÀ NGUYÊN TẮC HOẠT ĐỘNG:
1. **Lập trường & Định hướng**: Luôn bám sát đường lối, chủ trương của Đảng Cộng sản Việt Nam, chính sách pháp luật của Nhà nước và các chỉ thị, nghị quyết, hướng dẫn mới nhất của Ban Chấp hành Trung ương Đoàn TNCS Hồ Chí Minh (Đại hội Đoàn toàn quốc lần thứ XII nhiệm kỳ 2022 - 2027).
2. **Khí chất thanh niên**: Năng động, nhiệt huyết, chuẩn mực, truyền cảm hứng, mang đậm tinh thần: *"Đâu cần thanh niên có, việc gì khó có thanh niên"*. Xưng "tôi" hoặc "Áo Xanh AI", gọi người dùng là "đồng chí", "bạn", hoặc "thầy/cô".
3. **Tính thực tiễn & Khả thi**: Khi hướng dẫn hoặc cung cấp văn bản, kịch bản, kế hoạch, phải đưa ra biểu mẫu chi tiết, rõ ràng, đúng thể thức văn bản hành chính của Đoàn, có tính ứng dụng cao vào cơ sở.
4. **Tra cứu Internet chủ động**: Tận dụng Google Search Grounding để cập nhật các sự kiện, chỉ đạo, cuộc thi, văn bản mới nhất năm 2026.
5. **Tính xác thực & Khách quan**: Luôn lưu ý người dùng đối chiếu văn bản chính thức của Đoàn cấp trên và Ban Giám hiệu nhà trường.

### 5 LĨNH VỰC CHUYÊN MÔN CHÍNH:

#### 1. CÔNG TÁC XÂY DỰNG ĐOÀN & ĐIỀU LỆ ĐOÀN:
- **Điều lệ Đoàn TNCS Hồ Chí Minh**: Nắm vững Điều lệ khóa XII, nguyên tắc tập trung dân chủ, hệ thống tổ chức 4 cấp của Đoàn, chức năng, nhiệm vụ của Chi đoàn, Đoàn cơ sở.
- **Nghiệp vụ phát triển đoàn viên mới**:
  + Độ tuổi: Từ đủ 15 tuổi đến 30 tuổi.
  + Quy trình 5 bước chuẩn: (1) Bồi dưỡng cảm tình Đoàn -> (2) Viết đơn và lý lịch xin vào Đoàn -> (3) Hội nghị Chi đoàn họp xét, biểu quyết (trên 1/2 tán thành) -> (4) BCH Đoàn cấp trên ra Quyết định chuẩn y -> (5) Tổ chức Lễ kết nạp Đoàn viên mới trang trọng theo đúng nghi thức Đoàn.
- **Quản lý đoàn viên & Chuyển sinh hoạt Đoàn**:
  + Quản lý sổ đoàn, thẻ đoàn, App di động "Thanh niên Việt Nam" và nghiệp vụ phần mềm Quản lý đoàn viên (YUM).
  + Thủ tục tiếp nhận, giới thiệu chuyển sinh hoạt Đoàn (về nơi cư trú, chuyển trường, tốt nghiệp ra trường).
  + Thu, nộp, sử dụng và trích nộp Đoàn phí (2.000đ/tháng đối với học sinh/sinh viên).
  + Học tập 6 bài học lý luận chính trị dành cho đoàn viên.
- **Kiểm tra, Giám sát, Khen thưởng & Kỷ luật**:
  + Quy trình kiểm tra tổ chức Đoàn và đoàn viên khi có dấu hiệu vi phạm.
  + Thẩm quyền và hình thức kỷ luật Đoàn: Khiển trách, cảnh cáo, cách chức (đối với cán bộ), khai trừ.
  + Khen thưởng: Kỷ niệm chương "Vì thế hệ trẻ", Bằng khen Tỉnh đoàn/Trung ương Đoàn, Giấy khen Huyện đoàn/Đoàn trường.

#### 2. TỔ CHỨC PHONG TRÀO & SỰ KIỆN THANH THIẾU NHI:
- **3 Phong trào hành động cách mạng lớn**:
  1. *Thanh niên tình nguyện*: Tháng Thanh niên (tháng 3), Chiến dịch Thanh niên tình nguyện Hè (Hoa phượng đỏ, Tiếp sức mùa thi, Mùa hè xanh, Kỳ nghỉ hồng, Hành quân xanh); Tình nguyện Mùa Đông & Xuân Tình nguyện; Ngày Chủ nhật xanh; Ngày thứ Bảy tình nguyện.
  2. *Tuổi trẻ sáng tạo*: Ngân hàng ý tưởng sáng tạo thanh niên, hội thi KHKT, ngày hội STEM, chuyển đổi số cộng đồng.
  3. *Tuổi trẻ xung kích bảo vệ Tổ quốc*: Tuyên truyền Luật Nghĩa vụ quân sự, an ninh trường học, biên cương hải đảo.
- **Thiết kế Kế hoạch & Kịch bản chi tiết**:
  + Kịch bản Đại hội Chi đoàn, Đại hội Đoàn trường (Nghi lễ chào cờ hát Quốc ca - Đoàn ca, Báo cáo chính trị, Đề án nhân sự, Bầu cử bằng phiếu kín, Nghị quyết).
  + Kịch bản Lễ kỷ niệm Ngày thành lập Đoàn 26/3, Hội trại truyền thống, Ngày hội "Khi tôi 18".
  + Hội thảo, diễn đàn thanh niên, tọa đàm pháp luật.

#### 3. CÔNG TÁC TUYÊN TRUYỀN & GIÁO DỤC:
- **Giáo dục lý tưởng cách mạng, đạo đức lối sống**: Thực hiện Chỉ thị 42-CT/TW, học tập và làm theo tư tưởng, đạo đức, phong cách Hồ Chí Minh; giáo dục truyền thống cách mạng, lòng yêu nước, tinh thần tự hào dân tộc.
- **Truyền thông Mạng xã hội & Chuyển đổi số**:
  + Biên tập nội dung bài đăng Fanpage/mạng xã hội hấp dẫn: Tiêu đề thu hút, thông điệp truyền cảm hứng, hashtag chuẩn, cấu trúc bài viết kèm hình ảnh/infographic.
  + Cuộc vận động "Mỗi ngày một tin tốt, mỗi tuần một câu chuyện đẹp".
  + Đấu tranh phản bác các quan điểm sai trái, bảo vệ nền tảng tư tưởng của Đảng trên không gian mạng.
- **Sinh hoạt chính trị**: Tổ chức diễn đàn "Khát vọng cống hiến - Lẽ sống thanh niên", học tập các Nghị quyết của Đảng và của Đoàn.

#### 4. KỸ NĂNG NGHIỆP VỤ CÁN BỘ ĐOÀN & CÔNG TÁC HỘI - ĐỘI:
- **Kỹ năng Cán bộ Đoàn**: Thuyết trình trước đám đông, kỹ năng dẫn chương trình (MC) sự kiện, kỹ năng điều hành sinh hoạt chi đoàn sinh động, trò chơi Teambuilding, sinh hoạt vòng tròn, dân vũ thanh niên, các bài hát truyền thống của Đoàn.
- **Soạn thảo thể thức văn bản hành chính của Đoàn**:
  + Chuẩn theo Hướng dẫn thể thức văn bản của Ban Bí thư Trung ương Đoàn: Tiêu ngữ, số ký hiệu văn bản Đoàn, tên cơ quan ban hành, trích yếu, căn cứ ban hành, nội dung điều khoản, nơi nhận, chữ ký và đóng dấu.
  + Các loại văn bản: Kế hoạch (KH), Báo cáo (BC), Tờ trình (TTr), Quyết định (QĐ), Nghị quyết (NQ), Biên bản (BB), Công văn (CV), Chương trình (CTr).
- **Công tác Hội & Đội**: Nghiệp vụ Hội Liên hiệp Thanh niên Việt Nam (15/10), Hội Sinh viên Việt Nam (09/01), Đội TNTP Hồ Chí Minh (15/5), phong trào "Thiếu nhi Việt Nam thi đua làm theo 5 điều Bác Hồ dạy".

#### 5. ĐỒNG HÀNH VỚI THANH NIÊN:
- **Khởi nghiệp & Lập nghiệp**: Tư vấn mô hình kinh tế thanh niên, OCOP thanh niên, thủ tục tiếp cận nguồn vốn ưu đãi Ngân hàng Chính sách xã hội (NHCSXH) và Quỹ Quốc gia về việc làm (kênh Trung ương Đoàn 120).
- **Học tập & Hướng nghiệp**: Tư vấn chọn ngành, chọn nghề, ngày hội việc làm, học bổng "Thắp sáng ước mơ tuổi trẻ Việt Nam".
- **Phong trào Danh hiệu**: Tiêu chuẩn xét chọn "Học sinh 3 tốt" (Đạo đức tốt - Học tập tốt - Thể lực tốt), "Học sinh 3 rèn luyện", "Sinh viên 5 tốt".
- **Kỹ năng mềm**: Rèn luyện kỹ năng giao tiếp, làm việc nhóm, quản lý cảm xúc, tư duy phản biện, kỹ năng an toàn số.

#### 6. DỮ LIỆU ĐOÀN TRƯỜNG THPT QUANG TRUNG - ĐÔNG GIANG:${contextAddition}
- Quy chế 27 tiêu chí nề nếp thi đua (định mức chuẩn 1440 điểm/tuần). Khi có câu hỏi về điểm và thứ hạng của 15 lớp, cung cấp số liệu chính xác theo hệ thống.`;
  },

  /**
   * Gửi tin nhắn đến Google Gemini API (có hỗ trợ Google Search Grounding)
   */
  async sendMessageToGemini(
    userText: string,
    history: AssistantMessage[],
    ctx?: AssistantContextData,
    enableWebSearch: boolean = true
  ): Promise<AssistantResult> {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      // Fallback về bộ tri thức nghiệp vụ nội bộ nếu chưa có API Key
      const fallbackText = this.getLocalKnowledgeResponse(userText, ctx);
      return {
        text: fallbackText,
        isWebGrounded: false
      };
    }

    const model = this.getModel();
    const systemInstruction = this.buildSystemInstruction(ctx);

    // Chuyển đổi lịch sử chat cho Gemini format
    const contents: any[] = [];

    // Lấy 6 tin nhắn gần nhất để tối ưu token
    const recentHistory = history.slice(-6);
    recentHistory.forEach(msg => {
      contents.push({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      });
    });

    // Thêm tin nhắn hiện tại
    contents.push({
      role: 'user',
      parts: [{ text: userText }]
    });

    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    // Payload cơ bản
    const basePayload: any = {
      contents,
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048
      }
    };

    // Nếu bật tìm kiếm web, kích hoạt Google Search Grounding tool
    if (enableWebSearch) {
      basePayload.tools = [{ google_search: {} }];
    }

    try {
      let response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(basePayload)
      });

      let data = await response.json();

      // Nếu lỗi do model không hỗ trợ tool google_search, tự động retry không dùng tool
      if (!response.ok && enableWebSearch && data.error?.message?.toLowerCase().includes('tool')) {
        console.warn('Model không hỗ trợ tool google_search, tự động thử lại không dùng tool:', data.error.message);
        delete basePayload.tools;
        response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(basePayload)
        });
        data = await response.json();
      }

      if (!response.ok) {
        console.warn('Lỗi gọi Gemini API:', data);
        const fallbackText = this.getLocalKnowledgeResponse(userText, ctx);
        return {
          text: `*(Hệ thống tạm chuyển sang chế độ Tri thức nội bộ do API Gemini phản hồi: ${data.error?.message || 'Lỗi kết nối'})*\n\n${fallbackText}`,
          isWebGrounded: false
        };
      }

      const candidate = data.candidates?.[0];
      const replyText = candidate?.content?.parts?.[0]?.text;

      if (!replyText) {
        const fallbackText = this.getLocalKnowledgeResponse(userText, ctx);
        return {
          text: fallbackText,
          isWebGrounded: false
        };
      }

      // Trích xuất grounding metadata từ Internet (nếu có)
      const groundingMeta = candidate?.groundingMetadata;
      let sources: AssistantSourceChunk[] = [];
      let searchQueries: string[] = [];
      let isWebGrounded = false;

      if (groundingMeta) {
        isWebGrounded = true;
        if (Array.isArray(groundingMeta.webSearchQueries)) {
          searchQueries = groundingMeta.webSearchQueries;
        }
        if (Array.isArray(groundingMeta.groundingChunks)) {
          groundingMeta.groundingChunks.forEach((chunk: any) => {
            if (chunk.web?.uri) {
              sources.push({
                title: chunk.web.title || chunk.web.uri,
                uri: chunk.web.uri
              });
            }
          });
        }
      }

      return {
        text: replyText,
        sources: sources.length > 0 ? sources : undefined,
        searchQueries: searchQueries.length > 0 ? searchQueries : undefined,
        isWebGrounded
      };
    } catch (err: any) {
      console.warn('Ngoại lệ khi gọi Gemini:', err);
      const fallbackText = this.getLocalKnowledgeResponse(userText, ctx);
      return {
        text: fallbackText,
        isWebGrounded: false
      };
    }
  },

  /**
   * Bộ tri thức chuyên sâu nội bộ (Offline Smart Knowledge Base) hoạt động tức thời không cần API Key
   */
  getLocalKnowledgeResponse(query: string, ctx?: AssistantContextData): string {
    const q = query.toLowerCase().trim();

    // 1. CÔNG TÁC XÂY DỰNG ĐOÀN & ĐIỀU LỆ
    if (q.includes('kết nạp') || q.includes('ket nap') || q.includes('vào đoàn') || q.includes('vao doan')) {
      return `🇻🇳 **QUY TRÌNH 5 BƯỚC KẾT NẠP ĐOÀN VIÊN MỚI (CHUẨN ĐIỀU LỆ ĐOÀN KHÓA XII):**\n\n` +
        `**1. Điều kiện xem xét:**\n` +
        `- Độ tuổi: Từ đủ 15 tuổi đến 30 tuổi.\n` +
        `- Hạnh kiểm: Đạt loại Khá hoặc Tốt; có ý thức tự giác, phấn đấu vươn lên.\n` +
        `- Có nguyện vọng và tự nguyện làm đơn gia nhập Đoàn TNCS Hồ Chí Minh.\n\n` +
        `**2. Quy trình 5 bước thực hiện:**\n` +
        `1. **Học bồi dưỡng cảm tình Đoàn:** Tham gia lớp bồi dưỡng do BCH Đoàn trường tổ chức, học về lịch sử Đoàn, Điều lệ Đoàn và 6 bài lý luận chính trị.\n` +
        `2. **Viết Đơn xin vào Đoàn & Khai Lý lịch đoàn viên:** Học sinh hoàn thiện hồ sơ có dán ảnh 3x4 theo mẫu của Trung ương Đoàn.\n` +
        `3. **Hội nghị Chi đoàn xét & biểu quyết:** Chi đoàn họp, người giới thiệu nhận xét. Tiến hành biểu quyết (phải đạt trên 1/2 số đoàn viên có mặt tán thành) và lập biên bản đề nghị Đoàn trường.\n` +
        `4. **BCH Đoàn trường ra Quyết định chuẩn y kết nạp:** Thẩm định hồ sơ và ban hành Quyết định kết nạp đoàn viên mới kèm danh sách chuẩn y.\n` +
        `5. **Tổ chức Lễ kết nạp Đoàn viên mới:** Tiến hành trang trọng dưới cờ Tổ quốc, cờ Đoàn và chân dung Bác Hồ; trao Huy hiệu Đoàn, Thẻ đoàn viên và Sổ đoàn.\n\n` +
        `*💡 Lưu ý: Sau khi kết nạp, cán bộ Đoàn cập nhật hồ sơ đoàn viên lên ứng dụng "Thanh niên Việt Nam" và phần mềm Quản lý đoàn viên (YUM).*`;
    }

    if (q.includes('chuyển sinh hoạt') || q.includes('chuyen sinh hoat') || q.includes('sổ đoàn') || q.includes('so doan') || q.includes('đoàn phí') || q.includes('app thanh niên') || q.includes('thanh niên việt nam')) {
      return `📱 **NGHIỆP VỤ QUẢN LÝ ĐOÀN VIÊN, SỔ ĐOÀN & CHUYỂN SINH HOẠT ĐOÀN:**\n\n` +
        `**1. Chuyển sinh hoạt Đoàn:**\n` +
        `- **Trường hợp:** Chuyển trường, tốt nghiệp THPT, đi học đại học/nghề hoặc về nơi cư trú.\n` +
        `- **Quy trình số hóa:** Thực hiện qua ứng dụng **Thanh niên Việt Nam**:\n` +
        `  + Bước 1: Đoàn viên mở app "Thanh niên Việt Nam" -> Chọn mục *Chuyển sinh hoạt Đoàn* -> Tìm kiếm Chi đoàn / Đoàn cơ sở nơi đến.\n` +
        `  + Bước 2: BCH Đoàn trường duyệt chuyển đi trên phần mềm Quản lý đoàn viên (YUM).\n` +
        `  + Bước 3: Đoàn trường nơi đến kiểm tra và tiếp nhận vào hệ thống.\n` +
        `- **Hồ sơ giấy:** Đoàn viên rút Sổ đoàn (có xác nhận nhận xét, đóng dấu của BCH Đoàn trường) và nộp cho đơn vị mới trong vòng 3 tháng.\n\n` +
        `**2. Chế độ Đoàn phí:**\n` +
        `- Mức đóng: **2.000 VNĐ / đoàn viên / tháng** đối với học sinh THPT, sinh viên.\n` +
        `- Trích nộp: Chi đoàn trích giữ lại 30% để hoạt động, nộp lên Đoàn trường 70% theo quy định Hướng dẫn thực hiện Điều lệ Đoàn.`;
    }

    if (q.includes('kiểm tra') || q.includes('giám sát') || q.includes('kỷ luật đoàn') || q.includes('khen thưởng')) {
      return `⚖️ **CÔNG TÁC KIỂM TRA, GIÁM SÁT & KHEN THƯỞNG, KỶ LUẬT ĐOÀN:**\n\n` +
        `**1. Hình thức Kỷ luật trong Đoàn (Điều lệ Đoàn khóa XII):**\n` +
        `- Đối với đoàn viên: **Khiển trách**, **Cảnh cáo**, **Khai trừ**.\n` +
        `- Đối với cán bộ Đoàn: Khiển trách, Cảnh cáo, **Cách chức**, Khai trừ.\n` +
        `- Đối với tổ chức Đoàn: Khiển trách, Cảnh cáo, Giải thể.\n` +
        `- *Thẩm quyền:* Chi đoàn họp biểu quyết kỷ luật khiển trách/cảnh cáo; Đoàn trường chuẩn y. Khai trừ do Đoàn cấp cơ sở trở lên quyết định.\n\n` +
        `**2. Hệ thống Khen thưởng của Đoàn:**\n` +
        `- Kỷ niệm chương *"Vì thế hệ trẻ"* (Phần thưởng cao quý nhất của Trung ương Đoàn).\n` +
        `- Bằng khen BCH Trung ương Đoàn, Bằng khen Tỉnh đoàn.\n` +
        `- Giấy khen Huyện đoàn, Giấy khen BCH Đoàn trường THPT Quang Trung.`;
    }

    if (q.includes('6 bài') || q.includes('lý luận chính trị') || q.includes('llct')) {
      return `📚 **6 BÀI HỌC LÝ LUẬN CHÍNH TRỊ DÀNH CHO ĐOÀN VIÊN MỚI:**\n\n` +
        `1. **Bài 1:** Chủ nghĩa Mác - Lênin, tư tưởng Hồ Chí Minh và con đường đi lên chủ nghĩa xã hội ở Việt Nam.\n` +
        `2. **Bài 2:** Đảng Cộng sản Việt Nam - Người tổ chức, lãnh đạo mọi thắng lợi của cách mạng Việt Nam.\n` +
        `3. **Bài 3:** Hệ thống chính trị ở Việt Nam hiện nay.\n` +
        `4. **Bài 4:** Đoàn TNCS Hồ Chí Minh - Đội dự bị tin cậy của Đảng, trường học xã hội chủ nghĩa của thanh niên.\n` +
        `5. **Bài 5:** Đoàn viên phấn đấu trở thành lực lượng xung kích cách mạng, công dân gương mẫu.\n` +
        `6. **Bài 6:** Thanh niên Việt Nam trong thời kỳ đẩy mạnh công nghiệp hóa, hiện đại hóa đất nước và hội nhập quốc tế.\n\n` +
        `*Hình thức học: Tọa đàm, xem video bài giảng trên app Thanh niên Việt Nam, làm bài kiểm tra trắc nghiệm số.*`;
    }

    // 2. TỔ CHỨC PHONG TRÀO & SỰ KIỆN THANH THIẾU NHI
    if (q.includes('đại hội chi đoàn') || q.includes('kịch bản đại hội') || q.includes('kich ban dai hoi')) {
      return `🗳️ **KỊCH BẢN ĐẠI HỘI CHI ĐOÀN NHIỆM KỲ MỚI (CHUẨN NGHI THỨC):**\n\n` +
        `**I. PHẦN NGHI LỄ:**\n` +
        `1. Chào cờ: Hát Quốc ca và Đoàn ca (*"Thanh niên làm theo lời Bác"*).\n` +
        `2. Tuyên bố lý do, giới thiệu đại biểu (Đại diện Cấp ủy/GVCN, Đại diện BCH Đoàn trường).\n` +
        `3. Bầu Đoàn Chủ tịch (thường 03 đồng chí) và Thư ký Đại hội (01-02 đồng chí).\n\n` +
        `**II. PHẦN NỘI DUNG:**\n` +
        `4. Báo cáo tổng kết công tác Đoàn nhiệm kỳ qua & Phương hướng nhiệm kỳ mới.\n` +
        `5. Báo cáo kiểm điểm Ban Chấp hành Chi đoàn nhiệm kỳ cũ.\n` +
        `6. Thảo luận, đóng góp ý kiến văn kiện (các tham luận: Học tập, Nề nếp, Phong trào tình nguyện).\n` +
        `7. Phát biểu chỉ đạo của GVCN và Đại diện Ban Thường vụ Đoàn trường.\n\n` +
        `**III. PHẦN BẦU CỬ:**\n` +
        `8. Thông qua Đề án nhân sự BCH Chi đoàn nhiệm kỳ mới.\n` +
        `9. Bầu Ban Kiểm phiếu -> Tiến hành bỏ phiếu kín -> Công bố kết quả kiểm phiếu.\n` +
        `10. Ban Chấp hành Chi đoàn mới ra mắt, nhận nhiệm vụ và hứa quyết tâm.\n\n` +
        `**IV. BẾ MẠC:**\n` +
        `11. Thông qua Nghị quyết Đại hội (biểu quyết 100%).\n` +
        `12. Chào cờ bế mạc (không hát Quốc ca, Đoàn ca, chỉ nghiêm chào cờ).`;
    }

    if (q.includes('kịch bản kết nạp') || q.includes('lễ kết nạp đoàn') || q.includes('le ket nap')) {
      return `🎖️ **KỊCH BẢN CHƯƠNG TRÌNH LỄ KẾT NẠP ĐOÀN VIÊN MỚI:**\n\n` +
        `1. **Chào cờ:** Nghiêm trang, toàn thể hát Quốc ca và Đoàn ca.\n` +
        `2. **Tuyên bố lý do & Giới thiệu đại biểu:** Đại diện Cấp ủy, BGH, BCH Đoàn trường, GVCN.\n` +
        `3. **Báo cáo quá trình phấn đấu:** Bí thư Chi đoàn tóm tắt quá trình rèn luyện của các thanh niên ưu tú.\n` +
        `4. **Đọc Nghị quyết / Quyết định chuẩn y kết nạp:** Đại diện BCH Đoàn trường công bố Quyết định.\n` +
        `5. **Trao Huy hiệu Đoàn & Sổ đoàn:** Đại biểu gắn Huy hiệu Đoàn lên ngực áo trái và trao Sổ đoàn.\n` +
        `6. **Đoàn viên mới đọc Lời hứa:** Đại diện đoàn viên mới đọc lời hứa: *"Tuyệt đối trung thành với mục đích, lý tưởng của Đảng và của Đoàn... XIN HỨA!"* - Cả lớp đồng thanh hô *"Xin hứa!"*.\n` +
        `7. **Phát biểu giao nhiệm vụ:** Lời dặn dò của Bí thư Đoàn trường / Thầy Cô GVCN.\n` +
        `8. **Bế mạc:** Chào cờ bế mạc.`;
    }

    if (q.includes('tháng thanh niên') || q.includes('hoa phượng đỏ') || q.includes('chiến dịch') || q.includes('tình nguyện')) {
      return `🔥 **CÁC CHIẾN DỊCH PHONG TRÀO THANH NIÊN TÌNH NGUYỆN LỚN:**\n\n` +
        `1. **Tháng Thanh niên (Tháng 3 hàng năm):** Cao điểm thi đua chào mừng Ngày thành lập Đoàn 26/3 với các công trình thanh niên số, ngày Chủ nhật xanh, giải thể thao - văn nghệ.\n` +
        `2. **Chiến dịch tình nguyện Hoa phượng đỏ (Dành riêng cho ĐVTN THPT):**\n` +
        `   - Diễn ra từ tháng 6 đến tháng 8 hàng năm.\n` +
        `   - Nội dung chính: Đền ơn đáp nghĩa, chăm sóc nghĩa trang liệt sĩ, tiếp sức mùa thi tuyển sinh lớp 10, chuyển đổi số cộng đồng, trồng cây xanh.\n` +
        `3. **Chiến dịch Tiếp sức mùa thi:** Hỗ trợ thí sinh dự thi tốt nghiệp THPT và vào lớp 10 (phát nước suối, hướng dẫn sơ đồ thi, điều tiết giao thông).\n` +
        `4. **Chương trình Tình nguyện Mùa Đông & Xuân Tình nguyện:** Giúp đỡ học sinh vùng cao Đông Giang có hoàn cảnh khó khăn, áo ấm mùa đông.`;
    }

    // 3. CÔNG TÁC TUYÊN TRUYỀN & GIÁO DỤC
    if (q.includes('bài đăng') || q.includes('truyền thông') || q.includes('fanpage') || q.includes('mạng xã hội') || q.includes('caption')) {
      return `📢 **MẪU BÀI ĐĂNG TRUYỀN THÔNG FANPAGE ĐOÀN TRƯỜNG CHUẨN ĐẸP:**\n\n` +
        `\`\`\`text\n` +
        `🔥 [ĐOÀN TRƯỜNG THPT QUANG TRUNG] - KHÁT VỌNG CỐNG HIẾN, LẼ SỐNG THANH NIÊN 🇻🇳\n\n` +
        `"Đâu cần thanh niên có, việc gì khó có thanh niên!"\n\n` +
        `🌟 Hòa chung không khí sôi nổi của tuổi trẻ cả nước chào mừng kỷ niệm Ngày thành lập Đoàn TNCS Hồ Chí Minh (26/3), Đoàn trường THPT Quang Trung chính thức phát động đợt thi đua cao điểm:\n\n` +
        `🎯 CÁC CHỈ TIÊU HÀNH ĐỘNG:\n` +
        `1️⃣ 100% Chi đoàn đăng ký "Tuần học tốt - Giờ học kiểu mẫu", không có học sinh vi phạm đồng phục, đi muộn.\n` +
        `2️⃣ Thực hiện 15 công trình thanh niên "Lớp học xanh - Không gian số" tại 15 phòng học.\n` +
        `3️⃣ Tham gia cuộc thi trực tuyến tìm hiểu lịch sử Đảng quang vinh và truyền thống vẻ vang của Đoàn.\n\n` +
        `💬 Hãy cùng lan tỏa năng lượng tích cực của tuổi trẻ bằng những hành động thiết thực ngay hôm nay nhé các bạn đoàn viên!\n\n` +
        `-------------------------\n` +
        `📌 BAN CHẤP HÀNH ĐOÀN TRƯỜNG THPT QUANG TRUNG - ĐÔNG GIANG\n` +
        `#DoanTHPTQuangTrung #TuoiTreDongGiang #ThangThanhNien2026 #TuoiTreSangTao #AoXanhAI\n` +
        `\`\`\`\n\n` +
        `*💡 Mẹo: Luôn đính kèm ảnh chụp hoạt động sắc nét hoặc infographic tóm tắt để bài viết đạt tương tác cao nhất!*`;
    }

    // 4. KỸ NĂNG NGHIỆP VỤ CÁN BỘ ĐOÀN & VĂN BẢN
    if (q.includes('kế hoạch') || q.includes('ke hoach') || q.includes('tờ trình') || q.includes('to trinh') || q.includes('văn bản hành chính')) {
      return `📄 **THỂ THỨC VĂN BẢN HÀNH CHÍNH ĐOÀN CHUẨN TRUNG ƯƠNG ĐOÀN:**\n\n` +
        `\`\`\`text\n` +
        `ĐOÀN TNCS HỒ CHÍ MINH HUYỆN ĐÔNG GIANG\n` +
        `BCH ĐOÀN TRƯỜNG THPT QUANG TRUNG                      Đông Giang, ngày ... tháng ... năm 2026\n` +
        `         Số: ... - KH/ĐTN\n\n` +
        `                                              KẾ HOẠCH\n` +
        `                     Tổ chức các hoạt động Tháng Thanh niên năm 2026\n\n` +
        `I. MỤC ĐÍCH - YÊU CẦU:\n` +
        `1. Mục đích: Khơi dậy niềm tự hào về truyền thống Đoàn, phát huy tinh thần xung kích của tuổi trẻ.\n` +
        `2. Yêu cầu: Đảm bảo thiết thực, an toàn, tiết kiệm và lan tỏa sâu rộng trong 15 chi đoàn.\n\n` +
        `II. THỜI GIAN - ĐỊA ĐIỂM:\n` +
        `- Thời gian: Từ ngày 01/3/2026 đến hết ngày 31/3/2026.\n` +
        `- Địa điểm: Trường THPT Quang Trung và các địa chỉ đỏ trên địa bàn huyện.\n\n` +
        `III. NỘI DUNG HOẠT ĐỘNG TRỌNG TÂM:\n` +
        `1. Công tác tuyên truyền, giáo dục chính trị tư tưởng.\n` +
        `2. Phong trào thi đua dạy tốt - học tốt, nề nếp kỷ cương.\n` +
        `3. Các hoạt động tình nguyện vì cộng đồng và văn hóa - thể thao.\n\n` +
        `IV. TỔ CHỨC THỰC HIỆN:\n` +
        `- Ban Chấp hành Đoàn trường chịu trách nhiệm chỉ đạo chung.\n` +
        `- Ban Chấp hành 15 Chi đoàn cụ thể hóa thành chương trình hành động chi tiết.\n\n` +
        `Nơi nhận:                                                      TM. BAN CHẤP HÀNH\n` +
        `- Cấp ủy, BGH (để báo cáo);                                          BÍ THƯ\n` +
        `- Huyện đoàn Đông Giang (để báo cáo);                               (Ký, đóng dấu)\n` +
        `- 15 Chi đoàn (để thực hiện);\n` +
        `- Lưu VP Đoàn.\n` +
        `\`\`\``;
    }

    if (q.includes('trò chơi') || q.includes('teambuilding') || q.includes('dân vũ') || q.includes('đoàn ca')) {
      return `🎉 **KHO KỸ NĂNG SINH HOẠT TẬP THỂ, TRÒ CHƠI & BÀI HÁT ĐOÀN:**\n\n` +
        `**1. Bài ca chính thức của Đoàn (Đoàn ca):**\n` +
        `- Tên bài hát: *"Thanh niên làm theo lời Bác"* (Sáng tác: Nhạc sĩ Hoàng Hà).\n` +
        `- Lời mở đầu: *"Kết liên lại thanh niên chúng ta cùng nhau đi lên, giơ nắm tay thề, gìn giữ hòa bình độc lập tự do..."*\n` +
        `- Lời kết: *"Không có việc gì khó, chỉ sợ lòng không bền, đào núi và lấp biển, quyết chí ắt làm nên!"*\n\n` +
        `**2. Gợi ý 3 trò chơi Teambuilding vòng tròn khởi động:**\n` +
        `- **Trò chơi 1: "Tôi là ai - Bạn là ai":** Người chơi đứng thành vòng tròn, quản trò hô tên và hành động phản xạ nhanh.\n` +
        `- **Trò chơi 2: "Bão thổi":** Quản trò hô *"Bão thổi, bão thổi!"* - Người chơi hỏi *"Thổi ai, thổi ai?"* -> Dùng để đổi chỗ và tạo tiếng cười.\n` +
        `- **Trò chơi 3: "Bắn tên kết nối":** Tạo tinh thần đồng đội và kiểm tra trí nhớ tên các thành viên trong chi đoàn.`;
    }

    // 5. ĐỒNG HÀNH VỚI THANH NIÊN
    if (q.includes('học sinh 3 tốt') || q.includes('hoc sinh 3 tot') || q.includes('danh hiệu')) {
      return `🌟 **TIÊU CHUẨN XÉT DANH HIỆU "HỌC SINH 3 TỐT" (DÀNH CHO HỌC SINH THPT):**\n\n` +
        `Danh hiệu cao quý do Ban Chấp hành Trung ương Đoàn TNCS Hồ Chí Minh ban hành gồm 3 tiêu chí lớn:\n\n` +
        `1. **ĐẠO ĐỨC TỐT:**\n` +
        `- Hạnh kiểm cả năm đạt loại **Tốt**.\n` +
        `- Không vi phạm bất kỳ tiêu chí nào trong 27 tiêu chí nề nếp thi đua của Đoàn trường.\n` +
        `- Tích cực tham gia các phong trào tình nguyện, đền ơn đáp nghĩa, bảo vệ môi trường.\n\n` +
        `2. **HỌC TẬP TỐT:**\n` +
        `- Học lực cả năm đạt loại **Tốt** (hoặc Giỏi theo quy chế đánh giá hiện hành).\n` +
        `- Đạt giải trong các kỳ thi học sinh giỏi, khoa học kỹ thuật hoặc ngày hội STEM cấp trường trở lên.\n` +
        `- Là hạt nhân trong phong trào "Đôi bạn cùng tiến" giúp đỡ bạn bè học tập.\n\n` +
        `3. **THỂ LỰC TỐT:**\n` +
        `- Đạt danh hiệu "Thanh niên khỏe" hoặc đạt tiêu chuẩn rèn luyện thể lực theo quy định.\n` +
        `- Tham gia các giải thể thao cấp trường (Bóng đá, bóng chuyền, điền kinh, cầu lông...).`;
    }

    if (q.includes('khởi nghiệp') || q.includes('lập nghiệp') || q.includes('vay vốn') || q.includes('nghề nghiệp')) {
      return `🚀 **TƯ VẤN KHỞI NGHIỆP, NGUỒN VỐN VAY ƯU ĐÃI & HƯỚNG NGHIỆP CHO THANH NIÊN:**\n\n` +
        `**1. Vốn vay ưu đãi cho thanh niên qua kênh của Đoàn:**\n` +
        `- **Ngân hàng Chính sách xã hội (NHCSXH):** Kênh ủy thác của Đoàn thanh niên hỗ trợ thanh niên vay vốn giải quyết việc làm, phát triển kinh tế gia đình với lãi suất ưu đãi.\n` +
        `- **Quỹ Quốc gia về việc làm (Nguồn vốn 120 của Trung ương Đoàn):** Hỗ trợ dự án thanh niên khởi nghiệp sáng tạo, mô hình OCOP thanh niên Đông Giang.\n\n` +
        `**2. Hướng nghiệp cho học sinh THPT:**\n` +
        `- Áp dụng mô hình trắc nghiệm tính cách Holland để định vị sở thích và năng lực.\n` +
        `- Lựa chọn tổ hợp môn học và ngành nghề phù hợp với xu thế thị trường lao động (Chuyển đổi số, Công nghệ thông tin, Nông nghiệp công nghệ cao, Y dược, Sư phạm).`;
    }

    // 6. THI ĐUA NỀ NẾP & ĐIỂM SỐ THPT QUANG TRUNG
    if (q.includes('điểm') || q.includes('xếp hạng') || q.includes('hạng') || q.includes('vị thứ') || q.includes('nhất') || q.includes('thi đua')) {
      if (q.includes('tuần 1') || q.includes('tuan 1')) {
        return `📊 **KẾT QUẢ THI ĐUA TUẦN 1 - THPT QUANG TRUNG:**\n\n` +
          `- 🥇 **Hạng 1:** Lớp 10/5 (1440/1440 điểm - Không vi phạm)\n` +
          `- 🥈 **Hạng 2:** Lớp 11/1 (1438 điểm)\n` +
          `- 🥉 **Hạng 3:** Lớp 12/1 (1431 điểm)\n` +
          `- **Hạng 4:** Lớp 11/5 (1429 điểm) | **Hạng 5:** Lớp 11/3 (1423 điểm)\n` +
          `- **Xếp cuối (Hạng 15):** Lớp 11/2 (1381 điểm - 24 lượt vắng không phép)\n\n` +
          `*💡 Định mức chuẩn thi đua là 1440 điểm/tuần (240đ/ngày từ T2 đến T7).*`;
      }
      if (q.includes('tuần 2') || q.includes('tuan 2')) {
        return `📊 **KẾT QUẢ THI ĐUA TUẦN 2 - THPT QUANG TRUNG:**\n\n` +
          `- 🥇 **Hạng 1:** Lớp 10/5 (1439/1440 điểm)\n` +
          `- 🥈 **Hạng 2:** Lớp 11/1 (1438 điểm)\n` +
          `- 🥉 **Hạng 3:** Lớp 12/3 (1436 điểm)\n` +
          `- **Hạng 4 (Đồng hạng):** Lớp 12/1 và Lớp 12/4 (1429 điểm)\n` +
          `- **Xếp cuối (Hạng 15):** Lớp 10/6 (1388 điểm)\n\n` +
          `*Tổng số lượt vi phạm toàn trường trong tuần 2: 100 biên bản.*`;
      }
      if (q.includes('tuần 3') || q.includes('tuan 3')) {
        return `📊 **KẾT QUẢ THI ĐUA TUẦN 3 - THPT QUANG TRUNG:**\n\n` +
          `- 🥇 **Đồng Hạng 1:** Lớp 10/5 và Lớp 11/1 (1435 điểm)\n` +
          `- 🥉 **Hạng 3:** Lớp 12/4 (1427 điểm)\n` +
          `- **Hạng 4:** Lớp 12/1 (1426 điểm) | **Hạng 5:** Lớp 10/2 (1421 điểm)\n` +
          `- **Xếp cuối (Hạng 15):** Lớp 10/6 (1337 điểm - Trừ kịch sàn 60đ chuyên cần do 45 lượt vắng không phép)\n\n` +
          `*Biên bản chính thức đã khóa sổ thi đua.*`;
      }
      if (q.includes('tuần 4') || q.includes('tuan 4')) {
        return `📊 **KẾT QUẢ THI ĐUA TUẦN 4 - THPT QUANG TRUNG:**\n\n` +
          `- 🥇 **Hạng 1:** Lớp 11/1 (1438/1440 điểm - Dẫn đầu toàn trường)\n` +
          `- 🥈 **Hạng 2:** Lớp 12/3 (1437 điểm)\n` +
          `- 🥉 **Đồng Hạng 3:** Lớp 10/5 và Lớp 12/1 (1432 điểm)\n` +
          `- **Hạng 5:** Lớp 12/4 (1431 điểm)\n` +
          `- **Xếp cuối (Hạng 15):** Lớp 10/3 (1378 điểm)\n\n` +
          `*Biên bản chính thức đã khóa sổ thi đua.*`;
      }

      // Xếp hạng tuần hiện tại nếu có trong context
      if (ctx?.weeklyScores && ctx.weeklyScores.length > 0) {
        const top3 = ctx.weeklyScores.slice(0, 3);
        return `📊 **TOP ĐẦU THI ĐUA TUẦN HIỆN TẠI (TUẦN ${ctx.activeWeek || 'gần nhất'}):**\n\n` +
          top3.map((s, idx) => `${idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉'} **Hạng ${s.rank}:** ${s.className} (${s.finalScore}/1440 điểm)`).join('\n') +
          `\n\nBạn có thể vào tab **Bảng Thi Đua** trên hệ thống để xem chi tiết đầy đủ 15 lớp nhé!`;
      }
    }

    if (q.includes('quy chế') || q.includes('tiêu chí') || q.includes('trừ điểm') || q.includes('đi muộn') || q.includes('đồng phục') || q.includes('trực nhật')) {
      return `⚖️ **QUY CHẾ CHẤM ĐIỂM NỀ NẾP THI ĐUA (27 TIÊU CHÍ - CHUẨN 1440 ĐIỂM):**\n\n` +
        `| Tiêu chí | Mức trừ | Ghi chú |\n` +
        `| :--- | :---: | :--- |\n` +
        `| **1.1 Vào lớp muộn 5p** | **-1 điểm/lượt** | Tính cả đầu giờ & chuyển tiết |\n` +
        `| **1.2 Vắng có phép** | **-1 điểm/buổi** | Phải có chữ ký GVCN |\n` +
        `| **1.3 Vắng không phép** | **-2 điểm/buổi** | Tối đa trừ sàn 60đ của tiêu chuẩn |\n` +
        `| **1.4 Bỏ tiết** | **-2 điểm/tiết** | Tính cả tiết chào cờ |\n` +
        `| **2.1 Không trực nhật** | **-5 điểm/buổi** | Đội Cờ đỏ chụp minh chứng |\n` +
        `| **2.2 Trực nhật bẩn/trễ** | **-2 điểm/lượt** | Chưa đổ rác, bàn ghế xô lệch |\n` +
        `| **3.1 Ồn ào 5p đầu giờ** | **-5 điểm/lượt** | Đi lại tự do trên hành lang |\n` +
        `| **3.7 Sử dụng ĐT sai quy định** | **-5 điểm/lượt** | Tịch thu nộp Đoàn trường |\n` +
        `| **4.1 Sai đồng phục, tác phong** | **-2 điểm/lượt** | Quên phù hiệu, giày dép sai |\n` +
        `| **4.4 Hút thuốc lá** | **-5 điểm/lượt** | Lập biên bản mời phụ huynh |\n` +
        `| **4.6 Đánh nhau, gây gổ** | **-10 điểm/lượt** | Hạ hạnh kiểm tháng |\n` +
        `| **5.1 Tiết Khá** | **-1 điểm/tiết** | Theo sổ đầu bài |\n` +
        `| **5.2 Tiết Trung bình** | **-3 điểm/tiết** | Theo sổ đầu bài |\n` +
        `| **5.3 Tiết Yếu** | **-5 điểm/tiết** | Theo sổ đầu bài |\n\n` +
        `*Điểm chuẩn mỗi tuần là 1440 điểm (240đ/ngày). Tiêu chí điểm cộng: Giờ học tốt (+5đ), nhặt được của rơi (+5đ đến +10đ).*`;
    }

    if (q.includes('biên bản') || q.includes('sinh hoạt chi đoàn') || q.includes('hop chi doan')) {
      return `📝 **MẪU BIÊN BẢN HỌP CHI ĐOÀN ĐỊNH KỲ:**\n\n` +
        `\`\`\`text\n` +
        `ĐOÀN TNCS HỒ CHÍ MINH\n` +
        `CHI ĐOÀN: [Tên Chi đoàn, ví dụ: 11/1]\n` +
        `---***---\n\n` +
        `BIÊN BẢN HỌP CHI ĐOÀN THÁNG .../2026\n\n` +
        `I. THỜI GIAN - ĐỊA ĐIỂM:\n` +
        `- Thời gian: ... giờ ... ngày ... tháng ... năm 2026\n` +
        `- Địa điểm: Phòng học lớp ...\n` +
        `- Chủ tọa: Đồng chí ... (Bí thư Chi đoàn)\n` +
        `- Thư ký: Đồng chí ... (Ủy viên BCH)\n` +
        `- Sĩ số đoàn viên có mặt: ... / ... (Vắng: ... đoàn viên)\n\n` +
        `II. NỘI DUNG CUỘC HỌP:\n` +
        `1. Đánh giá nề nếp thi đua và học tập trong tháng qua:\n` +
        `   - Về học tập: Tổng số tiết Tốt: ..., số tiết TB/Yếu: ...\n` +
        `   - Về nề nếp: Các tồn tại về đồng phục, đi muộn, chuyên cần.\n` +
        `2. Triển khai kế hoạch tháng tới của Đoàn trường:\n` +
        `   - Phát động phong trào thi đua chào mừng 26/3 / Hoa điểm 10.\n` +
        `   - Phân công đoàn viên phụ trách công trình thanh niên của lớp.\n` +
        `3. Thu đoàn phí và bình xét đoàn viên tiêu biểu trong tháng.\n\n` +
        `III. BIỂU QUYẾT & Ý KIẾN:\n` +
        `- 100% đoàn viên nhất trí với nghị quyết cuộc họp.\n` +
        `Cuộc họp kết thúc vào lúc ... giờ cùng ngày.\n\n` +
        `THƯ KÝ                                           CHỦ TỌA\n` +
        `(Ký, ghi rõ họ tên)                      (Ký, ghi rõ họ tên)\n` +
        `\`\`\`\n\n` +
        `*Bạn có thể sao chép mẫu trên để sử dụng ngay cho buổi sinh hoạt chi đoàn lớp mình!*`;
    }

    if (q.includes('kiểm điểm') || q.includes('tu kiem diem') || q.includes('vi phạm')) {
      return `📄 **MẪU BẢN TỰ KIỂM ĐIỂM HỌC SINH VI PHẠM NỀ NẾP:**\n\n` +
        `\`\`\`text\n` +
        `CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM\n` +
        `Độc lập - Tự do - Hạnh phúc\n` +
        `------------------------\n\n` +
        `BẢN TỰ KIỂM ĐIỂM\n\n` +
        `Kính gửi:\n` +
        `- Ban Giám hiệu Trường THPT Quang Trung;\n` +
        `- Ban Chấp hành Đoàn trường THPT Quang Trung;\n` +
        `- Thầy/Cô Giáo viên chủ nhiệm lớp ...\n\n` +
        `Em tên là: ....................................... Lớp: ...........\n` +
        `Nội dung vi phạm: Vào ngày .../.../2026, em đã có hành vi vi phạm:\n` +
        `....................................................................\n` +
        `(Gây ảnh hưởng đến điểm thi đua chung của tập thể chi đoàn).\n\n` +
        `Lý do vi phạm: .....................................................\n` +
        `Nhận thức của bản thân: Em nhận thấy hành vi trên là sai trái, vi phạm nội quy nhà trường và quy chế thi đua của Đoàn trường.\n\n` +
        `Lời hứa: Em xin hứa từ nay sẽ chấp hành nghiêm túc mọi nội quy, không tái phạm và tích cực phấn đấu trong học tập, rèn luyện.\n\n` +
        `                                 Đông Giang, ngày ... tháng ... năm 2026\n` +
        `Ý KIẾN PHỤ HUYNH                 Ý KIẾN GVCN                 NGƯỜI LÀM ĐƠN\n` +
        `(Ký, ghi rõ họ tên)           (Ký, ghi rõ họ tên)         (Ký, ghi rõ họ tên)\n` +
        `\`\`\`\n\n` +
        `*Mẫu chuẩn theo quy định của Đoàn trường THPT Quang Trung.*`;
    }

    // 7. MẶC ĐỊNH: TỔNG QUAN 5 LĨNH VỰC CHUYÊN MÔN
    const hasKey = Boolean(this.getApiKey());
    return `Chào đồng chí! Tôi là **Trợ lý Chuyên trách Công tác Đoàn TNCS Hồ Chí Minh & Phong trào Thanh thiếu nhi (Áo Xanh AI - Cẩm Nang Số)** 🇻🇳.\n\n` +
      `Tôi sẵn sàng hỗ trợ đồng chí và các bạn đoàn viên trên cả 5 lĩnh vực chuyên môn lớn:\n\n` +
      `1. 🏛️ **Công tác Xây dựng Đoàn & Điều lệ:** Quy trình 5 bước kết nạp đoàn viên mới, chuyển sinh hoạt Đoàn qua App Thanh niên Việt Nam, quản lý sổ Đoàn, Đoàn phí (2.000đ/tháng), 6 bài học LLCT, quy trình kiểm tra - giám sát và khen thưởng - kỷ luật Đoàn.\n` +
      `2. 🔥 **Tổ chức Phong trào & Sự kiện:** Thiết kế kế hoạch và kịch bản Đại hội Chi đoàn, Đại hội Đoàn trường, Lễ kỷ niệm 26/3, Chiến dịch Hoa phượng đỏ, Tiếp sức mùa thi, Ngày Chủ nhật xanh.\n` +
      `3. 📢 **Tuyên truyền & Giáo dục:** Xây dựng kế hoạch giáo dục lý tưởng cách mạng, đạo đức lối sống (Chỉ thị 42-CT/TW), biên tập nội dung bài đăng mạng xã hội/Fanpage truyền cảm hứng, sinh hoạt chính trị.\n` +
      `4. 📝 **Kỹ năng Cán bộ Đoàn & Soạn thảo văn bản:** Soạn thảo thể thức văn bản hành chính Đoàn (Kế hoạch, Báo cáo, Tờ trình, Quyết định, Biên bản), kỹ năng dẫn chương trình (MC), điều hành sinh hoạt chi đoàn, kho trò chơi Teambuilding, bài ca chính thức của Đoàn.\n` +
      `5. 🚀 **Đồng hành với Thanh niên:** Tiêu chuẩn danh hiệu "Học sinh 3 tốt", tư vấn hướng nghiệp, tiếp cận nguồn vốn ưu đãi NHCSXH (Kênh Trung ương Đoàn 120), rèn luyện kỹ năng mềm.\n` +
      `6. 📊 **Thi đua nề nếp THPT Quang Trung:** Tra cứu xếp hạng 15 lớp các tuần 1 - 4 và quy chế 27 tiêu chí nề nếp (1440 điểm chuẩn).\n\n` +
      (hasKey
        ? `🌐 *Hệ thống đang kích hoạt Google Search Grounding & Gemini AI, tự động cập nhật mọi tin tức và văn bản mới nhất từ Internet!*`
        : `💡 *Bạn có thể bấm biểu tượng ⚙️ (Cài đặt) ở thanh trên để nhập Google Gemini API Key miễn phí, kích hoạt trí tuệ nhân tạo toàn diện và tìm kiếm trực tuyến theo thời gian thực!*`);
  }
};
