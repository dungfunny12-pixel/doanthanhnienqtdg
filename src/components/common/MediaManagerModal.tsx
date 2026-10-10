import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  X, 
  Upload, 
  Search, 
  Trash2, 
  Copy, 
  Check, 
  ExternalLink, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Folder, 
  FolderPlus,
  FolderEdit,
  FolderMinus,
  Edit3,
  Plus,
  RefreshCw,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  FileImage,
  FileText,
  AlertTriangle,
  Move,
  Eye,
  Loader2,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { MediaItem, MediaFolder, MediaCategory } from '../../types';

export interface MediaManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (url: string | string[]) => void;
  multiple?: boolean;
  defaultCategory?: MediaCategory;
  defaultFolderId?: string;
  title?: string;
  suggestedClassId?: string;
  suggestedWeek?: number;
  allowSelect?: boolean;
}

export const MediaManagerModal: React.FC<MediaManagerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  multiple = false,
  defaultFolderId = 'album-activities',
  title = 'Quản trị tài nguyên',
  allowSelect = true
}) => {
  const { 
    mediaFolders, 
    mediaAssets, 
    addMediaFolder, 
    updateMediaFolder, 
    deleteMediaFolder, 
    moveMediaToFolder, 
    batchMoveMediaToFolder, 
    addMediaAsset, 
    deleteMediaAsset, 
    deleteMediaAssetsBatch,
    updateMediaAsset,
    updateSchoolSettings,
    addActivitySlide,
    refreshDataFromCloud
  } = useApp();

  // Active Scope Tab: 'public' (Thư mục công khai) | 'internal' (Thư mục nội bộ)
  const [activeScope, setActiveScope] = useState<'public' | 'internal'>('public');

  // Toast Notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Selected Folder
  const [selectedFolderId, setSelectedFolderId] = useState<string>(defaultFolderId || 'album-activities');

  // Expanded Folder IDs in Tree View
  const [expandedFolderIds, setExpandedFolderIds] = useState<string[]>([
    'album-activities'
  ]);

  // Search Queries
  const [folderSearchQuery, setFolderSearchQuery] = useState('');
  const [fileSearchQuery, setFileSearchQuery] = useState('');

  // Selected Files in Right Grid
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Pagination State
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 24;

  // Modals for CRUD operations
  const [isNewFolderModalOpen, setIsNewFolderModalOpen] = useState(false);
  const [isRenameFolderModalOpen, setIsRenameFolderModalOpen] = useState(false);
  const [isRenameFileModalOpen, setIsRenameFileModalOpen] = useState(false);
  const [isMoveFileModalOpen, setIsMoveFileModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExternalUrlModalOpen, setIsExternalUrlModalOpen] = useState(false);

  // Form states
  const [folderNameInput, setFolderNameInput] = useState('');
  const [fileNameInput, setFileNameInput] = useState('');
  const [targetMoveFolderId, setTargetMoveFolderId] = useState('');
  const [externalUrlInput, setExternalUrlInput] = useState('');
  const [externalTitleInput, setExternalTitleInput] = useState('');

  // Delete Confirm Dialog
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    type: 'folder' | 'singleFile' | 'batchFiles';
    targetFolder?: MediaFolder;
    targetFile?: MediaItem;
    batchIds?: string[];
  }>({
    isOpen: false,
    type: 'singleFile'
  });

  // Lightbox Preview State
  const [inspectingItem, setInspectingItem] = useState<MediaItem | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  // Drag and drop / File upload state
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync / Reset on Open
  useEffect(() => {
    if (isOpen) {
      if (defaultFolderId && mediaFolders.some(f => f.id === defaultFolderId)) {
        setSelectedFolderId(defaultFolderId);
      } else {
        const firstFolder = mediaFolders.find(f => (f.scope || 'public') === activeScope);
        if (firstFolder) setSelectedFolderId(firstFolder.id);
        else setSelectedFolderId('album-activities');
      }
      setSelectedFileIds([]);
      setInspectingItem(null);
      setCurrentPage(1);
    }
  }, [isOpen, defaultFolderId, mediaFolders, activeScope]);

  // Auto expand parent when folder is selected
  useEffect(() => {
    const curFolder = mediaFolders.find(f => f.id === selectedFolderId);
    if (curFolder?.parentId && !expandedFolderIds.includes(curFolder.parentId)) {
      setExpandedFolderIds(prev => [...prev, curFolder.parentId!]);
    }
  }, [selectedFolderId, mediaFolders]);

  // Current active folder object
  const currentFolder = useMemo(() => {
    return mediaFolders.find(f => f.id === selectedFolderId) || mediaFolders[0];
  }, [mediaFolders, selectedFolderId]);

  // Toggle Folder Expand in Tree
  const toggleFolderExpand = (folderId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedFolderIds(prev => 
      prev.includes(folderId) ? prev.filter(id => id !== folderId) : [...prev, folderId]
    );
  };

  // Filter Folders by Scope & Search
  const filteredFoldersByScope = useMemo(() => {
    return mediaFolders.filter(f => {
      const scope = f.scope || 'public';
      if (scope !== activeScope) return false;
      if (folderSearchQuery.trim()) {
        return f.name.toLowerCase().includes(folderSearchQuery.toLowerCase());
      }
      return true;
    });
  }, [mediaFolders, activeScope, folderSearchQuery]);

  // Build Hierarchical Tree
  const folderTree = useMemo(() => {
    const rootFolders = filteredFoldersByScope.filter(f => !f.parentId || !filteredFoldersByScope.some(p => p.id === f.parentId));
    
    const getChildren = (parentId: string): MediaFolder[] => {
      return filteredFoldersByScope.filter(f => f.parentId === parentId);
    };

    return { rootFolders, getChildren };
  }, [filteredFoldersByScope]);

  // Filter Files in Active Folder & Search
  const filteredFiles = useMemo(() => {
    return mediaAssets.filter(item => {
      // If folder selected, match folderId or albumId
      if (selectedFolderId) {
        const itemFolder = item.folderId || item.albumId;
        // If selecting root, show all files in this scope or match exactly
        if (itemFolder !== selectedFolderId) {
          return false;
        }
      }

      // Search Query
      if (fileSearchQuery.trim()) {
        const q = fileSearchQuery.toLowerCase();
        return item.title?.toLowerCase().includes(q) || item.url?.toLowerCase().includes(q);
      }

      return true;
    });
  }, [mediaAssets, selectedFolderId, fileSearchQuery]);

  // Paginated Files
  const totalPages = Math.max(1, Math.ceil(filteredFiles.length / itemsPerPage));
  const paginatedFiles = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredFiles.slice(start, start + itemsPerPage);
  }, [filteredFiles, currentPage, itemsPerPage]);

  // Selection Handlers
  const handleSelectFile = (fileId: string, e: React.MouseEvent) => {
    if (e.ctrlKey || e.metaKey || multiple) {
      // Multi-select with Ctrl
      setSelectedFileIds(prev => 
        prev.includes(fileId) ? prev.filter(id => id !== fileId) : [...prev, fileId]
      );
    } else {
      // Single select
      setSelectedFileIds([fileId]);
    }
  };

  const handleDoubleClickFile = (item: MediaItem) => {
    if (allowSelect && onSelect) {
      onSelect(item.url);
      onClose();
    } else {
      setInspectingItem(item);
    }
  };

  // Drag & Drop Upload
  const handleFileDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await uploadFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await uploadFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  const uploadFiles = async (files: File[]) => {
    const validFiles = files.filter(f => f.type.startsWith('image/') || f.name.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|jfif|avif|heic|ico)$/i) || !f.type);
    if (validFiles.length === 0) {
      alert('Vui lòng chọn các tệp hình ảnh hợp lệ (PNG, JPG, JPEG, WEBP, GIF, SVG, AVIF, HEIC)!');
      return;
    }

    setIsUploading(true);
    let successCount = 0;
    try {
      for (const file of validFiles) {
        const cleanName = file.name;
        const res = await addMediaAsset(file, {
          title: cleanName,
          folderId: selectedFolderId,
          category: currentFolder?.category || 'activities'
        });
        if (res) successCount++;
      }
      setIsUploadModalOpen(false);
      if (successCount > 0) {
        showToast(`🎉 Đã tải lên và lưu ${successCount} ảnh vào thư mục "${currentFolder?.name || 'Media'}" thành công!`);
      }
    } catch (err) {
      console.error('Lỗi khi tải ảnh lên:', err);
      alert('Có lỗi xảy ra khi tải ảnh lên: ' + (err instanceof Error ? err.message : 'Lỗi không xác định'));
    } finally {
      setIsUploading(false);
    }
  };

  // Add from External URL
  const handleAddExternalUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!externalUrlInput.trim()) return;

    setIsUploading(true);
    try {
      const result = await addMediaAsset(externalUrlInput.trim(), {
        title: externalTitleInput.trim() || 'ảnh web liên kết.jpg',
        folderId: selectedFolderId,
        category: currentFolder?.category || 'general'
      });

      if (result) {
        setExternalUrlInput('');
        setExternalTitleInput('');
        setIsExternalUrlModalOpen(false);
      }
    } catch (err) {
      alert('Lỗi lưu liên kết ảnh ngoài.');
    } finally {
      setIsUploading(false);
    }
  };

  // Folder CRUD Actions
  const handleCreateNewFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderNameInput.trim()) return;

    const newFolder = addMediaFolder({
      name: folderNameInput.trim(),
      parentId: selectedFolderId || null,
      scope: activeScope,
      color: '#f59e0b',
      icon: 'folder',
      category: 'activities',
      isSystem: false,
      order: mediaFolders.length + 1
    });

    setFolderNameInput('');
    setIsNewFolderModalOpen(false);
    setSelectedFolderId(newFolder.id);
    if (newFolder.parentId && !expandedFolderIds.includes(newFolder.parentId)) {
      setExpandedFolderIds(prev => [...prev, newFolder.parentId!]);
    }
  };

  const handleRenameFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderNameInput.trim() || !currentFolder) return;

    updateMediaFolder(currentFolder.id, {
      name: folderNameInput.trim()
    });

    setFolderNameInput('');
    setIsRenameFolderModalOpen(false);
  };

  const promptDeleteCurrentFolder = () => {
    if (!currentFolder) return;
    setDeleteDialog({
      isOpen: true,
      type: 'folder',
      targetFolder: currentFolder
    });
  };

  // File CRUD Actions
  const promptDeleteSelectedFiles = () => {
    if (selectedFileIds.length === 0) {
      alert('Vui lòng chọn ít nhất một tệp tin cần xóa!');
      return;
    }

    if (selectedFileIds.length === 1) {
      const item = mediaAssets.find(m => m.id === selectedFileIds[0]);
      if (item) {
        setDeleteDialog({
          isOpen: true,
          type: 'singleFile',
          targetFile: item
        });
      }
    } else {
      setDeleteDialog({
        isOpen: true,
        type: 'batchFiles',
        batchIds: [...selectedFileIds]
      });
    }
  };

  const handleRenameFile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileNameInput.trim() || selectedFileIds.length !== 1) return;

    const targetId = selectedFileIds[0];
    updateMediaAsset(targetId, {
      title: fileNameInput.trim()
    });

    setFileNameInput('');
    setIsRenameFileModalOpen(false);
  };

  const handleMoveFiles = () => {
    if (selectedFileIds.length === 0 || !targetMoveFolderId) return;

    if (selectedFileIds.length === 1) {
      moveMediaToFolder(selectedFileIds[0], targetMoveFolderId);
    } else {
      batchMoveMediaToFolder(selectedFileIds, targetMoveFolderId);
    }

    setIsMoveFileModalOpen(false);
    setSelectedFileIds([]);
  };

  const handleDownloadSelectedFile = () => {
    if (selectedFileIds.length !== 1) {
      alert('Vui lòng chọn 1 tệp để tải xuống!');
      return;
    }
    const item = mediaAssets.find(m => m.id === selectedFileIds[0]);
    if (item) {
      const a = document.createElement('a');
      a.href = item.url;
      a.download = item.title || 'download.jpg';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const executeDelete = async () => {
    if (deleteDialog.type === 'folder' && deleteDialog.targetFolder) {
      deleteMediaFolder(deleteDialog.targetFolder.id);
      const remaining = mediaFolders.filter(f => f.id !== deleteDialog.targetFolder?.id && (f.scope || 'public') === activeScope);
      setSelectedFolderId(remaining[0]?.id || 'album-activities');
    } else if (deleteDialog.type === 'singleFile' && deleteDialog.targetFile) {
      await deleteMediaAsset(deleteDialog.targetFile.id);
      setSelectedFileIds([]);
      if (inspectingItem?.id === deleteDialog.targetFile.id) setInspectingItem(null);
    } else if (deleteDialog.type === 'batchFiles' && deleteDialog.batchIds) {
      await deleteMediaAssetsBatch(deleteDialog.batchIds);
      setSelectedFileIds([]);
      if (inspectingItem && deleteDialog.batchIds.includes(inspectingItem.id)) setInspectingItem(null);
    }
    setDeleteDialog({ isOpen: false, type: 'singleFile' });
  };

  if (!isOpen) return null;

  // Recursive Tree Node Renderer
  const renderFolderTreeNode = (folder: MediaFolder, depth = 0) => {
    const children = folderTree.getChildren(folder.id);
    const hasChildren = children.length > 0;
    const isExpanded = expandedFolderIds.includes(folder.id);
    const isSelected = selectedFolderId === folder.id;

    return (
      <div key={folder.id} className="select-none">
        <div
          onClick={() => {
            setSelectedFolderId(folder.id);
            setCurrentPage(1);
          }}
          className={`flex items-center gap-1.5 px-2 py-1.5 rounded cursor-pointer text-xs transition-colors ${
            isSelected 
              ? 'bg-amber-100 text-amber-950 font-bold border border-amber-300' 
              : 'text-slate-700 hover:bg-slate-100'
          }`}
          style={{ paddingLeft: `${Math.max(8, depth * 18 + 8)}px` }}
        >
          {/* Expand / Collapse Icon */}
          {hasChildren ? (
            <button
              type="button"
              onClick={(e) => toggleFolderExpand(folder.id, e)}
              className="w-4 h-4 flex items-center justify-center text-slate-500 hover:text-slate-800 shrink-0"
            >
              {isExpanded ? (
                <span className="font-mono text-xs font-bold border border-slate-400 rounded w-3.5 h-3.5 flex items-center justify-center bg-white text-slate-700">-</span>
              ) : (
                <span className="font-mono text-xs font-bold border border-slate-400 rounded w-3.5 h-3.5 flex items-center justify-center bg-white text-slate-700">+</span>
              )}
            </button>
          ) : (
            <span className="w-4 shrink-0" />
          )}

          {/* Folder Icon */}
          <Folder className={`w-4 h-4 shrink-0 ${isSelected ? 'text-amber-500 fill-amber-500' : 'text-amber-400 fill-amber-400'}`} />

          {/* Folder Name */}
          <span className="truncate flex-1" title={folder.name}>
            {folder.name}
          </span>
        </div>

        {/* Render Children if Expanded */}
        {hasChildren && isExpanded && (
          <div className="border-l border-slate-200 ml-3.5">
            {children.map(child => renderFolderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-sm animate-fadeIn"
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={(e) => { 
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsDragging(false); 
        }
      }}
      onDrop={handleFileDrop}
    >
      {/* Root Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Drag & Drop Visual Overlay */}
      {isDragging && (
        <div className="absolute inset-4 sm:inset-8 z-[70] bg-blue-900/90 backdrop-blur-md border-4 border-dashed border-blue-400 rounded-2xl flex flex-col items-center justify-center pointer-events-none shadow-2xl animate-fadeIn">
          <Upload className="w-16 h-16 text-white mb-3 animate-bounce" />
          <h3 className="text-xl font-black text-white">Thả tệp vào đây để tải lên thư mục này!</h3>
          <p className="text-xs text-blue-200 mt-1">Đang thả vào: <strong>{currentFolder?.name}</strong></p>
        </div>
      )}

      {/* MAIN WINDOW CONTAINER */}
      <div className="relative w-full max-w-6xl h-[92vh] max-h-[850px] bg-white border border-slate-300 rounded-lg flex flex-col overflow-hidden shadow-2xl font-sans">
        
        {/* ============================================================== */}
        {/* 1. TOP WINDOW TITLE BAR                                        */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-4 py-2 bg-gradient-to-r from-blue-700 via-blue-600 to-blue-700 text-white select-none shrink-0">
          <div className="flex items-center space-x-2">
            <Folder className="w-4 h-4 text-amber-300 fill-amber-300" />
            <h3 className="font-bold text-sm tracking-wide">{title}</h3>
            <span className="text-[11px] text-blue-200 font-normal">
              - {currentFolder?.name || 'Trường THPT Quang Trung'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center rounded hover:bg-red-600 text-white transition-colors"
            title="Đóng cửa sổ"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ============================================================== */}
        {/* 2. TOP ACTION ICONS TOOLBAR (Thanh công cụ thêm/xóa/đổi tên...) */}
        {/* ============================================================== */}
        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-100 border-b border-slate-200 shrink-0 text-slate-700">
          <div className="flex items-center space-x-1 sm:space-x-1.5 overflow-x-auto py-0.5">
            
            {/* 📁➕ Thêm thư mục */}
            <button
              type="button"
              onClick={() => {
                setFolderNameInput('');
                setIsNewFolderModalOpen(true);
              }}
              className="p-1.5 px-2 rounded hover:bg-slate-200 flex items-center gap-1 text-xs font-semibold text-slate-800 transition-colors"
              title="Thêm thư mục mới"
            >
              <div className="relative">
                <Folder className="w-5 h-5 text-amber-500 fill-amber-400" />
                <Plus className="w-3 h-3 text-emerald-600 absolute -top-1 -right-1 font-bold stroke-[3]" />
              </div>
            </button>

            {/* 📁✏️ Đổi tên thư mục */}
            <button
              type="button"
              onClick={() => {
                if (currentFolder) {
                  setFolderNameInput(currentFolder.name);
                  setIsRenameFolderModalOpen(true);
                }
              }}
              className="p-1.5 px-2 rounded hover:bg-slate-200 flex items-center gap-1 text-xs font-semibold text-slate-800 transition-colors"
              title="Đổi tên thư mục đang chọn"
            >
              <div className="relative">
                <Folder className="w-5 h-5 text-amber-500 fill-amber-400" />
                <Edit3 className="w-3 h-3 text-blue-600 absolute -bottom-1 -right-1" />
              </div>
            </button>

            {/* 📁❌ Xóa thư mục */}
            <button
              type="button"
              onClick={promptDeleteCurrentFolder}
              className="p-1.5 px-2 rounded hover:bg-red-50 text-red-600 flex items-center gap-1 text-xs font-semibold transition-colors"
              title="Xóa thư mục đang chọn"
            >
              <div className="relative">
                <Folder className="w-5 h-5 text-amber-500 fill-amber-400 opacity-80" />
                <X className="w-3.5 h-3.5 text-red-600 absolute -top-1 -right-1 font-bold stroke-[3]" />
              </div>
            </button>

            <div className="h-5 w-px bg-slate-300 mx-1" />

            {/* 📤 Tải lên tệp tin */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-1.5 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1.5 text-xs font-bold transition-all shadow-sm cursor-pointer shrink-0 active:scale-95"
              title="Tải lên tệp tin từ máy tính"
            >
              <Upload className="w-4 h-4" />
              <span>Tải Tệp Lên</span>
            </button>

            {/* ✏️ Đổi tên tệp tin */}
            <button
              type="button"
              disabled={selectedFileIds.length !== 1}
              onClick={() => {
                const item = mediaAssets.find(m => m.id === selectedFileIds[0]);
                if (item) {
                  setFileNameInput(item.title);
                  setIsRenameFileModalOpen(true);
                }
              }}
              className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
              title="Đổi tên tệp tin đang chọn"
            >
              <Edit3 className="w-4 h-4 text-slate-600" />
            </button>

            {/* 📋 Sao chép / Di chuyển tệp tin */}
            <button
              type="button"
              disabled={selectedFileIds.length === 0}
              onClick={() => {
                setTargetMoveFolderId(selectedFolderId);
                setIsMoveFileModalOpen(true);
              }}
              className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
              title="Di chuyển tệp tin sang thư mục khác"
            >
              <Move className="w-4 h-4 text-slate-600" />
            </button>

            {/* 📥 Tải xuống */}
            <button
              type="button"
              disabled={selectedFileIds.length !== 1}
              onClick={handleDownloadSelectedFile}
              className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-700 disabled:opacity-40 disabled:hover:bg-transparent flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
              title="Tải tệp tin về máy"
            >
              <Download className="w-4 h-4 text-slate-600" />
            </button>

            {/* 🗑️ XÓA TỆP TIN */}
            <button
              type="button"
              disabled={selectedFileIds.length === 0}
              onClick={promptDeleteSelectedFiles}
              className="p-1.5 px-2 rounded hover:bg-red-100 text-red-600 disabled:opacity-40 disabled:hover:bg-transparent flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
              title="Xóa các tệp tin đang chọn"
            >
              <Trash2 className="w-4 h-4" />
            </button>

            <div className="h-5 w-px bg-slate-300 mx-1" />

            {/* 🔗 Thêm từ URL */}
            <button
              type="button"
              onClick={() => setIsExternalUrlModalOpen(true)}
              className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
              title="Thêm ảnh từ đường dẫn URL ngoài"
            >
              <ExternalLink className="w-4 h-4 text-slate-600" />
              <span className="hidden sm:inline">Từ URL</span>
            </button>

            {/* 🔄 Làm mới */}
            <button
              type="button"
              onClick={() => {
                refreshDataFromCloud();
                showToast('🔄 Đang đồng bộ lại dữ liệu từ Cloud...');
              }}
              className="p-1.5 px-2 rounded hover:bg-slate-200 text-slate-700 flex items-center gap-1 text-xs font-semibold transition-colors cursor-pointer"
              title="Làm mới dữ liệu từ Supabase Cloud"
            >
              <RefreshCw className="w-4 h-4 text-slate-600" />
            </button>
          </div>

          {/* Quick Select Confirm Button if in Select Mode */}
          {allowSelect && onSelect && selectedFileIds.length > 0 && (
            <button
              type="button"
              onClick={() => {
                const selectedItems = mediaAssets.filter(m => selectedFileIds.includes(m.id));
                if (selectedItems.length > 0) {
                  onSelect(multiple ? selectedItems.map(m => m.url) : selectedItems[0].url);
                  onClose();
                }
              }}
              className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold shadow flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Chèn {selectedFileIds.length} tệp đã chọn</span>
            </button>
          )}
        </div>

        {/* ============================================================== */}
        {/* 3. MAIN WORKSPACE (2 COLUMNS: FOLDER TREE & FILES GRID)        */}
        {/* ============================================================== */}
        <div className="flex-1 flex overflow-hidden">
          
          {/* ==================== LEFT COLUMN: FOLDER TREE ==================== */}
          <div className="w-72 sm:w-80 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0 overflow-hidden">
            
            {/* Search Folder Input */}
            <div className="p-2 border-b border-slate-200 bg-white">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tên thư mục ..."
                  value={folderSearchQuery}
                  onChange={(e) => setFolderSearchQuery(e.target.value)}
                  className="w-full pl-2 pr-7 py-1 rounded border border-slate-300 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-500 bg-white"
                />
                <Search className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Scope Tabs: Thư mục công khai | Thư mục nội bộ */}
            <div className="flex border-b border-slate-200 bg-slate-100 text-xs font-bold text-slate-600">
              <button
                type="button"
                onClick={() => {
                  setActiveScope('public');
                  setSelectedFolderId('album-activities');
                }}
                className={`flex-1 py-1.5 text-center transition-colors border-r border-slate-200 cursor-pointer ${
                  activeScope === 'public'
                    ? 'bg-amber-100 text-amber-900 border-b-2 border-b-amber-500'
                    : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                Thư mục công khai
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveScope('internal');
                  setSelectedFolderId('album-violations');
                }}
                className={`flex-1 py-1.5 text-center transition-colors cursor-pointer ${
                  activeScope === 'internal'
                    ? 'bg-amber-100 text-amber-900 border-b-2 border-b-amber-500'
                    : 'hover:bg-slate-200 text-slate-600'
                }`}
              >
                Thư mục nội bộ
              </button>
            </div>

            {/* Folder Tree Scrollable List */}
            <div className="flex-1 overflow-y-auto p-1.5 space-y-0.5 scrollbar-thin">
              {folderTree.rootFolders.map(root => renderFolderTreeNode(root, 0))}
            </div>
          </div>

          {/* ==================== RIGHT COLUMN: FILES GRID ==================== */}
          <div className="flex-1 flex flex-col overflow-hidden bg-white">
            
            {/* Search Files & Folder Path Bar */}
            <div className="p-2.5 border-b border-slate-200 bg-slate-50 flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5">
              <span className="text-xs font-bold text-slate-700 truncate flex items-center gap-1.5 min-w-0">
                <FolderOpen className="w-4 h-4 text-amber-500 fill-amber-400 shrink-0" />
                <span className="truncate">{currentFolder?.name || 'Tệp tin gần đây'}</span>
                <span className="text-slate-400 font-normal shrink-0">({filteredFiles.length} tệp)</span>
              </span>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="px-3 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-sm transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>+ Tải Ảnh Vào Thư Mục</span>
                </button>

                <div className="relative w-40 sm:w-56">
                  <input
                    type="text"
                    placeholder="Tìm tệp tin..."
                    value={fileSearchQuery}
                    onChange={(e) => {
                      setFileSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full pl-2 pr-7 py-1 rounded border border-slate-300 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 bg-white"
                  />
                  <Search className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Files Grid View */}
            <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
              {filteredFiles.length === 0 ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center h-full min-h-[260px] border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl bg-slate-50/60 hover:bg-blue-50/30 text-center text-slate-400 transition-all cursor-pointer p-6 group"
                >
                  <div className="w-14 h-14 rounded-2xl bg-blue-100/70 text-blue-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                    <Upload className="w-7 h-7" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-700 mb-1">Thư mục "{currentFolder?.name}" chưa có tệp tin</h4>
                  <p className="text-xs text-slate-500 max-w-sm mb-3">
                    Kéo thả file ảnh (JPG, PNG, WEBP, SVG) vào đây hoặc bấm nút bên dưới để chọn ảnh từ máy tính.
                  </p>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <Upload className="w-4 h-4" />
                    <span>Chọn Ảnh Từ Máy Tính</span>
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {paginatedFiles.map(item => {
                    const isSelected = selectedFileIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={(e) => handleSelectFile(item.id, e)}
                        onDoubleClick={() => handleDoubleClickFile(item)}
                        className={`group relative rounded border p-1.5 flex flex-col items-center cursor-pointer transition-all ${
                          isSelected 
                            ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 shadow-sm' 
                            : 'bg-white border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                        }`}
                        title={`${item.title}\nNhấp đúp để xem hoặc chèn`}
                      >
                        {/* Thumbnail Square Frame */}
                        <div className="w-full aspect-square bg-slate-100 rounded overflow-hidden flex items-center justify-center relative border border-slate-200/80">
                          <img
                            src={item.url}
                            alt={item.title}
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://placehold.co/200x200/f1f5f9/94a3b8?text=file-icon';
                            }}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />

                          {/* Quick Eye Button on Hover */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setInspectingItem(item);
                            }}
                            className="absolute bottom-1 right-1 p-1 bg-black/60 hover:bg-black/80 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity"
                            title="Xem chi tiết"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </div>

                        {/* File Name Label */}
                        <p className="w-full text-center text-[11px] font-medium text-slate-700 mt-1 truncate px-1">
                          {item.title}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* ============================================================== */}
            {/* 4. BOTTOM PAGINATION BAR                                       */}
            {/* ============================================================== */}
            <div className="px-4 py-2 bg-slate-100 border-t border-slate-200 flex items-center justify-center gap-1.5 shrink-0 select-none text-xs">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 disabled:opacity-40 hover:bg-slate-50 font-medium"
              >
                Trước
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`w-7 h-7 rounded font-bold text-xs ${
                    currentPage === page 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="px-2.5 py-1 rounded bg-white border border-slate-300 text-slate-700 disabled:opacity-40 hover:bg-slate-50 font-medium"
              >
                Sau
              </button>
            </div>

          </div>
        </div>

        {/* ============================================================== */}
        {/* ============================================================== */}
        {/* 5. MODALS & POPUPS                                             */}
        {/* ============================================================== */}

        {/* MODAL: Thêm thư mục mới */}
        {isNewFolderModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-sm p-4 space-y-3 text-slate-800">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <FolderPlus className="w-4 h-4 text-amber-500 fill-amber-400" />
                  <span>Tạo Thư Mục Mới</span>
                </h4>
                <button onClick={() => setIsNewFolderModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleCreateNewFolder} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên thư mục *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={folderNameInput}
                    onChange={(e) => setFolderNameInput(e.target.value)}
                    placeholder="Nhập tên thư mục mới..."
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Tạo trong: <strong className="text-slate-700">{currentFolder?.name || 'Thư mục gốc'}</strong> ({activeScope === 'public' ? 'Công khai' : 'Nội bộ'})
                  </p>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsNewFolderModalOpen(false)}
                    className="px-3 py-1.5 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                  >
                    Tạo thư mục
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Đổi tên thư mục */}
        {isRenameFolderModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-sm p-4 space-y-3 text-slate-800">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <FolderEdit className="w-4 h-4 text-blue-600" />
                  <span>Đổi Tên Thư Mục</span>
                </h4>
                <button onClick={() => setIsRenameFolderModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRenameFolder} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên mới của thư mục *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={folderNameInput}
                    onChange={(e) => setFolderNameInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsRenameFolderModalOpen(false)}
                    className="px-3 py-1.5 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                  >
                    Lưu đổi tên
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Đổi tên tệp tin */}
        {isRenameFileModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-sm p-4 space-y-3 text-slate-800">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <Edit3 className="w-4 h-4 text-blue-600" />
                  <span>Đổi Tên Tệp Tin</span>
                </h4>
                <button onClick={() => setIsRenameFileModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleRenameFile} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên tệp tin mới *</label>
                  <input
                    type="text"
                    required
                    autoFocus
                    value={fileNameInput}
                    onChange={(e) => setFileNameInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsRenameFileModalOpen(false)}
                    className="px-3 py-1.5 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                  >
                    Lưu tên tệp
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: Di chuyển tệp tin sang thư mục khác */}
        {isMoveFileModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-sm p-4 space-y-3 text-slate-800">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <Move className="w-4 h-4 text-blue-600" />
                  <span>Di Chuyển {selectedFileIds.length} Tệp Tin</span>
                </h4>
                <button onClick={() => setIsMoveFileModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-700">Chọn Thư Mục Đích Đến:</label>
                <select
                  value={targetMoveFolderId}
                  onChange={(e) => setTargetMoveFolderId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 text-slate-900 bg-white focus:outline-none focus:border-blue-500"
                >
                  {mediaFolders.map(folder => (
                    <option key={folder.id} value={folder.id} className="text-slate-900 bg-white">
                      📁 {folder.name} ({folder.scope === 'internal' ? 'Nội bộ' : 'Công khai'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setIsMoveFileModalOpen(false)}
                  className="px-3 py-1.5 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={handleMoveFiles}
                  className="px-4 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-sm"
                >
                  Xác nhận di chuyển
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: Thêm từ URL ngoài */}
        {isExternalUrlModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-xl border border-slate-300 w-full max-w-md p-4 space-y-3 text-slate-800">
              <div className="flex items-center justify-between border-b pb-2">
                <h4 className="font-bold text-sm text-slate-800 flex items-center gap-1.5">
                  <ExternalLink className="w-4 h-4 text-blue-600" />
                  <span>Dán Liên Kết Hình Ảnh Ngoài (URL)</span>
                </h4>
                <button onClick={() => setIsExternalUrlModalOpen(false)} className="text-slate-400 hover:text-slate-700">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleAddExternalUrl} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Đường dẫn ảnh (URL) *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://example.com/image.jpg..."
                    value={externalUrlInput}
                    onChange={(e) => setExternalUrlInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Tên tệp tin mô tả</label>
                  <input
                    type="text"
                    placeholder="Ví dụ: logo truong.jpg"
                    value={externalTitleInput}
                    onChange={(e) => setExternalTitleInput(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs rounded border border-slate-300 text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button
                    type="button"
                    onClick={() => setIsExternalUrlModalOpen(false)}
                    className="px-3 py-1.5 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    disabled={isUploading}
                    className="px-4 py-1.5 text-xs rounded bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50 shadow-sm"
                  >
                    {isUploading ? 'Đang lưu...' : 'Lưu vào thư mục'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DIALOG: XÁC NHẬN XÓA (Thư mục / Tệp tin) */}
        {deleteDialog.isOpen && (
          <div className="fixed inset-0 z-[60] bg-black/60 flex items-center justify-center p-4 animate-fadeIn">
            <div className="bg-white rounded-lg shadow-2xl border border-red-300 w-full max-w-sm p-4 space-y-3 animate-scaleIn">
              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-5 h-5" />
              </div>

              <div className="text-center space-y-1">
                <h4 className="font-bold text-sm text-slate-800">
                  {deleteDialog.type === 'folder' && `Xác nhận xóa thư mục "${deleteDialog.targetFolder?.name}"?`}
                  {deleteDialog.type === 'singleFile' && `Xác nhận xóa tệp "${deleteDialog.targetFile?.title}"?`}
                  {deleteDialog.type === 'batchFiles' && `Xác nhận xóa ${deleteDialog.batchIds?.length} tệp đã chọn?`}
                </h4>
                <p className="text-xs text-slate-500">
                  {deleteDialog.type === 'folder' && 'Toàn bộ tệp tin bên trong sẽ được chuyển an toàn về thư mục dùng chung.'}
                  {(deleteDialog.type === 'singleFile' || deleteDialog.type === 'batchFiles') && 'Tệp tin này sẽ bị xóa khỏi hệ thống.'}
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setDeleteDialog({ isOpen: false, type: 'singleFile' })}
                  className="px-3 py-1.5 text-xs rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={executeDelete}
                  className="px-4 py-1.5 text-xs rounded bg-red-600 hover:bg-red-700 text-white font-bold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa vĩnh viễn</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LIGHTBOX: XEM TRƯỚC HÌNH ẢNH TOÀN MÀN HÌNH & TÙY CHỌN 1-CLICK SET BRANDING */}
        {inspectingItem && (
          <div className="fixed inset-0 z-[80] bg-black/95 flex flex-col animate-fadeIn">
            <div className="flex flex-wrap items-center justify-between px-4 sm:px-6 py-2.5 border-b border-slate-800 bg-slate-900 text-white gap-2">
              <div className="flex items-center space-x-3 truncate">
                <FileImage className="w-5 h-5 text-blue-400 shrink-0" />
                <div className="truncate">
                  <h4 className="font-bold text-sm truncate">{inspectingItem.title}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">{inspectingItem.sizeFormatted || 'WebP'}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                {/* 1-Click Quick Branding Actions */}
                <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-lg border border-slate-700">
                  <button
                    type="button"
                    onClick={async () => {
                      await updateSchoolSettings({ logoUrl: inspectingItem.url });
                      showToast('🏫 Đã đặt ảnh này làm Logo Trường THPT Quang Trung!');
                    }}
                    className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="Đặt làm Logo trường học"
                  >
                    🏫 Làm Logo
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateSchoolSettings({ youthUnionLogoUrl: inspectingItem.url });
                      showToast('⭐ Đã đặt ảnh này làm Huy hiệu Đoàn!');
                    }}
                    className="px-2 py-1 rounded bg-red-600 hover:bg-red-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="Đặt làm Huy hiệu Đoàn"
                  >
                    ⭐ Làm Huy Hiệu
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      await updateSchoolSettings({ bannerTopImage: inspectingItem.url });
                      showToast('🖼️ Đã đặt ảnh này làm Banner Đầu Trang!');
                    }}
                    className="px-2 py-1 rounded bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="Đặt làm Banner Đầu Trang"
                  >
                    🖼️ Làm Banner
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      addActivitySlide({
                        title: inspectingItem.title.replace(/\.[^/.]+$/, ''),
                        subtitle: 'Hoạt động phong trào Đoàn trường THPT Quang Trung',
                        imageUrl: inspectingItem.url,
                        date: new Date().toLocaleDateString('vi-VN'),
                        tag: 'Phong trào',
                        isActive: true,
                        order: 1
                      });
                      showToast('🎠 Đã thêm ảnh vào Slide Trình Chiếu Hoạt Động!');
                    }}
                    className="px-2 py-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                    title="Thêm vào Slide Ảnh Trang Chủ"
                  >
                    🎠 Thêm Slide
                  </button>
                </div>

                <div className="flex items-center gap-1 ml-1">
                  <button
                    onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.25))}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Thu nhỏ"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-xs font-mono w-9 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel(prev => Math.min(3, prev + 0.25))}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Phóng to"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setRotation(prev => (prev + 90) % 360)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                    title="Xoay"
                  >
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(inspectingItem.url);
                      setCopiedId(inspectingItem.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 cursor-pointer"
                    title="Sao chép link CDN"
                  >
                    {copiedId === inspectingItem.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedId === inspectingItem.id ? 'Đã copy' : 'Copy link'}</span>
                  </button>
                  <button
                    onClick={() => setInspectingItem(null)}
                    className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer ml-1"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
              <img
                src={inspectingItem.url}
                alt={inspectingItem.title}
                style={{
                  transform: `scale(${zoomLevel}) rotate(${rotation}deg)`,
                  transition: 'transform 0.15s ease-out'
                }}
                className="max-h-[75vh] max-w-full object-contain rounded shadow-2xl"
              />
            </div>

            {allowSelect && onSelect && (
              <div className="px-6 py-3 bg-slate-900 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => {
                    onSelect(inspectingItem.url);
                    setInspectingItem(null);
                    onClose();
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95"
                >
                  Chọn Tệp Tin Này
                </button>
              </div>
            )}
          </div>
        )}

        {/* Uploading Spinner Overlay */}
        {isUploading && (
          <div className="absolute inset-0 z-[80] bg-slate-950/70 backdrop-blur-sm flex flex-col items-center justify-center text-white space-y-3 animate-fadeIn">
            <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center shadow-glow animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin text-white" />
            </div>
            <div className="text-center">
              <h4 className="text-base font-black text-white">Đang tải và đồng bộ ảnh lên Cloud...</h4>
              <p className="text-xs text-blue-200 mt-1">Đang nén chuẩn WebP và lưu vào Supabase Storage</p>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-[95] px-4 py-3 rounded-2xl bg-slate-900 text-white font-bold text-xs shadow-2xl border border-slate-700 flex items-center gap-2.5 animate-slideUp">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

      </div>
    </div>
  );
};
