# Sistema de Ofertas de Steam con Precios Regionales

## Descripción
El sistema ahora muestra las ofertas reales de Steam con precios según la ubicación del usuario (basado en su IP).

## Características Implementadas

### 1. API de Ofertas de Steam (`/api/steam/specials`)
- Obtiene ofertas actuales de Steam usando la API oficial
- Soporta precios regionales mediante el parámetro `cc` (country code)
- Cache de 30 minutos para optimizar rendimiento
- Combina ofertas de múltiples categorías: specials, top sellers, featured
- Filtra solo juegos con descuento activo
- Elimina duplicados

**Endpoint:** `GET /api/steam/specials?cc={country_code}&count={number}`

**Parámetros:**
- `cc`: Código de país (us, ar, mx, br, etc.) - Default: 'us'
- `count`: Cantidad de ofertas a retornar - Default: 20

**Respuesta:**
```json
{
  "success": true,
  "country_code": "ar",
  "count": 20,
  "games": [
    {
      "id": 730,
      "name": "Counter-Strike 2",
      "discount_percent": 50,
      "original_price": 1999,
      "final_price": 999,
      "currency": "ARS",
      "header_image": "...",
      "capsule_image": "...",
      "platforms": {
        "windows": true,
        "mac": false,
        "linux": true
      }
    }
  ]
}
```

### 2. Detección Automática de Ubicación
- Usa la API de geolocalización existente (`/api/geolocation`)
- Detecta el país del usuario mediante su IP
- Mapea el código de país a código de Steam
- Fallback a 'us' si la detección falla

### 3. Interfaz de Usuario Actualizada

#### Sección de Ofertas
- Muestra ofertas reales de Steam en tiempo real
- Precios en la moneda local del usuario
- Badge de descuento visible (-X%)
- Precio original tachado y precio final destacado
- Indicadores de plataforma (Windows, Mac, Linux)
- Hover effect con escala
- Click abre el juego en Steam Store

#### Sección de Juegos Disponibles
- Renombrada de "Todos los Juegos" a "Juegos Disponibles para Descargar"
- Muestra solo los juegos de tu base de datos con links de descarga
- Mantiene el modal con información detallada

### 4. Formato de Precios
Función `formatPrice()` que convierte precios de Steam (en centavos) a formato legible:
- USD: $19.99
- ARS: AR$1999.00
- MXN: MX$399.00
- BRL: R$49.90
- EUR: €19.99
- GBP: £16.99

## Flujo de Funcionamiento

1. **Carga Inicial:**
   - Usuario entra a la página
   - Se detecta su ubicación mediante IP
   - Se obtiene el código de país para Steam

2. **Carga de Ofertas:**
   - Se consulta `/api/steam/specials` con el código de país
   - Steam devuelve ofertas con precios regionales
   - Se muestran en la sección "Ofertas de Steam"

3. **Carga de Juegos Propios:**
   - Se cargan juegos de Supabase (solo con links)
   - Se enriquecen con datos de Steam
   - Se muestran en "Juegos Disponibles para Descargar"

4. **Interacción:**
   - Click en oferta → Abre Steam Store
   - Click en juego propio → Abre modal con detalles

## Ventajas del Sistema

✅ **Precios Reales:** Muestra ofertas actuales de Steam, no datos estáticos
✅ **Precios Regionales:** Cada usuario ve precios en su moneda local
✅ **Actualización Automática:** Cache de 30 minutos mantiene ofertas frescas
✅ **Separación Clara:** Ofertas de Steam vs Juegos disponibles para descargar
✅ **Performance:** Cache y lazy loading para carga rápida
✅ **UX Mejorada:** Indicadores visuales claros (descuentos, plataformas, precios)

## Códigos de País Soportados

- **América:** us, ar, mx, br, cl, co, pe, uy, ca
- **Europa:** es, gb, de, fr, it, ru, tr, pl
- **Asia:** cn, jp, kr, in
- **Oceanía:** au, nz

## Notas Técnicas

- Los precios de Steam vienen en centavos (ej: 1999 = $19.99)
- La API de Steam tiene rate limiting, por eso usamos cache
- El proxy de imágenes (`proxySteamImage`) evita problemas de CORS
- Las ofertas se actualizan cada 30 minutos automáticamente
