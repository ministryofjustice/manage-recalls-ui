import { DecoratedRecall, FormError, ObjectMap } from '../../@types'
import { splitIsoDateToParts } from './dates/convert'
import { isDefined } from '../../utils/utils'
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

export const getFormValues = ({ errors = {}, unsavedValues = {}, apiValues }: GetFormValuesArgs) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let values = {
    sentenceLengthParts: errors.sentenceLength?.values || unsavedValues.sentenceLengthParts || apiValues.sentenceLength,
    recallNotificationEmailFileName:
      errors.recallNotificationEmailFileName?.values ||
      unsavedValues.recallNotificationEmailFileName ||
      apiValues.emailsUploaded?.RECALL_NOTIFICATION_EMAIL?.fileName,
    dossierEmailFileName:
      errors.dossierEmailFileName?.values ||
      unsavedValues.dossierEmailFileName ||
      apiValues.emailsUploaded?.DOSSIER_EMAIL?.fileName,
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
    'rescindRequestDetail',
    'warrantReferenceNumber',
    'recommendedRecallType',
    'subject',
    'details',
    'fileName',
  ].forEach((key: string) => {
    values[key] = isDefined(errors[key]) ? errors[key].values || '' : unsavedValues[key] || apiValues[key]
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
  // missing documents detail
  values.missingDocumentsDetail = isDefined(errors.missingDocumentsDetail)
    ? ''
    : unsavedValues.missingDocumentsDetail || apiValues.missingDocumentsRecords?.[0]?.details

  return values
}
