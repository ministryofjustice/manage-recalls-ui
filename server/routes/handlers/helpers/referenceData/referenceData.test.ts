import { getReferenceDataItemLabel, ReferenceDataCategories } from './referenceData'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'

describe('getReferenceDataItemLabel', () => {
  it('returns a label for recall lengths', () => {
    const label = getReferenceDataItemLabel('recallLengths', RecallResponse.recallLength.FOURTEEN_DAYS)
    expect(label).toEqual('14 days')
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
    const label = getReferenceDataItemLabel('reasonsForRecall', RecallResponse.reasonsForRecall.BREACH_EXCLUSION_ZONE)
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
