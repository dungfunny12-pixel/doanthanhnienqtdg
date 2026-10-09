import React, { useState } from 'react';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  FileText, 
  FileSpreadsheet, 
  File, 
  ExternalLink, 
  Calendar, 
  User, 
  Tag, 
  Folder, 
  Eye, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  FileCheck,
  Share2,
  FileCode,
  FileArchive
} from 'lucide-react';
import { DocumentFile, DocumentFolder } from '../../types';

export interface DocumentViewerModalProps {
  isOpen?: boolean;
  document: DocumentFile | null;
  folders?: DocumentFolder[];
  onClose: () => void;
  onDownload?: (doc: DocumentFile) => void;
}

export const DocumentViewerModal: React.FC<DocumentViewerModalProps> = ({
  document,
  folders = [],
  onClose,
  onDownload
}) => {
  const [copied, setCopied] = useState(false);

  if (!document) return null;

  const folder = folders.find(f => f.id === document.folderId);

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'pdf':
        return <span className="p-3 rounded-2xl bg-rose-950/80 border border-rose-700 text-rose-400 font-bold text-xl flex items-center justify-center shrink-0">📄 PDF</span>;
      case 'docx':
        return <span className="p-3 rounded-2xl bg-blue-950/80 border border-blue-700 text-blue-400 font-bold text-xl flex items-center justify-center shrink-0">📝 DOCX</span>;
      case 'xlsx':
        return <span className="p-3 rounded-2xl bg-emerald-950/80 border border-emerald-700 text-emerald-400 font-bold text-xl flex items-center justify-center shrink-0">📊 XLSX</span>;
      case 'pptx':
        return <span className="p-3 rounded-2xl bg-amber-950/80 border border-amber-700 text-amber-400 font-bold text-xl flex items-center justify-center shrink-0">📽️ PPTX</span>;
      case 'zip':
        return <span className="p-3 rounded-2xl bg-purple-950/80 border border-purple-700 text-purple-400 font-bold text-xl flex items-center justify-center shrink-0">🗜️ ZIP</span>;
      default:
        return <span className="p-3 rounded-2xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xl flex items-center justify-center shrink-0">📁 TỆP</span>;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'form':
        return <span className="px-2.5 py-1 rounded-lg bg-blue-950/90 text-blue-300 border border-blue-800 text-[11px] font-bold">📋 Biểu Mẫu Chuẩn</span>;
      case 'directive':
        return <span className="px-2.5 py-1 rounded-lg bg-red-950/90 text-red-300 border border-red-800 text-[11px] font-bold">🏛️ Công Văn / Chỉ Đạo</span>;
      case 'plan':
        return <span className="px-2.5 py-1 rounded-lg bg-emerald-950/90 text-emerald-300 border border-emerald-800 text-[11px] font-bold">🏆 Kế Hoạch / Điều Lệ</span>;
      case 'handbook':
        return <span className="px-2.5 py-1 rounded-lg bg-purple-950/90 text-purple-300 border border-purple-800 text-[11px] font-bold">📚 Cẩm Nang / Sổ Tay</span>;
      case 'report':
        return <span className="px-2.5 py-1 rounded-lg bg-amber-950/90 text-amber-300 border border-amber-800 text-[11px] font-bold">📊 Báo Cáo / Lưu Chiểu</span>;
      default:
        return <span className="px-2.5 py-1 rounded-lg bg-slate-900 text-slate-300 border border-slate-700 text-[11px] font-bold">Tài Liệu</span>;
    }
  };

  const handleCopyLink = () => {
    if (document.fileUrl) {
      navigator.clipboard.writeText(document.fileUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadClick = () => {
    if (onDownload) {
      onDownload(document);
    }
    // Direct browser trigger
    if (document.fileUrl && document.fileUrl !== '#') {
      const a = window.document.createElement('a');
      a.href = document.fileUrl;
      a.download = document.fileName || `${document.title}.${document.fileType}`;
      a.target = '_blank';
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
    } else {
      alert(`Đang khởi tạo tải file "${document.fileName}"...`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-modal max-w-2xl w-full max-h-[92vh] flex flex-col rounded-3xl border border-slate-700/80 shadow-2xl overflow-hidden bg-slate-950/95 text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <FileCheck className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Chi Tiết Văn Bản & Biểu Mẫu</span>
                {document.version && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                    {document.version}
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-black text-white truncate max-w-md">
                {document.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors shrink-0"
            title="Đóng (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 custom-scrollbar text-xs">
          
          {/* Main Info Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row items-start gap-4">
            {getFileIcon(document.fileType)}

            <div className="space-y-1.5 flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                {getCategoryBadge(document.category)}
                {document.fileNumber && (
                  <span className="px-2 py-0.5 rounded bg-slate-950 text-amber-300 font-mono font-bold text-[11px] border border-slate-800">
                    Số: {document.fileNumber}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded bg-slate-950 text-slate-300 font-mono text-[10px] border border-slate-800">
                  📦 {document.fileSize}
                </span>
                {document.isPublic ? (
                  <span className="px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-300 font-bold text-[10px] border border-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Công khai
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[10px] border border-slate-700">
                    🔒 Nội bộ
                  </span>
                )}
              </div>

              <h2 className="text-base font-black text-white leading-snug">
                {document.title}
              </h2>

              <p className="text-slate-400 text-xs font-mono break-all">
                Tên file gốc: <strong className="text-slate-300">{document.fileName}</strong>
              </p>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Folder className="w-3.5 h-3.5 text-blue-400" /> Thư mục lưu trữ:
              </span>
              <p className="font-bold text-white text-xs">
                {folder ? folder.name : 'Thư mục chung'}
              </p>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> Ngày ban hành / Ký:
              </span>
              <p className="font-bold text-white text-xs font-mono">
                {document.publishDate} {document.signDate ? `(Ký: ${document.signDate})` : ''}
              </p>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-emerald-400" /> Người ký / Cơ quan ban hành:
              </span>
              <p className="font-bold text-white text-xs">
                {document.signer || 'BCH Đoàn Trường'} {document.signerRole ? `(${document.signerRole})` : ''}
              </p>
            </div>

            <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800/80 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5 text-purple-400" /> Lượt xem & Tải về:
              </span>
              <p className="font-bold text-white text-xs font-mono">
                👁️ {document.viewsCount || 0} lượt xem • 📥 {document.downloadsCount || 0} lượt tải
              </p>
            </div>
          </div>

          {/* Description */}
          {document.description && (
            <div className="p-3.5 bg-slate-900/60 rounded-2xl border border-slate-800/80 space-y-1.5">
              <span className="font-bold text-slate-300 text-xs flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-red-400" /> Trích yếu nội dung:
              </span>
              <p className="text-slate-300 text-xs leading-relaxed">
                {document.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {document.tags && document.tags.length > 0 && (
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3 h-3" /> Từ khóa liên quan:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {document.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800 text-[11px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyLink}
              className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-700"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Đã sao chép link!' : 'Sao Chép Link File'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors"
            >
              Đóng
            </button>

            <button
              type="button"
              onClick={handleDownloadClick}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-glow active:scale-95 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Tải Xuống Ngay ({document.fileSize})</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
