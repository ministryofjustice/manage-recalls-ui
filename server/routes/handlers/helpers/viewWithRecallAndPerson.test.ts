// @ts-nocheck
import nock from 'nock'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { viewWithRecallAndPerson } from './viewWithRecallAndPerson'
import config from '../../../config'

const nomsNumber = 'AA123AA'
const accessToken = 'abc'
const recallId = '123'

describe('viewWithRecallAndPerson', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })
  it('should return person and recall data from api for a valid noms number and recallId', async () => {
    const fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)

    const recall = {
      recallId: '123',
      nomsNumber: 'A1234AA',
      recallLength: 'FOURTEEN_DAYS',
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
      ],
    }

    const person = {
      firstName: 'Bobby',
      middleNames: 'John',
      lastName: 'Badger',
      dateOfBirth: '1999-05-28',
      gender: 'Male',
      nomsNumber: 'A1234AA',
      croNumber: '1234/56A',
      pncNumber: '98/7654Z',
    }
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.post('/search').reply(200, [person])
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)

    await viewWithRecallAndPerson('assessRecall')(req, res)

    expect(res.locals.recall.recallLengthFormatted).toEqual('14 days')
    expect(res.locals.recall.documents).toEqual([
      {
        category: 'LICENCE',
        documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        label: 'Licence',
        name: 'LICENCE',
      },
    ])
    expect(res.render).toHaveBeenCalledWith('pages/assessRecall')
  })

  it('should return 400 if invalid noms number', async () => {
    const req = mockGetRequest({
      params: {
        nomsNumber: 0 as unknown as string,
        recallId,
      },
    })
    const { res } = mockResponseWithAuthenticatedUser('')

    await viewWithRecallAndPerson('recallType')(req, res)

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

    await viewWithRecallAndPerson('recallType')(req, res)

    expect(res.sendStatus).toHaveBeenCalledWith(400)
  })
})
