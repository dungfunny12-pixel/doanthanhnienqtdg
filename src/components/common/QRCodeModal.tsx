import React from 'react';
import { X, QrCode, Sparkles, ShieldCheck, Download } from 'lucide-react';

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  qrValue: string;
  studentName?: string;
  className?: string;
}

export const QRCodeModal: React.FC<QRCodeModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  qrValue,
  studentName,
  className
}) => {
  if (!isOpen) return null;

  // Use a high quality SVG QR code generator API or SVG representation
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=${encodeURIComponent(qrValue)}&margin=10&color=0f172a`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative max-w-sm w-full bg-slate-900 border border-slate-700 rounded-3xl overflow-hidden shadow-2xl">
        {/* Glowing Top Banner */}
        <div className="h-3 bg-gradient-to-r from-red-600 via-amber-500 to-red-600"></div>

        <div className="p-6 text-center">
          <div className="flex items-center justify-between mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-950/60 border border-red-800/60 text-red-400 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Thẻ QR Định Danh Số</span>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mb-4">{subtitle}</p>}

          {/* QR Container */}
          <div className="p-4 bg-white rounded-2xl shadow-inner inline-block my-2 border-4 border-amber-400/30">
            <img
              src={qrImageUrl}
              alt="Mã QR định danh"
              className="w-48 h-48 object-contain"
            />
          </div>

          {studentName && (
            <div className="mt-4 p-3 bg-slate-800/80 rounded-xl border border-slate-700 text-left flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-400">Học sinh / Đoàn viên</p>
                <p className="font-bold text-white text-sm">{studentName}</p>
              </div>
              {className && (
                <span className="px-2.5 py-1 bg-red-600/20 text-red-400 border border-red-500/30 rounded-lg text-xs font-bold">
                  {className}
                </span>
              )}
            </div>
          )}

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Mã bảo mật chống gian lận & tự làm mới</span>
          </div>
        </div>

        <div className="px-6 py-3 bg-slate-950/70 border-t border-slate-800 flex justify-center">
          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};
