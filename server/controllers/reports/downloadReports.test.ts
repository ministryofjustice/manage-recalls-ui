import { Request, Response } from 'express'
import { getWeeklyRecallsNew } from '../../clients/manageRecallsApiClient'
import { downloadReport } from './downloadReport'
import { mockReq, mockRes } from '../testUtils/mockRequestUtils'

jest.mock('../../clients/manageRecallsApiClient')

describe('downloadReports', () => {
  const downloadFileContents = 'file contents'
  let req: Request
  let res: Response

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
  })

  afterEach(() => jest.resetAllMocks())

  it('should serve a weekly recalls new report with contentType text/csv', async () => {
    const fileName = 'weekly-recalls-new.csv'
    ;(getWeeklyRecallsNew as jest.Mock).mockResolvedValue({
      category: 'WEEKLY_RECALLS_NEW',
      mimeType: 'text/csv',
      fileName,
      content: downloadFileContents,
    })
    await downloadReport(req, res)
    expect(res.contentType).toHaveBeenCalledWith('text/csv')
    expect(res.header).toHaveBeenCalledWith('Content-Disposition', `attachment; filename="${fileName}"`)
    expect(res.send).toHaveBeenCalledWith(downloadFileContents)
  })

  it('redirects back to reports page with an error, if the get report call fails', async () => {
    ;(getWeeklyRecallsNew as jest.Mock).mockRejectedValue({ statusCode: 500 })
    await downloadReport(req, res)
    expect(res.redirect).toHaveBeenCalledWith(301, '/reports')
    expect(req.session.errors).toEqual([
      {
        href: '#error_WEEKLY_RECALLS_NEW',
        name: 'error_WEEKLY_RECALLS_NEW',
        text: 'An error occurred when creating the report. Please try downloading it again',
      },
    ])
  })
})
