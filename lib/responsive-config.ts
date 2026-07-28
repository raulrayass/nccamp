/**
 * Configuración global de tamaños responsivos para la app
 * Estandariza el comportamiento móvil vs desktop en toda la aplicación
 */

export const RESPONSIVE_SIZES = {
  // Padding/Margin
  padding: {
    card: 'p-2.5 sm:p-4',
    section: 'p-3 sm:p-4',
    compact: 'p-2 sm:p-3',
  },
  
  // Heights para inputs y selects
  input: {
    standard: 'h-9 sm:h-10',
    compact: 'h-8 sm:h-9',
    tiny: 'h-7 sm:h-8',
  },
  
  // Sizes de texto
  text: {
    label: 'text-xs sm:text-sm',
    body: 'text-xs sm:text-sm',
    small: 'text-xs',
    muted: 'text-xs text-muted-foreground',
  },
  
  // Gaps y spacing
  gap: {
    standard: 'gap-3 sm:gap-4',
    compact: 'gap-2 sm:gap-3',
    tight: 'gap-1.5 sm:gap-2',
  },
  
  // Iconos
  icon: {
    standard: 'w-4 h-4 sm:w-5 sm:h-5',
    small: 'w-3.5 h-3.5 sm:w-4 sm:h-4',
    tiny: 'w-3 h-3 sm:w-3.5 sm:h-3.5',
  },
  
  // Botones
  button: {
    standard: 'w-8 h-8 sm:w-8 sm:h-8',
    compact: 'w-7 h-7 sm:w-8 sm:h-8',
    small: 'h-7 sm:h-8',
  },
  
  // Grids responsive
  grid: {
    cols2: 'grid-cols-2 gap-2 sm:gap-3',
    cols3: 'grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3',
    cols4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3',
  },
  
  // Espaciado entre elementos
  spacing: {
    section: 'space-y-3 sm:space-y-4',
    compact: 'space-y-2',
    tight: 'space-y-1.5 sm:space-y-2',
  },
}

/**
 * Hook helper para obtener clases responsive comunes
 */
export const responsiveClasses = {
  filterCard: `${RESPONSIVE_SIZES.padding.section} sm:${RESPONSIVE_SIZES.padding.card}`,
  listCard: `${RESPONSIVE_SIZES.padding.compact}`,
  filterRow: RESPONSIVE_SIZES.grid.cols3,
  listItem: RESPONSIVE_SIZES.spacing.tight,
}
