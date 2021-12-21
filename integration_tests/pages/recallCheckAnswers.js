const page = require('./page')

const checkAnswersPage = ({ nomsNumber, recallId } = {}) =>
  page('Check the details before booking this recall', {
    url: recallId ? `/persons/${nomsNumber}/recalls/${recallId}/check-answers` : null,
    checkChangeLinks: () => {
      const checkLink = (qaAttr, href) => cy.get(`[data-qa=${qaAttr}]`).should('have.attr', 'href').and('include', href)
      checkLink('previousConvictionMainNameChange', '/pre-cons-name?fromPage=check-answers&fromHash=personalDetails')
      checkLink('recallEmailReceivedDateTimeChange', '/request-received?fromPage=check-answers&fromHash=recallDetails')
      checkLink('recallRequestEmailFileNameChange', '/request-received?fromPage=check-answers&fromHash=recallDetails')
      checkLink('sentenceDateChange', '/last-release?fromPage=check-answers&fromHash=sentenceDetails#sentenceDateGroup')
      checkLink(
        'licenceExpiryDateChange',
        '/last-release?fromPage=check-answers&fromHash=sentenceDetails#licenceExpiryDateGroup'
      )
      checkLink(
        'sentenceExpiryDateChange',
        '/last-release?fromPage=check-answers&fromHash=sentenceDetails#sentenceExpiryDateGroup'
      )
      checkLink(
        'sentenceLengthChange',
        '/last-release?fromPage=check-answers&fromHash=sentenceDetails#sentenceLengthGroup'
      )
      checkLink(
        'sentencingCourtChange',
        '/last-release?fromPage=check-answers&fromHash=sentenceDetails#sentencingCourtGroup'
      )
      checkLink('indexOffenceChange', '/last-release?fromPage=check-answers&fromHash=sentenceDetails#indexOffenceGroup')
      checkLink(
        'lastReleasePrisonChange',
        '/last-release?fromPage=check-answers&fromHash=sentenceDetails#lastReleasePrisonGroup'
      )
      checkLink(
        'bookingNumberChange',
        '/last-release?fromPage=check-answers&fromHash=sentenceDetails#bookingNumberGroup'
      )
      checkLink(
        'lastReleaseDateChange',
        '/last-release?fromPage=check-answers&fromHash=sentenceDetails#lastReleaseDateGroup'
      )
      checkLink(
        'conditionalReleaseDateChange',
        '/last-release?fromPage=check-answers&fromHash=sentenceDetails#conditionalReleaseDateGroup'
      )
      checkLink('localPoliceForceChange', '/prison-police?fromPage=check-answers&fromHash=police')
      checkLink(
        'vulnerabilityDiversityChange',
        '/issues-needs?fromPage=check-answers&fromHash=issues#vulnerabilityDiversityGroup'
      )
      checkLink('contrabandChange', '/issues-needs?fromPage=check-answers&fromHash=issues#contrabandGroup')
      checkLink('mappaLevelChange', '/issues-needs?fromPage=check-answers&fromHash=issues#mappaLevelGroup')
      checkLink(
        'probationOfficerChange',
        '/probation-officer?fromPage=check-answers&fromHash=probation#probationOfficerGroup'
      )
      checkLink(
        'localDeliveryUnitChange',
        '/probation-officer?fromPage=check-answers&fromHash=probation#localDeliveryUnitGroup'
      )
      checkLink(
        'authorisingAssistantChiefOfficerChange',
        '/probation-officer?fromPage=check-answers&fromHash=probation#authorisingAssistantChiefOfficerGroup'
      )
      checkLink(
        'uploadedDocument-PART_A_RECALL_REPORT-Change',
        '/upload-documents?fromPage=check-answers&fromHash=uploaded-documents'
      )
      checkLink(
        'uploadedDocument-LICENCE-Change',
        '/upload-documents?fromPage=check-answers&fromHash=uploaded-documents'
      )
      checkLink(
        'uploadedDocument-PREVIOUS_CONVICTIONS_SHEET-Change',
        '/upload-documents?fromPage=check-answers&fromHash=uploaded-documents'
      )
      checkLink(
        'uploadedDocument-PRE_SENTENCING_REPORT-Change',
        '/upload-documents?fromPage=check-answers&fromHash=uploaded-documents'
      )
      checkLink('missingDocumentsDetailChange', '/missing-documents?fromPage=check-answers&fromHash=missing-documents')
      checkLink(
        'missingDocumentsEmailFileNameChange',
        '/missing-documents?fromPage=check-answers&fromHash=missing-documents'
      )
    },
  })

module.exports = { verifyOnPage: checkAnswersPage }
