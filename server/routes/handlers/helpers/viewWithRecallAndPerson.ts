import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { documentTypes } from '../book/documentTypes'
import { isInvalid } from './index'
import { getFormValues } from './getFormValues'
import { getActivePrisonList } from '../../../data/prisonRegisterClient'
import { Prison } from '../../../@types'
import { getPrisonLabel, getReferenceDataItemLabel, referenceData } from './referenceData/referenceData'

export type ViewName =
  | 'assessConfirmation'
  | 'assessDecision'
  | 'assessPrison'
  | 'assessRecall'
  | 'assessLicence'
  | 'assessEmail'
  | 'recallSentenceDetails'
  | 'recallRequestReceived'
  | 'recallPrisonPolice'
  | 'recallIssuesNeeds'
  | 'recallProbationOfficer'
  | 'recallConfirmation'
  | 'dossierLetter'
  | 'dossierConfirmation'

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
    recall.documents = recall.documents
      .map(doc => ({
        ...doc,
        ...(documentTypes.find(d => d.name === doc.category) || {}),
        url: `/persons/${nomsNumber}/recalls/${recallId}/documents/${doc.documentId}`,
      }))
      .filter(doc => doc.type === 'document')
    res.locals.recall = {
      ...recall,
      recallLengthFormatted: getReferenceDataItemLabel('recallLengths', recall.recallLength),
      mappaLevelFormatted: getReferenceDataItemLabel('mappaLevels', recall.mappaLevel),
      probationDivisionFormatted: getReferenceDataItemLabel('probationDivisions', recall.probationDivision),
    }
    res.locals.formValues = getFormValues({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recall,
    })
    res.locals.person = person
    res.locals.referenceData = referenceData
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
