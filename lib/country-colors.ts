// Mapa de códigos de país a colores de bandera
export const countryFlagColors: Record<string, string> = {
  // América Latina
  'MX': '#CE1126', // México - Rojo
  'BR': '#009B3A', // Brasil - Verde
  'AR': '#75AADB', // Argentina - Azul
  'CO': '#FFCD00', // Colombia - Amarillo
  'PE': '#DC143C', // Perú - Rojo
  'CL': '#002058', // Chile - Azul
  'VE': '#FFCE00', // Venezuela - Amarillo
  'EC': '#FFCD00', // Ecuador - Amarillo
  'BO': '#CE1126', // Bolivia - Rojo
  'PY': '#0066CC', // Paraguay - Azul
  'UY': '#0066CC', // Uruguay - Azul
  'GT': '#4285F4', // Guatemala - Azul
  'HN': '#1E90FF', // Honduras - Azul
  'SV': '#1E90FF', // El Salvador - Azul
  'NI': '#0099FF', // Nicaragua - Azul
  'CR': '#002B7F', // Costa Rica - Azul
  'PA': '#002B7F', // Panamá - Azul
  'CU': '#CE1126', // Cuba - Rojo
  'DO': '#FFCD00', // República Dominicana - Amarillo
  
  // Europa
  'ES': '#C60B1E', // España - Rojo
  'PT': '#006600', // Portugal - Verde
  'IT': '#009246', // Italia - Verde
  'FR': '#002395', // Francia - Azul
  'DE': '#000000', // Alemania - Negro
  'GB': '#002868', // Reino Unido - Azul
  'IE': '#169B62', // Irlanda - Verde
  'PL': '#FFFFFF', // Polonia - Blanco
  'RU': '#FFFFFF', // Rusia - Blanco
  'UA': '#4C7FED', // Ucrania - Azul
  
  // Asia
  'JP': '#BC002D', // Japón - Rojo
  'CN': '#DE2910', // China - Rojo
  'KR': '#C60C30', // Corea del Sur - Rojo
  'IN': '#FF9933', // India - Naranja
  'TH': '#CE1126', // Tailandia - Rojo
  'PH': '#002B7F', // Filipinas - Azul
  'SG': '#FFFFFF', // Singapur - Blanco
  'MY': '#FFCD00', // Malasia - Amarillo
  
  // Oceanía
  'AU': '#002868', // Australia - Azul
  'NZ': '#002868', // Nueva Zelanda - Azul
  
  // África
  'ZA': '#007A5E', // Sudáfrica - Verde
  'EG': '#CE1126', // Egipto - Rojo
  'KE': '#000000', // Kenia - Negro
  'NG': '#006600', // Nigeria - Verde
  
  // Norteamérica
  'US': '#3C3B6B', // USA - Azul
  'CA': '#FF0000', // Canadá - Rojo
}

export function getCountryColor(countryCode?: string): string {
  if (!countryCode) return '#1F2937' // Gris por defecto
  return countryFlagColors[countryCode.toUpperCase()] || '#1F2937'
}

export function getCountryName(countryCode?: string): string {
  const names: Record<string, string> = {
    'MX': 'México', 'BR': 'Brasil', 'AR': 'Argentina', 'CO': 'Colombia', 'PE': 'Perú',
    'CL': 'Chile', 'VE': 'Venezuela', 'EC': 'Ecuador', 'BO': 'Bolivia', 'PY': 'Paraguay',
    'UY': 'Uruguay', 'GT': 'Guatemala', 'HN': 'Honduras', 'SV': 'El Salvador', 'NI': 'Nicaragua',
    'CR': 'Costa Rica', 'PA': 'Panamá', 'CU': 'Cuba', 'DO': 'República Dominicana',
    'ES': 'España', 'PT': 'Portugal', 'IT': 'Italia', 'FR': 'Francia', 'DE': 'Alemania',
    'GB': 'Reino Unido', 'IE': 'Irlanda', 'PL': 'Polonia', 'RU': 'Rusia', 'UA': 'Ucrania',
    'JP': 'Japón', 'CN': 'China', 'KR': 'Corea del Sur', 'IN': 'India', 'TH': 'Tailandia',
    'PH': 'Filipinas', 'SG': 'Singapur', 'MY': 'Malasia',
    'AU': 'Australia', 'NZ': 'Nueva Zelanda',
    'ZA': 'Sudáfrica', 'EG': 'Egipto', 'KE': 'Kenia', 'NG': 'Nigeria',
    'US': 'Estados Unidos', 'CA': 'Canadá',
  }
  return names[countryCode?.toUpperCase() || ''] || countryCode || 'Sin país'
}
