import { NextFunction, Request, Response } from 'express'
import { getWeeklyRecallsNew } from '../../clients/manageRecallsApiClient'
import { downloadReport } from './downloadReport'
import { mockReq, mockRes } from '../testUtils/mockRequestUtils'

jest.mock('../../clients/manageRecallsApiClient')

describe('downloadReports', () => {
  const downloadFileContents = 'file contents'
  let req: Request
  let res: Response
  let next: NextFunction

  beforeEach(() => {
    req = mockReq({
      query: { pageSuffix: 'reports' },
    })
    res = mockRes({
      locals: {
        urlInfo: { basePath: '/' },
      },
      token: '000',
    })
    res.contentType = jest.fn()
    res.header = jest.fn()
    res.send = jest.fn()
    next = jest.fn()
  })

  it('should serve a weekly recalls new report with contentType text/csv', async () => {
    const fileName = 'weekly-recalls-new.csv'
    ;(getWeeklyRecallsNew as jest.Mock).mockResolvedValue({
      category: 'WEEKLY_RECALLS_NEW',
      mimeType: 'text/csv',
      fileName,
      content: downloadFileContents,
    })
    await downloadReport(req, res, next)
    expect(res.contentType).toHaveBeenCalledWith('text/csv')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
    expect(res.send).toHaveBeenCalledWith(downloadFileContents)
  })

  it('calls error middleware, if the get report call fails', async () => {
    ;(getWeeklyRecallsNew as jest.Mock).mockRejectedValue({ statusCode: 500 })
    await downloadReport(req, res, next)
    expect(next).toHaveBeenCalled()
  })
})
