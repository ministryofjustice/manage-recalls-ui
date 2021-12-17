import { DatePartsParsed, FormError, ObjectMap, UiListItem, UrlInfo } from '../@types'
import {
  allowedDocumentFileExtensions,
  allowedEmailFileExtensions,
  allowedImageFileExtensions,
} from '../routes/handlers/documents/upload/helpers/allowedUploadExtensions'
import { isDefined, listToString } from '../routes/handlers/helpers'
import { RecallResponse } from '../@types/manage-recalls-api/models/RecallResponse'
import { DecoratedDocument, DocumentCategoryMetadata } from '../@types/documents'

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

export const backLinkUrl = (path: string, { fromPage, fromHash, basePath }: UrlInfo) => {
  if (path.startsWith('/')) {
    return `${path}${fromHash ? `#${fromHash}` : ''}`
  }
  if (fromPage) {
    return `${basePath}${fromPage}${fromHash ? `#${fromHash}` : ''}`
  }
  return `${basePath}${path}`
}

export const makeUrl = (routeSuffix: string, { fromPage, fromHash, basePath }: UrlInfo, csrfToken?: string) => {
  const fromPageQueryParam = fromPage ? `fromPage=${fromPage}` : undefined
  const csrfQueryParam = csrfToken ? `_csrf=${csrfToken}` : undefined
  const queryParams = [fromPageQueryParam, csrfQueryParam].filter(Boolean).join('&')
  return `${basePath}${routeSuffix}${queryParams ? `?${queryParams}` : ''}${fromHash ? `#${fromHash}` : ''}`
}

export const changeLinkUrl = (
  pageSlug: string,
  { currentPage, basePath }: UrlInfo,
  fromHash: string,
  toHash?: string,
  queryString?: string
) => {
  const queryParam = currentPage
    ? `?fromPage=${currentPage}&fromHash=${fromHash}${queryString ? `&${queryString}` : ''}`
    : ''
  return `${basePath}${pageSlug}${queryParam}${toHash ? `#${toHash}` : ''}`
}

export const errorMessage = (field: FormError) => (field ? { text: field.text } : undefined)

export const removeUndefinedFromObject = (attributes: ObjectMap<unknown>) => {
  return Object.entries(attributes).reduce((acc, [key, val]) => {
    if (isDefined(val)) {
      acc[key] = val
    }
    return acc
  }, {})
}

export const recallStatusTagProperties = (status: RecallResponse.status) => {
  const defaults = {
    classes: `govuk-tag--orange`,
    attributes: {
      'data-qa': 'recallStatus',
    },
  }
  switch (status) {
    case RecallResponse.status.DOSSIER_ISSUED:
      return {
        ...defaults,
        text: 'Dossier complete',
        classes: `govuk-tag--green`,
      }
    case RecallResponse.status.BEING_BOOKED_ON:
      return {
        ...defaults,
        text: 'Booking in progress',
      }
    case RecallResponse.status.BOOKED_ON:
      return {
        ...defaults,
        text: 'Booking complete',
      }
    case RecallResponse.status.IN_ASSESSMENT:
      return {
        ...defaults,
        text: 'Assessment in progress',
      }
    case RecallResponse.status.RECALL_NOTIFICATION_ISSUED:
      return {
        ...defaults,
        text: 'Assessment complete',
      }
    case RecallResponse.status.DOSSIER_IN_PROGRESS:
      return {
        ...defaults,
        text: 'Dossier in progress',
      }
    case RecallResponse.status.STOPPED:
      return {
        ...defaults,
        text: 'Stopped',
        classes: `govuk-tag--red`,
      }
    default:
      return {
        text: 'Unknown status',
      }
  }
}

export const selectDocCategory = (error: FormError, file: DecoratedDocument, docCategory: DocumentCategoryMetadata) => {
  if (error?.values === docCategory.name) {
    return true
  }
  if (!error && file.suggestedCategory === docCategory.name) {
    return true
  }
  return false
}
