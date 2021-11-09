import nock from 'nock'
import { Request, Response } from 'express'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../testutils/mockRequestUtils'
import { recallList } from './recallList'
import config from '../../config'
import recalls from '../../../fake-manage-recalls-api/stubs/__files/get-recalls.json'
import { RecallResponse } from '../../@types/manage-recalls-api'

jest.mock('../../clients/redis')

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('recallList', () => {
  const fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  let req: Request
  let resp: Response
  const listOfRecalls = [
    {
      recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      nomsNumber: '123',
      status: 'BOOKED_ON',
      recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z',
    },
    {
      recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      nomsNumber: '123',
      status: 'BEING_BOOKED_ON',
    },
    {
      recallId: '8ab377a6-4587-2598-abc4-98fc53737',
      nomsNumber: '456',
      status: 'RECALL_NOTIFICATION_ISSUED',
      dossierTargetDate: '2021-08-13',
    },
    {
      recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      nomsNumber: '123',
      status: 'DOSSIER_ISSUED',
      dossierEmailSentDate: '2021-05-04',
    },
    {
      recallId: '123445-5717-4562-b3fc-2c963f66afa6',
      nomsNumber: '456',
      status: 'DOSSIER_ISSUED',
      dossierEmailSentDate: '2020-10-22',
    },
  ]

  beforeEach(() => {
    fakeManageRecallsApi.get('/recalls').reply(200, listOfRecalls)
    req = mockGetRequest({})
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)
    resp = res
  })

  it('should make recalls with person details available to render', async () => {
    fakeManageRecallsApi
      .post('/search')
      .times(listOfRecalls.length)
      .reply(200, [
        {
          firstName: 'Bobby',
          lastName: 'Badger',
        },
      ])
    await recallList(req, resp)
    expect(resp.locals.results.toDo).toEqual([
      {
        person: {
          firstName: 'Bobby',
          lastName: 'Badger',
        },
        recall: {
          nomsNumber: '123',
          recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          status: 'BEING_BOOKED_ON',
        },
      },
      {
        person: {
          firstName: 'Bobby',
          lastName: 'Badger',
        },
        recall: {
          nomsNumber: '456',
          recallId: '8ab377a6-4587-2598-abc4-98fc53737',
          status: 'RECALL_NOTIFICATION_ISSUED',
          dossierTargetDate: '2021-08-13',
        },
      },
      {
        person: {
          firstName: 'Bobby',
          lastName: 'Badger',
        },
        recall: {
          nomsNumber: '123',
          recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          status: 'BOOKED_ON',
          recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z',
        },
      },
    ])
    expect(resp.locals.results.completed).toEqual([
      {
        person: {
          firstName: 'Bobby',
          lastName: 'Badger',
        },
        recall: {
          dossierEmailSentDate: '2021-05-04',
          nomsNumber: '123',
          recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          status: 'DOSSIER_ISSUED',
        },
      },
      {
        person: {
          firstName: 'Bobby',
          lastName: 'Badger',
        },
        recall: {
          dossierEmailSentDate: '2020-10-22',
          nomsNumber: '456',
          recallId: '123445-5717-4562-b3fc-2c963f66afa6',
          status: 'DOSSIER_ISSUED',
        },
      },
    ])
  })

  it('should make a list of failed recall requests available to render', async () => {
    fakeManageRecallsApi.post('/search').times(recalls.length).reply(404)
    await recallList(req, resp)
    expect(resp.locals.errors).toEqual([
      {
        name: 'fetchError',
        text: '5 recalls could not be retrieved',
      },
    ])
  })
})
