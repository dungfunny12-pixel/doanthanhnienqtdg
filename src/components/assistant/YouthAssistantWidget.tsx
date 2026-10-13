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
  Flame,
  Award,
  BookOpen,
  FileText
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { YouthAssistantService, AssistantMessage, AssistantContextData } from '../../services/youthAssistantService';
import { RichTextViewer } from '../common/RichTextViewer';

export const YouthAssistantWidget: React.FC = () => {
  const { activeWeek, classes, criteria, getWeeklyScores } = useApp();

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [inputMessage, setInputMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Settings state
  const [apiKeyInput, setApiKeyInput] = useState<string>('');
  const [selectedModel, setSelectedModel] = useState<string>('gemini-1.5-flash');
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [isTestingKey, setIsTestingKey] = useState<boolean>(false);

  // Chat messages
  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: 'welcome-msg',
      sender: 'assistant',
      text: `Xin chào đồng chí! Tôi là **Trợ lý Ảo Đoàn Thanh Niên (Áo Xanh AI)** của Trường THPT Quang Trung - Đông Giang 🇻🇳.\n\nTôi sẵn sàng hỗ trợ bạn về:\n- 📊 **Tra cứu điểm thi đua & vị thứ** 15 lớp học\n- ⚖️ **Quy chế nề nếp 27 tiêu chí** của Đoàn trường\n- 🇻🇳 **Hướng dẫn thủ tục kết nạp Đoàn viên**, sổ đoàn, đoàn phí\n- 📝 **Soạn thảo nhanh mẫu văn bản**: Biên bản họp chi đoàn, bản tự kiểm điểm, kế hoạch phong trào\n\n*Đồng chí cần hỗ trợ vấn đề gì hôm nay?*`,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setApiKeyInput(YouthAssistantService.getApiKey());
    setSelectedModel(YouthAssistantService.getModel());
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
      const replyText = await YouthAssistantService.sendMessageToGemini(
        text,
        messages,
        liveContext
      );

      const botMsg: AssistantMessage = {
        id: `bot-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
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
        text: `Đã làm mới cuộc hội thoại. Đồng chí có câu hỏi nào về công tác Đoàn hoặc thi đua trường THPT Quang Trung không?`,
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
    setShowSettings(false);
  };

  const quickPrompts = [
    { label: '📊 Xếp hạng tuần', prompt: 'Cho tôi biết bảng xếp hạng thi đua tuần mới nhất của 15 lớp học.' },
    { label: '⚖️ Quy chế 27 tiêu chí', prompt: 'Tóm tắt các tiêu chí trừ điểm nề nếp thi đua chính của Đoàn trường.' },
    { label: '🇻🇳 Thủ tục vào Đoàn', prompt: 'Quy trình và điều kiện kết nạp Đoàn viên mới cho học sinh như thế nào?' },
    { label: '📝 Biên bản Chi đoàn', prompt: 'Soạn giúp tôi một mẫu biên bản sinh hoạt chi đoàn định kỳ hàng tháng chuẩn.' },
    { label: '📄 Mẫu bản kiểm điểm', prompt: 'Cho tôi mẫu bản tự kiểm điểm học sinh vi phạm nề nếp thi đua.' }
  ];

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <div className="fixed bottom-6 right-6 z-[60] flex items-center group">
          <div className="mr-3 hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/90 text-xs font-semibold text-blue-300 border border-blue-500/30 shadow-xl backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
            <span>Trợ lý Đoàn Thanh Niên</span>
          </div>

          <button
            id="open-youth-assistant-btn"
            onClick={() => setIsOpen(true)}
            className="relative p-3.5 rounded-full bg-gradient-to-tr from-blue-700 via-blue-600 to-indigo-600 text-white shadow-2xl hover:shadow-blue-500/50 hover:scale-105 active:scale-95 transition-all duration-300 border border-blue-400/40 focus:outline-none focus:ring-4 focus:ring-blue-400/30"
            title="Mở Trợ lý Đoàn Thanh Niên"
          >
            {/* Pulsing halo */}
            <span className="absolute -inset-1 rounded-full bg-blue-500/30 animate-ping opacity-75 pointer-events-none" />
            
            {/* Badge AI */}
            <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-gradient-to-r from-red-600 to-amber-500 text-[9px] font-black tracking-wider uppercase shadow-md">
              AI
            </span>

            {/* Icon Huy hiệu Đoàn / Áo xanh Robot */}
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
              : 'bottom-4 right-4 md:bottom-6 md:right-6 w-[calc(100vw-2rem)] md:w-[440px] h-[600px] max-h-[calc(100vh-3rem)] rounded-3xl'
          }`}
        >
          {/* Header */}
          <div className="relative px-4 py-3.5 bg-gradient-to-r from-blue-900/90 via-slate-900 to-indigo-950/90 border-b border-blue-500/30 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 p-0.5 shadow-lg shadow-blue-900/50 flex items-center justify-center border border-blue-300/30">
                <Bot className="w-5 h-5 text-white" />
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-1.5">
                    Trợ lý Đoàn Thanh Niên
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-red-600/80 text-white font-mono font-normal">THPT Quang Trung</span>
                  </h3>
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Áo Xanh AI
                  </span>
                  <span>•</span>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="hover:underline flex items-center gap-1 text-blue-400 hover:text-blue-300"
                    title="Cấu hình Google Gemini API"
                  >
                    {hasApiKey ? (
                      <span className="text-emerald-400 font-medium">Gemini 🟢</span>
                    ) : (
                      <span className="text-amber-400 font-medium">Tri thức nội bộ ⚡</span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1 text-slate-400">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-1.5 rounded-lg transition-colors ${showSettings ? 'bg-blue-600 text-white' : 'hover:bg-slate-800 hover:text-white'}`}
                title="Cài đặt Google Gemini API"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={handleResetChat}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors"
                title="Làm mới cuộc trò chuyện"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="p-1.5 rounded-lg hover:bg-slate-800 hover:text-white transition-colors hidden md:block"
                title={isExpanded ? 'Thu nhỏ' : 'Phóng to'}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-lg hover:bg-red-900/50 hover:text-red-300 transition-colors"
                title="Đóng trợ lý"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Settings Sub-Panel (Modal) */}
          {showSettings && (
            <div className="p-4 bg-slate-900/95 border-b border-blue-500/30 text-xs space-y-3 animate-fadeIn shrink-0">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-amber-400" />
                  Cấu hình Google Gemini AI
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

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Google Gemini API Key:</label>
                <input
                  type="password"
                  placeholder="AIzaSy..."
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
                    <option value="gemini-1.5-flash">Gemini 1.5 Flash (Nhanh & Tối ưu)</option>
                    <option value="gemini-2.0-flash">Gemini 2.0 Flash (Thế hệ mới)</option>
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
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium transition-colors"
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

          {/* Quick Prompts Carousel */}
          <div className="px-3 py-2 bg-slate-900/50 border-b border-slate-800/80 flex items-center gap-1.5 overflow-x-auto no-scrollbar shrink-0">
            {quickPrompts.map((item, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(item.prompt)}
                disabled={isLoading}
                className="px-2.5 py-1 rounded-full bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 border border-blue-800/50 text-[11px] font-medium whitespace-nowrap transition-all active:scale-95 disabled:opacity-50 flex items-center gap-1"
              >
                <span>{item.label}</span>
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
                  className={`relative max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                    msg.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-none'
                      : 'bg-slate-900/90 border border-slate-800 text-slate-100 rounded-tl-none'
                  }`}
                >
                  {/* Message content */}
                  {msg.sender === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <div className="prose prose-invert prose-sm max-w-none">
                      <RichTextViewer content={msg.text} />
                    </div>
                  )}

                  {/* Footer & Copy */}
                  <div className="flex items-center justify-between gap-4 mt-2 pt-1 border-t border-white/10 text-[10px] text-slate-400">
                    <span>{msg.timestamp}</span>
                    {msg.sender === 'assistant' && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.text)}
                        className="hover:text-white flex items-center gap-1 transition-colors"
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

            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex gap-2.5 items-center text-slate-400 text-xs">
                <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shrink-0 border border-blue-400/30">
                  <Bot className="w-4 h-4 text-white animate-spin" style={{ animationDuration: '3s' }} />
                </div>
                <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-slate-400 ml-1">Áo Xanh AI đang tra cứu & suy nghĩ...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <div className="p-3 bg-slate-900/90 border-t border-slate-800 shrink-0">
            <div className="relative flex items-end gap-2 bg-slate-950 rounded-2xl border border-slate-800 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 p-2 transition-all">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Nhập câu hỏi về nề nếp thi đua, quy chế Đoàn... (Nhấn Enter để gửi)"
                rows={1}
                className="flex-1 bg-transparent text-white placeholder-slate-500 text-xs md:text-sm focus:outline-none resize-none max-h-28 py-1 px-1"
                style={{ minHeight: '36px' }}
              />

              <button
                id="send-assistant-msg-btn"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !inputMessage.trim()}
                className="p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-500 hover:to-indigo-500 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shrink-0"
                title="Gửi tin nhắn"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5 px-1">
              <span>Shift + Enter để xuống dòng</span>
              <span>Đoàn Trường THPT Quang Trung • Đông Giang</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
