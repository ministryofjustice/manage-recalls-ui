import { NextFunction, Request, Response } from 'express'
import { mockReq, mockRes } from '../testUtils/mockRequestUtils'
import { recallList } from './recallList'
import { getRecallList } from '../../clients/manageRecallsApiClient'

jest.mock('../../clients/manageRecallsApiClient')

const token = 'token'

describe('recallList', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  let req: Request
  let res: Response
  let next: NextFunction
  const listOfRecalls = [
    {
      firstName: 'Bobby',
      lastName: 'Badger',
      recallId: '1',
      nomsNumber: '123',
      status: 'BOOKED_ON',
      recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z',
      inCustodyAtBooking: true,
    },
    {
      firstName: 'Belinda',
      lastName: 'Badger',
      recallId: '2',
      nomsNumber: '123',
      status: 'BEING_BOOKED_ON',
      inCustodyAtBooking: false,
    },
    {
      firstName: 'Barry',
      lastName: 'Badger',
      recallId: '3',
      nomsNumber: '456',
      status: 'ASSESSED_NOT_IN_CUSTODY',
      dossierTargetDate: '2021-08-13',
    },
    {
      firstName: 'Bartholomew',
      lastName: 'Badger',
      recallId: '4',
      nomsNumber: '123',
      status: 'DOSSIER_ISSUED',
      dossierEmailSentDate: '2021-05-04',
      inCustodyAtBooking: false,
      inCustodyAtAssessment: true,
    },
    {
      firstName: 'Bootsy',
      lastName: 'Badger',
      recallId: '12',
      nomsNumber: '123',
      status: 'AWAITING_RETURN_TO_CUSTODY',
      dossierTargetDate: '2021-08-13',
    },
    {
      firstName: 'Beyonce',
      lastName: 'Badger',
      recallId: '5',
      nomsNumber: '123',
      status: 'STOPPED',
      dossierEmailSentDate: '2021-03-22',
      inCustodyAtBooking: false,
      inCustodyAtAssessment: true,
    },
    {
      firstName: 'Barry',
      lastName: 'Badger',
      recallId: '3',
      nomsNumber: '456',
      status: 'AWAITING_SECONDARY_DOSSIER_CREATION',
      secondaryDossierDueDate: '2021-08-13',
    },
    {
      firstName: 'Brenda',
      lastName: 'Badger',
      recallId: '6',
      nomsNumber: '456',
      status: 'DOSSIER_ISSUED',
      dossierEmailSentDate: '2020-10-22',
      inCustodyAtBooking: true,
      inCustodyAtAssessment: true,
    },
    {
      firstName: 'Barry',
      lastName: 'Badger',
      recallId: '3',
      nomsNumber: '456',
      status: 'BOOKED_ON',
      dossierTargetDate: '2021-08-13',
      inCustodyAtBooking: false,
    },
    {
      firstName: 'Barry',
      lastName: 'Badger',
      recallId: '3',
      nomsNumber: '456',
      status: 'SECONDARY_DOSSIER_IN_PROGRESS',
      secondaryDossierDueDate: '2021-08-11',
    },
    {
      firstName: 'Barnaby',
      lastName: 'Badger',
      recallId: '13',
      nomsNumber: '987',
      status: 'AWAITING_PART_B',
      dossierTargetDate: '2021-08-13',
      partBDueDate: '2022-08-13',
      inCustodyAtBooking: false,
    },
  ]

  beforeEach(() => {
    req = mockReq()
    res = mockRes({ token })
    next = jest.fn()
  })

  it('should make filtered lists of recalls', async () => {
    ;(getRecallList as jest.Mock).mockResolvedValue(listOfRecalls)
    await recallList(req, res, next)
    expect(res.locals.results.toDo).toEqual([
      {
        firstName: 'Belinda',
        fullName: 'Belinda Badger',
        inCustodyAtBooking: false,
        lastName: 'Badger',
        nomsNumber: '123',
        recallId: '2',
        status: 'BEING_BOOKED_ON',
      },
      {
        dossierTargetDate: '2021-08-13',
        firstName: 'Barry',
        fullName: 'Barry Badger',
        inCustodyAtBooking: false,
        lastName: 'Badger',
        nomsNumber: '456',
        recallId: '3',
        status: 'BOOKED_ON',
        toDoDueDateTime: '2021-08-13T23:59:59.000Z',
      },
      {
        firstName: 'Bobby',
        fullName: 'Bobby Badger',
        inCustodyAtBooking: true,
        lastName: 'Badger',
        nomsNumber: '123',
        recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z',
        recallId: '1',
        status: 'BOOKED_ON',
        toDoDueDateTime: '2021-08-14T10:22:05.000Z',
      },
    ])
    expect(res.locals.results.notInCustody).toEqual([
      {
        dossierTargetDate: '2021-08-13',
        firstName: 'Barry',
        fullName: 'Barry Badger',
        lastName: 'Badger',
        nomsNumber: '456',
        recallId: '3',
        status: 'ASSESSED_NOT_IN_CUSTODY',
      },
      {
        dossierTargetDate: '2021-08-13',
        firstName: 'Bootsy',
        fullName: 'Bootsy Badger',
        lastName: 'Badger',
        nomsNumber: '123',
        recallId: '12',
        status: 'AWAITING_RETURN_TO_CUSTODY',
      },
    ])
    expect(res.locals.results.completed).toEqual([
      {
        completedDateTime: '2021-05-04T23:59:59.000Z',
        dossierEmailSentDate: '2021-05-04',
        firstName: 'Bartholomew',
        fullName: 'Bartholomew Badger',
        inCustodyAtAssessment: true,
        inCustodyAtBooking: false,
        lastName: 'Badger',
        nomsNumber: '123',
        recallId: '4',
        status: 'DOSSIER_ISSUED',
      },
      {
        completedDateTime: '2021-03-22T23:59:59.000Z',
        dossierEmailSentDate: '2021-03-22',
        firstName: 'Beyonce',
        fullName: 'Beyonce Badger',
        inCustodyAtAssessment: true,
        inCustodyAtBooking: false,
        lastName: 'Badger',
        nomsNumber: '123',
        recallId: '5',
        status: 'STOPPED',
      },
      {
        completedDateTime: '2020-10-22T23:59:59.000Z',
        dossierEmailSentDate: '2020-10-22',
        firstName: 'Brenda',
        fullName: 'Brenda Badger',
        inCustodyAtAssessment: true,
        inCustodyAtBooking: true,
        lastName: 'Badger',
        nomsNumber: '456',
        recallId: '6',
        status: 'DOSSIER_ISSUED',
      },
    ])
    expect(res.locals.results.awaitingPartB).toEqual([
      {
        dossierTargetDate: '2021-08-13',
        firstName: 'Barnaby',
        fullName: 'Barnaby Badger',
        inCustodyAtBooking: false,
        lastName: 'Badger',
        nomsNumber: '987',
        partBDueDate: '2022-08-13',
        recallId: '13',
        status: 'AWAITING_PART_B',
      },
    ])

    expect(res.locals.results.dossierCheck).toEqual([
      {
        firstName: 'Barry',
        lastName: 'Badger',
        fullName: 'Barry Badger',
        recallId: '3',
        nomsNumber: '456',
        status: 'SECONDARY_DOSSIER_IN_PROGRESS',
        secondaryDossierDueDate: '2021-08-11',
      },
      {
        firstName: 'Barry',
        lastName: 'Badger',
        fullName: 'Barry Badger',
        recallId: '3',
        nomsNumber: '456',
        status: 'AWAITING_SECONDARY_DOSSIER_CREATION',
        secondaryDossierDueDate: '2021-08-13',
      },
    ])
  })

  it('should call next on error', async () => {
    ;(getRecallList as jest.Mock).mockRejectedValue({ statusCode: 404 })
    await recallList(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
