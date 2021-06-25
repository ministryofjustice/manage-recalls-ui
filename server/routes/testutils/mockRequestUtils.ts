import { getMockReq, getMockRes } from '@jest-mock/express'

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function mockRequest(requestBody) {
  return getMockReq({
    body: requestBody,
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
