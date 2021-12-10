// @ts-nocheck
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { viewWithRecallAndPerson } from './viewWithRecallAndPerson'
import recall from '../../../../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { searchByNomsNumber, getRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import * as decorateDocsExports from '../documents/download/helpers/decorateDocs'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

const nomsNumber = 'AA123AA'
const accessToken = 'abc'
const recallId = '123'

describe('viewWithRecallAndPerson', () => {
  const person = {
    firstName: 'Bobby',
    middleNames: 'Barnaby',
    lastName: 'Badger',
    dateOfBirth: '1999-05-28',
    gender: 'Male',
    nomsNumber,
    croNumber: '1234/56A',
    pncNumber: '98/7654Z',
  }

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders an error page if person search errors', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    ;(searchByNomsNumber as jest.Mock).mockRejectedValue(new Error('timeout'))
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/error')
  })

  it('renders an error page if get recall errors', async () => {
    ;(getRecall as jest.Mock).mockRejectedValue(new Error('timeout'))
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(recall)
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.render).toHaveBeenCalledWith('pages/error')
  })

  it('should attach uploaded documents to res locals', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('recallIssuesNeeds')(req, res)
    expect(res.locals.recall.documentsUploaded).toEqual([
      {
        category: 'PART_A_RECALL_REPORT',
        createdDateTime: '2020-12-05T18:33:57.000Z',
        createdByUserName: 'Arnold Caseworker',
        documentId: '34bdf-5717-4562-b3fc-2c963f66afa6',
        fileName: 'Bobby Badger Part A.pdf',
        label: 'Part A recall report',
        labelLowerCase: 'part A recall report',
        standardFileName: 'Part A.pdf',
        suggestedCategory: 'PART_A_RECALL_REPORT',
        type: 'document',
        url: '/persons/AA123AA/recalls/123/documents/34bdf-5717-4562-b3fc-2c963f66afa6',
      },
      {
        category: 'LICENCE',
        createdDateTime: '2020-12-05T18:33:57.000Z',
        createdByUserName: 'Arnold Caseworker',
        documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        fileName: 'Bobby Badger licence.pdf',
        label: 'Licence',
        standardFileName: 'Licence.pdf',
        suggestedCategory: 'LICENCE',
        type: 'document',
        url: '/persons/AA123AA/recalls/123/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      {
        category: 'PREVIOUS_CONVICTIONS_SHEET',
        createdDateTime: '2020-12-05T18:33:57.000Z',
        createdByUserName: 'Arnold Caseworker',
        documentId: '1234-5717-4562-b3fc-2c963f66afa6',
        fileName: 'Bobby Badger pre cons.pdf',
        label: 'Previous convictions sheet',
        standardFileName: 'Pre Cons.pdf',
        suggestedCategory: 'PREVIOUS_CONVICTIONS_SHEET',
        type: 'document',
        url: '/persons/AA123AA/recalls/123/documents/1234-5717-4562-b3fc-2c963f66afa6',
      },
      {
        category: 'PRE_SENTENCING_REPORT',
        createdDateTime: '2020-12-05T18:33:57.000Z',
        createdByUserName: 'Arnold Caseworker',
        documentId: '4563456-5717-4562-b3fc-2c963f66afa6',
        fileName: 'Bobby Badger presentencing.pdf',
        label: 'Pre-sentencing report',
        standardFileName: 'PSR.pdf',
        suggestedCategory: 'PRE_SENTENCING_REPORT',
        type: 'document',
        url: '/persons/AA123AA/recalls/123/documents/4563456-5717-4562-b3fc-2c963f66afa6',
      },
    ])
    expect(res.render).toHaveBeenCalledWith('pages/recallIssuesNeeds')
  })

  it('should return person and recall data and assessed by user name from api for a valid noms number and recallId', done => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
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
    viewWithRecallAndPerson('assessRecall')(req, res)
  })

  it('should make reference data available to render', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.referenceData).toHaveProperty('reasonsForRecall')
    expect(res.locals.referenceData).toHaveProperty('mappaLevels')
    expect(res.locals.referenceData).toHaveProperty('recallLengths')
    expect(res.locals.referenceData).toHaveProperty('localDeliveryUnits')
    expect(res.locals.referenceData).toHaveProperty('prisons')
    expect(res.locals.referenceData).toHaveProperty('policeForces')
  })

  it('should set previousConvictionMainName to Other value if specified', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue({ ...recall, previousConvictionMainName: 'Barry Badger' })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Barry Badger')
  })

  it('should set previousConvictionMainName to first + last name if specified', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      previousConvictionMainNameCategory: 'FIRST_LAST',
      previousConvictionMainName: '',
    })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Bobby Badger')
  })

  it('should set previousConvictionMainName to first + middle + last name if specified', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      previousConvictionMainNameCategory: 'FIRST_MIDDLE_LAST',
      previousConvictionMainName: '',
    })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Bobby John Badger')
  })

  it('should set fullName to first + last name if specified', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      licenceNameCategory: 'FIRST_LAST',
    })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.fullName).toEqual('Bobby Badger')
  })

  it('should set fullName to first + middle + last name if specified', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue({
      ...recall,
      licenceNameCategory: 'FIRST_MIDDLE_LAST',
    })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.fullName).toEqual('Bobby John Badger')
  })

  it('should add overdue recallAssessmentDueText to res.locals given recallAssessmentDueDateTime in the past", ', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.recallAssessmentDueText).toEqual(
      'Overdue: recall assessment was due on 6 August 2020 by 16:33'
    )
    expect(res.render).toHaveBeenCalledWith('pages/assessRecall')
  })

  it('should make document data available to render', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue({ ...recall, status: RecallResponse.status.BEING_BOOKED_ON })
    jest.spyOn(decorateDocsExports, 'decorateDocs')
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    res.locals.urlInfo = {}
    await viewWithRecallAndPerson('assessRecall')(req, res)
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
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue({ ...recall, status: RecallResponse.status.BEING_BOOKED_ON })
    jest.spyOn(decorateDocsExports, 'decorateDocs')
    const req = mockGetRequest({ params: { recallId, nomsNumber }, query: { versionedCategoryName: 'LICENCE' } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    res.locals.urlInfo = {}
    await viewWithRecallAndPerson('assessRecall')(req, res)
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
})
