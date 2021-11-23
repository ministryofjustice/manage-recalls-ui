import type { Express } from 'express'
import request from 'supertest'
import appWithAllRoutes from './routes/testutils/appSetup'
import { recallList } from './routes/handlers/recallList'

jest.mock('./routes/handlers/recallList')

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
        expect(res.text).toContain('NotFoundError: Not found')
        expect(res.text).not.toContain('Something went wrong. The error has been logged. Please try again')
      })
  })

  it('should render content without stack in production mode', () => {
    return request(appWithAllRoutes({ production: true }))
      .get('/unknown')
      .expect(404)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Something went wrong. The error has been logged. Please try again')
        expect(res.text).not.toContain('NotFoundError: Not found')
      })
  })
})

describe('Server error', () => {
  beforeEach(() => (recallList as jest.Mock).mockRejectedValue(new Error('Something went wrong')))

  it('should render content with stack in dev mode', () => {
    return request(app)
      .get('/')
      .expect(500)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Sorry, there is a problem with the service')
        expect(res.text).toContain('Something went wrong')
      })
  })

  it('should render content without stack in production mode', () => {
    return request(appWithAllRoutes({ production: true }))
      .get('/')
      .expect(500)
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Sorry, there is a problem with the service')
        expect(res.text).not.toContain('Something went wrong')
      })
  })
})
