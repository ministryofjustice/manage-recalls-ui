import { makeErrorObject, makeUrl } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'

export const validateIssuesNeeds = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  let errors
  let unsavedValues
  let valuesToSave

  const {
    contraband,
    contrabandDetail,
    vulnerabilityDiversity,
    vulnerabilityDiversityDetail,
    arrestIssues,
    arrestIssuesDetail,
    mappaLevel,
    notInCustody,
  } = requestBody

  if (
    !contraband ||
    !vulnerabilityDiversity ||
    (notInCustody && !arrestIssues) ||
    (contraband === 'YES' && !contrabandDetail) ||
    (vulnerabilityDiversity === 'YES' && !vulnerabilityDiversityDetail) ||
    (notInCustody && arrestIssues === 'YES' && !arrestIssuesDetail) ||
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
    if (notInCustody && !arrestIssues) {
      errors.push(
        makeErrorObject({
          id: 'arrestIssues',
          text: 'Are there any arrest issues?',
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
    if (notInCustody && arrestIssues === 'YES' && !arrestIssuesDetail) {
      errors.push(
        makeErrorObject({
          id: 'arrestIssuesDetail',
          text: 'Provide more detail for any arrest issues',
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
      arrestIssues,
      arrestIssuesDetail,
      mappaLevel,
    }
  }
  if (!errors) {
    // If someone chooses Yes, and types a response, before choosing No, the response is still sent. This 'cleans' that.
    // Using blanks as server cannot handle nulls and will just not overwrite existing value
    const contrabandDetailCleaned = contraband === 'YES' ? contrabandDetail : ''
    const vulnerabilityDiversityDetailCleaned = vulnerabilityDiversity === 'YES' ? vulnerabilityDiversityDetail : ''
    const arrestIssuesCleaned = arrestIssues === 'YES' ? arrestIssuesDetail : ''
    valuesToSave = {
      contraband: contraband === 'YES',
      contrabandDetail: contrabandDetailCleaned,
      vulnerabilityDiversity: vulnerabilityDiversity === 'YES',
      vulnerabilityDiversityDetail: vulnerabilityDiversityDetailCleaned,
      arrestIssues: notInCustody ? arrestIssues === 'YES' : undefined,
      arrestIssuesDetail: notInCustody ? arrestIssuesCleaned : undefined,
      mappaLevel: UpdateRecallRequest.mappaLevel[mappaLevel],
    }
  }
  return {
    errors,
    valuesToSave,
    unsavedValues,
    redirectToPage: makeUrl(urlInfo.fromPage || 'probation-officer', urlInfo),
  }
}
