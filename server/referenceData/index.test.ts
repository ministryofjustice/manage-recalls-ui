import { getReferenceDataItemLabel, isStringValidReferenceData, ReferenceDataCategories } from './index'
import { RecallResponse } from '../@types/manage-recalls-api/models/RecallResponse'

describe('Reference data helpers', () => {
  describe('getReferenceDataItemLabel', () => {
    it('returns a label for recall lengths', () => {
      const label = getReferenceDataItemLabel('recallLengths', RecallResponse.recallLength.FOURTEEN_DAYS)
      expect(label).toEqual('14')
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
      const label = getReferenceDataItemLabel('mappaLevels', 'France')
      expect(label).toBeUndefined()
    })
  })

  describe('isStringValidReferenceData', () => {
    it('returns false for an invalid string', () => {
      const isValid = isStringValidReferenceData('mappaLevels', 'zzz')
      expect(isValid).toEqual(false)
    })

    it('returns true for a valid string', () => {
      const isValid = isStringValidReferenceData('mappaLevels', 'Level 1')
      expect(isValid).toEqual(true)
    })
  })
})
