import React, { useState } from 'react';
import { 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  AlertTriangle, 
  ExternalLink, 
  ZoomIn, 
  Award,
  Sparkles,
  FileText
} from 'lucide-react';
import { PhotoViewerModal } from './PhotoViewerModal';

interface RichTextViewerProps {
  content: string;
  className?: string;
  maxHeight?: string;
  allowImageZoom?: boolean;
  compact?: boolean;
}

export const RichTextViewer: React.FC<RichTextViewerProps> = ({
  content,
  className = '',
  maxHeight,
  allowImageZoom = true,
  compact = false
}) => {
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  if (!content || !content.trim()) {
    return (
      <div className={`text-slate-500 italic text-xs py-2 ${className}`}>
        (Chưa có nội dung chi tiết)
      </div>
    );
  }

  // Pre-process custom callout syntax and markdown helpers if present
  const renderFormattedContent = (rawText: string) => {
    // Check if the content is already HTML
    const hasHtmlTags = /<\/?[a-z][\s\S]*>/i.test(rawText);

    if (hasHtmlTags) {
      return (
        <div 
          className="rich-text-content space-y-3 leading-relaxed text-slate-200"
          dangerouslySetInnerHTML={{ __html: rawText }}
          onClick={(e) => {
            const target = e.target as HTMLElement;
            if (target.tagName === 'IMG' && allowImageZoom) {
              const src = target.getAttribute('src');
              if (src) setSelectedPhoto(src);
            }
          }}
        />
      );
    }

    // Markdown & plain text smart parser
    const lines = rawText.split('\n');
    const elements: React.ReactNode[] = [];
    let currentList: { type: 'ul' | 'ol'; items: React.ReactNode[] } | null = null;
    let inTable = false;
    let tableRows: string[][] = [];

    const flushList = () => {
      if (currentList) {
        if (currentList.type === 'ul') {
          elements.push(
            <ul key={`ul-${elements.length}`} className="space-y-1.5 my-2 pl-2">
              {currentList.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ul>
          );
        } else {
          elements.push(
            <ol key={`ol-${elements.length}`} className="space-y-1.5 my-2 pl-2 list-none counter-reset-item">
              {currentList.items.map((item, i) => (
                <li key={i} className="flex items-start gap-2.5 text-slate-200">
                  <span className="w-5 h-5 rounded-full bg-red-950 border border-red-700/60 text-red-400 font-bold text-[11px] flex items-center justify-center shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  <span className="flex-1">{item}</span>
                </li>
              ))}
            </ol>
          );
        }
        currentList = null;
      }
    };

    const flushTable = () => {
      if (inTable && tableRows.length > 0) {
        const headerRow = tableRows[0];
        const bodyRows = tableRows.slice(1).filter(r => !r.every(c => c.trim().startsWith('---') || c.trim() === ''));

        elements.push(
          <div key={`table-${elements.length}`} className="my-3 overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/60">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-300 font-bold">
                  {headerRow.map((cell, cIdx) => (
                    <th key={cIdx} className="p-3 border-r border-slate-800/80 last:border-r-0">
                      {parseInlineFormatting(cell.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {bodyRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-slate-900/40 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="p-2.5 text-slate-300 border-r border-slate-800/40 last:border-r-0">
                        {parseInlineFormatting(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        tableRows = [];
        inTable = false;
      }
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();

      // Check Table row (| col1 | col2 |)
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushList();
        inTable = true;
        const cols = trimmed.slice(1, -1).split('|');
        tableRows.push(cols);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Empty line
      if (!trimmed) {
        flushList();
        continue;
      }

      // Headings
      if (trimmed.startsWith('### ')) {
        flushList();
        elements.push(
          <h4 key={i} className="text-sm font-black text-amber-300 pt-2 pb-1 flex items-center gap-2 border-b border-slate-800/60">
            <span className="w-2 h-2 rounded-sm bg-amber-500" />
            <span>{parseInlineFormatting(trimmed.substring(4))}</span>
          </h4>
        );
        continue;
      }
      if (trimmed.startsWith('## ')) {
        flushList();
        elements.push(
          <h3 key={i} className="text-base font-black text-white pt-3 pb-1 flex items-center gap-2 border-l-4 border-red-600 pl-3 bg-gradient-to-r from-red-950/30 to-transparent rounded-r-xl">
            <span>{parseInlineFormatting(trimmed.substring(3))}</span>
          </h3>
        );
        continue;
      }
      if (trimmed.startsWith('# ')) {
        flushList();
        elements.push(
          <h2 key={i} className="text-lg font-black text-white pt-4 pb-2 border-b-2 border-red-600 flex items-center gap-2">
            <Award className="w-5 h-5 text-red-500" />
            <span>{parseInlineFormatting(trimmed.substring(2))}</span>
          </h2>
        );
        continue;
      }

      // Callouts / Alerts (e.g. [KHẨN], [LƯU Ý], [CHÚ Ý], [QUAN TRỌNG], [KHEN THƯỞNG])
      const calloutMatch = trimmed.match(/^\[(KHẨN|HỎA TỐC|LƯU Ý|CHÚ Ý|QUAN TRỌNG|KHEN THƯỞNG|THÔNG BÁO)\]\s*(.*)$/i);
      if (calloutMatch) {
        flushList();
        const type = calloutMatch[1].toUpperCase();
        const calloutText = calloutMatch[2];

        let badgeStyle = 'bg-red-950/60 border-red-800 text-red-200';
        let IconComp = AlertCircle;

        if (type.includes('LƯU Ý') || type.includes('CHÚ Ý')) {
          badgeStyle = 'bg-amber-950/60 border-amber-800 text-amber-200';
          IconComp = Info;
        } else if (type.includes('KHEN THƯỞNG')) {
          badgeStyle = 'bg-emerald-950/60 border-emerald-800 text-emerald-200';
          IconComp = Sparkles;
        } else if (type.includes('THÔNG BÁO') || type.includes('QUAN TRỌNG')) {
          badgeStyle = 'bg-blue-950/60 border-blue-800 text-blue-200';
          IconComp = CheckCircle2;
        }

        elements.push(
          <div key={i} className={`my-3 p-3.5 rounded-2xl border ${badgeStyle} flex items-start gap-3 shadow-md`}>
            <IconComp className="w-5 h-5 shrink-0 mt-0.5 text-current" />
            <div className="flex-1 text-xs sm:text-sm font-medium leading-relaxed">
              <span className="font-black mr-1.5 uppercase tracking-wide">[{type}]:</span>
              <span>{parseInlineFormatting(calloutText)}</span>
            </div>
          </div>
        );
        continue;
      }

      // Blockquotes (> quote)
      if (trimmed.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={i} className="my-2 p-3 pl-4 border-l-4 border-amber-500 bg-slate-900/80 rounded-r-2xl text-xs sm:text-sm text-slate-300 italic">
            {parseInlineFormatting(trimmed.substring(2))}
          </blockquote>
        );
        continue;
      }

      // Images (![alt](url))
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        flushList();
        const alt = imgMatch[1];
        const url = imgMatch[2];
        elements.push(
          <div key={i} className="my-3 space-y-1.5">
            <div 
              className="relative group rounded-2xl overflow-hidden border border-slate-700 max-h-96 bg-black flex items-center justify-center cursor-pointer"
              onClick={() => allowImageZoom && setSelectedPhoto(url)}
            >
              <img 
                src={url} 
                alt={alt || 'Hình ảnh minh họa'} 
                className="w-full max-h-96 object-contain group-hover:scale-[1.02] transition-transform duration-300"
                loading="lazy"
              />
              {allowImageZoom && (
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1.5 rounded-xl bg-black/70 text-white text-xs font-bold backdrop-blur-md flex items-center gap-1.5 border border-slate-700">
                    <ZoomIn className="w-3.5 h-3.5 text-red-400" />
                    <span>Phóng to xem ảnh</span>
                  </span>
                </div>
              )}
            </div>
            {alt && (
              <p className="text-[11px] text-center text-slate-400 italic">
                📷 {alt}
              </p>
            )}
          </div>
        );
        continue;
      }

      // Bullet Lists (- or * )
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• ')) {
        if (!currentList || currentList.type !== 'ul') {
          flushList();
          currentList = { type: 'ul', items: [] };
        }
        currentList.items.push(parseInlineFormatting(trimmed.substring(2)));
        continue;
      }

      // Numbered Lists (1. 2. 3.)
      const numMatch = trimmed.match(/^(\d+)\.\s+(.*)$/);
      if (numMatch) {
        if (!currentList || currentList.type !== 'ol') {
          flushList();
          currentList = { type: 'ol', items: [] };
        }
        currentList.items.push(parseInlineFormatting(numMatch[2]));
        continue;
      }

      // Regular Paragraph
      flushList();
      elements.push(
        <p key={i} className="text-xs sm:text-sm text-slate-200 leading-relaxed">
          {parseInlineFormatting(trimmed)}
        </p>
      );
    }

    flushList();
    flushTable();

    return <div className="space-y-2.5">{elements}</div>;
  };

  // Inline formatting helper (Bold **text**, Italic *text*, Links [text](url), Code `code`, Underline)
  const parseInlineFormatting = (text: string): React.ReactNode => {
    // Regex for inline elements
    const parts = text.split(/(\*\*.*?\*\*|\*.*?\*|\[.*?\]\(.*?\)|\`.*?\`)/g);

    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-white">{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return <em key={index} className="italic text-slate-300">{part.slice(1, -1)}</em>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code key={index} className="px-1.5 py-0.5 mx-0.5 rounded bg-slate-800 text-amber-300 font-mono text-[11px] border border-slate-700">
            {part.slice(1, -1)}
          </code>
        );
      }
      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
        return (
          <a
            key={index}
            href={linkMatch[2]}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-0.5 text-blue-400 hover:text-blue-300 underline font-medium"
          >
            <span>{linkMatch[1]}</span>
            <ExternalLink className="w-3 h-3 inline ml-0.5" />
          </a>
        );
      }
      return part;
    });
  };

  return (
    <div className={`rich-text-viewer ${className}`} style={{ maxHeight: maxHeight || undefined, overflowY: maxHeight ? 'auto' : undefined }}>
      {renderFormattedContent(content)}

      {selectedPhoto && (
        <PhotoViewerModal
          isOpen={true}
          onClose={() => setSelectedPhoto(null)}
          imageUrl={selectedPhoto}
          title="Xem ảnh chi tiết từ bài viết"
        />
      )}
    </div>
  );
};
