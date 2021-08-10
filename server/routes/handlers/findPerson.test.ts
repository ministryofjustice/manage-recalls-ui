import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../testutils/mockRequestUtils'
import { findPerson } from './findPerson'
import { searchByNomsNumber } from '../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../clients/manageRecallsApi/manageRecallsApiClient')
const nomsNumber = 'AA123AA'

describe('findOffender', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('searchPrisoners', () => {
    it('should return data from api for a valid noms number', async () => {
      const expectedOffenders = {
        firstName: 'Bertie',
        lastName: 'Badger',
        nomsNumber: '13AAA',
        dateOfBirth: '1990-10-30',
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      searchByNomsNumber.mockReturnValueOnce(expectedOffenders)

      const req = mockGetRequest({ query: { nomsNumber } })
      const { res, next } = mockResponseWithAuthenticatedUser('')

      await findPerson(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/findPerson')
      expect(res.locals.offenders).toEqual([expectedOffenders])
    })

    it('should return error message if invalid noms number', async () => {
      const req = mockGetRequest({ query: { nomsNumber: 0 as unknown as string } })
      const { res, next } = mockResponseWithAuthenticatedUser('')

      await findPerson(req, res, next)

      expect(res.render).toHaveBeenCalledWith('pages/findPerson')
      expect(res.locals.errorMessage).toEqual('Please enter a valid NOMS number')
    })
  })
})
