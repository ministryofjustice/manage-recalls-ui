import { Router } from 'express'
import { getDocumentChangeHistory } from '../controllers/changeHistory/getDocumentChangeHistory'
import { recallPageGet } from '../controllers/recallPageGet'
import { getSingleFieldChangeHistory } from '../controllers/changeHistory/getSingleFieldChangeHistory'
import { getAllFieldsChangeHistory } from '../controllers/changeHistory/getAllFieldsChangeHistory'
import { basePath } from './index'

export const changeHistoryRoutes = (router: Router) => {
  router.get(`${basePath}/change-history/document`, getDocumentChangeHistory, recallPageGet('changeHistoryForDocument'))
  router.get(`${basePath}/change-history/field`, getSingleFieldChangeHistory, recallPageGet('changeHistoryForField'))
  router.get(`${basePath}/change-history`, getAllFieldsChangeHistory, recallPageGet('changeHistory'))
}
