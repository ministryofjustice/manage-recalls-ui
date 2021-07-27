import { getMockReq, getMockRes } from '@jest-mock/express'
import { Request } from 'express'
import { ObjectStrings, RequestQuery } from '../../@types/express'

export function mockPostRequest({ body, params }: { body?: ObjectStrings; params?: ObjectStrings }) {
  return getMockReq({
    body,
    params,
  })
}

export function mockGetRequest(queryParams: RequestQuery): Request {
  return getMockReq<Request>({
    query: queryParams,
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
