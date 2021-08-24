import { FormError, ObjectMap, RecallFormValues } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { isDefined } from './index'
import { splitIsoDateToParts } from './dates'

export const getFormValues = ({
  errors = {},
  unsavedValues = {},
  apiValues,
}: {
  errors: ObjectMap<FormError>
  unsavedValues: ObjectMap<unknown>
  apiValues: RecallResponse
}): RecallFormValues => {
  const values = {
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
  ].forEach((key: string) => {
    values[key] = isDefined(errors[key]) ? '' : unsavedValues[key] || apiValues[key]
  })
  ;['contraband', 'vulnerabilityDiversity'].forEach((key: string) => {
    values[key] = isDefined(errors[key]) ? '' : unsavedValues[key] || (apiValues[`${key}Detail`] ? 'yes' : undefined)
  })
  return values
}
