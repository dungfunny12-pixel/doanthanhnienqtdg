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
const DEFAULT_MODEL = 'gemini-1.5-flash';

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
   * Tạo System Instruction chi tiết về công tác Đoàn THPT Quang Trung & Quy tắc xác thực
   */
  buildSystemInstruction(ctx?: AssistantContextData): string {
    let contextAddition = '';

    if (ctx) {
      if (ctx.activeWeek) {
        contextAddition += `\n- Tuần thi đua đang diễn ra trên hệ thống: Tuần ${ctx.activeWeek}.`;
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

    return `Bạn là "Trợ lý Ảo Đoàn Thanh Niên" (tên thân mật: Áo Xanh AI) của Trường THPT Quang Trung - Đông Giang.
Bạn đại diện cho Ban Chấp hành Đoàn trường THPT Quang Trung hỗ trợ đoàn viên, thanh niên, giáo viên chủ nhiệm, cán bộ Đội Cờ Đỏ và học sinh.

### TÁC PHONG VÀ VĂN PHONG:
- Lịch sự, nhiệt huyết, chuẩn mực, xung kích của thanh niên ("Đâu cần thanh niên có, đâu khó có thanh niên").
- Xưng "tôi" hoặc "mình" và gọi người dùng là "đồng chí", "bạn", hoặc "thầy/cô" tùy ngữ cảnh.
- Trả lời rõ ràng, có cấu trúc markdown chuẩn đẹp (in đậm, danh sách gạch đầu dòng, bảng biểu khi cần).

### TÍNH NĂNG TÌM KIẾM INTERNET TRỰC TIẾP:
- Khi người dùng hỏi về các sự kiện thanh niên toàn quốc, ngày truyền thống, tin tức thời sự, các văn bản quy phạm pháp luật mới của Nhà nước hoặc Trung ương Đoàn, bạn có khả năng tra cứu Google Search theo thời gian thực để mang lại thông tin mới nhất và chính xác nhất.
- Nêu rõ nguồn tin và thời điểm nếu có liên quan đến tin tức Internet mới.

### QUY TẮC BẮT BUỘC VỀ TÍNH XÁC THỰC (AI DISCLAIMER):
- Mọi thông tin do AI tổng hợp phải có tinh thần khách quan, xây dựng.
- Với điểm số, thứ hạng và nề nếp của trường THPT Quang Trung: chỉ dựa vào dữ liệu hệ thống được cung cấp. Không tự bịa đặt hay suy diễn sai lệch.
- Cuối mỗi phản hồi, luôn nhắc nhở người dùng: Thông tin có tính chất tham khảo, hãy đối chiếu với văn bản chính thức của Đoàn trường và BGH khi cần thực hiện các quyết định kỷ luật hoặc công nhận thành tích.

### TRI THỨC NGHIỆP VỤ ĐOÀN & NHÀ TRƯỜNG:
1. **Quy chế nề nếp thi đua (27 tiêu chí - Định mức chuẩn 1440 điểm/tuần)**:
   - Nhóm 1 (Chuyên cần): Đi muộn sinh hoạt đầu giờ (1.1: trừ 1đ), Vắng có phép (1.2: trừ 1đ), Vắng không phép (1.3: trừ 2đ/lượt, trần tối đa trừ 60đ của tiêu chuẩn tiêu chí), Bỏ tiết (1.4: trừ 2đ).
   - Nhóm 2 (Vệ sinh - Môi trường): Không trực nhật (2.1: trừ 5đ), Trực nhật trễ/bẩn (2.2: trừ 2đ), Thiếu khăn bàn/hoa (2.4: trừ 1đ).
   - Nhóm 3 (Trật tự - Kỷ luật): Ồn ào đầu giờ/hành lang (3.1: trừ 5đ), Mất trật tự chào cờ (3.2: trừ 2đ), Dùng điện thoại không phép (3.7: trừ 5đ).
   - Nhóm 4 (Tác phong - Đồng phục): Sai đồng phục (4.1: trừ 2đ), Đầu tóc sai quy định (4.2: trừ 2đ), Sơn móng/son môi/khuyên tai (4.3: trừ 5đ), Hút thuốc lá (4.4: trừ 5đ), Đánh nhau (4.6: trừ 10đ).
   - Nhóm 5 (Học tập): Tiết Khá (5.1: trừ 1đ), Tiết TB (5.2: trừ 3đ), Tiết Yếu (5.3: trừ 5đ).
   - Tiêu chí điểm cộng: Giờ học tốt, nhặt được của rơi trả lại, học sinh đạt giải phong trào.

2. **Nghiệp vụ công tác Đoàn viên**:
   - Điều kiện kết nạp: Thanh niên Việt Nam từ đủ 15 tuổi đến 30 tuổi, có lý lịch rõ ràng, tích cực học tập rèn luyện, tự nguyện xin vào Đoàn.
   - Quy trình kết nạp: Học lớp bồi dưỡng cảm tình Đoàn -> Viết đơn xin vào Đoàn -> Chi đoàn họp xét và biểu quyết (trên 1/2 đồng ý) -> Đoàn trường ra quyết định kết nạp -> Tổ chức Lễ kết nạp Đoàn viên mới trang trọng.
   - Sổ Đoàn & Thẻ Đoàn: Quản lý tập trung tại Đoàn trường, đoàn viên tốt nghiệp lớp 12 hoặc chuyển trường sẽ được rút và chuyển sinh hoạt Đoàn.
   - Đoàn phí: Thu định kỳ 2.000 VNĐ / đoàn viên / tháng.
   - 6 bài học lý luận chính trị dành cho đoàn viên mới.

3. **Kỹ năng soạn thảo văn bản hành chính Đoàn**:
   - Biên bản sinh hoạt Chi đoàn định kỳ hàng tháng.
   - Kế hoạch tổ chức hoạt động chào mừng Ngày thành lập Đoàn 26/3, Ngày Nhà giáo Việt Nam 20/11.
   - Mẫu bản tự kiểm điểm học sinh vi phạm kỷ luật/nề nếp.
   - Mẫu nghị quyết giới thiệu đoàn viên ưu tú cho Đảng xem xét kết nạp.

4. **Dữ liệu thực tế tại trường THPT Quang Trung**:${contextAddition}

Nếu không có dữ liệu số liệu trong hệ thống, hãy hướng dẫn người dùng theo Điều lệ Đoàn và quy chế nhà trường.`;
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
   * Bộ tri thức chuyên sâu nội bộ (Smart Rule Engine) hoạt động tức thời không cần API Key
   */
  getLocalKnowledgeResponse(query: string, ctx?: AssistantContextData): string {
    const q = query.toLowerCase().trim();

    // 1. Hỏi về điểm thi đua / xếp hạng các tuần
    if (q.includes('điểm') || q.includes('xếp hạng') || q.includes('hạng') || q.includes('vị thứ') || q.includes('nhất')) {
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
          `- 🥇 **Hạng 1:** Lớp 11/1 (1438/1440 điểm - Vươn lên dẫn đầu toàn trường)\n` +
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
          `\n\nBạn có thể vào tab **Bảng Thi Đua** để xem chi tiết đầy đủ 15 lớp nhé!`;
      }
    }

    // 2. Quy trình kết nạp Đoàn viên mới
    if (q.includes('kết nạp') || q.includes('ket nap') || q.includes('vào đoàn') || q.includes('vao doan')) {
      return `🇻🇳 **QUY TRÌNH KẾT NẠP ĐOÀN VIÊN MỚI (ĐOÀN TRƯỜNG THPT QUANG TRUNG):**\n\n` +
        `**1. Điều kiện xem xét:**\n` +
        `- Độ tuổi: Từ đủ 15 tuổi đến 30 tuổi.\n` +
        `- Hạnh kiểm: Đạt loại Khá hoặc Tốt; có tinh thần rèn luyện và tiến bộ.\n` +
        `- Có ý thức tự giác, tự nguyện làm đơn gia nhập Đoàn TNCS Hồ Chí Minh.\n\n` +
        `**2. Các bước tiến hành:**\n` +
        `1. **Học bồi dưỡng cảm tình Đoàn:** Tham gia lớp học do BCH Đoàn trường tổ chức (học về truyền thống Đoàn, Điều lệ Đoàn và 6 bài lý luận chính trị).\n` +
        `2. **Viết Đơn xin vào Đoàn & Lý lịch đoàn viên:** Học sinh hoàn thiện đơn và nộp cho Ban chấp hành Chi đoàn.\n` +
        `3. **Họp Chi đoàn xem xét:** Chi đoàn tiến hành họp, biểu quyết giới thiệu (cần quá nửa số đoàn viên trong chi đoàn tán thành).\n` +
        `4. **BCH Đoàn trường ra Quyết định:** Đoàn trường xem xét hồ sơ và chuẩn y kết nạp.\n` +
        `5. **Lễ kết nạp Đoàn viên mới:** Tổ chức trang trọng dưới cờ hoặc tại phòng truyền thống, trao Huy hiệu Đoàn và Thẻ đoàn viên.`;
    }

    // 3. Quy chế trừ điểm / tiêu chí nề nếp
    if (q.includes('quy chế') || q.includes('tiêu chí') || q.includes('trừ điểm') || q.includes('đi muộn') || q.includes('đồng phục') || q.includes('trực nhật')) {
      return `⚖️ **TRÍCH LƯỢC QUY CHẾ CHẤM ĐIỂM NỀ NẾP THI ĐUA (27 TIÊU CHÍ):**\n\n` +
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

    // 4. Mẫu biên bản họp chi đoàn
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

    // 5. Mẫu bản kiểm điểm học sinh
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

    // 6. Mặc định: Giới thiệu năng lực trợ lý và hướng dẫn kết nối Gemini
    const hasKey = Boolean(this.getApiKey());
    return `Chào đồng chí! Tôi là **Trợ lý Ảo Đoàn Thanh Niên - THPT Quang Trung (Áo Xanh AI)** 🇻🇳.\n\n` +
      `Tôi có thể hỗ trợ bạn mọi vấn đề liên quan đến công tác Đoàn và nề nếp nhà trường:\n` +
      `- 📊 **Tra cứu điểm thi đua & vị thứ:** Hỏi "Điểm thi đua Tuần 1 / 2 / 3 / 4", "Lớp nào đứng đầu?"...\n` +
      `- ⚖️ **Quy chế 27 tiêu chí:** Hỏi "Đi muộn trừ mấy điểm?", "Lớp không trực nhật xử lý thế nào?"...\n` +
      `- 🇻🇳 **Nghiệp vụ Đoàn:** Hướng dẫn kết nạp Đoàn viên, sổ đoàn, đoàn phí (2.000đ/tháng), 6 bài học LLCT.\n` +
      `- 📝 **Soạn thảo văn bản:** Soạn mẫu biên bản sinh hoạt chi đoàn, bản tự kiểm điểm, kế hoạch hoạt động phong trào.\n\n` +
      (hasKey 
        ? `✨ *Hệ thống đang kết nối trực tiếp với Google Gemini AI, bạn có thể thoải mái đặt bất kỳ câu hỏi sáng tạo nào!*` 
        : `💡 *Bạn có thể bấm nút ⚙️ (Cài đặt) ở góc trên để nhập Google Gemini API Key miễn phí, giúp tôi có khả năng đàm thoại tự nhiên và sáng tạo hơn nữa!*`);
  }
};
