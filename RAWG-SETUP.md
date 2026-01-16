# Configuración de RAWG API

## ¿Qué es RAWG?

RAWG es una base de datos de videojuegos que proporciona información detallada sobre más de 500,000 juegos, incluyendo ratings, géneros, plataformas, y más.

## ¿Por qué usar RAWG?

La API de RAWG nos permite obtener ratings reales de los juegos basados en las valoraciones de la comunidad, en lugar de usar un valor fijo de 7.5 para todos los juegos. Esto proporciona una experiencia más precisa y útil para los usuarios.

## Cómo obtener tu API Key

1. Ve a [https://rawg.io/apidocs](https://rawg.io/apidocs)
2. Haz clic en "Get API Key" en la parte superior
3. Crea una cuenta gratuita (puedes usar Google, GitHub, o email)
4. Una vez registrado, verás tu API Key en el dashboard
5. Copia la API Key

## Configuración

1. Abre tu archivo `.env.local` (o créalo si no existe)
2. Agrega la siguiente línea:

```env
RAWG_API_KEY=tu_api_key_aqui
```

3. Reemplaza `tu_api_key_aqui` con tu API Key real
4. Guarda el archivo
5. Reinicia tu servidor de desarrollo

## Límites de la API

- **Plan Gratuito**: 20,000 requests por mes
- **Suficiente para**: Proyectos pequeños y medianos
- **Cache**: La aplicación cachea los resultados por 24 horas para reducir el uso

## Cómo funciona

1. Cuando se carga un juego, primero se intenta obtener el rating de Metacritic desde Steam
2. Si no hay rating de Metacritic, se consulta la API de RAWG
3. RAWG devuelve un rating de 0-5, que se convierte a 0-10 para consistencia
4. Si RAWG tampoco tiene rating, se usa el valor por defecto de 7.5

## Ejemplo de uso

```typescript
import { getRawgRating } from '@/lib/rawg';

// Obtener rating de un juego
const rating = await getRawgRating('The Witcher 3');
console.log(rating); // 9.2 (de 10)
```

## Troubleshooting

### Error: "RAWG API key not configured"

- Verifica que hayas agregado `RAWG_API_KEY` a tu archivo `.env.local`
- Asegúrate de reiniciar el servidor después de agregar la variable

### Error: "Rate limit exceeded"

- Has excedido el límite de 20,000 requests/mes
- Considera actualizar a un plan pago o esperar al siguiente mes
- El cache de 24 horas ayuda a reducir el uso

### Los ratings no se actualizan

- Los ratings se cachean por 24 horas
- Para forzar una actualización, limpia el cache del navegador
- O espera 24 horas para que el cache expire

## Recursos adicionales

- [Documentación oficial de RAWG](https://rawg.io/apidocs)
- [Ejemplos de la API](https://api.rawg.io/docs/)
