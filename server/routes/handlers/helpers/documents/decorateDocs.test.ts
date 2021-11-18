import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { decorateDocs } from './decorateDocs'
import { findDocCategory } from './index'

describe('decorateDocs', () => {
  const docs = [
    {
      category: ApiRecallDocument.category.LICENCE,
      documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
    },
    {
      category: ApiRecallDocument.category.OTHER,
      documentId: '2345-65434-3455-23432',
      fileName: 'other doc 1.pdf',
    },
    {
      category: ApiRecallDocument.category.OTHER,
      documentId: '1234-8766-2344-5342',
      fileName: 'other doc 2.pdf',
    },
    {
      category: ApiRecallDocument.category.RECALL_NOTIFICATION_EMAIL,
      documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
      fileName: '2021-07-03 Phil Jones recall.msg',
    },
    {
      category: ApiRecallDocument.category.RECALL_REQUEST_EMAIL,
      documentId: '1234-3455-8542-c3ac-8c963f66afa6',
      fileName: 'recall-request.eml',
    },
    {
      category: ApiRecallDocument.category.DOSSIER_EMAIL,
      documentId: '37423-2389347-234',
      fileName: 'dossier.msg',
    },
  ] as ApiRecallDocument[]
  const nomsNumber = 'A123'
  const recallId = 'abc-456'

  it('returns document types only in document list, with uploaded docs merged into documentCategories', () => {
    const results = decorateDocs({
      docs,
      nomsNumber,
      recallId,
      firstName: 'Bobby',
      lastName: 'Badger',
      bookingNumber: '123',
      versionedCategoryName: 'LICENCE',
    })
    expect(results).toEqual({
      documentCategories: [
        {
          ...findDocCategory(ApiRecallDocument.category.PART_A_RECALL_REPORT),
          uploaded: [],
        },
        {
          ...findDocCategory(ApiRecallDocument.category.LICENCE),
          uploaded: [
            {
              category: 'LICENCE',
              documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
              fileName: 'Licence.pdf',
              url: '/persons/A123/recalls/abc-456/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
          ],
        },
        {
          ...findDocCategory(ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET),
          uploaded: [],
        },
        {
          ...findDocCategory(ApiRecallDocument.category.PRE_SENTENCING_REPORT),
          uploaded: [],
        },
        {
          ...findDocCategory(ApiRecallDocument.category.OASYS_RISK_ASSESSMENT),
          uploaded: [],
        },
        {
          ...findDocCategory(ApiRecallDocument.category.CHARGE_SHEET),
          uploaded: [],
        },
        {
          ...findDocCategory(ApiRecallDocument.category.CPS_PAPERS),
          uploaded: [],
        },
        {
          ...findDocCategory(ApiRecallDocument.category.POLICE_REPORT),
          uploaded: [],
        },
        {
          ...findDocCategory(ApiRecallDocument.category.EXCLUSION_ZONE_MAP),
          uploaded: [],
        },
        {
          ...findDocCategory(ApiRecallDocument.category.OTHER),
          uploaded: [
            {
              category: 'OTHER',
              documentId: '2345-65434-3455-23432',
              fileName: 'other doc 1.pdf',
              url: '/persons/A123/recalls/abc-456/documents/2345-65434-3455-23432',
            },
            {
              category: 'OTHER',
              documentId: '1234-8766-2344-5342',
              fileName: 'other doc 2.pdf',
              url: '/persons/A123/recalls/abc-456/documents/1234-8766-2344-5342',
            },
          ],
        },
        {
          ...findDocCategory(ApiRecallDocument.category.UNCATEGORISED),
          uploaded: [],
        },
      ],
      versionedCategory: {
        category: 'LICENCE',
        documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        label: 'Licence',
        name: 'LICENCE',
        type: 'document',
        url: '/persons/A123/recalls/abc-456/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
      },
      documents: [
        {
          ...findDocCategory(ApiRecallDocument.category.LICENCE),
          category: ApiRecallDocument.category.LICENCE,
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          url: '/persons/A123/recalls/abc-456/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
        {
          ...findDocCategory(ApiRecallDocument.category.OTHER),
          category: ApiRecallDocument.category.OTHER,
          fileName: 'other doc 1.pdf',
          documentId: '2345-65434-3455-23432',
          url: '/persons/A123/recalls/abc-456/documents/2345-65434-3455-23432',
        },
        {
          ...findDocCategory(ApiRecallDocument.category.OTHER),
          category: ApiRecallDocument.category.OTHER,
          fileName: 'other doc 2.pdf',
          documentId: '1234-8766-2344-5342',
          url: '/persons/A123/recalls/abc-456/documents/1234-8766-2344-5342',
        },
      ],
      requiredDocsMissing: [findDocCategory(ApiRecallDocument.category.PART_A_RECALL_REPORT)],
      missingNotRequiredDocs: [
        findDocCategory(ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET),
        findDocCategory(ApiRecallDocument.category.OASYS_RISK_ASSESSMENT),
      ],
      dossierEmail: {
        category: 'DOSSIER_EMAIL',
        label: 'Dossier email',
        name: 'DOSSIER_EMAIL',
        type: 'email',
        fileName: 'dossier.msg',
        documentId: '37423-2389347-234',
        url: '/persons/A123/recalls/abc-456/documents/37423-2389347-234',
      },
      recallRequestEmail: {
        category: 'RECALL_REQUEST_EMAIL',
        documentId: '1234-3455-8542-c3ac-8c963f66afa6',
        fileName: 'recall-request.eml',
        label: 'Recall request email',
        name: 'RECALL_REQUEST_EMAIL',
        type: 'email',
        url: '/persons/A123/recalls/abc-456/documents/1234-3455-8542-c3ac-8c963f66afa6',
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
