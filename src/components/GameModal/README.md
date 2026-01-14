# GameModal Component Structure

Este directorio contiene todos los componentes relacionados con el modal de detalles del juego.

## Estructura de Archivos

```
GameModal/
├── index.ts              # Exportaciones principales
├── styles.ts             # Estilos responsive
├── ModalHeader.tsx       # Botón de cerrar
├── HeroSection.tsx       # Wallpaper, video player y botones principales
├── InfoBadges.tsx        # Badges de información (rating, año, edad, etc.)
├── MainContent.tsx       # Contenido principal (descripción, features, screenshots, requisitos)
├── Sidebar.tsx           # Barra lateral con información del juego
├── PriceCard.tsx         # Tarjeta de precio (usado por Sidebar)
├── ImageViewer.tsx       # Visor de imágenes en pantalla completa
└── README.md            # Este archivo
```

## Componentes

### GameModal.tsx (Principal)
El componente principal que orquesta todos los sub-componentes. Maneja:
- Estado global del modal
- Carga de datos de Steam
- Geolocalización del usuario
- Lógica de navegación entre screenshots y videos

### ModalHeader
Botón de cerrar en la esquina superior derecha.

### HeroSection
Sección hero con:
- Wallpaper del juego
- Video player para trailers
- Botones de descarga/Steam
- Botón para reproducir trailer

### InfoBadges
Badges informativos:
- Rating del juego
- Año de lanzamiento
- Clasificación por edad
- Calidad HD/5.1
- Indicador de errores de Steam

### MainContent
Contenido principal izquierdo:
- Descripción del juego
- Características del juego
- Slider de screenshots y videos
- Requisitos del sistema

### Sidebar
Barra lateral derecha con:
- Tarjeta de precio
- Información del juego (género, rating, desarrollador, etc.)
- Plataformas disponibles
- Tags
- Idiomas
- Botones sociales
- Widget de Steam

### PriceCard
Tarjeta de precio destacada con:
- Precio actual
- Descuentos
- Ubicación del usuario
- Animación de nieve

### ImageViewer
Visor de imágenes en pantalla completa con:
- Navegación entre imágenes
- Thumbnails
- Contador de imágenes

## Estilos

Los estilos responsive se manejan en `styles.ts` con breakpoints:
- `xs`: < 475px
- `sm`: 475px - 640px
- `md`: 640px - 1280px
- `lg`: > 1280px

## Uso

```tsx
import GameModal from '@/components/GameModal';

<GameModal
  game={gameData}
  onCloseAction={() => setModalOpen(false)}
  locale="es"
/>
```

## Props del GameModal Principal

- `game`: Datos del juego (GameWithSteamData | null)
- `onCloseAction`: Callback al cerrar el modal
- `locale`: Idioma del modal (default: 'es')
- `origin`: Posición de origen para animación (opcional)
