import { describe, it, expect } from 'vitest'
import { FILTERS } from '../filters'

describe('FILTERS', () => {
  it('少なくとも1件存在する', () => {
    expect(FILTERS.length).toBeGreaterThan(0)
  })

  it('各フィルターは id / name / css を持つ', () => {
    for (const f of FILTERS) {
      expect(f).toHaveProperty('id')
      expect(f).toHaveProperty('name')
      expect(f).toHaveProperty('css')
      expect(typeof f.id).toBe('string')
      expect(typeof f.name).toBe('string')
      expect(typeof f.css).toBe('string')
    }
  })

  it('id は一意である', () => {
    const ids = FILTERS.map((f) => f.id)
    const unique = new Set(ids)
    expect(unique.size).toBe(ids.length)
  })

  it('"original" フィルターは css が "none"', () => {
    const original = FILTERS.find((f) => f.id === 'original')
    expect(original).toBeDefined()
    expect(original?.css).toBe('none')
  })
})
