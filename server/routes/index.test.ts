import request from 'supertest'
import appWithAllRoutes from '../controllers/testUtils/appSetup'

describe('Routes', () => {
  it('responds on a route', () => {
    const app = appWithAllRoutes({})
    return request(app)
      .get('/find-person')
      .expect('Content-Type', /html/)
      .expect(res => {
        expect(res.text).toContain('Find a person')
      })
  })
})
