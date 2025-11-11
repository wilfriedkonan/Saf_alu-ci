/**
 * Formate un montant en FCFA avec le format français (espaces pour les milliers)
 * @param amount - Le montant à formater
 * @returns Le montant formaté avec le suffixe " FCFA"
 * @example
 * formatCurrency(850000) // "850 000 FCFA"
 * formatCurrency(24350000) // "24 350 000 FCFA"
 * formatCurrency(1500) // "1 500 FCFA"
 */
export function formatCurrency(amount: number): string {
    // Arrondir le montant pour éviter les décimales
    const roundedAmount = Math.round(amount)
  
    // Formater avec des espaces pour les milliers (format français)
    const formatted = roundedAmount.toLocaleString("fr-FR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  
    return `${formatted} FCFA`
  }
  
  /**
   * Formate un montant en FCFA avec un format court (K pour milliers, M pour millions)
   * @param amount - Le montant à formater
   * @returns Le montant formaté en version courte avec le suffixe " FCFA"
   * @example
   * formatCurrencyShort(850000) // "850K FCFA"
   * formatCurrencyShort(24350000) // "24.35M FCFA"
   * formatCurrencyShort(1500000) // "1.5M FCFA"
   */
  export function formatCurrencyShort(amount: number): string {
    const absAmount = Math.abs(amount)
  
    if (absAmount >= 1_000_000) {
      // Millions
      const millions = amount / 1_000_000
      // Garder 2 décimales si nécessaire, sinon arrondir
      const formatted = millions % 1 === 0 ? millions.toString() : millions.toFixed(2).replace(/\.?0+$/, "")
      return `${formatted}M FCFA`
    } else if (absAmount >= 1_000) {
      // Milliers
      const thousands = amount / 1_000
      // Garder 1 décimale si nécessaire, sinon arrondir
      const formatted = thousands % 1 === 0 ? thousands.toString() : thousands.toFixed(1).replace(/\.?0+$/, "")
      return `${formatted}K FCFA`
    } else {
      // Moins de 1000
      return `${Math.round(amount)} FCFA`
    }
  }
  