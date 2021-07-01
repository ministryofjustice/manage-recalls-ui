import type { Express } from 'express'
import request from 'supertest'
import nock from 'nock'
import appWithAllRoutes from './testutils/appSetup'
import config from '../config'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /', () => {
  it('should render index page', () => {
    return request(app)
      .get('/')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Find an offender')
      })
  })
})

describe('POST /create-recall', () => {
  const token = { access_token: 'token-1', expires_in: 300 }

  let fakeManageRecallsApi: nock.Scope

  beforeEach(() => {
    fakeManageRecallsApi = nock(config.apis.manageRecallsApi.url)
  })

  it('should book recall and render new page', () => {
    fakeManageRecallsApi
      .post('/create-recall')
      .matchHeader('authorization', `Bearer ${token.access_token}`)
      .reply(200, '12345')

    return request(app)
      .post('/create-recall')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Recall is booked')
      })
  })
})
