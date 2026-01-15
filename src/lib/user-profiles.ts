import { supabase } from './supabase';

export type UserProfile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  avatar_seed: string | null;
  email?: string | null; // Puede estar ofuscado
  user_id_short?: string; // ID corto ofuscado
  created_at: string;
  updated_at?: string;
};

/**
 * Obtiene el perfil del usuario actual (con datos completos, no ofuscados)
 * Solo funciona si el usuario está autenticado
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.rpc('get_my_profile');
    
    if (error) {
      console.error('Error fetching current user profile:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching current user profile:', error);
    return null;
  }
}

/**
 * Obtiene el perfil de otro usuario (con datos ofuscados)
 * @param userId - ID del usuario a consultar
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const { data, error } = await supabase.rpc('get_user_profile', {
      user_id: userId
    });
    
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data?.[0] || null;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

/**
 * Obtiene el avatar del usuario
 * Prioriza avatar_url, luego genera uno con dicebear usando avatar_seed
 */
export function getUserAvatar(profile: UserProfile): string {
  if (profile.avatar_url) {
    return profile.avatar_url;
  }
  
  const seed = profile.avatar_seed || profile.id;
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

/**
 * Actualiza el perfil del usuario actual
 */
export async function updateUserProfile(updates: {
  nickname?: string;
  avatar_url?: string;
  avatar_seed?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }
    
    const { error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);
    
    if (error) {
      console.error('Error updating profile:', error);
      return { success: false, error: error.message };
    }
    
    return { success: true };
  } catch (error: any) {
    console.error('Error updating profile:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Verifica si un nickname está disponible
 */
export async function isNicknameAvailable(nickname: string, currentUserId?: string): Promise<boolean> {
  try {
    let query = supabase
      .from('user_profiles')
      .select('id')
      .eq('nickname', nickname);
    
    // Si estamos actualizando, excluir el usuario actual
    if (currentUserId) {
      query = query.neq('id', currentUserId);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error checking nickname availability:', error);
      return false;
    }
    
    return data.length === 0;
  } catch (error) {
    console.error('Error checking nickname availability:', error);
    return false;
  }
}
