import { DecoratedRecall, FormError, ObjectMap } from '../../@types'
import { splitIsoDateToParts } from './dates/convert'
import { getProperty, isDefined } from '../../utils/utils'
import { confirmRecallTypeDetailFields } from './confirmRecallTypeDetailFields'
import { RecallResponse } from '../../@types/manage-recalls-api/models/RecallResponse'

export interface GetFormValuesArgs {
  errors: ObjectMap<FormError>
  unsavedValues: ObjectMap<unknown>
  apiValues: DecoratedRecall
}

const booleanToYesNo = (val: boolean) => {
  if (val === true) return 'YES'
  if (val === false) return 'NO'
  return undefined
}

// field names used in the templates, validation and formValues, use underscore _ to indicate a nested property
// eg legalRepresentativeInfo_fullName would be accessed on the API response as legalRepresentativeInfo.fullName
// this utility converts _ to .
const fieldNameToApiKey = (fieldName: string) => fieldName.replace(/_/g, '.')

export const getFormValues = ({ errors = {}, unsavedValues = {}, apiValues }: GetFormValuesArgs) => {
  let values = {
    sentenceLengthParts: errors.sentenceLength?.values || unsavedValues.sentenceLengthParts || apiValues.sentenceLength,
  } as ObjectMap<unknown>

  // dates / times
  ;[
    'recallEmailReceivedDateTime',
    'lastReleaseDate',
    'sentenceDate',
    'sentenceExpiryDate',
    'licenceExpiryDate',
    'recallNotificationEmailSentDateTime',
    'conditionalReleaseDate',
    'dossierEmailSentDate',
    'rescindRequestEmailReceivedDate',
    'returnedToCustodyDateTime',
    'returnedToCustodyNotificationDateTime',
  ].forEach((key: string) => {
    values[`${key}Parts`] = errors[key]?.values || unsavedValues[`${key}Parts`] || splitIsoDateToParts(apiValues[key])
  })

  // Text / radio / checkbox fields
  ;[
    'confirmedRecallType',
    'lastReleasePrison',
    'mappaLevel',
    'sentencingCourt',
    'indexOffence',
    'localPoliceForceId',
    'bookingNumber',
    'probationOfficerName',
    'probationOfficerPhoneNumber',
    'probationOfficerEmail',
    'localDeliveryUnit',
    'authorisingAssistantChiefOfficer',
    'contrabandDetail',
    'vulnerabilityDiversityDetail',
    'arrestIssuesDetail',
    'licenceConditionsBreached',
    'reasonsForRecall',
    'reasonsForRecallOtherDetail',
    'currentPrison',
    'additionalLicenceConditionsDetail',
    'confirmRecallNotificationEmailSent',
    'confirmDossierEmailSent',
    'confirmNsyEmailSent',
    'differentNomsNumberDetail',
    'previousConvictionMainName',
    'previousConvictionMainNameCategory',
    'licenceNameCategory',
    'lastKnownAddressOption',
    'warrantReferenceNumber',
    'recommendedRecallType',
    'legalRepresentativeInfo_fullName',
    'legalRepresentativeInfo_email',
    'legalRepresentativeInfo_phoneNumber',
    'seniorProbationOfficerInfo_fullName',
    'seniorProbationOfficerInfo_email',
    'seniorProbationOfficerInfo_phoneNumber',
    'seniorProbationOfficerInfo_functionalEmail',
  ].forEach((key: string) => {
    values[key] = isDefined(errors[key])
      ? errors[key].values || ''
      : unsavedValues[key] || getProperty(apiValues, fieldNameToApiKey(key))
  })

  // Yes / no options - stored as booleans in the API, but sent as 'YES' / 'NO' values in the front end
  ;[
    'additionalLicenceConditions',
    'differentNomsNumber',
    'hasDossierBeenChecked',
    'contraband',
    'vulnerabilityDiversity',
    'arrestIssues',
    'inCustodyAtBooking',
    'inCustodyAtAssessment',
    'rereleaseSupported',
  ].forEach((key: string) => {
    values[key] = isDefined(errors[key]) ? '' : unsavedValues[key] || booleanToYesNo(apiValues[key])
  })
  values = {
    ...values,
    ...confirmRecallTypeDetailFields({
      confirmedRecallType: values.confirmedRecallType as RecallResponse.recommendedRecallType,
      errors,
      unsavedValues,
      apiValues,
    }),
  }

  // These text properties will never use the API value because each time the form is used it's to add a new record, not edit an existing one
  // Subject and details are for notes
  ;[
    'rescindRequestDetail',
    'missingDocumentsDetail',
    'subject',
    'details',
    'partBReceivedDateParts',
    'partBDetails',
  ].forEach((key: string) => {
    values[key] = isDefined(errors[key]) ? errors[key].values || '' : unsavedValues[key] || undefined
  })

  return values
}
