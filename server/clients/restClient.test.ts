import RestClient, { requestHistogram, timeoutCounter } from './restClient'
import { AgentConfig, ApiConfig } from '../config'

describe('RestClient', () => {
  let config: ApiConfig
  let subject: RestClient
  let responseTimeout: number
  let deadlineTimeout: number

  afterEach(() => {
    jest.resetAllMocks()
  })

  // describe('records request timings for prometheus', () => {
  //   beforeEach(() => {
  //     config = { url: 'https://httpbin.org', timeout: { response: 10000, deadline: 10000 }, agent: new AgentConfig }
  //     subject = new RestClient('Test Client', config)
  //   })

  //   const requestHistogramLabelsSpy = jest.spyOn(requestHistogram, 'labels').mockReturnValue(requestHistogram)
  //   const requestHistogramStartSpy = jest.spyOn(requestHistogram, 'observe')

  //   it('on GET requests', async () => {
  //     await subject.get({ path: '/get' })

  //     expect(requestHistogramLabelsSpy).toHaveBeenCalledTimes(1)
  //     expect(requestHistogramLabelsSpy).toHaveBeenCalledWith('httpbin.org', 'GET', '/get', '200')
  //     expect(requestHistogramStartSpy).toHaveBeenCalledTimes(1)
  //   })

  //   // it('on POST requests', async () => {
  //   //   await subject.post({ path: '/post' })

  //   //   expect(requestHistogramLabelsSpy).toHaveBeenCalledTimes(1)
  //   //   expect(requestHistogramLabelsSpy).toHaveBeenCalledWith('httpbin.org', 'POST', '/post', '200')
  //   //   expect(requestHistogramStartSpy).toHaveBeenCalledTimes(1)
  //   // })
  // })

  describe('records counts of timeout errors', () => {
    const timeoutCounterLabelsSpy = jest.spyOn(timeoutCounter, 'labels').mockReturnValue(timeoutCounter)
    const timeoutCounterIncSpy = jest.spyOn(timeoutCounter, 'inc')

    beforeEach(() => {
      config = { url: 'https://httpbin.org', timeout: { response: 100, deadline: 100 }, agent: new AgentConfig() }
      subject = new RestClient('Test Client', config)
    })

    it('on GET requests', async () => {
      try {
        await subject.get({ path: '/delay/1' })
      } catch {
        // no-op
      }

      expect(timeoutCounterLabelsSpy).toHaveBeenCalledWith('httpbin.org', 'GET', '/delay/1')
      expect(timeoutCounterIncSpy).toHaveBeenCalledTimes(1)
    })
  })
})
