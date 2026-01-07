import { NextResponse } from 'next/server';

// Endpoint de prueba para verificar que el sistema funciona
export async function GET() {
  try {
    const cronUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}/api/cron/fetch-games`
      : 'http://localhost:3000/api/cron/fetch-games';
    
    const cronSecret = process.env.CRON_SECRET || 'your-secret-key';

    // Llamar al endpoint de cron
    const response = await fetch(cronUrl, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    });

    const data = await response.json();

    return NextResponse.json({
      success: true,
      message: 'Test ejecutado correctamente',
      cronResponse: data,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error testing cron:', error);
    return NextResponse.json(
      { 
        error: 'Error al probar el cron',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
