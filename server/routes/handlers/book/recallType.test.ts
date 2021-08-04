// @ts-nocheck
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { recallType } from './recallType'
import { searchByNomsNumber, getRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
const nomsNumber = 'AA123AA'
const recallId = '00000000-0000-0000-0000-000000000000'

describe('findOffender', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('recall type', () => {
    it('should return person and recall data from api for a valid noms number and recallId', async () => {
      const personDetails = {
        firstName: 'Bertie',
        lastName: 'Badger',
        nomsNumber,
        dateOfBirth: '1990-10-30',
      }
      const recallDetails = { recallId, nomsNumber }

      searchByNomsNumber.mockReturnValueOnce(personDetails)
      getRecall.mockReturnValueOnce(recallDetails)

      const req = mockGetRequest({ params: { nomsNumber, recallId } })
      const { res } = mockResponseWithAuthenticatedUser('')

      await recallType(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/recallType')
      expect(res.locals.person).toEqual(personDetails)
      expect(res.locals.recall).toEqual(recallDetails)
    })

    it('should return 400 if invalid noms number', async () => {
      const req = mockGetRequest({
        params: {
          nomsNumber: 0 as unknown as string,
          recallId,
        },
      })
      const { res } = mockResponseWithAuthenticatedUser('')

      await recallType(req, res)

      expect(res.sendStatus).toHaveBeenCalledWith(400)
    })

    it('should return 400 if invalid recallId', async () => {
      const req = mockGetRequest({
        params: {
          nomsNumber,
          recallId: 0 as unknown as string,
        },
      })
      const { res } = mockResponseWithAuthenticatedUser('')

      await recallType(req, res)

      expect(res.sendStatus).toHaveBeenCalledWith(400)
    })
  })
})
