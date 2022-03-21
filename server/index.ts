import promClient from 'prom-client'
import createApp from './app'
import { createMetricsApp } from './monitoring/metricsApp'
import { HmppsAuthClient } from './clients/hmppsAuthClient'
import TokenStore from './clients/tokenStore'
import UserService from './clients/userService'

promClient.collectDefaultMetrics()

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)

const app = createApp(userService)
const metricsApp = createMetricsApp()

export { app, metricsApp }
export { renderTemplateString } from './nunjucks/nunjucksFunctions'
export { getProperty } from './utils/utils'
export { replaceSpaces } from './utils/utils'
export { areStringArraysTheSame } from './utils/utils'
export { isEmptyString } from './utils/utils'
export { isString } from './utils/utils'
export { isDefined } from './utils/utils'
export { isInvalid } from './utils/utils'
