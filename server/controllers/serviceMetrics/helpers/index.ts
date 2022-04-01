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
  const ordered = Object.entries(phaseTimings).map(([key, value]) => ({
    name: key,
    label: getLabel(key),
    entries: value.map(entry => ({ ...entry, label: getPhaseLabel(entry.phase) })),
    total: value.reduce((acc, curr) => acc + curr.averageDuration, 0),
  }))
  const largestTotal = ordered.sort((a, b) => a.total - b.total)[ordered.length - 1].total
  return ordered.map(entry => {
    return {
      ...entry,
      percentOfLargest: Math.round((entry.total / largestTotal) * 100),
    }
  })
}
