// @ts-nocheck
import { mockReq, mockRes } from '../../testutils/mockRequestUtils'
import { returnToCustodyDatesFormHandler } from './returnToCustodyDatesFormHandler'
import { addReturnToCustodyDates } from '../../../clients/manageRecallsApiClient'

jest.mock('../../../clients/manageRecallsApiClient')

describe('returnToCustodyDatesFormHandler', () => {
  const nomsNumber = 'A1234AB'
  const recallId = '00000000-0000-0000-0000-000000000000'
  const requestBody = {
    returnToCustodyDateTimeDay: '10',
    returnToCustodyDateTimeMonth: '05',
    returnToCustodyDateTimeYear: '2021',
    returnToCustodyDateTimeHour: '05',
    returnToCustodyDateTimeMinute: '03',
    returnToCustodyNotificationDateTimeDay: '15',
    returnToCustodyNotificationDateTimeMonth: '07',
    returnToCustodyNotificationDateTimeYear: '2020',
    returnToCustodyNotificationDateTimeHour: '15',
    returnToCustodyNotificationDateTimeMinute: '45',
  }
  let res

  beforeEach(() => {
    res = mockRes({ locals: { basePath: `/persons/${nomsNumber}/recalls/${recallId}/` } })
  })

  afterEach(() => jest.resetAllMocks())

  it('should save to the API then redirect to recalls list', async () => {
    addReturnToCustodyDates.mockResolvedValue({ status: 200 })
    const req = mockReq({
      method: 'POST',
      params: { nomsNumber, recallId },
      body: requestBody,
    })

    await returnToCustodyDatesFormHandler(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, '/')
  })

  it('should reload the page if the request body is invalid', async () => {
    const currentPageUrl = `/persons/${nomsNumber}/recalls/${recallId}/rtc-dates`
    addReturnToCustodyDates.mockResolvedValue({ status: 200 })
    const req = mockReq({
      method: 'POST',
      originalUrl: currentPageUrl,
      params: { nomsNumber, recallId },
      body: {},
    })

    await returnToCustodyDatesFormHandler(req, res)

    expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
  })

  it('should reload the page if the API errors', async () => {
    const currentPageUrl = `/persons/${nomsNumber}/recalls/${recallId}/rtc-dates`
    addReturnToCustodyDates.mockRejectedValueOnce(new Error('API error'))
    const req = mockReq({
      method: 'POST',
      originalUrl: currentPageUrl,
      params: { nomsNumber, recallId },
      body: requestBody,
    })

    await returnToCustodyDatesFormHandler(req, res)

    expect(req.session.errors).toEqual([
      {
        name: 'saveError',
        text: 'An error occurred saving your changes',
      },
    ])
    expect(res.redirect).toHaveBeenCalledWith(303, currentPageUrl)
  })
})
