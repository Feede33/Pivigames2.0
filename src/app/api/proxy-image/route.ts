import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const imageUrl = searchParams.get('url');

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'Missing image URL' },
        { status: 400 }
      );
    }

    // Validar que sea una URL de Steam
    const validDomains = [
      'steamstatic.com',
      'akamai',
      'steamcdn',
      'cloudflare.steamstatic.com'
    ];
    
    const isValidDomain = validDomains.some(domain => imageUrl.includes(domain));
    
    if (!isValidDomain) {
      return NextResponse.json(
        { error: 'Invalid image domain' },
        { status: 403 }
      );
    }

    // Fetch the image from Steam con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos timeout

    const response = await fetch(imageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
      },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch image: ${imageUrl} - Status: ${response.status}`);
      
      // Retornar 404 para que el navegador maneje el error
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    // Return the image with CORS headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('Image proxy error:', error);
    
    // Retornar 404 en lugar de placeholder
    return NextResponse.json(
      { error: 'Failed to proxy image' },
      { status: 404 }
    );
  }
}
