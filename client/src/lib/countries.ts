/**
 * Convertit un code pays en emoji de drapeau
 * @param countryCode Code pays ISO à 2 lettres (ex: 'FR', 'US', 'DE')
 * @returns Emoji du drapeau correspondant
 */
export function getCountryFlag(countryCode: string): string {
  // Convertir le code pays en caractères d'emoji de drapeau
  // Le code pays est converti en paires de caractères régionaux Unicode
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  
  return String.fromCodePoint(...codePoints);
}