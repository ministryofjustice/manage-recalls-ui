import { isFuture, isValid } from 'date-fns'
import { NamedFormError, ObjectMap } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'

export const parseDate = ({ year, month, day, hour, minute }: ObjectMap<string>) => {
  try {
    const parts = [year, month, day, hour, minute].map(part => {
      return parseInt(part, 10)
    })
    const date = new Date(parts[0], parts[1] - 1, parts[2], parts[3], parts[4])
    return !isValid(date) || isFuture(date) ? null : date
  } catch (err) {
    return null
  }
}

export const makeErrorObject = ({
  id,
  text,
  values,
}: {
  id: string
  text: string
  values?: ObjectMap<string>
}): NamedFormError => ({
  name: id,
  text,
  href: `${id}`,
  values,
})

export const isInvalid = (value: string): boolean => {
  return !value || (value && typeof value !== 'string')
}

export const getFormattedRecallLength = (recallLength?: RecallResponse.recallLength) => {
  switch (recallLength) {
    case RecallResponse.recallLength.FOURTEEN_DAYS:
      return '14 days'
    case RecallResponse.recallLength.TWENTY_EIGHT_DAYS:
      return '28 days'
    default:
      return ''
  }
}
