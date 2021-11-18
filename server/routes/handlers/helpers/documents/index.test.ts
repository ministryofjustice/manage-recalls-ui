import * as docExports from './index'
import { UrlInfo } from '../../../../@types'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'
import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'

const { enableDeleteDocuments, makeMetaDataForFile } = docExports

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

describe('makeMetaDataForFile', () => {
  it('uses a forced category if supplied', () => {
    const result = makeMetaDataForFile(
      {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('def', 'base64'),
      } as Express.Multer.File,
      ApiRecallDocument.category.LICENCE
    )
    expect(result.category).toEqual(ApiRecallDocument.category.LICENCE)
  })

  it('autocategorises if a forced category is not supplied', () => {
    const result = makeMetaDataForFile({
      originalname: 'Part A.pdf',
      mimetype: 'application/pdf',
      buffer: Buffer.from('def', 'base64'),
    } as Express.Multer.File)
    expect(result.category).toEqual('PART_A_RECALL_REPORT')
  })
})
