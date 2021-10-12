/* eslint-disable */
/*
 * Do appinsights first as it does some magic instrumentation work, i.e. it affects other 'require's
 * In particular, applicationinsights automatically collects bunyan logs
 */
import { initialiseAppInsights, buildAppInsightsClient } from './server/utils/azureAppInsights'

initialiseAppInsights()
buildAppInsightsClient()

import { fetchRemoteRefData } from './server/referenceData'
import app from './server/index'
import logger from './logger'
;(async function refData() {
  await fetchRemoteRefData()
})()

app.listen(app.get('port'), () => {
  logger.info(`Server listening on port ${app.get('port')}`)
})
