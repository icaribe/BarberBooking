import { ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina classes CSS usando clsx e tailwind-merge
 * Isso permite combinar classes condicionais e resolver conflitos de classes Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata uma data para exibição
 * @param date A data a ser formatada (string ISO ou objeto Date)
 * @param format O formato desejado (opcional)
 */
export function formatDate(date: string | Date, format: string = "dd/MM/yyyy") {
  if (!date) return "";
  
  const d = typeof date === "string" ? new Date(date) : date;
  
  // Formatar manualmente para evitar dependências externas
  const day = d.getDate().toString().padStart(2, "0");
  const month = (d.getMonth() + 1).toString().padStart(2, "0");
  const year = d.getFullYear();
  
  return format
    .replace("dd", day)
    .replace("MM", month)
    .replace("yyyy", year.toString());
}

/**
 * Gera um ID aleatório
 * @param length O comprimento do ID
 */
export function generateId(length: number = 8): string {
  return Math.random().toString(36).substring(2, 2 + length);
}

/**
 * Arredonda um número para as casas decimais especificadas
 * @param value O valor a ser arredondado
 * @param decimals O número de casas decimais
 */
export function roundToDecimals(value: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Converte um valor em centavos para reais (ou vice-versa)
 * @param value O valor a ser convertido
 * @param toCents Se true, converte de reais para centavos, caso contrário, de centavos para reais
 */
export function convertCurrency(value: number, toCents: boolean = false): number {
  if (toCents) {
    return Math.round(value * 100);
  } else {
    return value / 100;
  }
}

/**
 * Trunca um texto se ele exceder um certo comprimento
 * @param text O texto a ser truncado
 * @param maxLength O comprimento máximo
 * @param suffix O sufixo a ser adicionado (por padrão, "...")
 */
export function truncateText(text: string, maxLength: number, suffix: string = "..."): string {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + suffix;
}