import { getFieldChangeHistory } from './getFieldChangeHistory'
import { getFieldHistory } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { mockReq, mockRes, mockNext } from '../../testutils/mockRequestUtils'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')

describe('getFieldChangeHistory', () => {
  afterEach(() => jest.resetAllMocks())

  it('errors if recallId missing', async () => {
    const next = mockNext()
    await getFieldChangeHistory(mockReq(), mockRes(), next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid recallId'))
  })

  it('errors if field ID missing', async () => {
    const next = mockNext()
    await getFieldChangeHistory(mockReq({ params: { recallId: '456' } }), mockRes(), next)
    expect(next).toHaveBeenCalledWith(new Error('Invalid field ID'))
  })

  it('sorts change records by updated date time (descending order)', async () => {
    ;(getFieldHistory as jest.Mock).mockResolvedValue([
      {
        auditId: 0,
        recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        updatedByUserName: 'Maria Badger',
        updatedDateTime: '2022-01-04T13:17:34.000Z',
        updatedValue: 'KTI',
      },
      {
        auditId: 1,
        recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
        updatedByUserName: 'Maria Badger',
        updatedDateTime: '2022-01-04T17:56:22.000Z',
        updatedValue: 'KTI',
      },
    ])
    const res = mockRes()
    await getFieldChangeHistory(
      mockReq({ params: { recallId: '456' }, query: { id: 'currentPrison' } }),
      res,
      mockNext()
    )
    expect(res.locals.fieldHistory).toEqual({
      label: 'Prison held in',
      items: [
        {
          auditId: 1,
          recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          updatedByUserName: 'Maria Badger',
          updatedDateTime: '2022-01-04T17:56:22.000Z',
          updatedValue: 'KTI',
        },
        {
          auditId: 0,
          recallId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          updatedByUserName: 'Maria Badger',
          updatedDateTime: '2022-01-04T13:17:34.000Z',
          updatedValue: 'KTI',
        },
      ],
    })
  })
})
