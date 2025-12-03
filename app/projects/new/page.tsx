
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

const PROJECT_COLORS = [
  { name: 'Azul', value: '#3B82F6', bg: 'bg-blue-500' },
  { name: 'Verde', value: '#10B981', bg: 'bg-emerald-500' },
  { name: 'Púrpura', value: '#8B5CF6', bg: 'bg-violet-500' },
  { name: 'Rosa', value: '#EC4899', bg: 'bg-pink-500' },
  { name: 'Naranja', value: '#F59E0B', bg: 'bg-amber-500' },
  { name: 'Rojo', value: '#EF4444', bg: 'bg-red-500' },
  { name: 'Índigo', value: '#6366F1', bg: 'bg-indigo-500' },
  { name: 'Cian', value: '#06B6D4', bg: 'bg-cyan-500' },
];

export default function NewProjectPage() {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedColor, setSelectedColor] = useState(PROJECT_COLORS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { user } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([
          {
            name: name.trim(),
            description: description.trim() || null,
            color: selectedColor.value,
            created_by: user.id
          }
        ])
        .select()
        .single();

      if (error) throw error;

      await supabase
        .from('project_members')
        .insert([
          {
            project_id: data.id,
            user_id: user.id,
            role: 'admin'
          }
        ]);

      router.push(`/projects/${data.id}`);
    } catch (err: any) {
      setError('Error al crear el proyecto. Inténtalo de nuevo.');
      console.error('Error creating project:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <div className="max-w-2xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
          >
            <i className="ri-arrow-left-line"></i>
            Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Crear nuevo proyecto
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Organiza tu trabajo con un nuevo proyecto
          </p>
        </div>

        {/* Formulario */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <i className="ri-error-warning-line text-red-500 text-lg"></i>
                  <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nombre del proyecto *
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="Ej: Rediseño de la página web"
                maxLength={100}
                required
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {name.length}/100 caracteres
              </p>
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Descripción (opcional)
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 resize-none"
                placeholder="Describe brevemente el objetivo del proyecto..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {description.length}/500 caracteres
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Color del proyecto
              </label>
              {/* Modified color selector */}
              <div className="flex flex-col gap-2">
                {PROJECT_COLORS.map((color, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 sm:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                      <div className={`w-4 h-4 rounded-full ${color.bg} flex-shrink-0`}></div>
                      <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 font-medium">
                        {color.name}
                      </span>
                    </div>
                    <div className="flex-shrink-0">
                      <input
                        type="radio"
                        name="projectColor"
                        value={color.value}
                        checked={selectedColor.value === color.value}
                        onChange={() => setSelectedColor(color)}
                        className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-center gap-4 pt-4 max-w-md mx-auto">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading || !name.trim()}
                className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Creando...
                  </div>
                ) : (
                  'Crear proyecto'
                )}
              </button>
            </div>

          </form>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
            💡 Consejos para crear un buen proyecto:
          </h3>
          <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
            <li>• Usa un nombre claro y descriptivo</li>
            <li>• Incluye el objetivo principal en la descripción</li>
            <li>• Elige un color que represente el tipo de proyecto</li>
            <li>• Podrás invitar colaboradores después de crearlo</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
