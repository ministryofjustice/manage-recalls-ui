import { format, parseISO } from 'date-fns'
import { DatePartsParsed } from '../@types'

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

export function dateTimeFilter(date: string) {
  try {
    return format(parseISO(date), "d MMM yyyy 'at' HH:mm")
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