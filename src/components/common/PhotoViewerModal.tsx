import React from 'react';
import { X, ZoomIn, ExternalLink } from 'lucide-react';

interface PhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title?: string;
  caption?: string;
}

export const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title = 'Minh chứng hình ảnh',
  caption
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative max-w-3xl w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-2 text-slate-200">
            <ZoomIn className="w-5 h-5 text-red-500" />
            <h3 className="font-semibold text-base">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Image Content */}
        <div className="p-4 bg-slate-950 flex flex-col items-center justify-center min-h-[300px] max-h-[70vh] overflow-auto">
          <img
            src={imageUrl}
            alt={title}
            className="max-h-[60vh] w-auto max-w-full object-contain rounded-lg border border-slate-800 shadow-lg"
          />
        </div>

        {/* Footer */}
        {caption && (
          <div className="px-6 py-3 bg-slate-900/90 border-t border-slate-800 text-sm text-slate-300 flex items-center justify-between">
            <span>{caption}</span>
            <a
              href={imageUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center text-xs text-red-400 hover:text-red-300 gap-1 hover:underline"
            >
              <span>Xem kích thước gốc</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
};
