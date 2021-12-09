import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { decorateDocs } from './decorateDocs'
import { findDocCategory } from '../../upload/helpers'
import { DocumentDecorations } from '../../../../../@types'

describe('decorateDocs', () => {
  const docs = [
    {
      category: RecallDocument.category.OTHER,
      documentId: '2345-65434-3455-23432',
      fileName: 'other doc 1.pdf',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
    },
    {
      category: RecallDocument.category.LICENCE,
      documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      version: 1,
      createdDateTime: '2020-04-01T12:00:00.000Z',
      createdByUserName: 'Arnold Caseworker',
      fileName: 'Bobby Badger licence.pdf',
    },
    {
      category: RecallDocument.category.OTHER,
      documentId: '1234-8766-2344-5342',
      fileName: 'other doc 2.pdf',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
    },
    {
      category: RecallDocument.category.RECALL_NOTIFICATION_EMAIL,
      documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
      fileName: '2021-07-03 Phil Jones recall.msg',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
    },
    {
      category: RecallDocument.category.RECALL_REQUEST_EMAIL,
      documentId: '1234-3455-8542-c3ac-8c963f66afa6',
      fileName: 'recall-request.eml',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
    },
    {
      category: RecallDocument.category.DOSSIER_EMAIL,
      documentId: '37423-2389347-234',
      fileName: 'dossier.msg',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
    },
    {
      category: RecallDocument.category.MISSING_DOCUMENTS_EMAIL,
      documentId: '845',
      fileName: 'missing-docs.msg',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
    },
    {
      category: RecallDocument.category.RECALL_NOTIFICATION,
      documentId: '828',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'RECALL_NOTIFICATION.pdf',
    },
    {
      category: RecallDocument.category.LETTER_TO_PRISON,
      documentId: '838',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'LETTER_TO_PRISON.pdf',
    },
    {
      category: RecallDocument.category.DOSSIER,
      documentId: '848',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'DOSSIER.pdf',
    },
    {
      category: RecallDocument.category.REASONS_FOR_RECALL,
      documentId: '858',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'REASONS_FOR_RECALL.pdf',
    },
    {
      category: RecallDocument.category.REVOCATION_ORDER,
      documentId: '868',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'REVOCATION_ORDER.pdf',
    },
  ] as RecallDocument[]
  const missingDocumentsRecords = [
    {
      missingDocumentsRecordId: '1234',
      emailId: '845',
      emailFileName: 'email.msg',
      categories: [RecallDocument.category.PART_A_RECALL_REPORT],
      detail: 'Email sent 12/10/2021',
      version: 1,
      createdByUserId: '6544',
      createdDateTime: '2021-10-12T13:43:00.000Z',
    },
  ]
  const nomsNumber = 'A123'
  const recallId = 'abc-456'
  let results: DocumentDecorations

  beforeEach(() => {
    results = decorateDocs({
      docs,
      nomsNumber,
      recallId,
      firstName: 'Bobby',
      lastName: 'Badger',
      bookingNumber: '123',
      versionedCategoryName: 'LICENCE',
      missingDocumentsRecords,
    })
  })

  it('returns document categories included the docs uploaded for each', () => {
    expect(results.documentCategories).toEqual([
      {
        ...findDocCategory(RecallDocument.category.UNCATEGORISED),
        uploaded: [],
      },
      {
        ...findDocCategory(RecallDocument.category.PART_A_RECALL_REPORT),
        uploaded: [],
      },
      {
        ...findDocCategory(RecallDocument.category.LICENCE),
        uploaded: [
          {
            category: 'LICENCE',
            suggestedCategory: 'LICENCE',
            documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
            fileName: 'Bobby Badger licence.pdf',
            standardFileName: 'Licence.pdf',
            url: '/persons/A123/recalls/abc-456/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
            version: 1,
            createdDateTime: '2020-04-01T12:00:00.000Z',
            createdByUserName: 'Arnold Caseworker',
          },
        ],
      },
      {
        ...findDocCategory(RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET),
        uploaded: [],
      },
      {
        ...findDocCategory(RecallDocument.category.PRE_SENTENCING_REPORT),
        uploaded: [],
      },
      {
        ...findDocCategory(RecallDocument.category.OASYS_RISK_ASSESSMENT),
        uploaded: [],
      },
      {
        ...findDocCategory(RecallDocument.category.CHARGE_SHEET),
        uploaded: [],
      },
      {
        ...findDocCategory(RecallDocument.category.CPS_PAPERS),
        uploaded: [],
      },
      {
        ...findDocCategory(RecallDocument.category.POLICE_REPORT),
        uploaded: [],
      },
      {
        ...findDocCategory(RecallDocument.category.EXCLUSION_ZONE_MAP),
        uploaded: [],
      },
      {
        ...findDocCategory(RecallDocument.category.OTHER),
        uploaded: [
          {
            category: 'OTHER',
            suggestedCategory: 'OTHER',
            documentId: '2345-65434-3455-23432',
            fileName: 'other doc 1.pdf',
            url: '/persons/A123/recalls/abc-456/documents/2345-65434-3455-23432',
            createdByUserName: 'Arnold Caseworker',
            createdDateTime: '2020-04-01T12:00:00.000Z',
          },
          {
            category: 'OTHER',
            suggestedCategory: 'OTHER',
            documentId: '1234-8766-2344-5342',
            fileName: 'other doc 2.pdf',
            url: '/persons/A123/recalls/abc-456/documents/1234-8766-2344-5342',
            createdByUserName: 'Arnold Caseworker',
            createdDateTime: '2020-04-01T12:00:00.000Z',
          },
        ],
      },
    ])
  })

  it('returns a list of uploaded documents, using the same order as the document category list', () => {
    expect(results.documentsUploaded).toEqual([
      {
        category: 'LICENCE',
        createdDateTime: '2020-04-01T12:00:00.000Z',
        createdByUserName: 'Arnold Caseworker',
        documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        fileName: 'Bobby Badger licence.pdf',
        label: 'Licence',
        standardFileName: 'Licence.pdf',
        suggestedCategory: 'LICENCE',
        type: 'document',
        url: '/persons/A123/recalls/abc-456/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
        version: 1,
      },
      {
        category: 'OTHER',
        documentId: '2345-65434-3455-23432',
        fileName: 'other doc 1.pdf',
        label: 'Other',
        suggestedCategory: 'OTHER',
        type: 'document',
        url: '/persons/A123/recalls/abc-456/documents/2345-65434-3455-23432',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      {
        category: 'OTHER',
        documentId: '1234-8766-2344-5342',
        fileName: 'other doc 2.pdf',
        label: 'Other',
        suggestedCategory: 'OTHER',
        type: 'document',
        url: '/persons/A123/recalls/abc-456/documents/1234-8766-2344-5342',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
    ])
  })

  it('returns data on the specified versioned category', () => {
    expect(results.versionedCategory).toEqual({
      category: 'LICENCE',
      documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      label: 'Licence',
      fileName: 'Bobby Badger licence.pdf',
      standardFileName: 'Licence.pdf',
      version: 1,
      createdDateTime: '2020-04-01T12:00:00.000Z',
      createdByUserName: 'Arnold Caseworker',
      type: 'document',
      url: '/persons/A123/recalls/abc-456/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
  })

  it('returns data on missing documents', () => {
    expect(results.requiredDocsMissing).toEqual([findDocCategory(RecallDocument.category.PART_A_RECALL_REPORT)])
  })

  it('returns data on missing documents', () => {
    expect(results.missingNotRequiredDocs).toEqual([
      findDocCategory(RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET),
      findDocCategory(RecallDocument.category.OASYS_RISK_ASSESSMENT),
    ])
  })

  it('returns data on generated documents', () => {
    expect(results.documentsGenerated).toEqual({
      DOSSIER: {
        category: 'DOSSIER',
        documentId: '848',
        label: 'Dossier',
        fileName: 'BADGER BOBBY 123 RECALL DOSSIER.pdf',
        type: 'generated',
        url: '/persons/A123/recalls/abc-456/documents/dossier',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      LETTER_TO_PRISON: {
        category: 'LETTER_TO_PRISON',
        documentId: '838',
        label: 'Letter to prison',
        fileName: 'BADGER BOBBY 123 LETTER TO PRISON.pdf',
        type: 'generated',
        url: '/persons/A123/recalls/abc-456/documents/letter-to-prison',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      REASONS_FOR_RECALL: {
        category: 'REASONS_FOR_RECALL',
        documentId: '858',
        label: 'Reasons for recall',
        fileName: 'BADGER BOBBY 123 REASONS FOR RECALL.pdf',
        type: 'generated',
        url: '/persons/A123/recalls/abc-456/documents/reasons-for-recall/858',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      RECALL_NOTIFICATION: {
        category: 'RECALL_NOTIFICATION',
        documentId: '828',
        label: 'Recall notification',
        fileName: 'IN CUSTODY RECALL BADGER BOBBY 123.pdf',
        type: 'generated',
        url: '/persons/A123/recalls/abc-456/documents/recall-notification',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      REVOCATION_ORDER: {
        category: 'REVOCATION_ORDER',
        documentId: '868',
        label: 'Revocation order',
        fileName: 'BADGER BOBBY 123 REVOCATION ORDER.pdf',
        type: 'generated',
        url: '/persons/A123/recalls/abc-456/documents/revocation-order/868',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
    })
  })

  it('returns data on uploaded emails', () => {
    expect(results.emailsUploaded).toEqual({
      DOSSIER_EMAIL: {
        category: 'DOSSIER_EMAIL',
        label: 'Dossier email',
        type: 'email',
        fileName: 'dossier.msg',
        documentId: '37423-2389347-234',
        url: '/persons/A123/recalls/abc-456/documents/37423-2389347-234',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      RECALL_REQUEST_EMAIL: {
        category: 'RECALL_REQUEST_EMAIL',
        documentId: '1234-3455-8542-c3ac-8c963f66afa6',
        fileName: 'recall-request.eml',
        label: 'Recall request email',
        type: 'email',
        url: '/persons/A123/recalls/abc-456/documents/1234-3455-8542-c3ac-8c963f66afa6',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      RECALL_NOTIFICATION_EMAIL: {
        category: 'RECALL_NOTIFICATION_EMAIL',
        documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
        fileName: '2021-07-03 Phil Jones recall.msg',
        label: 'Recall notification email',
        type: 'email',
        url: '/persons/A123/recalls/abc-456/documents/64bdf-3455-8542-c3ac-8c963f66afa6',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
    })
  })

  it('returns data on missing documents', () => {
    expect(results.missingDocumentsRecord).toEqual({
      category: 'MISSING_DOCUMENTS_EMAIL',
      createdByUserId: '6544',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      createdByUserName: 'Arnold Caseworker',
      detail: 'Email sent 12/10/2021',
      categories: ['PART_A_RECALL_REPORT'],
      documentId: '845',
      emailFileName: 'email.msg',
      emailId: '845',
      fileName: 'missing-docs.msg',
      label: 'Missing documents email',
      missingDocumentsRecordId: '1234',
      type: 'email',
      url: '/persons/A123/recalls/abc-456/documents/845',
      version: 1,
    })
  })

  it('suggests a category for uploaded documents that have no category, but a recognisable filename', async () => {
    const result = decorateDocs({
      docs: [
        {
          category: RecallDocument.category.UNCATEGORISED,
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          createdDateTime: '2020-04-01T12:00:00.000Z',
          createdByUserName: 'Arnold Caseworker',
          fileName: 'Bobby Badger licence.pdf',
          version: 1,
        },
      ],
      nomsNumber,
      recallId,
      firstName: 'Bobby',
      lastName: 'Badger',
      bookingNumber: '123',
      versionedCategoryName: 'LICENCE',
      missingDocumentsRecords,
    })
    expect(result.documentsUploaded[0].suggestedCategory).toEqual('LICENCE')
  })

  it('defaults suggested category to UNCATEGORISED for uploaded documents that have no category, and no recognisable filename', async () => {
    const result = decorateDocs({
      docs: [
        {
          category: RecallDocument.category.UNCATEGORISED,
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          createdDateTime: '2020-04-01T12:00:00.000Z',
          createdByUserName: 'Arnold Caseworker',
          fileName: 'Bobby Badger.pdf',
          version: 1,
        },
      ],
      nomsNumber,
      recallId,
      firstName: 'Bobby',
      lastName: 'Badger',
      bookingNumber: '123',
      versionedCategoryName: 'LICENCE',
      missingDocumentsRecords,
    })
    expect(result.documentsUploaded[0].suggestedCategory).toEqual('UNCATEGORISED')
  })
})
