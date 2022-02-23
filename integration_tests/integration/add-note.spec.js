import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'

context('Add a note to a recall', () => {
  const nomsNumber = 'A1234AA'
  const recallId = '123'

  beforeEach(() => {
    cy.login()
  })

  it('can add a note without a document', () => {
    // TODO: PUD-1489: form handler not yet supporting missing doc.
  })

  it('can add a note with a document', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        status: 'AWAITING_DOSSIER_CREATION',
      },
    })
    const note = getRecallResponse.notes[0]
    cy.task('expectAddNote')
    cy.visitRecallPage({ nomsNumber, recallId, pageSuffix: 'assess' })
    cy.clickButton('Actions')
    cy.clickLink('Add a note')
    cy.pageHeading().should('equal', 'Add a note to the recall')
    cy.fillInput('Subject', note.subject)
    cy.fillInput('Details', note.details)
    cy.uploadDocx({ field: 'fileName' })

    // lorem-ipsum-msword.docx
    const generatedDocumentId = '789'

    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        notes: [
          {
            noteId: note.noteId,
            subject: note.subject,
            details: note.details,
            index: 1,
            documentId: generatedDocumentId,
            fileName: 'lorem-ipsum-msword.docx',
            createdByUserName: 'Arnold Caseworker',
            createdDateTime: '2020-12-05T18:33:57.000Z',
          },
        ],
      },
    })
    cy.clickButton('Add note')
    cy.assertSaveToRecallsApi({
      url: `/recalls/${recallId}/notes`,
      method: 'POST',
      bodyValues: {
        subject: note.subject,
        details: note.details,
        fileName: 'lorem-ipsum-msword.docx',
        // file content was also sent
      },
    })
    cy.clickLink('View')
    // TODO PUD-1489: Note display pending
    // cy.recallInfo('Subject').should('equal', note.subject)
    // cy.recallInfo('Details').should('equal', note.details)
    // cy.recallInfo('Date and time of note').should('equal', note.details)
    // cy.recallInfo('Note made by').should('equal', 'Arnold Caseworker')
    // cy.recallInfo('Document').should('equal', note.fileName)
    // cy.getLinkHref(note.fileName).should(
    //   'contain',
    //   `/persons/${nomsNumber}/recalls/${recallId}/documents/${generatedDocumentId}`
    // )
  })

  it('errors - add a note', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        status: 'AWAITING_DOSSIER_CREATION',
      },
    })
    cy.visitRecallPage({ nomsNumber, recallId, pageSuffix: 'add-note' })
    cy.uploadDocx({ field: 'fileName' }) // TODO PUD-1489: Not needed once document made optional
    cy.clickButton('Add note')
    cy.assertErrorMessage({
      fieldName: 'subject',
      summaryError: 'Provide more detail',
    })
    cy.assertErrorMessage({
      fieldName: 'details',
      summaryError: 'Provide more detail',
    })
  })
})
