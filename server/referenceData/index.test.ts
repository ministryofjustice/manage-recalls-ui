import { getReferenceDataItemLabel, isStringValidReferenceData, ReferenceDataCategories } from './index'
import { RecallResponse } from '../@types/manage-recalls-api/models/RecallResponse'

describe('Reference data helpers', () => {
  describe('getReferenceDataItemLabel', () => {
    it('returns a label for recall lengths', () => {
      const label = getReferenceDataItemLabel('recallLengths', RecallResponse.recallLength.FOURTEEN_DAYS)
      expect(label).toEqual('14')
    })

    it('returns undefined if ref data category not found', () => {
      const label = getReferenceDataItemLabel('oops' as ReferenceDataCategories, 'France')
      expect(label).toBeUndefined()
    })

    it('returns undefined if item not found', () => {
      const label = getReferenceDataItemLabel('recallLengths', 'France')
      expect(label).toBeUndefined()
    })
  })

  describe('isStringValidReferenceData', () => {
    it('returns false for an invalid string', () => {
      const isValid = isStringValidReferenceData('recallLengths', 'zzz')
      expect(isValid).toEqual(false)
    })

    it('returns true for a valid string', () => {
      const isValid = isStringValidReferenceData('recallLengths', '14')
      expect(isValid).toEqual(true)
    })
  })
})
