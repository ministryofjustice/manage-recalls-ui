import { exactMatchIgnoreWhitespace, isDefined, splitIsoDateToParts } from './utils'
import { recall } from '../fixtures/recall'
import {
  getAllFieldsHistoryResponseJson,
  getDocumentCategoryHistoryResponseJson,
  getPrisonerResponse,
  getRecallResponse,
  getRecallsResponse,
  getUserDetailsResponse,
} from '../mockApis/mockResponses'
import 'cypress-audit/commands'
import { stubRefData } from './mock-api'
import path from 'path'

Cypress.Commands.add('login', () => {
  cy.task('reset')
  cy.task('stubAuthUser')
  cy.task('stubLogin')
  cy.task('expectGetCurrentUserDetails')
  cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
  cy.task('expectListRecalls', { expectedResults: [] })
  cy.task('expectGetRecall', {
    expectedResult: getRecallResponse,
  })
  stubRefData()
  cy.request('/')
  cy.task('getLoginUrl').then(cy.visit)
})

Cypress.Commands.add('stubRecallsAndLogin', () => {
  cy.task('reset')
  cy.task('stubAuthUser')
  cy.task('stubLogin')
  cy.task('expectGetCurrentUserDetails', { expectedResult: getUserDetailsResponse })
  cy.task('expectPrisonerResult', { expectedPrisonerResult: getPrisonerResponse })
  cy.task('expectListRecalls', { expectedResults: getRecallsResponse })
  cy.task('expectGetRecall', { expectedResult: { recallId: '123', ...getRecallResponse } })
  cy.task('expectGetAllFieldsChangeHistory', { expectedResult: getAllFieldsHistoryResponseJson })
  cy.task('expectGetRecallDocumentHistory', { expectedResult: getDocumentCategoryHistoryResponseJson })
  cy.request('/')
  cy.task('getLoginUrl').then(cy.visit)
})

// =============================== PAGE ===============================

Cypress.Commands.add('visitPage', url => {
  cy.visit(url, { headers: { 'Accept-Encoding': 'gzip, deflate', Connection: 'Keep-Alive' } })
})

Cypress.Commands.add('visitRecallPage', ({ recallId, pageSuffix }) => {
  cy.visit(`/recalls/${recallId}/${pageSuffix}`)
})

Cypress.Commands.add('pageHeading', () =>
  cy
    .get('h1')
    .invoke('text')
    .then(text => text.trim())
)

// =============================== NAVIGATE ===============================

const clickElement = (label, tagName, opts = { parent: 'body' }) => {
  if (label.qaAttr) {
    cy.get(opts.parent).find(`${tagName}[data-qa="${label.qaAttr}"]`).click()
  } else {
    cy.get(opts.parent).find(tagName).contains(label).click()
  }
}

Cypress.Commands.add('clickButton', (label, opts = { parent: 'body' }) => clickElement(label, 'button', opts))

Cypress.Commands.add('clickLink', (label, opts = { parent: 'body' }) => {
  clickElement(label, 'a', opts)
})

Cypress.Commands.add('getLinkHref', (selector, opts = { parent: 'body' }) =>
  cy.getElement(selector, opts).invoke('attr', 'href')
)

// =============================== GET TEXT ===============================

Cypress.Commands.add('getText', (qaAttr, opts = { parent: 'body' }) =>
  cy
    .get(opts.parent || 'body')
    .find(`[data-qa="${qaAttr}"]`)
    .invoke('text')
    .then(text => text.trim())
)

// ============================ GET ELEMENT ===============================
Cypress.Commands.add('getElement', (selector, opts = { parent: 'body' }) =>
  selector.qaAttr ? cy.get(`[data-qa="${selector.qaAttr}"]`) : cy.get(opts.parent || 'body').contains(selector)
)

// ============================ FILL FORM INPUTS ===============================

Cypress.Commands.add('fillInput', (label, text, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('label', label)
    .invoke('attr', 'for')
    .then(id =>
      cy
        .get(`#${id}`)
        .then($input =>
          opts.clearExistingText ? cy.wrap($input).clear({ force: true }).type(text) : cy.wrap($input).type(text)
        )
    )
})

Cypress.Commands.add('getTextInputValue', (label, text, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('label', label)
    .invoke('attr', 'for')
    .then(id => cy.get(`#${id}`))
    .invoke('val')
    .then(textVal => textVal.trim())
})

Cypress.Commands.add('fillInputGroup', (values, opts = { parent: 'body' }) => {
  Object.entries(values).forEach(([label, text]) => cy.fillInput(label, text, opts))
})

// ============================ RADIO BUTTONS ===============================

Cypress.Commands.add('selectRadio', (groupLabel, value, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('legend', groupLabel)
    .parent('fieldset')
    .then($fieldset => {
      if (opts.findByValue) {
        cy.wrap($fieldset).find(`[value=${value}]`).check()
      } else {
        cy.wrap($fieldset).contains('label', value).click()
      }
    })
})

Cypress.Commands.add('getRadioOptionByLabel', (groupLabel, value, opts = {}) => {
  return cy
    .get(opts.parent || 'body')
    .contains('legend', groupLabel)
    .parent('fieldset')
    .then($fieldset =>
      cy
        .wrap($fieldset)
        .contains('label', value)
        .invoke('attr', 'for')
        .then(id => cy.get(`#${id}`))
    )
})

Cypress.Commands.add('selectCheckboxes', (groupLabel, values, opts = {}) => {
  cy.get(opts.parent || 'body')
    .contains('legend', groupLabel)
    .parent('fieldset')
    .then($fieldset => {
      values.forEach(value => {
        if (opts.findByValue) {
          cy.wrap($fieldset).find(`[value=${value}]`).check()
        } else {
          cy.wrap($fieldset).contains('label', value).click()
        }
      })
    })
})

Cypress.Commands.add('selectConfirmationCheckbox', (label, opts = {}) => {
  return cy.contains('label', label).click()
})

// ============================ DROPDOWN / AUTOCOMPLETE ===============================

// TODO - look up ID using from recall object using passed text
Cypress.Commands.add('selectFromAutocomplete', (label, text, opts = { parent: '#main-content' }) => {
  cy.fillInput(label, text.substr(0, 3), opts)
  cy.get(opts.parent).contains(text).click({ force: true })
})

Cypress.Commands.add('selectFromDropdown', (label, option, opts = { parent: '#main-content' }) => {
  cy.get(opts.parent)
    .contains('label', label)
    .invoke('attr', 'for')
    .then(id => {
      cy.get(`#${id}`).select(option)
    })
})

// ================================== UPLOAD / DOWNLOAD ===============================

Cypress.Commands.add('downloadPdf', linkText => {
  return cy
    .contains('a', linkText)
    .then($link => {
      const url = $link.attr('href')
      return cy.request({
        url,
        encoding: 'base64',
      })
    })
    .then(response => cy.task('readPdf', response.body).then(pdf => pdf.text))
})

Cypress.Commands.add('downloadEmail', (target, opts = { parent: '#main-content' }) => {
  clickElement(target, 'a', opts)
  // TODO - check download folder
})

Cypress.Commands.add('confirmFileDownloaded', fileName => {
  const downloadedFileName = path.join(Cypress.config('downloadsFolder'), fileName)
  cy.readFile(downloadedFileName, 'binary')
})

Cypress.Commands.add('suggestedCategoryFor', fileName => {
  return cy
    .contains('label', `Select a category for ${fileName}`)
    .invoke('attr', 'for')
    .then(id => cy.get(`#${id}`).invoke('val'))
})

Cypress.Commands.add('uploadFile', ({ field, file, encoding, mimeType }) => {
  cy.get(`[name="${field}"]`).attachFile({ filePath: `../uploads/${file}`, encoding, mimeType })
})

Cypress.Commands.add('uploadPDF', ({ field, file }) => {
  cy.uploadFile({ field, file, mimeType: 'application/pdf' })
})

Cypress.Commands.add('uploadEmail', ({ field }) => {
  cy.uploadFile({ field, file: 'email.msg', mimeType: 'application/octet-stream' })
})

Cypress.Commands.add('uploadDocx', ({ field }) => {
  cy.uploadFile({
    field,
    file: 'lorem-ipsum-msword.docx',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  })
})

// =================================== DATES ================================

Cypress.Commands.add('enterDateTimeFromRecall', propertyName => {
  cy.enterDateTime(recall[propertyName], { parent: `#${propertyName}` })
})

Cypress.Commands.add('enterDateTime', (isoDateTime, opts = { parent: '#main-content' }) => {
  const { day, month, year, hour, minute } = splitIsoDateToParts(isoDateTime)
  cy.fillInput('Day', day, opts)
  cy.fillInput('Month', month, opts)
  cy.fillInput('Year', year, opts)
  if (isoDateTime.length > 10) {
    cy.fillInput('Hour', hour, opts)
    cy.fillInput('Minute', minute, opts)
  }
})

Cypress.Commands.add('enterDateTimeForToday', (opts = { parent: '#main-content' }) => {
  cy.clickButton('Set date to today', opts)
  cy.fillInput('Hour', '00', opts)
  cy.fillInput('Minute', '01', opts)
})

Cypress.Commands.add('assertErrorMessage', ({ fieldName, fieldId, summaryError, fieldError }) => {
  cy.get(`[href="#${fieldId || fieldName}"]`).should('have.text', summaryError)
  cy.get(`#${fieldName}-error`).should($searchResults => {
    const text = $searchResults.text()
    expect(text.trim()).to.contain(fieldError || summaryError)
  })
})

// ================================ RECALL INFO ================================
Cypress.Commands.add('recallInfo', (label, opts = {}) =>
  cy
    .get(opts.parent || 'body')
    .find('.govuk-summary-list__key')
    .contains(exactMatchIgnoreWhitespace(label))
    .next('.govuk-summary-list__value')
    .invoke('text')
    .then(text => text.trim())
)

// ================================ GET RECALL FROM LIST ================================
Cypress.Commands.add('getRecallItemFromList', ({ recallId, columnQaAttr }, opts = {}) =>
  cy
    .get(opts.parent || 'body')
    .find(`[data-qa="recall-id-${recallId}"]`)
    .find(`[data-qa="${columnQaAttr}"]`)
    .invoke('text')
)

// ====================================== TABLES ================================
Cypress.Commands.add('getRowValuesFromTable', ({ rowQaAttr }, opts = {}) =>
  cy
    .get(opts.parent || 'body')
    .find(`[data-qa="${rowQaAttr}"]`)
    .find('.govuk-table__cell')
    .then($els => Cypress.$.makeArray($els).map(el => el.innerText.trim()))
)

Cypress.Commands.add('assertTableColumnValues', ({ qaAttrTable, qaAttrCell, valuesToCompare }) =>
  cy
    .get(`[data-qa="${qaAttrTable}"]`)
    .find(`[data-qa="${qaAttrCell}"]`)
    .each((cell, index) => {
      expect(cell.text().trim()).to.equal(valuesToCompare[index])
    })
)

// ============================== CHECK REQUESTS SENT TO MANAGE RECALLS API ======================

Cypress.Commands.add('assertSaveToRecallsApi', ({ url, method, bodyValues }) => {
  cy.task('findApiRequests', { url, method }).then(requests => {
    if (requests.length) {
      if (bodyValues) {
        const found = requests.some(req => {
          const requestBody = JSON.parse(req.request.body)
          return Object.entries(bodyValues).every(([key, value]) => {
            if (Array.isArray(value)) {
              return JSON.stringify(value) === JSON.stringify(requestBody[key])
            }
            if (value === '*') {
              return isDefined(requestBody[key])
            }
            return requestBody[key] === value
          })
        })
        expect(found).to.equal(true)
      }
    } else {
      throw new Error(`assertApiRequestBody - request not found for url: ${url} and method: ${method}`)
    }
  })
})

Cypress.Commands.add('assertRecallFieldsSavedToApi', ({ recallId, bodyValues }) => {
  cy.assertSaveToRecallsApi({
    url: `/recalls/${recallId}`,
    method: 'PATCH',
    bodyValues,
  })
})
