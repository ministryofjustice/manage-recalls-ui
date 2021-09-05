import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'

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
  const isLicenceValueValid = ['YES', 'NO'].includes(additionalLicenceConditions)
  const isNomsValueValid = ['YES', 'NO'].includes(differentNomsNumber)
  const isLicenceYes = additionalLicenceConditions === 'YES'
  const isNomsYes = differentNomsNumber === 'YES'
  const licenceDetailMissing = isLicenceYes && !additionalLicenceConditionsDetail
  const nomsDetailMissing = isNomsYes && !differentNomsNumberDetail

  // only use the detail fields if 'Yes' was checked; ignore them if 'No' was the last option checked
  const licenceDetailCleaned = isLicenceYes ? additionalLicenceConditionsDetail : ''
  const nomsDetailCleaned = isNomsYes ? differentNomsNumberDetail : ''

  if (!isLicenceValueValid || licenceDetailMissing || !isNomsValueValid || nomsDetailMissing) {
    errors = []
    if (!isLicenceValueValid) {
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
    if (!isNomsValueValid) {
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
          text: 'Provide the different NOMIS number',
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
