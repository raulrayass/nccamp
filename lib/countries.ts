// Country data with flags as Unicode characters
export const COUNTRIES = [
  { code: 'MX', name: 'México', flag: '🇲🇽' },
  { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: 'KR', name: 'Corea del Sur', flag: '🇰🇷' },
  { code: 'ES', name: 'España', flag: '🇪🇸' },
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'DE', name: 'Alemania', flag: '🇩🇪' },
  { code: 'CO', name: 'Colombia', flag: '🇨🇴' },
  { code: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: 'PE', name: 'Perú', flag: '🇵🇪' },
  { code: 'JP', name: 'Japón', flag: '🇯🇵' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺' },
] as const

export type CountryCode = typeof COUNTRIES[number]['code']

export function getCountryByCode(code: string | null | undefined) {
  if (!code) return null
  return COUNTRIES.find(c => c.code === code)
}

export function getCountryFlag(code: string | null | undefined) {
  const country = getCountryByCode(code)
  return country?.flag || null
}

export function getCountryName(code: string | null | undefined) {
  const country = getCountryByCode(code)
  return country?.name || null
}
