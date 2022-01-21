import { Response } from 'express'
import { UrlInfo } from '../../../../../@types'
import { RecallResponse } from '../../../../../@types/manage-recalls-api/models/RecallResponse'
import { Prisoner } from '../../../../../@types/manage-recalls-api/models/Prisoner'
import { enableDeleteDocuments, uploadedDocCategoriesList } from './index'
import { decorateDocs } from '../../download/helpers/decorateDocs'
import logger from '../../../../../../logger'

export const renderXhrResponse = async ({
  res,
  existingDocIds,
  recallId,
  nomsNumber,
  urlInfo,
  person,
  recall,
}: {
  res: Response
  existingDocIds: string[]
  recallId: string
  nomsNumber: string
  urlInfo: UrlInfo
  person: Prisoner
  recall: RecallResponse
}) => {
  let addToExistingUploads = false
  const allUploadedDocs = recall.documents.filter(doc =>
    uploadedDocCategoriesList().find(item => item.name === doc.category)
  )
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
