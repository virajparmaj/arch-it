import { describe, expect, it } from 'vitest'
import { claimText, safeWebsite, validClaim } from './claims'
import type { BuildingClaim } from '../../types/building'

describe('claim rendering and outbound URL boundary', () => {
  it('rejects unsafe and ambiguous URLs without silently adding a scheme', () => {
    for (const url of ['javascript:alert(1)', 'data:text/html,test', '//example.com', 'example.com', 'https://user:pass@example.com', 'https://@example.com', 'https://example.com\\@evil.com', 'https://example.com\n', 'https://example.com/%0Afoo', 'https://example.com;https://other.com', 'https://', 'https://example.com:99999', 'https://example..com', 'https://example.com/a b']) expect(safeWebsite(url), url).toBe(false)
    for (const url of ['https://example.com/path?q=1#section', 'http://example.com', 'https://example.com:8443/path']) expect(safeWebsite(url), url).toBe(true)
  })

  it('keeps partial, approximate and invalid claims as text without invented values', () => {
    const base: BuildingClaim = { property: 'start_date', raw_property: 'tags.start_date', value: '~1900', source_id: 'source', source_record_id: 'osm:way/1', normalized: null, status: 'raw_only', note: 'No exact date inferred.' }
    expect(validClaim(base, 'source', 'osm:way/1')).toBe(true)
    expect(claimText(base)).toBe('~1900')
    const month: BuildingClaim = { ...base, value: '1921-10', normalized: { kind: 'date', text: '1921-10', precision: 'month' }, status: 'normalized', note: null }
    expect(validClaim(month, 'source', 'osm:way/1')).toBe(true)
    expect(claimText(month)).toBe('1921-10')
    expect(validClaim({ ...month, value: '2023-02-29', normalized: { kind: 'date', text: '2023-02-29', precision: 'day' } }, 'source', 'osm:way/1')).toBe(false)
    expect(claimText({ ...base, value: '' })).toBe('Empty source value')
  })
})
