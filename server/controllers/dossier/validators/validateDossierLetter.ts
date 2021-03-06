import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { isNomsNumberValid } from '../../utils/validate-formats'
import { makeUrl } from '../../utils/makeUrl'
import { makeErrorObject } from '../../utils/errorMessages'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'

export const validateDossierLetter = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let unsavedValues
  let valuesToSave

  const {
    additionalLicenceConditions,
    additionalLicenceConditionsDetail,
    differentNomsNumber,
    differentNomsNumberDetail,
    hasExistingAdditionalLicenceConditionsDetail,
    hasExistingDifferentNomsNumberDetail,
  } = requestBody
  const isLicenceChoiceValid = ['YES', 'NO'].includes(additionalLicenceConditions)
  const isNomsChoiceValid = ['YES', 'NO'].includes(differentNomsNumber)
  const isLicenceYes = additionalLicenceConditions === 'YES'
  const isNomsYes = differentNomsNumber === 'YES'
  const licenceDetailMissing = isLicenceYes && !additionalLicenceConditionsDetail
  const nomsDetailMissing = isNomsYes && !differentNomsNumberDetail
  const nomsDetailInvalid =
    (isNomsYes && differentNomsNumberDetail && !isNomsNumberValid(differentNomsNumberDetail)) || false

  if (!isLicenceChoiceValid || licenceDetailMissing || !isNomsChoiceValid || nomsDetailMissing || nomsDetailInvalid) {
    errors = []
    if (!isLicenceChoiceValid) {
      errors.push(
        makeErrorObject({
          id: 'additionalLicenceConditions',
          text: 'Are there additional licence conditions?',
        })
      )
    }
    if (licenceDetailMissing) {
      errors.push(
        makeErrorObject({
          id: 'additionalLicenceConditionsDetail',
          text: 'Provide more detail',
        })
      )
    }
    if (!isNomsChoiceValid) {
      errors.push(
        makeErrorObject({
          id: 'differentNomsNumber',
          text: 'Is <span data-private>{{ recall.fullName }}</span> being held under a different NOMIS number to the one on the licence?',
        })
      )
    }
    if (nomsDetailMissing) {
      errors.push(
        makeErrorObject({
          id: 'differentNomsNumberDetail',
          text: 'Enter the NOMIS number <span data-private>{{ recall.fullName }}</span> is being held under',
        })
      )
    }
    if (nomsDetailInvalid) {
      errors.push(
        makeErrorObject({
          id: 'differentNomsNumberDetail',
          text: 'Enter a NOMIS number in the correct format',
          values: differentNomsNumberDetail,
        })
      )
    }
    unsavedValues = {
      additionalLicenceConditions,
      additionalLicenceConditionsDetail,
      differentNomsNumber,
      differentNomsNumberDetail,
    }
  }
  if (!errors) {
    // in the case of no detail, only send an empty string to reset the detail field, if it has an existing value
    const additionalLicenceConditionsDetailIfNo = hasExistingAdditionalLicenceConditionsDetail ? '' : undefined
    const differentNomsNumberDetailIfNo = hasExistingDifferentNomsNumberDetail ? '' : undefined
    valuesToSave = {
      additionalLicenceConditions: isLicenceYes,
      additionalLicenceConditionsDetail: isLicenceYes
        ? additionalLicenceConditionsDetail
        : additionalLicenceConditionsDetailIfNo,
      differentNomsNumber: isNomsYes,
      differentNomsNumberDetail: isNomsYes ? differentNomsNumberDetail : differentNomsNumberDetailIfNo,
    }
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: makeUrl('dossier-check', urlInfo) }
}
