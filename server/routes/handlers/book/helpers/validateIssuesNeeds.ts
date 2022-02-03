import { makeErrorObject } from '../../helpers'
import { UpdateRecallRequest } from '../../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'
import { makeUrl, makeUrlToFromPage } from '../../helpers/makeUrl'

export const validateIssuesNeeds = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  let errors
  let unsavedValues
  let valuesToSave

  const {
    contraband,
    contrabandDetail,
    hasExistingContrabandDetail,
    vulnerabilityDiversity,
    vulnerabilityDiversityDetail,
    hasExistingVulnerabilityDiversityDetail,
    arrestIssues,
    arrestIssuesDetail,
    hasExistingArrestIssuesDetail,
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
    // in the case of No + no detail, only send an empty string to reset the detail field, if it has an existing value
    const contrabandDetailIfNo = hasExistingContrabandDetail ? '' : undefined
    const vulnerabilityDiversityDetailIfNo = hasExistingVulnerabilityDiversityDetail ? '' : undefined
    const arrestIssuesDetailIfNo = notInCustody && hasExistingArrestIssuesDetail ? '' : undefined
    valuesToSave = {
      contraband: contraband === 'YES',
      contrabandDetail: contraband === 'YES' ? contrabandDetail : contrabandDetailIfNo,
      vulnerabilityDiversity: vulnerabilityDiversity === 'YES',
      vulnerabilityDiversityDetail:
        vulnerabilityDiversity === 'YES' ? vulnerabilityDiversityDetail : vulnerabilityDiversityDetailIfNo,
      arrestIssues: notInCustody ? arrestIssues === 'YES' : undefined,
      arrestIssuesDetail: notInCustody && arrestIssues === 'YES' ? arrestIssuesDetail : arrestIssuesDetailIfNo,
      mappaLevel: UpdateRecallRequest.mappaLevel[mappaLevel],
    }
  }
  return {
    errors,
    valuesToSave,
    unsavedValues,
    redirectToPage: urlInfo.fromPage
      ? makeUrlToFromPage(urlInfo.fromPage, urlInfo)
      : makeUrl('probation-officer', urlInfo),
  }
}
