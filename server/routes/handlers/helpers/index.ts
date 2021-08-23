import { NamedFormError, ObjectMap } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'

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
  href: `#${id}`,
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

export const getFormattedMappaLevel = (mappaLevel?: RecallResponse.mappaLevel) => {
  switch (mappaLevel) {
    case RecallResponse.mappaLevel.CONFIRMATION_REQUIRED:
      return 'Confirmation required'
    case RecallResponse.mappaLevel.LEVEL_1:
      return 'Level 1'
    case RecallResponse.mappaLevel.LEVEL_2:
      return 'Level 2'
    case RecallResponse.mappaLevel.LEVEL_3:
      return 'Level 3'
    case RecallResponse.mappaLevel.NA:
      return 'N/A'
    case RecallResponse.mappaLevel.NOT_KNOWN:
      return 'Not known'
    default:
      return ''
  }
}

export const getFormattedProbationDivision = (probationDivision?: RecallResponse.probationDivision) => {
  switch (probationDivision) {
    case RecallResponse.probationDivision.MIDLANDS:
      return 'Midlands'
    case RecallResponse.probationDivision.LONDON:
      return 'London'
    case RecallResponse.probationDivision.NORTH_EAST:
      return 'North East'
    case RecallResponse.probationDivision.NORTH_WEST:
      return 'North West'
    case RecallResponse.probationDivision.WALES:
      return 'Wales'
    case RecallResponse.probationDivision.SOUTH_EAST:
      return 'South East'
    case RecallResponse.probationDivision.SOUTH_WEST_CENTRAL:
      return 'South West and South Central'
    default:
      return ''
  }
}

export const isDefined = (val: unknown) => typeof val !== 'undefined'
