import path from 'path'

module.exports = (name, pageObject = {}) => {
  const checkOnPage = () => cy.get('h1').contains(name)
  const logout = () => cy.get('[data-qa=logout]')
  const assertElementHasText = ({ qaAttr, textToFind }) => {
    cy.get(`[data-qa="${qaAttr}"]`).should($searchResults => {
      const text = $searchResults.text()
      expect(text.trim()).to.equal(textToFind)
    })
  }
  const assertElementPresent = ({ qaAttr }) => {
    cy.get(`[data-qa="${qaAttr}"]`).should('exist')
  }
  const assertElementNotPresent = ({ qaAttr }) => {
    cy.get(`[data-qa="${qaAttr}"]`).should('not.exist')
  }

  const assertErrorNotShown = ({ fieldName }) => {
    cy.get(`[href="#${fieldName}"]`).should('not.exist')
  }
  const assertErrorMessage = ({ fieldName, summaryError, fieldError }) => {
    assertSummaryErrorMessage({ fieldName, summaryError })
    cy.get(`#${fieldName}-error`).should($searchResults => {
      const text = $searchResults.text()
      expect(text.trim()).to.contain(fieldError || summaryError)
    })
  }
  const assertSummaryErrorMessage = ({ fieldName, summaryError }) => {
    cy.get(`[href="#${fieldName}"]`).should('have.text', summaryError)
  }

  const clickContinue = () => cy.get('[data-qa=continueButton]').click()

  const clickElementByAttrOrLabel = ({ qaAttr, label, tagName }) => {
    if (qaAttr) {
      clickElement({ qaAttr })
    } else if (label) {
      cy.get(tagName).contains(label).click()
    }
  }
  const clickButton = ({ qaAttr, label }) => clickElementByAttrOrLabel({ qaAttr, label, tagName: 'button' })

  const clickLink = ({ qaAttr, label }) => clickElementByAttrOrLabel({ qaAttr, label, tagName: 'a' })

  const clickElement = ({ qaAttr }) => cy.get(`[data-qa="${qaAttr}"]`).click()

  const selectFromDropdown = ({ fieldName, value }) => cy.get(`[name=${fieldName}]`).select(value)

  const assertLinkHref = ({ qaAttr, href }) => {
    cy.get(`[data-qa=${qaAttr}]`).should('have.attr', 'href').and('include', href)
  }

  const enterTextInInput = ({ name: nameAttr, text }) => {
    cy.get(`[name="${nameAttr}"]`).clear().type(text)
  }

  const checkRadio = ({ fieldName, value }) => {
    cy.get(`[name=${fieldName}][value=${value}`).check()
  }

  const assertSelectValue = ({ fieldName, value }) => {
    cy.get(`[name=${fieldName}]`).should('have.value', value)
  }

  const assertInputValue = ({ fieldName, value }) => {
    cy.get(`[name=${fieldName}]`).should('have.value', value)
  }

  const assertRadioChecked = ({ fieldName, value }) => {
    cy.get(`[name=${fieldName}][value=${value}`).should('be.checked')
  }

  const enterDateTime = ({ prefix, values }) => {
    Object.keys(values).forEach(value => {
      cy.get(`[name=${prefix}${value}]`).clear().type(values[value])
    })
  }

  const assertTableColumnValues = ({ qaAttrTable, qaAttrCell, valuesToCompare }) => {
    cy.get(`[data-qa="${qaAttrTable}"]`)
      .find(`[data-qa="${qaAttrCell}"]`)
      .each((cell, index) => {
        expect(cell.text().trim()).to.equal(valuesToCompare[index])
      })
  }

  const assertListValues = ({ qaAttrList, valuesToCompare }) => {
    cy.get(`[data-qa="${qaAttrList}"]`)
      .find(`li`)
      .each((cell, index) => {
        expect(cell.text().trim()).to.equal(valuesToCompare[index])
      })
  }

  const clickTodayLink = () => cy.get('[data-qa="today-link"]').click()

  const uploadFile = ({ fieldName, fileName, mimeType }) => {
    cy.get(`[name="${fieldName}"]`).attachFile({
      filePath: `../uploads/${fileName}`,
      mimeType: mimeType || 'application/octet-stream',
    })
  }

  const checkPdfContents = ({ qaAttr, fileContents }) => {
    cy.get(`[data-qa="${qaAttr}"]`).then($link => {
      cy.request({
        url: $link.prop('href'),
        encoding: 'base64',
      }).then(response => {
        expect(response.body).to.deep.equal(`${fileContents}=`)
      })
    })
  }

  const checkFileDownloaded = fileName => {
    const downloadedFilename = path.join(Cypress.config('downloadsFolder'), fileName)
    cy.readFile(downloadedFilename, 'binary')
  }

  const assertApiRequestBody = ({ url, method, bodyValues }) => {
    cy.task('findApiRequest', { url, method }).then(req => {
      if (req) {
        const requestBody = JSON.parse(req.request.body)
        Object.entries(bodyValues).forEach(([key, value]) => {
          expect(requestBody[key]).to.equal(value)
        })
      } else {
        cy.log(`assertApiRequestBody - request not found for url: ${url} and method: ${method}`)
      }
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
    assertElementPresent,
    assertElementNotPresent,
    assertErrorMessage,
    assertSummaryErrorMessage,
    assertLinkHref,
    assertSelectValue,
    assertInputValue,
    assertRadioChecked,
    clickContinue,
    clickButton,
    clickLink,
    clickElement,
    selectFromDropdown,
    enterDateTime,
    clickTodayLink,
    uploadFile,
    enterTextInInput,
    checkRadio,
    assertApiRequestBody,
    assertTableColumnValues,
    checkFileDownloaded,
    checkPdfContents,
    assertListValues,
  }
}
