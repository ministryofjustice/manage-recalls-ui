import nock from 'nock'
import { findPrisonById, getPrisonList } from './prisonRegisterClient'
import config from '../config'

describe('prisonRegisterClient', () => {
  let fakePrisonRegisterApi: nock.Scope

  beforeEach(() => {
    fakePrisonRegisterApi = nock(config.apis.prisonRegister.url)
  })

  afterEach(() => {
    nock.cleanAll()
  })

  describe('getActivePrisonList', () => {
    it('returns a list of all prisons if successful', async () => {
      const expectedPrisons = [
        {
          prisonId: 'AKI',
          prisonName: 'Acklington (HMP)',
          active: true,
        },
        {
          prisonId: 'ALI',
          prisonName: 'Albany (HMP)',
          active: false,
        },
      ]
      fakePrisonRegisterApi.get(`/prisons`).reply(200, expectedPrisons)

      const prisons = await getPrisonList()
      expect(prisons).toEqual(expectedPrisons)
    })

    it('alphabetically sorts the list by prison name', async () => {
      const belmarshPrison = {
        prisonId: 'BEL',
        prisonName: 'Belmarsh (HMP)',
        active: true,
      }
      const kennetPrison = {
        prisonId: 'KEN',
        prisonName: 'Kennet (HMP)',
        active: true,
      }
      const acklingtonPrison = {
        prisonId: 'AKI',
        prisonName: 'Acklington (HMP)',
        active: true,
      }
      fakePrisonRegisterApi.get(`/prisons`).reply(200, [belmarshPrison, kennetPrison, acklingtonPrison])
      const prisons = await getPrisonList()
      expect(prisons).toEqual([acklingtonPrison, belmarshPrison, kennetPrison])
    })

    it('returns undefined if no prisons are returned', async () => {
      fakePrisonRegisterApi.get(`/prisons`).reply(200, [])
      const prisons = await getPrisonList()
      expect(prisons).toBeUndefined()
    })

    it('returns undefined if the request fails', async () => {
      fakePrisonRegisterApi.get(`/prisons`).replyWithError('Boom')
      const prisons = await getPrisonList()
      expect(prisons).toBeUndefined()
    })
  })

  describe('findPrisonById', () => {
    it('can retrieve a prison by id', async () => {
      const prisonId = 'ALI'
      const expectedPrison = {
        prisonId,
        prisonName: 'Albany (HMP)',
        active: false,
      }
      fakePrisonRegisterApi.get(`/prisons/id/${prisonId}`).reply(200, expectedPrison)
      const prison = await findPrisonById(prisonId)
      expect(prison).toEqual(expectedPrison)
    })

    it('returns undefined if no prison is found', async () => {
      fakePrisonRegisterApi.get(`/prisons/id/XXX`).reply(404)
      const prison = await findPrisonById('XXX')
      expect(prison).toBeUndefined()
    })

    it('returns undefined if the request fails', async () => {
      fakePrisonRegisterApi.get('/prisons/id/XXX').replyWithError('Boom')
      const prison = await findPrisonById('XXX')
      expect(prison).toBeUndefined()
    })
  })
})
