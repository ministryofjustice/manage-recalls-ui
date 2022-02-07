import * as docExports from './index'
import { UrlInfo } from '../../../../../@types'
import { RecallResponse } from '../../../../../@types/manage-recalls-api/models/RecallResponse'
import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { getGeneratedDocFileName } from '../../download/helpers'

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
    inCustody: true,
  }

  it('returns a filename for in custody recall notification', () => {
    const fileName = getGeneratedDocFileName({ ...args, category: RecallDocument.category.RECALL_NOTIFICATION })
    expect(fileName).toEqual('IN CUSTODY RECALL BADGER BOBBY A1234BC.pdf')
  })

  it('returns a filename for not in custody recall notification', () => {
    const fileName = getGeneratedDocFileName({
      ...args,
      inCustody: false,
      category: RecallDocument.category.RECALL_NOTIFICATION,
    })
    expect(fileName).toEqual('NOT IN CUSTODY RECALL BADGER BOBBY A1234BC.pdf')
  })

  it('returns a filename for dossier', () => {
    const fileName = getGeneratedDocFileName({ ...args, category: RecallDocument.category.DOSSIER })
    expect(fileName).toEqual('BADGER BOBBY A1234BC RECALL DOSSIER.pdf')
  })

  it('returns a filename for letter to prison', () => {
    const fileName = getGeneratedDocFileName({ ...args, category: RecallDocument.category.LETTER_TO_PRISON })
    expect(fileName).toEqual('BADGER BOBBY A1234BC LETTER TO PRISON.pdf')
  })

  it('returns a filename for revocation order', () => {
    const fileName = getGeneratedDocFileName({ ...args, category: RecallDocument.category.REVOCATION_ORDER })
    expect(fileName).toEqual('BADGER BOBBY A1234BC REVOCATION ORDER.pdf')
  })

  it('returns a filename for reasons for recall', () => {
    const fileName = getGeneratedDocFileName({ ...args, category: RecallDocument.category.REASONS_FOR_RECALL })
    expect(fileName).toEqual('BADGER BOBBY A1234BC REASONS FOR RECALL.pdf')
  })

  it('returns a default for an unrecognised category', () => {
    const fileName = getGeneratedDocFileName({ ...args, category: 'test' as RecallDocument.category })
    expect(fileName).toEqual('document.pdf')
  })
})
