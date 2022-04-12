import { Router } from 'express'
import { getStoredSessionData } from '../middleware/getStoredSessionData'
import { getUser, postUser } from '../controllers/userDetails/userDetails'

export const userDetailsRoutes = (router: Router) => {
  router.get('/user-details', getStoredSessionData, getUser)
  router.post('/user-details', getStoredSessionData, postUser)
}
