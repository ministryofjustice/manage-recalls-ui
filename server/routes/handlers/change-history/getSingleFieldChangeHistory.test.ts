import { getSingleFieldChangeHistory } from './getSingleFieldChangeHistory'
import { getSingleFieldHistory } from '../../../clients/manageRecallsApiClient'
import { mockReq, mockRes, mockNext } from '../../testutils/mockRequestUtils'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('getFieldChangeHistory', () => {
  afterEach(() => jest.resetAllMocks())

  it('errors if recallId missing', async () => {
    const next = mockNext()
    await getSingleFieldChangeHistory(mockReq(), mockRes(), next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid recallId'))
  })

  it('errors if fieldName is missing', async () => {
    const next = mockNext()
    await getSingleFieldChangeHistory(mockReq({ params: { recallId: '456' } }), mockRes(), next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid fieldName'))
  })

  it('errors if fieldPath is missing', async () => {
    const next = mockNext()
    await getSingleFieldChangeHistory(
      mockReq({ params: { recallId: '456' }, query: { fieldName: 'currentPrison' } }),
      mockRes(),
      next
    )
    expect(next).toHaveBeenCalledWith(new Error('Invalid fieldPath'))
  })

  it('sorts change records by updated date time (descending order)', async () => {
    ;(getSingleFieldHistory as jest.Mock).mockResolvedValue([
      {
        auditId: 0,
        recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        updatedByUserName: 'Maria Badger',
        updatedDateTime: '2022-01-04T13:17:34.000Z',
        updatedValue: '2022-01-04T13:17:34.000Z',
      },
      {
        auditId: 1,
        recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        updatedByUserName: 'Maria Badger',
        updatedDateTime: '2022-01-04T17:56:22.000Z',
        updatedValue: '2022-01-03T13:17:34.000Z',
      },
    ])
    const res = mockRes()
    await getSingleFieldChangeHistory(
      mockReq({
        params: { recallId: '456' },
        query: { fieldName: 'sentenceExpiryDate', fieldPath: 'sentencingInfo.sentenceExpiryDate' },
      }),
      res,
      mockNext()
    )
    expect(res.locals.fieldHistory).toEqual({
      items: [
        {
          auditId: 1,
          formattedValue: '3 January 2022',
          recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          updatedByUserName: 'Maria Badger',
          updatedDateTime: '2022-01-04T17:56:22.000Z',
          updatedValue: '2022-01-03T13:17:34.000Z',
        },
        {
          auditId: 0,
          formattedValue: '4 January 2022',
          recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          updatedByUserName: 'Maria Badger',
          updatedDateTime: '2022-01-04T13:17:34.000Z',
          updatedValue: '2022-01-04T13:17:34.000Z',
        },
      ],
      label: 'Sentence expiry date',
    })
  })
})
