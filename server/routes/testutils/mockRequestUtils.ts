import { getMockReq, getMockRes } from '@jest-mock/express'
import { Request, Response } from 'express'
import { SessionData } from 'express-session'
import { ObjectMixed } from '../../@types'

export const mockReq = ({
  query = {},
  params = {},
  body = {},
  method = 'GET',
  headers = {},
  session = {} as SessionData,
  originalUrl,
  baseUrl,
}: {
  body?: ObjectMixed
  query?: ObjectMixed
  params?: ObjectMixed
  headers?: ObjectMixed
  method?: string
  session?: SessionData
  originalUrl?: string
  baseUrl?: string
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
  } as Request
}

export const mockRes = ({
  locals = {},
  token = 'token',
  redirect = jest.fn(),
}: {
  locals?: ObjectMixed
  token?: string
  redirect?: jest.Mock
} = {}): Response => {
  return {
    locals: {
      ...locals,
      user: {
        token,
      },
    },
    redirect,
  } as unknown as Response
}

export const mockNext = () => jest.fn()

// all functions below this line are deprecated, use the two above if possible

export function mockPostRequest({
  body,
  params,
  headers,
  session = {} as SessionData,
  originalUrl,
}: {
  body?: ObjectMixed
  params?: ObjectMixed
  headers?: ObjectMixed
  session?: SessionData
  originalUrl?: string
}) {
  return getMockReq({
    body,
    params,
    headers,
    session,
    originalUrl,
  })
}

export function mockGetRequest({
  query,
  params,
  session = {} as SessionData,
  originalUrl,
  baseUrl,
}: {
  query?: ObjectMixed
  params?: ObjectMixed
  session?: SessionData
  originalUrl?: string
  baseUrl?: string
}): Request {
  return getMockReq<Request>({
    query,
    params,
    session,
    originalUrl,
    baseUrl,
  })
}

export function mockResponseWithAuthenticatedUser(userAccessToken: string) {
  return getMockRes({
    locals: {
      user: {
        token: userAccessToken,
      },
    },
  })
}

export function mockResponseWithAuthenticatedUserAndUserId(userAccessToken: string, userId: string) {
  return getMockRes({
    locals: {
      user: {
        token: userAccessToken,
        uuid: userId,
      },
    },
  })
}
