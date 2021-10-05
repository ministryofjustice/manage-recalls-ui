import { getMockReq, getMockRes } from '@jest-mock/express'
import { Request } from 'express'
import { SessionData } from 'express-session'
import { ObjectMixed } from '../../@types'

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
  path,
}: {
  query?: ObjectMixed
  params?: ObjectMixed
  session?: SessionData
  originalUrl?: string
  path?: string
}): Request {
  return getMockReq<Request>({
    query,
    params,
    session,
    originalUrl,
    path,
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
