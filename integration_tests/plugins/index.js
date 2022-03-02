import { pa11y, lighthouse, prepareAudit } from 'cypress-audit'
import wiremock from '../mockApis/wiremock'
import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import manageRecalls from '../mockApis/manageRecallsApi'
import readPdf from './read-pdf'
import osPlaces from '../mockApis/osPlacesApi'

module.exports = (on, config) => {
  const { wiremockUrl, uiClientId } = config.env
  const wiremockApi = wiremock(wiremockUrl)
  const authApi = auth(wiremockApi, uiClientId, config.baseUrl)
  const tokenVerificationApi = tokenVerification(wiremockApi)
  const manageRecallsApi = manageRecalls(wiremockApi)
  const osPlacesApi = osPlaces(wiremockApi)

  // eslint-disable-next-line no-param-reassign
  config.env.AUTH_USERNAME = process.env.AUTH_USERNAME
  // eslint-disable-next-line no-param-reassign
  config.env.AUTH_PASSWORD = process.env.AUTH_PASSWORD

  on('before:browser:launch', (_browser = {}, launchOptions) => {
    prepareAudit(launchOptions)
  })

  on('task', {
    expectAddMissingDocumentsRecord: manageRecallsApi.expectAddMissingDocumentsRecord,
    expectAddUserDetails: manageRecallsApi.expectAddUserDetails,
    expectAssignUserToRecall: manageRecallsApi.expectAssignUserToRecall,
    expectCreateRecall: manageRecallsApi.expectCreateRecall,
    expectDeleteRecallDocument: manageRecallsApi.expectDeleteRecallDocument,
    expectGenerateRecallDocument: manageRecallsApi.expectGenerateRecallDocument,
    expectGetCurrentUserDetails: manageRecallsApi.expectGetCurrentUserDetails,
    expectGetRecall: manageRecallsApi.expectGetRecall,
    expectGetRecallDocument: manageRecallsApi.expectGetRecallDocument,
    expectGetRecallDocumentHistory: manageRecallsApi.expectGetRecallDocumentHistory,
    expectGetSingleFieldChangeHistory: manageRecallsApi.expectGetSingleFieldChangeHistory,
    expectListRecalls: manageRecallsApi.expectListRecalls,
    expectPrisonerResult: manageRecallsApi.expectPrisonerResult,
    expectGetAllFieldsChangeHistory: manageRecallsApi.expectGetAllFieldsChangeHistory,
    expectAddLastKnownAddress: manageRecallsApi.expectAddLastKnownAddress,
    expectRefData: manageRecallsApi.expectRefData,
    expectSearchRecalls: manageRecallsApi.expectSearchRecalls,
    expectSetDocumentCategory: manageRecallsApi.expectSetDocumentCategory,
    expectUnassignAssessment: manageRecallsApi.expectUnassignAssessment,
    expectUpdateRecall: manageRecallsApi.expectUpdateRecall,
    expectUploadRecallDocument: manageRecallsApi.expectUploadRecallDocument,
    expectAddNote: manageRecallsApi.expectAddNote,
    expectAddRescindRequestRecord: manageRecallsApi.expectAddRescindRequestRecord,
    expectUpdateRescindRequestRecord: manageRecallsApi.expectUpdateRescindRequestRecord,
    expectAddReturnToCustodyDates: manageRecallsApi.expectAddReturnToCustodyDates,
    expectSetRecommendedRecallType: manageRecallsApi.expectSetRecommendedRecallType,
    expectSetConfirmedRecallType: manageRecallsApi.expectSetConfirmedRecallType,
    expectStopRecall: manageRecallsApi.expectStopRecall,
    findApiRequests: wiremockApi.findApiRequests,
    getLoginUrl: authApi.getLoginUrl,
    lighthouse: lighthouse(),
    pa11y: pa11y(),
    readPdf: readPdf.readPdf,
    reset: wiremockApi.resetStubs,
    stubAuthPing: authApi.stubPing,
    stubAuthUser: authApi.stubUser,
    stubLogin: authApi.stubLogin,
    stubManageRecallsApiPing: manageRecallsApi.stubPing,
    stubTokenVerificationPing: tokenVerificationApi.stubPing,
    osPlacesPostcodeLookup: osPlacesApi.osPlacesPostcodeLookup,
    osPlacesUprnLookup: osPlacesApi.osPlacesUprnLookup,
  })

  return config
}
