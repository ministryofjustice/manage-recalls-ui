import { getMockReq, getMockRes } from '@jest-mock/express'
import { Request } from 'express'
import { RequestQuery } from '../../@types/express'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mockPostRequest(requestBody) {
  return getMockReq({
    body: requestBody,
  })
}

export function mockGetRequest(queryParams: RequestQuery): Request {
  return getMockReq<Request>({
    query: queryParams,
  })
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types,camelcase
export function mockResponseWithAuthenticatedUser(userAccessToken: string) {
  return getMockRes({
    locals: {
      user: {
        token: userAccessToken,
      },
    },
  })
}
