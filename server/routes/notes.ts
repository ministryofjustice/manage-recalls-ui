import { Router } from 'express'
import { recallPageGet } from '../controllers/recallPageGet'
import { combinedDocumentAndFormSave } from '../controllers/combinedDocumentAndFormSave'
import { validateAddNote } from '../controllers/note/validators/validateAddNote'
import { addNote } from '../clients/manageRecallsApiClient'
import { basePath } from './index'

export const notesRoutes = (router: Router) => {
  router.get(`${basePath}/add-note`, recallPageGet('addNote'))
  router.post(
    `${basePath}/add-note`,
    combinedDocumentAndFormSave({
      uploadFormFieldName: 'fileName',
      validator: validateAddNote,
      saveToApiFn: addNote,
    })
  )
}
