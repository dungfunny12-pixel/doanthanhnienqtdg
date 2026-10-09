import React, { useState } from 'react';
import { Image as ImageIcon, Camera, Upload, Plus } from 'lucide-react';
import { MediaManagerModal } from './MediaManagerModal';
import { MediaCategory } from '../../types';

interface MediaPickerButtonProps {
  onSelect: (url: string | string[]) => void;
  multiple?: boolean;
  category?: MediaCategory;
  label?: string;
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'iconOnly';
  suggestedClassId?: string;
  suggestedWeek?: number;
  classId?: string;
  weekNumber?: number;
  value?: string | string[];
  title?: string;
}

export const MediaPickerButton: React.FC<MediaPickerButtonProps> = ({
  onSelect,
  multiple = false,
  category = 'all',
  label = 'Chọn / Quản lý ảnh',
  className = '',
  variant = 'outline',
  suggestedClassId,
  suggestedWeek,
  classId,
  weekNumber,
  value,
  title = 'Chọn Ảnh Từ Kho Media'
}) => {
  const effectiveClassId = classId || suggestedClassId;
  const effectiveWeek = weekNumber || suggestedWeek;
  const [isOpen, setIsOpen] = useState(false);

  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white shadow-md shadow-red-600/30';
      case 'secondary':
        return 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700';
      case 'outline':
        return 'border border-dashed border-slate-700 hover:border-red-500 bg-slate-900/60 hover:bg-slate-800/80 text-slate-300 hover:text-white';
      case 'ghost':
        return 'text-red-400 hover:text-red-300 hover:bg-red-950/40';
      case 'iconOnly':
        return 'p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 border border-slate-700';
      default:
        return 'bg-slate-800 text-slate-200';
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${getVariantStyles()} ${className}`}
        title={title}
      >
        <ImageIcon className="w-4 h-4 text-red-400 flex-shrink-0" />
        {variant !== 'iconOnly' && <span>{label}</span>}
      </button>

      {isOpen && (
        <MediaManagerModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onSelect={(res) => {
            onSelect(res);
            setIsOpen(false);
          }}
          multiple={multiple}
          defaultCategory={category}
          title={title}
          suggestedClassId={effectiveClassId}
          suggestedWeek={effectiveWeek}
          allowSelect={true}
        />
      )}
    </>
  );
};
