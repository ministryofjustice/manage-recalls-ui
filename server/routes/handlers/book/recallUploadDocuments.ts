import { Request, Response } from 'express'
import {
  addRecallDocument,
  getRecall,
  searchByNomsNumber,
  getRecallDocument,
} from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { documentTypes } from './documentTypes'
import { UploadedFormFields } from '../../../@types'
import { addErrorsToDocuments, makeFileData, listFailedUploads } from './helpers'
import { uploadStorageFields } from '../helpers/uploadStorage'

export const uploadDocumentsPage = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  const { user, errors } = res.locals
  const [person, recall] = await Promise.all([
    searchByNomsNumber(nomsNumber, user.token),
    getRecall(recallId, user.token),
  ])
  res.locals.person = person
  res.locals.recall = recall
  res.locals.documentTypes = errors ? addErrorsToDocuments(errors.list) : [...documentTypes]
  res.render('pages/uploadDocuments')
}

export const uploadRecallDocumentsFormHandler = async (req: Request, res: Response) => {
  const { nomsNumber, recallId } = req.params
  const redirectToUploadPage = () => res.redirect(`/persons/${nomsNumber}/recalls/${recallId}/upload-documents`)
  uploadStorageFields(documentTypes)(req, res, async err => {
    if (err) {
      logger.error(err)
      return redirectToUploadPage()
    }
    const { files, session } = req
    const { user } = res.locals
    let failedUploads
    const fileData = makeFileData(files as UploadedFormFields)
    if (fileData.length) {
      const responses = await Promise.allSettled(
        fileData.map(({ fileName, label, ...file }) => addRecallDocument(recallId, file, user.token))
      )
      failedUploads = listFailedUploads(fileData, responses)
    }
    if (!fileData.length || failedUploads.length) {
      session.errors = []
      if (!fileData.length) {
        session.errors.push({
          text: 'You must upload at least one document',
          name: 'documents',
        })
      }
      if (failedUploads?.length) {
        session.errors = [...session.errors, ...failedUploads]
      }
      return redirectToUploadPage()
    }
    res.redirect(`/persons/${nomsNumber}/recalls/${recallId}/confirmation`)
  })
}

export const downloadDocument = async (req: Request, res: Response) => {
  const { recallId, documentId } = req.params
  const { user } = res.locals
  const response = await getRecallDocument(recallId, documentId, user.token)
  const documentType = documentTypes.find(type => type.name === response.category)
  if (documentType.type === 'document') {
    res.contentType('application/pdf')
    res.header('Content-Disposition', `inline; filename="${response.category.toLowerCase()}.pdf"`)
  }
  if (documentType.type === 'email') {
    res.contentType('application/octet-stream')
    res.header('Content-Disposition', `attachment; filename="${response.fileName}"`)
  }
  res.send(Buffer.from(response.content, 'base64'))
}
