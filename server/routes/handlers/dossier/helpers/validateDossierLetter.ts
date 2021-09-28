import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'
import { isNomsNumberValid } from '../../helpers/validations'

export const validateDossierLetter = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest; unsavedValues: ObjectMap<unknown> } => {
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
          text: 'Licence conditions',
        })
      )
    }
    if (licenceDetailMissing) {
      errors.push(
        makeErrorObject({
          id: 'additionalLicenceConditionsDetail',
          text: 'Provide detail on additional licence conditions',
        })
      )
    }
    if (!isNomsChoiceValid) {
      errors.push(
        makeErrorObject({
          id: 'differentNomsNumber',
          text: 'Different NOMIS number',
        })
      )
    }
    if (nomsDetailMissing) {
      errors.push(
        makeErrorObject({
          id: 'differentNomsNumberDetail',
          text: 'Different NOMIS number',
          errorMsgForField: 'Enter the NOMIS number',
        })
      )
    }
    if (nomsDetailInvalid) {
      errors.push(
        makeErrorObject({
          id: 'differentNomsNumberDetail',
          text: 'Different NOMIS number',
          values: differentNomsNumberDetail,
          errorMsgForField: 'You entered an incorrect NOMIS number format',
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
  return { errors, valuesToSave, unsavedValues }
}
