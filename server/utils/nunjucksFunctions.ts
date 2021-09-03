import { format, parseISO } from 'date-fns'
import { DatePartsParsed, ObjectMap, UiListItem } from '../@types'
import { splitIsoDateToParts } from '../routes/handlers/helpers/dates'

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

export function dateFilter(date: string) {
  try {
    return format(parseISO(date), 'd MMM yyyy')
  } catch (err) {
    return ''
  }
}

const monthNames = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

const leftPadZeros = (num: number): string => num.toString().padStart(2, '0')

export function dateTimeFilter(isoString: string) {
  try {
    const { year, month, day, hour, minute } = splitIsoDateToParts(isoString)
    return `${day} ${monthNames[month - 1]} ${year} at ${leftPadZeros(hour)}:${leftPadZeros(minute)}`
  } catch (err) {
    return ''
  }
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

export const selectItems = (items?: UiListItem[], currentValue?: string) => {
  if (!items?.length) {
    return []
  }
  const copyOfItems = [...items]
  if (currentValue) {
    const selectedItem = copyOfItems.find(item => item.value === currentValue)
    if (selectedItem) {
      selectedItem.selected = true
    }
  }
  return [
    {
      value: '',
      text: 'Select one',
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
