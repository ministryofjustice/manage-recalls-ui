// @ts-nocheck
import nock from 'nock'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { viewWithRecallAndPerson } from './viewWithRecallAndPerson'
import config from '../../../config'
import recall from '../../../../fake-manage-recalls-api/stubs/__files/get-recall.json'

const nomsNumber = 'AA123AA'
const accessToken = 'abc'
const recallId = '123'
const assessedByUserId = '00000000-0000-0000-0000-000000000000'
const bookedByUserId = '00000000-1111-0000-0000-000000000000'
const dossierCreatedByUserId = '00000000-2222-0000-0000-000000000000'

describe('viewWithRecallAndPerson', () => {
  const fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)

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
  const bookedByUserDetails = {
    firstName: 'Brenda',
    lastName: 'Badger',
  }
  const dossierCreatedByUserDetails = {
    firstName: 'Bobby',
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
    fakeManageRecallsApi.get(`/users/${assessedByUserId}`).reply(200, assessedByUserDetails)
    fakeManageRecallsApi.get(`/users/${bookedByUserId}`).reply(200, bookedByUserDetails)
    fakeManageRecallsApi.get(`/users/${dossierCreatedByUserId}`).reply(200, dossierCreatedByUserDetails)
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.documents).toEqual([
      {
        category: 'PART_A_RECALL_REPORT',
        documentId: '34bdf-5717-4562-b3fc-2c963f66afa6',
        label: 'Part A recall report',
        labelLowerCase: 'part A recall report',
        name: 'PART_A_RECALL_REPORT',
        type: 'document',
        fileName: 'Part A.pdf',
        required: true,
        url: '/persons/AA123AA/recalls/123/documents/34bdf-5717-4562-b3fc-2c963f66afa6',
      },
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
    expect(res.locals.recall.assessedByUserName).toEqual('Bertie Badger')
    expect(res.locals.recall.bookedByUserName).toEqual('Brenda Badger')
    expect(res.locals.recall.dossierCreatedByUserName).toEqual('Bobby Badger')
    expect(res.render).toHaveBeenCalledWith('pages/assessRecall')
  })

  it('should add user ids to res.locals if the user details can not be found ', async () => {
    fakeManageRecallsApi.get(`/recalls/${recallId}`).reply(200, recall)
    fakeManageRecallsApi.get(`/users/*`).reply(404)

    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.assessedByUserName).toEqual(assessedByUserId)
    expect(res.locals.recall.bookedByUserName).toEqual(bookedByUserId)
    expect(res.locals.recall.dossierCreatedByUserName).toEqual(dossierCreatedByUserId)
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
    expect(res.locals.referenceData).toHaveProperty('localDeliveryUnits')
    expect(res.locals.referenceData).toHaveProperty('prisons')
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
})
