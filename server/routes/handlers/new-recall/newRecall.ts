import { Request, Response } from 'express'
import { viewWithRecallAndPerson } from './viewWithRecallAndPerson'

export const newRecall = async (req: Request, res: Response): Promise<void> => {
  await viewWithRecallAndPerson(req, res, 'pages/newRecall')
}
