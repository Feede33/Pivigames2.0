# Sistema de Precios Regionales 🌍💰

## Descripción
Este sistema detecta automáticamente la ubicación del usuario (país) basándose en su dirección IP y muestra los precios de Steam en la moneda correspondiente a su región.

## 🎯 Cómo Funciona

### 1. Detección de Ubicación (`/api/geolocation`)
```
Usuario → IP detectada → ipapi.co → País + Moneda → Código Steam
```

- Detecta la IP del usuario desde los headers de la petición
- Usa el servicio gratuito `ipapi.co` para obtener información del país
- Mapea el código de país a un código de región de Steam
- Retorna: país, código de país, moneda, y código de Steam

### 2. Obtención de Precios (`/api/steam/[appid]`)
```
GameModal → /api/steam/123?cc=ar → Steam API → Precio en ARS
```

- Recibe el código de país como parámetro `cc` en la query string
- Consulta la API de Steam con el código de región específico
- Steam retorna precios en la moneda local del país
- Incluye información de descuentos si están disponibles

### 3. Visualización en el Modal
```
┌─────────────────────────────┐
│ PRECIO      📍 Argentina    │
│                             │
│ -75%    $999.99            │
│                             │
│ $249.99                     │
│                             │
│ Precio en ARS               │
└─────────────────────────────┘
```

## 🌎 Países Soportados

El sistema soporta precios regionales para más de 20 países:

| Región | Países | Moneda |
|--------|--------|--------|
| **América** | 🇺🇸 USA, 🇦🇷 Argentina, 🇲🇽 México, 🇧🇷 Brasil, 🇨🇱 Chile, 🇨🇴 Colombia, 🇵🇪 Perú, 🇺🇾 Uruguay, 🇨🇦 Canadá | USD, ARS, MXN, BRL, CLP, COP, PEN, UYU, CAD |
| **Europa** | 🇪🇸 España, 🇬🇧 UK, 🇩🇪 Alemania, 🇫🇷 Francia, 🇮🇹 Italia, 🇵🇱 Polonia | EUR, GBP, PLN |
| **Asia** | 🇨🇳 China, 🇯🇵 Japón, 🇰🇷 Corea, 🇮🇳 India, 🇹🇷 Turquía | CNY, JPY, KRW, INR, TRY |
| **Oceanía** | 🇦🇺 Australia, 🇳🇿 Nueva Zelanda | AUD, NZD |
| **Europa del Este** | 🇷🇺 Rusia | RUB |

## ✨ Características

✅ **Detección automática** - Sin configuración del usuario  
✅ **Precios locales** - En la moneda del país  
✅ **Descuentos visibles** - Badge con porcentaje y precio original tachado  
✅ **Fallback inteligente** - USD si hay error  
✅ **Cache optimizado** - 1 hora para mejor rendimiento  
✅ **Dev-friendly** - IP de prueba en desarrollo  

## 🎨 Interfaz Visual

El precio se muestra en una tarjeta destacada con:
- **Gradiente verde** para llamar la atención
- **Badge de ubicación** mostrando el país detectado
- **Precio grande y legible** en la moneda local
- **Descuentos destacados** con badge de porcentaje
- **Precio original tachado** cuando hay descuento
- **Indicador de moneda** en texto pequeño

## 💻 Ejemplo de Código

```typescript
// El sistema funciona automáticamente:

// 1. Usuario abre el modal de un juego
<GameModal game={selectedGame} onClose={closeModal} />

// 2. Se detecta su ubicación
useEffect(() => {
  fetch('/api/geolocation')
    .then(res => res.json())
    .then(data => setUserLocation(data));
}, []);

// 3. Se cargan los datos de Steam con su región
fetch(`/api/steam/${appid}?cc=${userLocation.steam_country_code}`)

// 4. Se muestra el precio en su moneda local
{steamData.price} // "$249.99 ARS"
```

## 🔧 Archivos del Sistema

```
src/
├── app/
│   └── api/
│       ├── geolocation/
│       │   └── route.ts          # 🆕 API de detección de ubicación
│       └── steam/
│           └── [appid]/
│               └── route.ts      # ✏️ Modificado para precios regionales
└── components/
    └── GameModal.tsx             # ✏️ Actualizado con UI de precios
```

## 🚀 Cómo Probar

1. **Desarrollo local**: Usa una VPN para simular diferentes países
2. **Sin VPN**: El sistema usa una IP de prueba (8.8.8.8) en desarrollo
3. **Producción**: Detecta automáticamente la IP real del usuario

```bash
# Iniciar el servidor
bun run dev

# Abrir un juego con steam_appid
# El precio se mostrará en tu moneda local
```

## 📊 Flujo de Datos

```mermaid
graph LR
    A[Usuario] --> B[GameModal]
    B --> C[/api/geolocation]
    C --> D[ipapi.co]
    D --> C
    C --> B
    B --> E[/api/steam/appid?cc=ar]
    E --> F[Steam API]
    F --> E
    E --> B
    B --> G[Precio en ARS]
```

## 🔒 Seguridad y Privacidad

- ✅ No se almacena la IP del usuario
- ✅ Solo se usa para determinar el país
- ✅ Servicio de geolocalización confiable (ipapi.co)
- ✅ Fallback a USD si falla la detección

## 📝 Notas Técnicas

- **En desarrollo**: Usa IP de prueba (8.8.8.8) para evitar problemas con localhost
- **Cache**: Los precios se cachean por 1 hora para reducir llamadas a la API
- **Fallback**: Si la API de geolocalización falla, se usa USD como fallback
- **Steam API**: Gratuita y no requiere API key para consultas básicas
- **Límites**: Steam API tiene rate limiting, el cache ayuda a evitarlo

## 🎯 Mejoras Futuras

- [ ] Permitir al usuario cambiar manualmente su región
- [ ] Mostrar comparación de precios entre regiones
- [ ] Agregar más servicios de geolocalización como fallback
- [ ] Cachear la ubicación del usuario en localStorage
- [ ] Mostrar histórico de precios
- [ ] Notificaciones de descuentos en tu región
- [ ] Convertidor de monedas integrado

## 🐛 Troubleshooting

**Problema**: No se muestra el precio  
**Solución**: Verifica que el juego tenga `steam_appid` en la base de datos

**Problema**: Precio en USD en lugar de moneda local  
**Solución**: Revisa la consola para ver si hay errores en `/api/geolocation`

**Problema**: Error 429 de Steam  
**Solución**: Espera unos minutos, el rate limit se resetea automáticamente

## 📚 Referencias

- [Steam Web API](https://partner.steamgames.com/doc/webapi)
- [ipapi.co Documentation](https://ipapi.co/api/)
- [Steam Country Codes](https://partner.steamgames.com/doc/store/pricing/currencies)

