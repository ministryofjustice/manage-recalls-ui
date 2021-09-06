import { formatPrisonLists, getReferenceDataItemLabel, ReferenceDataCategories } from './referenceData'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'

describe('getReferenceDataItemLabel', () => {
  it('returns a label for recall lengths', () => {
    const label = getReferenceDataItemLabel('recallLengths', RecallResponse.recallLength.FOURTEEN_DAYS)
    expect(label).toEqual('14')
  })

  it('returns a label for probation divisions', () => {
    const label = getReferenceDataItemLabel(
      'probationDivisions',
      RecallResponse.probationDivision.SOUTH_WEST_AND_SOUTH_CENTRAL
    )
    expect(label).toEqual('South West and South Central')
  })

  it('returns a label for MAPPA levels', () => {
    const label = getReferenceDataItemLabel('mappaLevels', RecallResponse.mappaLevel.LEVEL_3)
    expect(label).toEqual('Level 3')
  })

  it('returns a label for recall reasons', () => {
    const label = getReferenceDataItemLabel('reasonsForRecall', RecallResponse.reasonForRecall.BREACH_EXCLUSION_ZONE)
    expect(label).toEqual('Breach of exclusion zone')
  })

  it('returns undefined if ref data category not found', () => {
    const label = getReferenceDataItemLabel('oops' as ReferenceDataCategories, 'France')
    expect(label).toBeUndefined()
  })

  it('returns undefined if item not found', () => {
    const label = getReferenceDataItemLabel('probationDivisions', 'France')
    expect(label).toBeUndefined()
  })
})

describe('formatPrisonLists', () => {
  it('returns a list of all and active prisons', async () => {
    const { all, active } = formatPrisonLists([
      {
        prisonId: 'ALI',
        prisonName: 'Albany (HMP)',
        active: false,
      },
      {
        prisonId: 'AKI',
        prisonName: 'Acklington (HMP)',
        active: true,
      },
    ])
    expect(all).toEqual([
      {
        value: 'ALI',
        text: 'Albany (HMP)',
        active: false,
      },
      {
        value: 'AKI',
        text: 'Acklington (HMP)',
        active: true,
      },
    ])
    expect(active).toEqual([
      {
        value: 'AKI',
        text: 'Acklington (HMP)',
        active: true,
      },
    ])
  })
})
