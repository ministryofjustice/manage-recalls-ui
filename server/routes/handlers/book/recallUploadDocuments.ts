import { Request, Response } from 'express'
import { addRecallDocument, getRecallDocument } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { documentTypes } from './documentTypes'
import { UploadedFormFields } from '../../../@types'
import { makeFileData, listFailedUploads, mandatoryDocErrors } from './helpers'
import { uploadStorageFields } from '../helpers/uploadStorage'

export const uploadRecallDocumentsFormHandler = async (req: Request, res: Response) => {
  const { nomsNumber, recallId } = req.params
  const redirectToUploadPage = () => res.redirect(303, req.originalUrl)
  uploadStorageFields(documentTypes)(req, res, async err => {
    if (err) {
      logger.error(err)
      return redirectToUploadPage()
    }
    const { files, session } = req
    const { user } = res.locals
    const fileData = makeFileData(files as UploadedFormFields)
    const docErrors = mandatoryDocErrors(fileData)
    if (docErrors.length) {
      session.errors = docErrors
      redirectToUploadPage()
    }
    const responses = await Promise.allSettled(
      fileData.map(({ fileName, label, ...file }) => addRecallDocument(recallId, file, user.token))
    )
    const failedUploads = listFailedUploads(fileData, responses)
    if (failedUploads.length) {
      session.errors = failedUploads
      return redirectToUploadPage()
    }
    res.redirect(`/persons/${nomsNumber}/recalls/${recallId}/confirmation`)
  })
}

export const getUploadedDocument = async (req: Request, res: Response) => {
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
