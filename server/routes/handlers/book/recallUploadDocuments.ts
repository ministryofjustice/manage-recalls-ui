import { Request, Response } from 'express'
import logger from '../../../../logger'
import {
  getMetadataForCategorisedFiles,
  getMetadataForUploadedFiles,
  listMissingRequiredDocs,
  saveCategories,
  saveUploadedFiles,
} from '../helpers/documents'
import { uploadStorageArray } from '../helpers/uploadStorage'
import { validateCategories, validateUploadedFileTypes } from './helpers/validateDocuments'
import { deleteDocument } from './helpers/deleteDocument'
import { renderXhrResponse } from './helpers/uploadRenderXhrResponse'
import { getPersonAndRecall } from '../helpers/fetch/getPersonAndRecall'
import { makeUrl } from '../../../utils/nunjucksFunctions'
import { makeErrorObject } from '../helpers'

export const uploadRecallDocumentsFormHandler = async (req: Request, res: Response) => {
  const reload = ({ versionedCategoryName }: { versionedCategoryName: string }) => {
    if (req.xhr) {
      return res.json({ reload: true })
    }
    const url = versionedCategoryName
      ? `${req.originalUrl}&versionedCategoryName=${versionedCategoryName}`
      : req.originalUrl
    return res.redirect(303, url)
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

      const categorisedFileData = getMetadataForCategorisedFiles(body)
      const isAddNewVersionPage = body.forceCategory
      // new uploads
      const uploadWasClicked = body.upload === 'upload'
      // ensure there's an upload if we're on the add new version page
      if (isAddNewVersionPage && !req.files.length) {
        session.errors = [
          makeErrorObject({
            id: 'documents',
            text: 'Select a file',
          }),
        ]
      }
      if (req.files.length) {
        const uploadedFileData = getMetadataForUploadedFiles(files as Express.Multer.File[], body.forceCategory)
        const { errors: invalidFileTypeErrors, valuesToSave: uploadsToSave } = validateUploadedFileTypes(
          uploadedFileData,
          categorisedFileData
        )
        session.errors = invalidFileTypeErrors
        const failedUploads = await saveUploadedFiles({ uploadsToSave, recallId, token })
        if (failedUploads.length) {
          session.errors = [...(session.errors || []), ...failedUploads]
        }
      }

      // category changes - will result in a full page reload
      // no need to do this if we're not on the add new version page
      const continueWasClicked = body.continue === 'continue' && !isAddNewVersionPage
      if (continueWasClicked) {
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
        return reload({ versionedCategoryName: body.forceCategory })
      }
      const { person, recall } = await getPersonAndRecall({ recallId, nomsNumber, token })
      // only render a response for XHR if there were no errors
      if (req.xhr) {
        const { existingDocIds } = body
        const parsed = JSON.parse(existingDocIds)
        return renderXhrResponse({ res, existingDocIds: parsed, recallId, nomsNumber, urlInfo, person, recall })
      }

      if (continueWasClicked && listMissingRequiredDocs(recall.documents).length) {
        // if the user came from a recall info page, add querystring so they'll be redirected back there after missing documents page
        return res.redirect(303, makeUrl('missing-documents', urlInfo))
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
      reload({ versionedCategoryName: req.body.forceCategory })
    }
  })
}
