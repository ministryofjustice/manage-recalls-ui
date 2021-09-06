const page = require('./page')

const recallSentenceDetailsPage = ({ nomsNumber, recallId } = {}) =>
  page('What are the sentence, offence and release details?', {
    url: nomsNumber ? `/persons/${nomsNumber}/recalls/${recallId}/last-release` : null,
    setSentenceDate: () => {
      cy.get('[name="sentenceDateYear"]').clear().type('2019')
      cy.get('[name="sentenceDateMonth"]').clear().type('01')
      cy.get('[name="sentenceDateDay"]').clear().type('03')
    },
    setLicenceExpiryDate: () => {
      cy.get('[name="licenceExpiryDateYear"]').clear().type('2020')
      cy.get('[name="licenceExpiryDateMonth"]').clear().type('01')
      cy.get('[name="licenceExpiryDateDay"]').clear().type('03')
    },
    setSentenceExpiryDate: () => {
      cy.get('[name="sentenceExpiryDateYear"]').clear().type('2020')
      cy.get('[name="sentenceExpiryDateMonth"]').clear().type('04')
      cy.get('[name="sentenceExpiryDateDay"]').clear().type('12')
    },
    setConditionalReleaseExpiryDate: () => {
      cy.get('[name="conditionalReleaseDateYear"]').clear().type('2021')
      cy.get('[name="conditionalReleaseDateMonth"]').clear().type('09')
      cy.get('[name="conditionalReleaseDateDay"]').clear().type('3')
    },
    setSentenceLength: () => {
      cy.get('[name="sentenceLengthYears"]').clear().type('3')
      cy.get('[name="sentenceLengthMonths"]').clear().type('2')
    },
    setReleasingPrison: () => {
      cy.get('[id="lastReleasePrison"]').clear().type('Ack')
      cy.contains('Acklington (HMP)').click()
    },
    setLastReleaseDate: () => {
      cy.get('[name="lastReleaseDateYear"]').clear().type('2020')
      cy.get('[name="lastReleaseDateMonth"]').clear().type('05')
      cy.get('[name="lastReleaseDateDay"]').clear().type('03')
    },
    setSentencingCourt: () => {
      cy.get('[name="sentencingCourt"]').type('Manchester Crown Court')
    },
    setIndexOffence: () => {
      cy.get('[name="indexOffence"]').type('Burglary')
    },
    setBookingNumber: () => {
      cy.get('[name="bookingNumber"]').type('A123456')
    },
  })

module.exports = { verifyOnPage: recallSentenceDetailsPage }
