import createApp from './app'
import { createMetricsApp } from './metricsApp'
import { HmppsAuthClient } from './data/hmppsAuthClient'
import TokenStore from './data/tokenStore'
import UserService from './services/userService'

const hmppsAuthClient = new HmppsAuthClient(new TokenStore())
const userService = new UserService(hmppsAuthClient)

const app = createApp(userService)
const metricsApp = createMetricsApp()

export { app, metricsApp }
