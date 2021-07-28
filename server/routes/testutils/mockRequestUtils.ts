import { getMockReq, getMockRes } from '@jest-mock/express'
import { Request } from 'express'
import { ObjectStrings } from '../../@types/express'

export function mockPostRequest({ body, params }: { body?: ObjectStrings; params?: ObjectStrings }) {
  return getMockReq({
    body,
    params,
  })
}

export function mockGetRequest({ query, params }: { query?: ObjectStrings; params?: ObjectStrings }): Request {
  return getMockReq<Request>({
    query,
    params,
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
