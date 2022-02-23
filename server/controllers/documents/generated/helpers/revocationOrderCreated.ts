import { Request } from 'express'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { GenerateDocumentRequest } from '../../../../@types/manage-recalls-api/models/GenerateDocumentRequest'
import { generateRecallDocument } from '../../../../clients/manageRecallsApiClient'
import { getGeneratedDocumentFileName } from './index'

export const revocationOrderCreated = async ({
  recallId,
  valuesToSave,
  dossierExists,
  req,
  token,
}: {
  recallId: string
  valuesToSave: GenerateDocumentRequest
  dossierExists: boolean
  req: Request
  token: string
}) => {
  const recallNotificationFileName = await getGeneratedDocumentFileName({
    category: RecallDocument.category.RECALL_NOTIFICATION,
    recallId,
    token,
  })
  const dossierFileName = await getGeneratedDocumentFileName({
    category: RecallDocument.category.DOSSIER,
    recallId,
    token,
  })
  const [recallNotificationResponse, dossierResponse] = await Promise.allSettled([
    generateRecallDocument(
      recallId,
      { ...valuesToSave, category: RecallDocument.category.RECALL_NOTIFICATION, fileName: recallNotificationFileName },
      token
    ),
    dossierExists
      ? generateRecallDocument(
          recallId,
          { ...valuesToSave, category: RecallDocument.category.DOSSIER, fileName: dossierFileName },
          token
        )
      : undefined,
  ])
  if (recallNotificationResponse.status === 'rejected') {
    req.session.errors = [
      {
        name: 'saveError',
        text: 'An error occurred creating a new recall notification',
      },
    ]
    throw new Error('newGeneratedDocumentVersion - recall notification creation failed')
  }
  if (dossierResponse && dossierResponse.status === 'rejected') {
    req.session.errors = [
      {
        name: 'saveError',
        text: 'An error occurred creating a new dossier',
      },
    ]
    throw new Error('newGeneratedDocumentVersion - dossier creation failed')
  }
}
