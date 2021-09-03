import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { decorateDocs, isInvalid } from './index'
import { getFormValues } from './getFormValues'
import { getActivePrisonList } from '../../../data/prisonRegisterClient'
import { Prison, ViewName } from '../../../@types'
import { getPrisonLabel, getReferenceDataItemLabel, referenceData } from './referenceData/referenceData'

const requiresPrisonList = (viewName: ViewName) =>
  ['assessRecall', 'recallPrisonPolice', 'recallSentenceDetails', 'assessPrison'].includes(viewName)

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
      requiresPrisonList(viewName) ? getActivePrisonList() : undefined,
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
    res.locals.recall.probationDivisionFormatted = getReferenceDataItemLabel(
      'probationDivisions',
      recall.probationDivision
    )
    if (prisonList) {
      res.locals.referenceData.prisonList = prisonList.map(({ prisonId, prisonName }: Prison) => ({
        value: prisonId,
        text: prisonName,
      }))
      res.locals.recall.currentPrisonFormatted = getPrisonLabel(prisonList, res.locals.recall.currentPrison)
      res.locals.recall.lastReleasePrisonFormatted = getPrisonLabel(prisonList, res.locals.recall.lastReleasePrison)
    }
    res.render(`pages/${viewName}`)
  }
