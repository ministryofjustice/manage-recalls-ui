import { Request, Response } from 'express'
import { viewWithRecallAndPerson } from './viewWithRecallAndPerson'

export const recallType = async (req: Request, res: Response): Promise<void> => {
  await viewWithRecallAndPerson(req, res, 'pages/recallType')
}
