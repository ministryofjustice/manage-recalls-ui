import { DecoratedRecall, FormError, ObjectMap } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { isDefined } from './index'
import { splitIsoDateToParts } from './dates/convert'

/* eslint-disable  @typescript-eslint/no-explicit-any */
interface Args {
  agreeWithRecall?: RecallResponse.agreeWithRecall
  errors: ObjectMap<FormError>
  unsavedValues: ObjectMap<any>
  apiValues: DecoratedRecall
}

const booleanToYesNo = (val: boolean) => {
  if (val === true) return 'YES'
  if (val === false) return 'NO'
  return undefined
}

// special case with Yes / No options, each with a detail field in the front end
// whichever option is selected, its detail field is stored as agreeWithRecallDetail in the API
export const recallRecommendation = ({ agreeWithRecall, errors = {}, unsavedValues = {}, apiValues }: Args) => {
  const vals = {} as any
  if (agreeWithRecall === 'YES') {
    vals.agreeWithRecallDetailYes = isDefined(errors.agreeWithRecallDetailYes)
      ? ''
      : unsavedValues.agreeWithRecallDetailYes || (apiValues.agreeWithRecall && apiValues.agreeWithRecallDetail)
  } else if (agreeWithRecall === 'NO_STOP') {
    vals.agreeWithRecallDetailNo = isDefined(errors.agreeWithRecallDetailNo)
      ? ''
      : unsavedValues.agreeWithRecallDetailNo || apiValues.agreeWithRecallDetail
  }
  return vals
}

export const getFormValues = ({ errors = {}, unsavedValues = {}, apiValues }: Args) => {
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
  } as any

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
  ].forEach((key: string) => {
    values[`${key}Parts`] = errors[key]?.values || unsavedValues[`${key}Parts`] || splitIsoDateToParts(apiValues[key])
  })

  // Text / radio / checkbox fields
  ;[
    'agreeWithRecall',
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
    'licenceConditionsBreached',
    'reasonsForRecall',
    'reasonsForRecallOtherDetail',
    'currentPrison',
    'additionalLicenceConditionsDetail',
    'confirmRecallNotificationEmailSent',
    'confirmDossierEmailSent',
    'differentNomsNumberDetail',
    'previousConvictionMainName',
    'previousConvictionMainNameCategory',
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
  ].forEach((key: string) => {
    values[key] = isDefined(errors[key]) ? '' : unsavedValues[key] || booleanToYesNo(apiValues[key])
  })
  values = {
    ...values,
    ...recallRecommendation({ agreeWithRecall: values.agreeWithRecall, errors, unsavedValues, apiValues }),
  }

  // missing documents detail
  values.missingDocumentsDetail = isDefined(errors.missingDocumentsDetail)
    ? ''
    : unsavedValues.missingDocumentsDetail || apiValues.missingDocumentsRecords?.[0]?.details

  return values
}
