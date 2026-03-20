import { useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchAircraft } from '../api/client'
import { useAppStore } from '../store'

export function useAircraftList() {
  const filters = useAppStore((s) => s.filters)
  const setAircraft = useAppStore((s) => s.setAircraft)

  const query = useQuery({
    queryKey: ['aircraft', filters],
    queryFn: () => fetchAircraft(filters),
    // Poll every 10 seconds for live position updates
    refetchInterval: 10_000,
    staleTime: 8_000,
    retry: 2,
  })

  // Sync query result into Zustand store
  useEffect(() => {
    if (query.data) {
      setAircraft(query.data)
    }
  }, [query.data, setAircraft])

  return query
}
