/** Cryptographically strong pick of an index in [0, length). */
export function secureRandomIndex(length: number): number {
  if (length <= 0) throw new Error('No segments to spin')
  const buf = new Uint32Array(1)
  crypto.getRandomValues(buf)
  return buf[0]! % length
}

export function spinWheel(segments: string[]): string {
  const index = secureRandomIndex(segments.length)
  return segments[index]!
}
