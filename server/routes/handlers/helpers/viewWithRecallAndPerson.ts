import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber, getUserDetails } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { decorateDocs, isDefined, isInvalid } from './index'
import { getFormValues } from './getFormValues'
import { getPrisonList } from '../../../data/prisonRegisterClient'
import { ViewName } from '../../../@types'
import {
  getPrisonLabel,
  formatPrisonLists,
  getReferenceDataItemLabel,
  referenceData,
} from './referenceData/referenceData'
import { RecallResponse } from '../../../@types/manage-recalls-api'
import logger from '../../../../logger'

const requiresPrisonList = (viewName: ViewName) =>
  ['assessRecall', 'recallPrisonPolice', 'recallSentenceDetails', 'recallCheckAnswers', 'assessPrison'].includes(
    viewName
  )

const requiresUser = (viewName: ViewName) => ['assessRecall'].includes(viewName)

const getUserName = async (userId: string, token: string): Promise<string> => {
  try {
    const { firstName, lastName } = await getUserDetails(userId, token)
    return `${firstName} ${lastName}`
  } catch (err) {
    // What do we do if getUserDetails fails?
    return userId
  }
}

interface UserNames {
  assessedByUserName?: string
  bookedByUserName?: string
  dossierCreatedByUserName?: string
}

const getUserNames = async (recall: RecallResponse, token: string): Promise<UserNames> => {
  const { assessedByUserId, bookedByUserId, dossierCreatedByUserId } = recall
  const [assessedByResult, bookedByResult, dossierCreatedByResult] = await Promise.allSettled([
    assessedByUserId ? getUserName(assessedByUserId, token) : undefined,
    bookedByUserId ? getUserName(bookedByUserId, token) : undefined,
    dossierCreatedByUserId ? getUserName(dossierCreatedByUserId, token) : undefined,
  ])
  const result = {} as UserNames
  if (assessedByResult && assessedByResult.status === 'fulfilled') {
    result.assessedByUserName = assessedByResult.value
  }
  if (bookedByResult && bookedByResult.status === 'fulfilled') {
    result.bookedByUserName = bookedByResult.value
  }
  if (dossierCreatedByResult && dossierCreatedByResult.status === 'fulfilled') {
    result.dossierCreatedByUserName = dossierCreatedByResult.value
  }
  return result
}

export const viewWithRecallAndPerson =
  (viewName: ViewName) =>
  async (req: Request, res: Response): Promise<void> => {
    const { nomsNumber, recallId } = req.params
    if (isInvalid(nomsNumber) || isInvalid(recallId)) {
      res.sendStatus(400)
      return
    }
    const [personResult, recallResult, prisonListResult] = await Promise.allSettled([
      searchByNomsNumber(nomsNumber as string, res.locals.user.token),
      getRecall(recallId, res.locals.user.token),
      requiresPrisonList(viewName) ? getPrisonList() : undefined,
    ])
    if (personResult.status === 'rejected') {
      throw new Error(`searchByNomsNumber failed for NOMS ${nomsNumber}`)
    }
    const person = personResult.value
    if (recallResult.status === 'rejected') {
      throw new Error(`getRecall failed for ID ${recallId}`)
    }
    const recall = recallResult.value
    const decoratedDocs = decorateDocs({ docs: recall.documents, nomsNumber, recallId })
    res.locals.recall = {
      ...recall,
      ...decoratedDocs,
    }
    // get values to preload into form inputs
    res.locals.formValues = getFormValues({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: res.locals.recall,
    })
    res.locals.person = person
    res.locals.referenceData = referenceData
    res.locals.recall.recallLengthFormatted = getReferenceDataItemLabel('recallLengths', recall.recallLength)
    res.locals.recall.mappaLevelFormatted = getReferenceDataItemLabel('mappaLevels', recall.mappaLevel)
    res.locals.recall.localDeliveryUnitFormatted = getReferenceDataItemLabel(
      'localDeliveryUnits',
      recall.localDeliveryUnit
    )
    if (viewName === 'recallProbationOfficer') {
      logger.info(`Probation page - localDeliveryUnit for ${recallId}: ${recall.localDeliveryUnit}`)
    }
    res.locals.recall.previousConvictionMainName =
      recall.previousConvictionMainName || `${person.firstName} ${person.lastName}`
    if (prisonListResult && prisonListResult.status === 'fulfilled' && isDefined(prisonListResult.value)) {
      const { all, active } = formatPrisonLists(prisonListResult.value)
      res.locals.referenceData.prisonList = all
      res.locals.referenceData.activePrisonList = active
      res.locals.recall.currentPrisonFormatted = getPrisonLabel(
        res.locals.referenceData.activePrisonList,
        res.locals.recall.currentPrison
      )
      res.locals.recall.lastReleasePrisonFormatted = getPrisonLabel(
        res.locals.referenceData.prisonList,
        res.locals.recall.lastReleasePrison
      )
    }
    if (requiresUser(viewName)) {
      const userNames = await getUserNames(res.locals.recall, res.locals.user.token)
      res.locals.recall = { ...res.locals.recall, ...userNames }
    }
    res.render(`pages/${viewName}`)
  }
