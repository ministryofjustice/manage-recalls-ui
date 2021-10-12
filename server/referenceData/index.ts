import { mappaLevels } from './mappaLevels'
import { recallLengths } from './recallLengths'
import { reasonsForRecall } from './reasonsForRecall'
import { sensitiveInfo } from './sensitiveInfo'
import { prisons } from './prisons'
import { UiListItem } from '../@types'
import { localDeliveryUnits } from './localDeliveryUnits'
import logger from '../../logger'

export const referenceData = () => ({
  mappaLevels,
  recallLengths,
  reasonsForRecall,
  sensitiveInfo,
  prisons: prisons.data,
  localDeliveryUnits: localDeliveryUnits.data,
})

export type ReferenceDataCategories =
  | 'mappaLevels'
  | 'recallLengths'
  | 'reasonsForRecall'
  | 'prisons'
  | 'localDeliveryUnits'

export const fetchRemoteRefData = async () => {
  const [prisonsResult, localDeliveryUnitsResult] = await Promise.allSettled([
    prisons.updateData(),
    localDeliveryUnits.updateData(),
  ])
  if (prisonsResult.status === 'rejected') {
    logger.error('Failed to fetch prisons')
  }
  if (localDeliveryUnitsResult.status === 'rejected') {
    logger.error('Failed to fetch Local Delivery Units')
  }
}

export const getReferenceDataItemLabel = (refDataCategory: ReferenceDataCategories, itemId: string) => {
  const list = (referenceData()[refDataCategory] || []) as UiListItem[]
  return list ? list.find((item: UiListItem) => item.value === itemId)?.text || undefined : undefined
}

export const isStringValidReferenceData = (refDataCategory: ReferenceDataCategories, str: string) => {
  const list = (referenceData()[refDataCategory] || []) as UiListItem[]
  return list.some((item: UiListItem) => item.text === str)
}
