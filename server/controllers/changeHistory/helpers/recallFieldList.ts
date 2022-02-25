import { ObjectMap, RecallField } from '../../../@types'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'
import { FieldAuditSummary } from '../../../@types/manage-recalls-api/models/FieldAuditSummary'
import { FieldAuditEntry, SentenceLength } from '../../../@types/manage-recalls-api'
import { getReferenceDataItemLabel } from '../../../referenceData'
import { formatDateTimeFromIsoString } from '../../utils/dates/format'
import { findDocCategory } from '../../documents/upload/helpers'
import { sortList } from '../../utils/lists'

// this uses the key names from the RecallResponse interface, but the field types are more specific
export const recallFieldList: ObjectMap<RecallField> = {
  // date / times
  recallEmailReceivedDateTime: {
    label: 'Recall email received',
    fieldType: 'ISO_DATE_TIME',
  },
  recallNotificationEmailSentDateTime: {
    label: 'Recall notification email sent',
    fieldType: 'ISO_DATE_TIME',
  },
  sentenceDate: {
    label: 'Date of sentence',
    fieldType: 'ISO_DATE',
  },
  lastReleaseDate: {
    label: 'Latest release date',
    fieldType: 'ISO_DATE',
  },
  dossierEmailSentDate: {
    label: 'Dossier and letter sent',
    fieldType: 'ISO_DATE',
  },
  sentenceExpiryDate: {
    label: 'Sentence expiry date',
    fieldType: 'ISO_DATE',
  },
  licenceExpiryDate: {
    label: 'Licence expiry date',
    fieldType: 'ISO_DATE',
  },
  conditionalReleaseDate: {
    label: 'Conditional release date',
    fieldType: 'ISO_DATE',
  },
  returnedToCustodyDateTime: {
    label: 'RTC date and time',
    fieldType: 'ISO_DATE_TIME',
  },
  returnedToCustodyNotificationDateTime: {
    label: 'Found out RTC date and time',
    fieldType: 'ISO_DATE_TIME',
  },

  // booleans
  hasDossierBeenChecked: {
    label: 'Confirmed dossier and letter is correct',
    fieldType: 'BOOLEAN',
  },
  additionalLicenceConditions: {
    label: 'Licence conditions breached',
    fieldType: 'BOOLEAN',
  },
  differentNomsNumber: {
    label: 'Different NOMIS number',
    fieldType: 'BOOLEAN',
  },
  contraband: {
    label: 'Contraband',
    fieldType: 'BOOLEAN',
  },
  vulnerabilityDiversity: {
    label: 'Vulnerability and diversity',
    fieldType: 'BOOLEAN',
  },
  arrestIssues: {
    label: 'Arrest issues',
    fieldType: 'BOOLEAN',
  },

  // text / enums / refdata
  currentPrison: {
    label: 'Prison held in',
    fieldType: 'REF_DATA',
    refDataCategory: 'prisons',
  },
  agreeWithRecall: {
    label: 'Agree with recall recommendation',
    fieldType: 'ENUM', // YES / NO_STOP
    enumValues: {
      YES: 'Yes',
      NO_STOP: 'No, stop the recall',
    },
  },
  agreeWithRecallDetail: {
    label: 'Agree with recall recommendation detail',
    fieldType: 'TEXT',
  },
  lastReleasePrison: {
    label: 'Releasing prison',
    fieldType: 'REF_DATA',
    refDataCategory: 'prisons',
  },
  mappaLevel: {
    label: 'MAPPA level',
    fieldType: 'REF_DATA',
    refDataCategory: 'mappaLevels',
  },
  sentencingCourt: {
    label: 'Sentencing court',
    fieldType: 'REF_DATA',
    refDataCategory: 'courts',
  },
  indexOffence: {
    label: 'Index offence',
    fieldType: 'TEXT',
  },
  localPoliceForceId: {
    label: 'Local police force',
    fieldType: 'REF_DATA',
    refDataCategory: 'policeForces',
  },
  bookingNumber: {
    label: 'Booking number',
    fieldType: 'TEXT',
  },
  probationOfficerName: {
    label: 'Probation officer name',
    fieldType: 'TEXT',
  },
  probationOfficerPhoneNumber: {
    label: 'Probation officer phone number',
    fieldType: 'TEXT',
  },
  probationOfficerEmail: {
    label: 'Probation officer email address',
    fieldType: 'TEXT',
  },
  localDeliveryUnit: {
    label: 'Local Delivery Unit',
    fieldType: 'REF_DATA',
    refDataCategory: 'localDeliveryUnits',
  },
  authorisingAssistantChiefOfficer: {
    label: 'ACO',
    fieldType: 'TEXT',
  },
  contrabandDetail: {
    label: 'Contraband detail',
    fieldType: 'TEXT',
  },
  vulnerabilityDiversityDetail: {
    label: 'Vulnerability and diversity detail',
    fieldType: 'TEXT',
  },
  arrestIssuesDetail: {
    label: 'Arrest issues detail',
    fieldType: 'TEXT',
  },
  licenceConditionsBreached: {
    label: 'Licence conditions breached detail',
    fieldType: 'TEXT',
  },
  reasonsForRecall: {
    label: 'Reasons for recall',
    fieldType: 'REF_DATA_LIST',
    refDataCategory: 'reasonsForRecall',
  },
  reasonsForRecallOtherDetail: {
    label: 'Reasons for recall - other',
    fieldType: 'TEXT',
  },
  additionalLicenceConditionsDetail: {
    label: 'Additional licence conditions',
    fieldType: 'TEXT',
  },
  confirmRecallNotificationEmailSent: {
    fieldType: 'ENUM', // YES / NO
  },
  confirmDossierEmailSent: {
    fieldType: 'ENUM', // YES / NO
  },
  differentNomsNumberDetail: {
    label: 'Different NOMIS number detail',
    fieldType: 'TEXT',
  },
  previousConvictionMainName: {
    label: 'Name on pre-cons - other',
    fieldType: 'TEXT',
  },
  licenceNameCategory: {
    label: 'Name',
    fieldType: 'ENUM',
    enumValues: {
      FIRST_LAST: 'First & last name',
      FIRST_MIDDLE_LAST: 'First, middle & last name',
    },
  },
  lastKnownAddressOption: {
    label: 'Has last known address',
    fieldType: 'ENUM',
    enumValues: {
      YES: 'Yes',
      NO_FIXED_ABODE: 'No fixed abode',
    },
  },
  previousConvictionMainNameCategory: {
    label: 'Name on pre-cons',
    fieldType: 'ENUM',
    enumValues: {
      FIRST_LAST: 'First & last name',
      FIRST_MIDDLE_LAST: 'First, middle & last name',
      OTHER: 'Other name',
    },
  },

  sentenceYears: {
    label: 'Length of sentence (years)',
    fieldType: 'TEXT',
  },
  sentenceMonths: {
    label: 'Length of sentence (months)',
    fieldType: 'TEXT',
  },
  sentenceDays: {
    label: 'Length of sentence (days)',
    fieldType: 'TEXT',
  },
  warrantReferenceNumber: {
    label: 'Warrant reference number',
    fieldType: 'TEXT',
  },
  // uploaded emails
  recallRequestEmailUploaded: {
    fieldType: 'UPLOADED_EMAIL',
    documentCategory: RecallDocument.category.RECALL_REQUEST_EMAIL,
  },
  recallNotificationSentEmailUploaded: {
    fieldType: 'UPLOADED_EMAIL',
    documentCategory: RecallDocument.category.RECALL_NOTIFICATION_EMAIL,
  },
  recallType: {
    label: 'Name',
    fieldType: 'ENUM',
    enumValues: {
      STANDARD: 'Standard',
      FIXED: 'Fixed',
    },
  },
  dossierSentEmailUploaded: {
    fieldType: 'UPLOADED_EMAIL',
    documentCategory: RecallDocument.category.DOSSIER_EMAIL,
  },
  nsySentEmailUploaded: {
    fieldType: 'UPLOADED_EMAIL',
    documentCategory: RecallDocument.category.NSY_REMOVE_WARRANT_EMAIL,
  },
}

export const formatRecallFieldValue = ({
  record,
  fieldName,
}: {
  record: FieldAuditEntry
  fieldName: string
}): string => {
  const fieldTypeData = recallFieldList[fieldName]
  if (!fieldTypeData) {
    throw new Error(`formatRecallFieldValue - unknown field type: ${fieldName}`)
  }
  if (!fieldTypeData.label) {
    throw new Error(
      `formatRecallFieldValue - field type can't be formatted as it's not intended for display (no label): ${fieldName}`
    )
  }
  switch (fieldTypeData.fieldType) {
    case 'BOOLEAN':
      return record.updatedValue === true ? 'Yes' : 'No'
    case 'REF_DATA':
      return getReferenceDataItemLabel(fieldTypeData.refDataCategory, record.updatedValue)
    case 'REF_DATA_LIST':
      return record.updatedValue
        .map((value: string) => getReferenceDataItemLabel(fieldTypeData.refDataCategory, value))
        .sort()
        .join(', ')
    case 'ISO_DATE_TIME':
      return formatDateTimeFromIsoString(record.updatedValue)
    case 'ISO_DATE':
      return formatDateTimeFromIsoString(record.updatedValue, true)
    case 'ENUM':
      return fieldTypeData.enumValues[record.updatedValue]
    default:
      return record.updatedValue
  }
}

export const formatSentenceLength = (sentenceLength: SentenceLength) => {
  const { years, months, days } = sentenceLength
  return `${years ? `${years} years ` : ''}${months ? `${months} months ` : ''}${days ? `${days} days ` : ''}`
}

const changedFieldProps = ({
  id,
  value,
  changedFields,
  uploadedDocuments,
}: {
  id: string
  value: RecallField
  changedFields: FieldAuditSummary[]
  uploadedDocuments?: RecallDocument[]
}) => {
  if (value.fieldType === 'UPLOADED_EMAIL') {
    const uploadedDoc = uploadedDocuments.find(doc => doc.category === value.documentCategory)
    const docCategory = findDocCategory(value.documentCategory)
    return uploadedDoc
      ? {
          label: docCategory.label,
          updatedByUserName: uploadedDoc.createdByUserName,
          updatedDateTime: uploadedDoc.createdDateTime,
          hasHistory: true,
        }
      : {
          hasHistory: false,
        }
  }
  const changedField = changedFields.find(field => field.fieldName === id)
  return changedField
    ? {
        updatedByUserName: changedField.updatedByUserName,
        updatedDateTime: changedField.updatedDateTime,
        hasHistory: true,
      }
    : {
        hasHistory: false,
      }
}

export const changeHistoryFieldList = ({
  changedFields,
  uploadedDocuments,
}: {
  changedFields: FieldAuditSummary[]
  uploadedDocuments: RecallDocument[]
}) => {
  const list = Object.entries(recallFieldList)
    .map(([id, value]) => {
      const changedField = changedFields.find(field => field.fieldName === id)
      return {
        id,
        ...value,
        fieldPath: changedField ? changedField.fieldPath : id,
        ...changedFieldProps({ id, value, changedFields, uploadedDocuments }),
      }
    })
    .filter(field => field.label)
  return sortList(list, 'label')
}

export const recallFieldLabel = (fieldName: string) => recallFieldList[fieldName]?.label
