# Arquitectura Escalable Permanece 2026

## Visión General

Arquitectura modular y escalable con comunicación fluida entre módulos, optimizada para mobile-first con UX adaptativa automática.

## Estructura de Capas

```
lib/
├── hooks/              # Lógica compartida centralizada
│   ├── useGames        # CRUD juegos + caché
│   ├── useTeams        # CRUD equipos + caché
│   ├── useGameScores   # Sincronización scores
│   ├── useMediaQuery   # Detección breakpoints
│   └── index.ts        # Exportación centralizada

components/
├── mobile/             # Componentes mobile-first
│   ├── MobileSheet     # Modal adaptativo (Dialog/Drawer)
│   ├── BottomNavigation # Nav fija en base (mobile)
│   ├── ResponsiveContainer # Layout wrapper
│   └── index.ts        # Exportación centralizada
│
├── modules/            # Componentes por módulo
│   ├── games/
│   │   └── GameCard    # Card reutilizable
│   └── teams/
│       └── TeamRankItem # Item ranking reutilizable
│
└── [legacy components] # Clientes y componentes principales

app/
├── actions/            # Server actions (mutaciones)
└── (app)/              # Rutas de la app
```

## Flujo de Datos

### Lectura (Query)

```
Component → useHook (SWR) → /api/... → Server Action → DB
                ↓ (caché)
         Component (re-render)
```

### Escritura (Mutation)

```
Component → useHook.mutation() → Server Action → DB
                                                   ↓
                          useHook.mutate() (invalidate caché)
                                   ↓
                         Component (re-render)
```

## Patrones Clave

### 1. Hooks Centralizados

**Beneficio**: Lógica única, sincronización automática entre módulos.

```typescript
// Uso
const { games, addGame, updateGame, deleteGame } = useGames()

// Automáticamente sincroniza en:
// - games-client
// - teams-client
// - score-timeline
// - cualquier componente que use useGames
```

### 2. Componentes Descompuestos

**Beneficio**: Reutilización, reducción de código, mantenimiento centralizado.

```typescript
// En lugar de rendir el listado completo en games-client
// Usamos GameCard para cada item
<GameCard game={game} onEdit={...} onDelete={...} />
```

### 3. Mobile-First UX Adaptativa

**Beneficio**: Una API, UX óptima automática por dispositivo.

```typescript
// Desktop → Dialog | Mobile → Drawer
<MobileSheet open={open} title="Crear juego">
  {formContent}
</MobileSheet>
```

### 4. Responsive Container

**Beneficio**: Spacing consistente, mantenimiento centralizado.

```typescript
<ResponsiveContainer padding="normal" gap="normal">
  {children}
</ResponsiveContainer>
```

## Escalabilidad

### Agregar un Nuevo Módulo

1. Crear hook en `lib/hooks/use[Modulo].ts`
2. Exportar en `lib/hooks/index.ts`
3. Crear componentes descompuestos en `components/modules/[modulo]/`
4. Usar hooks en cliente para sincronización automática

### Ejemplo: Agregar Asistentes

```typescript
// lib/hooks/useAttendees.ts
export function useAttendees() {
  const { data, mutate } = useSWR('/api/attendees', ...)
  return { attendees: data?.attendees, addAttendee, updateAttendee, deleteAttendee }
}

// components/modules/attendees/AttendeeCard.tsx
export function AttendeeCard({ attendee, onEdit, onDelete }) {
  return <Card>...</Card>
}

// attendees-client.tsx
export function AttendeesClient() {
  const { attendees } = useAttendees()
  return attendees.map(a => <AttendeeCard key={a.id} attendee={a} />)
}
```

## Mobile-First Responsive

### Breakpoints

- `default`: Mobile (< 640px)
- `sm`: Small (640px+)
- `md`: Medium (768px+)
- `lg`: Large (1024px+)

### Implementación

```typescript
// Componente automáticamente responsive
<div className="p-3 md:p-5 lg:p-6">
  <h1 className="text-sm md:text-base lg:text-lg">Título</h1>
</div>
```

## Testing Cross-Module

### Checklist de Validación

- [ ] Hook se sincroniza al agregar en un módulo
- [ ] Hook se sincroniza al eliminar en un módulo
- [ ] Hook se sincroniza al editar en un módulo
- [ ] Desktop renderiza Dialog
- [ ] Mobile renderiza Drawer
- [ ] Mobile layout respeta safe areas
- [ ] Bottom navigation aparece solo en mobile
- [ ] Spacing es consistente en todos los módulos

### Validación Manual

1. **Agregar equipo en teams** → Verficiar que aparezca en games scoring
2. **Registrar puntos en games** → Verificar que se actualice ranking
3. **Abrir modal en desktop** → Debe ser Dialog
4. **Abrir modal en mobile** → Debe ser Drawer slide-up
5. **Scroll largo en mobile** → No debe activar keyboard scroll bugs

## Performance

- **SWR caché**: Evita requests innecesarios
- **Lazy loading**: Componentes cargados on-demand
- **Code splitting**: Módulos separados por ruta
- **Safe areas**: Respeta layout del dispositivo

## Mantenibilidad

- Centralización de lógica en hooks
- Componentes pequeños y reutilizables
- Separación clara de concerns
- Fácil de debuggear (un error = un lugar a revisar)
- Documentación automática en tipos TypeScript
