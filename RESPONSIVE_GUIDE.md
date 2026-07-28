# Guía de Tamaños Responsivos

Esta aplicación utiliza un sistema estandarizado de tamaños responsivos para móvil y desktop. Todos los componentes deben seguir estos patrones.

## Principios

- **Móvil PRIMERO**: Diseña para móvil primero, luego expande para desktop
- **Consistencia**: Usa siempre las mismas clases para elementos similares
- **Jerarquía**: Los elementos importante son más grandes en desktop

## Sistema de Tamaños

Importar desde `lib/responsive-config.ts`:

```tsx
import { RESPONSIVE_SIZES } from '@/lib/responsive-config'
```

### Paddings

```
card: 'p-2.5 sm:p-4'      // Tarjetas principales
section: 'p-3 sm:p-4'    // Secciones generales  
compact: 'p-2 sm:p-3'    // Elementos compactos
```

### Heights (Inputs/Selects)

```
standard: 'h-9 sm:h-10'  // Inputs grandes
compact: 'h-8 sm:h-9'    // Inputs medianos
tiny: 'h-7 sm:h-8'       // Inputs pequeños (filtros)
```

### Texto

```
label: 'text-xs sm:text-sm'    // Etiquetas
body: 'text-xs sm:text-sm'     // Cuerpo
small: 'text-xs'               // Pequeño
muted: 'text-xs text-muted-foreground'  // Mutado
```

### Gaps y Espaciado

```
gap.standard: 'gap-3 sm:gap-4'     // Entre elementos principales
gap.compact: 'gap-2 sm:gap-3'      // Espaciado normal
gap.tight: 'gap-1.5 sm:gap-2'      // Compacto

spacing.section: 'space-y-3 sm:space-y-4'   // Entre secciones
spacing.compact: 'space-y-2'                 // Compacto
spacing.tight: 'space-y-1.5 sm:space-y-2'   // Muy compacto
```

### Iconos

```
standard: 'w-4 h-4 sm:w-5 sm:h-5'    // Iconos normales
small: 'w-3.5 h-3.5 sm:w-4 sm:h-4'   // Iconos pequeños
tiny: 'w-3 h-3 sm:w-3.5 sm:h-3.5'    // Iconos muy pequeños
```

### Botones

```
standard: 'w-8 h-8 sm:w-8 sm:h-8'    // Botones icon normales
compact: 'w-7 h-7 sm:w-8 sm:h-8'     // Botones icon compactos
small: 'h-7 sm:h-8'                   // Botones texto pequeños
```

### Grids

```
cols2: 'grid-cols-2 gap-2 sm:gap-3'                      // 2 columnas
cols3: 'grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3'      // 3 columnas (2 en móvil)
cols4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3'  // 4 columnas
```

## Ejemplos de Uso

### Filtro Compacto
```tsx
<Card className="p-2 sm:p-4">
  <div className="space-y-1.5 sm:space-y-2">
    <div className="flex items-center gap-2">
      <Filter className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
      <Label className="text-xs sm:text-sm">Filtros</Label>
    </div>
    <Input className="h-7 sm:h-8 text-xs" />
  </div>
</Card>
```

### Lista de Items
```tsx
<div className="space-y-1.5">
  {items.map(item => (
    <div className="p-2 sm:p-3 flex gap-2">
      <Icon className="w-7 h-7 sm:w-8 sm:h-8" />
      <div className="flex-1">
        <p className="text-xs sm:text-sm font-medium">{item.name}</p>
        <p className="text-xs text-muted-foreground">{item.meta}</p>
      </div>
    </div>
  ))}
</div>
```

### Tarjeta de Contenido
```tsx
<Card className="overflow-hidden">
  <CardContent className="p-2 sm:p-4">
    <div className="flex flex-col gap-2">
      <h3 className="text-xs sm:text-sm font-semibold">{title}</h3>
      <div className="text-xs text-muted-foreground">{content}</div>
    </div>
  </CardContent>
</Card>
```

## Patrones Comunes

### Ratios Móvil/Desktop

- Padding: 2:4 (móvil:desktop) en general
- Heights: -1 a -2 px de diferencia
- Gaps: 1.5 a 2 en móvil, 2 a 3 en desktop
- Texto: xs en móvil, xs-sm en desktop
- Iconos: -0.5 a -1 px en móvil

### Cuándo usar qué

- **Filtros/Controles**: `compact` o `tiny` (más pequeños)
- **Contenido Principal**: `standard` o `card` (medianos)
- **Detalles/Meta**: `small` o `muted` (pequeños)

## Testing en Móvil

1. Abre DevTools (F12)
2. Activa modo responsive (Ctrl+Shift+M)
3. Prueba en 375px (iPhone SE) y 768px (tablet)
4. Verifica que:
   - Nada se corte
   - Todo sea legible
   - Haya suficiente espacio entre elementos
   - Los gaps sean consistentes

## Actualizar Globalmente

Si necesitas cambiar tamaños globales:

1. Edita `lib/responsive-config.ts`
2. Todos los componentes que usen `RESPONSIVE_SIZES` se actualizarán automáticamente
3. Para componentes sin usar el config, busca y reemplaza manualmente
