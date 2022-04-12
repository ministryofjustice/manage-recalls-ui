import { NextFunction, Request, Response } from 'express'
import { serviceMetricsDashboard } from './index'
import { getServiceMetrics } from '../../clients/manageRecallsApiClient'
import metricsJson from '../../../fake-manage-recalls-api/stubs/__files/get-summary-statistics.json'
import { mockReq, mockRes } from '../testUtils/mockRequestUtils'

jest.mock('../../clients/manageRecallsApiClient')

describe('serviceMetricsDashboard', () => {
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = mockReq()
    res = mockRes()
    next = jest.fn()
  })

  it('renders the dashboard page', async () => {
    ;(getServiceMetrics as jest.Mock).mockResolvedValue(metricsJson)
    await serviceMetricsDashboard(req, res, next)
    expect(res.locals).toHaveProperty('timingAveragesSec')
  })

  it('calls error middleware on error', async () => {
    const err = new Error('test')
    ;(getServiceMetrics as jest.Mock).mockRejectedValue(err)
    await serviceMetricsDashboard(req, res, next)
    expect(next).toHaveBeenCalledWith(err)
  })
})
