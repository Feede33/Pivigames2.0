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

    return NextResponse.json({
      appid: gameData.steam_appid,
      name: gameData.name,
      screenshots,
      videos,
      header_image: gameData.header_image,
      background: gameData.background,
    });
  } catch (error) {
    console.error('Steam API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch game data' },
      { status: 500 }
    );
  }
}
