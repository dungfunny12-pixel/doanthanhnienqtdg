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
  Info
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
      text: `Xin chào đồng chí! Tôi là **Trợ lý Ảo Đoàn Thanh Niên (Áo Xanh AI)** của Trường THPT Quang Trung - Đông Giang 🇻🇳.\n\nTôi sẵn sàng hỗ trợ bạn về:\n- 🌐 **Tra cứu thông tin Internet & Tin tức Đoàn:** Cập nhật tin tức, sự kiện và phong trào thanh niên trực tiếp từ mạng\n- 📊 **Điểm thi đua & Vị thứ:** Bảng xếp hạng nề nếp 15 lớp học các tuần 1 - 4\n- ⚖️ **Quy chế 27 tiêu chí:** Định mức 1440 điểm chuẩn và các quy định xử lý vi phạm\n- 🇻🇳 **Nghiệp vụ Đoàn viên:** Hướng dẫn kết nạp, thủ tục sổ đoàn, đoàn phí (2.000đ/tháng), 6 bài học LLCT\n- 📝 **Soạn thảo nhanh văn bản:** Mẫu biên bản họp chi đoàn, bản tự kiểm điểm, kế hoạch phong trào\n\n*Đồng chí cần tra cứu hay soạn thảo nội dung gì hôm nay?*`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isWebGrounded: false
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setApiKeyInput(YouthAssistantService.getApiKey());
    setSelectedModel(YouthAssistantService.getModel());
    setWebSearchEnabled(YouthAssistantService.getWebSearchEnabled());
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        inputRef.current?.focus();
      }, 100);
    }
  }, [isOpen, messages]);

  const hasApiKey = Boolean(apiKeyInput.trim() || YouthAssistantService.getApiKey());

  // Chuẩn bị context dữ liệu trực tiếp của trường
  const getLiveContext = (): AssistantContextData => {
    let weeklyScoresData: any[] = [];
    try {
      weeklyScoresData = getWeeklyScores(activeWeek).map(s => ({
        classId: s.classId,
        className: s.className,
        finalScore: s.finalScore,
        rank: s.rank,
        totalDeduction: s.totalDeduction
      }));
    } catch {}

    return {
      activeWeek,
      classes: classes.map(c => ({
        id: c.id,
        name: c.name,
        gvcnName: c.gvcnName,
        totalStudents: c.totalStudents,
        unionMembers: c.unionMembers
      })),
      criteria: criteria.map(cr => ({
        code: cr.code,
        name: cr.name,
        points: cr.points,
        type: cr.type
      })),
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
        text: `Đã làm mới cuộc hội thoại. Đồng chí có câu hỏi nào về công tác Đoàn, tra cứu internet hoặc thi đua trường THPT Quang Trung không?`,
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

  const quickPrompts = [
    { 
      label: 'Xếp hạng tuần', 
      icon: <BarChart3 className="w-3.5 h-3.5 text-blue-400 shrink-0" />, 
      prompt: 'Cho tôi biết bảng xếp hạng thi đua tuần mới nhất của 15 lớp học.' 
    },
    { 
      label: 'Quy chế 27 tiêu chí', 
      icon: <Scale className="w-3.5 h-3.5 text-amber-400 shrink-0" />, 
      prompt: 'Tóm tắt các tiêu chí trừ điểm nề nếp thi đua chính của Đoàn trường.' 
    },
    { 
      label: 'Thủ tục vào Đoàn', 
      icon: <Award className="w-3.5 h-3.5 text-rose-400 shrink-0" />, 
      prompt: 'Quy trình và điều kiện kết nạp Đoàn viên mới cho học sinh như thế nào?' 
    },
    { 
      label: 'Tin tức Đoàn 2026', 
      icon: <Globe className="w-3.5 h-3.5 text-cyan-400 shrink-0" />, 
      prompt: 'Tra cứu trên Internet các phong trào thanh niên và sự kiện Tháng Thanh niên mới nhất năm 2026.' 
    },
    { 
      label: 'Biên bản Chi đoàn', 
      icon: <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />, 
      prompt: 'Soạn giúp tôi một mẫu biên bản sinh hoạt chi đoàn định kỳ hàng tháng chuẩn.' 
    }
  ];

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center group">
          <div className="mr-3 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/95 text-xs font-semibold text-blue-300 border border-blue-500/30 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Trợ lý Đoàn Thanh Niên</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">Internet AI</span>
          </div>

          <button
            id="open-youth-assistant-btn"
            onClick={() => setIsOpen(true)}
            className="relative p-3.5 rounded-2xl bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-blue-400/40 focus:outline-none focus:ring-4 focus:ring-blue-400/30 cursor-pointer"
            title="Mở Trợ lý Đoàn Thanh Niên"
          >
            {/* Pulsing halo */}
            <span className="absolute -inset-1 rounded-2xl bg-blue-500/30 animate-ping opacity-75 pointer-events-none" />
            
            {/* Badge AI */}
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-[9px] font-black tracking-wider uppercase shadow-md">
              AI
            </span>

            {/* Icon Huy hiệu Đoàn / Robot */}
            <div className="relative w-7 h-7 flex items-center justify-center">
              <Bot className="w-7 h-7 text-white" />
            </div>
          </button>
        </div>
      )}

      {/* Main Chat Drawer / Window */}
      {isOpen && (
        <div
          id="youth-assistant-modal"
          className={`fixed z-[60] transition-all duration-300 ease-out flex flex-col shadow-2xl border border-blue-500/30 backdrop-blur-2xl bg-slate-950/95 overflow-hidden ${
            isExpanded
              ? 'inset-3 md:inset-8 rounded-3xl'
              : 'bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-[460px] h-[640px] max-h-[calc(100vh-3rem)] rounded-3xl'
          }`}
        >
          {/* Header chuẩn hóa layout không bao giờ vỡ */}
          <div className="relative px-3.5 py-3 bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 border-b border-blue-500/30 flex items-center justify-between gap-2 shrink-0 select-none">
            {/* Cụm thông tin Trợ lý bên trái */}
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 p-0.5 shadow-md flex items-center justify-center shrink-0 border border-blue-300/40">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-slate-950 ring-1 ring-emerald-500/50" />
              </div>
              
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <h3 className="text-sm font-bold text-white tracking-tight truncate">
                    Trợ lý Đoàn Thanh Niên
                  </h3>
                </div>
                
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5 min-w-0">
                  <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-semibold bg-red-950/80 text-red-300 border border-red-500/40 whitespace-nowrap shrink-0">
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
                        <span>Internet AI</span>
                      </span>
                    ) : hasApiKey ? (
                      <span className="text-emerald-400 font-medium truncate">Gemini AI</span>
                    ) : (
                      <span className="text-amber-400 font-medium truncate">Nội bộ ⚡</span>
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
                className={`p-1.5 rounded-lg transition-all ${
                  webSearchEnabled 
                    ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-500/40 hover:bg-cyan-900/60' 
                    : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title={webSearchEnabled ? 'Đang BẬT tìm kiếm Internet (Click để tắt)' : 'Đang TẮT tìm kiếm Internet (Click để bật)'}
              >
                <Globe className="w-4 h-4" />
              </button>

              {/* Nút cài đặt */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                title="Cài đặt AI & Google Gemini"
              >
                <Settings className="w-4 h-4" />
              </button>

              {/* Nút làm mới */}
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Phóng to/Thu nhỏ */}
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors hidden md:flex items-center justify-center"
                title={isExpanded ? 'Thu nhỏ cửa sổ' : 'Phóng to cửa sổ'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>

              {/* Đóng widget */}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-red-950/80 hover:text-red-300 text-slate-400 transition-colors"
                title="Đóng trợ lý"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Sub-Panel (Modal) */}
          {showSettings && (
            <div className="p-4 bg-slate-900/98 border-b border-blue-500/30 text-xs space-y-3 shrink-0 shadow-lg">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  Cấu hình AI & Tra cứu Internet
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
                    <div className="font-semibold text-white text-[11px]">Tra cứu thông tin Internet (Google Search)</div>
                    <div className="text-[10px] text-slate-400">Tự động tìm kiếm tin tức, sự kiện và văn bản mới nhất từ web</div>
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
                  placeholder="AIzaSy... (Để trống để dùng bộ tri thức nội bộ)"
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
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Tối ưu & Hỗ trợ Google Search)</option>
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

          {/* Quick Prompts Container - Thiết kế phẳng, hiển thị thẳng, không bao giờ bị lộn ngược */}
          <div 
            className="px-3 py-2 bg-slate-900/60 border-b border-slate-800 flex items-center gap-1.5 overflow-x-auto shrink-0 select-none"
            style={{ writingMode: 'horizontal-tb', direction: 'ltr', transform: 'none' }}
          >
            {quickPrompts.map((item, idx) => (
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
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-sm leading-relaxed">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 border border-blue-400/30 shadow-md mt-1">
                    <Bot className="w-4 h-4 text-white" />
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
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 border border-blue-400/30">
                  <Bot className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-slate-300 ml-1">
                    {webSearchEnabled ? 'Đang tra cứu Internet & tổng hợp thông tin...' : 'Áo Xanh AI đang suy nghĩ...'}
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
                    ? "Hỏi về nề nếp thi đua, hoặc tra cứu tin tức Đoàn từ Internet... (Enter để gửi)" 
                    : "Nhập câu hỏi về nề nếp thi đua, quy chế Đoàn... (Enter để gửi)"
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
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0 cursor-pointer"
                title="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
              <span>Shift + Enter để xuống dòng</span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${webSearchEnabled ? 'bg-cyan-400' : 'bg-slate-500'}`} />
                <span>{webSearchEnabled ? 'Google Search Grounding: BẬT' : 'Google Search: TẮT'}</span>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
