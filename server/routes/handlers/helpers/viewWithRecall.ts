import { Request, Response } from 'express'
import { getRecall } from '../../../clients/manageRecallsApiClient'
import { formatName, renderErrorMessages, sortList } from './index'
import { getFormValues } from './getFormValues'
import { ViewName } from '../../../@types'
import { referenceData } from '../../../referenceData'
import { dossierDueDateString, recallAssessmentDueText } from './dates/format'
import { enableDeleteDocuments } from '../documents/upload/helpers'
import { decorateDocs } from '../documents/download/helpers/decorateDocs'

export const viewWithRecall =
  (viewName: ViewName) =>
  async (req: Request, res: Response): Promise<void> => {
    const { recallId } = req.params
    const recall = await getRecall(recallId, res.locals.user.token)
    const decoratedDocs = decorateDocs({
      docs: recall.documents,
      missingDocumentsRecords: recall.missingDocumentsRecords,
      rescindRecords: recall.rescindRecords,
      recall,
      versionedCategoryName: req.query.versionedCategoryName as string,
    })
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

    res.locals.referenceData = referenceData()

    // person name
    res.locals.recall.fullName = formatName({
      category: recall.licenceNameCategory,
      recall,
    })

    res.locals.recall.previousConvictionMainName = formatName({
      category: recall.previousConvictionMainNameCategory,
      otherName: recall.previousConvictionMainName,
      recall,
    })

    // sort any last known addresses
    res.locals.recall.lastKnownAddresses = sortList(recall.lastKnownAddresses, 'index', true)

    // TODO - use nunjucks filters to format these from the views
    res.locals.recall.recallAssessmentDueText = recallAssessmentDueText(recall.recallAssessmentDueDateTime)
    res.locals.recall.dossierDueText = dossierDueDateString(recall.dossierTargetDate)

    // render errors after all data is available on res.locals
    res.locals.errors = renderErrorMessages(res.locals.errors, res.locals)

    res.render(`pages/${viewName}`)
  }
