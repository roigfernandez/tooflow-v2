
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  parent_id: string | null;
  profiles: {
    full_name: string;
    avatar_url: string | null;
  };
  replies?: Comment[];
  reactions?: Reaction[];
  edited: boolean;
}

interface Reaction {
  id: string;
  emoji: string;
  user_id: string;
  comment_id: string;
  profiles: {
    full_name: string;
  };
}

interface ProjectCommentsProps {
  projectId: string;
}

const EMOJI_OPTIONS = ['👍', '❤️', '😊', '🎉', '😮', '😢', '😠'];

export default function ProjectComments({ projectId }: ProjectCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [editingComment, setEditingComment] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showReactions, setShowReactions] = useState<string | null>(null);
  const [mentionSuggestions, setMentionSuggestions] = useState<any[]>([]);
  const [showMentions, setShowMentions] = useState(false);

  useEffect(() => {
    if (projectId) {
      fetchComments();
      subscribeToComments();
    }
  }, [projectId]);

  const fetchComments = async () => {
    try {
      const { data, error } = await supabase
        .from('project_comments')
        .select(`
          *,
          profiles!project_comments_user_id_fkey (full_name, avatar_url),
          reactions:project_comment_reactions (
            id, emoji, user_id,
            profiles!project_comment_reactions_user_id_fkey (full_name)
          )
        `)
        .eq('project_id', projectId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Organizar comentarios en estructura de árbol
      const commentsMap = new Map();
      const rootComments: Comment[] = [];

      data?.forEach(comment => {
        const commentWithReplies = {
          ...comment,
          replies: [],
          edited: comment.updated_at !== comment.created_at
        };
        commentsMap.set(comment.id, commentWithReplies);

        if (!comment.parent_id) {
          rootComments.push(commentWithReplies);
        }
      });

      // Agregar respuestas a sus comentarios padre
      data?.forEach(comment => {
        if (comment.parent_id) {
          const parent = commentsMap.get(comment.parent_id);
          if (parent) {
            parent.replies.push(commentsMap.get(comment.id));
          }
        }
      });

      setComments(rootComments);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToComments = () => {
    const channel = supabase
      .channel(`project_comments_${projectId}`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'project_comments',
          filter: `project_id=eq.${projectId}`
        }, 
        () => {
          fetchComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const handleSubmitComment = async (content: string, parentId: string | null = null) => {
    if (!content.trim() || !user) return;

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('project_comments')
        .insert({
          project_id: projectId,
          user_id: user.id,
          content: content.trim(),
          parent_id: parentId
        });

      if (error) throw error;

      if (parentId) {
        setReplyingTo(null);
      } else {
        setNewComment('');
      }

      // Crear notificaciones para menciones
      await handleMentions(content);

    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComment = async (commentId: string, content: string) => {
    if (!content.trim()) return;

    try {
      const { error } = await supabase
        .from('project_comments')
        .update({ 
          content: content.trim(),
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) throw error;

      setEditingComment(null);
      setEditContent('');
    } catch (error) {
      console.error('Error editing comment:', error);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este comentario?')) return;

    try {
      const { error } = await supabase
        .from('project_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting comment:', error);
    }
  };

  const handleReaction = async (commentId: string, emoji: string) => {
    if (!user) return;

    try {
      // Verificar si ya reaccionó con este emoji
      const { data: existingReaction } = await supabase
        .from('project_comment_reactions')
        .select('id')
        .eq('comment_id', commentId)
        .eq('user_id', user.id)
        .eq('emoji', emoji)
        .single();

      if (existingReaction) {
        // Quitar reacción
        await supabase
          .from('project_comment_reactions')
          .delete()
          .eq('id', existingReaction.id);
      } else {
        // Agregar reacción
        await supabase
          .from('project_comment_reactions')
          .insert({
            comment_id: commentId,
            user_id: user.id,
            emoji: emoji
          });
      }

      setShowReactions(null);
      fetchComments();
    } catch (error) {
      console.error('Error handling reaction:', error);
    }
  };

  const handleMentions = async (content: string) => {
    const mentionRegex = /@(\w+)/g;
    const mentions = content.match(mentionRegex);
    
    if (mentions && mentions.length > 0) {
      try {
        const { data: users } = await supabase
          .from('profiles')
          .select('id, full_name')
          .in('full_name', mentions.map(m => m.substring(1)));

        if (users) {
          for (const mentionedUser of users) {
            await supabase.functions.invoke('create-notification', {
              body: {
                user_id: mentionedUser.id,
                type: 'mention',
                title: 'Te han mencionado',
                message: `${user?.user_metadata?.full_name || 'Alguien'} te mencionó en un comentario del proyecto`,
                data: { project_id: projectId, comment_content: content }
              }
            });
          }
        }
      } catch (error) {
        console.error('Error handling mentions:', error);
      }
    }
  };

  const searchUsers = async (query: string) => {
    if (query.length < 2) return;

    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url')
        .ilike('full_name', `%${query}%`)
        .limit(5);

      setMentionSuggestions(data || []);
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const handleTextareaChange = (value: string, textarea: HTMLTextAreaElement) => {
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = value.substring(0, cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    if (lastAtSymbol !== -1) {
      const searchTerm = textBeforeCursor.substring(lastAtSymbol + 1);
      if (searchTerm.length >= 0 && !searchTerm.includes(' ')) {
        setShowMentions(true);
        searchUsers(searchTerm);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (textarea: HTMLTextAreaElement, currentValue: string, userName: string) => {
    const cursorPos = textarea.selectionStart;
    const textBeforeCursor = currentValue.substring(0, cursorPos);
    const textAfterCursor = currentValue.substring(cursorPos);
    const lastAtSymbol = textBeforeCursor.lastIndexOf('@');
    
    const newValue = textBeforeCursor.substring(0, lastAtSymbol) + `@${userName} ` + textAfterCursor;
    
    setShowMentions(false);
    return newValue;
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'hace unos segundos';
    if (diffInSeconds < 3600) return `hace ${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `hace ${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `hace ${Math.floor(diffInSeconds / 86400)}d`;
    
    return date.toLocaleDateString('es-ES', { 
      day: 'numeric', 
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const renderComment = (comment: Comment, isReply: boolean = false) => {
    const isOwner = comment.user_id === user?.id;
    const reactions = comment.reactions || [];
    const reactionGroups = reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = { count: 0, users: [], hasUserReacted: false };
      }
      acc[reaction.emoji].count++;
      acc[reaction.emoji].users.push(reaction.profiles.full_name);
      if (reaction.user_id === user?.id) {
        acc[reaction.emoji].hasUserReacted = true;
      }
      return acc;
    }, {} as Record<string, { count: number; users: string[]; hasUserReacted: boolean }>);

    return (
      <div key={comment.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-6'}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {comment.profiles.avatar_url ? (
              <img
                src={comment.profiles.avatar_url}
                alt={comment.profiles.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">
                  {comment.profiles.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Contenido del comentario */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {comment.profiles.full_name}
                </h4>
                <div className="flex items-center gap-2">
                  <time className="text-xs text-gray-500 dark:text-gray-400">
                    {formatRelativeTime(comment.created_at)}
                    {comment.edited && (
                      <span className="ml-1 text-gray-400">(editado)</span>
                    )}
                  </time>
                  {isOwner && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingComment(comment.id);
                          setEditContent(comment.content);
                        }}
                        className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                      >
                        <i className="ri-edit-line text-xs"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteComment(comment.id)}
                        className="text-gray-400 hover:text-red-500"
                      >
                        <i className="ri-delete-bin-line text-xs"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {editingComment === comment.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full p-2 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-sm resize-none"
                    rows={3}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditComment(comment.id, editContent)}
                      className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 whitespace-nowrap"
                    >
                      Guardar
                    </button>
                    <button
                      onClick={() => {
                        setEditingComment(null);
                        setEditContent('');
                      }}
                      className="px-3 py-1 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-sm whitespace-nowrap"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-gray-700 dark:text-gray-300 text-sm">
                  {comment.content.split(/(@\w+)/g).map((part, index) => 
                    part.startsWith('@') ? (
                      <span key={index} className="text-blue-600 dark:text-blue-400 font-medium">
                        {part}
                      </span>
                    ) : (
                      <span key={index}>{part}</span>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Reacciones */}
            {Object.keys(reactionGroups).length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {Object.entries(reactionGroups).map(([emoji, data]) => (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(comment.id, emoji)}
                    className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border transition-colors ${
                      data.hasUserReacted
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300'
                        : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                    title={data.users.join(', ')}
                  >
                    <span>{emoji}</span>
                    <span>{data.count}</span>
                  </button>
                ))}
              </div>
            )}

            {/* Acciones */}
            <div className="flex items-center gap-4 mt-2">
              <div className="relative">
                <button
                  onClick={() => setShowReactions(showReactions === comment.id ? null : comment.id)}
                  className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
                >
                  <i className="ri-emotion-line"></i>
                  Reaccionar
                </button>
                
                {showReactions === comment.id && (
                  <div className="absolute left-0 top-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 flex gap-1 z-10">
                    {EMOJI_OPTIONS.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(comment.id, emoji)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              >
                <i className="ri-reply-line"></i>
                Responder
              </button>
            </div>

            {/* Formulario de respuesta */}
            {replyingTo === comment.id && (
              <div className="mt-3">
                <CommentForm
                  onSubmit={(content) => handleSubmitComment(content, comment.id)}
                  onCancel={() => setReplyingTo(null)}
                  placeholder={`Responder a ${comment.profiles.full_name}...`}
                  submitText="Responder"
                  submitting={submitting}
                  mentionSuggestions={mentionSuggestions}
                  showMentions={showMentions}
                  onTextChange={handleTextareaChange}
                  onMentionSelect={insertMention}
                />
              </div>
            )}

            {/* Respuestas */}
            {comment.replies && comment.replies.length > 0 && (
              <div className="mt-3 space-y-3">
                {comment.replies.map(reply => renderComment(reply, true))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1">
              <div className="bg-gray-200 dark:bg-gray-700 rounded-lg p-3">
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-2"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-full mb-1"></div>
                <div className="h-3 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Formulario para nuevo comentario */}
      <div>
        <CommentForm
          onSubmit={(content) => handleSubmitComment(content)}
          placeholder="Escribe un comentario sobre el proyecto... (usa @ para mencionar a alguien)"
          submitText="Comentar"
          submitting={submitting}
          mentionSuggestions={mentionSuggestions}
          showMentions={showMentions}
          onTextChange={handleTextareaChange}
          onMentionSelect={insertMention}
        />
      </div>

      {/* Lista de comentarios */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-8">
          <i className="ri-chat-3-line text-4xl text-gray-300 dark:text-gray-600 mb-3"></i>
          <p className="text-gray-500 dark:text-gray-400">
            No hay comentarios aún. ¡Sé el primero en comentar!
          </p>
        </div>
      )}
    </div>
  );
}

// Componente separado para el formulario de comentarios
function CommentForm({ 
  onSubmit, 
  onCancel, 
  placeholder, 
  submitText, 
  submitting,
  mentionSuggestions,
  showMentions,
  onTextChange,
  onMentionSelect
}: {
  onSubmit: (content: string) => void;
  onCancel?: () => void;
  placeholder: string;
  submitText: string;
  submitting: boolean;
  mentionSuggestions: any[];
  showMentions: boolean;
  onTextChange: (value: string, textarea: HTMLTextAreaElement) => void;
  onMentionSelect: (textarea: HTMLTextAreaElement, currentValue: string, userName: string) => string;
}) {
  const [content, setContent] = useState('');
  const [textareaRef, setTextareaRef] = useState<HTMLTextAreaElement | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      onSubmit(content);
      setContent('');
    }
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);
    if (textareaRef) {
      onTextChange(value, textareaRef);
    }
  };

  const handleMentionClick = (userName: string) => {
    if (textareaRef) {
      const newValue = onMentionSelect(textareaRef, content, userName);
      setContent(newValue);
      textareaRef.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="relative">
        <textarea
          ref={setTextareaRef}
          value={content}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          rows={3}
        />
        
        {/* Sugerencias de menciones */}
        {showMentions && mentionSuggestions.length > 0 && (
          <div className="absolute left-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-40 overflow-y-auto z-10 w-full">
            {mentionSuggestions.map(user => (
              <button
                key={user.id}
                type="button"
                onClick={() => handleMentionClick(user.full_name)}
                className="w-full text-left px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2"
              >
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.full_name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xs font-medium">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <span className="text-sm">{user.full_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Tip: Usa @ para mencionar a alguien
        </div>
        <div className="flex items-center gap-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors whitespace-nowrap"
            >
              Cancelar
            </button>
          )}
          <button
            type="submit"
            disabled={!content.trim() || submitting}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap"
          >
            {submitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Enviando...
              </>
            ) : (
              <>
                <i className="ri-send-plane-line"></i>
                {submitText}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
