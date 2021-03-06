import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'

context('Add a note to a recall', () => {
  const recallId = '123'

  beforeEach(() => {
    cy.login()
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
    cy.visitRecallPage({ recallId, pageSuffix: 'assess' })
    cy.clickButton('Actions')
    cy.clickLink('Add a note')
    cy.pageHeading().should('equal', 'Add a note to the recall')
    cy.fillInput('Subject', note.subject)
    cy.fillInput('Details', note.details)
    cy.uploadDocx({ field: 'fileName' })

    const generatedDocumentId = '789'
    const wordDocFixtureFileName = 'lorem-ipsum-msword.docx'

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
            fileName: wordDocFixtureFileName,
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
        fileName: wordDocFixtureFileName,
        fileContent: '*',
      },
    })
    cy.clickLink('View')

    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })

    cy.getText('noteSubject1').should('contain', note.subject)
    cy.getText('noteDetails1').should('contain', note.details)

    cy.recallInfo('Date and time of note').should('equal', '5 December 2020 at 18:33')
    cy.recallInfo('Note made by').should('equal', 'Arnold Caseworker')
    cy.recallInfo('Document').should('equal', wordDocFixtureFileName)
    cy.getLinkHref(wordDocFixtureFileName).should('contain', `/recalls/${recallId}/documents/${generatedDocumentId}`)
  })

  it('can add a note without a document', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        status: 'AWAITING_DOSSIER_CREATION',
      },
    })
    const note = getRecallResponse.notes[0]
    cy.task('expectAddNote')
    cy.visitRecallPage({ recallId, pageSuffix: 'assess' })
    cy.clickButton('Actions')
    cy.clickLink('Add a note')
    cy.pageHeading().should('equal', 'Add a note to the recall')
    cy.fillInput('Subject', note.subject)
    cy.fillInput('Details', note.details)

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
            documentId: undefined,
            fileName: undefined,
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
        fileName: undefined,
        fileContent: undefined,
      },
    })
    cy.clickLink('View')

    cy.getText('notesHeading').should('equal', 'Notes')
    cy.getElement({ qaAttr: 'noteSubject1' }).should('exist')
    cy.getElement({ qaAttr: 'noteDetails1' }).should('exist')
    cy.getElement({ qaAttr: 'noteDocumentRow1' }).should('not.exist')
    cy.recallInfo('Date and time of note').should('equal', '5 December 2020 at 18:33')
    cy.recallInfo('Note made by').should('equal', 'Arnold Caseworker')
  })

  it('lists multiple notes in reverse index order', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        notes: [
          {
            noteId: 123456,
            subject: 'index 4 subject',
            details: 'required',
            index: 4,
            createdByUserName: 'Arnold Caseworker',
            createdDateTime: '2020-12-05T18:33:57.000Z',
          },
          {
            noteId: 123456,
            subject: 'index 1 subject',
            details: 'required',
            index: 1,
            createdByUserName: 'Arnold Caseworker',
            createdDateTime: '2020-12-05T18:33:57.000Z',
          },
          {
            noteId: 123456,
            subject: 'index 2 subject',
            details: 'required',
            index: 2,
            createdByUserName: 'Arnold Caseworker',
            createdDateTime: '2020-12-05T18:33:57.000Z',
          },
        ],
      },
    })

    cy.visitRecallPage({ recallId, pageSuffix: 'view-recall' })
    cy.getText('noteSubject1').should('contain', 'index 4 subject')
    cy.getText('noteSubject2').should('contain', 'index 2 subject')
    cy.getText('noteSubject3').should('contain', 'index 1 subject')
  })

  it('shows no notes section for recall without notes', () => {
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getRecallResponse,
        recallId,
        notes: undefined,
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'assess' })
    cy.getElement('#notes').should('not.exist')
  })

  it('errors', () => {
    // no fields entered when adding a note
    cy.task('expectGetRecall', {
      expectedResult: {
        ...getEmptyRecallResponse,
        recallId,
        status: 'AWAITING_DOSSIER_CREATION',
      },
    })
    cy.visitRecallPage({ recallId, pageSuffix: 'add-note' })
    cy.clickButton('Add note')
    cy.assertErrorMessage({
      fieldName: 'subject',
      summaryError: 'Enter a subject',
    })
    cy.assertErrorMessage({
      fieldName: 'details',
      summaryError: 'Provide more detail',
    })
    // API error
    const note = getRecallResponse.notes[0]
    cy.task('expectAddNote', { statusCode: 500, body: 'API error' })
    cy.fillInput('Subject', note.subject)
    cy.fillInput('Details', note.details)
    cy.uploadDocx({ field: 'fileName' })
    cy.clickButton('Add note')
    cy.get('.govuk-error-summary__list').invoke('text').should('contain', 'API error')
  })
})
