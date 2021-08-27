import { FormError, ObjectMap, RecallFormValues } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { isDefined } from './index'
import { splitIsoDateToParts } from './dates'

/* eslint-disable  @typescript-eslint/no-explicit-any */
interface Args {
  agreeWithRecall?: RecallResponse.agreeWithRecall
  errors: ObjectMap<FormError>
  unsavedValues: ObjectMap<any>
  apiValues: RecallResponse
}

export const recallRecommendation = ({ agreeWithRecall, errors = {}, unsavedValues = {}, apiValues }: Args) => {
  const vals = {} as RecallFormValues
  if (agreeWithRecall === 'YES') {
    vals.agreeWithRecallDetailYes = isDefined(errors.agreeWithRecallDetailYes)
      ? ''
      : unsavedValues.agreeWithRecallDetailYes || (apiValues.agreeWithRecall && apiValues.agreeWithRecallDetail)
  } else {
    vals.agreeWithRecallDetailNo = isDefined(errors.agreeWithRecallDetailNo)
      ? ''
      : unsavedValues.agreeWithRecallDetailNo || (!apiValues.agreeWithRecall && apiValues.agreeWithRecallDetail)
  }
  return vals
}

export const getFormValues = ({ errors = {}, unsavedValues = {}, apiValues }: Args): RecallFormValues => {
  let values = {
    sentenceLengthParts: errors.sentenceLength?.values || unsavedValues.sentenceLengthParts || apiValues.sentenceLength,
  } as RecallFormValues
  ;[
    'recallEmailReceivedDateTime',
    'lastReleaseDate',
    'sentenceDate',
    'sentenceExpiryDate',
    'licenceExpiryDate',
    'conditionalReleaseDate',
  ].forEach((key: string) => {
    values[`${key}Parts`] = errors[key]?.values || unsavedValues[`${key}Parts`] || splitIsoDateToParts(apiValues[key])
  })
  ;[
    'agreeWithRecall',
    'lastReleasePrison',
    'mappaLevel',
    'sentencingCourt',
    'indexOffence',
    'localPoliceForce',
    'bookingNumber',
    'probationOfficerName',
    'probationOfficerPhoneNumber',
    'probationOfficerEmail',
    'probationDivision',
    'authorisingAssistantChiefOfficer',
    'contrabandDetail',
    'vulnerabilityDiversityDetail',
    'licenceConditionsBreached',
    'reasonsForRecall',
    'reasonsForRecallOtherDetail',
    'currentPrison',
  ].forEach((key: string) => {
    values[key] = isDefined(errors[key]) ? '' : unsavedValues[key] || apiValues[key]
  })
  ;['contraband', 'vulnerabilityDiversity'].forEach((key: string) => {
    values[key] = isDefined(errors[key]) ? '' : unsavedValues[key] || (apiValues[`${key}Detail`] ? 'yes' : undefined)
  })
  values = {
    ...values,
    ...recallRecommendation({ agreeWithRecall: values.agreeWithRecall, errors, unsavedValues, apiValues }),
  }
  return values
}
