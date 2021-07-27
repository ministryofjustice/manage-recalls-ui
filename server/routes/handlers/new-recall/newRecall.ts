import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { documentTypes } from './documentTypes'
import { RecallDocumentUploadError } from '../../../@types'

export const newRecall = async (req: Request, res: Response): Promise<void> => {
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
  res.render('pages/newRecall')
}
