import { describe, expect, it } from 'vitest'
import en from './en.json'
import { flattenKeys } from './flatten'
import nl from './nl.json'

describe('i18n key parity', () => {
  it('has the same keys in Dutch and English', () => {
    const nlKeys = flattenKeys(nl).sort()
    const enKeys = flattenKeys(en).sort()
    expect(nlKeys).toEqual(enKeys)
  })
})
