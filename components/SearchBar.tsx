'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';

interface SearchResult {
  id: string;
  title: string;
  type: 'task' | 'project' | 'user';
  subtitle?: string;
  url: string;
  icon: string;
  color: string;
}

interface SearchBarProps {
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ placeholder = "Buscar tareas, proyectos, usuarios...", className = "" }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchDebounced = setTimeout(() => {
      if (query.trim() && user) {
        performSearch(query.trim());
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 300);

    return () => clearTimeout(searchDebounced);
  }, [query, user]);

  const performSearch = async (searchQuery: string) => {
    if (!user) return;
    
    setLoading(true);
    try {
      const searchResults: SearchResult[] = [];

      // Buscar tareas
      const { data: tasks } = await supabase
        .from('tasks')
        .select(`
          id, 
          title, 
          description, 
          status,
          projects!inner(name)
        `)
        .or(`title.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('created_by', user.id)
        .limit(5);

      if (tasks) {
        tasks.forEach(task => {
          searchResults.push({
            id: task.id,
            title: task.title,
            type: 'task',
            subtitle: task.projects?.name || 'Sin proyecto',
            url: `/tasks/${task.id}`,
            icon: 'ri-task-line',
            color: getStatusColor(task.status)
          });
        });
      }

      // Buscar proyectos
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name, description, color')
        .or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .eq('created_by', user.id)
        .limit(5);

      if (projects) {
        projects.forEach(project => {
          searchResults.push({
            id: project.id,
            title: project.name,
            type: 'project',
            subtitle: project.description || 'Sin descripción',
            url: `/projects/${project.id}`,
            icon: 'ri-folder-line',
            color: project.color
          });
        });
      }

      // Buscar usuarios (perfiles)
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .or(`full_name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`)
        .neq('id', user.id)
        .limit(3);

      if (profiles) {
        profiles.forEach(profile => {
          searchResults.push({
            id: profile.id,
            title: profile.full_name || profile.email,
            type: 'user',
            subtitle: profile.email,
            url: `/profile?user=${profile.id}`,
            icon: 'ri-user-line',
            color: 'bg-purple-500'
          });
        });
      }

      setResults(searchResults);
      setIsOpen(searchResults.length > 0);
    } catch (error) {
      console.error('Error searching:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'pending': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'task': return 'Tarea';
      case 'project': return 'Proyecto';
      case 'user': return 'Usuario';
      default: return '';
    }
  };

  const handleResultClick = () => {
    setQuery('');
    setResults([]);
    setIsOpen(false);
    inputRef.current?.blur();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {loading ? (
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          ) : (
            <i className="ri-search-line text-gray-400 dark:text-gray-500"></i>
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.trim() && results.length > 0 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          className="w-full pl-10 pr-4 py-2.5 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm"
          placeholder={placeholder}
        />
        {query && (
          <button
            onClick={() => {
              setQuery('');
              setResults([]);
              setIsOpen(false);
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <i className="ri-close-line text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"></i>
          </button>
        )}
      </div>

      {/* Resultados de búsqueda */}
      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          <div className="p-2">
            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide px-3 py-2">
              Resultados de búsqueda ({results.length})
            </div>
            
            {results.map((result, index) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={result.url}
                onClick={handleResultClick}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group cursor-pointer"
              >
                <div className={`w-8 h-8 ${result.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <i className={`${result.icon} text-white text-sm`}></i>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400">
                      {result.title}
                    </p>
                    <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full flex-shrink-0">
                      {getTypeLabel(result.type)}
                    </span>
                  </div>
                  {result.subtitle && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                      {result.subtitle}
                    </p>
                  )}
                </div>

                <i className="ri-arrow-right-line text-gray-400 group-hover:text-blue-500 flex-shrink-0"></i>
              </Link>
            ))}
          </div>

          {/* Pie de resultados */}
          <div className="border-t border-gray-200 dark:border-gray-700 p-3">
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Presiona <kbd className="px-2 py-1 bg-gray-100 dark:bg-gray-600 rounded text-xs">Esc</kbd> para cerrar
            </p>
          </div>
        </div>
      )}

      {/* Estado sin resultados */}
      {isOpen && !loading && query.trim() && results.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
          <div className="p-6 text-center">
            <i className="ri-search-line text-3xl text-gray-400 mb-3"></i>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              No encontramos resultados para "{query}"
            </p>
            <p className="text-gray-500 dark:text-gray-500 text-xs mt-1">
              Intenta con otros términos de búsqueda
            </p>
          </div>
        </div>
      )}
    </div>
  );
}