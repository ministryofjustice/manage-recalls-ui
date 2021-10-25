import { decorateDocs, makeErrorObject, renderErrorMessages, transformErrorMessages } from './index'
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
  ]
  const nomsNumber = 'A123'
  const recallId = 'abc-456'
  it('returns document types only in document list, with uploaded docs merged into documentCategories', () => {
    const results = decorateDocs({ docs, nomsNumber, recallId })
    expect(results).toEqual({
      documentCategories: [
        {
          fileName: 'Part A.pdf',
          label: 'Part A recall report',
          labelLowerCase: 'part A recall report',
          name: 'PART_A_RECALL_REPORT',
          required: true,
          type: 'document',
          uploaded: [
            {
              fileName: 'Part A.pdf',
              url: '/persons/A123/recalls/abc-456/documents/34bdf-5717-4562-b3fc-2c963f66afa6',
            },
          ],
        },
        {
          fileName: 'Licence.pdf',
          label: 'Licence',
          name: 'LICENCE',
          required: true,
          type: 'document',
          uploaded: [
            {
              fileName: 'Licence.pdf',
              url: '/persons/A123/recalls/abc-456/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
            },
          ],
        },
        {
          fileName: 'Pre Cons.pdf',
          label: 'Previous convictions sheet',
          name: 'PREVIOUS_CONVICTIONS_SHEET',
          required: true,
          type: 'document',
          uploaded: [],
        },
        {
          fileName: 'PSR.pdf',
          label: 'Pre-sentencing report',
          name: 'PRE_SENTENCING_REPORT',
          required: true,
          type: 'document',
          uploaded: [],
        },
        {
          fileName: 'OASys.pdf',
          label: 'OASys Risk Assessment',
          labelLowerCase: 'OASys risk assessment',
          name: 'OASYS_RISK_ASSESSMENT',
          type: 'document',
          uploaded: [],
        },
        {
          fileName: 'Charge sheet.pdf',
          label: 'Charge sheet',
          name: 'CHARGE_SHEET',
          type: 'document',
          uploaded: [],
        },
        {
          fileName: 'CPS papers.pdf',
          label: 'CPS papers',
          labelLowerCase: 'CPS papers',
          name: 'CPS_PAPERS',
          type: 'document',
          uploaded: [],
        },
        {
          fileName: 'Police report.pdf',
          label: 'Police report',
          name: 'POLICE_REPORT',
          type: 'document',
          uploaded: [],
        },
        {
          fileName: 'Exclusion zone map.pdf',
          label: 'Exclusion zone map',
          name: 'EXCLUSION_ZONE_MAP',
          type: 'document',
          uploaded: [],
        },
        {
          label: 'Other',
          multiple: true,
          name: 'OTHER',
          type: 'document',
          uploaded: [
            {
              fileName: 'other doc 1.pdf',
              url: '/persons/A123/recalls/abc-456/documents/2345-65434-3455-23432',
            },
            {
              fileName: 'other doc 2.pdf',
              url: '/persons/A123/recalls/abc-456/documents/1234-8766-2344-5342',
            },
          ],
        },
      ],
      documents: [
        {
          category: 'PART_A_RECALL_REPORT',
          documentId: '34bdf-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Part A.pdf',
          label: 'Part A recall report',
          labelLowerCase: 'part A recall report',
          name: 'PART_A_RECALL_REPORT',
          required: true,
          type: 'document',
          url: '/persons/A123/recalls/abc-456/documents/34bdf-5717-4562-b3fc-2c963f66afa6',
        },
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence.pdf',
          label: 'Licence',
          name: 'LICENCE',
          required: true,
          type: 'document',
          url: '/persons/A123/recalls/abc-456/documents/3fa85f64-5717-4562-b3fc-2c963f66afa6',
        },
        {
          category: 'OTHER',
          documentId: '2345-65434-3455-23432',
          fileName: 'other doc 1.pdf',
          label: 'Other',
          multiple: true,
          name: 'OTHER',
          type: 'document',
          url: '/persons/A123/recalls/abc-456/documents/2345-65434-3455-23432',
        },
        {
          category: 'OTHER',
          documentId: '1234-8766-2344-5342',
          fileName: 'other doc 2.pdf',
          label: 'Other',
          multiple: true,
          name: 'OTHER',
          type: 'document',
          url: '/persons/A123/recalls/abc-456/documents/1234-8766-2344-5342',
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

describe('renderErrorMessages', () => {
  it('returns error messages with placeholders filled with data', () => {
    const errors = [
      {
        href: '#additionalLicenceConditionsDetail',
        name: 'additionalLicenceConditionsDetail',
        text: 'Provide detail on additional licence conditions',
      },
      {
        text: 'Enter the NOMIS number {{person.firstName}} {{person.lastName}} is being held under',
        href: '#differentNomsNumberDetail',
        name: 'differentNomsNumberDetail',
      },
    ]
    const result = renderErrorMessages(transformErrorMessages(errors), {
      person: { firstName: 'Dave', lastName: 'Angel' },
    })
    expect(result).toEqual({
      additionalLicenceConditionsDetail: {
        text: 'Provide detail on additional licence conditions',
      },
      differentNomsNumberDetail: {
        text: 'Enter the NOMIS number Dave Angel is being held under',
      },
      list: [
        {
          href: '#additionalLicenceConditionsDetail',
          name: 'additionalLicenceConditionsDetail',
          text: 'Provide detail on additional licence conditions',
        },
        {
          href: '#differentNomsNumberDetail',
          name: 'differentNomsNumberDetail',
          text: 'Enter the NOMIS number Dave Angel is being held under',
        },
      ],
    })
  })
})
