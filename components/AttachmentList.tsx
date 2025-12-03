
'use client';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface Attachment {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
  created_by: string;
  created_by_name?: string;
}

interface AttachmentListProps {
  attachments: Attachment[];
  onDelete?: (attachmentId: string) => void;
  canDelete?: boolean;
}

export default function AttachmentList({ attachments, onDelete, canDelete = false }: AttachmentListProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileName: string, fileType: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return 'ri-image-line';
    }
    if (fileType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv'].includes(ext || '')) {
      return 'ri-video-line';
    }
    if (fileType.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(ext || '')) {
      return 'ri-music-line';
    }
    if (fileType.includes('pdf') || ext === 'pdf') {
      return 'ri-file-pdf-line';
    }
    if (['doc', 'docx'].includes(ext || '')) {
      return 'ri-file-word-line';
    }
    if (['xls', 'xlsx'].includes(ext || '')) {
      return 'ri-file-excel-line';
    }
    if (['ppt', 'pptx'].includes(ext || '')) {
      return 'ri-file-ppt-line';
    }
    if (['zip', 'rar', '7z'].includes(ext || '')) {
      return 'ri-file-zip-line';
    }
    if (['txt', 'md'].includes(ext || '')) {
      return 'ri-file-text-line';
    }
    return 'ri-file-line';
  };

  const getFileTypeColor = (fileName: string, fileType: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    
    if (fileType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) {
      return 'text-green-600 dark:text-green-400';
    }
    if (fileType.startsWith('video/') || ['mp4', 'avi', 'mov', 'wmv'].includes(ext || '')) {
      return 'text-purple-600 dark:text-purple-400';
    }
    if (fileType.startsWith('audio/') || ['mp3', 'wav', 'ogg'].includes(ext || '')) {
      return 'text-blue-600 dark:text-blue-400';
    }
    if (fileType.includes('pdf') || ext === 'pdf') {
      return 'text-red-600 dark:text-red-400';
    }
    if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext || '')) {
      return 'text-blue-600 dark:text-blue-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  const canPreview = (fileName: string, fileType: string) => {
    const ext = fileName.split('.').pop()?.toLowerCase();
    return fileType.startsWith('image/') || 
           ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '') ||
           fileType.includes('pdf');
  };

  const handleDelete = async (attachment: Attachment) => {
    if (!onDelete) return;

    setDeletingIds(prev => new Set([...prev, attachment.id]));

    try {
      // Intentar eliminar el archivo del storage
      const pathMatch = attachment.url.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)$/);
      if (pathMatch) {
        const filePath = pathMatch[1];
        await supabase.storage.from('attachments').remove([filePath]);
      }

      onDelete(attachment.id);
    } catch (error) {
      console.error('Error deleting attachment:', error);
    } finally {
      setDeletingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(attachment.id);
        return newSet;
      });
    }
  };

  const handlePreview = (attachment: Attachment) => {
    if (canPreview(attachment.name, attachment.type)) {
      setPreviewUrl(attachment.url);
    }
  };

  if (attachments.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        <i className="ri-attachment-line text-2xl mb-2 block"></i>
        <p className="text-sm">No hay archivos adjuntos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <div className={`w-10 h-10 flex items-center justify-center ${getFileTypeColor(attachment.name, attachment.type)}`}>
            <i className={`${getFileIcon(attachment.name, attachment.type)} text-lg`}></i>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {attachment.name}
            </p>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{formatFileSize(attachment.size)}</span>
              {attachment.created_by_name && (
                <>
                  <span>•</span>
                  <span>Subido por {attachment.created_by_name}</span>
                </>
              )}
              <span>•</span>
              <span>{new Date(attachment.created_at).toLocaleDateString()}</span>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {canPreview(attachment.name, attachment.type) && (
              <button
                onClick={() => handlePreview(attachment)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Vista previa"
              >
                <i className="ri-eye-line text-sm"></i>
              </button>
            )}

            <a
              href={attachment.url}
              download={attachment.name}
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors"
              title="Descargar"
            >
              <i className="ri-download-line text-sm"></i>
            </a>

            <a
              href={attachment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors"
              title="Abrir en nueva pestaña"
            >
              <i className="ri-external-link-line text-sm"></i>
            </a>

            {canDelete && onDelete && (
              <button
                onClick={() => handleDelete(attachment)}
                disabled={deletingIds.has(attachment.id)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Eliminar"
              >
                {deletingIds.has(attachment.id) ? (
                  <div className="w-3 h-3 border border-red-500/20 border-t-red-500 rounded-full animate-spin"></div>
                ) : (
                  <i className="ri-delete-bin-line text-sm"></i>
                )}
              </button>
            )}
          </div>
        </div>
      ))}

      {/* Modal de vista previa */}
      {previewUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                Vista previa
              </h3>
              <button
                onClick={() => setPreviewUrl(null)}
                className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <i className="ri-close-line"></i>
              </button>
            </div>
            <div className="p-4">
              {previewUrl.includes('.pdf') ? (
                <iframe
                  src={previewUrl}
                  className="w-full h-96 border border-gray-200 dark:border-gray-700 rounded"
                  title="PDF Preview"
                />
              ) : (
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="max-w-full max-h-96 object-contain mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
