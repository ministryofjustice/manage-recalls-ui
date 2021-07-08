import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './testutils/appSetup'

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET /find-offender', () => {
  it('should render "Find an offender" page', () => {
    return request(app)
      .get('/find-offender')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Find an offender')
      })
  })
})
