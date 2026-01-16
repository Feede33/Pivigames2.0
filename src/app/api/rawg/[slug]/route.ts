import { NextRequest, NextResponse } from 'next/server';

const RAWG_API_KEY = process.env.RAWG_API_KEY;
const RAWG_BASE_URL = 'https://api.rawg.io/api';

// Cache simple en memoria para evitar llamadas repetidas
const cache = new Map<string, { data: any; timestamp: number }>();
const CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 horas

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  if (!RAWG_API_KEY) {
    console.error('[RAWG API] API key not configured');
    return NextResponse.json(
      { error: 'RAWG API key not configured' },
      { status: 500 }
    );
  }

  try {
    // Verificar cache
    const cached = cache.get(slug);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      console.log(`[RAWG API] Cache hit for ${slug}`);
      return NextResponse.json(cached.data);
    }

    console.log(`[RAWG API] Fetching game: ${slug}`);

    // Buscar el juego por slug
    const response = await fetch(
      `${RAWG_BASE_URL}/games/${slug}?key=${RAWG_API_KEY}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        next: { revalidate: 86400 }, // Cache por 24 horas
      }
    );

    if (!response.ok) {
      console.error(`[RAWG API] Error ${response.status} for slug ${slug}`);
      throw new Error(`RAWG API error: ${response.status}`);
    }

    const data = await response.json();

    const responseData = {
      id: data.id,
      slug: data.slug,
      name: data.name,
      rating: data.rating || 0, // Rating de 0-5
      rating_top: data.rating_top || 5,
      ratings_count: data.ratings_count || 0,
      metacritic: data.metacritic || null,
      playtime: data.playtime || 0,
      esrb_rating: data.esrb_rating?.name || null,
    };

    // Guardar en cache
    cache.set(slug, { data: responseData, timestamp: Date.now() });

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200',
      },
    });
  } catch (error) {
    console.error(`[RAWG API] Error fetching slug ${slug}:`, error);
    
    // Retornar datos de fallback
    return NextResponse.json(
      {
        slug,
        rating: 0,
        rating_top: 5,
        ratings_count: 0,
        metacritic: null,
        _error: error instanceof Error ? error.message : 'Unknown error',
        _fallback: true,
      },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=3600',
        },
      }
    );
  }
}
