import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber, getUserDetails } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { decorateDocs, isInvalid } from './index'
import { getFormValues } from './getFormValues'
import { getPrisonList } from '../../../data/prisonRegisterClient'
import { ViewName } from '../../../@types'
import {
  getPrisonLabel,
  formatPrisonLists,
  getReferenceDataItemLabel,
  referenceData,
} from './referenceData/referenceData'

const requiresPrisonList = (viewName: ViewName) =>
  ['assessRecall', 'recallPrisonPolice', 'recallSentenceDetails', 'recallCheckAnswers', 'assessPrison'].includes(
    viewName
  )

async function getUserName(userId: string, token: string): Promise<string> {
  try {
    const { firstName, lastName } = await getUserDetails(userId, token)
    return `${firstName} ${lastName}`
  } catch (err) {
    // What do we do if getUserDetails fails?
    return userId
  }
}

export const viewWithRecallAndPerson =
  (viewName: ViewName) =>
  async (req: Request, res: Response): Promise<void> => {
    const { nomsNumber, recallId } = req.params
    if (isInvalid(nomsNumber) || isInvalid(recallId)) {
      res.sendStatus(400)
      return
    }
    const [person, recall, prisonList] = await Promise.all([
      searchByNomsNumber(nomsNumber as string, res.locals.user.token),
      getRecall(recallId, res.locals.user.token),
      requiresPrisonList(viewName) ? getPrisonList() : undefined,
    ])
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
    res.locals.recall.previousConvictionMainName =
      recall.previousConvictionMainName || `${person.firstName} ${person.lastName}`
    if (prisonList) {
      const { all, active } = formatPrisonLists(prisonList)
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
    if (recall.assessedByUserId) {
      res.locals.assessedByUserName = await getUserName(recall.assessedByUserId, res.locals.user.token)
    }
    if (recall.bookedByUserId) {
      res.locals.bookedByUserName = await getUserName(recall.bookedByUserId, res.locals.user.token)
    }
    if (recall.dossierCreatedByUserId) {
      res.locals.dossierCreatedByUserName = await getUserName(recall.dossierCreatedByUserId, res.locals.user.token)
    }
    res.render(`pages/${viewName}`)
  }
