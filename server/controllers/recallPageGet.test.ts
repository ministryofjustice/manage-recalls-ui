// @ts-nocheck
import { mockReq, mockRes } from './testUtils/mockRequestUtils'
import { recallPageGet } from './recallPageGet'
import recall from '../../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { RecallResponse } from '../@types/manage-recalls-api/models/RecallResponse'
import { getRecall } from '../clients/manageRecallsApiClient'
import * as decorateDocsExports from './documents/download/helpers/decorateDocs'
import { RecallDocument } from '../@types/manage-recalls-api/models/RecallDocument'

jest.mock('../clients/manageRecallsApiClient')

const accessToken = 'abc'
const recallId = '123'
let req
let res

describe('recallPageGet', () => {
  beforeEach(() => {
    req = mockReq({ params: { recallId } })
    res = mockRes({ token: accessToken })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should attach uploaded documents to res locals', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    await recallPageGet('recallIssuesNeeds')(req, res)
    expect(res.locals.recall.documentsUploaded.map(doc => doc.category)).toEqual([
      'PART_A_RECALL_REPORT',
      'LICENCE',
      'PREVIOUS_CONVICTIONS_SHEET',
      'PRE_SENTENCING_REPORT',
    ])
    expect(res.render).toHaveBeenCalledWith('pages/recallIssuesNeeds')
  })

  it('should return person and recall data and assessed by user name from api for a valid noms number and recallId', done => {
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    res.render = view => {
      expect(res.locals.recall.assessedByUserName).toEqual('Bertie Badger')
      expect(res.locals.recall.bookedByUserName).toEqual('Brenda Badger')
      expect(res.locals.recall.dossierCreatedByUserName).toEqual('Bobby Badger')
      expect(view).toEqual('pages/assessRecall')
      done()
    }
    recallPageGet('assessRecall')(req, res)
  })

  it('should make reference data available to render', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    await recallPageGet('assessRecall')(req, res)
    expect(res.locals.referenceData).toHaveProperty('reasonsForRecall')
    expect(res.locals.referenceData).toHaveProperty('mappaLevels')
    expect(res.locals.referenceData).toHaveProperty('recallLengths')
    expect(res.locals.referenceData).toHaveProperty('localDeliveryUnits')
    expect(res.locals.referenceData).toHaveProperty('prisons')
    expect(res.locals.referenceData).toHaveProperty('policeForces')
  })

  it('should set previousConvictionMainName to Other value if specified', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({ ...recall, previousConvictionMainName: 'Barry Badger' })
    await recallPageGet('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Barry Badger')
  })

  it('should set previousConvictionMainName to first + last name if specified', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      previousConvictionMainNameCategory: 'FIRST_LAST',
      previousConvictionMainName: '',
    })
    await recallPageGet('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Bobby Badger')
  })

  it('should set previousConvictionMainName to first + middle + last name if specified', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      previousConvictionMainNameCategory: 'FIRST_MIDDLE_LAST',
      previousConvictionMainName: '',
    })
    await recallPageGet('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Bobby John Badger')
  })

  it('should set fullName to first + last name if specified', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      licenceNameCategory: 'FIRST_LAST',
    })
    await recallPageGet('assessRecall')(req, res)
    expect(res.locals.recall.fullName).toEqual('Bobby Badger')
  })

  it('should set fullName to first + middle + last name if specified', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      licenceNameCategory: 'FIRST_MIDDLE_LAST',
    })
    await recallPageGet('assessRecall')(req, res)
    expect(res.locals.recall.fullName).toEqual('Bobby John Badger')
  })

  it('should make document data available to render', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({ ...recall, status: RecallResponse.status.BEING_BOOKED_ON })
    jest.spyOn(decorateDocsExports, 'decorateDocs')
    await recallPageGet('assessRecall')(req, res)
    expect(res.locals.recall.enableDeleteDocuments).toEqual(true)
    expect(decorateDocsExports.decorateDocs.mock.calls[0][0].docs).toEqual(recall.documents)
  })

  it('should pass document category query string to decorateDocs', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({ ...recall, status: RecallResponse.status.BEING_BOOKED_ON })
    jest.spyOn(decorateDocsExports, 'decorateDocs')
    req.query.versionedCategoryName = 'LICENCE'
    await recallPageGet('assessRecall')(req, res)
    expect(decorateDocsExports.decorateDocs.mock.calls[0][0].versionedCategoryName).toEqual('LICENCE')
  })

  it('should sort last known addresses by index in ascending order', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      status: RecallResponse.status.BEING_BOOKED_ON,
      lastKnownAddresses: [{ index: 2 }, { index: 1 }],
    })
    jest.spyOn(decorateDocsExports, 'decorateDocs')
    await recallPageGet('assessRecall')(req, res)
    expect(res.locals.recall.lastKnownAddresses.map(a => a.index)).toEqual([1, 2])
  })

  it('returns a list of decorated missing documents records', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      missingDocumentsRecords: [
        {
          missingDocumentsRecordId: '1234',
          emailId: '845',
          emailFileName: 'email.msg',
          categories: [RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET],
          details: 'Email sent 12/10/2021',
          version: 1,
          createdByUserName: 'Maria Badger',
          createdDateTime: '2021-10-12T13:43:00.000Z',
        },
        {
          missingDocumentsRecordId: '1234',
          emailId: '845',
          emailFileName: 'email.msg',
          categories: [RecallDocument.category.OASYS_RISK_ASSESSMENT],
          details: 'Email sent 12/10/2021',
          version: 1,
          createdByUserName: 'Maria Badger',
          createdDateTime: '2021-10-12T13:43:00.000Z',
        },
      ],
    })
    await recallPageGet('recallIssuesNeeds')(req, res)
    expect(res.locals.recall.missingDocumentsRecords).toEqual([
      {
        categories: ['PREVIOUS_CONVICTIONS_SHEET'],
        createdByUserName: 'Maria Badger',
        createdDateTime: '2021-10-12T13:43:00.000Z',
        details: 'Email sent 12/10/2021',
        version: 1,
        fileName: 'email.msg',
        emailId: '845',
        url: `/recalls/${recallId}/documents/845`,
      },
      {
        categories: ['OASYS_RISK_ASSESSMENT'],
        createdByUserName: 'Maria Badger',
        createdDateTime: '2021-10-12T13:43:00.000Z',
        details: 'Email sent 12/10/2021',
        version: 1,
        fileName: 'email.msg',
        emailId: '845',
        url: `/recalls/${recallId}/documents/845`,
      },
    ])
  })

  it('returns a list of rescind records', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      rescindRecords: [
        {
          rescindRecordId: '123',
          requestEmailId: '888',
          requestEmailFileName: 'rescind-request.msg',
          requestEmailReceivedDate: '2020-12-08',
          requestDetails: 'Rescind was requested by email',
          approved: true,
          decisionDetails: 'Rescind was confirmed by email',
          decisionEmailId: '999',
          decisionEmailFileName: 'rescind-confirm.msg',
          decisionEmailSentDate: '2020-12-09',
          version: 1,
          createdByUserName: 'Bobby Badger',
          createdDateTime: '2020-12-09T12:24:03.000Z',
          lastUpdatedDateTime: '2020-12-09T12:24:03.000Z',
        },
        {
          rescindRecordId: '456',
          requestEmailId: '111',
          requestEmailFileName: 'rescind-request.msg',
          requestEmailReceivedDate: '2020-12-13',
          requestDetails: 'Rescind was requested by email',
          approved: false,
          decisionDetails: 'Rescind was confirmed by email',
          decisionEmailId: '000',
          decisionEmailFileName: 'rescind-confirm.msg',
          decisionEmailSentDate: '2020-12-14',
          version: 2,
          createdByUserName: 'Brent Badger',
          createdDateTime: '2020-12-13T12:24:03.000Z',
          lastUpdatedDateTime: '2020-12-14T12:24:03.000Z',
        },
      ],
    })
    await recallPageGet('recallIssuesNeeds')(req, res)
    expect(res.locals.recall.rescindRecords).toEqual([
      {
        approved: false,
        createdByUserName: 'Brent Badger',
        createdDateTime: '2020-12-13T12:24:03.000Z',
        decisionDetails: 'Rescind was confirmed by email',
        decisionEmailFileName: 'rescind-confirm.msg',
        decisionEmailId: '000',
        decisionEmailSentDate: '2020-12-14',
        decisionEmailUrl: `/recalls/${recallId}/documents/000`,
        lastUpdatedDateTime: '2020-12-14T12:24:03.000Z',
        requestDetails: 'Rescind was requested by email',
        requestEmailFileName: 'rescind-request.msg',
        requestEmailId: '111',
        requestEmailReceivedDate: '2020-12-13',
        requestEmailUrl: `/recalls/${recallId}/documents/111`,
        rescindRecordId: '456',
        version: 2,
      },
      {
        approved: true,
        createdByUserName: 'Bobby Badger',
        createdDateTime: '2020-12-09T12:24:03.000Z',
        decisionDetails: 'Rescind was confirmed by email',
        decisionEmailFileName: 'rescind-confirm.msg',
        decisionEmailId: '999',
        decisionEmailSentDate: '2020-12-09',
        decisionEmailUrl: `/recalls/${recallId}/documents/999`,
        lastUpdatedDateTime: '2020-12-09T12:24:03.000Z',
        requestDetails: 'Rescind was requested by email',
        requestEmailFileName: 'rescind-request.msg',
        requestEmailId: '888',
        requestEmailReceivedDate: '2020-12-08',
        requestEmailUrl: `/recalls/${recallId}/documents/888`,
        rescindRecordId: '123',
        version: 1,
      },
    ])
  })

  it('should call error middleware on error', async () => {
    const err = new Error('test')
    const next = jest.fn()
    ;(getRecall as jest.Mock).mockRejectedValue(err)
    await recallPageGet('assessRecall')(req, res, next)
    expect(next).toHaveBeenCalledWith(err)
  })
})
