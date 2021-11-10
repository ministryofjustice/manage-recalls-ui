import { Request, Response } from 'express'
import { getRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { renderErrorMessages } from './index'
import { getFormValues } from './getFormValues'
import { ViewName } from '../../../@types'
import { referenceData } from '../../../referenceData'
import { getUserNames } from './getUserNames'
import { dossierDueDateString, recallAssessmentDueText } from './dates/format'
import { enableDeleteDocuments } from './documents'
import { decorateDocs } from './documents/decorateDocs'
import logger from '../../../../logger'
import { getPerson } from './personCache'

const requiresUser = (viewName: ViewName) =>
  ['assessRecall', 'dossierRecallInformation', 'viewFullRecall'].includes(viewName)

export const viewWithRecallAndPerson =
  (viewName: ViewName) =>
  async (req: Request, res: Response): Promise<void> => {
    const { nomsNumber, recallId } = req.params
    const [personResult, recallResult] = await Promise.allSettled([
      getPerson(nomsNumber as string, res.locals.user.token),
      getRecall(recallId, res.locals.user.token),
    ])
    if (personResult.status === 'rejected') {
      logger.error(`searchByNomsNumber failed for NOMS`)
    }
    res.locals.person = personResult.status === 'fulfilled' ? personResult.value : { nomsNumber }
    if (recallResult.status === 'rejected') {
      throw new Error(`getRecall failed for ID ${recallId}`)
    }
    const recall = recallResult.value
    const decoratedDocs = decorateDocs({ docs: recall.documents, nomsNumber, recallId })
    res.locals.recall = {
      ...recall,
      ...decoratedDocs,
      enableDeleteDocuments: enableDeleteDocuments(recall.status, res.locals.urlInfo),
    }
    // get values to preload into form inputs
    res.locals.formValues = getFormValues({
      errors: res.locals.errors,
      unsavedValues: res.locals.unsavedValues,
      apiValues: res.locals.recall,
    })
    res.locals.errors = renderErrorMessages(res.locals.errors, res.locals)

    res.locals.referenceData = referenceData()

    res.locals.recall.previousConvictionMainName =
      recall.previousConvictionMainName || `${res.locals.person.firstName} ${res.locals.person.lastName}`

    // TODO - use nunjucks filters to format these from the views
    res.locals.recall.recallAssessmentDueText = recallAssessmentDueText(recall.recallAssessmentDueDateTime)
    res.locals.recall.dossierDueText = dossierDueDateString(recall.dossierTargetDate)

    if (requiresUser(viewName)) {
      const userNames = await getUserNames(res.locals.recall, res.locals.user.token)
      res.locals.recall = { ...res.locals.recall, ...userNames }
    }
    res.render(`pages/${viewName}`)
  }
