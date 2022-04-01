import { processPhaseTimings } from './index'
import summaryStatistics from '../../../../fake-manage-recalls-api/stubs/__files/get-summary-statistics.json'
import { StatisticsSummary } from '../../../@types/manage-recalls-api/models/StatisticsSummary'

describe('processPhaseTimings', () => {
  it('transforms to a list', () => {
    const transformed = processPhaseTimings(summaryStatistics as StatisticsSummary)
    expect(transformed).toEqual([
      {
        entries: [
          {
            averageDuration: 100,
            count: 5,
            label: 'Book',
            phase: 'BOOK',
          },
          {
            averageDuration: 80,
            count: 4,
            label: 'Assess',
            phase: 'ASSESS',
          },
          {
            averageDuration: 65,
            count: 4,
            label: 'Create dossier',
            phase: 'DOSSIER',
          },
        ],
        label: 'Last 7 days',
        name: 'lastSevenDays',
        percentOfLargest: 88,
        total: 245,
      },
      {
        entries: [
          {
            averageDuration: 120,
            count: 8,
            label: 'Book',
            phase: 'BOOK',
          },
          {
            averageDuration: 85,
            count: 7,
            label: 'Assess',
            phase: 'ASSESS',
          },
          {
            averageDuration: 73,
            count: 5,
            label: 'Create dossier',
            phase: 'DOSSIER',
          },
        ],
        label: 'All recalls',
        name: 'overall',
        percentOfLargest: 100,
        total: 278,
      },
    ])
  })
})
