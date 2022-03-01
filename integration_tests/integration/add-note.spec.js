import { getEmptyRecallResponse, getRecallResponse } from '../mockApis/mockResponses'
import recallInformationPage from '../pages/recallInformation'

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

    const personName = `${getEmptyRecallResponse.firstName} ${getEmptyRecallResponse.lastName}`
    const recallInformation = recallInformationPage.verifyOnPage({ nomsNumber, recallId, personName })

    recallInformation.assertElementHasText({
      // No row heading for subject content
      qaAttr: 'noteSubject1',
      textToFind: note.subject,
    })

    recallInformation.assertElementHasText({
      // Row heading "Details" not unique on page
      qaAttr: 'noteDetails1',
      textToFind: note.details,
    })

    cy.recallInfo('Date and time of note').should('equal', '5 December 2020 at 18:33')
    cy.recallInfo('Note made by').should('equal', 'Arnold Caseworker')
    cy.recallInfo('Document').should('equal', wordDocFixtureFileName)
    cy.getLinkHref(wordDocFixtureFileName).should(
      'contain',
      `/persons/${nomsNumber}/recalls/${recallId}/documents/${generatedDocumentId}`
    )
  })

  it('lists multiple notes in reverse chronological order', () => {
    // TODO: PUD-1489: form handler not yet supporting missing doc.
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
