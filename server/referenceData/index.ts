import { NextFunction, Request, Response } from 'express'
import { mappaLevels } from './mappaLevels'
import { recallLengths } from './recallLengths'
import { reasonsForRecall } from './reasonsForRecall'
import { sensitiveInfo } from './sensitiveInfo'
import { prisons } from './prisons'
import { UiListItem } from '../@types'
import { localDeliveryUnits } from './localDeliveryUnits'
import { courts } from './courts'

export const referenceData = () => ({
  mappaLevels,
  recallLengths,
  reasonsForRecall,
  sensitiveInfo,
  prisons: prisons.data,
  localDeliveryUnits: localDeliveryUnits.data,
  courts: courts.data,
})

export type ReferenceDataCategories =
  | 'mappaLevels'
  | 'recallLengths'
  | 'reasonsForRecall'
  | 'prisons'
  | 'localDeliveryUnits'
  | 'courts'

export const fetchRemoteRefData = async (req: Request, res: Response, next: NextFunction) => {
  await Promise.allSettled([
    prisons.data ? undefined : prisons.updateData(),
    localDeliveryUnits.data ? undefined : localDeliveryUnits.updateData(),
    courts.data ? undefined : courts.updateData(),
  ])
  next()
}

export const getReferenceDataItemLabel = (refDataCategory: ReferenceDataCategories, itemId: string) => {
  const list = (referenceData()[refDataCategory] || []) as UiListItem[]
  return list ? list.find((item: UiListItem) => item.value === itemId)?.text || undefined : undefined
}

export const isStringValidReferenceData = (refDataCategory: ReferenceDataCategories, str: string) => {
  const list = (referenceData()[refDataCategory] || []) as UiListItem[]
  return list.some((item: UiListItem) => item.text === str)
}
