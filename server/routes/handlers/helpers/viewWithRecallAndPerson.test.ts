// @ts-nocheck
import nock from 'nock'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { viewWithRecallAndPerson } from './viewWithRecallAndPerson'
import config from '../../../config'
import recall from '../../../../fake-manage-recalls-api/stubs/__files/get-recall.json'

const nomsNumber = 'AA123AA'
const accessToken = 'abc'
const recallId = '123'

describe('viewWithRecallAndPerson', () => {
  const fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  const fakePrisonRegisterApi = nock(config.apis.prisonRegister.url)

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

  beforeEach(() => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.post('/search').reply(200, [person])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return person and recall data from api for a valid noms number and recallId', async () => {
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
        url: '/persons/AA123AA/recalls/123/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      {
        category: 'PART_A_RECALL_REPORT',
        documentId: '34bdf-5717-4562-b3fc-2c963f66afa6',
        label: 'Part A recall report',
        name: 'PART_A_RECALL_REPORT',
        url: '/persons/AA123AA/recalls/123/documents/34bdf-5717-4562-b3fc-2c963f66afa6',
      },
    ])
    expect(res.render).toHaveBeenCalledWith('pages/assessRecall')
  })

  it('should make reference data available to render', async () => {
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.referenceData).toHaveProperty('reasonsForRecall')
    expect(res.locals.referenceData).toHaveProperty('mappaLevels')
    expect(res.locals.referenceData).toHaveProperty('recallLengths')
    expect(res.locals.referenceData).toHaveProperty('probationDivisions')
  })

  it('should fetch a prison list for specified views', async () => {
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    fakePrisonRegisterApi.get('/prisons').reply(200, [
      {
        prisonId: 'ALI',
        prisonName: 'Albany (HMP)',
        active: false,
      },
      {
        prisonId: 'AKI',
        prisonName: 'Acklington (HMP)',
        active: true,
      },
    ])
    await viewWithRecallAndPerson('recallPrisonPolice')(req, res)
    expect(res.locals.referenceData.prisonList).toEqual([
      {
        value: 'AKI',
        text: 'Acklington (HMP)',
      },
    ])
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
