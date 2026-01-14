import { supabase } from '@/lib/supabase';

export type Comment = {
  id: string;
  user_id: string;
  game_id: number;
  content: string;
  parent_id: string | null;
  likes: number;
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      avatar_url?: string;
      full_name?: string;
      name?: string;
    };
  };
  replies?: Comment[];
  user_has_liked?: boolean;
};

export async function getComments(gameId: number) {
  // Obtener usuario actual para verificar likes
  const { data: { user } } = await supabase.auth.getUser();
  
  // Obtener comentarios principales (sin parent_id)
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      *,
      user:user_id (
        id,
        email,
        user_metadata
      )
    `)
    .eq('game_id', gameId)
    .is('parent_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comments:', error);
    return [];
  }

  // Obtener respuestas para cada comentario
  const commentsWithReplies = await Promise.all(
    (comments || []).map(async (comment) => {
      const { data: replies } = await supabase
        .from('comments')
        .select(`
          *,
          user:user_id (
            id,
            email,
            user_metadata
          )
        `)
        .eq('parent_id', comment.id)
        .order('created_at', { ascending: true });

      // Verificar likes del usuario
      let userHasLiked = false;
      let repliesWithLikes = replies || [];

      if (user) {
        const { data: commentLike } = await supabase
          .from('comment_likes')
          .select('id')
          .eq('comment_id', comment.id)
          .eq('user_id', user.id)
          .single();

        userHasLiked = !!commentLike;

        // Verificar likes en respuestas
        repliesWithLikes = await Promise.all(
          (replies || []).map(async (reply) => {
            const { data: replyLike } = await supabase
              .from('comment_likes')
              .select('id')
              .eq('comment_id', reply.id)
              .eq('user_id', user.id)
              .single();

            return {
              ...reply,
              user_has_liked: !!replyLike,
            };
          })
        );
      }

      return {
        ...comment,
        replies: repliesWithLikes,
        user_has_liked: userHasLiked,
      };
    })
  );

  return commentsWithReplies;
}

export async function createComment(gameId: number, content: string, parentId?: string) {
  console.log('createComment called with:', { gameId, content, parentId });
  
  const { data: { user } } = await supabase.auth.getUser();
  
  console.log('Current user:', user?.id);
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const insertData = {
    user_id: user.id,
    game_id: gameId,
    content,
    parent_id: parentId || null,
  };
  
  console.log('Inserting comment:', insertData);

  const { data, error } = await supabase
    .from('comments')
    .insert(insertData)
    .select(`
      *,
      user:user_id (
        id,
        email,
        user_metadata
      )
    `)
    .single();

  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }

  console.log('Comment created:', data);
  return data;
}

export async function toggleLike(commentId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  // Verificar si ya existe el like
  const { data: existingLike } = await supabase
    .from('comment_likes')
    .select('id')
    .eq('comment_id', commentId)
    .eq('user_id', user.id)
    .single();

  if (existingLike) {
    // Remover like
    const { error: deleteError } = await supabase
      .from('comment_likes')
      .delete()
      .eq('id', existingLike.id);

    if (deleteError) throw deleteError;

    // Decrementar contador
    const { error: updateError } = await supabase
      .from('comments')
      .update({ likes: supabase.rpc('decrement_likes', { comment_id: commentId }) })
      .eq('id', commentId);

    if (updateError) {
      // Fallback: obtener likes actuales y decrementar
      const { data: comment } = await supabase
        .from('comments')
        .select('likes')
        .eq('id', commentId)
        .single();

      if (comment) {
        await supabase
          .from('comments')
          .update({ likes: Math.max(0, comment.likes - 1) })
          .eq('id', commentId);
      }
    }

    return false; // Unlike
  } else {
    // Agregar like
    const { error: insertError } = await supabase
      .from('comment_likes')
      .insert({
        comment_id: commentId,
        user_id: user.id,
      });

    if (insertError) throw insertError;

    // Incrementar contador
    const { data: comment } = await supabase
      .from('comments')
      .select('likes')
      .eq('id', commentId)
      .single();

    if (comment) {
      await supabase
        .from('comments')
        .update({ likes: comment.likes + 1 })
        .eq('id', commentId);
    }

    return true; // Like
  }
}

export async function deleteComment(commentId: string) {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('User must be authenticated');
  }

  const { error } = await supabase
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', user.id);

  if (error) {
    console.error('Error deleting comment:', error);
    throw error;
  }
}
