import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_CONFIG = 'DOANTHANHNIEN_SUPABASE_CONFIG';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

const DEFAULT_SUPABASE_URL = 'https://bqrozmqorvxpwjfmgkfk.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_7Z1DuZXAl9jtDFgGbZJEVg_FJnZbI_l';

// Purge any stale localStorage config unconditionally
if (typeof window !== 'undefined' && window.localStorage) {
  try {
    const local = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (local && (local.includes('mvkvfvxfcqxdabxumroz') || !local.includes('bqrozmqorvxpwjfmgkfk'))) {
      localStorage.removeItem(STORAGE_KEY_CONFIG);
    }
  } catch {
    // ignore
  }
}

/**
 * Lấy cấu hình Supabase chuẩn hóa tự động cho toàn hệ thống
 */
export const getSupabaseConfig = (): SupabaseConfig => {
  const envUrl = ((import.meta as any).env?.VITE_SUPABASE_URL || '').trim();
  const envKey = ((import.meta as any).env?.VITE_SUPABASE_ANON_KEY || '').trim();

  return {
    url: envUrl || DEFAULT_SUPABASE_URL,
    anonKey: envKey || DEFAULT_SUPABASE_ANON_KEY
  };
};

/**
 * Lưu cấu hình Supabase
 */
export const saveSupabaseConfig = (url: string, anonKey: string): void => {
  const cleanUrl = url.trim();
  const cleanKey = anonKey.trim();
  
  if (!cleanUrl || !cleanKey || cleanUrl === DEFAULT_SUPABASE_URL) {
    localStorage.removeItem(STORAGE_KEY_CONFIG);
  } else {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify({ url: cleanUrl, anonKey: cleanKey }));
  }

  // Reset client cache
  cachedClient = null;
};

let cachedClient: SupabaseClient | null = null;
let lastUsedUrl = '';
let lastUsedKey = '';

/**
 * Trả về Supabase Client hoặc null nếu chưa có cấu hình hợp lệ
 */
export const getSupabaseClient = (): SupabaseClient | null => {
  const { url, anonKey } = getSupabaseConfig();

  if (!url || !anonKey || !url.startsWith('https://')) {
    return null;
  }

  if (cachedClient && lastUsedUrl === url && lastUsedKey === anonKey) {
    return cachedClient;
  }

  try {
    cachedClient = createClient(url, anonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true
      },
      db: {
        schema: 'public'
      }
    });
    lastUsedUrl = url;
    lastUsedKey = anonKey;
    return cachedClient;
  } catch (error) {
    console.error('Lỗi khởi tạo Supabase Client:', error);
    return null;
  }
};

/**
 * Kiểm tra xem đã có cấu hình URL và Anon Key hợp lệ chưa
 */
export const isSupabaseConfigured = (): boolean => {
  const { url, anonKey } = getSupabaseConfig();
  return Boolean(url && anonKey && url.startsWith('https://') && anonKey.length > 20);
};

/**
 * Kiểm tra kết nối thực tế tới Database Supabase
 */
export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  tables?: string[];
  latencyMs?: number;
}> => {
  const client = getSupabaseClient();
  if (!client) {
    return {
      success: false,
      message: 'Chưa cấu hình URL hoặc Anon Key hợp lệ.'
    };
  }

  const startTime = Date.now();
  try {
    // Thử truy vấn bảng classes hoặc users
    const { error } = await client.from('classes').select('class_id').limit(1);

    const latencyMs = Date.now() - startTime;

    if (error) {
      // Nếu bảng chưa được tạo do chưa chạy SQL
      if (error.code === '42P01' || error.message.includes('relation "public.classes" does not exist') || error.message.includes('not found')) {
        return {
          success: false,
          message: `Kết nối thành công tới Supabase (${latencyMs}ms), nhưng các bảng chưa được tạo. Vui lòng chạy tệp 'database/supabase_schema.sql' trong Supabase SQL Editor!`
        };
      }
      return {
        success: false,
        message: `Lỗi truy vấn Supabase (${error.code || 'ERR'}): ${error.message}`
      };
    }

    return {
      success: true,
      message: `Kết nối thành công tới Supabase Cloud Database! (Độ trễ: ${latencyMs}ms)`,
      latencyMs
    };
  } catch (err: any) {
    return {
      success: false,
      message: `Không thể kết nối tới máy chủ Supabase: ${err?.message || 'Lỗi mạng'}`
    };
  }
};
