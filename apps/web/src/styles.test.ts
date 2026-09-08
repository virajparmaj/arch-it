import { readFileSync } from 'node:fs'
import { afterEach, describe, expect, it } from 'vitest'

const appStyles = readFileSync('apps/web/src/styles.css', 'utf8')
const mapStyles = readFileSync('node_modules/maplibre-gl/dist/maplibre-gl.css', 'utf8')

afterEach(() => {
  document.head.querySelectorAll('style').forEach((style) => style.remove())
  document.body.replaceChildren()
})

describe('map container CSS integration', () => {
  it.each([
    ['vendor first', [mapStyles, appStyles]],
    ['vendor loaded later', [appStyles, mapStyles]],
  ] as const)('fills its panel with %s', (_, sheets) => {
    document.body.innerHTML = '<main class="map-panel"><div class="map-canvas maplibregl-map"></div></main>'
    for (const css of sheets) {
      const style = document.createElement('style')
      style.textContent = css
      document.head.append(style)
    }

    // A relative, auto-height container collapses around MapLibre's absolute children.
    // Test the actual stylesheets together, not a mocked renderer or copied CSS rule.
    const style = getComputedStyle(document.querySelector('.map-canvas')!)
    expect(style.position).toBe('absolute')
    expect(style.inset).toBe('0px')
  })
})
