/* eslint-disable import/first */
const mockSearchForPrisoner = jest.fn()

jest.mock('../../data/manageRecallsApi/manageRecallsApiClient', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => {
      return {
        searchForPrisoner: mockSearchForPrisoner,
      }
    }),
  }
})

import { getMockReq, getMockRes } from '@jest-mock/express'
import prisonerSearchHandler from './prisonerSearchHandler'

describe('prisonerSearchHandler', () => {
  const nomisNumber = 'AA123AA'

  afterEach(() => {
    jest.restoreAllMocks()
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
      mockSearchForPrisoner.mockReturnValue(expectedPrisoners)

      const req = getMockReq({
        body: { nomisNumber },
      })
      const { res, next } = getMockRes({
        locals: {
          user: {
            token: 'test',
          },
        },
      })

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
