import type { Router } from 'express'
import { findPerson } from '../controllers/findPerson/findPerson'
import { createRecall } from '../controllers/book/createRecall'
import { recallList } from '../controllers/recallList/recallList'
import { recallPageGet } from '../controllers/recallPageGet'
import { parseUrlParams } from '../middleware/parseUrlParams'
import { fetchRemoteRefData } from '../referenceData'
import { checkUserDetailsExist } from '../middleware/checkUserDetailsExist'
import { getStoredSessionData } from '../middleware/getStoredSessionData'
import { serviceMetricsDashboard } from '../controllers/serviceMetrics'
import { bookRoutes } from './book'
import { assessRoutes } from './assess'
import { primaryDossierRoutes } from './primaryDossier'
import { documentsRoutes } from './documents'
import { changeHistoryRoutes } from './changeHistory'
import { notesRoutes } from './notes'
import { stopRescindRoutes } from './stopRescind'
import { partbRoutes } from './partb'
import { secondaryDossierRoutes } from './secondaryDossier'
import { userDetailsRoutes } from './userDetails'
import { reportsRoutes } from './reports'

export const basePath = '/recalls/:recallId'

export default function routes(router: Router): Router {
  userDetailsRoutes(router)
  router.get('/', checkUserDetailsExist, getStoredSessionData, recallList)
  router.get('/find-person', getStoredSessionData, findPerson)
  router.get('/service-metrics', serviceMetricsDashboard)
  reportsRoutes(router)
  router.post('/recalls', createRecall)

  // ROUTES USING A recallId PARAMETER
  // getStoredSessionData must come after parseUrlParams
  router.use(`${basePath}/:pageSlug`, parseUrlParams, getStoredSessionData, fetchRemoteRefData)

  router.get(`${basePath}/view-recall`, recallPageGet('viewFullRecall'))
  bookRoutes(router)
  assessRoutes(router)
  primaryDossierRoutes(router)
  documentsRoutes(router)
  changeHistoryRoutes(router)
  notesRoutes(router)
  stopRescindRoutes(router)
  partbRoutes(router)
  secondaryDossierRoutes(router)

  return router
}
