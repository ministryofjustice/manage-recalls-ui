module.exports = (name, pageObject = {}) => {
  const checkOnPage = () => cy.get('h1').contains(name)
  const logout = () => cy.get('[data-qa=logout]')
  const assertElementHasText = ({ qaAttr, textToFind }) => {
    cy.get(`[data-qa="${qaAttr}"]`).should($searchResults => {
      const text = $searchResults.text()
      expect(text.trim()).to.equal(textToFind)
    })
  }
  if (pageObject.url) {
    cy.visit(pageObject.url)
  }
  checkOnPage()
  return { ...pageObject, checkStillOnPage: checkOnPage, logout, assertElementHasText }
}
