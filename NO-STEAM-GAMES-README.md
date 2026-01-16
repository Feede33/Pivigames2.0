# No Steam Games - Página con Sidebar

## 📍 Ubicación
`/src/app/[locale]/no-steam-games/page.tsx`

## 🎯 Características

### Sidebar Colapsable
- **Filtros de Ordenamiento**: Popularidad, Calificación, Nombre, Descargas, Fecha de lanzamiento
- **Filtros de Plataforma**: Todas, Windows, Mac, Linux
- **Filtros de Género**: Acción, Aventura, RPG, Estrategia, Simulación, Deportes, Carreras
- **Filtro de Calificación**: Slider de 0 a 10
- **Estadísticas**: Total de juegos y juegos con descargas

### Funcionalidades
- ✅ Sidebar colapsable a iconos (Ctrl/Cmd + B)
- ✅ Responsive (móvil y desktop)
- ✅ Tooltips en modo colapsado
- ✅ Filtros activos mostrados como badges
- ✅ Paginación con caché
- ✅ Búsqueda integrada
- ✅ Modal de detalles de juegos
- ✅ Soporte multiidioma (ES/EN)

## 🚀 Acceso
- Español: `http://localhost:3000/es/no-steam-games`
- Inglés: `http://localhost:3000/en/no-steam-games`

## 🎨 Componentes Utilizados
- `AppSidebar` - Sidebar con filtros (`/src/components/app-sidebar.tsx`)
- `SidebarProvider` - Contexto del sidebar
- `SidebarTrigger` - Botón para abrir/cerrar
- `SidebarInset` - Contenedor del contenido principal
- `GamesGrid` - Grid de juegos
- `GameModal` - Modal de detalles

## ⌨️ Atajos de Teclado
- `Ctrl/Cmd + B` - Toggle sidebar

## 🔧 Personalización
Para modificar los filtros, edita el componente `AppSidebar` en:
`/src/components/app-sidebar.tsx`

## 📝 Notas
- Los juegos se filtran automáticamente para mostrar solo aquellos sin `steam_appid`
- El sidebar mantiene su estado (abierto/cerrado) en cookies
- Los filtros resetean la paginación a la primera página
