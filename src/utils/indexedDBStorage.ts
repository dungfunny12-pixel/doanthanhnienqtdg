/**
 * Tiện ích lưu trữ IndexedDB chuyên dụng cho Kho Media, Tài Liệu và Toàn bộ Dữ liệu Offline
 * Giải quyết triệt để giới hạn 5MB của LocalStorage, cho phép lưu trữ hàng ngàn hình ảnh WebP/Base64
 * và thư mục hoàn toàn trên máy cục bộ (Local), không bao giờ bị mất khi F5 / Refresh trang!
 */

const DB_NAME = 'DOANTHANHNIEN_OFFLINE_DB';
const DB_VERSION = 2;

export const STORES = {
  MEDIA_ASSETS: 'media_assets',
  MEDIA_FOLDERS: 'media_folders',
  DOCUMENT_FILES: 'document_files',
  DOCUMENT_FOLDERS: 'document_folders',
  APP_KV: 'app_key_val'
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

/**
 * Mở hoặc khởi tạo Database IndexedDB
 */
export function openOfflineDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      console.warn('[IndexedDB] Trình duyệt không hỗ trợ IndexedDB, sử dụng LocalStorage fallback.');
      return reject(new Error('IndexedDB not supported'));
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
      const db = (event.target as IDBOpenDBRequest).result;

      // 1. Kho Media Assets
      if (!db.objectStoreNames.contains(STORES.MEDIA_ASSETS)) {
        const mediaStore = db.createObjectStore(STORES.MEDIA_ASSETS, { keyPath: 'id' });
        mediaStore.createIndex('folderId', 'folderId', { unique: false });
        mediaStore.createIndex('category', 'category', { unique: false });
      }

      // 2. Thư mục Media Folders
      if (!db.objectStoreNames.contains(STORES.MEDIA_FOLDERS)) {
        const folderStore = db.createObjectStore(STORES.MEDIA_FOLDERS, { keyPath: 'id' });
        folderStore.createIndex('parentId', 'parentId', { unique: false });
      }

      // 3. Kho Văn bản Files
      if (!db.objectStoreNames.contains(STORES.DOCUMENT_FILES)) {
        const docStore = db.createObjectStore(STORES.DOCUMENT_FILES, { keyPath: 'id' });
        docStore.createIndex('folderId', 'folderId', { unique: false });
      }

      // 4. Thư mục Văn bản Folders
      if (!db.objectStoreNames.contains(STORES.DOCUMENT_FOLDERS)) {
        db.createObjectStore(STORES.DOCUMENT_FOLDERS, { keyPath: 'id' });
      }

      // 5. Key-Value Store chung
      if (!db.objectStoreNames.contains(STORES.APP_KV)) {
        db.createObjectStore(STORES.APP_KV, { keyPath: 'key' });
      }
    };

    request.onsuccess = (event: Event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      resolve(db);
    };

    request.onerror = (event: Event) => {
      console.error('[IndexedDB] Lỗi mở Database:', (event.target as IDBOpenDBRequest).error);
      dbPromise = null;
      reject((event.target as IDBOpenDBRequest).error);
    };
  });

  return dbPromise;
}

/**
 * Lưu một bản ghi vào Store
 */
export async function saveIndexedDBItem<T extends { id: string }>(storeName: StoreName, item: T): Promise<boolean> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(item);

      req.onsuccess = () => resolve(true);
      req.onerror = () => {
        console.warn(`[IndexedDB] Lỗi khi lưu vào ${storeName}:`, req.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Lỗi kết nối khi lưu vào ${storeName}:`, err);
    return false;
  }
}

/**
 * Lưu toàn bộ danh sách (Batch Put) vào Store
 */
export async function saveIndexedDBBatch<T extends { id: string }>(storeName: StoreName, items: T[]): Promise<boolean> {
  if (!items || items.length === 0) return true;
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      items.forEach((item) => {
        if (item && item.id) {
          store.put(item);
        }
      });

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => {
        console.warn(`[IndexedDB] Lỗi batch lưu vào ${storeName}:`, tx.error);
        resolve(false);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Lỗi kết nối khi batch lưu ${storeName}:`, err);
    return false;
  }
}

/**
 * Đọc tất cả các bản ghi từ một Store
 */
export async function getAllIndexedDBItems<T>(storeName: StoreName): Promise<T[]> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();

      req.onsuccess = () => {
        resolve(req.result || []);
      };
      req.onerror = () => {
        console.warn(`[IndexedDB] Lỗi khi đọc ${storeName}:`, req.error);
        resolve([]);
      };
    });
  } catch (err) {
    console.warn(`[IndexedDB] Lỗi mở Database khi đọc ${storeName}:`, err);
    return [];
  }
}

/**
 * Xóa một bản ghi khỏi Store theo ID
 */
export async function deleteIndexedDBItem(storeName: StoreName, id: string): Promise<boolean> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.delete(id);

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Xóa nhiều bản ghi khỏi Store theo mảng IDs
 */
export async function deleteIndexedDBBatch(storeName: StoreName, ids: string[]): Promise<boolean> {
  if (!ids || ids.length === 0) return true;
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);

      ids.forEach((id) => store.delete(id));

      tx.oncomplete = () => resolve(true);
      tx.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Xóa toàn bộ Store (Clear)
 */
export async function clearIndexedDBStore(storeName: StoreName): Promise<boolean> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.clear();

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Lưu cặp Key - Value tùy biến vào Store chung
 */
export async function setIndexedDBKV<T>(key: string, value: T): Promise<boolean> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.APP_KV, 'readwrite');
      const store = tx.objectStore(STORES.APP_KV);
      const req = store.put({ key, value, updatedAt: Date.now() });

      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

/**
 * Lấy giá trị Key - Value từ Store chung
 */
export async function getIndexedDBKV<T>(key: string): Promise<T | null> {
  try {
    const db = await openOfflineDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORES.APP_KV, 'readonly');
      const store = tx.objectStore(STORES.APP_KV);
      const req = store.get(key);

      req.onsuccess = () => {
        resolve(req.result ? req.result.value : null);
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}
