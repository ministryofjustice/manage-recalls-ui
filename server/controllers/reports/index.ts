import { Request, Response } from 'express'

export const reportsView = async (req: Request, res: Response): Promise<Response | void> => {
  res.locals.isReportingPage = true
  res.render('pages/reports')
}
