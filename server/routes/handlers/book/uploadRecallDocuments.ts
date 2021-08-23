import { Request, Response } from 'express'
import multer from 'multer'
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

const storage = multer.memoryStorage()
export const processUploads = multer({ storage }).fields(documentTypes)

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
  processUploads(req, res, async err => {
    if (err) {
      logger.error(err)
      return redirectToUploadPage()
    }
    const { files, session } = req
    const { user } = res.locals
    const fileData = makeFileData(files as UploadedFormFields)
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

export const downloadDocument = async (req: Request, res: Response) => {
  const { recallId, documentId } = req.params
  const { user } = res.locals
  const response = await getRecallDocument(recallId, documentId, user.token)
  res.type('application/pdf')
  res.header('Content-Disposition', `attachment; filename="${response.category.toLowerCase()}.pdf"`)
  res.send(Buffer.from(response.content, 'base64'))
}
