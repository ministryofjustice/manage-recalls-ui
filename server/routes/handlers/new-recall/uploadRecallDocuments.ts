import { Request, Response } from 'express'
import multer from 'multer'
import {
  addRecallDocument,
  getRecall,
  searchByNomsNumber,
} from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { documentTypes } from './documentTypes'
import { RecallDocumentUploadError } from '../../../@types'

const storage = multer.memoryStorage()
export const processUploads = multer({ storage }).fields(documentTypes)

export const uploadDocumentsPage = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  const [person, recall] = await Promise.all([
    searchByNomsNumber(nomsNumber, res.locals.user.token),
    getRecall(recallId, res.locals.user.token),
  ])
  res.locals.offender = person
  res.locals.recall = recall
  res.locals.documentTypes = documentTypes
  if (res.locals.errors) {
    res.locals.documentTypes = documentTypes.map(doc => {
      const matchedErr = res.locals.errors.find((err: RecallDocumentUploadError) => err.category === doc.category)
      if (matchedErr) {
        return { ...doc, error: matchedErr.text }
      }
      return { ...doc }
    })
  }
  res.render('pages/uploadDocuments')
}

export const uploadRecallDocumentsHandler = async (req: Request, res: Response) => {
  const { nomsNumber, recallId } = req.params

  const redirectToUploadPage = () => res.redirect(`/persons/${nomsNumber}/recalls/${recallId}`)

  processUploads(req, res, async err => {
    if (err) {
      logger.error(err)
      return redirectToUploadPage()
    }
    const files = Object.entries(req.files).map(([key, [value]]) => {
      const documentType = documentTypes.find(doc => doc.name === key)
      return {
        fileName: value.originalname,
        label: documentType.label,
        category: documentType.category,
        fileContent: value.buffer.toString('base64'),
      }
    })
    const results = await Promise.allSettled(
      files.map(({ fileName, label, ...file }) => addRecallDocument(recallId, file, res.locals.user.token))
    )
    const failedUploads = results
      .map((result, idx) => {
        if (result.status === 'rejected') {
          return {
            category: files[idx].category,
            fileName: files[idx].fileName,
            text: `${files[idx].fileName} - an error occurred during upload`,
          }
        }
        return null
      })
      .filter(Boolean)
    if (failedUploads.length) {
      req.session.errors = failedUploads
      return redirectToUploadPage()
    }
    res.redirect(`/persons/${nomsNumber}/recalls/${recallId}/assess`)
  })
}
