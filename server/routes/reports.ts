import { Router } from 'express'
import { reportsView } from '../controllers/reports'
import { downloadReport } from '../controllers/reports/downloadReport'

export const reportsRoutes = (router: Router) => {
  // GET REPORTS
  router.get('/reports', reportsView)
  router.get(`/reports/weekly-recalls-new`, downloadReport)
}
