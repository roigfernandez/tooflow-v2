'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

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
  edited: boolean;
}

interface TaskCommentsProps {
  taskId: string;
}

// Demo comments data
const DEMO_COMMENTS: any[] = [
  {
    id: 'c1',
    task_id: '1',
    user_id: 'demo-user',
    content: '¡Excelente trabajo con los wireframes! Me gusta mucho la dirección que tomaste.',
    created_at: '2024-01-12T10:30:00Z',
    updated_at: '2024-01-12T10:30:00Z',
    parent_id: null,
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'c2',
    task_id: '1',
    user_id: 'demo-user',
    content: 'He validado con el cliente y están muy contentos con el diseño.',
    created_at: '2024-01-13T14:15:00Z',
    updated_at: '2024-01-13T14:15:00Z',
    parent_id: 'c1',
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'c3',
    task_id: '2',
    user_id: 'demo-user',
    content: 'Implementé JWT y los endpoints básicos. Falta el middleware de autenticación.',
    created_at: '2024-01-18T09:00:00Z',
    updated_at: '2024-01-18T09:00:00Z',
    parent_id: null,
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  },
  {
    id: 'c4',
    task_id: '2',
    user_id: 'demo-user',
    content: '¿Alguien puede revisar el código de seguridad antes de continuar?',
    created_at: '2024-01-19T11:30:00Z',
    updated_at: '2024-01-19T11:30:00Z',
    parent_id: null,
    profiles: {
      full_name: 'Usuario Demostración',
      avatar_url: null
    }
  }
];

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [taskId]);

  const loadComments = () => {
    setLoading(true);

    // Filter comments for this task
    const taskComments = DEMO_COMMENTS.filter(c => c.task_id === taskId);

    // Organize into tree structure
    const commentsMap = new Map();
    const rootComments: Comment[] = [];

    taskComments.forEach(comment => {
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

    // Add replies to parent comments
    taskComments.forEach(comment => {
      if (comment.parent_id) {
        const parent = commentsMap.get(comment.parent_id);
        if (parent) {
          parent.replies.push(commentsMap.get(comment.id));
        }
      }
    });

    setComments(rootComments);
    setLoading(false);
  };

  const handleSubmitComment = (content: string, parentId: string | null = null) => {
    if (!content.trim() || !user) return;

    const newCommentObj = {
      id: `c${Date.now()}`,
      task_id: taskId,
      user_id: user.id,
      content: content.trim(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      parent_id: parentId,
      profiles: {
        full_name: user.user_metadata?.full_name || user.email || 'Usuario',
        avatar_url: null
      }
    };

    DEMO_COMMENTS.push(newCommentObj);
    loadComments();

    if (parentId) {
      setReplyingTo(null);
      setReplyContent('');
    } else {
      setNewComment('');
    }
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

    return (
      <div key={comment.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-6'}`}>
        <div className="flex gap-3">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {comment.profiles.full_name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
              <div className="flex items-center justify-between mb-1">
                <h4 className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                  {comment.profiles.full_name}
                </h4>
                <time className="text-xs text-gray-500 dark:text-gray-400">
                  {formatRelativeTime(comment.created_at)}
                  {comment.edited && (
                    <span className="ml-1 text-gray-400">(editado)</span>
                  )}
                </time>
              </div>

              <div className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">
                {comment.content}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4 mt-2">
              <button
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 flex items-center gap-1"
              >
                <i className="ri-reply-line"></i>
                Responder
              </button>
            </div>

            {/* Reply form */}
            {replyingTo === comment.id && (
              <div className="mt-3">
                <div className="space-y-2">
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`Responder a ${comment.profiles.full_name}...`}
                    className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSubmitComment(replyContent, comment.id)}
                      disabled={!replyContent.trim()}
                      className="px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2 text-sm"
                    >
                      <i className="ri-send-plane-line"></i>
                      <span className="hidden sm:inline">Responder</span>
                    </button>
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyContent('');
                      }}
                      className="px-3 sm:px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors text-sm"
                    >
                      <span className="hidden sm:inline">Cancelar</span>
                      <span className="sm:hidden">✕</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Replies */}
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
      {/* New comment form */}
      <div>
        <div className="space-y-3">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Escribe un comentario..."
            className="w-full p-3 border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex items-center justify-end">
            <button
              onClick={() => handleSubmitComment(newComment)}
              disabled={!newComment.trim()}
              className="px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center gap-2"
            >
              <i className="ri-send-plane-line"></i>
              <span className="hidden sm:inline">Comentar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Comments list */}
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map(comment => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-8">
          <i className="ri-chat-3-line text-4xl text-gray-300 dark:text-gray-600 mb-3 block"></i>
          <p className="text-gray-500 dark:text-gray-400">
            No hay comentarios aún. ¡Sé el primero en comentar!
          </p>
        </div>
      )}
    </div>
  );
}
