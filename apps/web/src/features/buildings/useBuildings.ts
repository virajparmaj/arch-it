import { useCallback, useEffect, useState } from 'react'
import type { BuildingLoadState } from '../../types/building'
import { BUILDINGS_URL, parseBuildingDataset } from './data'

export function useBuildings() {
  const [state, setState] = useState<BuildingLoadState>({ status: 'loading', data: null })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()
    let disposed = false
    const timeout = window.setTimeout(() => controller.abort(), 15_000)
    async function load() {
      try {
        const response = await fetch(BUILDINGS_URL, { signal: controller.signal })
        if (!response.ok) throw new Error(`Building snapshot returned ${response.status}`)
        const data = parseBuildingDataset(await response.json())
        if (!disposed) setState({ status: 'ready', data })
      } catch (error) {
        if (!disposed) { console.warn('Building snapshot failed', error); setState({ status: 'error', data: null }) }
      } finally {
        window.clearTimeout(timeout)
      }
    }
    void load()
    return () => { disposed = true; controller.abort(); window.clearTimeout(timeout) }
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading', data: null })
    setAttempt((previous) => previous + 1)
  }, [])

  return { ...state, retry }
}
