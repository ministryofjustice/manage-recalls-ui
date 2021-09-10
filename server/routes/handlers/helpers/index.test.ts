import { decorateDocs, makeErrorObject } from './index'
import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'

describe('makeErrorObject', () => {
  it('returns an error object', () => {
    const error = makeErrorObject({
      id: 'recallEmailReceivedDateTime',
      text: 'Date and time you received the recall email',
      values: { year: '2021', month: '10', day: '3', hour: '', minute: '' },
    })
    expect(error).toEqual({
      href: '#recallEmailReceivedDateTime',
      name: 'recallEmailReceivedDateTime',
      text: 'Date and time you received the recall email',
      values: {
        day: '3',
        hour: '',
        minute: '',
        month: '10',
        year: '2021',
      },
    })
  })
})

describe('decorateDocs', () => {
  const docs = [
    {
      category: ApiRecallDocument.category.LICENCE,
      documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    },
    {
      category: ApiRecallDocument.category.PART_A_RECALL_REPORT,
      documentId: '34bdf-5717-4562-b3fc-2c963f66afa6',
    },
    {
      category: ApiRecallDocument.category.RECALL_NOTIFICATION_EMAIL,
      documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
      fileName: '2021-07-03 Phil Jones recall.msg',
    },
    {
      category: ApiRecallDocument.category.DOSSIER_EMAIL,
      documentId: '37423-2389347-234',
      fileName: 'dossier.msg',
    },
  ]
  const nomsNumber = 'A123'
  const recallId = 'abc-456'
  it('filters out recall email document type', () => {
    const results = decorateDocs({ docs, nomsNumber, recallId })
    expect(results).toEqual({
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          label: 'Licence',
          name: 'LICENCE',
          type: 'document',
          url: '/persons/A123/recalls/abc-456/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
        {
          category: 'PART_A_RECALL_REPORT',
          documentId: '34bdf-5717-4562-b3fc-2c963f66afa6',
          label: 'Part A recall report',
          name: 'PART_A_RECALL_REPORT',
          type: 'document',
          url: '/persons/A123/recalls/abc-456/documents/34bdf-5717-4562-b3fc-2c963f66afa6',
        },
      ],
      dossierEmail: {
        category: 'DOSSIER_EMAIL',
        documentId: '37423-2389347-234',
        fileName: 'dossier.msg',
        label: 'Dossier email',
        name: 'DOSSIER_EMAIL',
        type: 'email',
        url: '/persons/A123/recalls/abc-456/documents/37423-2389347-234',
      },
      recallNotificationEmail: {
        category: 'RECALL_NOTIFICATION_EMAIL',
        documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
        fileName: '2021-07-03 Phil Jones recall.msg',
        label: 'Recall notification email',
        name: 'RECALL_NOTIFICATION_EMAIL',
        type: 'email',
        url: '/persons/A123/recalls/abc-456/documents/64bdf-3455-8542-c3ac-8c963f66afa6',
      },
    })
  })
})
