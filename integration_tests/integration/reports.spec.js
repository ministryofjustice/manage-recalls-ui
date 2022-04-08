import getReportResponseJson from '../../fake-manage-recalls-api/stubs/__files/get-weekly-recalls-new.json'

describe('Reports', () => {
  beforeEach(() => {
    cy.login()
  })

  it('supports download of the Weekly Recalls New csv file', () => {
    cy.task('expectGetWeeklyRecallsNew', { expectedResults: getReportResponseJson })
    cy.visit('/reports')
    cy.pageHeading().should('equal', 'Reports')
    const filename = `weekly-recalls-new.csv`
    cy.getText('getWeeklyRecallsNewFileName').should('equal', `Filename: ${filename}`)
    cy.downloadFile('Download the Weekly Recalls New')
    cy.readDownloadedFile(filename)
  })
})
