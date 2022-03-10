import { Request, Response } from 'express'
import { getRecall } from '../clients/manageRecallsApiClient'
import { formatPersonName } from './utils/person'
import { getFormValues } from './utils/getFormValues'
import { ViewName } from '../@types'
import { referenceData } from '../referenceData'
import { dossierDueDateString, recallAssessmentDueText } from './utils/dates/format'
import { enableDeleteDocuments } from './documents/upload/helpers'
import { decorateDocs } from './documents/download/helpers/decorateDocs'
import { renderErrorMessages } from './utils/errorMessages'
import { sortList } from './utils/lists'
import { decorateMissingDocumentsRecords, decorateRescindRecords, decorateNotes } from './documents/download/helpers'

export const recallPageGet =
  (viewName: ViewName) =>
  async (req: Request, res: Response): Promise<void> => {
    const { recallId } = req.params
    const recall = await getRecall(recallId, res.locals.user.token)
    const decoratedDocs = decorateDocs({
      docs: recall.documents,
      recall,
      versionedCategoryName: req.query.versionedCategoryName as string,
    })

    res.locals.recall = {
      ...recall,
      ...decoratedDocs,
      missingDocumentsRecords: decorateMissingDocumentsRecords({
        missingDocumentsRecords: recall.missingDocumentsRecords,
        recallId,
      }),
      rescindRecords: decorateRescindRecords({ rescindRecords: recall.rescindRecords, recallId }),
      notes: decorateNotes({ notes: recall.notes, recallId }),
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
    res.locals.recall.fullName = formatPersonName({
      category: recall.licenceNameCategory,
      recall,
    })

    res.locals.recall.previousConvictionMainName = formatPersonName({
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
