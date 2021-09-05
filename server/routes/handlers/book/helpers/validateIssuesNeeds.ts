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
    (contraband === 'yes' && !contrabandDetail) ||
    (vulnerabilityDiversity === 'yes' && !vulnerabilityDiversityDetail) ||
    !mappaLevel
  ) {
    errors = []
    if (!vulnerabilityDiversity) {
      errors.push(
        makeErrorObject({
          id: 'vulnerabilityDiversity',
          text: 'Vulnerability issues or diversity needs',
        })
      )
    }
    if (!contraband) {
      errors.push(
        makeErrorObject({
          id: 'contraband',
          text: 'Contraband',
        })
      )
    }
    if (contraband === 'yes' && !contrabandDetail) {
      errors.push(
        makeErrorObject({
          id: 'contrabandDetail',
          text: 'Bring contraband to prison detail',
          values: { contraband, vulnerabilityDiversity, contrabandDetail, vulnerabilityDiversityDetail },
        })
      )
    }
    if (vulnerabilityDiversity === 'yes' && !vulnerabilityDiversityDetail) {
      errors.push(
        makeErrorObject({
          id: 'vulnerabilityDiversityDetail',
          text: 'Vulnerability issues or diversity needs detail',
          values: { contraband, vulnerabilityDiversity, contrabandDetail, vulnerabilityDiversityDetail },
        })
      )
    }
    if (!mappaLevel) {
      errors.push(
        makeErrorObject({
          id: 'mappaLevel',
          text: 'MAPPA level',
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
    const contrabandDetailCleaned = contraband === 'yes' ? contrabandDetail : ''
    const vulnerabilityDiversityDetailCleaned = vulnerabilityDiversity === 'yes' ? vulnerabilityDiversityDetail : ''
    valuesToSave = {
      contrabandDetail: contrabandDetailCleaned,
      vulnerabilityDiversityDetail: vulnerabilityDiversityDetailCleaned,
      mappaLevel: UpdateRecallRequest.mappaLevel[mappaLevel],
    }
  }
  return { errors, valuesToSave, unsavedValues }
}
