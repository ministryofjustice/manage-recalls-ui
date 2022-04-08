import { Request, Response } from 'express'

export const reportsView = async (req: Request, res: Response): Promise<Response | void> => {
  res.render('pages/reports')
}
