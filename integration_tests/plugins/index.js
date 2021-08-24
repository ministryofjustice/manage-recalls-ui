import wiremock from '../mockApis/wiremock'
import auth from '../mockApis/auth'
import tokenVerification from '../mockApis/tokenVerification'
import manageRecalls from '../mockApis/manageRecallsApi'
import prisonRegister from '../mockApis/prisonRegisterApi'
import readPdf from './read-pdf'

module.exports = (on, config) => {
  const { wiremockUrl, uiClientId } = config.env
  const wiremockApi = wiremock(wiremockUrl)
  const authApi = auth(wiremockApi, uiClientId, config.baseUrl)
  const tokenVerificationApi = tokenVerification(wiremockApi)
  const manageRecallsApi = manageRecalls(wiremockApi)
  const prisonRegisterApi = prisonRegister(wiremockApi)

  // eslint-disable-next-line no-param-reassign
  config.env.AUTH_USERNAME = process.env.AUTH_USERNAME
  // eslint-disable-next-line no-param-reassign
  config.env.AUTH_PASSWORD = process.env.AUTH_PASSWORD

  on('task', {
    reset: wiremockApi.resetStubs,
    getLoginUrl: authApi.getLoginUrl,
    stubLogin: authApi.stubLogin,
    stubAuthUser: authApi.stubUser,
    stubAuthPing: authApi.stubPing,
    stubTokenVerificationPing: tokenVerificationApi.stubPing,
    stubManageRecallsApiPing: manageRecallsApi.stubPing,
    expectSearchResults: manageRecallsApi.expectSearchResults,
    expectGetRevocationOrder: manageRecallsApi.expectGetRevocationOrder,
    expectCreateRecall: manageRecallsApi.expectCreateRecall,
    expectListRecalls: manageRecallsApi.expectListRecalls,
    expectGetRecall: manageRecallsApi.expectGetRecall,
    expectAddRecallDocument: manageRecallsApi.expectAddRecallDocument,
    expectUpdateRecall: manageRecallsApi.expectUpdateRecall,
    expectPrisonList: prisonRegisterApi.expectPrisonList,
    readPdf: readPdf.readPdf,
  })
  return config
}
