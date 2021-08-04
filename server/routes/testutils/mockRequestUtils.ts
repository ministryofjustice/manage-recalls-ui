import { getMockReq, getMockRes } from '@jest-mock/express'
import { Request } from 'express'
import { SessionData } from 'express-session'
import { ObjectStrings } from '../../@types/express'

export function mockPostRequest({
  body,
  params,
  headers,
  session = {} as SessionData,
}: {
  body?: ObjectStrings
  params?: ObjectStrings
  headers?: ObjectStrings
  session?: SessionData
}) {
  return getMockReq({
    body,
    params,
    headers,
    session,
  })
}

export function mockGetRequest({
  query,
  params,
  session = {} as SessionData,
}: {
  query?: ObjectStrings
  params?: ObjectStrings
  session?: SessionData
}): Request {
  return getMockReq<Request>({
    query,
    params,
    session,
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
