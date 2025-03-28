/**
 * Formata um valor em centavos para exibição monetária em Reais (BRL)
 * @param amount Valor em centavos (integer)
 * @returns String formatada no formato R$ X.XXX,XX
 */
export function formatCurrency(amount: number): string {
  return (amount / 100).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
}