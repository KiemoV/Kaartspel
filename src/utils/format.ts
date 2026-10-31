/** Parse hand/score input accepting both comma and dot decimals. */
export function parseLocaleNumber(raw: string): number | null {
  const trimmed = raw.trim().replace(/\s/g, '')
  if (trimmed === '') return null
  const normalized = trimmed.replace(',', '.')
  const n = Number(normalized)
  if (Number.isNaN(n)) return null
  return n
}

export function formatNumber(value: number, lang: string): string {
  return new Intl.NumberFormat(lang === 'nl' ? 'nl-NL' : 'en-US', {
    maximumFractionDigits: 1,
  }).format(value)
}
