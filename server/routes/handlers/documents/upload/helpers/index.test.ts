import * as docExports from './index'
import { UrlInfo } from '../../../../../@types'
import { RecallResponse } from '../../../../../@types/manage-recalls-api/models/RecallResponse'
import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { getGeneratedDocFileName, getGeneratedDocUrlPath } from '../../download/helpers'

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
  it('uses the supplied category', () => {
    const details = 'Extra details'
    const result = makeMetaDataForFile(
      {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('def', 'base64'),
      } as Express.Multer.File,
      RecallDocument.category.LICENCE,
      details
    )
    expect(result.category).toEqual(RecallDocument.category.LICENCE)
    expect(result.details).toEqual(details)
  })
})

describe('getGeneratedDocFileName', () => {
  const args = {
    firstName: 'Bobby',
    lastName: 'Badger',
    bookingNumber: 'A1234BC',
  }

  it('returns a filename for recall notification', () => {
    const fileName = getGeneratedDocFileName({ ...args, docCategory: RecallDocument.category.RECALL_NOTIFICATION })
    expect(fileName).toEqual('IN CUSTODY RECALL BADGER BOBBY A1234BC.pdf')
  })

  it('returns a filename for dossier', () => {
    const fileName = getGeneratedDocFileName({ ...args, docCategory: RecallDocument.category.DOSSIER })
    expect(fileName).toEqual('BADGER BOBBY A1234BC RECALL DOSSIER.pdf')
  })

  it('returns a filename for letter to prison', () => {
    const fileName = getGeneratedDocFileName({ ...args, docCategory: RecallDocument.category.LETTER_TO_PRISON })
    expect(fileName).toEqual('BADGER BOBBY A1234BC LETTER TO PRISON.pdf')
  })

  it('returns a filename for revocation order', () => {
    const fileName = getGeneratedDocFileName({ ...args, docCategory: RecallDocument.category.REVOCATION_ORDER })
    expect(fileName).toEqual('BADGER BOBBY A1234BC REVOCATION ORDER.pdf')
  })

  it('returns a filename for reasons for recall', () => {
    const fileName = getGeneratedDocFileName({ ...args, docCategory: RecallDocument.category.REASONS_FOR_RECALL })
    expect(fileName).toEqual('BADGER BOBBY A1234BC REASONS FOR RECALL.pdf')
  })

  it('returns a default for an unrecognised category', () => {
    const fileName = getGeneratedDocFileName({ ...args, docCategory: 'test' as RecallDocument.category })
    expect(fileName).toEqual('document.pdf')
  })
})

describe('getGeneratedDocUrlPath', () => {
  const args = {
    recallId: '123',
    nomsNumber: '456',
    documentId: '789',
  }

  it('returns a url for recall notification', () => {
    const url = getGeneratedDocUrlPath({ ...args, docCategory: RecallDocument.category.RECALL_NOTIFICATION })
    expect(url).toEqual('/persons/456/recalls/123/documents/recall-notification')
  })

  it('returns a url for dossier', () => {
    const url = getGeneratedDocUrlPath({ ...args, docCategory: RecallDocument.category.DOSSIER })
    expect(url).toEqual('/persons/456/recalls/123/documents/dossier')
  })

  it('returns a url for letter to prison', () => {
    const url = getGeneratedDocUrlPath({ ...args, docCategory: RecallDocument.category.LETTER_TO_PRISON })
    expect(url).toEqual('/persons/456/recalls/123/documents/letter-to-prison')
  })

  it('returns a url for revocation order', () => {
    const url = getGeneratedDocUrlPath({ ...args, docCategory: RecallDocument.category.REVOCATION_ORDER })
    expect(url).toEqual('/persons/456/recalls/123/documents/revocation-order/789')
  })

  it('returns a url for reasons for recall', () => {
    const url = getGeneratedDocUrlPath({ ...args, docCategory: RecallDocument.category.REASONS_FOR_RECALL })
    expect(url).toEqual('/persons/456/recalls/123/documents/reasons-for-recall/789')
  })

  it('returns undefined for an unrecognised category', () => {
    const url = getGeneratedDocUrlPath({ ...args, docCategory: 'test' as RecallDocument.category })
    expect(url).toBeUndefined()
  })
})
