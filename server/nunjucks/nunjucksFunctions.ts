import nunjucks from 'nunjucks'
import { Response } from 'express'
import { DatePartsParsed, FormError, NamedFormError, ObjectMap, UiListItem, UrlInfo } from '../@types'
import {
  allowedDocumentFileExtensions,
  allowedEmailFileExtensions,
  allowedImageFileExtensions,
  allowedNoteFileExtensions,
} from '../controllers/documents/upload/helpers/allowedUploadExtensions'
import { RecallResponse } from '../@types/manage-recalls-api/models/RecallResponse'
import { DecoratedUploadedDoc, DocumentCategoryMetadata } from '../@types/documents'
import { isRescindInProgress, isStatusNotStopped, wasLastRescindApproved } from '../controllers/utils/recallStatus'
import { makeUrl } from '../controllers/utils/makeUrl'
import { listToString } from '../controllers/utils/lists'
import { isDefined } from '../utils/utils'
import { sensitiveInfo } from '../referenceData/sensitiveInfo'
import { getReferenceDataItemLabel } from '../referenceData'
import { formatDateTimeFromIsoString } from '../controllers/utils/dates/format'
import config from '../config'

export function personOrPeopleFilter(count: number): string {
  if (count === 1) {
    return '1 person'
  }
  return `${count} people`
}

export function userNameFilter(fullName: string): string {
  if (!fullName) {
    return null
  }
  const nameParts = fullName.split(' ')
  if (nameParts.length === 1) {
    return fullName
  }
  return `${nameParts[0][0]}. ${nameParts.reverse()[0]}`
}

export const dateTimeItems = (fieldName: string, values: DatePartsParsed, includeTime?: boolean) => {
  const items = [
    {
      name: `${fieldName}Day`,
      label: 'Day',
      classes: 'govuk-input--width-2',
      attributes: {
        maxlength: 2,
      },
      value: values?.day,
    },
    {
      name: `${fieldName}Month`,
      label: 'Month',
      classes: 'govuk-input--width-2',
      type: 'number',
      attributes: {
        maxlength: 2,
      },
      value: values?.month,
    },
    {
      name: `${fieldName}Year`,
      label: 'Year',
      classes: 'govuk-input--width-4 govuk-!-margin-right-8',
      attributes: {
        maxlength: 4,
      },
      value: values?.year,
    },
  ]
  if (includeTime) {
    return [
      ...items,
      {
        name: `${fieldName}Hour`,
        label: 'Hour',
        classes: 'govuk-input--width-2',
        type: 'number',
        attributes: {
          maxlength: 2,
        },
        value: values?.hour,
      },
      {
        name: `${fieldName}Minute`,
        label: 'Minute',
        classes: 'govuk-input--width-2 govuk-!-margin-right-8',
        attributes: {
          maxlength: 2,
        },
        value: values?.minute,
      },
    ]
  }
  return items
}

export const selectItems = (items?: UiListItem[], currentValue?: string, isAutocomplete?: boolean) => {
  if (!items?.length) {
    return []
  }
  const copyOfItems = items.map(item => ({ ...item }))
  if (currentValue) {
    const selectedItem = copyOfItems.find(item => item.value === currentValue)
    if (selectedItem) {
      selectedItem.selected = true
    }
  }
  return [
    {
      value: '',
      text: isAutocomplete ? '' : 'Select one',
    },
    ...copyOfItems,
  ]
}

export const checkboxItems = (
  items?: UiListItem[],
  currentValues?: string[],
  conditionalContent?: ObjectMap<string>
) => {
  return items.map(item => {
    return {
      ...item,
      checked: currentValues?.includes(item.value) || undefined,
      conditional:
        conditionalContent && conditionalContent[item.value] ? { html: conditionalContent[item.value] } : undefined,
    }
  })
}

export const recallInfoActionMenuItems = (recall: RecallResponse, urlInfo: UrlInfo, fromPage: string) => {
  const changeHistory = {
    text: 'View change history',
    href: makeUrl('change-history', { ...urlInfo, fromPage }),
  }
  const addNote = {
    text: 'Add a note',
    href: makeUrl('add-note', { ...urlInfo, fromPage }),
  }
  const stopRecall = isStatusNotStopped(recall.status)
    ? [
        {
          text: 'Stop recall',
          href: makeUrl('stop-recall', { ...urlInfo, fromPage }),
        },
      ]
    : []
  if (wasLastRescindApproved(recall) === true) {
    return [changeHistory, addNote, ...stopRecall]
  }
  if (isRescindInProgress(recall)) {
    return [
      changeHistory,
      addNote,
      {
        text: 'Update rescind',
        href: makeUrl('rescind-decision', { ...urlInfo, fromPage }),
      },
      ...stopRecall,
    ]
  }
  return [
    changeHistory,
    addNote,
    {
      text: 'Rescind recall',
      href: makeUrl('rescind-request', { ...urlInfo, fromPage }),
    },
    ...stopRecall,
  ]
}

export const filterSelectedItems = (items?: UiListItem[], currentValues?: string[]) =>
  Array.isArray(items) ? items.filter(item => currentValues?.includes(item.value)) : []

export const filterActiveItems = (items?: UiListItem[]) =>
  Array.isArray(items) ? items.filter(item => item.active) : []

export const allowedEmailFileExtensionList = () => allowedEmailFileExtensions.map(ext => ext.extension).join(',')
export const allowedDocumentFileExtensionList = () => allowedDocumentFileExtensions.map(ext => ext.extension).join(',')
export const allowedImageFileExtensionList = () => allowedImageFileExtensions.map(ext => ext.extension).join(',')
export const allowedImageFileTypeLabelList = () =>
  listToString(
    allowedImageFileExtensions.map(ext => ext.label),
    'or'
  )
export const allowedNoteFileExtensionList = () => allowedNoteFileExtensions.map(ext => ext.extension).join(',')
export const allowedNoteFileTypeLabelList = () =>
  listToString(
    allowedNoteFileExtensions.map(ext => ext.label),
    'or'
  )

export const errorMessage = (field: FormError) => (field ? { text: field.text } : undefined)

export const removeUndefinedFromObject = (attributes: ObjectMap<unknown>) => {
  return Object.entries(attributes).reduce((acc, [key, val]) => {
    if (isDefined(val)) {
      acc[key] = val
    }
    return acc
  }, {})
}

export const selectDocCategory = (
  error: FormError,
  file: DecoratedUploadedDoc,
  docCategory: DocumentCategoryMetadata
) => {
  if (error?.values === docCategory.name) {
    return true
  }
  if (!error && file.suggestedCategory === docCategory.name) {
    return true
  }
  return false
}

export const renderTemplateString = (str: string, data: ObjectMap<unknown>): string => nunjucks.renderString(str, data)

export const formatNsyWarrantEmailLink = (recall: RecallResponse) => {
  const email = sensitiveInfo.newScotlandYardPncEmail
  const prisonLabel = getReferenceDataItemLabel('prisons', recall.currentPrison)
  const subject = encodeURIComponent(`RTC - ${recall.firstName} ${recall.lastName} - ${recall.bookingNumber}`)
  const body = encodeURIComponent(
    `Please note that ${recall.firstName} ${recall.lastName} - ${formatDateTimeFromIsoString(
      recall.dateOfBirth
    )}, CRO - ${recall.croNumber}, Booking number - ${
      recall.bookingNumber
    } - was returned to ${prisonLabel} on ${formatDateTimeFromIsoString(
      recall.returnedToCustodyDateTime
    )}. Please remove them from the PNC if this has not already been done.`
  )
  return `mailto:${email}?subject=${subject}&body=${body}`
}

export const makePageTitle = (pageHeading: string, errors?: NamedFormError[]) =>
  `${errors ? 'Error: ' : ''}${pageHeading} - ${config.applicationName}`
