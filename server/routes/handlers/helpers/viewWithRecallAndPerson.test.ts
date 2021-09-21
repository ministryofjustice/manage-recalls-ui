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
    lastName: 'Badger',
    dateOfBirth: '1999-05-28',
    gender: 'Male',
    nomsNumber: 'A1234AA',
    croNumber: '1234/56A',
    pncNumber: '98/7654Z',
  }
  const assessedByUserDetails = {
    firstName: 'Bertie',
    lastName: 'Badger',
  }

  beforeEach(() => {
    fakeManageRecallsApi.post('/search').reply(200, [person])
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return person and recall data and assessed by user name from api for a valid noms number and recallId', async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.get('/users/00000000-0000-0000-0000-000000000000').reply(200, assessedByUserDetails)
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.recallLengthFormatted).toEqual('14')
    expect(res.locals.recall.documents).toEqual([
      {
        category: 'LICENCE',
        documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        label: 'Licence',
        name: 'LICENCE',
        type: 'document',
        fileName: 'Licence.pdf',
        required: true,
        url: '/persons/AA123AA/recalls/123/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      {
        category: 'PART_A_RECALL_REPORT',
        documentId: '34bdf-5717-4562-b3fc-2c963f66afa6',
        label: 'Part A recall report',
        name: 'PART_A_RECALL_REPORT',
        type: 'document',
        fileName: 'Part A.pdf',
        required: true,
        url: '/persons/AA123AA/recalls/123/documents/34bdf-5717-4562-b3fc-2c963f66afa6',
      },
      {
        category: 'PREVIOUS_CONVICTIONS_SHEET',
        documentId: '1234-5717-4562-b3fc-2c963f66afa6',
        fileName: 'Pre Cons.pdf',
        label: 'Previous convictions sheet',
        name: 'PREVIOUS_CONVICTIONS_SHEET',
        required: true,
        type: 'document',
        url: '/persons/AA123AA/recalls/123/documents/1234-5717-4562-b3fc-2c963f66afa6',
      },
      {
        category: 'PRE_SENTENCING_REPORT',
        documentId: '4563456-5717-4562-b3fc-2c963f66afa6',
        fileName: 'PSR.pdf',
        label: 'Pre-sentencing report',
        name: 'PRE_SENTENCING_REPORT',
        required: true,
        type: 'document',
        url: '/persons/AA123AA/recalls/123/documents/4563456-5717-4562-b3fc-2c963f66afa6',
      },
    ])
    expect(res.locals.assessedByUserName).toEqual('Bertie Badger')
    expect(res.render).toHaveBeenCalledWith('pages/assessRecall')
  })

  it('should return assessed by user id if the user name can not be found ', async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.get('/users/00000000-0000-0000-0000-000000000000').reply(404)

    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.assessedByUserName).toEqual('00000000-0000-0000-0000-000000000000')
    expect(res.render).toHaveBeenCalledWith('pages/assessRecall')
  })

  it('should make reference data available to render', async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.referenceData).toHaveProperty('reasonsForRecall')
    expect(res.locals.referenceData).toHaveProperty('mappaLevels')
    expect(res.locals.referenceData).toHaveProperty('recallLengths')
    expect(res.locals.referenceData).toHaveProperty('probationDivisions')
  })

  it('should previousConvictionMainName if one was specified', async () => {
    fakeManageRecallsApi
      .get(`/recalls/${recallId}`)
      .reply(200, { ...recall, previousConvictionMainName: 'Barry Badger' })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Barry Badger')
  })

  it('should fall back to default name if a different previousConvictionMainName is not saved', async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, { ...recall, previousConvictionMainName: '' })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Bobby Badger')
  })

  it('should fetch a prison list for specified views', async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
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
      {
        prisonId: 'KTI',
        prisonName: 'Kennet (HMP)',
        active: true,
      },
    ])
    await viewWithRecallAndPerson('recallPrisonPolice')(req, res)
    expect(res.locals.referenceData.prisonList).toEqual([
      {
        value: 'AKI',
        text: 'Acklington (HMP)',
        active: true,
      },
      {
        value: 'ALI',
        text: 'Albany (HMP)',
        active: false,
      },
      {
        value: 'KTI',
        text: 'Kennet (HMP)',
        active: true,
      },
    ])
    expect(res.locals.referenceData.activePrisonList).toEqual([
      {
        value: 'AKI',
        text: 'Acklington (HMP)',
        active: true,
      },
      {
        value: 'KTI',
        text: 'Kennet (HMP)',
        active: true,
      },
    ])
    expect(res.locals.recall.currentPrisonFormatted).toEqual('Kennet (HMP)')
    expect(res.locals.recall.lastReleasePrisonFormatted).toEqual('Kennet (HMP)')
  })

  it('should return 400 if invalid noms number', async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
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
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
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
