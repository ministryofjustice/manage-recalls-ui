import { enableDeleteDocuments } from './index'
import { UrlInfo } from '../../../../@types'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'

describe('enableDeleteDocuments', () => {
  it('should return true if recall is being booked on and fromPage is valid', () => {
    expect(enableDeleteDocuments(RecallResponse.status.BEING_BOOKED_ON, { fromPage: 'check-answers' } as UrlInfo)).toBe(
      true
    )
  })

  it('should return true if recall is being booked on and fromPage is not set', () => {
    expect(enableDeleteDocuments(RecallResponse.status.BEING_BOOKED_ON, {} as UrlInfo)).toBe(true)
  })

  it('should return false if recall is being booked on and fromPage is invalid', () => {
    expect(enableDeleteDocuments(RecallResponse.status.BEING_BOOKED_ON, { fromPage: 'view-recall' } as UrlInfo)).toBe(
      false
    )
  })

  it('should return false if recall is not being booked on and fromPage is valid', () => {
    expect(enableDeleteDocuments(RecallResponse.status.BOOKED_ON, {} as UrlInfo)).toBe(false)
  })
})
