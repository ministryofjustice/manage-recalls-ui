import { NamedFormError } from '../index'

export default {}

declare module 'express-session' {
  // Declare that the session will potentially contain these additional fields
  interface SessionData {
    returnTo: string
    nowInMinutes: number
    errors?: NamedFormError[]
  }
}

export declare global {
  namespace Express {
    interface Request {
      verified?: boolean
      user: {
        username: string
        token: string
      }
    }
  }
}

export interface RequestQuery {
  [key: string]: string
}
