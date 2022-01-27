import { makeErrorObject, makeUrl } from '../../helpers'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'
import { isNomsNumberValid } from '../../helpers/validations'

export const validateDossierLetter = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  let errors
  let unsavedValues
  let valuesToSave

  const {
    additionalLicenceConditions,
    additionalLicenceConditionsDetail,
    differentNomsNumber,
    differentNomsNumberDetail,
  } = requestBody
  const isLicenceChoiceValid = ['YES', 'NO'].includes(additionalLicenceConditions)
  const isNomsChoiceValid = ['YES', 'NO'].includes(differentNomsNumber)
  const isLicenceYes = additionalLicenceConditions === 'YES'
  const isNomsYes = differentNomsNumber === 'YES'
  const licenceDetailMissing = isLicenceYes && !additionalLicenceConditionsDetail
  const nomsDetailMissing = isNomsYes && !differentNomsNumberDetail
  const nomsDetailInvalid =
    (isNomsYes && differentNomsNumberDetail && !isNomsNumberValid(differentNomsNumberDetail)) || false

  // only use the detail fields if 'Yes' was checked; ignore them if 'No' was the last option checked
  const licenceDetailCleaned = isLicenceYes ? additionalLicenceConditionsDetail : ''
  const nomsDetailCleaned = isNomsYes ? differentNomsNumberDetail : ''

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
          text: 'Is {{ recall.fullName }} being held under a different NOMIS number to the one on the licence?',
        })
      )
    }
    if (nomsDetailMissing) {
      errors.push(
        makeErrorObject({
          id: 'differentNomsNumberDetail',
          text: 'Enter the NOMIS number {{ recall.fullName }} is being held under',
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
      additionalLicenceConditionsDetail: licenceDetailCleaned,
      differentNomsNumber,
      differentNomsNumberDetail: nomsDetailCleaned,
    }
  }
  if (!errors) {
    valuesToSave = {
      additionalLicenceConditions: isLicenceYes,
      additionalLicenceConditionsDetail: licenceDetailCleaned,
      differentNomsNumber: isNomsYes,
      differentNomsNumberDetail: nomsDetailCleaned,
    }
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: makeUrl('dossier-check', urlInfo) }
}
