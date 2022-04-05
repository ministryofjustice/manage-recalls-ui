import { StartPhaseRequest } from '../../../@types/manage-recalls-api/models/StartPhaseRequest'
import { StatisticsSummary } from '../../../@types/manage-recalls-api/models/StatisticsSummary'

const getLabel = (name: string) => {
  switch (name) {
    case 'lastSevenDays':
      return 'Last 7 days'
    case 'overall':
      return 'All recalls'
    default:
      throw new Error(`getLabel: invalid name: ${name}`)
  }
}

const getPhaseLabel = (phaseName: StartPhaseRequest.phase) => {
  switch (phaseName) {
    case 'BOOK':
      return 'Book'
    case 'ASSESS':
      return 'Assess'
    case 'DOSSIER':
      return 'Create dossier'
    default:
      throw new Error(`getPhaseLabel: invalid phaseName: ${phaseName}`)
  }
}

export const processPhaseTimings = (phaseTimings: StatisticsSummary) => {
  const list = Object.entries(phaseTimings).map(([key, value]) => ({
    name: key,
    label: getLabel(key),
    entries: ['BOOK', 'ASSESS', 'DOSSIER']
      .map(phaseName => {
        const entry = value.find(val => val.phase === phaseName)
        return entry ? { ...entry, label: getPhaseLabel(entry.phase) } : undefined
      })
      .filter(Boolean),
    total: value.reduce((acc, curr) => acc + curr.averageDuration, 0),
  }))
  const largestTotal = list.sort((a, b) => a.total - b.total)[list.length - 1].total || 0
  return list.map(entry => {
    return {
      ...entry,
      percentOfLargest: largestTotal ? Math.round((entry.total / largestTotal) * 100) : 100,
    }
  })
}
