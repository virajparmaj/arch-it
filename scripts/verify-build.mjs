import assert from 'node:assert/strict'
import { readdir, readFile } from 'node:fs/promises'

const assets = new URL('../dist/assets/', import.meta.url)
const files = await readdir(assets)
const workers = files.filter((file) => /^maplibre-gl-worker-.+\.js$/.test(file))
assert.equal(workers.length, 1, 'The build must contain one bundled MapLibre worker.')

const mapModule = files.find((file) => /^MapCanvas-.+\.js$/.test(file))
assert.ok(mapModule, 'The lazy map entry must be present.')
const mapCode = await readFile(new URL(mapModule, assets), 'utf8')
assert.ok(mapCode.includes(workers[0]), 'The map must reference the emitted worker URL.')

const workerCode = await readFile(new URL(workers[0], assets), 'utf8')
assert.ok(workerCode.length > 1000, 'The worker must contain executable bundled code.')
assert.ok(!/from\s*["']\.\/maplibre-gl-shared/.test(workerCode), 'The worker must not depend on an unshipped sibling module.')
console.log('Build verified: map entry references a bundled, self-contained worker.')
