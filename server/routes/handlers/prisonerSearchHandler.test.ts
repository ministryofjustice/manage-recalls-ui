import { getMockReq, getMockRes } from '@jest-mock/express'
import prisonerSearchHandler from './prisonerSearchHandler'
import searchByNomisNumber from '../../data/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../data/manageRecallsApi/manageRecallsApiClient')
const nomisNumber = 'AA123AA'

describe('prisonerSearchHandler', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('searchPrisoners', () => {
    it('should return data from api for a valid nomis number', async () => {
      const expectedPrisoners = [
        {
          firstName: 'Bertie',
          lastName: 'Badger',
          nomisNumber: '13AAA',
          dateOfBirth: '1990-10-30',
        },
      ]
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      searchByNomisNumber.mockReturnValueOnce(expectedPrisoners)

      const req = mockRequestWithNomisNumber()
      const { res, next } = mockResponseWithAuthenticatedUser()

      const handler = prisonerSearchHandler()
      await handler(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/index')
      expect(res.locals.prisoners).toEqual(expectedPrisoners)
    })

    it('should return 400 if invalid nomis number', async () => {
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

function mockRequestWithNomisNumber() {
  return getMockReq({
    body: { nomisNumber },
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
