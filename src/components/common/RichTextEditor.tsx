import React, { useState, useRef, useEffect } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  Eye,
  Edit3,
  Columns,
  Maximize2,
  Minimize2,
  Sparkles,
  AlertCircle,
  Info,
  CheckCircle2,
  RotateCcw,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Highlighter,
  HelpCircle,
  X
} from 'lucide-react';
import { MediaPickerButton } from './MediaPickerButton';
import { RichTextViewer } from './RichTextViewer';
import { MediaCategory } from '../../types';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  minHeight?: string;
  className?: string;
  category?: MediaCategory;
  suggestedClassId?: string;
  suggestedWeek?: number;
  showMediaPicker?: boolean;
  toolbarPreset?: 'full' | 'standard' | 'minimal';
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Nhập và định dạng văn bản tại đây...',
  label,
  required = false,
  minHeight = '240px',
  className = '',
  category = 'news_events',
  suggestedClassId,
  suggestedWeek,
  showMediaPicker = true,
  toolbarPreset = 'standard'
}) => {
  const [viewMode, setViewMode] = useState<'edit' | 'preview' | 'split'>('edit');
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState<boolean>(false);
  const [isCalloutPickerOpen, setIsCalloutPickerOpen] = useState<boolean>(false);
  const [isLinkModalOpen, setIsLinkModalOpen] = useState<boolean>(false);
  const [linkText, setLinkText] = useState<string>('');
  const [linkUrl, setLinkUrl] = useState<string>('https://');

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Statistics calculation
  const stats = React.useMemo(() => {
    const text = value || '';
    const charCount = text.length;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const readTimeMinutes = Math.max(1, Math.ceil(words / 200));
    return { charCount, words, readTimeMinutes };
  }, [value]);

  // Insert or wrap text at cursor selection
  const insertText = (before: string, after: string = '', defaultSelection: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end) || defaultSelection;
    const replacement = `${before}${selectedText}${after}`;

    const newValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    onChange(newValue);

    // Reposition cursor after state update
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 10);
  };

  // Keyboard Shortcuts Handler
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.ctrlKey || e.metaKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        insertText('**', '**', 'văn bản in đậm');
      } else if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        insertText('*', '*', 'văn bản in nghiêng');
      } else if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        insertText('<u>', '</u>', 'văn bản gạch chân');
      } else if (e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        const textarea = textareaRef.current;
        const selected = textarea ? textarea.value.substring(textarea.selectionStart, textarea.selectionEnd) : '';
        setLinkText(selected || 'Xem liên kết');
        setIsLinkModalOpen(true);
      }
    }
  };

  // Insert Callout Box
  const handleInsertCallout = (type: string, placeholderText: string) => {
    insertText(`\n[${type}] `, `\n`, placeholderText);
    setIsCalloutPickerOpen(false);
  };

  // Insert Color
  const handleInsertColor = (hexColor: string, name: string) => {
    insertText(`<span style="color: ${hexColor}">`, `</span>`, `chữ màu ${name}`);
    setIsColorPickerOpen(false);
  };

  // Insert Table template
  const handleInsertTable = () => {
    const tableTemplate = `\n| STT | Nội dung / Hạng mục | Thời gian / Chi đoàn | Kết quả / Ghi chú |\n| :---: | :--- | :---: | :--- |\n| 1 | Hội trại 26/03 | 14h00 Thứ 7 | 18 Chi đoàn tham gia |\n| 2 | Tổng vệ sinh khuôn viên | 07h00 Chủ nhật | Đã hoàn thành |\n\n`;
    insertText(tableTemplate, '');
  };

  // Insert Image from Media Library
  const handleMediaSelect = (url: string | string[]) => {
    const chosenUrl = Array.isArray(url) ? url[0] : url;
    if (chosenUrl) {
      const imgMarkdown = `\n![Minh chứng hoạt động / Thông báo](${chosenUrl})\n`;
      insertText(imgMarkdown, '');
    }
  };

  // Confirm insert link
  const handleApplyLink = () => {
    if (!linkUrl.trim()) return;
    const finalLabel = linkText.trim() || linkUrl;
    insertText(`[${finalLabel}](${linkUrl})`, '');
    setIsLinkModalOpen(false);
    setLinkText('');
    setLinkUrl('https://');
  };

  return (
    <div className={`space-y-1.5 ${isFullscreen ? 'fixed inset-0 z-50 p-6 bg-slate-950/95 backdrop-blur-xl flex flex-col justify-between' : ''} ${className}`}>
      {/* Label and Statistics */}
      <div className="flex items-center justify-between">
        {label && (
          <label className="block font-bold text-slate-300 text-xs">
            {label} {required && <span className="text-red-500">*</span>}:
          </label>
        )}
        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium ml-auto">
          <span>{stats.words} từ • {stats.charCount} ký tự</span>
          <span>•</span>
          <span className="text-amber-400">~{stats.readTimeMinutes} phút đọc</span>
        </div>
      </div>

      {/* Editor Container */}
      <div className={`rounded-2xl border border-slate-700 bg-slate-950 overflow-hidden shadow-card flex flex-col ${isFullscreen ? 'flex-1 my-2' : ''}`}>
        
        {/* TOOLBAR */}
        <div className="p-2 bg-slate-900 border-b border-slate-800 flex flex-wrap items-center justify-between gap-1 text-xs">
          
          {/* Main Formatting Tools */}
          <div className="flex flex-wrap items-center gap-1">
            
            {/* Bold */}
            <button
              type="button"
              onClick={() => insertText('**', '**', 'văn bản in đậm')}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="In đậm (Ctrl+B)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>

            {/* Italic */}
            <button
              type="button"
              onClick={() => insertText('*', '*', 'văn bản in nghiêng')}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="In nghiêng (Ctrl+I)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>

            {/* Underline */}
            <button
              type="button"
              onClick={() => insertText('<u>', '</u>', 'văn bản gạch chân')}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Gạch chân (Ctrl+U)"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>

            {/* Strikethrough */}
            <button
              type="button"
              onClick={() => insertText('~~', '~~', 'văn bản gạch ngang')}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Gạch ngang"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-800 mx-0.5" />

            {/* Headings */}
            <button
              type="button"
              onClick={() => insertText('\n## ', '\n', 'Tiêu Đề Lớn (H2)')}
              className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold text-[11px]"
              title="Tiêu đề chính (H2)"
            >
              H2
            </button>

            <button
              type="button"
              onClick={() => insertText('\n### ', '\n', 'Tiêu Đề Mục (H3)')}
              className="px-2 py-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-bold text-[11px]"
              title="Tiêu đề mục nhỏ (H3)"
            >
              H3
            </button>

            <span className="w-px h-4 bg-slate-800 mx-0.5" />

            {/* Lists */}
            <button
              type="button"
              onClick={() => insertText('\n- ', '\n', 'Mục danh sách')}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Danh sách gạch đầu dòng"
            >
              <List className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => insertText('\n1. ', '\n', 'Mục số thứ tự')}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Danh sách đánh số"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>

            {/* Quote */}
            <button
              type="button"
              onClick={() => insertText('\n> ', '\n', 'Trích dẫn lời phát biểu hoặc nội dung chỉ đạo...')}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Trích dẫn (Quote)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>

            {/* Table */}
            <button
              type="button"
              onClick={handleInsertTable}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              title="Chèn bảng biểu mẫu (Table)"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>

            {/* Link */}
            <button
              type="button"
              onClick={() => {
                const textarea = textareaRef.current;
                const selected = textarea ? textarea.value.substring(textarea.selectionStart, textarea.selectionEnd) : '';
                setLinkText(selected || 'Xem liên kết');
                setIsLinkModalOpen(true);
              }}
              className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-950/50 transition-colors"
              title="Chèn liên kết web (Ctrl+K)"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>

            <span className="w-px h-4 bg-slate-800 mx-0.5" />

            {/* Callout Preset Box Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsCalloutPickerOpen(!isCalloutPickerOpen)}
                className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] font-bold flex items-center gap-1 border border-slate-700 transition-colors"
                title="Chèn khung thông báo nổi bật"
              >
                <Sparkles className="w-3 h-3" />
                <span>Khung Ghi Chú</span>
              </button>

              {isCalloutPickerOpen && (
                <div className="absolute top-full left-0 mt-1 z-30 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-1.5 space-y-1 animate-fadeIn">
                  <button
                    type="button"
                    onClick={() => handleInsertCallout('KHẨN', 'Nội dung thông báo khẩn cấp cần thực hiện ngay...')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-red-300 hover:bg-red-950/60 text-xs font-bold flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>🔥 [HỎA TỐC / KHẨN]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertCallout('LƯU Ý', 'Lưu ý quan trọng đối với giáo viên và đoàn viên...')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-amber-300 hover:bg-amber-950/60 text-xs font-bold flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>💡 [LƯU Ý / CHÚ Ý]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertCallout('KHEN THƯỞNG', 'Tuyên dương các tập thể / cá nhân xuất sắc...')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-emerald-300 hover:bg-emerald-950/60 text-xs font-bold flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>🏆 [KHEN THƯỞNG]</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertCallout('QUAN TRỌNG', 'Chỉ đạo trực tiếp từ Ban Thường vụ Đoàn trường...')}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-blue-300 hover:bg-blue-950/60 text-xs font-bold flex items-center gap-2"
                  >
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>📢 [QUAN TRỌNG]</span>
                  </button>
                </div>
              )}
            </div>

            {/* Text Color Picker */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsColorPickerOpen(!isColorPickerOpen)}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
                title="Đổi màu chữ"
              >
                <Palette className="w-3.5 h-3.5 text-amber-400" />
              </button>

              {isColorPickerOpen && (
                <div className="absolute top-full left-0 mt-1 z-30 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl p-2 flex items-center gap-1.5 animate-fadeIn">
                  {[
                    { color: '#ef4444', name: 'Đỏ Đoàn' },
                    { color: '#f59e0b', name: 'Cam Vàng' },
                    { color: '#10b981', name: 'Xanh Lá' },
                    { color: '#3b82f6', name: 'Xanh Dương' },
                    { color: '#a855f7', name: 'Tím' },
                    { color: '#f8fafc', name: 'Trắng Sáng' },
                  ].map(c => (
                    <button
                      key={c.color}
                      type="button"
                      onClick={() => handleInsertColor(c.color, c.name)}
                      className="w-5 h-5 rounded-full border border-white/40 hover:scale-125 transition-transform"
                      style={{ backgroundColor: c.color }}
                      title={c.name}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Media Manager Image Picker Integration */}
            {showMediaPicker && (
              <div className="ml-1">
                <MediaPickerButton
                  category={category}
                  suggestedClassId={suggestedClassId}
                  suggestedWeek={suggestedWeek}
                  onSelect={handleMediaSelect}
                  label="Chèn Ảnh Từ Media"
                  variant="primary"
                  className="!py-1 !px-2.5 !text-[11px]"
                />
              </div>
            )}
          </div>

          {/* View Mode & Fullscreen Controls */}
          <div className="flex items-center gap-1">
            <div className="bg-slate-950 p-0.5 rounded-xl border border-slate-800 flex items-center text-[11px] font-bold">
              <button
                type="button"
                onClick={() => setViewMode('edit')}
                className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  viewMode === 'edit' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Chế độ soạn thảo"
              >
                <Edit3 className="w-3 h-3" />
                <span className="hidden sm:inline">Soạn Thảo</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('split')}
                className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 hidden md:flex ${
                  viewMode === 'split' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Chia đôi màn hình xem trực tiếp"
              >
                <Columns className="w-3 h-3" />
                <span>Chia Đôi</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('preview')}
                className={`px-2 py-1 rounded-lg transition-colors flex items-center gap-1 ${
                  viewMode === 'preview' ? 'bg-red-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                }`}
                title="Xem trước kết quả"
              >
                <Eye className="w-3 h-3" />
                <span className="hidden sm:inline">Xem Trước</span>
              </button>
            </div>

            {/* Fullscreen Expand Button */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
              title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình soạn thảo'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>

        </div>

        {/* EDITOR & PREVIEW BODY */}
        <div className={`flex-1 flex overflow-hidden ${isFullscreen ? 'h-full' : ''}`}>
          
          {/* 1. EDIT AREA */}
          {(viewMode === 'edit' || viewMode === 'split') && (
            <div className={`flex-1 flex flex-col ${viewMode === 'split' ? 'border-r border-slate-800' : ''}`}>
              <textarea
                ref={textareaRef}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={placeholder}
                style={{ minHeight: isFullscreen ? '100%' : minHeight }}
                className="w-full flex-1 p-3.5 bg-slate-950 text-white text-xs sm:text-sm font-mono leading-relaxed placeholder-slate-600 focus:outline-none resize-y"
              />
            </div>
          )}

          {/* 2. LIVE PREVIEW AREA */}
          {(viewMode === 'preview' || viewMode === 'split') && (
            <div 
              className={`flex-1 p-4 bg-slate-900/50 overflow-y-auto ${
                viewMode === 'preview' ? 'w-full' : 'hidden md:block'
              }`}
              style={{ minHeight: isFullscreen ? '100%' : minHeight }}
            >
              <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400 pb-2 border-b border-slate-800 flex items-center justify-between mb-3">
                <span>👁️ Bản Xem Trước Thời Gian Thực:</span>
                <span className="text-slate-500 font-normal">Hiển thị chuẩn giao diện Cổng thông tin</span>
              </div>
              <RichTextViewer content={value} />
            </div>
          )}

        </div>

        {/* FOOTER HELPER TIPS */}
        <div className="px-3 py-1.5 bg-slate-900 border-t border-slate-800 text-[10px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span>Phím tắt: <strong>Ctrl+B</strong> (In đậm), <strong>Ctrl+I</strong> (In nghiêng), <strong>Ctrl+U</strong> (Gạch chân), <strong>Ctrl+K</strong> (Link)</span>
          </div>
          {isFullscreen && (
            <button
              type="button"
              onClick={() => setIsFullscreen(false)}
              className="px-3 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-colors"
            >
              Xong & Thu Nhỏ
            </button>
          )}
        </div>

      </div>

      {/* INSERT LINK MODAL */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="glass-modal max-w-sm w-full rounded-2xl p-5 border border-slate-700 shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h4 className="font-bold text-white text-xs flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-blue-400" />
                <span>Chèn Liên Kết Web</span>
              </h4>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Chữ hiển thị (Label):</label>
                <input
                  type="text"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  placeholder="VD: Xem chi tiết kế hoạch tại đây"
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-white font-bold"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-300 mb-1">Địa chỉ URL:</label>
                <input
                  type="url"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full p-2 rounded-xl bg-slate-950 border border-slate-700 text-blue-400 font-mono"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsLinkModalOpen(false)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleApplyLink}
                className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md"
              >
                Chèn Link
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
