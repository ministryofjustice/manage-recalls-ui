import {
  formatPrisonLists,
  getReferenceDataItemLabel,
  isStringValidReferenceData,
  ReferenceDataCategories,
} from './referenceData'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'

describe('Reference data helpers', () => {
  describe('getReferenceDataItemLabel', () => {
    it('returns a label for recall lengths', () => {
      const label = getReferenceDataItemLabel('recallLengths', RecallResponse.recallLength.FOURTEEN_DAYS)
      expect(label).toEqual('14')
    })

    it('returns a label for local delivery units', () => {
      const label = getReferenceDataItemLabel('localDeliveryUnits', RecallResponse.localDeliveryUnit.ISLE_OF_MAN)
      expect(label).toEqual('Isle of Man')
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
      const label = getReferenceDataItemLabel('localDeliveryUnits', 'France')
      expect(label).toBeUndefined()
    })
  })

  describe('isStringValidReferenceData', () => {
    it('returns false for an invalid string', () => {
      const isValid = isStringValidReferenceData('localDeliveryUnits', 'zzz')
      expect(isValid).toEqual(false)
    })

    it('returns true for a invalid string', () => {
      const isValid = isStringValidReferenceData('localDeliveryUnits', 'Central Audit Team')
      expect(isValid).toEqual(true)
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
})
