import { Request, Response } from 'express'
import { deleteRecallDocument, getRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import {
  enableDeleteDocuments,
  getMetadataForCategorisedFiles,
  getMetadataForUploadedFiles,
  saveCategories,
  saveUploadedFiles,
  uploadedDocCategoriesList,
} from '../helpers/documents'
import { uploadStorageArray } from '../helpers/uploadStorage'
import { validateCategories, validateUploadedFileTypes } from './helpers/validateDocuments'
import { UrlInfo } from '../../../@types'
import { decorateDocs } from '../helpers/documents/decorateDocs'
import { UploadedFileMetadata } from '../../../@types/documents'

const renderXhrResponse = async ({
  res,
  uploadsToSave,
  recallId,
  nomsNumber,
  urlInfo,
  token,
}: {
  res: Response
  uploadsToSave: UploadedFileMetadata[]
  recallId: string
  nomsNumber: string
  urlInfo: UrlInfo
  token: string
}) => {
  const recall = await getRecall(recallId, token)
  const allUploadedDocs = recall.documents
    .filter(doc => uploadedDocCategoriesList().find(item => item.name === doc.category))
    .map((doc, index) => ({ ...doc, index }))
  const lastUploadedDocs = uploadsToSave.map(uploadToSave =>
    allUploadedDocs
      .reverse()
      .find(
        uploadedDoc =>
          uploadToSave.category === uploadedDoc.category && uploadToSave.originalFileName === uploadedDoc.fileName
      )
  )
  const addToExistingUploads = allUploadedDocs.length > lastUploadedDocs.length
  const decoratedDocs = decorateDocs({ docs: lastUploadedDocs, nomsNumber, recallId })
  res.render(
    'partials/uploadedDocumentsStatus',
    {
      recall: {
        ...recall,
        ...decoratedDocs,
        enableDeleteDocuments: enableDeleteDocuments(recall.status, urlInfo),
        addToExistingUploads,
      },
    },
    (err, html) => {
      if (err) {
        logger.error(err)
        throw err
      }
      return res.json({
        success: html,
        addToExistingUploads,
      })
    }
  )
}

const deleteDocument = async (
  documentId: string,
  recallId: string,
  urlInfo: UrlInfo,
  token: string,
  req: Request,
  res: Response
) => {
  const recall = await getRecall(recallId, token)
  const document = recall.documents.find(doc => doc.documentId === documentId)
  if (!enableDeleteDocuments(recall.status, urlInfo)) {
    throw new Error(`Attempted to delete a document when fromPage was set to: ${urlInfo.fromPage}`)
  }
  await deleteRecallDocument(recallId, documentId, token)
  req.session.confirmationMessage = {
    text: `${document.fileName} has been deleted`,
    type: 'success',
  }
  return res.redirect(303, req.originalUrl)
}

export const uploadRecallDocumentsFormHandler = async (req: Request, res: Response) => {
  const reload = () => {
    if (req.xhr) {
      return res.json({ reload: true })
    }
    return res.redirect(303, req.originalUrl)
  }

  uploadStorageArray('documents')(req, res, async uploadError => {
    try {
      if (uploadError) {
        throw uploadError
      }
      const { recallId, nomsNumber } = req.params
      const { files, session, body } = req
      const {
        user: { token },
        urlInfo,
      } = res.locals

      const deleteWasClicked = Boolean(body.delete)
      if (deleteWasClicked) {
        return await deleteDocument(body.delete, recallId, urlInfo, token, req, res)
      }
      const continueWasClicked = body.continue === 'continue'
      const uploadWasClicked = body.upload === 'upload'
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
        return renderXhrResponse({ res, uploadsToSave, recallId, nomsNumber, urlInfo, token })
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
