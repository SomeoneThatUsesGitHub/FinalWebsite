/**
 * Obtient l'URL du drapeau d'un pays à partir de son code pays
 * Utilise le service de drapeaux flagcdn.com
 * @param countryCode Code du pays (ISO 3166-1 alpha-2)
 * @returns URL de l'image du drapeau
 */
export function getCountryFlagUrl(countryCode: string): string {
  // Conversion en minuscules pour la compatibilité avec flagcdn
  const code = countryCode.toLowerCase();
  return `https://flagcdn.com/w320/${code}.png`;
}

/**
 * Formate une date pour l'affichage
 * @param dateString Chaîne de date
 * @param locale Locale pour le formatage (par défaut: fr-FR)
 * @param options Options de formatage
 * @returns Date formatée
 */
export function formatDate(
  dateString: string | Date,
  locale: string = "fr-FR",
  options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "long",
    day: "numeric",
  }
): string {
  const date = typeof dateString === "string" ? new Date(dateString) : dateString;
  return new Intl.DateTimeFormat(locale, options).format(date);
}

/**
 * Tronque un texte à une longueur maximale
 * @param text Texte à tronquer
 * @param maxLength Longueur maximale
 * @param suffix Suffixe à ajouter si le texte est tronqué (par défaut: "...")
 * @returns Texte tronqué
 */
export function truncateText(text: string, maxLength: number, suffix: string = "..."): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
}