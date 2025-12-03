'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';
import BottomNavigation from '@/components/BottomNavigation';

interface InviteMembersProps {
  projectId: string;
  projectName: string;
  onMemberAdded?: () => void;
}

interface Project {
  id: string;
  name: string;
  color: string;
}

interface ProjectMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  role: string;
}

export default function InviteMembers({ projectId, projectName, onMemberAdded }: InviteMembersProps) {
  const [project, setProject] = useState<Project | null>(null);
  const [currentMembers, setCurrentMembers] = useState<ProjectMember[]>([]);
  const [email, setEmail] = useState('');
  const [selectedRole, setSelectedRole] = useState('member');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    loadProjectData();
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', projectId)
        .single();

      if (projectError) throw projectError;
      setProject(projectData);

      const { data: membersData, error: membersError } = await supabase
        .from('project_members')
        .select(`
          id,
          role,
          profiles:user_id(id, full_name, email, avatar_url)
        `)
        .eq('project_id', projectId);

      if (!membersError && membersData) {
        const formattedMembers: ProjectMember[] = membersData.map(member => ({
          id: member.profiles.id,
          full_name: member.profiles.full_name,
          email: member.profiles.email,
          avatar_url: member.profiles.avatar_url,
          role: member.role
        }));
        setCurrentMembers(formattedMembers);
      }
    } catch (error) {
      console.error('Error loading project data:', error);
      setMessage({ type: 'error', text: 'Error al cargar los datos del proyecto' });
    } finally {
      setIsLoadingData(false);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !email.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      if (currentMembers.some(member => member.email.toLowerCase() === email.toLowerCase())) {
        setMessage({ type: 'error', text: 'Este usuario ya es miembro del proyecto' });
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .rpc('get_user_by_email', { user_email: email.toLowerCase() });

      if (userError) throw userError;

      if (!userData || userData.length === 0) {
        setMessage({ type: 'error', text: 'Usuario no encontrado. Verifica que el email esté registrado.' });
        setLoading(false);
        return;
      }

      const targetUser = userData[0];

      const { error: inviteError } = await supabase
        .from('project_members')
        .insert([
          {
            project_id: projectId,
            user_id: targetUser.id,
            role: selectedRole
          }
        ]);

      if (inviteError) throw inviteError;

      setCurrentMembers(prev => [...prev, {
        id: targetUser.id,
        full_name: targetUser.full_name,
        email: targetUser.email,
        avatar_url: targetUser.avatar_url,
        role: selectedRole
      }]);

      setEmail('');
      setMessage({ type: 'success', text: `${targetUser.full_name} ha sido invitado al proyecto` });

    } catch (error: any) {
      console.error('Error inviting member:', error);
      setMessage({ type: 'error', text: 'Error al enviar la invitación. Inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('¿Estás seguro de que quieres remover a este miembro del proyecto?')) return;

    try {
      const { error } = await supabase
        .from('project_members')
        .delete()
        .eq('project_id', projectId)
        .eq('user_id', memberId);

      if (error) throw error;

      setCurrentMembers(prev => prev.filter(member => member.id !== memberId));
      setMessage({ type: 'success', text: 'Miembro removido del proyecto' });
    } catch (error) {
      console.error('Error removing member:', error);
      setMessage({ type: 'error', text: 'Error al remover el miembro' });
    }
  };

  const handleChangeRole = async (memberId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('project_members')
        .update({ role: newRole })
        .eq('project_id', projectId)
        .eq('user_id', memberId);

      if (error) throw error;

      setCurrentMembers(prev => prev.map(member => 
        member.id === memberId ? { ...member, role: newRole } : member
      ));

      setMessage({ type: 'success', text: 'Rol actualizado correctamente' });
    } catch (error) {
      console.error('Error updating role:', error);
      setMessage({ type: 'error', text: 'Error al actualizar el rol' });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrador';
      case 'member': return 'Miembro';
      case 'viewer': return 'Observador';
      default: return role;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'member': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'viewer': return 'bg-gray-50 text-gray-700 border-gray-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  if (isLoadingData) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Cargando..." showSearch={false} />
        <main className="flex-1 px-4 py-6 pb-24 md:pb-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
        <Header title="Proyecto no encontrado" showSearch={false} />
        <main className="flex-1 px-4 py-6 pb-24 md:pb-6 flex items-center justify-center">
          <div className="text-center">
            <i className="ri-folder-line text-4xl text-gray-400 dark:text-gray-500 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Proyecto no encontrado</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">No se pudo cargar la información del proyecto.</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <i className="ri-arrow-left-line"></i>
              Volver
            </button>
          </div>
        </main>
        <BottomNavigation />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header title="Invitar Miembros" showSearch={false} />
      
      <main className="flex-1 px-4 py-6 pb-24 md:pb-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-4"
            >
              <i className="ri-arrow-left-line"></i>
              Volver al proyecto
            </button>
            
            <div className="flex items-center gap-3 mb-2">
              <div 
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: project.color }}
              ></div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Gestionar miembros
              </h1>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Invita colaboradores a <span className="font-medium">{project.name}</span>
            </p>
          </div>

          {/* Mensaje de estado */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400' 
                : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
            }`}>
              <div className="flex items-center gap-3">
                <i className={`${message.type === 'success' ? 'ri-check-line' : 'ri-error-warning-line'} text-lg`}></i>
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulario de invitación */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Invitar nuevo miembro
              </h2>
              
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email del usuario
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="usuario@ejemplo.com"
                    required
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    El usuario debe estar registrado en la plataforma
                  </p>
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Rol en el proyecto
                  </label>
                  <select
                    id="role"
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 pr-8 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100"
                  >
                    <option value="viewer">Observador - Solo puede ver</option>
                    <option value="member">Miembro - Puede editar tareas</option>
                    <option value="admin">Administrador - Control total</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                      Enviando invitación...
                    </div>
                  ) : (
                    'Enviar invitación'
                  )}
                </button>
              </form>
            </div>

            {/* Lista de miembros actuales */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Miembros actuales ({currentMembers.length})
              </h2>

              <div className="space-y-3">
                {currentMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 flex-shrink-0">
                        {member.avatar_url ? (
                          <img 
                            src={member.avatar_url} 
                            alt={member.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm font-medium rounded-full flex items-center justify-center">
                            {getInitials(member.full_name)}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {member.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {member.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={member.role}
                        onChange={(e) => handleChangeRole(member.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full border font-medium pr-6 ${getRoleColor(member.role)} dark:bg-gray-800 dark:border-gray-600`}
                        disabled={member.id === user?.id}
                      >
                        <option value="viewer">Observador</option>
                        <option value="member">Miembro</option>
                        <option value="admin">Admin</option>
                      </select>

                      {member.id !== user?.id && (
                        <button
                          onClick={() => handleRemoveMember(member.id)}
                          className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                          title="Remover del proyecto"
                        >
                          <i className="ri-close-line text-sm"></i>
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                {currentMembers.length === 0 && (
                  <div className="text-center py-6">
                    <i className="ri-team-line text-2xl text-gray-400 dark:text-gray-500 mb-2 block"></i>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      No hay miembros en este proyecto
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Información sobre roles */}
          <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300 mb-2">
              ℹ️ Información sobre roles:
            </h3>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
              <li>• <strong>Observador:</strong> Solo puede ver tareas y comentarios</li>
              <li>• <strong>Miembro:</strong> Puede crear, editar tareas y comentar</li>
              <li>• <strong>Administrador:</strong> Control total del proyecto</li>
            </ul>
          </div>
        </div>
      </main>

      <BottomNavigation />
    </div>
  );
}
