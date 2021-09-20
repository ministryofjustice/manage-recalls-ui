import { Request, Response } from 'express'
import { getUserDetails, addUserDetails } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

export const getUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid, token } = res.locals.user
    const user = await getUserDetails(uuid, token)
    res.locals.user = { ...res.locals.user, ...user }
  } finally {
    res.render(`pages/userDetails`)
  }
}

export const postUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { uuid } = res.locals.user
    const { firstName, lastName } = req.body
    await addUserDetails(uuid, firstName, lastName, res.locals.user.token)
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
