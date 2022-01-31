import { Request, Response } from 'express'
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../testutils/mockRequestUtils'
import { recallList } from './recallList'
import { getRecallList } from '../../clients/manageRecallsApiClient'

jest.mock('../../clients/manageRecallsApiClient')

const userToken = { access_token: 'token-1', expires_in: 300 }

describe('recallList', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  let req: Request
  let resp: Response
  const listOfRecalls = [
    {
      firstName: 'Bobby',
      lastName: 'Badger',
      recallId: '1',
      nomsNumber: '123',
      status: 'BOOKED_ON',
      recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z',
    },
    {
      firstName: 'Belinda',
      lastName: 'Badger',
      recallId: '2',
      nomsNumber: '123',
      status: 'BEING_BOOKED_ON',
    },
    {
      firstName: 'Barry',
      lastName: 'Badger',
      recallId: '3',
      nomsNumber: '456',
      status: 'RECALL_NOTIFICATION_ISSUED',
      dossierTargetDate: '2021-08-13',
      inCustody: false,
    },
    {
      firstName: 'Bartholomew',
      lastName: 'Badger',
      recallId: '4',
      nomsNumber: '123',
      status: 'DOSSIER_ISSUED',
      dossierEmailSentDate: '2021-05-04',
    },
    {
      firstName: 'Beyonce',
      lastName: 'Badger',
      recallId: '5',
      nomsNumber: '123',
      status: 'STOPPED',
      dossierEmailSentDate: '2021-03-22',
    },
    {
      firstName: 'Brenda',
      lastName: 'Badger',
      recallId: '6',
      nomsNumber: '456',
      status: 'DOSSIER_ISSUED',
      dossierEmailSentDate: '2020-10-22',
    },
    {
      firstName: 'Barry',
      lastName: 'Badger',
      recallId: '3',
      nomsNumber: '456',
      status: 'BOOKED_ON',
      dossierTargetDate: '2021-08-13',
      inCustody: false,
    },
  ]

  beforeEach(() => {
    req = mockGetRequest({})
    const { res } = mockResponseWithAuthenticatedUser(userToken.access_token)
    resp = res
  })

  it('should make recalls with person details available to render', async () => {
    ;(getRecallList as jest.Mock).mockResolvedValue(listOfRecalls)
    await recallList(req, resp)
    expect(resp.locals.results.toDo).toEqual([
      {
        firstName: 'Belinda',
        fullName: 'Belinda Badger',
        lastName: 'Badger',
        nomsNumber: '123',
        recallId: '2',
        status: 'BEING_BOOKED_ON',
      },
      {
        firstName: 'Bobby',
        fullName: 'Bobby Badger',
        lastName: 'Badger',
        nomsNumber: '123',
        recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z',
        recallId: '1',
        status: 'BOOKED_ON',
      },
    ])
    expect(resp.locals.results.notInCustody).toEqual([
      {
        dossierTargetDate: '2021-08-13',
        firstName: 'Barry',
        fullName: 'Barry Badger',
        lastName: 'Badger',
        nomsNumber: '456',
        recallId: '3',
        status: 'RECALL_NOTIFICATION_ISSUED',
        inCustody: false,
      },
      {
        firstName: 'Barry',
        fullName: 'Barry Badger',
        lastName: 'Badger',
        recallId: '3',
        nomsNumber: '456',
        status: 'BOOKED_ON',
        dossierTargetDate: '2021-08-13',
        inCustody: false,
      },
    ])
    expect(resp.locals.results.completed).toEqual([
      {
        dossierEmailSentDate: '2021-05-04',
        firstName: 'Bartholomew',
        fullName: 'Bartholomew Badger',
        lastName: 'Badger',
        nomsNumber: '123',
        recallId: '4',
        status: 'DOSSIER_ISSUED',
      },
      {
        dossierEmailSentDate: '2021-03-22',
        firstName: 'Beyonce',
        fullName: 'Beyonce Badger',
        lastName: 'Badger',
        nomsNumber: '123',
        recallId: '5',
        status: 'STOPPED',
      },
      {
        dossierEmailSentDate: '2020-10-22',
        firstName: 'Brenda',
        fullName: 'Brenda Badger',
        lastName: 'Badger',
        nomsNumber: '456',
        recallId: '6',
        status: 'DOSSIER_ISSUED',
      },
    ])
  })

  it('should make a list of failed recall requests available to render', async () => {
    ;(getRecallList as jest.Mock).mockRejectedValue({ statusCode: 404 })
    await recallList(req, resp)
    expect(resp.locals.errors).toEqual([
      {
        name: 'fetchError',
        text: 'Recalls could not be retrieved',
      },
    ])
  })
})
