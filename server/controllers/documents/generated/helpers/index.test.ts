import { formatGeneratedDocFileName } from './index'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'

describe('formatGeneratedDocFileName', () => {
  const recall = {
    firstName: 'Bobby',
    lastName: 'Badger',
    bookingNumber: 'A1234BC',
    inCustodyAtBooking: true,
    status: RecallResponse.status.BOOKED_ON,
  } as RecallResponse

  it('returns a filename for in custody recall notification', () => {
    const fileName = formatGeneratedDocFileName({ recall, category: RecallDocument.category.RECALL_NOTIFICATION })
    expect(fileName).toEqual('IN CUSTODY RECALL BADGER BOBBY A1234BC.pdf')
  })

  it('returns a filename for not in custody recall notification', () => {
    const fileName = formatGeneratedDocFileName({
      recall: {
        ...recall,
        status: RecallResponse.status.ASSESSED_NOT_IN_CUSTODY,
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
      },
      category: RecallDocument.category.RECALL_NOTIFICATION,
    })
    expect(fileName).toEqual('NOT IN CUSTODY RECALL BADGER BOBBY A1234BC.pdf')
  })

  it('returns a filename for dossier', () => {
    const fileName = formatGeneratedDocFileName({ recall, category: RecallDocument.category.DOSSIER })
    expect(fileName).toEqual('BADGER BOBBY A1234BC RECALL DOSSIER.pdf')
  })

  it('returns a filename for letter to prison', () => {
    const fileName = formatGeneratedDocFileName({ recall, category: RecallDocument.category.LETTER_TO_PRISON })
    expect(fileName).toEqual('BADGER BOBBY A1234BC LETTER TO PRISON.pdf')
  })

  it('returns a filename for revocation order', () => {
    const fileName = formatGeneratedDocFileName({ recall, category: RecallDocument.category.REVOCATION_ORDER })
    expect(fileName).toEqual('BADGER BOBBY A1234BC REVOCATION ORDER.pdf')
  })

  it('returns a filename for reasons for recall', () => {
    const fileName = formatGeneratedDocFileName({ recall, category: RecallDocument.category.REASONS_FOR_RECALL })
    expect(fileName).toEqual('BADGER BOBBY A1234BC REASONS FOR RECALL.pdf')
  })

  it('returns a default for an unrecognised category', () => {
    const fileName = formatGeneratedDocFileName({ recall, category: 'test' as RecallDocument.category })
    expect(fileName).toEqual('document.pdf')
  })
})
