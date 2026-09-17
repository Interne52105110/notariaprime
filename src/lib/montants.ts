/** Montants saisis : espaces français et séparateurs décimaux, sans troncature. */
export function lireMontant(value: string | number): number | null {
  if (typeof value === 'number') return Number.isFinite(value) && value >= 0 && value <= 1e12 ? value : null;
  let text = value.trim().replace(/[\s\u00a0\u202f]/g, '');
  if (!text || !/^[\d.,]+$/.test(text)) return null;
  if (/^\d{1,3}(?:,\d{3})+\.\d{1,2}$/.test(text)) text = text.replace(/,/g, '');
  else if (/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(text)) text = text.replace(/\./g, '').replace(',', '.');
  else text = text.replace(',', '.');
  if (!/^\d+(?:\.\d{1,2})?$/.test(text)) return null;
  const amount = Number(text);
  return Number.isFinite(amount) && amount <= 1e12 ? amount : null;
}

/** Arrondi décimal exact d'un rationnel, demi-unité à l'opposé de zéro. */
export function arrondirRatio(n: bigint, d: bigint): number {
  const sign = n < BigInt(0) ? -1 : 1;
  const positive = n < BigInt(0) ? -n : n;
  return sign * Number((positive * BigInt(2) + d) / (d * BigInt(2)));
}

export function arrondirCentimes(value: number): number {
  if (!Number.isFinite(value)) throw new RangeError('Montant non fini');
  // Stabilise les opérations binaires précédentes, puis arrondit en décimal.
  const fixed = Math.abs(value).toFixed(8);
  const [whole, fraction] = fixed.split('.');
  const cents = arrondirRatio(BigInt(whole + fraction), BigInt(1000000));
  return (value < 0 ? -cents : cents) / 100;
}

export function sommeMontants(values: number[]): number {
  return values.reduce((sum, value) => sum + Math.round(arrondirCentimes(value) * 100), 0) / 100;
}

export function quantite(value: number): number {
  return Number.isFinite(value) ? Math.min(100000, Math.max(0, Math.floor(value))) : 0;
}
