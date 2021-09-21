import { mappaLevels } from './mappaLevels'
import { localDeliveryUnits } from './localDeliveryUnits'
import { recallLengths } from './recallLengths'
import { reasonsForRecall } from './reasonsForRecall'
import { sensitiveInfo } from './sensitiveInfo'
import { Prison, UiListItem } from '../../../../@types'

export const referenceData = {
  mappaLevels,
  localDeliveryUnits,
  recallLengths,
  reasonsForRecall,
  sensitiveInfo,
}

export type ReferenceDataCategories = 'mappaLevels' | 'localDeliveryUnits' | 'recallLengths' | 'reasonsForRecall'

export const getReferenceDataItemLabel = (refDataCategory: ReferenceDataCategories, itemId: string) => {
  const list = referenceData[refDataCategory] as UiListItem[]
  return list ? list.find((item: UiListItem) => item.value === itemId)?.text || undefined : undefined
}

export const getPrisonLabel = (prisonList: UiListItem[], currentPrison: string) =>
  prisonList.find(item => item.value === currentPrison)?.text

export const formatPrisonLists = (prisonList: Prison[]) => {
  const all = prisonList.map(({ prisonId, prisonName, active }: Prison) => ({
    value: prisonId,
    text: prisonName,
    active,
  }))
  return {
    all,
    active: all.filter(prison => prison.active),
  }
}
