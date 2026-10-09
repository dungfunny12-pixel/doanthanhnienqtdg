import React, { useState, useMemo, useRef } from 'react';
import { 
  X, 
  Search, 
  Filter, 
  Upload, 
  Download, 
  Folder, 
  FolderPlus, 
  FileText, 
  FileSpreadsheet, 
  File, 
  Plus, 
  Trash2, 
  Edit3, 
  Copy, 
  Check, 
  ExternalLink, 
  Eye, 
  Star, 
  Tag, 
  Calendar, 
  User, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Grid, 
  List as ListIcon, 
  ArrowUpDown, 
  Share2, 
  FileCheck,
  ChevronRight,
  MoreVertical,
  Layers,
  FolderOpen,
  ArrowRight,
  HardDrive
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DocumentFile, DocumentFolder, DocumentFileType, DocumentCategory } from '../../types';
import { DocumentViewerModal } from './DocumentViewerModal';
import { SupabaseService } from '../../services/supabaseService';
import { isSupabaseConfigured } from '../../lib/supabase';

export interface DocumentManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect?: (doc: DocumentFile) => void;
  onPreview?: (doc: DocumentFile) => void;
  title?: string;
  defaultFolderId?: string;
  defaultCategory?: DocumentCategory | 'all';
  allowSelect?: boolean;
  allowManageFolders?: boolean;
  allowUpload?: boolean;
  allowDelete?: boolean;
}

export const DocumentManagerModal: React.FC<DocumentManagerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  onPreview,
  title = 'KHO VĂN BẢN & BIỂU MẪU ĐOÀN DÙNG CHUNG',
  defaultFolderId,
  defaultCategory = 'all',
  allowSelect = false,
  allowManageFolders = true,
  allowUpload = true,
  allowDelete = true
}) => {
  const { 
    currentUser, 
    documentFolders, 
    documentFiles, 
    addDocumentFolder, 
    updateDocumentFolder, 
    deleteDocumentFolder, 
    addDocumentFile, 
    updateDocumentFile, 
    deleteDocumentFile, 
    incrementDocumentDownloads,
    incrementDocumentViews,
    moveDocumentFile 
  } = useApp();

  // Navigation & Filtering
  const [selectedFolderId, setSelectedFolderId] = useState<string | 'ALL' | 'PINNED' | 'PUBLIC'>(defaultFolderId || 'ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>(defaultCategory);
  const [selectedFormat, setSelectedFormat] = useState<DocumentFileType | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name' | 'downloads'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Preview & Inspect State
  const [viewingDoc, setViewingDoc] = useState<DocumentFile | null>(null);

  // Folder CRUD Modal State
  const [isFolderModalOpen, setIsFolderModalOpen] = useState(false);
  const [editingFolder, setEditingFolder] = useState<DocumentFolder | null>(null);
  const [folderForm, setFolderForm] = useState({
    name: '',
    code: '',
    description: '',
    color: 'blue' as string,
    icon: 'folder' as string
  });

  // Document Upload & Edit Modal State
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState<DocumentFile | null>(null);
  const [docForm, setDocForm] = useState({
    title: '',
    fileNumber: '',
    fileName: '',
    fileUrl: '',
    fileSize: '',
    fileType: 'pdf' as DocumentFileType,
    folderId: 'folder-forms',
    category: 'form' as DocumentCategory,
    publishDate: new Date().toISOString().split('T')[0],
    signDate: '',
    signer: currentUser?.name || 'Cô Zdrăm Thị Thành Thương',
    signerRole: currentUser?.roleTitle || 'Bí thư Đoàn Trường',
    tags: '',
    isPublic: true,
    isPinned: false,
    description: '',
    version: 'v1.0'
  });

  // Move Document State
  const [movingDoc, setMovingDoc] = useState<DocumentFile | null>(null);
  const [targetMoveFolderId, setTargetMoveFolderId] = useState<string>('folder-forms');

  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Filtered Documents
  const filteredDocuments = useMemo(() => {
    let result = [...documentFiles];

    // Filter by Folder / Special views
    if (selectedFolderId === 'PINNED') {
      result = result.filter(d => d.isPinned);
    } else if (selectedFolderId === 'PUBLIC') {
      result = result.filter(d => d.isPublic);
    } else if (selectedFolderId !== 'ALL') {
      result = result.filter(d => d.folderId === selectedFolderId);
    }

    // Filter by Category
    if (selectedCategory !== 'all') {
      result = result.filter(d => d.category === selectedCategory);
    }

    // Filter by File Format
    if (selectedFormat !== 'all') {
      result = result.filter(d => d.fileType === selectedFormat);
    }

    // Search query (title, fileNumber, signer, tags, description)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(d => 
        d.title.toLowerCase().includes(q) ||
        (d.fileNumber && d.fileNumber.toLowerCase().includes(q)) ||
        (d.signer && d.signer.toLowerCase().includes(q)) ||
        (d.description && d.description.toLowerCase().includes(q)) ||
        (d.tags && d.tags.some(t => t.toLowerCase().includes(q)))
      );
    }

    // Sorting
    result.sort((a, b) => {
      if (sortBy === 'newest') return new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime();
      if (sortBy === 'oldest') return new Date(a.publishDate).getTime() - new Date(b.publishDate).getTime();
      if (sortBy === 'name') return a.title.localeCompare(b.title, 'vi');
      if (sortBy === 'downloads') return (b.downloadsCount || 0) - (a.downloadsCount || 0);
      return 0;
    });

    return result;
  }, [documentFiles, selectedFolderId, selectedCategory, selectedFormat, searchQuery, sortBy]);

  // Current selected folder object
  const currentFolder = documentFolders.find(f => f.id === selectedFolderId);

  // Handle Create / Edit Folder
  const handleOpenFolderModal = (folder?: DocumentFolder) => {
    if (folder) {
      setEditingFolder(folder);
      setFolderForm({
        name: folder.name,
        code: folder.code || '',
        description: folder.description || '',
        color: folder.color || 'blue',
        icon: folder.icon || 'folder'
      });
    } else {
      setEditingFolder(null);
      setFolderForm({
        name: '',
        code: '',
        description: '',
        color: 'blue',
        icon: 'folder'
      });
    }
    setIsFolderModalOpen(true);
  };

  const handleSaveFolder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!folderForm.name.trim()) return;

    if (editingFolder) {
      updateDocumentFolder(editingFolder.id, {
        name: folderForm.name,
        code: folderForm.code,
        description: folderForm.description,
        color: folderForm.color,
        icon: folderForm.icon
      });
    } else {
      addDocumentFolder({
        name: folderForm.name,
        code: folderForm.code || undefined,
        description: folderForm.description || undefined,
        parentId: null,
        color: folderForm.color,
        icon: folderForm.icon,
        isSystem: false
      });
    }
    setIsFolderModalOpen(false);
    setEditingFolder(null);
  };

  const handleDeleteFolder = (folder: DocumentFolder) => {
    if (confirm(`Bạn có chắc chắn muốn xóa thư mục "${folder.name}"?`)) {
      const res = deleteDocumentFolder(folder.id);
      if (!res.success) {
        alert(res.message);
      } else if (selectedFolderId === folder.id) {
        setSelectedFolderId('ALL');
      }
    }
  };

  // Handle Document Upload & Edit
  const handleOpenDocModal = (doc?: DocumentFile) => {
    if (doc) {
      setEditingDoc(doc);
      setDocForm({
        title: doc.title,
        fileNumber: doc.fileNumber || '',
        fileName: doc.fileName,
        fileUrl: doc.fileUrl,
        fileSize: doc.fileSize,
        fileType: doc.fileType,
        folderId: doc.folderId,
        category: doc.category,
        publishDate: doc.publishDate,
        signDate: doc.signDate || '',
        signer: doc.signer || '',
        signerRole: doc.signerRole || '',
        tags: doc.tags ? doc.tags.join(', ') : '',
        isPublic: doc.isPublic,
        isPinned: Boolean(doc.isPinned),
        description: doc.description || '',
        version: doc.version || 'v1.0'
      });
    } else {
      setEditingDoc(null);
      setDocForm({
        title: '',
        fileNumber: '',
        fileName: '',
        fileUrl: '',
        fileSize: '100 KB',
        fileType: 'pdf',
        folderId: selectedFolderId !== 'ALL' && selectedFolderId !== 'PINNED' && selectedFolderId !== 'PUBLIC' ? selectedFolderId : 'folder-forms',
        category: 'form',
        publishDate: new Date().toISOString().split('T')[0],
        signDate: '',
        signer: currentUser?.name || 'Cô Zdrăm Thị Thành Thương',
        signerRole: currentUser?.roleTitle || 'Bí thư Đoàn Trường',
        tags: '',
        isPublic: true,
        isPinned: false,
        description: '',
        version: 'v1.0'
      });
    }
    setIsDocModalOpen(true);
  };

  const handleFileUploadChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      let fileUrl = '#';
      if (isSupabaseConfigured()) {
        const uploadedUrl = await SupabaseService.uploadImage(file, 'media');
        if (uploadedUrl) {
          fileUrl = uploadedUrl;
        }
      }

      // Infer file type from extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      let fileType: DocumentFileType = 'other';
      if (ext === 'pdf') fileType = 'pdf';
      else if (ext === 'doc' || ext === 'docx') fileType = 'docx';
      else if (ext === 'xls' || ext === 'xlsx') fileType = 'xlsx';
      else if (ext === 'ppt' || ext === 'pptx') fileType = 'pptx';
      else if (ext === 'zip' || ext === 'rar') fileType = 'zip';

      const sizeFormatted = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      // Auto fill title if empty
      const titleFromFile = file.name.replace(/\.[^/.]+$/, '').replace(/_/g, ' ');

      setDocForm(prev => ({
        ...prev,
        fileName: file.name,
        fileUrl: fileUrl !== '#' ? fileUrl : prev.fileUrl,
        fileSize: sizeFormatted,
        fileType,
        title: prev.title || titleFromFile
      }));
    } catch (err) {
      console.error('File upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveDoc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docForm.title.trim()) return;

    const tagArray = docForm.tags.split(',').map(t => t.trim()).filter(Boolean);

    if (editingDoc) {
      updateDocumentFile(editingDoc.id, {
        title: docForm.title,
        fileNumber: docForm.fileNumber || undefined,
        fileName: docForm.fileName || `${docForm.title}.${docForm.fileType}`,
        fileUrl: docForm.fileUrl,
        fileSize: docForm.fileSize,
        fileType: docForm.fileType,
        folderId: docForm.folderId,
        category: docForm.category,
        publishDate: docForm.publishDate,
        signDate: docForm.signDate || undefined,
        signer: docForm.signer,
        signerRole: docForm.signerRole,
        tags: tagArray,
        isPublic: docForm.isPublic,
        isPinned: docForm.isPinned,
        description: docForm.description,
        version: docForm.version
      });
    } else {
      addDocumentFile({
        title: docForm.title,
        fileNumber: docForm.fileNumber || undefined,
        fileName: docForm.fileName || `${docForm.title}.${docForm.fileType}`,
        fileUrl: docForm.fileUrl || 'https://mvkvfvxfcqxdabxumroz.supabase.co/storage/v1/object/public/media/bieu_mau_chuan.docx',
        fileSize: docForm.fileSize || '150 KB',
        fileType: docForm.fileType,
        folderId: docForm.folderId,
        category: docForm.category,
        publishDate: docForm.publishDate,
        signDate: docForm.signDate || undefined,
        signer: docForm.signer,
        signerRole: docForm.signerRole,
        tags: tagArray,
        isPublic: docForm.isPublic,
        isPinned: docForm.isPinned,
        description: docForm.description,
        version: docForm.version || 'v1.0',
        uploadedBy: currentUser ? { id: currentUser.id, name: currentUser.name, role: currentUser.roleTitle } : 'BCH Đoàn'
      });
    }

    setIsDocModalOpen(false);
    setEditingDoc(null);
  };

  const handleDeleteDoc = (doc: DocumentFile) => {
    if (confirm(`Bạn có chắc chắn muốn xóa văn bản "${doc.title}"?`)) {
      deleteDocumentFile(doc.id);
    }
  };

  const handleDownload = (doc: DocumentFile) => {
    incrementDocumentDownloads(doc.id);
  };

  const handleViewPreview = (doc: DocumentFile) => {
    incrementDocumentViews(doc.id);
    setViewingDoc(doc);
  };

  const handleMoveFileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (movingDoc && targetMoveFolderId) {
      moveDocumentFile(movingDoc.id, targetMoveFolderId);
      setMovingDoc(null);
    }
  };

  const getFormatBadge = (type: string) => {
    switch (type) {
      case 'pdf':
        return <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 font-bold text-[10px]">PDF</span>;
      case 'docx':
        return <span className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800 font-bold text-[10px]">DOCX</span>;
      case 'xlsx':
        return <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-bold text-[10px]">XLSX</span>;
      case 'pptx':
        return <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 font-bold text-[10px]">PPTX</span>;
      case 'zip':
        return <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-bold text-[10px]">ZIP</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold text-[10px]">FILE</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="glass-modal max-w-7xl w-full h-[94vh] flex flex-col rounded-3xl border border-slate-700 shadow-2xl overflow-hidden bg-slate-950 text-slate-100">
        
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{title}</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 border border-blue-800 text-xs font-mono font-bold">
                  {documentFiles.length} tệp
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Quản lý cây thư mục, biểu mẫu chuẩn Đoàn trường, công văn chỉ đạo, kế hoạch năm học & báo cáo lưu chiểu
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenDocModal()}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-glow transition-all active:scale-95 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span className="hidden sm:inline">Tải Lên Văn Bản / Biểu Mẫu</span>
              <span className="sm:hidden">Tải Lên</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-2xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
              title="Đóng (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main 2-Column Layout */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          
          {/* Left Sidebar: Folder Tree */}
          <div className="w-full md:w-72 lg:w-80 border-r border-slate-800 bg-slate-950/60 p-4 flex flex-col justify-between overflow-y-auto custom-scrollbar shrink-0">
            <div className="space-y-4">
              
              {/* Quick Navigation Items */}
              <div className="space-y-1">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider px-2">Truy cập nhanh</span>
                
                <button
                  type="button"
                  onClick={() => setSelectedFolderId('ALL')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${selectedFolderId === 'ALL'
                    ? 'bg-blue-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Folder className="w-4 h-4 text-blue-400" />
                    <span>Tất Cả Tài Liệu</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/30">
                    {documentFiles.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFolderId('PINNED')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${selectedFolderId === 'PINNED'
                    ? 'bg-amber-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400/30" />
                    <span>Văn Bản Ghim / Quan Trọng</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/30">
                    {documentFiles.filter(d => d.isPinned).length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedFolderId('PUBLIC')}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all ${selectedFolderId === 'PUBLIC'
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Tải Về Công Khai (Trang Chủ)</span>
                  </div>
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-black/30">
                    {documentFiles.filter(d => d.isPublic).length}
                  </span>
                </button>
              </div>

              {/* Folder List */}
              <div className="space-y-1 pt-2 border-t border-slate-800/80">
                <div className="flex items-center justify-between px-2 pb-1">
                  <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">Thư Mục Phân Cấp ({documentFolders.length})</span>
                  <button
                    type="button"
                    onClick={() => handleOpenFolderModal()}
                    className="p-1 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                    title="Tạo Thư Mục Mới"
                  >
                    <FolderPlus className="w-4 h-4" />
                  </button>
                </div>

                {documentFolders.map(f => {
                  const count = documentFiles.filter(d => d.folderId === f.id).length;
                  const isSelected = selectedFolderId === f.id;

                  return (
                    <div
                      key={f.id}
                      className={`group flex items-center justify-between p-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${isSelected
                        ? 'bg-slate-800 text-white border border-slate-700 shadow-md'
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                      }`}
                      onClick={() => setSelectedFolderId(f.id)}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">📁</span>
                        <span className="truncate">{f.name}</span>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-950 text-slate-400 border border-slate-800">
                          {count}
                        </span>

                        {!f.isSystem && (
                          <div className="hidden group-hover:flex items-center gap-0.5 ml-1">
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleOpenFolderModal(f); }}
                              className="p-1 rounded hover:bg-slate-700 text-slate-400 hover:text-white"
                              title="Sửa thư mục"
                            >
                              <Edit3 className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f); }}
                              className="p-1 rounded hover:bg-red-950 text-slate-400 hover:text-red-400"
                              title="Xóa thư mục"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

            </div>

            {/* Bottom Button */}
            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleOpenFolderModal()}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs flex items-center justify-center gap-2 border border-slate-800 transition-colors"
              >
                <FolderPlus className="w-4 h-4 text-blue-400" />
                <span>Thêm Thư Mục Mới</span>
              </button>
            </div>

          </div>

          {/* Right Area: Search, Filters & Document List */}
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-950 p-4 sm:p-5 space-y-4">
            
            {/* Filter Toolbar */}
            <div className="space-y-3 shrink-0">
              
              {/* Row 1: Search & Quick Actions */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Tìm tên văn bản, số hiệu công văn, người ký, từ khóa..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    >
                      ✕
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-white font-bold text-xs"
                  >
                    <option value="newest">📅 Mới nhất trước</option>
                    <option value="oldest">📅 Cũ nhất trước</option>
                    <option value="name">🔤 Tên A → Z</option>
                    <option value="downloads">🔥 Tải nhiều nhất</option>
                  </select>

                  <div className="flex items-center bg-slate-900 rounded-xl p-1 border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setViewMode('grid')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Xem dạng Lưới thẻ"
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewMode('table')}
                      className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'}`}
                      title="Xem dạng Danh sách chi tiết"
                    >
                      <ListIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Row 2: Category & Format Filter Pills */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="text-slate-500 font-bold text-[11px]">Phân loại:</span>
                
                <button
                  type="button"
                  onClick={() => setSelectedCategory('all')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-[11px] ${selectedCategory === 'all'
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  Tất Cả
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('form')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-[11px] ${selectedCategory === 'form'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  📋 Biểu Mẫu
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('directive')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-[11px] ${selectedCategory === 'directive'
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  🏛️ Công Văn
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('plan')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-[11px] ${selectedCategory === 'plan'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  🏆 Kế Hoạch
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('handbook')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-[11px] ${selectedCategory === 'handbook'
                    ? 'bg-purple-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  📚 Cẩm Nang
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedCategory('report')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-[11px] ${selectedCategory === 'report'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  📊 Báo Cáo
                </button>

                <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

                <span className="text-slate-500 font-bold text-[11px] hidden sm:inline">Định dạng:</span>
                {(['all', 'pdf', 'docx', 'xlsx', 'pptx', 'zip'] as const).map(fmt => (
                  <button
                    key={fmt}
                    type="button"
                    onClick={() => setSelectedFormat(fmt)}
                    className={`px-2.5 py-1 rounded-lg font-bold uppercase transition-all text-[10px] font-mono ${selectedFormat === fmt
                      ? 'bg-slate-600 text-white'
                      : 'bg-slate-900/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {fmt}
                  </button>
                ))}
              </div>

            </div>

            {/* Breadcrumb & Stats Bar */}
            <div className="p-3 bg-slate-900/50 rounded-2xl border border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs shrink-0">
              <div className="flex items-center gap-2 text-slate-300">
                <Folder className="w-4 h-4 text-blue-400" />
                <span className="font-bold text-white">
                  {selectedFolderId === 'ALL' ? 'Toàn Bộ Thư Mục' : selectedFolderId === 'PINNED' ? 'Văn Bản Ghim' : selectedFolderId === 'PUBLIC' ? 'Tài Liệu Công Khai' : (currentFolder?.name || 'Thư Mục')}
                </span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-slate-400 font-mono">
                  Hiển thị <strong>{filteredDocuments.length}</strong> / {documentFiles.length} tệp
                </span>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                <span>🔥 Tổng lượt tải: <strong>{filteredDocuments.reduce((acc, d) => acc + (d.downloadsCount || 0), 0)}</strong></span>
              </div>
            </div>

            {/* Main Documents Grid / Table View */}
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
              
              {filteredDocuments.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-900/30 rounded-3xl border border-dashed border-slate-800">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 text-slate-500 flex items-center justify-center text-2xl mb-3">
                    📁
                  </div>
                  <h4 className="text-sm font-bold text-white">Không tìm thấy tài liệu phù hợp</h4>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Thử thay đổi bộ lọc, chọn thư mục khác hoặc nhấn nút tải lên văn bản mới.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleOpenDocModal()}
                    className="mt-4 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs"
                  >
                    + Tải Lên Văn Bản Ngay
                  </button>
                </div>
              ) : viewMode === 'grid' ? (
                /* GRID VIEW */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                  {filteredDocuments.map(doc => {
                    const docFolder = documentFolders.find(f => f.id === doc.folderId);

                    return (
                      <div
                        key={doc.id}
                        className="group p-4 rounded-2xl bg-slate-900/70 border border-slate-800/90 hover:border-slate-700 hover:bg-slate-900 flex flex-col justify-between space-y-3 transition-all relative"
                      >
                        <div className="space-y-2.5">
                          
                          {/* Card Top: Badges & Actions */}
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex flex-wrap items-center gap-1.5">
                              {getFormatBadge(doc.fileType)}
                              {doc.fileNumber && (
                                <span className="px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 font-mono font-bold text-[10px] border border-slate-800">
                                  {doc.fileNumber}
                                </span>
                              )}
                              {doc.isPinned && (
                                <span className="p-0.5 text-amber-400" title="Văn bản quan trọng được ghim">
                                  ⭐
                                </span>
                              )}
                            </div>

                            <span className="text-[10px] text-slate-400 font-mono">
                              {doc.fileSize}
                            </span>
                          </div>

                          {/* Title */}
                          <h4 
                            onClick={() => handleViewPreview(doc)}
                            className="font-bold text-white text-xs sm:text-sm leading-snug cursor-pointer group-hover:text-blue-400 transition-colors line-clamp-2"
                            title={doc.title}
                          >
                            {doc.title}
                          </h4>

                          {/* Description excerpt */}
                          {doc.description && (
                            <p className="text-slate-400 text-[11px] line-clamp-2 leading-relaxed">
                              {doc.description}
                            </p>
                          )}

                          {/* Metadata */}
                          <div className="space-y-1 pt-1 text-[10px] text-slate-400 border-t border-slate-800/60">
                            <div className="flex items-center justify-between">
                              <span>📁 {docFolder?.name || 'Chung'}</span>
                              <span className="font-mono">📅 {doc.publishDate}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="truncate max-w-[140px]">✍️ {doc.signer || 'BCH Đoàn'}</span>
                              <span>📥 {doc.downloadsCount || 0} lượt tải</span>
                            </div>
                          </div>

                        </div>

                        {/* Card Footer: Action Buttons */}
                        <div className="pt-2.5 border-t border-slate-800 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleViewPreview(doc)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-colors"
                              title="Xem chi tiết"
                            >
                              <Eye className="w-3.5 h-3.5 text-blue-400" />
                              <span>Xem</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setMovingDoc(doc);
                                setTargetMoveFolderId(doc.folderId);
                              }}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] transition-colors"
                              title="Chuyển thư mục"
                            >
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenDocModal(doc)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-[11px] transition-colors"
                              title="Chỉnh sửa thông tin"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteDoc(doc)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 text-[11px] transition-colors"
                              title="Xóa tệp"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {allowSelect && onSelect ? (
                            <button
                              type="button"
                              onClick={() => { onSelect(doc); onClose(); }}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Chọn</span>
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleViewPreview(doc)}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-bold text-[11px] flex items-center gap-1 shadow-sm"
                            >
                              <Download className="w-3.5 h-3.5" />
                              <span>Tải File</span>
                            </button>
                          )}
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                /* TABLE VIEW */
                <div className="overflow-x-auto rounded-2xl border border-slate-800">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-900/80 text-slate-400 font-bold text-[11px]">
                        <th className="p-3">Tên Văn Bản / Biểu Mẫu</th>
                        <th className="p-3">Số Hiệu</th>
                        <th className="p-3">Thư Mục</th>
                        <th className="p-3">Định Dạng</th>
                        <th className="p-3">Ngày Ban Hành</th>
                        <th className="p-3">Người Ký</th>
                        <th className="p-3 text-center">Lượt Tải</th>
                        <th className="p-3 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {filteredDocuments.map(doc => {
                        const docFolder = documentFolders.find(f => f.id === doc.folderId);

                        return (
                          <tr key={doc.id} className="hover:bg-slate-900/60 transition-colors">
                            <td className="p-3 font-bold text-white max-w-xs">
                              <div className="flex items-center gap-2">
                                {doc.isPinned && <span className="text-amber-400">⭐</span>}
                                <span 
                                  onClick={() => handleViewPreview(doc)}
                                  className="cursor-pointer hover:text-blue-400 transition-colors truncate"
                                  title={doc.title}
                                >
                                  {doc.title}
                                </span>
                              </div>
                            </td>
                            <td className="p-3 font-mono text-amber-300 font-bold">
                              {doc.fileNumber || '—'}
                            </td>
                            <td className="p-3 text-slate-300">
                              {docFolder?.name || 'Chung'}
                            </td>
                            <td className="p-3">
                              {getFormatBadge(doc.fileType)}
                            </td>
                            <td className="p-3 font-mono text-slate-400">
                              {doc.publishDate}
                            </td>
                            <td className="p-3 text-slate-300">
                              {doc.signer || 'BCH Đoàn'}
                            </td>
                            <td className="p-3 text-center font-mono text-slate-400">
                              {doc.downloadsCount || 0}
                            </td>
                            <td className="p-3 text-right">
                              <div className="flex items-center justify-end gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleViewPreview(doc)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400"
                                  title="Xem"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleOpenDocModal(doc)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
                                  title="Sửa"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDoc(doc)}
                                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-red-400"
                                  title="Xóa"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

            </div>

          </div>

        </div>

      </div>

      {/* ================= MODAL: FOLDER CREATE / EDIT ================= */}
      {isFolderModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-md w-full rounded-3xl p-6 border border-slate-700 shadow-2xl space-y-4 bg-slate-950 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-blue-400" />
                <span>{editingFolder ? 'Chỉnh Sửa Thư Mục' : 'Tạo Thư Mục Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFolderModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveFolder} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Tên Thư Mục *:</label>
                <input
                  type="text"
                  required
                  value={folderForm.name}
                  onChange={(e) => setFolderForm({ ...folderForm, name: e.target.value })}
                  placeholder="VD: 06. Tư Liệu Đại Hội Đoàn Lần Thứ X"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mã Định Danh / Code:</label>
                <input
                  type="text"
                  value={folderForm.code}
                  onChange={(e) => setFolderForm({ ...folderForm, code: e.target.value })}
                  placeholder="VD: 06_DAI_HOI_X"
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-300 mb-1">Mô Tả Mục Đích Lưu Trữ:</label>
                <textarea
                  rows={2}
                  value={folderForm.description}
                  onChange={(e) => setFolderForm({ ...folderForm, description: e.target.value })}
                  placeholder="Ghi chú rõ loại tài liệu được lưu trong thư mục này..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFolderModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-extrabold"
                >
                  {editingFolder ? 'Lưu Thay Đổi' : 'Tạo Thư Mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: DOCUMENT UPLOAD / EDIT ================= */}
      {isDocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-2xl w-full max-h-[90vh] flex flex-col rounded-3xl border border-slate-700 shadow-2xl overflow-hidden bg-slate-950 text-slate-100">
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 shrink-0">
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-red-400" />
                <span>{editingDoc ? 'Chỉnh Sửa Thông Tin Văn Bản' : 'Tải Lên Văn Bản / Biểu Mẫu Mới'}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsDocModalOpen(false)}
                className="p-1 rounded-xl text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="p-4 sm:p-6 overflow-y-auto space-y-4 text-xs custom-scrollbar">
              
              {/* File Upload Box */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-dashed border-slate-700 text-center space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  onChange={handleFileUploadChange}
                  className="hidden"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.zip,.rar"
                />
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-blue-950 text-blue-400 flex items-center justify-center text-xl">
                    📁
                  </div>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs cursor-pointer inline-flex items-center gap-2 shadow-sm"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isUploading ? 'Đang tải file...' : 'Chọn Tệp Từ Máy Tính (Word, PDF, Excel...)'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 font-mono">
                  {docForm.fileName ? `Đã chọn: ${docForm.fileName} (${docForm.fileSize})` : 'Hỗ trợ định dạng: .PDF, .DOCX, .XLSX, .PPTX, .ZIP (tối đa 50MB)'}
                </p>
              </div>

              {/* Title & Number */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Tên Văn Bản / Tiêu Đề Biểu Mẫu *:</label>
                  <input
                    type="text"
                    required
                    value={docForm.title}
                    onChange={(e) => setDocForm({ ...docForm, title: e.target.value })}
                    placeholder="VD: Mẫu 01: Đơn xin vào Đoàn TNCS Hồ Chí Minh"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Số Hiệu Công Văn:</label>
                  <input
                    type="text"
                    value={docForm.fileNumber}
                    onChange={(e) => setDocForm({ ...docForm, fileNumber: e.target.value })}
                    placeholder="VD: 01/KH-ĐTN"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold"
                  />
                </div>
              </div>

              {/* Folder & Category */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Thư Mục Lưu Trữ *:</label>
                  <select
                    value={docForm.folderId}
                    onChange={(e) => setDocForm({ ...docForm, folderId: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    {documentFolders.map(f => (
                      <option key={f.id} value={f.id}>{f.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phân Loại Nội Dung:</label>
                  <select
                    value={docForm.category}
                    onChange={(e) => setDocForm({ ...docForm, category: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                  >
                    <option value="form">📋 Biểu Mẫu Chuẩn</option>
                    <option value="directive">🏛️ Công Văn / Chỉ Đạo</option>
                    <option value="plan">🏆 Kế Hoạch / Điều Lệ</option>
                    <option value="handbook">📚 Cẩm Nang / Sổ Tay</option>
                    <option value="report">📊 Báo Cáo / Lưu Chiểu</option>
                    <option value="other">📁 Loại Khác</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Định Dạng File:</label>
                  <select
                    value={docForm.fileType}
                    onChange={(e) => setDocForm({ ...docForm, fileType: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold uppercase font-mono"
                  >
                    <option value="pdf">PDF</option>
                    <option value="docx">DOCX (Word)</option>
                    <option value="xlsx">XLSX (Excel)</option>
                    <option value="pptx">PPTX (PowerPoint)</option>
                    <option value="zip">ZIP (Nén)</option>
                    <option value="other">KHÁC</option>
                  </select>
                </div>
              </div>

              {/* Signer & Date */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Người Ký / Ban Hành:</label>
                  <input
                    type="text"
                    value={docForm.signer}
                    onChange={(e) => setDocForm({ ...docForm, signer: e.target.value })}
                    placeholder="VD: Cô Zdrăm Thị Thành Thương"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Chức Vụ Người Ký:</label>
                  <input
                    type="text"
                    value={docForm.signerRole}
                    onChange={(e) => setDocForm({ ...docForm, signerRole: e.target.value })}
                    placeholder="VD: Bí thư Đoàn Trường"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Ngày Ban Hành:</label>
                  <input
                    type="date"
                    required
                    value={docForm.publishDate}
                    onChange={(e) => setDocForm({ ...docForm, publishDate: e.target.value })}
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-300 mb-1">Trích Yếu / Mô Tả Nội Dung:</label>
                <textarea
                  rows={2}
                  value={docForm.description}
                  onChange={(e) => setDocForm({ ...docForm, description: e.target.value })}
                  placeholder="Mô tả tóm tắt nội dung quy định hoặc mục đích sử dụng biểu mẫu..."
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white leading-relaxed"
                />
              </div>

              {/* Tags & Version */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-slate-300 mb-1">Từ Khóa Tìm Kiếm (Tags):</label>
                  <input
                    type="text"
                    value={docForm.tags}
                    onChange={(e) => setDocForm({ ...docForm, tags: e.target.value })}
                    placeholder="VD: Đơn vào Đoàn, Biểu mẫu, Kết nạp, Khối 10"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-300 mb-1">Phiên Bản:</label>
                  <input
                    type="text"
                    value={docForm.version}
                    onChange={(e) => setDocForm({ ...docForm, version: e.target.value })}
                    placeholder="VD: v1.0, v2.1"
                    className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono"
                  />
                </div>
              </div>

              {/* Switches */}
              <div className="p-3 bg-slate-900 rounded-2xl border border-slate-800 flex flex-wrap items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                  <input
                    type="checkbox"
                    checked={docForm.isPublic}
                    onChange={(e) => setDocForm({ ...docForm, isPublic: e.target.checked })}
                    className="w-4 h-4 rounded text-blue-600"
                  />
                  <span>🌐 Cho phép tải công khai ngoài Trang chủ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-slate-200 font-bold">
                  <input
                    type="checkbox"
                    checked={docForm.isPinned}
                    onChange={(e) => setDocForm({ ...docForm, isPinned: e.target.checked })}
                    className="w-4 h-4 rounded text-amber-500"
                  />
                  <span>⭐ Ghim lên đầu danh mục quan trọng</span>
                </label>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsDocModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-extrabold shadow-glow cursor-pointer"
                >
                  {editingDoc ? 'Lưu Thay Đổi' : 'Hoàn Tất & Lưu File'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: MOVE DOCUMENT TO FOLDER ================= */}
      {movingDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="glass-modal max-w-sm w-full rounded-3xl p-5 border border-slate-700 shadow-2xl space-y-4 bg-slate-950 text-slate-100">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <ArrowRight className="w-4 h-4 text-blue-400" />
              <span>Chuyển Thư Mục Tài Liệu</span>
            </h3>

            <p className="text-xs text-slate-400 truncate">
              Văn bản: <strong className="text-white">{movingDoc.title}</strong>
            </p>

            <form onSubmit={handleMoveFileSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1">Chọn Thư Mục Đích:</label>
                <select
                  value={targetMoveFolderId}
                  onChange={(e) => setTargetMoveFolderId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-bold"
                >
                  {documentFolders.map(f => (
                    <option key={f.id} value={f.id}>📁 {f.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMovingDoc(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 font-bold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold"
                >
                  Chuyển Ngay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Inspector Modal */}
      {viewingDoc && (
        <DocumentViewerModal
          document={viewingDoc}
          folders={documentFolders}
          onClose={() => setViewingDoc(null)}
          onDownload={handleDownload}
        />
      )}

    </div>
  );
};
