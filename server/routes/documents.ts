import { Router } from 'express'
import { recallPageGet } from '../controllers/recallPageGet'
import { newGeneratedDocumentVersion } from '../controllers/documents/generated/newGeneratedDocumentVersion'
import { createGeneratedDocument } from '../controllers/documents/generated/createGeneratedDocument'
import { downloadDocumentOrEmail } from '../controllers/documents/download/downloadDocumentOrEmail'
import { basePath } from './index'

export const documentsRoutes = (router: Router) => {
  router.get(`${basePath}/generated-document-version`, recallPageGet('newGeneratedDocumentVersion'))
  router.post(`${basePath}/generated-document-version`, newGeneratedDocumentVersion)

  // GENERATE AND DOWNLOAD A NEW RECALL NOTIFICATION, DOSSIER OR LETTER TO PRISON
  router.get(`${basePath}/documents/create`, createGeneratedDocument, downloadDocumentOrEmail)

  // DOWNLOAD AN EXISTING UPLOADED DOCUMENT, EMAIL, OR GENERATED DOCUMENT
  router.get(`${basePath}/documents/:documentId`, downloadDocumentOrEmail)
}
