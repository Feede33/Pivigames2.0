import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MessageSquare, MoreVertical, Ban } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { getComments, createComment, toggleLike, deleteComment, type Comment } from '@/lib/comments';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

type Props = {
  gameId: number;
};

export default function CommentSection({ gameId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario y comentarios
  useEffect(() => {
    loadUser();
    loadComments();

    // Suscribirse a cambios en tiempo real
    const channel = supabase
      .channel('comments-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `game_id=eq.${gameId}`,
        },
        () => {
          loadComments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);
  };

  const loadComments = async () => {
    setLoading(true);
    const data = await getComments(gameId);
    setComments(data);
    setLoading(false);
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !user) {
      console.log('Cannot add comment:', { hasContent: !!newComment.trim(), hasUser: !!user });
      return;
    }

    const tempComment: Comment = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      game_id: gameId,
      content: newComment,
      parent_id: null,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
      user_avatar: user.user_metadata?.avatar_url || undefined,
      user_email: user.email || undefined,
      replies: [],
      user_has_liked: false,
    };

    // Actualización optimista
    setComments([tempComment, ...comments]);
    setNewComment('');

    try {
      const result = await createComment(gameId, newComment);
      // Reemplazar el comentario temporal con el real
      setComments(prev => prev.map(c => c.id === tempComment.id ? result : c));
    } catch (error) {
      console.error('Error adding comment:', error);
      // Revertir en caso de error
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
      setNewComment(tempComment.content);
      alert(`Error al publicar comentario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleAddReply = async (commentId: string) => {
    if (!replyText.trim() || !user) return;

    const tempReply: Comment = {
      id: `temp-${Date.now()}`,
      user_id: user.id,
      game_id: gameId,
      content: replyText,
      parent_id: commentId,
      likes: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'Usuario',
      user_avatar: user.user_metadata?.avatar_url || undefined,
      user_email: user.email || undefined,
      user_has_liked: false,
    };

    // Actualización optimista
    setComments(prev => prev.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...(comment.replies || []), tempReply] }
        : comment
    ));
    setReplyText('');
    setReplyingTo(null);

    try {
      const result = await createComment(gameId, replyText, commentId);
      // Reemplazar la respuesta temporal con la real
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { 
              ...comment, 
              replies: (comment.replies || []).map(r => r.id === tempReply.id ? result : r)
            }
          : comment
      ));
    } catch (error) {
      console.error('Error adding reply:', error);
      // Revertir en caso de error
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: (comment.replies || []).filter(r => r.id !== tempReply.id) }
          : comment
      ));
      setReplyText(tempReply.content);
      setReplyingTo(commentId);
      alert(`Error al publicar respuesta: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const handleLike = async (commentId: string, isReply = false, parentId?: string) => {
    if (!user) return;

    // Actualización optimista
    if (isReply && parentId) {
      setComments(prev => prev.map(comment => 
        comment.id === parentId
          ? {
              ...comment,
              replies: (comment.replies || []).map(reply =>
                reply.id === commentId
                  ? { 
                      ...reply, 
                      likes: reply.user_has_liked ? reply.likes - 1 : reply.likes + 1,
                      user_has_liked: !reply.user_has_liked 
                    }
                  : reply
              )
            }
          : comment
      ));
    } else {
      setComments(prev => prev.map(comment =>
        comment.id === commentId
          ? { 
              ...comment, 
              likes: comment.user_has_liked ? comment.likes - 1 : comment.likes + 1,
              user_has_liked: !comment.user_has_liked 
            }
          : comment
      ));
    }

    try {
      await toggleLike(commentId);
    } catch (error) {
      console.error('Error toggling like:', error);
      // Revertir en caso de error
      if (isReply && parentId) {
        setComments(prev => prev.map(comment => 
          comment.id === parentId
            ? {
                ...comment,
                replies: (comment.replies || []).map(reply =>
                  reply.id === commentId
                    ? { 
                        ...reply, 
                        likes: reply.user_has_liked ? reply.likes + 1 : reply.likes - 1,
                        user_has_liked: !reply.user_has_liked 
                      }
                    : reply
                )
              }
            : comment
        ));
      } else {
        setComments(prev => prev.map(comment =>
          comment.id === commentId
            ? { 
                ...comment, 
                likes: comment.user_has_liked ? comment.likes + 1 : comment.likes - 1,
                user_has_liked: !comment.user_has_liked 
              }
            : comment
        ));
      }
    }
  };

  const handleDelete = async (commentId: string, isReply = false, parentId?: string) => {
    if (!user) return;

    // Guardar estado anterior para revertir si falla
    const previousComments = [...comments];

    // Actualización optimista
    if (isReply && parentId) {
      setComments(prev => prev.map(comment => 
        comment.id === parentId
          ? { ...comment, replies: (comment.replies || []).filter(r => r.id !== commentId) }
          : comment
      ));
    } else {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }

    try {
      await deleteComment(commentId);
    } catch (error) {
      console.error('Error deleting comment:', error);
      // Revertir en caso de error
      setComments(previousComments);
      alert(`Error al eliminar comentario: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (comment: Comment) => {
    return comment.user_name || comment.user_email?.split('@')[0] || 'Usuario';
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    } catch {
      return 'hace un momento';
    }
  };

  const CommentItem = ({ comment, isReply = false, parentId = null }: { 
    comment: Comment; 
    isReply?: boolean; 
    parentId?: string | null;
  }) => {
    const isOwner = user?.id === comment.user_id;
    const displayName = getDisplayName(comment);
    const initials = getInitials(comment.user_name, comment.user_email);

    return (
      <div className="flex gap-3 mb-4">
        <Avatar className="w-10 h-10 flex-shrink-0">
          {comment.user_avatar ? (
            <AvatarImage src={comment.user_avatar} alt={displayName} />
          ) : null}
          <AvatarFallback className="bg-blue-500 text-white text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sm text-gray-200">{displayName}</span>
            <span className="text-xs text-gray-500">{getTimeAgo(comment.created_at)}</span>
          </div>
          
          <p className="text-sm mb-2 text-gray-300">{comment.content}</p>
          
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className={`h-8 px-2 ${comment.user_has_liked ? 'text-blue-500' : 'text-gray-400'} hover:text-white`}
              onClick={() => handleLike(comment.id, isReply, parentId || undefined)}
              disabled={!user}
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              <span className="text-xs">{comment.likes}</span>
            </Button>
            
            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-xs font-semibold text-gray-400 hover:text-white"
                onClick={() => setReplyingTo(comment.id)}
                disabled={!user}
              >
                Responder
              </Button>
            )}
            
            {isOwner && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-gray-800 border-gray-700">
                  <DropdownMenuItem 
                    className="text-red-600 hover:text-red-500"
                    onClick={() => handleDelete(comment.id, isReply, parentId || undefined)}
                  >
                    Eliminar
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {replyingTo === comment.id && user && (
            <div className="mt-3 flex gap-2">
              <Avatar className="w-8 h-8 flex-shrink-0">
                {user.user_metadata?.avatar_url ? (
                  <AvatarImage src={user.user_metadata.avatar_url} alt="Tu" />
                ) : null}
                <AvatarFallback className="bg-gray-500 text-white text-xs">
                  {getInitials(user.user_metadata?.full_name || user.user_metadata?.name, user.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <Textarea
                  placeholder="Agregar una respuesta..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[80px] text-sm bg-gray-800 border-gray-700 text-gray-200"
                />
                <div className="flex gap-2 mt-2 justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setReplyingTo(null);
                      setReplyText('');
                    }}
                    className="text-gray-400 hover:text-white"
                  >
                    Cancelar
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => handleAddReply(comment.id)}
                    disabled={!replyText.trim()}
                  >
                    Responder
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map(reply => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  isReply={true}
                  parentId={comment.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mt-8 pt-8 border-t border-gray-700">
        <div className="mb-6">
          <div className="h-8 bg-gray-700 rounded w-48 mb-6 animate-pulse" />
        </div>
        <div className="space-y-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex gap-3">
              <div className="w-10 h-10 bg-gray-700 rounded-full animate-pulse flex-shrink-0" />
              <div className="flex-1 space-y-3">
                <div className="flex gap-2">
                  <div className="h-4 bg-gray-700 rounded w-32 animate-pulse" />
                  <div className="h-4 bg-gray-700 rounded w-20 animate-pulse" />
                </div>
                <div className="h-3 bg-gray-700 rounded w-full animate-pulse" />
                <div className="h-3 bg-gray-700 rounded w-5/6 animate-pulse" />
                <div className="flex gap-4 mt-2">
                  <div className="h-8 bg-gray-700 rounded w-16 animate-pulse" />
                  <div className="h-8 bg-gray-700 rounded w-20 animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 pt-8 border-t border-gray-700">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">
          {comments.length} comentario{comments.length !== 1 ? 's' : ''}
        </h2>
        
        {!user ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-400 mb-3">Inicia sesión con Discord para comentar</p>
            <Button
              onClick={() => supabase.auth.signInWithOAuth({ provider: 'discord' })}
              className="bg-[#5865F2] hover:bg-[#4752C4]"
            >
              Iniciar sesión con Discord
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              {user.user_metadata?.avatar_url ? (
                <AvatarImage src={user.user_metadata.avatar_url} alt="Tu" />
              ) : null}
              <AvatarFallback className="bg-gray-500 text-white">
                {getInitials(user.user_metadata?.full_name || user.user_metadata?.name, user.email)}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 min-w-0">
              <Textarea
                placeholder="Agregar un comentario..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="min-h-[80px] bg-gray-800 border-gray-700 text-gray-200"
              />
              <div className="flex gap-2 mt-2 justify-end">
                <Button
                  variant="ghost"
                  onClick={() => setNewComment('')}
                  disabled={!newComment}
                  className="text-gray-400 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Comentar
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {comments.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No hay comentarios aún. ¡Sé el primero en comentar!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map(comment => (
            <CommentItem key={comment.id} comment={comment} />
          ))}
        </div>
      )}
    </div>
  );
}
