import { Request, Response } from 'express'
import multer from 'multer'
import { addRecallDocument } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { documentTypes } from './documentTypes'

const storage = multer.memoryStorage()
export const processUploads = multer({ storage }).fields(documentTypes)

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
