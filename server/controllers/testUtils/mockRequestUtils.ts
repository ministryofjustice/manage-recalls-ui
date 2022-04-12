import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import { ObjectMap, ObjectMixed } from '../../@types'

export const mockReq = ({
  query = {},
  params = {},
  body = {},
  method = 'GET',
  headers = {},
  session = {} as SessionData,
  originalUrl,
  baseUrl,
  path = '/',
}: {
  body?: ObjectMixed
  query?: ObjectMixed
  params?: ObjectMixed
  headers?: ObjectMixed
  method?: string
  session?: SessionData
  originalUrl?: string
  baseUrl?: string
  path?: string
} = {}): Request => {
  return {
    query,
    params,
    body,
    headers,
    method,
    session,
    originalUrl,
    baseUrl,
    path,
  } as Request
}

export const mockRes = ({
  locals = {},
  token = 'token',
  redirect = jest.fn(),
  render = jest.fn(),
  sendStatus = jest.fn(),
}: {
  locals?: ObjectMap<unknown>
  token?: string
  redirect?: jest.Mock
  render?: jest.Mock
  sendStatus?: jest.Mock
} = {}): Response => {
  return {
    locals: {
      urlInfo: locals.urlInfo || {},
      user: {
        ...((locals.user as object) || {}),
        token,
      },
      env: locals.env || 'PRODUCTION',
    },
    redirect,
    render,
    sendStatus,
  } as unknown as Response
}

export const mockNext = () => jest.fn()
