import React, { useState, useEffect } from 'react';
import { 
  Database, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Cloud, 
  CloudOff, 
  RefreshCw, 
  UploadCloud, 
  ExternalLink, 
  KeyRound, 
  Copy, 
  Check,
  Zap
} from 'lucide-react';
import { 
  getSupabaseConfig, 
  saveSupabaseConfig, 
  isSupabaseConfigured, 
  testSupabaseConnection 
} from '../../lib/supabase';
import { SupabaseService } from '../../services/supabaseService';
import { useApp } from '../../context/AppContext';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const { classes, criteria, students, violations, news, notices } = useApp();
  
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string; latencyMs?: number } | null>(null);
  const [syncResult, setSyncResult] = useState<{ success: boolean; message: string } | null>(null);
  const [copiedSql, setCopiedSql] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const config = getSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setTestResult(null);
      setSyncResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSaveAndTest = async () => {
    setIsTesting(true);
    setTestResult(null);
    saveSupabaseConfig(url, anonKey);

    const result = await testSupabaseConnection();
    setTestResult(result);
    setIsTesting(false);
  };

  const handleSyncDataToCloud = async () => {
    if (!isSupabaseConfigured()) {
      alert('Vui lòng cấu hình URL và Anon Key của Supabase trước khi đồng bộ!');
      return;
    }

    if (!window.confirm('Hành động này sẽ tải danh sách lớp, học sinh, tiêu chí hiện tại lên cơ sở dữ liệu Supabase. Bạn có muốn tiếp tục?')) {
      return;
    }

    setIsSyncing(true);
    setSyncResult(null);

    const res = await SupabaseService.seedLocalDataToSupabase({
      classes,
      criteria,
      students,
      violations,
      news,
      notices
    });

    setSyncResult(res);
    setIsSyncing(false);
  };

  const handleClearConfig = () => {
    if (window.confirm('Bạn có chắc chắn muốn ngắt kết nối Supabase và quay lại chế độ lưu cục bộ (LocalStorage)?')) {
      saveSupabaseConfig('', '');
      setUrl('');
      setAnonKey('');
      setTestResult(null);
      setSyncResult(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-modal max-w-2xl w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shadow-glow">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                Kết Nối Supabase Cloud Database (PostgreSQL)
              </h3>
              <p className="text-xs text-slate-400">
                Đồng bộ dữ liệu trực tuyến thời gian thực giữa nhiều máy và điện thoại
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="p-4 rounded-2xl border bg-slate-950/60 border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isSupabaseConfigured() ? (
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400">
                <Cloud className="w-4 h-4" />
              </div>
            ) : (
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400">
                <CloudOff className="w-4 h-4" />
              </div>
            )}
            <div>
              <div className="text-xs font-bold text-slate-300">Trạng thái hệ thống:</div>
              <div className="text-sm font-black">
                {isSupabaseConfigured() ? (
                  <span className="text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    Đã cấu hình Supabase Cloud
                  </span>
                ) : (
                  <span className="text-amber-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Chế độ Cục bộ (LocalStorage Offline)
                  </span>
                )}
              </div>
            </div>
          </div>

          <a 
            href="https://supabase.com/dashboard" 
            target="_blank" 
            rel="noreferrer"
            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-600/30 text-xs font-bold flex items-center gap-1 transition-all"
          >
            <span>Supabase Dashboard</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Input Fields */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="block font-bold text-slate-300 mb-1">
              1. Project URL (VITE_SUPABASE_URL):
            </label>
            <input 
              type="text"
              placeholder="https://xxxxxxxxxxxxxxxxxxxx.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Lấy tại: Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project URL
            </p>
          </div>

          <div>
            <label className="block font-bold text-slate-300 mb-1">
              2. Project API Key (VITE_SUPABASE_ANON_KEY):
            </label>
            <div className="relative">
              <input 
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-mono text-xs focus:outline-none focus:border-emerald-500 pr-10"
              />
              <KeyRound className="w-4 h-4 text-slate-500 absolute right-3 top-3 pointer-events-none" />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Lấy tại: Supabase Dashboard &rarr; Project Settings &rarr; API &rarr; Project API Keys &rarr; <code>anon</code> <code>public</code>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleSaveAndTest}
            disabled={isTesting || !url || !anonKey}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              isTesting || !url || !anonKey
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-glow'
            }`}
          >
            {isTesting ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Đang Kiểm Tra Kết Nối...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5" />
                <span>Lưu & Kiểm Tra Kết Nối</span>
              </>
            )}
          </button>

          {isSupabaseConfigured() && (
            <button
              type="button"
              onClick={handleSyncDataToCloud}
              disabled={isSyncing}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-glow"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Đang Đồng Bộ Lên Cloud...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Đồng Bộ Dữ Liệu Hiện Tại Lên Supabase</span>
                </>
              )}
            </button>
          )}

          {isSupabaseConfigured() && (
            <button
              type="button"
              onClick={handleClearConfig}
              className="px-3 py-2 rounded-xl bg-slate-900 border border-rose-900/60 text-rose-400 hover:bg-rose-950 text-xs font-bold transition-all ml-auto"
            >
              Ngắt Kết Nối
            </button>
          )}
        </div>

        {/* Test Result Alert */}
        {testResult && (
          <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
            testResult.success
              ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
              : 'bg-rose-950/60 border-rose-700 text-rose-200'
          }`}>
            {testResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold">{testResult.success ? 'Thành công!' : 'Chưa thể kết nối!'}</div>
              <div>{testResult.message}</div>
            </div>
          </div>
        )}

        {/* Sync Result Alert */}
        {syncResult && (
          <div className={`p-3.5 rounded-2xl border text-xs flex items-start gap-2.5 ${
            syncResult.success
              ? 'bg-blue-950/60 border-blue-700 text-blue-200'
              : 'bg-rose-950/60 border-rose-700 text-rose-200'
          }`}>
            {syncResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="font-bold">{syncResult.success ? 'Đồng bộ hoàn tất!' : 'Lỗi đồng bộ!'}</div>
              <div>{syncResult.message}</div>
            </div>
          </div>
        )}

        {/* SQL Schema Quick Guide */}
        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              📜 File Cấu Trúc CSDL: database/supabase_schema.sql
            </span>
          </div>
          <p className="text-slate-400 leading-relaxed text-[11px]">
            Đã có sẵn file cấu trúc cơ sở dữ liệu gồm 15 bảng (users, classes, students, criteria, violations, duties, news,...) và Trigger tự động tính điểm thi đua tại đường dẫn <code>database/supabase_schema.sql</code>. Bạn chỉ cần mở SQL Editor trên Supabase, dán và bấm Run.
          </p>
        </div>

      </div>
    </div>
  );
};
