import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MessageSquare, MoreVertical, Ban, Flag } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { supabase } from '@/lib/supabase';
import { getComments, createComment, toggleLike, deleteComment, type Comment } from '@/lib/comments';
import { createCommentReport, type ReportReason } from '@/lib/comment-reports';
import { getCurrentUserProfile, getUserAvatar, type UserProfile } from '@/lib/user-profiles';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import ReportCommentDialog from './ReportCommentDialog';
import AuthProviderDialog from '../AuthProviderDialog';

type Props = {
  gameId: number;
};

export default function CommentSection({ gameId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [user, setUser] = useState<any>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [newCommentIds, setNewCommentIds] = useState<Set<string>>(new Set());
  const [reportDialogOpen, setReportDialogOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [reportingCommentId, setReportingCommentId] = useState<string | null>(null);
  const [reportingCommentAuthor, setReportingCommentAuthor] = useState<string>('');

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
    
    if (user) {
      const profile = await getCurrentUserProfile();
      setUserProfile(profile);
    }
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
    setNewCommentIds(prev => new Set(prev).add(tempComment.id));

    try {
      const result = await createComment(gameId, newComment);
      // Reemplazar el comentario temporal con el real
      setComments(prev => prev.map(c => c.id === tempComment.id ? result : c));
      setNewCommentIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempComment.id);
        newSet.add(result.id);
        return newSet;
      });
      
      // Remover la animación después de que termine
      setTimeout(() => {
        setNewCommentIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(result.id);
          return newSet;
        });
      }, 1200); // 1000ms duración + 100ms delay + 100ms buffer
    } catch (error) {
      console.error('Error adding comment:', error);
      // Revertir en caso de error
      setComments(prev => prev.filter(c => c.id !== tempComment.id));
      setNewCommentIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempComment.id);
        return newSet;
      });
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
    setNewCommentIds(prev => new Set(prev).add(tempReply.id));

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
      setNewCommentIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempReply.id);
        newSet.add(result.id);
        return newSet;
      });
      
      // Remover la animación después de que termine
      setTimeout(() => {
        setNewCommentIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(result.id);
          return newSet;
        });
      }, 1200);
    } catch (error) {
      console.error('Error adding reply:', error);
      // Revertir en caso de error
      setComments(prev => prev.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: (comment.replies || []).filter(r => r.id !== tempReply.id) }
          : comment
      ));
      setNewCommentIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(tempReply.id);
        return newSet;
      });
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

  const handleReport = (commentId: string, commentAuthor: string) => {
    setReportingCommentId(commentId);
    setReportingCommentAuthor(commentAuthor);
    setReportDialogOpen(true);
  };

  const handleSubmitReport = async (reason: ReportReason, details: string) => {
    if (!reportingCommentId) return;

    try {
      await createCommentReport(reportingCommentId, reason, details);
      alert('Reporte enviado correctamente. Nuestro equipo lo revisará pronto.');
    } catch (error) {
      console.error('Error submitting report:', error);
      alert(`Error al enviar el reporte: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      throw error; // Re-throw para que el diálogo maneje el estado de loading
    }
  };

  const getInitials = (nickname?: string) => {
    if (nickname) {
      return nickname.slice(0, 2).toUpperCase();
    }
    return 'U';
  };

  const getDisplayName = (comment: Comment) => {
    return comment.user_name || 'Usuario';
  };

  const getTimeAgo = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true, locale: es });
    } catch {
      return 'hace un momento';
    }
  };

  const getUserAvatarUrl = (comment: Comment) => {
    if (comment.user_avatar) {
      return comment.user_avatar;
    }
    // Generar avatar basado en el user_id
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${comment.user_id}`;
  };

  return (
    <div className="mt-8 pt-8 border-t border-gray-700">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4 text-white">
          {comments.length} comentario{comments.length !== 1 ? 's' : ''}
        </h2>
        
        {!user ? (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-center">
            <p className="text-gray-400 mb-3">Inicia sesión para comentar</p>
            <Button
              onClick={() => setAuthDialogOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Iniciar sesión
            </Button>
          </div>
        ) : (
          <div className="flex gap-3">
            <Avatar className="w-10 h-10 flex-shrink-0">
              {userProfile && (
                <AvatarImage src={getUserAvatar(userProfile)} alt="Tu avatar" />
              )}
              <AvatarFallback className="bg-gray-500 text-white">
                {userProfile ? getInitials(userProfile.nickname) : 'U'}
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
            <CommentItem 
              key={comment.id} 
              comment={comment}
              user={user}
              replyingTo={replyingTo}
              replyText={replyText}
              newCommentIds={newCommentIds}
              onSetReplyingTo={setReplyingTo}
              onSetReplyText={setReplyText}
              onAddReply={handleAddReply}
              onLike={handleLike}
              onDelete={handleDelete}
              onReport={handleReport}
              getInitials={getInitials}
              getDisplayName={getDisplayName}
              getUserAvatarUrl={getUserAvatarUrl}
              getTimeAgo={getTimeAgo}
            />
          ))}
        </div>
      )}

      <AuthProviderDialog
        isOpen={authDialogOpen}
        onClose={() => setAuthDialogOpen(false)}
      />

      <ReportCommentDialog
        isOpen={reportDialogOpen}
        onClose={() => {
          setReportDialogOpen(false);
          setReportingCommentId(null);
          setReportingCommentAuthor('');
        }}
        onSubmit={handleSubmitReport}
        commentAuthor={reportingCommentAuthor}
      />
    </div>
  );
}

// Mover CommentItem fuera del componente principal
const CommentItem = React.memo(({ 
  comment, 
  user,
  replyingTo,
  replyText,
  newCommentIds,
  onSetReplyingTo,
  onSetReplyText,
  onAddReply,
  onLike,
  onDelete,
  onReport,
  getInitials,
  getDisplayName,
  getUserAvatarUrl,
  getTimeAgo,
  isReply = false, 
  parentId = null 
}: { 
  comment: Comment; 
  user: any;
  replyingTo: string | null;
  replyText: string;
  newCommentIds: Set<string>;
  onSetReplyingTo: (id: string | null) => void;
  onSetReplyText: (text: string) => void;
  onAddReply: (commentId: string) => void;
  onLike: (commentId: string, isReply?: boolean, parentId?: string) => void;
  onDelete: (commentId: string, isReply?: boolean, parentId?: string) => void;
  onReport: (commentId: string, commentAuthor: string) => void;
  getInitials: (nickname?: string) => string;
  getDisplayName: (comment: Comment) => string;
  getUserAvatarUrl: (comment: Comment) => string;
  getTimeAgo: (date: string) => string;
  isReply?: boolean; 
  parentId?: string | null;
}) => {
  const isOwner = user?.id === comment.user_id;
  const displayName = getDisplayName(comment);
  const initials = getInitials(displayName);
  const avatarUrl = getUserAvatarUrl(comment);
  const isNewComment = newCommentIds.has(comment.id);

  return (
    <div className={`flex gap-3 mb-4 ${isNewComment ? 'animate-fade-in animate-duration-1000 animate-delay-100' : ''}`}>
      <Avatar className="w-10 h-10 flex-shrink-0">
        <AvatarImage src={avatarUrl} alt={displayName} />
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
        
        <div className="flex items-center gap-4 relative" style={{ zIndex: 1 }}>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 px-2 ${comment.user_has_liked ? 'text-blue-500' : 'text-gray-400'} hover:text-white`}
            onClick={() => onLike(comment.id, isReply, parentId || undefined)}
            disabled={!user}
            style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            <span className="text-xs">{comment.likes}</span>
          </Button>
          
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-700"
              onClick={() => onSetReplyingTo(comment.id)}
              disabled={!user}
              style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}
            >
              Responder
            </Button>
          )}
          
          {(isOwner || user) && (
            <DropdownMenu modal={false}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 text-gray-400 hover:text-white hover:bg-gray-700"
                  style={{ position: 'relative', zIndex: 1, pointerEvents: 'auto' }}
                >
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end" 
                className="bg-gray-800 border-gray-700"
                style={{ zIndex: 99999 }}
              >
                {isOwner ? (
                  <DropdownMenuItem 
                    className="text-red-600 hover:text-red-500 hover:bg-gray-700 cursor-pointer"
                    onClick={() => onDelete(comment.id, isReply, parentId || undefined)}
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Eliminar
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem 
                    className="text-yellow-600 hover:text-yellow-500 hover:bg-gray-700 cursor-pointer"
                    onClick={() => onReport(comment.id, displayName)}
                  >
                    <Flag className="w-4 h-4 mr-2" />
                    Reportar
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
        
        {replyingTo === comment.id && user && (
          <div className="mt-3 flex gap-2">
            <Avatar className="w-8 h-8 flex-shrink-0">
              <AvatarImage src={getUserAvatarUrl(comment)} alt="Tu avatar" />
              <AvatarFallback className="bg-gray-500 text-white text-xs">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <Textarea
                placeholder="Agregar una respuesta..."
                value={replyText}
                onChange={(e) => onSetReplyText(e.target.value)}
                className="min-h-[80px] text-sm bg-gray-800 border-gray-700 text-gray-200"
              />
              <div className="flex gap-2 mt-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    onSetReplyingTo(null);
                    onSetReplyText('');
                  }}
                  className="text-gray-400 hover:text-white"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => onAddReply(comment.id)}
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
                user={user}
                replyingTo={replyingTo}
                replyText={replyText}
                newCommentIds={newCommentIds}
                onSetReplyingTo={onSetReplyingTo}
                onSetReplyText={onSetReplyText}
                onAddReply={onAddReply}
                onLike={onLike}
                onDelete={onDelete}
                onReport={onReport}
                getInitials={getInitials}
                getDisplayName={getDisplayName}
                getUserAvatarUrl={getUserAvatarUrl}
                getTimeAgo={getTimeAgo}
                isReply={true}
                parentId={comment.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

CommentItem.displayName = 'CommentItem';
