import { mappaLevels } from './mappaLevels'
import { probationDivisions } from './probationDivisions'
import { recallLengths } from './recallLengths'
import { reasonsForRecall } from './reasonsForRecall'
import { SelectItem } from '../../../../@types'

export const referenceData = {
  mappaLevels,
  probationDivisions,
  recallLengths,
  reasonsForRecall,
}

export type ReferenceDataCategories = 'mappaLevels' | 'probationDivisions' | 'recallLengths' | 'reasonsForRecall'

export const getReferenceDataItemLabel = (refDataCategory: ReferenceDataCategories, itemId: string) => {
  const list = referenceData[refDataCategory] as SelectItem[]
  return list ? list.find((item: SelectItem) => item.value === itemId)?.text || undefined : undefined
}
