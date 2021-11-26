import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { NamedFormError, ObjectMap } from '../../../../@types'

export const validateIssuesNeeds = (
  requestBody: ObjectMap<string>
): { errors?: NamedFormError[]; valuesToSave: UpdateRecallRequest; unsavedValues: ObjectMap<unknown> } => {
  let errors
  let unsavedValues
  let valuesToSave

  const { contraband, contrabandDetail, vulnerabilityDiversity, vulnerabilityDiversityDetail, mappaLevel } = requestBody

  if (
    !contraband ||
    !vulnerabilityDiversity ||
    (contraband === 'YES' && !contrabandDetail) ||
    (vulnerabilityDiversity === 'YES' && !vulnerabilityDiversityDetail) ||
    !mappaLevel
  ) {
    errors = []
    if (!vulnerabilityDiversity) {
      errors.push(
        makeErrorObject({
          id: 'vulnerabilityDiversity',
          text: 'Are there any vulnerability issues or diversity needs?',
        })
      )
    }
    if (!contraband) {
      errors.push(
        makeErrorObject({
          id: 'contraband',
          text: 'Do you think {{ recall.fullName }} will bring contraband into prison?',
        })
      )
    }
    if (vulnerabilityDiversity === 'YES' && !vulnerabilityDiversityDetail) {
      errors.push(
        makeErrorObject({
          id: 'vulnerabilityDiversityDetail',
          text: 'Provide more detail for any vulnerability issues or diversity needs',
        })
      )
    }
    if (contraband === 'YES' && !contrabandDetail) {
      errors.push(
        makeErrorObject({
          id: 'contrabandDetail',
          text: 'Provide more detail on why you think {{ recall.fullName }} will bring contraband into prison',
        })
      )
    }
    if (!mappaLevel) {
      errors.push(
        makeErrorObject({
          id: 'mappaLevel',
          text: 'Select a MAPPA level',
        })
      )
    }
    unsavedValues = {
      contraband,
      contrabandDetail,
      vulnerabilityDiversity,
      vulnerabilityDiversityDetail,
      mappaLevel,
    }
  }
  if (!errors) {
    // If someone chooses Yes, and types a response, before choosing No, the response is still sent. This 'cleans' that.
    // Using blanks as server cannot handle nulls and will just not overwrite existing value
    const contrabandDetailCleaned = contraband === 'YES' ? contrabandDetail : ''
    const vulnerabilityDiversityDetailCleaned = vulnerabilityDiversity === 'YES' ? vulnerabilityDiversityDetail : ''
    valuesToSave = {
      contraband: contraband === 'YES',
      contrabandDetail: contrabandDetailCleaned,
      vulnerabilityDiversity: vulnerabilityDiversity === 'YES',
      vulnerabilityDiversityDetail: vulnerabilityDiversityDetailCleaned,
      mappaLevel: UpdateRecallRequest.mappaLevel[mappaLevel],
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
