import React, { useState } from 'react';
import { FileText, Paperclip, Check } from 'lucide-react';
import { DocumentFile, DocumentCategory } from '../../types';
import { DocumentManagerModal } from './DocumentManagerModal';

export interface DocumentPickerButtonProps {
  onSelect: (doc: DocumentFile) => void;
  label?: string;
  defaultCategory?: DocumentCategory | 'all';
  defaultFolderId?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'compact';
}

export const DocumentPickerButton: React.FC<DocumentPickerButtonProps> = ({
  onSelect,
  label = 'Chọn Từ Kho Văn Bản',
  defaultCategory = 'all',
  defaultFolderId,
  className = '',
  variant = 'outline'
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-glow';
      case 'secondary':
        return 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700';
      case 'compact':
        return 'px-2.5 py-1 text-[11px] bg-blue-950/80 hover:bg-blue-900 text-blue-300 border border-blue-800 rounded-lg';
      case 'outline':
      default:
        return 'border border-dashed border-blue-500/60 bg-blue-950/20 hover:bg-blue-950/40 text-blue-300';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer ${getVariantStyles()} ${className}`}
        title="Mở kho tài liệu & biểu mẫu chuẩn"
      >
        <Paperclip className="w-3.5 h-3.5 text-blue-400" />
        <span>{label}</span>
      </button>

      {isOpen && (
        <DocumentManagerModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSelect={(doc) => {
            onSelect(doc);
            setIsOpen(false);
          }}
          defaultCategory={defaultCategory}
          defaultFolderId={defaultFolderId}
          allowSelect={true}
          title="CHỌN TÀI LIỆU / BIỂU MẪU ĐÍNH KÈM"
        />
      )}
    </>
  );
};
