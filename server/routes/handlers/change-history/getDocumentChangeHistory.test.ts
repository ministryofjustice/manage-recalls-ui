import { NextFunction, Request, Response } from 'express'
import { getDocumentChangeHistory } from './getDocumentChangeHistory'
import { getDocumentCategoryHistory } from '../../../clients/manageRecallsApiClient'
import { getPersonAndRecall } from '../helpers/fetch/getPersonAndRecall'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../helpers/fetch/getPersonAndRecall')

describe('getDocumentChangeHistory', () => {
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = {
      params: {},
      query: {},
    } as Request
    res = {
      locals: {
        user: { token: 'token' },
      },
    } as unknown as Response
    next = jest.fn()
    ;(getPersonAndRecall as jest.Mock).mockResolvedValue({
      person: {
        firstName: 'Wesley',
        lastName: 'Holt',
      },
      recall: {
        recallId: '456',
        nomsNumber: '123',
        bookingNumber: 'A1234AB',
        missingDocumentsRecords: [
          {
            categories: ['LICENCE', 'OASYS_RISK_ASSESSMENT'],
            createdByUserName: 'Bobby Badger',
            createdDateTime: '2021-10-05T08:11:34.000Z',
            details: 'Chased',
            emailId: '123',
            emailFileName: 'email.msg',
            missingDocumentsRecordId: '456',
            version: 2,
          },
          {
            categories: ['PART_A_RECALL_REPORT'],
            createdByUserName: 'Bobby Badger',
            createdDateTime: '2021-10-05T08:11:34.000Z',
            details: 'Chased',
            emailId: '123',
            emailFileName: 'email.msg',
            missingDocumentsRecordId: '456',
            version: 2,
          },
        ],
      },
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('returns 400 if recallId missing', () => {
    getDocumentChangeHistory(req, res, next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid recallId'))
  })

  it('returns 400 if nomsNumber missing', () => {
    req.params.recallId = '456'
    getDocumentChangeHistory(req, res, next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid nomsNumber'))
  })

  it('returns 400 if category missing', () => {
    req.params.recallId = '456'
    req.params.nomsNumber = '123'
    getDocumentChangeHistory(req, res, next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid category'))
  })

  it('returns 400 if category invalid', () => {
    req.params.recallId = '456'
    req.params.nomsNumber = '123'
    req.query.category = 'REPORT'
    getDocumentChangeHistory(req, res, next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid category'))
  })

  it('processes uploaded documents and appends missing documents records for the category', async () => {
    req.params.nomsNumber = '123'
    req.params.recallId = '456'
    req.query.category = 'LICENCE'
    ;(getDocumentCategoryHistory as jest.Mock).mockResolvedValue([
      {
        category: 'LICENCE',
        createdByUserName: 'Dave Smith',
        createdDateTime: '2021-12-09T13:40:50.000Z',
        documentId: 'd4539cd4-c410-408a-b0c3-f91ba97b6e84',
        fileName: 'Licence Wesley Holt.pdf',
        version: 1,
      },
      {
        category: 'LICENCE',
        createdByUserName: 'Dave Smith',
        createdDateTime: '2021-11-24T10:40:50.000Z',
        documentId: '123',
        fileName: 'Licence Wesley Holt version 2.pdf',
        version: 2,
      },
    ])
    await getDocumentChangeHistory(req, res, next)
    expect(res.locals.documentHistory).toEqual({
      category: 'LICENCE',
      label: 'Licence',
      type: 'document',
      items: [
        {
          category: 'LICENCE',
          createdByUserName: 'Dave Smith',
          createdDateTime: '2021-11-24T10:40:50.000Z',
          documentId: '123',
          fileName: 'Licence.pdf',
          url: '/persons/123/recalls/456/documents/123',
          version: 2,
        },
        {
          category: 'LICENCE',
          createdByUserName: 'Dave Smith',
          createdDateTime: '2021-12-09T13:40:50.000Z',
          documentId: 'd4539cd4-c410-408a-b0c3-f91ba97b6e84',
          fileName: 'Licence.pdf',
          url: '/persons/123/recalls/456/documents/d4539cd4-c410-408a-b0c3-f91ba97b6e84',
          version: 1,
        },
        {
          categories: ['LICENCE', 'OASYS_RISK_ASSESSMENT'],
          createdByUserName: 'Bobby Badger',
          createdDateTime: '2021-10-05T08:11:34.000Z',
          details: 'Chased',
          fileName: 'email.msg',
          isMissingRecord: true,
          emailId: '123',
          url: '/persons/123/recalls/456/documents/123',
          version: 2,
        },
      ],
    })
  })

  it('processes generated documents', async () => {
    req.params.nomsNumber = '123'
    req.params.recallId = '456'
    req.query.category = 'DOSSIER'
    ;(getDocumentCategoryHistory as jest.Mock).mockResolvedValue([
      {
        category: 'DOSSIER',
        createdByUserName: 'Debra Smith',
        createdDateTime: '2021-11-19T12:40:50.000Z',
        documentId: '456',
        fileName: 'recall.pdf',
        version: 1,
      },
      {
        category: 'DOSSIER',
        createdByUserName: 'Dave Wiley',
        createdDateTime: '2021-10-22T09:34:45.000Z',
        documentId: '123',
        fileName: 'Licence Wesley Holt version 2.pdf',
        version: 2,
      },
    ])
    await getDocumentChangeHistory(req, res, next)
    expect(res.locals.documentHistory).toEqual({
      category: 'DOSSIER',
      label: 'Dossier',
      type: 'generated',
      items: [
        {
          category: 'DOSSIER',
          createdByUserName: 'Dave Wiley',
          createdDateTime: '2021-10-22T09:34:45.000Z',
          documentId: '123',
          fileName: 'HOLT WESLEY A1234AB RECALL DOSSIER.pdf',
          url: '/persons/123/recalls/456/documents/123',
          version: 2,
          type: 'generated',
        },
        {
          category: 'DOSSIER',
          createdByUserName: 'Debra Smith',
          createdDateTime: '2021-11-19T12:40:50.000Z',
          documentId: '456',
          fileName: 'HOLT WESLEY A1234AB RECALL DOSSIER.pdf',
          url: '/persons/123/recalls/456/documents/456',
          version: 1,
          type: 'generated',
        },
      ],
    })
  })
})
