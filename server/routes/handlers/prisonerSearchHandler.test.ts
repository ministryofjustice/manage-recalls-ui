import { mockRequest, mockResponseWithAuthenticatedUser } from '../testutils/mockRequestUtils'
import prisonerSearchHandler from './prisonerSearchHandler'
import { searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../clients/manageRecallsApi/manageRecallsApiClient')
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

      const req = mockRequest({ nomsNumber })
      const { res, next } = mockResponseWithAuthenticatedUser('')

      const handler = prisonerSearchHandler()
      await handler(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/index')
      expect(res.locals.prisoners).toEqual(expectedPrisoners)
    })

    it('should return error message if invalid noms number', async () => {
      const req = mockRequest({})
      const { res, next } = mockResponseWithAuthenticatedUser('')

      const handler = prisonerSearchHandler()
      await handler(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/index')
      expect(res.locals.errorMessage).toEqual('Please enter a valid NOMS number')
    })
  })
})
