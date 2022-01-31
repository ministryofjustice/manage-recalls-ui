import { Request, Response } from 'express'
import { getRecall } from '../../../clients/manageRecallsApiClient'
import { formatName, renderErrorMessages, sortList } from './index'
import { getFormValues } from './getFormValues'
import { ViewName } from '../../../@types'
import { referenceData } from '../../../referenceData'
import { dossierDueDateString, recallAssessmentDueText } from './dates/format'
import { enableDeleteDocuments } from '../documents/upload/helpers'
import { decorateDocs } from '../documents/download/helpers/decorateDocs'
import logger from '../../../../logger'

export const viewWithRecall =
  (viewName: ViewName) =>
  async (req: Request, res: Response): Promise<void> => {
    const { nomsNumber, recallId } = req.params
    const [recallResult] = await Promise.allSettled([getRecall(recallId, res.locals.user.token)])
    if (recallResult.status === 'rejected') {
      logger.info('Error getting recall', {
        recallResult: (recallResult as PromiseRejectedResult).reason,
      })
      return res.render('pages/error')
    }
    const recall = recallResult.value
    const decoratedDocs = decorateDocs({
      docs: recall.documents,
      missingDocumentsRecords: recall.missingDocumentsRecords,
      nomsNumber,
      recallId,
      bookingNumber: recall.bookingNumber,
      firstName: recall.firstName,
      lastName: recall.lastName,
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
