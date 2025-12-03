
'use client';
import { useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface FileUploadProps {
  onUpload: (fileUrl: string, fileName: string, fileSize: number) => void;
  accept?: string;
  maxSize?: number; // en MB
  multiple?: boolean;
  bucket?: string;
  folder?: string;
}

export default function FileUpload({ 
  onUpload, 
  accept = "*/*", 
  maxSize = 10, 
  multiple = false,
  bucket = "attachments",
  folder = "general"
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const validateFile = (file: File) => {
    if (file.size > maxSize * 1024 * 1024) {
      return `El archivo es muy grande. Máximo ${maxSize}MB`;
    }
    return null;
  };

  const uploadFile = async (file: File) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    const validation = validateFile(file);
    if (validation) {
      throw new Error(validation);
    }

    // Generar nombre único para el archivo
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${user.id}/${fileName}`;

    // Subir archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Obtener URL pública del archivo
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    return {
      url: publicUrl,
      name: file.name,
      size: file.size,
      path: filePath
    };
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setUploading(true);
    setError('');
    setProgress(0);

    try {
      const uploadPromises = files.map(async (file, index) => {
        const result = await uploadFile(file);
        setProgress(((index + 1) / files.length) * 100);
        return result;
      });

      const results = await Promise.all(uploadPromises);

      // Llamar onUpload para cada archivo subido
      results.forEach(result => {
        onUpload(result.url, result.name, result.size);
      });

      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error: any) {
      console.error('Error uploading file:', error);
      setError(error.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  const getAcceptedFormats = () => {
    if (accept === "*/*") return "Todos los archivos";
    if (accept.includes("image")) return "Imágenes";
    if (accept.includes("video")) return "Videos";
    if (accept.includes("audio")) return "Audio";
    if (accept.includes("pdf")) return "PDFs";
    return "Archivos específicos";
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        onChange={handleFileSelect}
        className="hidden"
      />

      <div
        onClick={handleClick}
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all
          ${uploading 
            ? 'border-blue-300 bg-blue-50 dark:bg-blue-900/20 cursor-not-allowed' 
            : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          }
        `}
      >
        {uploading ? (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
              <i className="ri-upload-cloud-line text-blue-600 dark:text-blue-400 text-xl animate-pulse"></i>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">
                Subiendo archivo{files.length > 1 ? 's' : ''}...
              </p>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {Math.round(progress)}% completado
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto">
              <i className="ri-upload-cloud-2-line text-gray-400 dark:text-gray-500 text-xl"></i>
            </div>
            <div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  Haz clic para subir
                </span> o arrastra archivos aquí
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {getAcceptedFormats()} • Máximo {maxSize}MB {multiple ? '• Múltiples archivos' : ''}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <i className="ri-error-warning-line text-red-500 flex-shrink-0"></i>
            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
          </div>
        </div>
      )}
    </div>
  );
}
