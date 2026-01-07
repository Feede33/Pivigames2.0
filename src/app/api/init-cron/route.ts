import { NextResponse } from 'next/server';

// Este endpoint se puede llamar una vez para inicializar el sistema
// Después el cron se ejecutará automáticamente cada día
export async function GET() {
  try {
    // Llamar al cron job para ejecutarlo inmediatamente
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000';
    
    const cronSecret = process.env.CRON_SECRET || 'pivigames_secret_2026';

    const response = await fetch(`${baseUrl}/api/cron/fetch-games`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Sistema inicializado. El cron se ejecutará automáticamente cada día a las 8 AM.',
      cronResponse: data,
      nextExecution: 'Mañana a las 8:00 AM (UTC-3)',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error initializing cron:', error);
    return NextResponse.json(
      { 
        error: 'Error al inicializar el sistema',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
