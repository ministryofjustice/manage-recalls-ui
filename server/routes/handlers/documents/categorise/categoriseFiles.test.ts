// @ts-nocheck
import {
  addRecallDocument,
  getRecall,
  setDocumentCategory,
} from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { categoriseFiles } from './categoriseFiles'
import { getPerson } from '../../helpers/personCache'

jest.mock('../../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../../helpers/personCache')

describe('categoriseFiles', () => {
  let req
  let res

  const nomsNumber = '456'
  const recallId = '789'
  const person = { firstName: 'Bobby', lastName: 'Badger' }

  beforeEach(() => {
    req = { params: { nomsNumber, recallId }, body: { continue: 'continue' }, session: {} }
    res = {
      locals: { user: {}, urlInfo: {} },
      redirect: jest.fn(),
    }
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'PreCons Wesley Holt.pdf',
        },
      ],
    })
  })

  afterEach(() => jest.resetAllMocks())

  it('saves category changes for existing uploads', async () => {
    ;(setDocumentCategory as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    req.body = {
      'category-a0388485-315b-4630-b230-33f808047633': 'PREVIOUS_CONVICTIONS_SHEET',
      'category-8f13251d-26f0-4e5b-8fbb-259ca97e8669': 'PRE_SENTENCING_REPORT',
    }
    await categoriseFiles(req, res)
    expect(setDocumentCategory).toHaveBeenCalledTimes(2)
    expect(addRecallDocument).not.toHaveBeenCalled()
  })

  it('creates an error if more than one document has the same category', done => {
    req.body = {
      'category-123': 'LICENCE',
      'category-456': 'LICENCE',
    }
    res.redirect = () => {
      expect(req.session.errors).toEqual([
        {
          href: '#456',
          name: '456',
          text: 'You can only upload one licence',
        },
      ])
      done()
    }
    categoriseFiles(req, res)
  })

  it("redirects to Check your answers if a fromPage isn't supplied", done => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence Wesley Holt.pdf',
        },
        {
          category: 'PART_A_RECALL_REPORT',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Part A Wesley Holt.pdf',
        },
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Pre Cons Wesley Holt.pdf',
        },
        {
          category: 'OASYS_RISK_ASSESSMENT',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'OAsys Wesley Holt.pdf',
        },
      ],
    })
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    res = {
      ...res,
      locals: {
        user: {},
        urlInfo: {
          basePath: `/persons/123/recalls/456/`,
        },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(`/persons/123/recalls/456/check-answers`)
        done()
      },
    }
    categoriseFiles(req, res)
  })

  it('redirects to fromPage if one is supplied in res.locals, and there are no missing documents', done => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    res = {
      ...res,
      locals: {
        user: {},
        urlInfo: {
          basePath: `/persons/123/recalls/456/`,
          fromPage: 'dossier-recall',
        },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(`/persons/123/recalls/456/dossier-recall`)
        done()
      },
    }
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'PART_A_RECALL_REPORT',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Part A.pdf',
        },
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence Wesley Holt.pdf',
        },
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Pre Cons Wesley Holt.pdf',
        },
        {
          category: 'OASYS_RISK_ASSESSMENT',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'OAsys Wesley Holt.pdf',
        },
      ],
    })
    categoriseFiles(req, res)
  })

  it("redirects to Missing documents if a required doc isn't supplied", done => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence Wesley Holt.pdf',
        },
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Pre Cons Wesley Holt.pdf',
        },
        {
          category: 'OASYS_RISK_ASSESSMENT',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'OAsys Wesley Holt.pdf',
        },
      ],
    })
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    res = {
      ...res,
      locals: {
        user: {},
        urlInfo: {
          basePath: `/persons/123/recalls/456/`,
        },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(`/persons/123/recalls/456/missing-documents`)
        done()
      },
    }
    categoriseFiles(req, res)
  })

  it('adds a fromPage querystring to Missing documents URL if one is present', done => {
    ;(addRecallDocument as jest.Mock).mockResolvedValue({
      documentId: '123',
    })
    ;(getRecall as jest.Mock).mockResolvedValue({
      bookingNumber: '123',
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence Wesley Holt.pdf',
        },
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Pre Cons Wesley Holt.pdf',
        },
        {
          category: 'OASYS_RISK_ASSESSMENT',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'OAsys Wesley Holt.pdf',
        },
      ],
    })
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    res = {
      ...res,
      locals: {
        user: {},
        urlInfo: {
          basePath: `/persons/123/recalls/456/`,
          fromPage: 'assess',
          fromHash: 'documents',
        },
      },
      redirect: (httpStatus, path) => {
        expect(httpStatus).toEqual(303)
        expect(path).toEqual(`/persons/123/recalls/456/missing-documents?fromPage=assess#documents`)
        done()
      },
    }
    categoriseFiles(req, res)
  })
})
