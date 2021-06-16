import { getMockReq, getMockRes } from '@jest-mock/express'
import prisonerSearchHandler from './prisonerSearchHandler'
import searchByNomsNumber from '../../data/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../data/manageRecallsApi/manageRecallsApiClient')
const nomsNumber = 'AA123AA'

describe('prisonerSearchHandler', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('searchPrisoners', () => {
    it('should return data from api for a valid noms number', async () => {
      const expectedPrisoners = [
        {
          firstName: 'Bertie',
          lastName: 'Badger',
          nomsNumber: '13AAA',
          dateOfBirth: '1990-10-30',
        },
      ]
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      searchByNomsNumber.mockReturnValueOnce(expectedPrisoners)

      const req = mockRequestWithNomsNumber()
      const { res, next } = mockResponseWithAuthenticatedUser()

      const handler = prisonerSearchHandler()
      await handler(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/index')
      expect(res.locals.prisoners).toEqual(expectedPrisoners)
    })

    it('should return 400 if invalid noms number', async () => {
      const req = getMockReq({
        body: {},
      })
      const { res, next } = getMockRes()

      const handler = prisonerSearchHandler()
      await handler(req, res, next)

      expect(res.send).toHaveBeenCalledWith(400)
    })
  })
})

function mockRequestWithNomsNumber() {
  return getMockReq({
    body: { nomsNumber },
  })
}

function mockResponseWithAuthenticatedUser() {
  return getMockRes({
    locals: {
      user: {
        token: 'any token',
      },
    },
  })
}
