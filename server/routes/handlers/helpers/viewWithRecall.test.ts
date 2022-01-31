// @ts-nocheck
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { viewWithRecall } from './viewWithRecall'
import recall from '../../../../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { getRecall } from '../../../clients/manageRecallsApiClient'
import * as decorateDocsExports from '../documents/download/helpers/decorateDocs'

jest.mock('../../../clients/manageRecallsApiClient')

const nomsNumber = 'AA123AA'
const accessToken = 'abc'
const recallId = '123'

describe('viewWithRecall', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders an error page if get recall errors', async () => {
    ;(getRecall as jest.Mock).mockRejectedValue(new Error('timeout'))
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecall('assessRecall')(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/error')
  })

  it('should attach uploaded documents to res locals', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecall('recallIssuesNeeds')(req, res)
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

    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    res.render = view => {
      expect(res.locals.recall.assessedByUserName).toEqual('Bertie Badger')
      expect(res.locals.recall.bookedByUserName).toEqual('Brenda Badger')
      expect(res.locals.recall.dossierCreatedByUserName).toEqual('Bobby Badger')
      expect(view).toEqual('pages/assessRecall')
      done()
    }
    viewWithRecall('assessRecall')(req, res)
  })

  it('should make reference data available to render', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecall('assessRecall')(req, res)
    expect(res.locals.referenceData).toHaveProperty('reasonsForRecall')
    expect(res.locals.referenceData).toHaveProperty('mappaLevels')
    expect(res.locals.referenceData).toHaveProperty('recallLengths')
    expect(res.locals.referenceData).toHaveProperty('localDeliveryUnits')
    expect(res.locals.referenceData).toHaveProperty('prisons')
    expect(res.locals.referenceData).toHaveProperty('policeForces')
  })

  it('should set previousConvictionMainName to Other value if specified', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({ ...recall, previousConvictionMainName: 'Barry Badger' })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecall('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Barry Badger')
  })

  it('should set previousConvictionMainName to first + last name if specified', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      previousConvictionMainNameCategory: 'FIRST_LAST',
      previousConvictionMainName: '',
    })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecall('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Bobby Badger')
  })

  it('should set previousConvictionMainName to first + middle + last name if specified', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      previousConvictionMainNameCategory: 'FIRST_MIDDLE_LAST',
      previousConvictionMainName: '',
    })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecall('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Bobby John Badger')
  })

  it('should set fullName to first + last name if specified', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      licenceNameCategory: 'FIRST_LAST',
    })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecall('assessRecall')(req, res)
    expect(res.locals.recall.fullName).toEqual('Bobby Badger')
  })

  it('should set fullName to first + middle + last name if specified', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      licenceNameCategory: 'FIRST_MIDDLE_LAST',
    })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecall('assessRecall')(req, res)
    expect(res.locals.recall.fullName).toEqual('Bobby John Badger')
  })

  it('should add overdue recallAssessmentDueText to res.locals given recallAssessmentDueDateTime in the past", ', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecall('assessRecall')(req, res)
    expect(res.locals.recall.recallAssessmentDueText).toEqual(
      'Overdue: recall assessment was due on 6 August 2020 by 16:33'
    )
    expect(res.render).toHaveBeenCalledWith('pages/assessRecall')
  })

  it('should make document data available to render', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({ ...recall, status: RecallResponse.status.BEING_BOOKED_ON })
    jest.spyOn(decorateDocsExports, 'decorateDocs')
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    res.locals.urlInfo = {}
    await viewWithRecall('assessRecall')(req, res)
    expect(res.locals.recall.enableDeleteDocuments).toEqual(true)
    expect(decorateDocsExports.decorateDocs).toHaveBeenCalledWith({
      docs: recall.documents,
      nomsNumber,
      recallId,
      bookingNumber: recall.bookingNumber,
      firstName: recall.firstName,
      lastName: recall.lastName,
      missingDocumentsRecords: recall.missingDocumentsRecords,
    })
  })

  it('should pass document category query string to decorateDocs', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({ ...recall, status: RecallResponse.status.BEING_BOOKED_ON })
    jest.spyOn(decorateDocsExports, 'decorateDocs')
    const req = mockGetRequest({ params: { recallId, nomsNumber }, query: { versionedCategoryName: 'LICENCE' } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    res.locals.urlInfo = {}
    await viewWithRecall('assessRecall')(req, res)
    expect(decorateDocsExports.decorateDocs).toHaveBeenCalledWith({
      docs: recall.documents,
      nomsNumber,
      recallId,
      bookingNumber: recall.bookingNumber,
      firstName: recall.firstName,
      lastName: recall.lastName,
      versionedCategoryName: 'LICENCE',
      missingDocumentsRecords: recall.missingDocumentsRecords,
    })
  })

  it('should sort last known addresses by index in ascending order', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      status: RecallResponse.status.BEING_BOOKED_ON,
      lastKnownAddresses: [{ index: 2 }, { index: 1 }],
    })
    jest.spyOn(decorateDocsExports, 'decorateDocs')
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    res.locals.urlInfo = {}
    await viewWithRecall('assessRecall')(req, res)
    expect(res.locals.recall.lastKnownAddresses.map(a => a.index)).toEqual([1, 2])
  })
})
