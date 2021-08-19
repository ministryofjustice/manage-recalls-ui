module.exports = (name, pageObject = {}) => {
  const checkOnPage = () => cy.get('h1').contains(name)
  const logout = () => cy.get('[data-qa=logout]')
  const assertElementHasText = ({ qaAttr, textToFind }) => {
    cy.get(`[data-qa="${qaAttr}"]`).should($searchResults => {
      const text = $searchResults.text()
      expect(text.trim()).to.equal(textToFind)
    })
  }
  const assertErrorMessage = ({ fieldName, summaryError, fieldError }) => {
    cy.get(`[href="#${fieldName}"`).should($searchResults => {
      const text = $searchResults.text()
      expect(text.trim()).to.equal(summaryError)
    })
    cy.get(`#${fieldName}-error`).should($searchResults => {
      const text = $searchResults.text()
      expect(text.trim()).to.contain(fieldError)
    })
  }
  const clickContinue = () => cy.get('[data-qa=continueButton]').click()

  if (pageObject.url) {
    cy.visit(pageObject.url)
  }
  checkOnPage()
  return {
    ...pageObject,
    checkStillOnPage: checkOnPage,
    logout,
    assertElementHasText,
    assertErrorMessage,
    clickContinue,
  }
}
