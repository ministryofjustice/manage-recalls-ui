module.exports = (name, pageObject = {}) => {
  const checkOnPage = () => cy.get('h1').contains(name)
  const logout = () => cy.get('[data-qa=logout]')
  if (pageObject.url) {
    cy.visit(pageObject.url)
  }
  checkOnPage()
  return { ...pageObject, checkStillOnPage: checkOnPage, logout }
}
