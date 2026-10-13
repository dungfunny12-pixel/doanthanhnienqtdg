import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  X, 
  Maximize2, 
  Minimize2, 
  RotateCcw, 
  Settings, 
  Copy, 
  Check, 
  Sparkles, 
  Key, 
  ExternalLink,
  ChevronDown,
  Globe,
  ShieldAlert,
  AlertTriangle,
  BarChart3,
  Scale,
  Award,
  FileText,
  Search,
  CheckCircle2,
  Info,
  BookOpen,
  Flame,
  Megaphone,
  Compass,
  Rocket,
  Users2,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { 
  YouthAssistantService, 
  AssistantMessage, 
  AssistantContextData,
  AssistantSourceChunk 
} from '../../services/youthAssistantService';
import { RichTextViewer } from '../common/RichTextViewer';

export const YouthAssistantWidget: React.FC = () => {
  const { activeWeek, classes, criteria, getWeeklyScores } = useApp();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Danh mục chuyên môn đang chọn
  const [activeCategory, setActiveCategory] = useState<string>('all');

  // Settings & Internet Search state
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-flash');
  const [webSearchEnabled, setWebSearchEnabled] = useState<boolean>(true);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);

  // Chat messages
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Xin chào đồng chí! Tôi là **Trợ lý Chuyên trách Công tác Đoàn TNCS Hồ Chí Minh & Phong trào Thanh thiếu nhi** (*Áo Xanh AI - Cẩm Nang Số*) 🇻🇳.\n\nTôi am hiểu toàn diện về Điều lệ Đoàn, các văn bản chỉ đạo của Trung ương Đoàn và kỹ năng thực tiễn tại cơ sở, sẵn sàng hỗ trợ đồng chí về:\n\n1. 🏛️ **Công tác Xây dựng Đoàn & Điều lệ:** Quy trình 5 bước kết nạp đoàn viên mới, chuyển sinh hoạt Đoàn qua App *Thanh niên Việt Nam*, quản lý sổ Đoàn, Đoàn phí (2.000đ/tháng), 6 bài học LLCT, kiểm tra - giám sát và kỷ luật Đoàn.\n2. 🔥 **Tổ chức Phong trào & Sự kiện:** Kịch bản Đại hội Chi đoàn, Đại hội Đoàn trường, Tháng Thanh niên 26/3, Chiến dịch Hoa phượng đỏ, Tiếp sức mùa thi, Ngày Chủ nhật xanh.\n3. 📢 **Tuyên truyền & Giáo dục:** Kế hoạch giáo dục lý tưởng cách mạng (Chỉ thị 42-CT/TW), biên tập nội dung truyền thông Fanpage/mạng xã hội, bảo vệ nền tảng tư tưởng của Đảng.\n4. 📝 **Kỹ năng Cán bộ Đoàn & Biểu mẫu:** Soạn thảo thể thức văn bản Đoàn chuẩn (Kế hoạch, Tờ trình, Quyết định, Biên bản), kỹ năng dẫn chương trình (MC), điều hành sinh hoạt chi đoàn, kho trò chơi Teambuilding, bài ca chính thức của Đoàn.\n5. 🚀 **Đồng hành với Thanh niên:** Tiêu chuẩn xét chọn danh hiệu *"Học sinh 3 tốt"*, tư vấn hướng nghiệp, tiếp cận nguồn vốn vay ưu đãi NHCSXH (Kênh Trung ương Đoàn 120), rèn luyện kỹ năng mềm.\n6. 📊 **Thi đua nề nếp THPT Quang Trung:** Tra cứu xếp hạng 15 lớp các tuần 1 - 4 và quy chế 27 tiêu chí nề nếp (1440 điểm chuẩn).\n\n*Đồng chí cần hỗ trợ biểu mẫu, kịch bản chương trình hay giải đáp nghiệp vụ nào hôm nay?*`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isWebGrounded: false
    }
  ]);

  const chatBodyRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setApiKeyInput(YouthAssistantService.getApiKey());
    setSelectedModel(YouthAssistantService.getModel());
    setWebSearchEnabled(YouthAssistantService.getWebSearchEnabled());
  }, []);

  // Cuộn nội bộ an toàn bên trong container tin nhắn, KHÔNG dùng scrollIntoView làm trôi khung nhìn
  useEffect(() => {
    if (isOpen) {
      if (chatBodyRef.current) {
        chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
      }
      const timer = setTimeout(() => {
        if (chatBodyRef.current) {
          chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight;
        }
        inputRef.current?.focus({ preventScroll: true });
      }, 60);
      return () => clearTimeout(timer);
    }
  }, [isOpen, messages]);

  const hasApiKey = Boolean(apiKeyInput.trim() || YouthAssistantService.getApiKey());

  // Chuẩn bị context dữ liệu trực tiếp của trường một cách an toàn
  const getLiveContext = (): AssistantContextData => {
    let weeklyScoresData: any[] = [];
    try {
      if (typeof getWeeklyScores === 'function') {
        const scores = getWeeklyScores(activeWeek);
        if (Array.isArray(scores)) {
          weeklyScoresData = scores.map(s => ({
            classId: s.classId,
            className: s.className,
            finalScore: s.finalScore,
            rank: s.rank,
            totalDeduction: s.totalDeduction
          }));
        }
      }
    } catch {}

    return {
      activeWeek,
      classes: Array.isArray(classes) ? classes.map(c => ({
        id: c.id,
        name: c.name,
        gvcnName: c.gvcnName,
        totalStudents: c.totalStudents,
        unionMembers: c.unionMembers
      })) : [],
      criteria: Array.isArray(criteria) ? criteria.map(cr => ({
        code: cr.code,
        name: cr.name,
        points: cr.points,
        type: cr.type
      })) : [],
      weeklyScores: weeklyScoresData
    };
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: AssistantMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const liveContext = getLiveContext();
      const result = await YouthAssistantService.sendMessageToGemini(
        text,
        messages,
        liveContext,
        webSearchEnabled
      );

      const botMsg: AssistantMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: result.text,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        sources: result.sources,
        searchQueries: result.searchQueries,
        isWebGrounded: result.isWebGrounded
      };

      setMessages(prev => [...prev, botMsg]);
    } catch (err: any) {
      const errorMsg: AssistantMessage = {
        id: `err-${Date.now()}`,
        sender: 'assistant',
        text: `Đã có lỗi xảy ra: ${err.message || 'Không thể phản hồi'}. Vui lòng thử lại.`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'assistant',
        text: `Đã làm mới cuộc hội thoại. Tôi là **Trợ lý Chuyên trách Công tác Đoàn TNCS Hồ Chí Minh & Phong trào Thanh thiếu nhi**. Đồng chí cần hướng dẫn nghiệp vụ, soạn văn bản hay thiết kế phong trào nào?`,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const handleTestKey = async () => {
    setIsTestingKey(true);
    setTestResult(null);
    const res = await YouthAssistantService.testApiKey(apiKeyInput);
    setTestResult(res);
    setIsTestingKey(false);
  };

  const handleSaveSettings = () => {
    YouthAssistantService.saveApiKey(apiKeyInput);
    YouthAssistantService.saveModel(selectedModel);
    YouthAssistantService.saveWebSearchEnabled(webSearchEnabled);
    setShowSettings(false);
  };

  const toggleWebSearch = () => {
    const nextVal = !webSearchEnabled;
    setWebSearchEnabled(nextVal);
    YouthAssistantService.saveWebSearchEnabled(nextVal);
  };

  // 5 Danh mục chuyên môn chính
  const categories = [
    { id: 'all', label: 'Tất cả gợi ý', icon: <Compass className="w-3.5 h-3.5" /> },
    { id: 'build', label: 'Xây dựng Đoàn & Điều lệ', icon: <BookOpen className="w-3.5 h-3.5" /> },
    { id: 'movement', label: 'Phong trào & Sự kiện', icon: <Flame className="w-3.5 h-3.5" /> },
    { id: 'propaganda', label: 'Tuyên truyền & Giáo dục', icon: <Megaphone className="w-3.5 h-3.5" /> },
    { id: 'skills', label: 'Kỹ năng & Soạn văn bản', icon: <FileText className="w-3.5 h-3.5" /> },
    { id: 'support', label: 'Đồng hành & Khởi nghiệp', icon: <Rocket className="w-3.5 h-3.5" /> },
    { id: 'school', label: 'Thi đua THPT Quang Trung', icon: <BarChart3 className="w-3.5 h-3.5" /> }
  ];

  // Danh sách các câu hỏi gợi ý theo danh mục chuyên môn
  const promptList = [
    // Xây dựng Đoàn & Điều lệ
    { cat: 'build', label: 'Thủ tục kết nạp Đoàn viên mới', icon: <Award className="w-3.5 h-3.5 text-rose-400 shrink-0" />, prompt: 'Quy trình và điều kiện kết nạp Đoàn viên mới cho học sinh THPT chuẩn Điều lệ Đoàn khóa XII như thế nào?' },
    { cat: 'build', label: 'Chuyển sinh hoạt Đoàn & App Thanh niên', icon: <Compass className="w-3.5 h-3.5 text-cyan-400 shrink-0" />, prompt: 'Hướng dẫn quy trình chuyển sinh hoạt Đoàn trên ứng dụng Thanh niên Việt Nam và rút sổ Đoàn khi tốt nghiệp.' },
    { cat: 'build', label: 'Học tập 6 bài học LLCT', icon: <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />, prompt: 'Tóm tắt nội dung và ý nghĩa của 6 bài học lý luận chính trị dành cho đoàn viên mới.' },
    { cat: 'build', label: 'Quy chế Kỷ luật & Khen thưởng Đoàn', icon: <Scale className="w-3.5 h-3.5 text-purple-400 shrink-0" />, prompt: 'Các hình thức khen thưởng và kỷ luật đối với đoàn viên, cán bộ Đoàn theo Điều lệ Đoàn khóa XII.' },

    // Phong trào & Sự kiện
    { cat: 'movement', label: 'Kịch bản Đại hội Chi đoàn', icon: <Users2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />, prompt: 'Cho tôi mẫu kịch bản chi tiết điều hành Đại hội Chi đoàn nhiệm kỳ mới chuẩn nghi thức Đoàn.' },
    { cat: 'movement', label: 'Kịch bản Lễ kết nạp Đoàn viên', icon: <Award className="w-3.5 h-3.5 text-rose-400 shrink-0" />, prompt: 'Thiết kế kịch bản tổ chức Lễ kết nạp Đoàn viên mới trang trọng dưới cờ Tổ quốc và cờ Đoàn.' },
    { cat: 'movement', label: 'Kế hoạch Tháng Thanh niên 2026', icon: <Flame className="w-3.5 h-3.5 text-amber-400 shrink-0" />, prompt: 'Xây dựng kế hoạch tổ chức các hoạt động hưởng ứng Tháng Thanh niên và Ngày thành lập Đoàn 26/3.' },
    { cat: 'movement', label: 'Chiến dịch Hoa phượng đỏ & Tình nguyện hè', icon: <Rocket className="w-3.5 h-3.5 text-emerald-400 shrink-0" />, prompt: 'Nội dung và cách thức triển khai Chiến dịch tình nguyện Hoa phượng đỏ cho học sinh THPT trong dịp hè.' },

    // Tuyên truyền & Giáo dục
    { cat: 'propaganda', label: 'Mẫu bài đăng Fanpage Đoàn trường', icon: <Megaphone className="w-3.5 h-3.5 text-cyan-400 shrink-0" />, prompt: 'Soạn giúp tôi một bài viết truyền thông Fanpage Đoàn trường chào mừng Tháng Thanh niên thật cuốn hút, kèm hashtag.' },
    { cat: 'propaganda', label: 'Giáo dục lý tưởng cách mạng (Chỉ thị 42)', icon: <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />, prompt: 'Nêu các giải pháp giáo dục lý tưởng cách mạng, đạo đức lối sống cho thanh niên trường học theo tinh thần Chỉ thị 42-CT/TW.' },
    { cat: 'propaganda', label: 'Mỗi ngày 1 tin tốt, mỗi tuần 1 chuyện đẹp', icon: <Sparkles className="w-3.5 h-3.5 text-rose-400 shrink-0" />, prompt: 'Hướng dẫn cách triển khai cuộc vận động "Mỗi ngày một tin tốt, mỗi tuần một câu chuyện đẹp" trên không gian mạng của trường.' },

    // Kỹ năng & Soạn văn bản
    { cat: 'skills', label: 'Mẫu Kế hoạch hoạt động Đoàn', icon: <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />, prompt: 'Soạn giúp tôi mẫu Kế hoạch tổ chức hoạt động phong trào Đoàn chuẩn thể thức văn bản của Trung ương Đoàn.' },
    { cat: 'skills', label: 'Mẫu Biên bản họp Chi đoàn', icon: <FileText className="w-3.5 h-3.5 text-blue-400 shrink-0" />, prompt: 'Cho tôi mẫu Biên bản họp sinh hoạt chi đoàn định kỳ hàng tháng chuẩn quy định.' },
    { cat: 'skills', label: 'Kịch bản MC dẫn chương trình Đoàn', icon: <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />, prompt: 'Viết lời dẫn MC chi tiết cho chương trình Tuyên dương cán bộ Đoàn - Đoàn viên xuất sắc.' },
    { cat: 'skills', label: 'Kho trò chơi Teambuilding & Đoàn ca', icon: <Flame className="w-3.5 h-3.5 text-rose-400 shrink-0" />, prompt: 'Gợi ý 5 trò chơi sinh hoạt tập thể teambuilding vòng tròn vui nhộn và lời bài ca chính thức của Đoàn (Đoàn ca).' },

    // Đồng hành & Khởi nghiệp
    { cat: 'support', label: 'Tiêu chuẩn "Học sinh 3 tốt"', icon: <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />, prompt: 'Chi tiết tiêu chuẩn xét chọn danh hiệu "Học sinh 3 tốt" cấp trường và cấp tỉnh dành cho học sinh THPT.' },
    { cat: 'support', label: 'Vay vốn ưu đãi thanh niên (NHCSXH)', icon: <Rocket className="w-3.5 h-3.5 text-cyan-400 shrink-0" />, prompt: 'Hướng dẫn thủ tục tiếp cận nguồn vốn vay ưu đãi Ngân hàng CSXH qua kênh Đoàn thanh niên ủy thác.' },
    { cat: 'support', label: 'Tư vấn hướng nghiệp học sinh THPT', icon: <Compass className="w-3.5 h-3.5 text-emerald-400 shrink-0" />, prompt: 'Tư vấn phương pháp định hướng nghề nghiệp và chọn ngành học phù hợp cho học sinh lớp 10, 11, 12.' },

    // Thi đua THPT Quang Trung
    { cat: 'school', label: 'Xếp hạng thi đua 15 lớp các tuần', icon: <BarChart3 className="w-3.5 h-3.5 text-blue-400 shrink-0" />, prompt: 'Cho tôi biết bảng xếp hạng thi đua tuần mới nhất của 15 lớp học trường THPT Quang Trung.' },
    { cat: 'school', label: 'Quy chế 27 tiêu chí nề nếp (1440đ)', icon: <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />, prompt: 'Tóm tắt các mức trừ điểm của 27 tiêu chí nề nếp thi đua chính tại trường THPT Quang Trung.' },
    { cat: 'school', label: 'Mẫu bản tự kiểm điểm học sinh', icon: <FileText className="w-3.5 h-3.5 text-rose-400 shrink-0" />, prompt: 'Cho tôi mẫu bản tự kiểm điểm học sinh vi phạm nề nếp thi đua gửi BGH và Đoàn trường.' }
  ];

  const filteredPrompts = activeCategory === 'all' 
    ? promptList.slice(0, 8) 
    : promptList.filter(p => p.cat === activeCategory);

  return (
    <>
      {/* Floating Action Button - Nhận diện thương hiệu Áo Xanh Cẩm Nang Số */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center group">
          <div className="mr-3 hidden md:flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/95 text-xs font-bold text-white border border-blue-500/40 shadow-2xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <Sparkles className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <div>
              <div className="text-white text-xs font-black tracking-wide">Trợ lý Đoàn Thanh Niên</div>
              <div className="text-[10px] text-cyan-300 font-medium">Cẩm Nang Số & Nghiệp Vụ Đoàn 🇻🇳</div>
            </div>
          </div>

          <button
            id="open-youth-assistant-btn"
            onClick={() => setIsOpen(true)}
            className="relative p-1 rounded-full bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 text-white shadow-2xl hover:shadow-cyan-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border-2 border-white/30 focus:outline-none focus:ring-4 focus:ring-blue-400/40 cursor-pointer overflow-visible"
            title="Mở Trợ lý Chuyên trách Công tác Đoàn Thanh niên"
          >
            {/* Pulsing halo */}
            <span className="absolute -inset-1 rounded-full bg-cyan-400/30 animate-ping opacity-75 pointer-events-none" />
            
            {/* Badge AI Hologram */}
            <span className="absolute -top-1.5 -right-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-[9px] font-black tracking-wider uppercase shadow-lg border border-white/40">
              AI ĐOÀN
            </span>

            {/* Avatar Nữ đại sứ Áo Xanh Công nghệ số */}
            <div className="relative w-12 h-12 rounded-full overflow-hidden bg-slate-950 flex items-center justify-center border border-white/20">
              <img 
                src="/brand/ai_assistant_avatar.png" 
                alt="Trợ lý Đoàn Thanh Niên"
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
              <Bot className="w-6 h-6 text-cyan-300 absolute" style={{ zIndex: 0 }} />
            </div>
          </button>
        </div>
      )}

      {/* Main Chat Drawer / Window */}
      {isOpen && (
        <div
          id="youth-assistant-modal"
          className={`fixed z-[60] transition-all duration-300 ease-out flex flex-col shadow-2xl border border-blue-500/30 backdrop-blur-2xl bg-slate-950/98 overflow-hidden ${
            isExpanded
              ? 'inset-2 sm:inset-4 md:inset-8 rounded-2xl md:rounded-3xl'
              : 'bottom-2 sm:bottom-4 right-2 sm:right-4 md:bottom-6 md:right-6 w-[calc(100vw-1rem)] sm:w-[440px] md:w-[480px] h-[calc(100dvh-5rem)] max-h-[620px] rounded-2xl md:rounded-3xl'
          }`}
          style={{
            top: isExpanded ? undefined : 'auto',
            maxHeight: isExpanded ? undefined : 'calc(100dvh - 5rem)'
          }}
        >
          {/* Header Nhận Diện Thương Hiệu Chuyên Trách Công Tác Đoàn */}
          <div className="relative px-3.5 py-3 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border-b border-blue-500/30 flex items-center justify-between gap-2 shrink-0 select-none">
            {/* Thông tin đại sứ trợ lý */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-cyan-500 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-blue-300/40 overflow-hidden">
                <img 
                  src="/brand/ai_assistant_avatar.png" 
                  alt="Avatar" 
                  className="w-full h-full object-cover object-top rounded-[14px]"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                  }}
                />
                <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-950 ring-1 ring-emerald-500/50" />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-sm font-black text-white tracking-tight truncate flex items-center gap-1.5">
                    <span>Trợ lý Đoàn Thanh Niên</span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-gradient-to-r from-red-600 to-amber-600 text-white shadow-sm shrink-0">
                      Cẩm Nang Số
                    </span>
                  </h3>
                </div>
                
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 min-w-0">
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-950/90 text-blue-300 border border-blue-500/30 whitespace-nowrap shrink-0">
                    THPT Quang Trung
                  </span>
                  <span className="text-slate-600">•</span>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="inline-flex items-center gap-1 truncate hover:underline"
                    title="Cấu hình Google Gemini AI & Tra cứu Internet"
                  >
                    {webSearchEnabled ? (
                      <span className="inline-flex items-center gap-1 text-cyan-400 font-medium truncate">
                        <Globe className="w-3 h-3 text-cyan-400 shrink-0" />
                        <span>Google Search: BẬT</span>
                      </span>
                    ) : hasApiKey ? (
                      <span className="text-emerald-400 font-medium truncate">Gemini AI</span>
                    ) : (
                      <span className="text-amber-400 font-medium truncate">Cơ sở dữ liệu nội bộ ⚡</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Cụm Action Buttons bên phải */}
            <div className="flex items-center gap-1 shrink-0 text-slate-300">
              {/* Nút bật/tắt nhanh tra cứu Internet */}
              <button
                onClick={toggleWebSearch}
                className={`p-1.5 rounded-xl transition-all ${
                  webSearchEnabled 
                    ? 'bg-cyan-950/90 text-cyan-300 border border-cyan-500/50 hover:bg-cyan-900/60' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={webSearchEnabled ? 'Đang BẬT tìm kiếm Internet (Click để tắt)' : 'Đang TẮT tìm kiếm Internet (Click để bật)'}
              >
                <Globe className="w-4 h-4" />
              </button>

              {/* Nút cài đặt */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-xl transition-colors ${showSettings ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                title="Cài đặt AI & Google Gemini"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Nút làm mới */}
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors"
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Phóng to/Thu nhỏ */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-xl hover:bg-slate-800 hover:text-white transition-colors hidden md:flex items-center justify-center"
                title={isExpanded ? 'Thu nhỏ cửa sổ' : 'Phóng to cửa sổ'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Đóng widget */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl hover:bg-red-950/80 hover:text-red-300 text-slate-400 transition-colors"
                title="Đóng trợ lý"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Sub-Panel (Modal cấu hình AI) */}
          {showSettings && (
            <div className="p-4 bg-slate-900/98 border-b border-blue-500/30 text-xs space-y-3 shrink-0 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  Cấu hình AI Trợ Lý & Tra cứu Internet
                </h4>
                <a
                  href="https://aistudio.google.com/app/apikey"
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-[11px] underline"
                >
                  Lấy Key miễn phí <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {/* Bật/Tắt tìm kiếm Internet */}
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-semibold text-white text-[11px]">Tra cứu thông tin Internet (Google Search Grounding)</div>
                    <div className="text-[10px] text-slate-400">Tự động tìm kiếm các văn bản, sự kiện và tin tức Đoàn mới nhất từ web</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={toggleWebSearch}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    webSearchEnabled ? 'bg-cyan-600' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      webSearchEnabled ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Google Gemini API Key:</label>
                <input
                  type="password"
                  placeholder="AIzaSy... (Để trống để dùng bộ tri thức chuyên sâu nội bộ)"
                  value={apiKeyInput}
                  onChange={e => setApiKeyInput(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-600 focus:outline-none focus:border-blue-500 font-mono text-xs"
                />
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="block text-slate-300 mb-1 font-medium">Mô hình AI:</label>
                  <select
                    value={selectedModel}
                    onChange={e => setSelectedModel(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-blue-500 text-xs"
                  >
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Nhanh & Tối ưu Google Search)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Thế hệ mới nhất)</option>
                    <option value="gemini-1.5-pro">Gemini 1.5 Pro (Suy luận sâu)</option>
                  </select>
                </div>

                <div className="flex items-end gap-2 pt-4">
                  <button
                    onClick={handleTestKey}
                    disabled={isTestingKey || !apiKeyInput.trim()}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 disabled:opacity-50 transition-colors"
                  >
                    {isTestingKey ? 'Đang thử...' : 'Kiểm tra'}
                  </button>
                  <button
                    onClick={handleSaveSettings}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
                  >
                    Lưu
                  </button>
                </div>
              </div>

              {testResult && (
                <div className={`p-2 rounded-lg text-[11px] ${testResult.success ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800' : 'bg-red-950/60 text-red-300 border border-red-800'}`}>
                  {testResult.message}
                </div>
              )}
            </div>
          )}

          {/* Thanh Tab Chuyên Môn Trọng Tâm */}
          <div className="px-3 py-1.5 bg-slate-950/90 border-b border-slate-800 flex items-center gap-1 overflow-x-auto shrink-0 select-none no-scrollbar">
            {categories.map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10.5px] font-bold whitespace-nowrap transition-all shrink-0 cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-850 border border-slate-800'
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

          {/* Thanh Gợi Ý Câu Hỏi Theo Chuyên Mục - Hiển thị chuẩn xác, không bao giờ bị lộn ngược */}
          <div 
            className="px-3 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none"
            style={{ writingMode: 'horizontal-tb', direction: 'ltr', transform: 'none' }}
          >
            {filteredPrompts.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/90 hover:bg-blue-600/30 text-slate-200 hover:text-white border border-slate-700 hover:border-blue-500/50 text-[11px] font-medium whitespace-nowrap transition-all active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer shadow-sm"
              >
                {item.icon}
                <span className="whitespace-nowrap">{item.label}</span>
              </button>
            ))}
          </div>

          {/* Chat Messages Body */}
          <div 
            ref={chatBodyRef}
            className="flex-1 min-h-0 p-4 overflow-y-auto space-y-4 text-sm leading-relaxed"
          >
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 border border-cyan-400/40 shadow-md mt-1">
                    <img 
                      src="/brand/ai_assistant_avatar.png" 
                      alt="Avatar" 
                      className="w-full h-full object-cover object-top"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <Bot className="w-4 h-4 text-cyan-400 absolute" />
                  </div>
                )}

                <div
                  className={`relative max-w-[88%] rounded-2xl p-3.5 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Nội dung tin nhắn */}
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div>
                      <div className="prose prose-invert prose-sm max-w-none">
                        <RichTextViewer content={msg.text} />
                      </div>

                      {/* Hiển thị nguồn Internet tra cứu được (nếu có Grounding Sources) */}
                      {msg.sources && msg.sources.length > 0 && (
                        <div className="mt-3 pt-2.5 border-t border-slate-800">
                          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-cyan-300 mb-1.5">
                            <Globe className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Nguồn tra cứu trực tiếp từ Internet ({msg.sources.length})</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {msg.sources.map((src, sIdx) => (
                              <a
                                key={sIdx}
                                href={src.uri}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-950/80 hover:bg-blue-900/40 text-slate-300 hover:text-cyan-200 text-[10.5px] border border-slate-800 hover:border-cyan-500/50 transition-colors max-w-[240px] truncate"
                                title={src.title}
                              >
                                <ExternalLink className="w-2.5 h-2.5 shrink-0 text-cyan-400" />
                                <span className="truncate">{src.title}</span>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* KHỐI LƯU Ý VỀ TÍNH XÁC THỰC CỦA AI (LUÔN CÓ MẶT) */}
                      <div className="mt-3 pt-2.5 border-t border-white/5 flex items-start gap-1.5 text-[10.5px] text-amber-300/85 bg-amber-950/20 px-2.5 py-1.5 rounded-xl border border-amber-500/20">
                        <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Lưu ý xác thực:</strong> Thông tin do AI tổng hợp từ Internet & hệ thống chỉ mang tính tham khảo. Vui lòng đối chiếu với văn bản chính thức của Đoàn trường và BGH.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Footer thời gian & Nút sao chép */}
                  <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                        title="Sao chép nội dung"
                      >
                        {copiedId === msg.id ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">Đã chép</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Sao chép</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Trạng thái đang tải / AI đang suy nghĩ */}
            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center shrink-0 border border-cyan-400/40">
                  <img 
                    src="/brand/ai_assistant_avatar.png" 
                    alt="Loading" 
                    className="w-full h-full object-cover object-top animate-pulse"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                  <Bot className="w-4 h-4 text-cyan-400 animate-spin" />
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-slate-300 ml-1">
                    {webSearchEnabled ? 'Đang tra cứu dữ liệu Đoàn & Internet...' : 'Áo Xanh AI đang tổng hợp thông tin...'}
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dải Banner Cảnh Báo Tính Xác Thực Cố Định Ở Chân Khung Chat */}
          <div className="px-3 py-1.5 bg-amber-950/25 border-t border-amber-500/20 flex items-center justify-between text-[10.5px] text-amber-300/90 shrink-0">
            <span className="flex items-center gap-1.5 min-w-0">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="truncate">Nội dung do AI tạo có thể có sai sót. Luôn kiểm chứng với BCH Đoàn trường.</span>
            </span>
            <span className="text-[10px] text-slate-400 shrink-0 ml-2 font-medium">BCH Đoàn THPT Quang Trung</span>
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 shrink-0">
            <div className="relative flex items-end gap-2 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 p-2 transition-all">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  webSearchEnabled 
                    ? "Hỏi về Điều lệ Đoàn, kịch bản sự kiện, mẫu văn bản, tra cứu Internet... (Enter để gửi)" 
                    : "Nhập câu hỏi về công tác Đoàn, nề nếp thi đua, mẫu văn bản... (Enter để gửi)"
                }
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-xs md:text-sm focus:outline-none resize-none max-h-28 py-1 px-1.5"
                style={{ minHeight: '36px' }}
              />

              <button
                id="send-assistant-msg-btn"
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-600 text-white hover:from-blue-500 hover:to-cyan-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0 cursor-pointer"
                title="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
              <span>Shift + Enter để xuống dòng</span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${webSearchEnabled ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
                <span>{webSearchEnabled ? 'Google Search Grounding: BẬT' : 'Google Search: TẮT'}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
