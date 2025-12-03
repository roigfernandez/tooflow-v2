
'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';
import FileUpload from '@/components/FileUpload';
import AttachmentList from '@/components/AttachmentList';
import AuthGuard from '@/components/AuthGuard';

interface FileItem {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  created_at: string;
  created_by: string;
  created_by_name?: string;
  folder: string;
  project_id?: string;
  task_id?: string;
}

export default function FilesPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const [selectedFolder, setSelectedFolder] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const { user } = useAuth();

  const folders = [
    { id: 'all', name: 'Todos los archivos', icon: 'ri-folder-line' },
    { id: 'general', name: 'General', icon: 'ri-folder-line' },
    { id: 'projects', name: 'Proyectos', icon: 'ri-briefcase-line' },
    { id: 'tasks', name: 'Tareas', icon: 'ri-task-line' },
    { id: 'images', name: 'Imágenes', icon: 'ri-image-line' },
    { id: 'documents', name: 'Documentos', icon: 'ri-file-text-line' },
  ];

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user, selectedFolder]);

  const loadFiles = async () => {
    try {
      setLoading(true);

      // Simular archivos con datos realistas
      const mockFiles: FileItem[] = [
        {
          id: '1',
          name: 'Propuesta_Proyecto_2024.pdf',
          url: 'https://readdy.ai/api/search-image?query=professional%20business%20document%20proposal%20with%20clean%20layout%20and%20modern%20design%2C%20white%20background%20with%20blue%20accents&width=400&height=600&seq=doc1&orientation=portrait',
          size: 2457600, // 2.4 MB
          type: 'application/pdf',
          created_at: '2024-01-15T10:30:00Z',
          created_by: user!.id,
          created_by_name: user!.user_metadata?.full_name || 'Usuario',
          folder: 'documents',
          project_id: '1'
        },
        {
          id: '2',
          name: 'Dashboard_Mockup.png',
          url: 'https://readdy.ai/api/search-image?query=modern%20dashboard%20mockup%20design%20with%20charts%20and%20widgets%2C%20clean%20interface%2C%20professional%20layout%2C%20blue%20and%20white%20color%20scheme&width=800&height=600&seq=mock1&orientation=landscape',
          size: 1843200, // 1.8 MB
          type: 'image/png',
          created_at: '2024-01-14T16:45:00Z',
          created_by: user!.id,
          created_by_name: user!.user_metadata?.full_name || 'Usuario',
          folder: 'images',
          project_id: '1'
        },
        {
          id: '3',
          name: 'Reunión_Equipo_Recording.mp4',
          url: '#',
          size: 45678900, // 45.6 MB
          type: 'video/mp4',
          created_at: '2024-01-13T09:15:00Z',
          created_by: user!.id,
          created_by_name: user!.user_metadata?.full_name || 'Usuario',
          folder: 'general'
        },
        {
          id: '4',
          name: 'Análisis_Competencia.xlsx',
          url: '#',
          size: 892400, // 892 KB
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          created_at: '2024-01-12T14:20:00Z',
          created_by: user!.id,
          created_by_name: user!.user_metadata?.full_name || 'Usuario',
          folder: 'documents',
          project_id: '2'
        },
        {
          id: '5',
          name: 'Logo_Empresa_Vector.svg',
          url: 'https://readdy.ai/api/search-image?query=modern%20company%20logo%20design%20vector%20style%2C%20minimalist%20geometric%20shapes%2C%20professional%20brand%20identity%2C%20blue%20and%20gray%20colors&width=400&height=400&seq=logo1&orientation=squarish',
          size: 124800, // 124 KB
          type: 'image/svg+xml',
          created_at: '2024-01-11T11:30:00Z',
          created_by: user!.id,
          created_by_name: user!.user_metadata?.full_name || 'Usuario',
          folder: 'images'
        },
        {
          id: '6',
          name: 'Especificaciones_Técnicas.docx',
          url: '#',
          size: 678400, // 678 KB
          type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          created_at: '2024-01-10T13:45:00Z',
          created_by: user!.id,
          created_by_name: user!.user_metadata?.full_name || 'Usuario',
          folder: 'documents',
          task_id: '1'
        }
      ];

      setFiles(mockFiles);
    } catch (error) {
      console.error('Error loading files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (fileUrl: string, fileName: string, fileSize: number) => {
    // Crear entrada de archivo en la lista
    const newFile: FileItem = {
      id: Date.now().toString(),
      name: fileName,
      url: fileUrl,
      size: fileSize,
      type: 'application/octet-stream', // Tipo genérico
      created_at: new Date().toISOString(),
      created_by: user!.id,
      created_by_name: user!.user_metadata?.full_name || 'Usuario',
      folder: 'general'
    };

    setFiles(prev => [newFile, ...prev]);
  };

  const handleDeleteFile = async (fileId: string) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const filteredFiles = files.filter(file => {
    const matchesFolder = selectedFolder === 'all' || file.folder === selectedFolder;
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFolder && matchesSearch;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const getTotalSize = () => {
    return filteredFiles.reduce((total, file) => total + file.size, 0);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <AuthGuard>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        
        <main className="pt-16 pb-20">
          <div className="max-w-6xl mx-auto p-6">
            {/* Header de la página */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
                    Gestión de Archivos
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    Sube, organiza y gestiona todos tus archivos
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {filteredFiles.length} archivo{filteredFiles.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    {formatFileSize(getTotalSize())}
                  </p>
                </div>
              </div>

              {/* Subida de archivos */}
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <FileUpload
                  onUpload={handleFileUpload}
                  multiple
                  maxSize={50}
                  accept="*/*"
                />
              </div>

              {/* Filtros y controles */}
              <div className="flex flex-col lg:flex-row gap-4 mb-6">
                {/* Carpetas */}
                <div className="flex-1">
                  <div className="flex flex-wrap gap-2">
                    {folders.map(folder => (
                      <button
                        key={folder.id}
                        onClick={() => setSelectedFolder(folder.id)}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap
                          ${selectedFolder === folder.id
                            ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
                            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                          }
                        `}
                      >
                        <i className={`${folder.icon} text-sm`}></i>
                        {folder.name}
                        {folder.id !== 'all' && (
                          <span className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs px-1.5 py-0.5 rounded-full">
                            {files.filter(f => f.folder === folder.id).length}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Controles de ordenamiento */}
                <div className="flex items-center gap-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                    className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-8"
                  >
                    <option value="date">Fecha</option>
                    <option value="name">Nombre</option>
                    <option value="size">Tamaño</option>
                  </select>
                  
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="w-10 h-10 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    title={sortOrder === 'asc' ? 'Ascendente' : 'Descendente'}
                  >
                    <i className={`ri-arrow-${sortOrder === 'asc' ? 'up' : 'down'}-line`}></i>
                  </button>
                </div>
              </div>
            </div>

            {/* Lista de archivos */}
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                    <span className="text-gray-600 dark:text-gray-400">Cargando archivos...</span>
                  </div>
                </div>
              ) : (
                <AttachmentList
                  attachments={sortedFiles}
                  onDelete={handleDeleteFile}
                  canDelete={true}
                />
              )}
            </div>
          </div>
        </main>

        <BottomNavigation />
      </div>
    </AuthGuard>
  );
}
