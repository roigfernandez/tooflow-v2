
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { profilesService } from '@/lib/database';
import { supabase } from '@/lib/supabase';

export default function ProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    bio: '',
    location: '',
    timezone: 'America/Mexico_City'
  });

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    try {
      const data = await profilesService.getCurrent();
      setProfile(data);
      setFormData({
        full_name: data.full_name || '',
        email: data.email || '',
        phone: data.phone || '',
        bio: data.bio || '',
        location: data.location || '',
        timezone: data.timezone || 'America/Mexico_City'
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await profilesService.update({
        full_name: formData.full_name,
        phone: formData.phone,
        bio: formData.bio,
        location: formData.location,
        timezone: formData.timezone
      });

      setProfile(prev => ({ ...prev, ...formData }));
      alert('Perfil actualizado correctamente');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);

      await profilesService.update({
        avatar_url: data.publicUrl
      });

      setProfile(prev => ({ ...prev, avatar_url: data.publicUrl }));
      alert('Avatar actualizado correctamente');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      alert('Error al subir el avatar');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-4">
              <button 
                onClick={() => window.history.back()}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <i className="ri-arrow-left-line text-xl"></i>
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Mi Perfil</h1>
                <p className="text-gray-600 dark:text-gray-400">Gestiona tu información personal y preferencias</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSave} className="p-6 space-y-6">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    formData.full_name?.charAt(0)?.toUpperCase() || 'U'
                  )}
                </div>
                <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-full flex items-center justify-center cursor-pointer transition-colors">
                  <i className="ri-camera-line text-sm"></i>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Foto de perfil</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">JPG, PNG o GIF. Máximo 2MB.</p>
              </div>
            </div>

            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">El email no se puede cambiar</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+52 123 456 7890"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Ubicación
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ciudad, País"
                />
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Biografía
              </label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Cuéntanos sobre ti..."
                maxLength={500}
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {formData.bio.length}/500 caracteres
              </p>
            </div>

            {/* Timezone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Zona horaria
              </label>
              <select
                value={formData.timezone}
                onChange={(e) => setFormData(prev => ({ ...prev, timezone: e.target.value }))}
                className="w-full px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="America/Mexico_City">México (GMT-6)</option>
                <option value="America/New_York">Nueva York (GMT-5)</option>
                <option value="America/Los_Angeles">Los Ángeles (GMT-8)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
                <option value="Europe/London">Londres (GMT+0)</option>
                <option value="Asia/Tokyo">Tokio (GMT+9)</option>
              </select>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => window.history.back()}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors whitespace-nowrap"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="ri-save-line"></i>
                    Guardar cambios
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Account Stats */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <i className="ri-calendar-line text-blue-600 dark:text-blue-400"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Miembro desde</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">
                  {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long'
                  }) : 'N/A'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <i className="ri-task-line text-green-600 dark:text-green-400"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Tareas completadas</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">12</p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <i className="ri-folder-line text-purple-600 dark:text-purple-400"></i>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Proyectos activos</p>
                <p className="font-semibold text-gray-900 dark:text-gray-100">3</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
