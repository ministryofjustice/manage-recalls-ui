// @ts-nocheck
import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { viewWithRecallAndPerson } from './viewWithRecallAndPerson'
import recall from '../../../../fake-manage-recalls-api/stubs/__files/get-recall.json'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'
import { searchByNomsNumber, getRecall, getUserDetails } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import * as decorateDocsExports from './documents/decorateDocs'
import { findDocCategory } from './documents'
import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

const nomsNumber = 'AA123AA'
const accessToken = 'abc'
const recallId = '123'
const assessedByUserId = '00000000-0000-0000-0000-000000000000'
const bookedByUserId = '00000000-1111-0000-0000-000000000000'
const dossierCreatedByUserId = '00000000-2222-0000-0000-000000000000'

describe('viewWithRecallAndPerson', () => {
  const person = {
    firstName: 'Bobby',
    lastName: 'Badger',
    dateOfBirth: '1999-05-28',
    gender: 'Male',
    nomsNumber,
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

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('throws if person search errors', async () => {
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    ;(searchByNomsNumber as jest.Mock).mockRejectedValue(new Error('timeout'))
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    try {
      await viewWithRecallAndPerson('assessRecall')(req, res)
    } catch (err) {
      expect(err.message).toEqual('getPerson failed for NOMS')
    }
  })

  it('should return person and recall data and assessed by user name from api for a valid noms number and recallId', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    ;(getUserDetails as jest.Mock).mockImplementation(userId => {
      if (userId === assessedByUserId) {
        return Promise.resolve(assessedByUserDetails)
      }
      if (userId === bookedByUserId) {
        return Promise.resolve(bookedByUserDetails)
      }
      if (userId === dossierCreatedByUserId) {
        return Promise.resolve(dossierCreatedByUserDetails)
      }
      return null
    })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.documents).toEqual([
      {
        ...findDocCategory(ApiRecallDocument.category.PART_A_RECALL_REPORT),
        category: ApiRecallDocument.category.PART_A_RECALL_REPORT,
        documentId: '34bdf-5717-4562-b3fc-2c963f66afa6',
        url: '/persons/AA123AA/recalls/123/documents/34bdf-5717-4562-b3fc-2c963f66afa6',
      },
      {
        ...findDocCategory(ApiRecallDocument.category.LICENCE),
        category: 'LICENCE',
        documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        url: '/persons/AA123AA/recalls/123/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      {
        ...findDocCategory(ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET),
        category: 'PREVIOUS_CONVICTIONS_SHEET',
        documentId: '1234-5717-4562-b3fc-2c963f66afa6',
        url: '/persons/AA123AA/recalls/123/documents/1234-5717-4562-b3fc-2c963f66afa6',
      },
      {
        ...findDocCategory(ApiRecallDocument.category.PRE_SENTENCING_REPORT),
        documentId: '4563456-5717-4562-b3fc-2c963f66afa6',
        category: 'PRE_SENTENCING_REPORT',
        url: '/persons/AA123AA/recalls/123/documents/4563456-5717-4562-b3fc-2c963f66afa6',
      },
    ])
    expect(res.locals.recall.assessedByUserName).toEqual('Bertie Badger')
    expect(res.locals.recall.bookedByUserName).toEqual('Brenda Badger')
    expect(res.locals.recall.dossierCreatedByUserName).toEqual('Bobby Badger')
    expect(res.render).toHaveBeenCalledWith('pages/assessRecall')
  })

  it('should add user ids to res.locals if the user details can not be found ', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    ;(getUserDetails as jest.Mock).mockRejectedValue(new Error('timeout'))
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.assessedByUserName).toEqual(assessedByUserId)
    expect(res.locals.recall.bookedByUserName).toEqual(bookedByUserId)
    expect(res.locals.recall.dossierCreatedByUserName).toEqual(dossierCreatedByUserId)
    expect(res.render).toHaveBeenCalledWith('pages/assessRecall')
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
  })

  it('should previousConvictionMainName if one was specified', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue({ ...recall, previousConvictionMainName: 'Barry Badger' })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Barry Badger')
  })

  it('should fall back to default name if a different previousConvictionMainName is not saved', async () => {
    ;(searchByNomsNumber as jest.Mock).mockResolvedValue(person)
    ;(getRecall as jest.Mock).mockResolvedValue({ ...recall, previousConvictionMainName: '' })
    const req = mockGetRequest({ params: { recallId, nomsNumber } })
    const { res } = mockResponseWithAuthenticatedUser(accessToken)
    await viewWithRecallAndPerson('assessRecall')(req, res)
    expect(res.locals.recall.previousConvictionMainName).toEqual('Bobby Badger')
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
      ...person,
    })
  })
})
