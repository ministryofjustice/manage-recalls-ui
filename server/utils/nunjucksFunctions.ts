import { DatePartsParsed, ObjectMap, UiListItem, UrlInfo } from '../@types'
import {
  allowedDocumentFileExtensions,
  allowedEmailFileExtensions,
} from '../routes/handlers/helpers/allowedUploadExtensions'

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
      value: values?.day.toString(),
    },
    {
      name: `${fieldName}Month`,
      label: 'Month',
      classes: 'govuk-input--width-2',
      type: 'number',
      attributes: {
        maxlength: 2,
      },
      value: values?.month.toString(),
    },
    {
      name: `${fieldName}Year`,
      label: 'Year',
      classes: 'govuk-input--width-4 govuk-!-margin-right-8',
      attributes: {
        maxlength: 4,
      },
      value: values?.year.toString(),
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
        value: values?.hour.toString(),
      },
      {
        name: `${fieldName}Minute`,
        label: 'Minute',
        classes: 'govuk-input--width-2 govuk-!-margin-right-8',
        attributes: {
          maxlength: 2,
        },
        value: values?.minute.toString(),
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
  items.filter(item => currentValues?.includes(item.value))

export const allowedEmailFileExtensionList = () => allowedEmailFileExtensions.map(ext => ext.extension).join(',')
export const allowedDocumentFileExtensionList = () => allowedDocumentFileExtensions.map(ext => ext.extension).join(',')

export const backLinkUrl = (path: string, { fromPage, fromHash, basePath }: UrlInfo) => {
  if (fromPage) {
    return `${basePath}${fromPage}${fromHash ? `#${fromHash}` : ''}`
  }
  if (path.startsWith('/')) {
    return path
  }
  return `${basePath}${path}`
}

export const formActionUrl = (pageSlug: string, { fromPage, fromHash, basePath }: UrlInfo, csrfToken?: string) => {
  const fromPageQueryParam = fromPage ? `fromPage=${fromPage}` : undefined
  const csrfQueryParam = csrfToken ? `_csrf=${csrfToken}` : undefined
  const queryParams = [fromPageQueryParam, csrfQueryParam].filter(Boolean).join('&')
  return `${basePath}${pageSlug}${queryParams ? `?${queryParams}` : ''}${fromHash ? `#${fromHash}` : ''}`
}

export const changeLinkUrl = (
  pageSlug: string,
  { currentPage, basePath }: UrlInfo,
  fromHash: string,
  toHash?: string
) => {
  const queryParam = currentPage ? `?fromPage=${currentPage}&fromHash=${fromHash}` : ''
  return `${basePath}${pageSlug}${queryParam}${toHash ? `#${toHash}` : ''}`
}
