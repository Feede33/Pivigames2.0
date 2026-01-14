import { supabase } from './supabase';

export type UserProfile = {
  id: string;
  nickname: string;
  avatar_url: string | null;
  avatar_seed: string | null;
  created_at: string;
  updated_at: string;
};

/**
 * Obtener el perfil del usuario actual
 */
export async function getCurrentUserProfile(): Promise<UserProfile | null> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) return null;

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Obtener perfil de usuario por ID
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Obtener múltiples perfiles de usuario
 */
export async function getUserProfiles(userIds: string[]): Promise<Map<string, UserProfile>> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .in('id', userIds);

  if (error) {
    console.error('Error fetching user profiles:', error);
    return new Map();
  }

  const profileMap = new Map<string, UserProfile>();
  data?.forEach(profile => {
    profileMap.set(profile.id, profile);
  });

  return profileMap;
}

/**
 * Actualizar nickname del usuario
 */
export async function updateNickname(newNickname: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Debes iniciar sesión');
  }

  // Validar nickname
  if (!newNickname || newNickname.trim().length < 3) {
    throw new Error('El nickname debe tener al menos 3 caracteres');
  }

  if (newNickname.length > 20) {
    throw new Error('El nickname no puede tener más de 20 caracteres');
  }

  // Solo permitir letras, números y guiones bajos
  if (!/^[a-zA-Z0-9_]+$/.test(newNickname)) {
    throw new Error('El nickname solo puede contener letras, números y guiones bajos');
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ nickname: newNickname })
    .eq('id', user.id);

  if (error) {
    // Si el error es por duplicado
    if (error.code === '23505') {
      throw new Error('Este nickname ya está en uso');
    }
    console.error('Error updating nickname:', error);
    throw new Error('Error al actualizar el nickname: ' + error.message);
  }
}

/**
 * Actualizar avatar URL del usuario
 */
export async function updateAvatarUrl(avatarUrl: string): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error('Debes iniciar sesión');
  }

  const { error } = await supabase
    .from('user_profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id);

  if (error) {
    console.error('Error updating avatar:', error);
    throw new Error('Error al actualizar el avatar: ' + error.message);
  }
}

/**
 * Generar URL de avatar usando DiceBear API
 * https://www.dicebear.com/
 */
export function generateAvatarUrl(seed: string, style: string = 'avataaars'): string {
  // Estilos disponibles: avataaars, bottts, identicon, initials, pixel-art, etc.
  return `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(seed)}`;
}

/**
 * Obtener avatar del usuario (URL personalizada o generada)
 */
export function getUserAvatar(profile: UserProfile | null): string {
  if (!profile) {
    return generateAvatarUrl('anonymous', 'identicon');
  }

  if (profile.avatar_url) {
    return profile.avatar_url;
  }

  if (profile.avatar_seed) {
    return generateAvatarUrl(profile.avatar_seed, 'avataaars');
  }

  return generateAvatarUrl(profile.id, 'identicon');
}

/**
 * Verificar si un nickname está disponible
 */
export async function isNicknameAvailable(nickname: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('nickname', nickname)
    .single();

  if (error && error.code === 'PGRST116') {
    // No se encontró, está disponible
    return true;
  }

  return !data;
}
