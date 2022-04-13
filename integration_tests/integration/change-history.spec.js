import {
  getRecallResponse,
  getEmptyRecallResponse,
  getDocumentCategoryHistoryResponseJson,
  getPrisonerResponse,
  getSingleFieldHistoryResponseJson,
  getAllFieldsHistoryResponseJson,
  getPrisonsResponse,
} from '../mockApis/mockResponses'
import { documentCategories } from '../../server/controllers/documents/documentCategories'
import { RecallDocument } from '../../server/@types/manage-recalls-api/models/RecallDocument'
import { sortList } from '../../server/controllers/utils/lists'
import { stubRefData } from '../support/mock-api'

const { formatDateTimeFromIsoString } = require('../../server/controllers/utils/dates/format')

// FIXME: copied from 'server/controllers/changeHistory/recallFieldList.ts' - rework so we can re-use that code without including restClient
const recallFieldList = {
  // date / times
  recallEmailReceivedDateTime: {
    label: 'Recall email received',
    fieldType: 'ISO_DATE_TIME',
  },
  recallNotificationEmailSentDateTime: {
    label: 'Recall notification email sent',
    fieldType: 'ISO_DATE_TIME',
  },
  sentenceDate: {
    label: 'Date of sentence',
    fieldType: 'ISO_DATE',
  },
  lastReleaseDate: {
    label: 'Latest release date',
    fieldType: 'ISO_DATE',
  },
  dossierEmailSentDate: {
    label: 'Dossier and letter sent',
    fieldType: 'ISO_DATE',
  },
  sentenceExpiryDate: {
    label: 'Sentence expiry date',
    fieldType: 'ISO_DATE',
  },
  licenceExpiryDate: {
    label: 'Licence expiry date',
    fieldType: 'ISO_DATE',
  },
  conditionalReleaseDate: {
    label: 'Conditional release date',
    fieldType: 'ISO_DATE',
  },
  returnedToCustodyDateTime: {
    label: 'RTC date and time',
    fieldType: 'ISO_DATE_TIME',
  },
  returnedToCustodyNotificationDateTime: {
    label: 'Found out RTC date and time',
    fieldType: 'ISO_DATE_TIME',
  },

  // booleans
  hasDossierBeenChecked: {
    label: 'Confirmed dossier and letter is correct',
    fieldType: 'BOOLEAN',
  },
  additionalLicenceConditions: {
    label: 'Additional licence conditions',
    fieldType: 'BOOLEAN',
  },
  differentNomsNumber: {
    label: 'Different NOMIS number',
    fieldType: 'BOOLEAN',
  },
  contraband: {
    label: 'Contraband',
    fieldType: 'BOOLEAN',
  },
  vulnerabilityDiversity: {
    label: 'Vulnerability and diversity',
    fieldType: 'BOOLEAN',
  },
  arrestIssues: {
    label: 'Arrest issues',
    fieldType: 'BOOLEAN',
  },

  // text / enums / refdata
  currentPrison: {
    label: 'Prison held in',
    fieldType: 'REF_DATA',
    refDataCategory: 'prisons',
  },
  confirmedRecallType: {
    label: 'Recall type - confirmed',
    fieldType: 'ENUM', // FIXED / STANDARD
    enumValues: {
      FIXED: 'Fixed term',
      STANDARD: 'Standard',
    },
  },
  confirmedRecallTypeDetail: {
    label: 'Recall type - confirmed detail',
    fieldType: 'TEXT',
  },
  confirmedRecallTypeEmailUploaded: {
    fieldType: 'UPLOADED_EMAIL',
    documentCategory: RecallDocument.category.CHANGE_RECALL_TYPE_EMAIL,
  },
  lastReleasePrison: {
    label: 'Releasing prison',
    fieldType: 'REF_DATA',
    refDataCategory: 'prisons',
  },
  mappaLevel: {
    label: 'MAPPA level',
    fieldType: 'REF_DATA',
    refDataCategory: 'mappaLevels',
  },
  sentencingCourt: {
    label: 'Sentencing court',
    fieldType: 'REF_DATA',
    refDataCategory: 'courts',
  },
  indexOffence: {
    label: 'Index offence',
    fieldType: 'TEXT',
  },
  localPoliceForceId: {
    label: 'Local police force',
    fieldType: 'REF_DATA',
    refDataCategory: 'policeForces',
  },
  bookingNumber: {
    label: 'Booking number',
    fieldType: 'TEXT',
  },
  probationOfficerName: {
    label: 'Probation officer name',
    fieldType: 'TEXT',
  },
  probationOfficerPhoneNumber: {
    label: 'Probation officer phone number',
    fieldType: 'TEXT',
  },
  probationOfficerEmail: {
    label: 'Probation officer email address',
    fieldType: 'TEXT',
  },
  localDeliveryUnit: {
    label: 'Local Delivery Unit',
    fieldType: 'REF_DATA',
    refDataCategory: 'localDeliveryUnits',
  },
  authorisingAssistantChiefOfficer: {
    label: 'ACO',
    fieldType: 'TEXT',
  },
  contrabandDetail: {
    label: 'Contraband detail',
    fieldType: 'TEXT',
  },
  vulnerabilityDiversityDetail: {
    label: 'Vulnerability and diversity detail',
    fieldType: 'TEXT',
  },
  arrestIssuesDetail: {
    label: 'Arrest issues detail',
    fieldType: 'TEXT',
  },
  licenceConditionsBreached: {
    label: 'Licence conditions breached',
    fieldType: 'TEXT',
  },
  reasonsForRecall: {
    label: 'Reasons for recall',
    fieldType: 'REF_DATA_LIST',
    refDataCategory: 'reasonsForRecall',
  },
  reasonsForRecallOtherDetail: {
    label: 'Reasons for recall - other',
    fieldType: 'TEXT',
  },
  additionalLicenceConditionsDetail: {
    label: 'Additional licence conditions detail',
    fieldType: 'TEXT',
  },
  confirmRecallNotificationEmailSent: {
    fieldType: 'ENUM', // YES / NO
  },
  confirmDossierEmailSent: {
    fieldType: 'ENUM', // YES / NO
  },
  differentNomsNumberDetail: {
    label: 'Different NOMIS number detail',
    fieldType: 'TEXT',
  },
  previousConvictionMainName: {
    label: 'Name on pre-cons - other',
    fieldType: 'TEXT',
  },
  licenceNameCategory: {
    label: 'Name',
    fieldType: 'ENUM',
    enumValues: {
      FIRST_LAST: 'First & last name',
      FIRST_MIDDLE_LAST: 'First, middle & last name',
    },
  },
  lastKnownAddressOption: {
    label: 'Has last known address',
    fieldType: 'ENUM',
    enumValues: {
      YES: 'Yes',
      NO_FIXED_ABODE: 'No fixed abode',
    },
  },
  previousConvictionMainNameCategory: {
    label: 'Name on pre-cons',
    fieldType: 'ENUM',
    enumValues: {
      FIRST_LAST: 'First & last name',
      FIRST_MIDDLE_LAST: 'First, middle & last name',
      OTHER: 'Other name',
    },
  },

  sentenceYears: {
    label: 'Length of sentence (years)',
    fieldType: 'TEXT',
  },
  sentenceMonths: {
    label: 'Length of sentence (months)',
    fieldType: 'TEXT',
  },
  sentenceDays: {
    label: 'Length of sentence (days)',
    fieldType: 'TEXT',
  },
  warrantReferenceNumber: {
    label: 'Warrant reference number',
    fieldType: 'TEXT',
  },
  // uploaded emails
  recallRequestEmailUploaded: {
    fieldType: 'UPLOADED_EMAIL',
    documentCategory: RecallDocument.category.RECALL_REQUEST_EMAIL,
  },
  recallNotificationSentEmailUploaded: {
    fieldType: 'UPLOADED_EMAIL',
    documentCategory: RecallDocument.category.RECALL_NOTIFICATION_EMAIL,
  },
  recommendedRecallType: {
    label: 'Recall type - recommended',
    fieldType: 'ENUM',
    enumValues: {
      STANDARD: 'Standard',
      FIXED: 'Fixed',
    },
  },
  dossierSentEmailUploaded: {
    fieldType: 'UPLOADED_EMAIL',
    documentCategory: RecallDocument.category.DOSSIER_EMAIL,
  },
  nsySentEmailUploaded: {
    fieldType: 'UPLOADED_EMAIL',
    documentCategory: RecallDocument.category.NSY_REMOVE_WARRANT_EMAIL,
  },
}

// FIXME: copied from 'server/controllers/changeHistory/recallFieldList.ts' - rework so we can re-use that code without including restClient
const findDocCategory = category => documentCategories.find(cat => cat.name === category)

// FIXME: copied from 'server/controllers/changeHistory/recallFieldList.ts' - rework so we can re-use that code without including restClient
const changedFieldProps = ({ id, value, changedFields, uploadedDocuments }) => {
  if (value.fieldType === 'UPLOADED_EMAIL') {
    const uploadedDoc = uploadedDocuments.find(doc => doc.category === value.documentCategory)
    const docCategory = findDocCategory(value.documentCategory)
    return uploadedDoc
      ? {
          label: docCategory.label,
          updatedByUserName: uploadedDoc.createdByUserName,
          updatedDateTime: uploadedDoc.createdDateTime,
          hasHistory: true,
        }
      : {
          hasHistory: false,
        }
  }
  const changedField = changedFields.find(field => field.fieldName === id)
  return changedField
    ? {
        updatedByUserName: changedField.updatedByUserName,
        updatedDateTime: changedField.updatedDateTime,
        hasHistory: true,
      }
    : {
        hasHistory: false,
      }
}

// FIXME: copied from 'server/controllers/changeHistory/recallFieldList.ts' - rework so we can re-use that code without including restClient
const changeHistoryFieldList = ({ changedFields, uploadedDocuments }) => {
  const list = Object.entries(recallFieldList)
    .map(([id, value]) => {
      const changedField = changedFields.find(field => field.fieldName === id)
      return {
        id,
        ...value,
        fieldPath: changedField ? changedField.fieldPath : id,
        ...changedFieldProps({ id, value, changedFields, uploadedDocuments }),
      }
    })
    .filter(field => field.label)
  return sortList(list, 'label')
}

context('Change history', () => {
  const recallId = '123'
  const personName = 'Bobby Badger'
  const documents = [
    {
      category: 'PART_A_RECALL_REPORT',
      documentId: '123',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      fileName: 'wesley holt part A.pdf',
      createdByUserName: 'Arnold Caseworker',
    },
    {
      category: 'PREVIOUS_CONVICTIONS_SHEET',
      documentId: '456',
      createdDateTime: '2020-05-10T14:22:00.000Z',
      fileName: 'wesley holt pre cons.pdf',
      createdByUserName: 'Carrie Arnold',
    },
    {
      category: 'RECALL_NOTIFICATION',
      documentId: '789',
      createdDateTime: '2020-05-09T14:22:00.000Z',
      createdByUserName: 'Barry Arnold',
      fileName: 'IN CUSTODY RECALL BADGER BOBBY A123456.pdf',
    },
    {
      category: 'DOSSIER',
      documentId: '012',
      createdDateTime: '2020-04-10T14:22:00.000Z',
      fileName: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
      createdByUserName: 'Steve Barry',
    },
  ]

  beforeEach(() => {
    cy.login()
  })

  it('User can navigate to view document change history for a recall, and resort the tables', () => {
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.pageHeading().should('equal', `View the recall for ${personName}`)
    cy.clickButton('Actions')
    cy.clickLink('View change history')
    cy.visitRecallPage({ recallId, pageSuffix: 'change-history' })
    cy.clickLink('Documents')
    // UPLOADED DOCUMENTS
    cy.getLinkHref({
      qaAttr: 'uploadedDocument-PART_A_RECALL_REPORT',
      href: '/recalls/123/documents/123',
    })
    cy.getLinkHref({
      qaAttr: 'uploadedDocument-PREVIOUS_CONVICTIONS_SHEET',
    }).should('contain', '/recalls/123/documents/456')
    cy.assertTableColumnValues({
      qaAttrTable: 'uploadedDocuments',
      qaAttrCell: 'fileName',
      valuesToCompare: ['Part A.pdf', 'Pre Cons.pdf'],
    })
    cy.assertTableColumnValues({
      qaAttrTable: 'uploadedDocuments',
      qaAttrCell: 'createdDateTime',
      valuesToCompare: ['1 April 2020 at 13:00', '10 May 2020 at 15:22'],
    })
    cy.assertTableColumnValues({
      qaAttrTable: 'uploadedDocuments',
      qaAttrCell: 'createdByUserName',
      valuesToCompare: ['Arnold Caseworker', 'Carrie Arnold'],
    })
    // re-sort the table by file name (descending)
    cy.clickButton('Document', { parent: '#table-uploaded' })
    cy.assertTableColumnValues({
      qaAttrTable: 'uploadedDocuments',
      qaAttrCell: 'fileName',
      valuesToCompare: ['Pre Cons.pdf', 'Part A.pdf'],
    })

    // GENERATED DOCUMENTS
    cy.getLinkHref({
      qaAttr: 'generatedDocument-RECALL_NOTIFICATION',
    }).should('contain', '/recalls/123/documents/789')
    cy.getLinkHref({
      qaAttr: 'generatedDocument-DOSSIER',
    }).should('contain', '/recalls/123/documents/012')
    cy.assertTableColumnValues({
      qaAttrTable: 'generatedDocuments',
      qaAttrCell: 'fileName',
      valuesToCompare: ['BADGER BOBBY A123456 RECALL DOSSIER.pdf', 'IN CUSTODY RECALL BADGER BOBBY A123456.pdf'],
    })
    cy.assertTableColumnValues({
      qaAttrTable: 'generatedDocuments',
      qaAttrCell: 'createdDateTime',
      valuesToCompare: ['10 April 2020 at 15:22', '9 May 2020 at 15:22'],
    })
    cy.assertTableColumnValues({
      qaAttrTable: 'generatedDocuments',
      qaAttrCell: 'createdByUserName',
      valuesToCompare: ['Steve Barry', 'Barry Arnold'],
    })
    // re-sort the table by file name (descending)
    cy.clickButton('Document', { parent: '#table-generated' })
    cy.assertTableColumnValues({
      qaAttrTable: 'generatedDocuments',
      qaAttrCell: 'fileName',
      valuesToCompare: ['IN CUSTODY RECALL BADGER BOBBY A123456.pdf', 'BADGER BOBBY A123456 RECALL DOSSIER.pdf'],
    })
  })

  it('User can see the uploaded document version and download it', () => {
    const document = {
      category: 'PART_A_RECALL_REPORT',
      documentId: '123',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      createdByUserName: 'Arnold Caseworker',
      version: 3,
    }
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [document],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'change-history' })
    cy.clickLink('Documents')
    cy.getText('uploadedDocument-PART_A_RECALL_REPORT-version').should('contain', 'version 3')
    const fileName = 'Part A.pdf'
    cy.task('expectGetRecallDocument', {
      category: document.category,
      file: 'abc',
      fileName,
      documentId: '123',
    })
    cy.downloadFile('Part A.pdf')
    cy.readDownloadedFile(fileName)
  })

  it('can see uploaded document history and missing records', () => {
    const category = 'LICENCE'
    const document = {
      category,
      documentId: '123',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      createdByUserName: 'Arnold Caseworker',
      version: 3,
    }
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [document],
        missingDocumentsRecords: [
          {
            missingDocumentsRecordId: '0120412-410124',
            emailId: '845',
            emailFileName: 'missing-documents.msg',
            categories: ['OASYS_RISK_ASSESSMENT', 'LICENCE'],
            details: 'Documents were requested by email on 10/12/2020',
            version: 2,
            createdByUserName: 'Bobby Badger',
            createdDateTime: '2021-03-12T12:24:03.000Z',
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'change-history' })
    cy.clickLink('Documents')
    cy.task('expectGetRecallDocumentHistory', { expectedResult: getDocumentCategoryHistoryResponseJson })
    cy.clickLink('View history for Licence.pdf')

    cy.pageHeading().should('equal', 'Uploaded document change history')
    getDocumentCategoryHistoryResponseJson.forEach(doc => {
      const docId = doc.documentId
      cy.getText(`document-${docId}-link`).should('contain', 'Licence.pdf')
      cy.getLinkHref({
        qaAttr: `document-${docId}-link`,
      }).should('contain', `/recalls/${recallId}/documents/${docId}`)
      if (doc.version === 1) {
        cy.getText(`document-${docId}-heading`).should('contain', `Licence`)
        cy.getElement(`document-${docId}-version`).should('not.exist')
      } else {
        cy.getText(`document-${docId}-heading`).should('contain', `Licence (version ${doc.version})`)
        cy.getText(`document-${docId}-details`).should('contain', doc.details)
        cy.getText(`document-${docId}-version`).should('contain', `(version ${doc.version})`)
      }
      const date = formatDateTimeFromIsoString({
        isoDate: doc.createdDateTime,
      })
      cy.getText(`document-${docId}-uploaded-by`).should('contain', `Uploaded by ${doc.createdByUserName} on ${date}`)
    })
    // missing documents record
    cy.getText('missingDocumentsLabel').should('contain', 'Missing')
    cy.getText('document-845-details').should('contain', 'Documents were requested by email on 10/12/2020')
    cy.getLinkHref({
      qaAttr: 'missingDocumentsEmail',
    }).should('contain', `/recalls/${recallId}/documents/845`)
    cy.getText('document-845-uploaded-by').should('contain', 'Noted by Bobby Badger on 12 March 2021 at 12:24')
  })

  it('User can navigate to generated document history', () => {
    const category = 'DOSSIER'
    const document = {
      category,
      documentId: '123',
      createdDateTime: '2020-04-01T12:00:00.000Z',
      createdByUserName: 'Arnold Caseworker',
      version: 4,
      fileName: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
    }
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [document],
      },
    })
    cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
    cy.visitRecallPage({ recallId, pageSuffix: 'change-history' })
    cy.clickLink('Documents')
    cy.task('expectGetRecallDocumentHistory', {
      expectedResult: [
        {
          category: 'DOSSIER',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          createdDateTime: '2020-12-05T18:33:57.000Z',
          fileName: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
          createdByUserName: 'Arnold Caseworker',
          version: 1,
        },
        {
          category: 'DOSSIER',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa7',
          createdDateTime: '2020-12-06T18:33:57.000Z',
          fileName: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
          createdByUserName: 'Arnold Caseworker',
          version: 2,
        },
        {
          category: 'DOSSIER',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa8',
          createdDateTime: '2020-12-07T18:33:57.000Z',
          fileName: 'BADGER BOBBY A123456 RECALL DOSSIER.pdf',
          createdByUserName: 'Arnold Caseworker',
          version: 3,
        },
      ],
    })
    cy.getRowValuesFromTable({ rowQaAttr: 'DOSSIER' }).then(rowValues =>
      expect(rowValues).to.include.members([
        'BADGER BOBBY A123456 RECALL DOSSIER.pdf (version 4)',
        '1 April 2020 at 13:00',
        'Arnold Caseworker',
      ])
    )
    cy.clickLink({ qaAttr: 'viewHistory-DOSSIER' })
    cy.pageHeading().should('equal', 'Generated document change history')
    getDocumentCategoryHistoryResponseJson.forEach(doc => {
      const docId = doc.documentId
      cy.getText(`document-${docId}-link`).should('contain', 'BADGER BOBBY A123456 RECALL DOSSIER.pdf')
      cy.getLinkHref({
        qaAttr: `document-${docId}-link`,
        href: `/recalls/${recallId}/documents/${docId}`,
      })
      if (doc.version === 1) {
        cy.getText(`document-${docId}-heading`).should('contain', `Dossier`)
        cy.getElement(`document-${docId}-version`).should('not.exist')
      } else {
        cy.getText(`document-${docId}-heading`).should('contain', `Dossier (version ${doc.version})`)
        cy.getText(`document-${docId}-version`).should('contain', `(version ${doc.version})`)
      }
      const date = formatDateTimeFromIsoString({
        isoDate: doc.createdDateTime,
      })
      cy.getText(`document-${docId}-uploaded-by`).should('contain', `Created by ${doc.createdByUserName} on ${date}`)
    })
  })

  it('shows a list of all fields with change history links', () => {
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    const uploadedDocuments = [
      {
        category: 'RECALL_REQUEST_EMAIL',
        documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
        fileName: 'recall-request.eml',
        createdByUserName: 'Barry Caseworker',
        createdDateTime: '2021-10-05T12:34:23.000Z',
      },
      {
        category: 'RECALL_NOTIFICATION_EMAIL',
        documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
        fileName: '2021-07-03 Phil Jones recall.msg',
        createdByUserName: 'Barry Caseworker',
        createdDateTime: '2021-10-05T12:34:23.000Z',
      },
      {
        category: 'DOSSIER_EMAIL',
        documentId: '234-3455-8542-c3ac-8c963f66afa6',
        fileName: 'email.msg',
        createdByUserName: 'Barry Caseworker',
        createdDateTime: '2021-10-05T12:34:23.000Z',
      },
      {
        category: 'NSY_REMOVE_WARRANT_EMAIL',
        documentId: '234-3455-8542-c3ac-8c963f66afa6',
        fileName: 'email.msg',
        createdByUserName: 'Barry Caseworker',
        createdDateTime: '2021-10-05T12:34:23.000Z',
      },
    ]
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        documents: uploadedDocuments,
      },
    })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    cy.visitRecallPage({ recallId, pageSuffix: 'change-history' })
    const fieldList = changeHistoryFieldList({ changedFields: getAllFieldsHistoryResponseJson, uploadedDocuments })
    const baseHref = `/recalls/${recallId}/change-history`
    fieldList.forEach(field => {
      cy.getText(`label-${field.id}`).should('contain', field.label)
      const href =
        field.fieldType === 'UPLOADED_EMAIL'
          ? `${baseHref}/document?category=${field.documentCategory}`
          : `${baseHref}/field?fieldName=${field.id}&fieldPath=${field.fieldPath}`
      cy.getLinkHref({
        qaAttr: `viewHistory-${field.id}`,
      }).should('contain', href)
    })
    // check user and date for one field
    cy.getRowValuesFromTable({ parent: '#table-info-entered', rowQaAttr: 'currentPrison' }).then(rowValues =>
      expect(rowValues).to.include.members(['Prison held in', '24 February 2022 at 16:45', 'Maria Badger'])
    )
    // check user and date for one email
    cy.getRowValuesFromTable({ parent: '#table-info-entered', rowQaAttr: 'dossierSentEmailUploaded' }).then(rowValues =>
      expect(rowValues).to.include.members([
        'Dossier and letter email uploaded',
        '5 October 2021 at 13:34',
        'Barry Caseworker',
      ])
    )
  })

  it('shows the change history of a field', () => {
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
      },
    })
    cy.task('expectGetSingleFieldChangeHistory', { expectedResult: getSingleFieldHistoryResponseJson })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    cy.visitRecallPage({ recallId, pageSuffix: 'change-history' })
    cy.clickLink('View history for Prison held in')
    cy.pageHeading().should('equal', 'Field change history')
    getSingleFieldHistoryResponseJson.forEach(() => {
      cy.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'dateAndTime',
        valuesToCompare: ['4 January 2022 at 17:56', '4 January 2022 at 13:17'],
      })
      cy.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'value',
        valuesToCompare: ['Ashfield (HMP)', 'Kennet (HMP)'],
      })
      cy.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'updatedByUserName',
        valuesToCompare: ['Marcus Baimbridge', 'Maria Badger'],
      })
    })
  })

  it('shows the change history of the reasons for recall field', () => {
    stubRefData()
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: getAllFieldsHistoryResponseJson,
    })
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
      },
    })
    cy.task('expectGetSingleFieldChangeHistory', {
      expectedResult: [
        {
          auditId: 0,
          recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          updatedByUserName: 'Maria Badger',
          updatedDateTime: '2022-01-04T13:17:34.443Z',
          updatedValue: ['ELM_BREACH_NON_CURFEW_CONDITION', 'OTHER'],
        },
        {
          auditId: 1,
          recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          updatedByUserName: 'Marcus Baimbridge',
          updatedDateTime: '2022-01-04T17:56:22.000Z',
          updatedValue: ['OTHER'],
        },
      ],
    })
    cy.task('expectRefData', { refDataPath: 'prisons', expectedResult: getPrisonsResponse })
    cy.visitRecallPage({ recallId, pageSuffix: 'change-history' })
    cy.clickLink('View history for Reasons for recall')
    cy.pageHeading().should('equal', 'Field change history')
    getSingleFieldHistoryResponseJson.forEach(() => {
      cy.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'dateAndTime',
        valuesToCompare: ['4 January 2022 at 17:56', '4 January 2022 at 13:17'],
      })
      cy.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'value',
        valuesToCompare: [
          'Other',
          'Electronic locking and monitoring (ELM) - Breach of non-curfew related condition, Other',
        ],
      })
      cy.assertTableColumnValues({
        qaAttrTable: 'fieldChangeHistory',
        qaAttrCell: 'updatedByUserName',
        valuesToCompare: ['Marcus Baimbridge', 'Maria Badger'],
      })
    })
  })

  it('shows the change history of an email', () => {
    const documentId = '123'
    const fileName = 'recall-request.eml'
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: [
        {
          fieldName: 'recallRequestEmailUploaded',
          updatedByUserName: 'Maria Badger',
          updatedDateTime: '2022-01-12T15:40:46.537Z',
        },
      ],
    })
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        documents: [
          {
            category: 'RECALL_REQUEST_EMAIL',
            documentId,
            fileName,
            createdDateTime: '2020-12-05T18:33:57.000Z',
            createdByUserName: 'Arnold Caseworker',
          },
        ],
      },
    })

    cy.task('expectGetRecallDocumentHistory', {
      expectedResult: [
        {
          category: 'RECALL_REQUEST_EMAIL',
          documentId,
          createdDateTime: '2020-12-05T18:33:57.000Z',
          fileName,
          createdByUserName: 'Arnold Caseworker',
          version: 1,
        },
      ],
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'change-history' })
    cy.clickLink('View history for Recall request email uploaded')
    cy.pageHeading().should('equal', 'Uploaded email change history')
    cy.getText(`document-${documentId}-heading`).should('contain', 'Recall request email uploaded')
    cy.getText(`document-${documentId}-link`).should('contain', fileName)
    cy.getLinkHref({
      qaAttr: `document-${documentId}-link`,
    }).should('contain', `/recalls/${recallId}/documents/${documentId}`)
  })

  it("doesn't show a view history link for a field that has no value set", () => {
    cy.task('expectGetAllFieldsChangeHistory', {
      expectedResult: [],
    })
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'change-history' })
    cy.getElement('viewHistory-currentPrison').should('not.exist')
  })
})
