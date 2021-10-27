import { Request, Response } from 'express'
import { getRecall, getStoredDocument } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { documentCategories } from './documentCategories'
import {
  decorateDocs,
  getMetadataForCategorisedFiles,
  getMetadataForUploadedFiles,
  saveCategories,
  saveUploadedFiles,
} from '../helpers/documents'
import { uploadStorageArray } from '../helpers/uploadStorage'
import { validateCategories, validateUploadedFileTypes } from './helpers/validateDocuments'

const renderXhrResponse = async ({
  res,
  recallId,
  nomsNumber,
  token,
}: {
  res: Response
  recallId: string
  nomsNumber: string
  token: string
}) => {
  const recall = await getRecall(recallId, token)
  const decoratedDocs = decorateDocs({ docs: recall.documents, nomsNumber, recallId })
  res.render(
    'partials/uploadedDocumentsStatus',
    {
      recall: {
        ...recall,
        ...decoratedDocs,
      },
    },
    (err, html) => {
      if (err) {
        logger.error(err)
        throw err
      }
      return res.json({
        success: html,
      })
    }
  )
}

export const uploadRecallDocumentsFormHandler = async (req: Request, res: Response) => {
  const reload = () => {
    if (req.xhr) {
      return res.json({ reload: true })
    }
    return res.redirect(303, req.originalUrl)
  }
  const { recallId, nomsNumber } = req.params
  uploadStorageArray('documents')(req, res, async uploadError => {
    try {
      if (uploadError) {
        throw uploadError
      }
      const { files, session, body } = req
      const {
        user: { token },
        urlInfo,
      } = res.locals
      const continueWasClicked = body.continue === 'continue'
      const uploadWasClicked = req.body.upload === 'upload'
      // add metadata for uploaded / recategorised files
      const uploadedFileData = getMetadataForUploadedFiles(files as Express.Multer.File[])
      let categorisedFileData
      if (continueWasClicked) {
        categorisedFileData = getMetadataForCategorisedFiles(body)
      }
      // validate
      const { errors: invalidFileTypeErrors, valuesToSave: uploadsToSave } = validateUploadedFileTypes(uploadedFileData)
      const { errors: uncategorisedFileErrors, valuesToSave: categorisedToSave } =
        validateCategories(categorisedFileData)
      if (invalidFileTypeErrors?.length || uncategorisedFileErrors?.length) {
        session.errors = [...(invalidFileTypeErrors || []), ...(uncategorisedFileErrors || [])]
      }
      // save to API
      const failedUploads = await saveUploadedFiles({ uploadsToSave, recallId, token })
      if (failedUploads.length) {
        session.errors = [...(session.errors || []), ...failedUploads]
      }
      const failedSaves = await saveCategories({ recallId, categorisedToSave, token })
      if (failedSaves.length) {
        session.errors = [...(session.errors || []), ...failedSaves]
      }
      // redirect / reload
      if (uploadWasClicked || (session.errors && session.errors.length)) {
        return reload()
      }
      // only render a response for XHR if there were no errors
      if (req.xhr) {
        return renderXhrResponse({ res, recallId, nomsNumber, token })
      }
      // if (
      //   continueWasClicked &&
      //   listMissingRequiredDocs([...uploadedFileData, ...categorisedFileData].map(f => f.category)).length
      // ) {
      //   return res.redirect(303, `${urlInfo.basePath}missing-documents`)
      // }
      res.redirect(303, `${urlInfo.basePath}${urlInfo.fromPage || 'check-answers'}`)
    } catch (e) {
      logger.error(e)
      req.session.errors = [
        {
          name: 'saveError',
          text: 'An error occurred saving your changes',
        },
      ]
      reload()
    }
  })
}

export const downloadUploadedDocumentOrEmail = async (req: Request, res: Response) => {
  const { recallId, documentId } = req.params
  const { user } = res.locals
  const response = await getStoredDocument(recallId, documentId, user.token)
  const documentCategory = documentCategories.find(type => type.name === response.category)
  if (documentCategory.type === 'document') {
    res.contentType('application/pdf')
    res.header('Content-Disposition', `inline; filename="${documentCategory.fileName || response.fileName}"`)
  }
  if (documentCategory.type === 'email') {
    res.contentType('application/octet-stream')
    res.header('Content-Disposition', `attachment; filename="${response.fileName}"`)
  }
  res.send(Buffer.from(response.content, 'base64'))
}
