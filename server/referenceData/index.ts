import { NextFunction, Request, Response } from 'express'
import { mappaLevels } from './mappaLevels'
import { recallLengths } from './recallLengths'
import { reasonsForRecall } from './reasonsForRecall'
import { sensitiveInfo } from './sensitiveInfo'
import { prisons } from './prisons'
import { policeForces } from './policeForces'
import { UiListItem } from '../@types'
import { localDeliveryUnits } from './localDeliveryUnits'
import { courts } from './courts'
import { stopReasons } from './stopReasons'

export const referenceData = () => ({
  mappaLevels: mappaLevels.data,
  recallLengths,
  reasonsForRecall: reasonsForRecall.data,
  sensitiveInfo,
  prisons: prisons.data,
  policeForces: policeForces.data,
  localDeliveryUnits: localDeliveryUnits.data,
  courts: courts.data,
  stopReasons: stopReasons.data,
})

export type ReferenceDataCategories =
  | 'mappaLevels'
  | 'recallLengths'
  | 'reasonsForRecall'
  | 'prisons'
  | 'policeForces'
  | 'localDeliveryUnits'
  | 'courts'
  | 'stopReasons'

export const fetchRemoteRefData = async (req: Request, res: Response, next: NextFunction) => {
  await Promise.allSettled([
    prisons.data ? undefined : prisons.updateData(),
    policeForces.data ? undefined : policeForces.updateData(),
    localDeliveryUnits.data ? undefined : localDeliveryUnits.updateData(),
    courts.data ? undefined : courts.updateData(),
    reasonsForRecall.data ? undefined : reasonsForRecall.updateData(),
    mappaLevels.data ? undefined : mappaLevels.updateData(),
    stopReasons.data ? undefined : stopReasons.updateData(),
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

export { reasonForRecall } from './reasonsForRecall'
