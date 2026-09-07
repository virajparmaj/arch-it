import { readFileSync } from 'node:fs'
import { act } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { useBuildings } from './useBuildings'

const snapshot = JSON.parse(readFileSync('apps/web/public/data/chicago-loop/buildings.geojson', 'utf8'))
let host: HTMLDivElement
let root: Root

function Harness() {
  const state = useBuildings()
  return <div><p>{state.status}</p><span>{state.data?.features.length ?? 0}</span><button onClick={state.retry}>Retry</button></div>
}

beforeEach(() => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
  host = document.createElement('div')
  document.body.append(host)
  root = createRoot(host)
})

afterEach(() => {
  act(() => root.unmount())
  host.remove()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('recovers independently from a failed building download', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce({ ok: false, status: 503 })
    .mockResolvedValueOnce({ ok: true, json: async () => snapshot })
  vi.stubGlobal('fetch', fetchMock)
  await act(async () => root.render(<Harness />))
  expect(host.querySelector('p')!.textContent).toBe('error')
  await act(async () => host.querySelector<HTMLButtonElement>('button')!.click())
  expect(host.querySelector('p')!.textContent).toBe('ready')
  expect(host.querySelector('span')!.textContent).toBe('345')
  expect(fetchMock).toHaveBeenCalledTimes(2)
})

it('aborts an unfinished fetch when the application unmounts', async () => {
  const fetchMock = vi.fn(() => new Promise(() => {}))
  vi.stubGlobal('fetch', fetchMock)
  await act(async () => root.render(<Harness />))
  const [, options] = (fetchMock.mock.calls as unknown as [string, { signal: AbortSignal }][]) [0]
  act(() => root.render(null))
  expect(options.signal.aborted).toBe(true)
})
