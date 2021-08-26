import { mappaLevels } from './mappaLevels'
import { probationDivisions } from './probationDivisions'
import { recallLengths } from './recallLengths'
import { reasonsForRecall } from './reasonsForRecall'
import { UiListItem } from '../../../../@types'

export const referenceData = {
  mappaLevels,
  probationDivisions,
  recallLengths,
  reasonsForRecall,
}

export type ReferenceDataCategories = 'mappaLevels' | 'probationDivisions' | 'recallLengths' | 'reasonsForRecall'

export const getReferenceDataItemLabel = (refDataCategory: ReferenceDataCategories, itemId: string) => {
  const list = referenceData[refDataCategory] as UiListItem[]
  return list ? list.find((item: UiListItem) => item.value === itemId)?.text || undefined : undefined
}
