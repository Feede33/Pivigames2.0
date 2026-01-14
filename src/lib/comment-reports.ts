import { supabase } from './supabase';

export type ReportReason = 
  | 'spam'
  | 'harassment'
  | 'hate_speech'
  | 'misinformation'
  | 'inappropriate'
  | 'other';

export type CommentReport = {
  id: string;
  comment_id: string;
  reporter_id: string;
  reason: ReportReason;
  details: string | null;
  status: 'pending' | 'reviewed' | 'resolved' | 'dismissed';
  created_at: string;
  updated_at: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
};

/**
 * Crear un reporte de comentario
 */
export async function createCommentReport(
  commentId: string,
  reason: ReportReason,
  details?: string
): Promise<CommentReport> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Debes iniciar sesión para reportar comentarios');
  }

  const { data, error } = await supabase
    .from('comment_reports')
    .insert({
      comment_id: commentId,
      reporter_id: user.id,
      reason,
      details: details || null,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    // Si el error es por duplicado, dar un mensaje más amigable
    if (error.code === '23505') {
      throw new Error('Ya has reportado este comentario anteriormente');
    }
    console.error('Error creating comment report:', error);
    throw new Error('Error al crear el reporte: ' + error.message);
  }

  return data;
}

/**
 * Verificar si el usuario ya reportó un comentario
 */
export async function hasUserReportedComment(commentId: string): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return false;

  const { data, error } = await supabase
    .from('comment_reports')
    .select('id')
    .eq('comment_id', commentId)
    .eq('reporter_id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
    console.error('Error checking report status:', error);
    return false;
  }

  return !!data;
}

/**
 * Obtener todos los reportes de un comentario (solo para admins)
 */
export async function getCommentReports(commentId: string): Promise<CommentReport[]> {
  const { data, error } = await supabase
    .from('comment_reports')
    .select('*')
    .eq('comment_id', commentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching comment reports:', error);
    throw new Error('Error al obtener reportes: ' + error.message);
  }

  return data || [];
}

/**
 * Obtener todos los reportes pendientes (solo para admins)
 */
export async function getPendingReports(): Promise<CommentReport[]> {
  const { data, error } = await supabase
    .from('comment_reports')
    .select('*')
    .eq('status', 'pending')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching pending reports:', error);
    throw new Error('Error al obtener reportes pendientes: ' + error.message);
  }

  return data || [];
}

/**
 * Actualizar el estado de un reporte (solo para admins)
 */
export async function updateReportStatus(
  reportId: string,
  status: 'reviewed' | 'resolved' | 'dismissed'
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Debes iniciar sesión');
  }

  const { error } = await supabase
    .from('comment_reports')
    .update({
      status,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString()
    })
    .eq('id', reportId);

  if (error) {
    console.error('Error updating report status:', error);
    throw new Error('Error al actualizar el reporte: ' + error.message);
  }
}
