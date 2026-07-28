# Testing Cross-Module Checklist

## Pruebas de Sincronización de Hooks

### useGames Hook
- [ ] Crear juego → Se ve inmediatamente sin reload
- [ ] Editar juego → Cambios visibles en tiempo real
- [ ] Eliminar juego → Desaparece sin reload
- [ ] Abrir scoring → Juego correcto cargado
- [ ] Cambio en games-client → Se refleja en score-timeline

### useTeams Hook
- [ ] Crear equipo → Aparece en dropdown de scoring
- [ ] Editar equipo → Nombre/color actualizado en ranking
- [ ] Eliminar equipo → Desaparece del ranking
- [ ] Cambio en teams-client → Se refleja en games ranking

### useGameScores Hook
- [ ] Registrar puntos → Actualiza ranking en tiempo real
- [ ] Eliminar puntos → Ranking se actualiza
- [ ] Múltiples scores → Totales calculados correctamente
- [ ] Cross-module sync → Games y Teams ven el mismo estado

## Pruebas de UX Mobile

### MobileSheet
- [ ] Desktop (≥768px) → Renderiza Dialog
- [ ] Mobile (<768px) → Renderiza Drawer
- [ ] Contenido largo → Scroll vertical dentro del sheet
- [ ] Safe areas → Respeta notches en iPhone
- [ ] Close button → Cierra correctamente

### BottomNavigation
- [ ] Desktop → No aparece (display: none)
- [ ] Mobile → Aparece fija en base
- [ ] Touch targets → Mínimo 44px (64px ideal)
- [ ] Badges → Se muestran correctamente
- [ ] Active state → Resaltado con color

### ResponsiveContainer
- [ ] Padding mobile (p-3) → Correcto
- [ ] Padding desktop (p-6) → Correcto
- [ ] Gap compact (gap-2) → Correcto
- [ ] Gap normal (gap-3 md:gap-4) → Correcto
- [ ] Máx width lg → Centra contenido

## Pruebas de Responsive Design

### Breakpoints (SM: 640px, MD: 768px, LG: 1024px)

#### Mobile (< 640px)
- [ ] Botones: text-xs, h-8, px-2
- [ ] Texto: text-sm
- [ ] Padding: p-3
- [ ] Iconos: w-3.5 h-3.5
- [ ] Bottom nav: visible
- [ ] Drawers: full width

#### Tablet (640px - 1023px)
- [ ] Botones: text-sm, h-9, px-3
- [ ] Texto: text-base
- [ ] Padding: p-4
- [ ] Iconos: w-4 h-4
- [ ] Bottom nav: visible
- [ ] Modales: max-w-md

#### Desktop (≥ 1024px)
- [ ] Botones: text-base, h-10, px-4
- [ ] Texto: text-lg
- [ ] Padding: p-6
- [ ] Iconos: w-5 h-5
- [ ] Bottom nav: hidden
- [ ] Modales: max-w-lg

## Pruebas de Compatibilidad

### Dispositivos
- [ ] iPhone SE (375px) - pequeño
- [ ] iPhone 14 (390px) - estándar
- [ ] iPad (768px) - tablet
- [ ] iPad Pro (1024px) - tablet grande
- [ ] Desktop (1920px) - pantalla grande

### Navegadores
- [ ] Safari iOS (iPhone)
- [ ] Chrome Android
- [ ] Safari macOS
- [ ] Chrome Desktop

### Sistemas Operativos
- [ ] iOS 15+ (safe areas)
- [ ] Android 10+ (notches, etc)
- [ ] macOS 12+
- [ ] Windows 10+

## Performance Testing

- [ ] No console errors
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1

## Pruebas Funcionales Críticas

### Flujo Completo: Crear Equipo → Crear Juego → Registrar Puntos

1. [ ] Crear 3 equipos con nombres y colores
2. [ ] Crear 2 juegos con fechas
3. [ ] Registrar 3 puntos en Juego 1 para cada equipo
4. [ ] Registrar 2 puntos en Juego 2 (solo 2 equipos)
5. [ ] Verificar ranking total: suma correcta
6. [ ] Editar puntos de un juego
7. [ ] Eliminar un puntaje
8. [ ] Verificar que todo se actualiza en tiempo real

### Flujo Mobile

1. [ ] Abrir app en mobile
2. [ ] Ver bottom navigation
3. [ ] Taper "Nuevo juego" → Drawer aparece
4. [ ] Completar formulario → Submit
5. [ ] Verificar que se agregó sin reload
6. [ ] Ir a "Puntos" → Drawer con scoring
7. [ ] Registrar puntos → Cerrar drawer
8. [ ] Verificar ranking actualizado

## Pruebas de Edge Cases

- [ ] Crear juego sin equipos → Mensaje claro
- [ ] Registrar puntos negativos → Validación
- [ ] Nombres muy largos → Truncación correcta
- [ ] Colores con baja saturación → Legible
- [ ] Eliminar equipo con puntos → Confirmación
- [ ] Cambiar idioma → UI se mantiene
- [ ] Dark mode → Todo legible
- [ ] Light mode → Contraste correcto

## Notas

Ejecutar después de cada cambio en hooks o componentes móviles.
Prioridad: Cross-module sync > UX mobile > Performance > Edge cases.
