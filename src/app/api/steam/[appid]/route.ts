import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ appid: string }> }
) {
  const { appid } = await params;

  try {
    // Steam Store API - no requiere API key
    const response = await fetch(
      `https://store.steampowered.com/api/appdetails?appids=${appid}&l=spanish`,
      { next: { revalidate: 3600 } } // Cache por 1 hora
    );

    if (!response.ok) {
      throw new Error('Failed to fetch from Steam API');
    }

    const data = await response.json();

    if (!data[appid]?.success) {
      return NextResponse.json(
        { error: 'Game not found' },
        { status: 404 }
      );
    }

    const gameData = data[appid].data;

    // Extraer screenshots
    const screenshots = gameData.screenshots?.map((screenshot: any) => ({
      id: screenshot.id,
      thumbnail: screenshot.path_thumbnail,
      full: screenshot.path_full,
    })) || [];

    // Extraer videos/trailers
    const videos = gameData.movies?.map((movie: any) => ({
      id: movie.id,
      name: movie.name,
      thumbnail: movie.thumbnail,
      webm: {
        480: movie.webm?.['480'],
        max: movie.webm?.max,
      },
      mp4: {
        480: movie.mp4?.['480'],
        max: movie.mp4?.max,
      },
    })) || [];

    // Extraer géneros
    const genres = gameData.genres?.map((g: any) => g.description) || [];

    // Extraer categorías/tags
    const categories = gameData.categories?.map((c: any) => c.description) || [];

    // Extraer idiomas soportados
    const languages = gameData.supported_languages
      ?.replace(/<[^>]*>/g, '') // Remover HTML tags
      .replace(/\*/g, '') // Remover asteriscos
      .split(',')
      .map((lang: string) => lang.trim())
      .filter(Boolean) || [];

    // Extraer plataformas
    const platforms = {
      windows: gameData.platforms?.windows || false,
      mac: gameData.platforms?.mac || false,
      linux: gameData.platforms?.linux || false,
    };

    // Extraer desarrolladores y publishers
    const developers = gameData.developers || [];
    const publishers = gameData.publishers || [];

    // Extraer fecha de lanzamiento
    const releaseDate = gameData.release_date?.date || null;

    // Extraer Metacritic score (si existe)
    const metacritic = gameData.metacritic?.score || null;

    // Extraer requisitos del sistema
    const pcRequirements = gameData.pc_requirements || {};

    return NextResponse.json({
      appid: gameData.steam_appid,
      name: gameData.name,
      type: gameData.type,
      description: gameData.short_description,
      detailed_description: gameData.detailed_description,
      about: gameData.about_the_game,
      screenshots,
      videos,
      header_image: gameData.header_image,
      background: gameData.background,
      background_raw: gameData.background_raw,
      genres,
      categories,
      languages,
      platforms,
      developers,
      publishers,
      release_date: releaseDate,
      metacritic,
      pc_requirements: {
        minimum: pcRequirements.minimum?.replace(/<[^>]*>/g, '\n').trim() || null,
        recommended: pcRequirements.recommended?.replace(/<[^>]*>/g, '\n').trim() || null,
      },
      price: gameData.is_free ? 'Free' : gameData.price_overview?.final_formatted || null,
      is_free: gameData.is_free || false,
    });
  } catch (error) {
    console.error('Steam API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game data' },
      { status: 500 }
    );
  }
}
