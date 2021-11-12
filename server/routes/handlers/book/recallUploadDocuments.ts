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
import { getPerson } from '../helpers/personCache'

const renderXhrResponse = async ({
  res,
  existingDocIds,
  recallId,
  nomsNumber,
  urlInfo,
  token,
}: {
  res: Response
  existingDocIds: string[]
  recallId: string
  nomsNumber: string
  urlInfo: UrlInfo
  token: string
}) => {
  const [personResult, recallResult] = await Promise.allSettled([
    getPerson(nomsNumber as string, token),
    getRecall(recallId, token),
  ])
  if (personResult.status === 'rejected') {
    throw new Error('getPerson failed for NOMS')
  }
  const person = personResult.value
  if (recallResult.status === 'rejected') {
    throw new Error(`getRecall failed for ID ${recallId}`)
  }
  const recall = recallResult.value

  let addToExistingUploads = false
  const allUploadedDocs = recall.documents
    .filter(doc => uploadedDocCategoriesList().find(item => item.name === doc.category))
    .map((doc, index) => ({ ...doc, index }))
  let lastUploadedDocs = allUploadedDocs
  if (existingDocIds) {
    lastUploadedDocs = allUploadedDocs.filter(uploadedDoc => !existingDocIds.includes(uploadedDoc.documentId))
    addToExistingUploads = allUploadedDocs.length > lastUploadedDocs.length
  }
  const decoratedDocs = decorateDocs({
    docs: lastUploadedDocs,
    nomsNumber,
    recallId,
    bookingNumber: recall.bookingNumber,
    ...person,
  })
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

      // new uploads
      const uploadWasClicked = body.upload === 'upload'
      if (req.files) {
        const uploadedFileData = getMetadataForUploadedFiles(files as Express.Multer.File[])
        const { errors: invalidFileTypeErrors, valuesToSave: uploadsToSave } =
          validateUploadedFileTypes(uploadedFileData)
        session.errors = invalidFileTypeErrors
        const failedUploads = await saveUploadedFiles({ uploadsToSave, recallId, token })
        if (failedUploads.length) {
          session.errors = [...(session.errors || []), ...failedUploads]
        }
      }

      // category changes - will result in a full page reload
      const saveCategoryChanges = body.continue === 'continue'
      if (saveCategoryChanges) {
        const categorisedFileData = getMetadataForCategorisedFiles(body)
        const { errors: uncategorisedFileErrors, valuesToSave: categorisedToSave } =
          validateCategories(categorisedFileData)
        if (uncategorisedFileErrors?.length) {
          session.errors = [...(session.errors || []), ...uncategorisedFileErrors]
        }
        const failedSaves = await saveCategories({ recallId, categorisedToSave, token })
        if (failedSaves.length) {
          session.errors = [...(session.errors || []), ...failedSaves]
        }
      }

      // redirect / reload
      if (uploadWasClicked || (session.errors && session.errors.length)) {
        return reload()
      }
      // only render a response for XHR if there were no errors
      if (req.xhr) {
        const { existingDocIds } = body
        const parsed = JSON.parse(existingDocIds)
        return renderXhrResponse({ res, existingDocIds: parsed, recallId, nomsNumber, urlInfo, token })
      }

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
