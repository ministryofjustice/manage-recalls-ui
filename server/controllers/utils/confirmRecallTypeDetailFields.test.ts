import { confirmRecallTypeDetailFields } from './confirmRecallTypeDetailFields'
import { RecallResponse } from '../../@types/manage-recalls-api/models/RecallResponse'
import { DecoratedRecall } from '../../@types'

describe('confirmRecallTypeDetailFields', () => {
  describe('confirmedRecallType is FIXED', () => {
    it('returns empty string for fixed detail field if it has an error', () => {
      const result = confirmRecallTypeDetailFields({
        confirmedRecallType: RecallResponse.recommendedRecallType.FIXED,
        errors: {
          confirmedRecallTypeDetailFixed: {
            text: 'Provide detail',
          },
        },
        unsavedValues: {},
        apiValues: {} as DecoratedRecall,
      })
      expect(result).toEqual({
        confirmedRecallTypeDetailFixed: '',
      })
    })

    it('returns unsaved value for fixed detail field if no error', () => {
      const result = confirmRecallTypeDetailFields({
        confirmedRecallType: RecallResponse.recommendedRecallType.FIXED,
        errors: {},
        unsavedValues: {
          confirmedRecallTypeDetailFixed: 'Reasons...',
        },
        apiValues: {} as DecoratedRecall,
      })
      expect(result).toEqual({
        confirmedRecallTypeDetailFixed: 'Reasons...',
      })
    })

    it('returns API value for detail field if no error and no unsaved value', () => {
      const result = confirmRecallTypeDetailFields({
        confirmedRecallType: RecallResponse.recommendedRecallType.FIXED,
        errors: {},
        unsavedValues: {},
        apiValues: {
          confirmedRecallType: RecallResponse.recommendedRecallType.FIXED,
          confirmedRecallTypeDetail: 'Reasons...',
        } as unknown as DecoratedRecall,
      })
      expect(result).toEqual({
        confirmedRecallTypeDetailFixed: 'Reasons...',
      })
    })
  })

  describe('confirmedRecallType is STANDARD', () => {
    it('returns empty string for fixed detail field if it has an error', () => {
      const result = confirmRecallTypeDetailFields({
        confirmedRecallType: RecallResponse.recommendedRecallType.STANDARD,
        errors: {
          confirmedRecallTypeDetailStandard: {
            text: 'Provide detail',
          },
        },
        unsavedValues: {},
        apiValues: {} as DecoratedRecall,
      })
      expect(result).toEqual({
        confirmedRecallTypeDetailStandard: '',
      })
    })

    it('returns unsaved value for fixed detail field if no error', () => {
      const result = confirmRecallTypeDetailFields({
        confirmedRecallType: RecallResponse.recommendedRecallType.STANDARD,
        errors: {},
        unsavedValues: {
          confirmedRecallTypeDetailStandard: 'Reasons...',
        },
        apiValues: {} as DecoratedRecall,
      })
      expect(result).toEqual({
        confirmedRecallTypeDetailStandard: 'Reasons...',
      })
    })

    it('returns API value for detail field if no error and no unsaved value', () => {
      const result = confirmRecallTypeDetailFields({
        confirmedRecallType: RecallResponse.recommendedRecallType.STANDARD,
        errors: {},
        unsavedValues: {},
        apiValues: {
          confirmedRecallType: RecallResponse.recommendedRecallType.STANDARD,
          confirmedRecallTypeDetail: 'Reasons...',
        } as unknown as DecoratedRecall,
      })
      expect(result).toEqual({
        confirmedRecallTypeDetailStandard: 'Reasons...',
      })
    })
  })
})
