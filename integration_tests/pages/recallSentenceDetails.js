import { DateTime } from 'luxon'

const page = require('./page')

const { year, month, day } = DateTime.now().plus({ months: 1 })

const recallSentenceDetailsPage = ({ nomsNumber, recallId } = {}) =>
  page('What are the sentence, offence and release details?', {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/last-release` : null,
    setSentenceDate: () => {
      cy.get('[name="sentenceDateYear"]').clear().type('2019')
      cy.get('[name="sentenceDateMonth"]').clear().type('01')
      cy.get('[name="sentenceDateDay"]').clear().type('03')
    },
    setLicenceExpiryDate: () => {
      cy.get('[name="licenceExpiryDateYear"]').clear().type(year)
      cy.get('[name="licenceExpiryDateMonth"]').clear().type(month.toString().padStart(2, '0'))
      cy.get('[name="licenceExpiryDateDay"]').clear().type(day.toString().padStart(2, '0'))
    },
    setSentenceExpiryDate: () => {
      cy.get('[name="sentenceExpiryDateYear"]').clear().type('2030')
      cy.get('[name="sentenceExpiryDateMonth"]').clear().type('04')
      cy.get('[name="sentenceExpiryDateDay"]').clear().type('12')
    },
    setConditionalReleaseExpiryDate: () => {
      cy.get('[name="conditionalReleaseDateYear"]').clear().type('2021')
      cy.get('[name="conditionalReleaseDateMonth"]').clear().type('09')
      cy.get('[name="conditionalReleaseDateDay"]').clear().type('03')
    },
    setSentenceLength: () => {
      cy.get('[name="sentenceLengthYears"]').clear().type('3')
      cy.get('[name="sentenceLengthMonths"]').clear().type('2')
    },
    setReleasingPrison: () => {
      cy.get('[id="lastReleasePrison"]').clear().type('Ack')
      cy.contains('Acklington (HMP)').click({ force: true })
    },
    enterReleasingPrison: nameSubString => {
      cy.get('[id="lastReleasePrison"]')
        .clear()
        .type(nameSubString || 'Ack')
    },
    setLastReleaseDate: () => {
      cy.get('[name="lastReleaseDateYear"]').clear().type('2020')
      cy.get('[name="lastReleaseDateMonth"]').clear().type('05')
      cy.get('[name="lastReleaseDateDay"]').clear().type('03')
    },
    setSentencingCourt: () => {
      cy.get('[id="sentencingCourt"]').clear().type('Aberd')
      cy.contains('Aberdare County Court').click({ force: true })
    },
    enterSentencingCourt: nameSubString => {
      cy.get('[id="sentencingCourt"]')
        .clear()
        .type(nameSubString || 'Aberd')
    },
    setIndexOffence: () => {
      cy.get('[name="indexOffence"]').type('Burglary')
    },
    setBookingNumber: bookingNumber => {
      cy.get('[name="bookingNumber"]').type(bookingNumber || 'A12345')
    },
  })

module.exports = { verifyOnPage: recallSentenceDetailsPage }
