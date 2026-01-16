// Función para convertir el nombre del juego a slug de RAWG
export function gameNameToSlug(gameName: string): string {
  return gameName
    .toLowerCase()
    .replace(/[™®©]/g, '') // Remover símbolos de marca registrada
    .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres especiales con guiones
    .replace(/^-+|-+$/g, ''); // Remover guiones al inicio y final
}

// Función para obtener el rating de RAWG
export async function getRawgRating(gameName: string): Promise<number> {
  try {
    const slug = gameNameToSlug(gameName);
    
    const response = await fetch(`/api/rawg/${slug}`, {
      cache: 'force-cache',
      next: { revalidate: 86400 }, // Cache por 24 horas
    });

    if (!response.ok) {
      console.warn(`[RAWG] Failed to fetch rating for ${gameName}`);
      return 0;
    }

    const data = await response.json();
    
    // RAWG usa rating de 0-5, convertir a 0-10
    const rating = (data.rating || 0) * 2;
    
    console.log(`[RAWG] Rating for ${gameName}: ${rating}/10`);
    
    return rating;
  } catch (error) {
    console.error(`[RAWG] Error fetching rating for ${gameName}:`, error);
    return 0;
  }
}
