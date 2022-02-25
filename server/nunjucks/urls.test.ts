import { backLinkUrl, backLinkUrlAssessDownload, backLinkUrlRecallType, changeLinkUrl } from './urls'
import { RecallResponse } from '../@types/manage-recalls-api/models/RecallResponse'

describe('changeLinkUrl', () => {
  it('adds currentPage as the fromPage param', () => {
    const url = changeLinkUrl(
      'request-received',
      {
        basePath: '/person/123/recalls/456/',
        currentPage: 'check-answers',
      },
      'recallRequest'
    )
    expect(url).toEqual('/person/123/recalls/456/request-received?fromPage=check-answers&fromHash=recallRequest')
  })

  it('adds a hash if supplied', () => {
    const url = changeLinkUrl(
      'last-release',
      { basePath: '/person/123/recalls/456/', currentPage: 'check-answers' },
      'sentenceDetails',
      'sentenceExpiryDateFieldset'
    )
    expect(url).toEqual(
      '/person/123/recalls/456/last-release?fromPage=check-answers&fromHash=sentenceDetails#sentenceExpiryDateFieldset'
    )
  })

  it('appends an extra query string if supplied', () => {
    const url = changeLinkUrl(
      'last-release',
      { basePath: '/person/123/recalls/456/', currentPage: 'check-answers' },
      'sentenceDetails',
      'sentenceExpiryDateFieldset',
      'key=val'
    )
    expect(url).toEqual(
      '/person/123/recalls/456/last-release?fromPage=check-answers&fromHash=sentenceDetails&key=val#sentenceExpiryDateFieldset'
    )
  })
})

describe('backLinkUrl', () => {
  it('uses the fromPage param if supplied', () => {
    const url = backLinkUrl('request-received', {
      fromPage: 'check-answers',
      currentPage: 'check-answers',
      basePath: '/person/123/recalls/456/',
    })
    expect(url).toEqual('/person/123/recalls/456/check-answers')
  })

  it('uses fromPage over a path leading with /', () => {
    const url = backLinkUrl('/find-person?nomsNumber=A1234AA', {
      fromPage: 'check-answers',
      currentPage: 'check-answers',
      basePath: '/person/123/recalls/456/',
    })
    expect(url).toEqual('/person/123/recalls/456/check-answers')
  })

  it('uses the fromHash param if supplied', () => {
    const url = backLinkUrl('request-received', {
      fromPage: 'check-answers',
      fromHash: 'sentenceDetails',
      currentPage: 'check-answers',
      basePath: '/person/123/recalls/456/',
    })
    expect(url).toEqual('/person/123/recalls/456/check-answers#sentenceDetails')
  })

  it('uses the path parameter if fromPage param not supplied', () => {
    const url = backLinkUrl('request-received', { basePath: '/person/123/recalls/456/', currentPage: 'check-answers' })
    expect(url).toEqual('/person/123/recalls/456/request-received')
  })

  it("doesn't use the basePath if the path has a leading /", () => {
    const url = backLinkUrl('/', { basePath: '', fromPage: '/', currentPage: 'view-recall' })
    expect(url).toEqual('/')
  })

  it('uses the fromHash param if the path has a leading /', () => {
    const url = backLinkUrl('/', {
      fromPage: '/',
      fromHash: 'completed',
      currentPage: 'view-recall',
      basePath: '',
    })
    expect(url).toEqual('/#completed')
  })
})

describe('backLinkUrlRecallType', () => {
  it('returns to custody-status if inCustodyAtBooking is true', () => {
    const url = backLinkUrlRecallType({
      inCustodyAtBooking: true,
      lastKnownAddressOption: undefined,
      urlInfo: { basePath: '/recalls/', currentPage: 'request-received' },
    })
    expect(url).toEqual('/recalls/custody-status')
  })

  it('returns to address-list if inCustodyAtBooking is false and lastKnownAddressOption is YES', () => {
    const url = backLinkUrlRecallType({
      inCustodyAtBooking: false,
      lastKnownAddressOption: 'YES' as RecallResponse.lastKnownAddressOption,
      urlInfo: { basePath: '/recalls/', currentPage: 'request-received' },
    })
    expect(url).toEqual('/recalls/address-list')
  })

  it('returns to last-known-address if inCustodyAtBooking is false and lastKnownAddressOption is not YES', () => {
    const url = backLinkUrlRecallType({
      inCustodyAtBooking: false,
      lastKnownAddressOption: 'NO_FIXED_ABODE' as RecallResponse.lastKnownAddressOption,
      urlInfo: { basePath: '/recalls/', currentPage: 'request-received' },
    })
    expect(url).toEqual('/recalls/last-known-address')
  })
})

describe('backLinkUrlAssessDownload', () => {
  it('returns to assess-licence if inCustodyAtBooking is true', () => {
    const url = backLinkUrlAssessDownload({
      inCustodyAtBooking: true,
      inCustodyAtAssessment: false,
      urlInfo: { basePath: '/recalls/', currentPage: 'assess-download' },
    })
    expect(url).toEqual('/recalls/assess-licence')
  })

  it('returns to assess-custody-status if inCustodyAtBooking is false and inCustodyAtAssessment is false', () => {
    const url = backLinkUrlAssessDownload({
      inCustodyAtBooking: false,
      inCustodyAtAssessment: false,
      urlInfo: { basePath: '/recalls/', currentPage: 'assess-download' },
    })
    expect(url).toEqual('/recalls/assess-custody-status')
  })

  it('returns to assess-prison if inCustodyAtBooking is false and inCustodyAtAssessment is true', () => {
    const url = backLinkUrlAssessDownload({
      inCustodyAtBooking: false,
      inCustodyAtAssessment: true,
      urlInfo: { basePath: '/recalls/', currentPage: 'assess-download' },
    })
    expect(url).toEqual('/recalls/assess-prison')
  })
})
