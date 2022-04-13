import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'

context('View recall information', () => {
  beforeEach(() => {
    cy.login()
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        middleNames: '',
        inCustodyAtBooking: true,
        recallId,
        status: 'DOSSIER_ISSUED',
        documents: [
          {
            category: 'RECALL_REQUEST_EMAIL',
            documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
            fileName: 'recall-request.eml',
          },
          {
            category: 'RECALL_NOTIFICATION_EMAIL',
            documentId: '64bdf-3455-8542-c3ac-8c963f66afa6',
            fileName: '2021-07-03 Phil Jones recall.msg',
          },
          {
            category: 'DOSSIER_EMAIL',
            documentId: '234-3455-8542-c3ac-8c963f66afa6',
            fileName: 'email.msg',
          },
          {
            category: 'MISSING_DOCUMENTS_EMAIL',
            documentId: '123',
            fileName: 'chase-documents.msg',
          },
        ],
        returnedToCustodyDateTime: undefined,
      },
    })
  })

  const recallId = '123'
  const personName = 'Bobby Badger'

  it('User can view all recall information (after dossier issued)', () => {
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.getElement({ qaAttr: 'recallStatus' }).should('contain', 'Dossier complete')

    // as person doesn't have middle names, don't offer a change link for name
    cy.getElement('Change licence name').should('not.exist')
    cy.recallInfo('Custody status at booking').should('equal', 'In custody')
    cy.getElement({ qaAttr: 'inCustodyChange' }).should('not.exist')
    cy.getElement({ qaAttr: 'arrestIssues' }).should('not.exist')
    cy.recallInfo('Recall notification email sent').should('equal', '15 August 2021 at 14:04')
    cy.recallInfo('Additional licence conditions').should('equal', 'one, two')
    cy.recallInfo('Different NOMIS number').should('equal', 'AC3408303')
    cy.recallInfo('Dossier sent').should('equal', '8 September 2021')
    cy.recallInfo('Recall booked by').should('equal', 'Brenda Badger')
    cy.recallInfo('Recall assessed by').should('equal', 'Bertie Badger')
    cy.recallInfo('Dossier created by').should('equal', 'Bobby Badger')
    cy.recallInfo('Dossier sent').should('equal', '8 September 2021')
    cy.recallInfo('Dossier email uploaded').should('equal', 'email.msg')
    cy.getLinkHref('Change dossier email sent date').should('contain', '/dossier-email')
    cy.getLinkHref('Change uploaded dossier email').should('contain', '/dossier-email')
  })

  it('User can view not available for vulnerabilityDiversity and contraband when information is not provided', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        inCustody: false,
        status: 'DOSSIER_ISSUED',
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('Vulnerability and diversity').should('equal', 'Not available')
    cy.recallInfo('Contraband').should('equal', 'Not available')
    cy.recallInfo('MAPPA level').should('equal', 'Not available')
    cy.recallInfo('Arrest issues').should('equal', 'Not available')
  })

  it('User can view No, No and None respectively for additionalLicenceConditions,vulnerabilityDiversity and contraband when selected No', () => {
    cy.task('expectGetRecall', {
      recallId,
      expectedResult: {
        ...getRecallResponse,
        recallId,
        additionalLicenceConditions: false,
        vulnerabilityDiversity: false,
        arrestIssues: false,
        contraband: false,
        status: 'DOSSIER_ISSUED',
        inCustodyAtBooking: false,
        inCustodyAtAssessment: false,
        returnedToCustodyDateTime: undefined,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.recallInfo('Additional licence conditions').should('equal', 'None')
    cy.recallInfo('Vulnerability and diversity').should('equal', 'No')
    cy.recallInfo('Contraband').should('equal', 'No')
    cy.recallInfo('Arrest issues').should('equal', 'No')
  })

  it('user can download all uploaded emails', () => {
    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    // recall request
    const recallRequestFileName = 'recall-request.eml'
    cy.task('expectGetRecallDocument', {
      category: 'RECALL_REQUEST_EMAIL',
      file: 'abc',
      fileName: recallRequestFileName,
      documentId: '123',
    })
    cy.downloadEmail(recallRequestFileName)
    cy.readDownloadedFile(recallRequestFileName)
    // sent recall notification email
    const recallNotificationFileName = '2021-07-03 Phil Jones recall.msg'
    cy.task('expectGetRecallDocument', {
      category: 'RECALL_NOTIFICATION_EMAIL',
      file: 'abc',
      fileName: recallNotificationFileName,
      documentId: '123',
    })
    cy.downloadEmail(recallNotificationFileName)
    cy.readDownloadedFile(recallNotificationFileName)
    // sent dossier email
    const dossierEmailFileName = 'email.msg'
    cy.task('expectGetRecallDocument', {
      category: 'DOSSIER_EMAIL',
      file: 'abc',
      fileName: dossierEmailFileName,
      documentId: '123',
    })
    cy.downloadEmail(dossierEmailFileName)
    cy.readDownloadedFile(dossierEmailFileName)
  })
})
