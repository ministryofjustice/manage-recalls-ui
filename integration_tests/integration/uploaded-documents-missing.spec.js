import { getEmptyRecallResponse, getRecallResponse, getPrisonerResponse } from '../mockApis/mockResponses'
import { RecallResponse } from '../../server/@types/manage-recalls-api/models/RecallResponse'
import uploadDocumentsPage from '../pages/uploadDocuments'
import checkAnswersPage from '../pages/recallCheckAnswers'
import recallMissingDocumentsPage from '../pages/recallMissingDocuments'

// NOTE - a test for adding a missing document record is already in book-in-custody.spec.js
context('Missing uploaded documents', () => {
  const recallId = '123'
  const documentId = '123'

  beforeEach(() => {
    cy.task('reset')
    cy.task('stubLogin')
    cy.task('stubAuthUser')
    cy.task('expectListRecalls', {
      expectedResults: [],
    })
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [],
      },
    })
    cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
    cy.login()
  })

  it('missing documents are listed on the view recall page', () => {
    const record1 = {
      missingDocumentsRecordId: '1',
      emailId: '845',
      emailFileName: 'missing-documents2.msg',
      categories: ['OASYS_RISK_ASSESSMENT'],
      details: 'OASYS requested by email on 10/12/2020',
      version: 2,
      createdByUserName: 'Bobby Badger',
      createdDateTime: '2020-12-10T12:24:03.000Z',
    }
    const record2 = {
      missingDocumentsRecordId: '2',
      emailId: '123',
      emailFileName: 'missing-documents.msg',
      categories: ['OASYS_RISK_ASSESSMENT', 'PART_A_RECALL_REPORT'],
      details: 'Documents were chased up',
      version: 1,
      createdByUserName: 'Bobby Badger',
      createdDateTime: '2020-12-09T12:24:03.000Z',
    }
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        status: 'DOSSIER_ISSUED',
        missingDocumentsRecords: [record1, record2],
        missingDocuments: {
          required: ['PART_A_RECALL_REPORT'],
          desired: ['OASYS_RISK_ASSESSMENT'],
        },
      },
    })
    cy.visitRecallPage({ recallId: '123', pageSuffix: 'view-recall' })
    cy.getElement('Show 2 notes').click()
    cy.getText('missingDocumentsRecordDetail-2').should('equal', record1.details)
    cy.getText('missingDocumentsRecordEmail-2').should('equal', record1.emailFileName)
    cy.getLinkHref({ qaAttr: 'missingDocumentsRecordEmail-2' }).should(
      'contain',
      `/recalls/${recallId}/documents/${record1.emailId}`
    )
    cy.getText('missingDocumentsRecordNotedBy-2').should('equal', 'Noted by Bobby Badger on 10 December 2020 at 12:24')
    cy.getText('missingDocumentsRecordDetail-1').should('equal', record2.details)
    cy.getText('missingDocumentsRecordEmail-1').should('equal', record2.emailFileName)
    cy.getLinkHref({ qaAttr: 'missingDocumentsRecordEmail-1' }).should(
      'contain',
      `/recalls/${recallId}/documents/${record2.emailId}`
    )
    cy.getText('missingDocumentsRecordNotedBy-1').should('equal', 'Noted by Bobby Badger on 9 December 2020 at 12:24')
  })

  it('user can go back to add documents from the check your answers page to see a list of missing documents', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        recallId,
        ...getRecallResponse,
        status: RecallResponse.status.BEING_BOOKED_ON,
        documents: [
          {
            category: 'PART_A_RECALL_REPORT',
            documentId,
          },
        ],
        missingDocuments: {
          required: ['LICENCE'],
          desired: ['OASYS_RISK_ASSESSMENT', 'PREVIOUS_CONVICTIONS_SHEET'],
        },
      },
    })
    cy.task('expectDeleteRecallDocument')
    cy.task('expectSetDocumentCategory')
    const checkAnswers = checkAnswersPage.verifyOnPage({ recallId })
    checkAnswers.clickLink({ label: 'Add documents' })
    const uploadDocuments = uploadDocumentsPage.verifyOnPage()
    uploadDocuments.assertListValues({
      qaAttrList: 'missingDocsList',
      valuesToCompare: ['Licence', 'OASys report', 'Previous convictions sheet'],
    })
  })

  it('shows a blank add record form, not using details from previous records', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        documents: [
          {
            category: 'MISSING_DOCUMENTS_EMAIL',
          },
        ],
        missingDocumentsRecords: [
          {
            categories: ['OASYS_RISK_ASSESSMENT', 'PART_A_RECALL_REPORT'],
            createdByUserId: '888',
            createdDateTime: '2021-11-10T05:34:25.000Z',
            details: 'Chased up, see attached',
            emailId: '987',
            missingDocumentsRecordId: '1',
            version: 2,
          },
        ],
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'missing-documents' })
    cy.getTextInputValue('Provide more detail').should('equal', '')
  })

  it("an error is shown if the missing documents email and detail aren't submitted", () => {
    cy.task('expectGetRecall', { recallId, expectedResult: { ...getEmptyRecallResponse, recallId } })
    const recallMissingDocuments = recallMissingDocumentsPage.verifyOnPage({ recallId })
    cy.clickButton('Continue')
    cy.assertErrorMessage({
      fieldName: 'missingDocumentsEmailFileName',
      summaryError: 'Select an email',
    })
    cy.assertErrorMessage({
      fieldName: 'missingDocumentsDetail',
      summaryError: 'Provide more detail',
    })
  })
})
