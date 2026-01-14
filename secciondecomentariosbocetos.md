import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ThumbsUp, ThumbsDown, MessageSquare, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const CommentSection = () => {
  const [comments, setComments] = useState([
    {
      id: 1,
      author: 'María García',
      avatar: 'MG',
      time: 'hace 2 días',
      content: '¡Excelente video! Me ayudó mucho a entender el tema. Espero más contenido como este.',
      likes: 145,
      dislikes: 3,
      replies: [
        {
          id: 101,
          author: 'Juan Pérez',
          avatar: 'JP',
          time: 'hace 1 día',
          content: 'Totalmente de acuerdo, muy bien explicado.',
          likes: 23,
          dislikes: 0,
        }
      ]
    },
    {
      id: 2,
      author: 'Carlos Rodríguez',
      avatar: 'CR',
      time: 'hace 5 días',
      content: 'Podrías hacer un tutorial sobre cómo implementar esto en producción?',
      likes: 89,
      dislikes: 1,
      replies: []
    },
    {
      id: 3,
      author: 'Ana Martínez',
      avatar: 'AM',
      time: 'hace 1 semana',
      content: 'Me encanta la calidad de tus tutoriales. Sigue así! 🎉',
      likes: 234,
      dislikes: 2,
      replies: []
    }
  ]);

  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');

  const handleAddComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: 'Tú',
        avatar: 'TU',
        time: 'ahora',
        content: newComment,
        likes: 0,
        dislikes: 0,
        replies: []
      };
      setComments([comment, ...comments]);
      setNewComment('');
    }
  };

  const handleAddReply = (commentId) => {
    if (replyText.trim()) {
      const reply = {
        id: Date.now(),
        author: 'Tú',
        avatar: 'TU',
        time: 'ahora',
        content: replyText,
        likes: 0,
        dislikes: 0,
      };
      
      setComments(comments.map(comment => 
        comment.id === commentId 
          ? { ...comment, replies: [...comment.replies, reply] }
          : comment
      ));
      setReplyText('');
      setReplyingTo(null);
    }
  };

  const handleLike = (commentId, isReply = false, parentId = null) => {
    if (isReply) {
      setComments(comments.map(comment => 
        comment.id === parentId
          ? {
              ...comment,
              replies: comment.replies.map(reply =>
                reply.id === commentId
                  ? { ...reply, likes: reply.likes + 1 }
                  : reply
              )
            }
          : comment
      ));
    } else {
      setComments(comments.map(comment =>
        comment.id === commentId
          ? { ...comment, likes: comment.likes + 1 }
          : comment
      ));
    }
  };

  const CommentItem = ({ comment, isReply = false, parentId = null }) => (
    <div className="flex gap-3 mb-4">
      <Avatar className="w-10 h-10">
        <AvatarFallback className="bg-blue-500 text-white text-sm">
          {comment.avatar}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-sm">{comment.author}</span>
          <span className="text-xs text-gray-500">{comment.time}</span>
        </div>
        
        <p className="text-sm mb-2">{comment.content}</p>
        
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2"
            onClick={() => handleLike(comment.id, isReply, parentId)}
          >
            <ThumbsUp className="w-4 h-4 mr-1" />
            <span className="text-xs">{comment.likes}</span>
          </Button>
          
          <Button variant="ghost" size="sm" className="h-8 px-2">
            <ThumbsDown className="w-4 h-4" />
          </Button>
          
          {!isReply && (
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs font-semibold"
              onClick={() => setReplyingTo(comment.id)}
            >
              Responder
            </Button>
          )}
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Reportar</DropdownMenuItem>
              <DropdownMenuItem>Editar</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        {replyingTo === comment.id && (
          <div className="mt-3 flex gap-2">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="bg-gray-500 text-white text-xs">
                TU
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                placeholder="Agregar una respuesta..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="min-h-[80px] text-sm"
              />
              <div className="flex gap-2 mt-2 justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setReplyingTo(null);
                    setReplyText('');
                  }}
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

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white min-h-screen">
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">
          {comments.length} comentarios
        </h2>
        
        <div className="flex gap-3">
          <Avatar className="w-10 h-10">
            <AvatarFallback className="bg-gray-500 text-white">
              TU
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <Textarea
              placeholder="Agregar un comentario..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex gap-2 mt-2 justify-end">
              <Button
                variant="ghost"
                onClick={() => setNewComment('')}
                disabled={!newComment}
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
      </div>
      
      <div className="space-y-6">
        {comments.map(comment => (
          <CommentItem key={comment.id} comment={comment} />
        ))}
      </div>
    </div>
  );
};

export default CommentSection;