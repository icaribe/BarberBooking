/**
 * Format a price in cents to a currency string
 * @param price Price in cents
 * @returns Formatted price string
 */
export function formatCurrency(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(price / 100);
}

/**
 * Format a number with a given prefix and suffix
 * @param value Number to format
 * @param prefix String to add before the number
 * @param suffix String to add after the number
 * @returns Formatted string
 */
export function formatNumber(value: number, prefix: string = '', suffix: string = ''): string {
  return `${prefix}${value.toLocaleString('pt-BR')}${suffix}`;
}

/**
 * Format a duration in minutes to a readable string
 * @param minutes Duration in minutes
 * @returns Formatted duration string
 */
export function formatDuration(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return hours === 1 ? `${hours} hora` : `${hours} horas`;
  }
  
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Format a phone number to a readable format
 * @param phone Phone number string
 * @returns Formatted phone number
 */
export function formatPhoneNumber(phone: string | null): string {
  if (!phone) return '';
  
  // Remove non-numeric characters
  const numericPhone = phone.replace(/\D/g, '');
  
  if (numericPhone.length === 11) {
    // Format as (XX) XXXXX-XXXX
    return `(${numericPhone.slice(0, 2)}) ${numericPhone.slice(2, 7)}-${numericPhone.slice(7)}`;
  } else if (numericPhone.length === 10) {
    // Format as (XX) XXXX-XXXX
    return `(${numericPhone.slice(0, 2)}) ${numericPhone.slice(2, 6)}-${numericPhone.slice(6)}`;
  }
  
  return phone;
}

/**
 * Transform a string to title case (first letter of each word capitalized)
 * @param text Input string
 * @returns Title-cased string
 */
export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * Truncate text to a maximum length
 * @param text Text to truncate
 * @param maxLength Maximum length
 * @param suffix Suffix to add when truncated
 * @returns Truncated text
 */
export function truncateText(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}
