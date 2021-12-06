import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './routes/testutils/appSetup'
import { findPerson } from './routes/handlers/person/findPerson'

jest.mock('./routes/handlers/person/findPerson')

let app: Express

beforeEach(() => {
  app = appWithAllRoutes({})
})

afterEach(() => {
  jest.resetAllMocks()
})

describe('GET 404', () => {
  it('should render content with stack in dev mode', () => {
    return request(app)
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Page not found')
      })
  })
})

describe('Server error', () => {
  beforeEach(() => (findPerson as jest.Mock).mockRejectedValue(new Error('Something went wrong')))

  it('should render content with stack in dev mode', () => {
    return request(app)
      .get('/find-person')
      .expect(500)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Sorry, there is a problem with the service')
        expect(res.text).toContain('Something went wrong')
      })
  })

  it('should render content without stack in production mode', () => {
    return request(appWithAllRoutes({ production: true }))
      .get('/find-person')
      .expect(500)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Sorry, there is a problem with the service')
        expect(res.text).not.toContain('Something went wrong')
      })
  })
})
