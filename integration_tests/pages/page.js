module.exports = (name, pageObject = {}) => {
  const checkOnPage = () => cy.get('h1').contains(name)
  const logout = () => cy.get('[data-qa=logout]')
  const assertElementHasText = ({ qaAttr, textToFind }) => {
    cy.get(`[data-qa="${qaAttr}"]`).should($searchResults => {
      const text = $searchResults.text()
      expect(text.trim()).to.equal(textToFind)
    })
  }
  const assertErrorNotShown = ({ fieldName }) => {
    cy.get(`[href="#${fieldName}"`).should('not.exist')
  }
  const assertErrorMessage = ({ fieldName, summaryError, fieldError }) => {
    cy.get(`[href="#${fieldName}"`).should($searchResults => {
      const text = $searchResults.text()
      expect(text.trim()).to.equal(summaryError)
    })
    cy.get(`#${fieldName}-error`).should($searchResults => {
      const text = $searchResults.text()
      expect(text.trim()).to.contain(fieldError || summaryError)
    })
  }
  const clickContinue = () => cy.get('[data-qa=continueButton]').click()
  const clickElement = ({ qaAttr }) => cy.get(`[data-qa="${qaAttr}"]`).click()
  const assertLinkHref = ({ qaAttr, href }) => {
    cy.get(`[data-qa=${qaAttr}]`).should('have.attr', 'href').and('include', href)
  }

  const enterDateTime = ({ prefix, values }) => {
    Object.keys(values).forEach(value => {
      cy.get(`[name=${prefix}${value}]`).clear().type(values[value])
    })
  }

  const uploadEmail = ({ fieldName, fileName }) => {
    cy.get(`[name="${fieldName}"]`).attachFile({
      filePath: `../uploads/${fileName}`,
      mimeType: 'application/octet-stream',
    })
  }

  if (pageObject.url) {
    cy.visit(pageObject.url)
  }
  checkOnPage()
  return {
    ...pageObject,
    checkStillOnPage: checkOnPage,
    logout,
    assertErrorNotShown,
    assertElementHasText,
    assertErrorMessage,
    assertLinkHref,
    clickContinue,
    clickElement,
    enterDateTime,
    uploadEmail,
  }
}
