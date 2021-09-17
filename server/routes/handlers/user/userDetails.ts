import { Request, Response } from 'express'
import { addUserDetails } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

export const getUserDetails = async (req: Request, res: Response): Promise<void> => {
  res.render(`pages/userDetails`)
}

export const postUserDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = res.locals.user
    const { firstName, lastName } = req.body
    await addUserDetails(userId, firstName, lastName, res.locals.user.token)
  } catch (err) {
    req.session.errors = [
      {
        name: 'error',
        text: 'An error occurred saving your changes',
      },
    ]
  } finally {
    res.redirect('/user-details')
  }
}
