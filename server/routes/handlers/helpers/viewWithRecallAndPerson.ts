import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { documentTypes } from '../book/documentTypes'
import { getFormattedMappaLevel, getFormattedProbationDivision, getFormattedRecallLength, isInvalid } from './index'
import { getFormValues } from './getFormValues'

export type ViewName =
  | 'assessConfirmation'
  | 'assessDecision'
  | 'assessRecall'
  | 'recallSentenceDetails'
  | 'recallRequestReceived'
  | 'recallPrisonPolice'
  | 'recallIssuesNeeds'
  | 'recallProbationOfficer'
  | 'recallConfirmation'

export const viewWithRecallAndPerson =
  (viewName: ViewName) =>
  async (req: Request, res: Response): Promise<void> => {
    const { nomsNumber, recallId } = req.params
    if (isInvalid(nomsNumber) || isInvalid(recallId)) {
      res.sendStatus(400)
      return
    }
    const [person, recall] = await Promise.all([
      searchByNomsNumber(nomsNumber as string, res.locals.user.token),
      getRecall(recallId, res.locals.user.token),
    ])
    recall.documents = recall.documents.map(doc => ({
      ...doc,
      ...(documentTypes.find(d => d.name === doc.category) || {}),
      url: `/persons/${nomsNumber}/recalls/${recallId}/documents/${doc.documentId}`,
    }))
    res.locals.recall = {
      ...recall,
      recallLengthFormatted: getFormattedRecallLength(recall.recallLength),
      mappaLevelFormatted: getFormattedMappaLevel(recall.mappaLevel),
      probationDivisionFormatted: getFormattedProbationDivision(recall.probationDivision),
    }
    res.locals.formValues = getFormValues({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: recall,
    })
    res.locals.person = person
    res.render(`pages/${viewName}`)
  }
