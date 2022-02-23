import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { decorateDocs } from './decorateDocs'
import { findDocCategory } from '../../upload/helpers'
import { DocumentDecorations } from '../../../../@types/documents'
import { RecallResponse } from '../../../../@types/manage-recalls-api'

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
      version: 2,
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
      category: RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
      documentId: '1234-8766-2344-5342',
      fileName: 'pre cons.pdf',
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
      category: RecallDocument.category.RESCIND_REQUEST_EMAIL,
      documentId: '1234-3455-8542-c3ac-543435',
      fileName: 'rescind-request.eml',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
    },
    {
      category: RecallDocument.category.RESCIND_DECISION_EMAIL,
      documentId: '6543',
      fileName: 'rescind-decision.eml',
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
      category: RecallDocument.category.NSY_REMOVE_WARRANT_EMAIL,
      documentId: '639',
      fileName: 'nsy.msg',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
    },
    {
      category: RecallDocument.category.RECALL_NOTIFICATION,
      documentId: '828',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'IN CUSTODY RECALL BADGER BOBBY 123.pdf',
    },
    {
      category: RecallDocument.category.LETTER_TO_PRISON,
      documentId: '838',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'BADGER BOBBY 123 LETTER TO PRISON.pdf',
    },
    {
      category: RecallDocument.category.DOSSIER,
      documentId: '848',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'BADGER BOBBY 123 RECALL DOSSIER.pdf',
    },
    {
      category: RecallDocument.category.REASONS_FOR_RECALL,
      documentId: '858',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'BADGER BOBBY 123 REASONS FOR RECALL.pdf',
    },
    {
      category: RecallDocument.category.REVOCATION_ORDER,
      documentId: '868',
      createdByUserName: 'Arnold Caseworker',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'BADGER BOBBY 123 REVOCATION ORDER.pdf',
    },
  ] as RecallDocument[]

  const nomsNumber = 'A123'
  const recallId = 'abc-456'
  let results: DocumentDecorations
  const recall = {
    nomsNumber,
    recallId,
    firstName: 'Bobby',
    lastName: 'Badger',
    bookingNumber: '123',
    status: 'DOSSIER_ISSUED',
    missingDocumentsRecords: [
      {
        missingDocumentsRecordId: '1234',
        emailId: '845',
        emailFileName: 'email.msg',
        categories: [RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET],
        details: 'Email sent 12/10/2021',
        version: 1,
        createdByUserName: 'Maria Badger',
        createdDateTime: '2021-10-12T13:43:00.000Z',
      },
      {
        missingDocumentsRecordId: '1234',
        emailId: '845',
        emailFileName: 'email.msg',
        categories: [RecallDocument.category.OASYS_RISK_ASSESSMENT],
        details: 'Email sent 12/10/2021',
        version: 1,
        createdByUserName: 'Maria Badger',
        createdDateTime: '2021-10-12T13:43:00.000Z',
      },
    ],
  } as RecallResponse

  beforeEach(() => {
    results = decorateDocs({
      docs,
      recall,
      versionedCategoryName: 'LICENCE',
    })
  })

  it('returns document categories included the docs uploaded for each', () => {
    expect(results.docCategoriesWithUploads).toEqual([
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
            version: 2,
            createdDateTime: '2020-04-01T12:00:00.000Z',
            createdByUserName: 'Arnold Caseworker',
            label: 'Licence',
            type: 'document',
          },
        ],
      },
      {
        ...findDocCategory(RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET),
        uploaded: [
          {
            category: 'PREVIOUS_CONVICTIONS_SHEET',
            createdByUserName: 'Arnold Caseworker',
            createdDateTime: '2020-04-01T12:00:00.000Z',
            documentId: '1234-8766-2344-5342',
            fileName: 'pre cons.pdf',
            label: 'Previous convictions sheet',
            standardFileName: 'Pre Cons.pdf',
            suggestedCategory: 'PREVIOUS_CONVICTIONS_SHEET',
            type: 'document',
            url: '/persons/A123/recalls/abc-456/documents/1234-8766-2344-5342',
          },
        ],
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
            label: 'Other',
            type: 'document',
          },
          {
            category: 'OTHER',
            suggestedCategory: 'OTHER',
            documentId: '1234-8766-2344-5342',
            fileName: 'other doc 2.pdf',
            url: '/persons/A123/recalls/abc-456/documents/1234-8766-2344-5342',
            createdByUserName: 'Arnold Caseworker',
            createdDateTime: '2020-04-01T12:00:00.000Z',
            label: 'Other',
            type: 'document',
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
        version: 2,
        hasHistory: true,
      },
      {
        category: 'PREVIOUS_CONVICTIONS_SHEET',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
        documentId: '1234-8766-2344-5342',
        fileName: 'pre cons.pdf',
        hasHistory: true,
        label: 'Previous convictions sheet',
        standardFileName: 'Pre Cons.pdf',
        suggestedCategory: 'PREVIOUS_CONVICTIONS_SHEET',
        type: 'document',
        url: '/persons/A123/recalls/abc-456/documents/1234-8766-2344-5342',
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
        hasHistory: false,
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
        hasHistory: false,
      },
    ])
  })

  it('returns data on the specified versioned category', () => {
    expect(results.versionedUpload).toEqual({
      category: 'LICENCE',
      documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      label: 'Licence',
      fileName: 'Bobby Badger licence.pdf',
      standardFileName: 'Licence.pdf',
      version: 2,
      createdDateTime: '2020-04-01T12:00:00.000Z',
      createdByUserName: 'Arnold Caseworker',
      type: 'document',
      url: '/persons/A123/recalls/abc-456/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
    })
  })

  it('returns data on missing required documents', () => {
    expect(results.requiredDocsMissing).toEqual([findDocCategory(RecallDocument.category.PART_A_RECALL_REPORT)])
  })

  it('returns data on missing desired documents', () => {
    expect(results.missingNotRequiredDocs).toEqual([findDocCategory(RecallDocument.category.OASYS_RISK_ASSESSMENT)])
  })

  it('returns data on generated documents', () => {
    expect(results.documentsGenerated).toEqual({
      DOSSIER: {
        category: 'DOSSIER',
        documentId: '848',
        label: 'Dossier',
        fileName: 'BADGER BOBBY 123 RECALL DOSSIER.pdf',
        type: 'generated',
        url: '/persons/A123/recalls/abc-456/documents/848',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      LETTER_TO_PRISON: {
        category: 'LETTER_TO_PRISON',
        documentId: '838',
        label: 'Letter to prison',
        fileName: 'BADGER BOBBY 123 LETTER TO PRISON.pdf',
        type: 'generated',
        url: '/persons/A123/recalls/abc-456/documents/838',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      REASONS_FOR_RECALL: {
        category: 'REASONS_FOR_RECALL',
        documentId: '858',
        label: 'Reasons for recall',
        fileName: 'BADGER BOBBY 123 REASONS FOR RECALL.pdf',
        type: 'generated',
        url: '/persons/A123/recalls/abc-456/documents/858',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      RECALL_NOTIFICATION: {
        category: 'RECALL_NOTIFICATION',
        documentId: '828',
        label: 'Recall notification',
        fileName: 'IN CUSTODY RECALL BADGER BOBBY 123.pdf',
        type: 'generated',
        url: '/persons/A123/recalls/abc-456/documents/828',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      REVOCATION_ORDER: {
        category: 'REVOCATION_ORDER',
        documentId: '868',
        label: 'Revocation order',
        fileName: 'BADGER BOBBY 123 REVOCATION ORDER.pdf',
        type: 'generated',
        url: '/persons/A123/recalls/abc-456/documents/868',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
    })
  })

  it('returns data on uploaded emails', () => {
    expect(results.emailsUploaded).toEqual({
      DOSSIER_EMAIL: {
        category: 'DOSSIER_EMAIL',
        label: 'Dossier and letter email uploaded',
        type: 'email',
        fileName: 'dossier.msg',
        documentId: '37423-2389347-234',
        url: '/persons/A123/recalls/abc-456/documents/37423-2389347-234',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      MISSING_DOCUMENTS_EMAIL: {
        category: 'MISSING_DOCUMENTS_EMAIL',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
        documentId: '845',
        fileName: 'missing-docs.msg',
        label: 'Missing documents email uploaded',
        type: 'email',
        url: '/persons/A123/recalls/abc-456/documents/845',
      },
      NSY_REMOVE_WARRANT_EMAIL: {
        category: 'NSY_REMOVE_WARRANT_EMAIL',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
        documentId: '639',
        fileName: 'nsy.msg',
        label: 'New Scotland Yard warrant email sent',
        type: 'email',
        url: '/persons/A123/recalls/abc-456/documents/639',
      },
      RESCIND_DECISION_EMAIL: {
        category: 'RESCIND_DECISION_EMAIL',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
        documentId: '6543',
        fileName: 'rescind-decision.eml',
        label: 'Rescind decision email uploaded',
        type: 'email',
        url: '/persons/A123/recalls/abc-456/documents/6543',
      },
      RECALL_REQUEST_EMAIL: {
        category: 'RECALL_REQUEST_EMAIL',
        documentId: '1234-3455-8542-c3ac-8c963f66afa6',
        fileName: 'recall-request.eml',
        label: 'Recall request email uploaded',
        type: 'email',
        url: '/persons/A123/recalls/abc-456/documents/1234-3455-8542-c3ac-8c963f66afa6',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      RECALL_NOTIFICATION_EMAIL: {
        category: 'RECALL_NOTIFICATION_EMAIL',
        documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
        fileName: '2021-07-03 Phil Jones recall.msg',
        label: 'Recall notification email uploaded',
        type: 'email',
        url: '/persons/A123/recalls/abc-456/documents/64bdf-3455-8542-c3ac-8c963f66afa6',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
      },
      RESCIND_REQUEST_EMAIL: {
        category: 'RESCIND_REQUEST_EMAIL',
        createdByUserName: 'Arnold Caseworker',
        createdDateTime: '2020-04-01T12:00:00.000Z',
        documentId: '1234-3455-8542-c3ac-543435',
        fileName: 'rescind-request.eml',
        label: 'Rescind request email uploaded',
        type: 'email',
        url: '/persons/A123/recalls/abc-456/documents/1234-3455-8542-c3ac-543435',
      },
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
      recall,
      versionedCategoryName: 'LICENCE',
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
      recall,
      versionedCategoryName: 'LICENCE',
    })
    expect(result.documentsUploaded[0].suggestedCategory).toEqual('UNCATEGORISED')
  })
})
