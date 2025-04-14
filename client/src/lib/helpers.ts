/**
 * Récupère l'URL d'un drapeau de pays à partir de son code pays.
 */
export function getCountryFlagUrl(countryCode: string): string {
  return `/flags/${countryCode.toLowerCase()}.svg`;
}