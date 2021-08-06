import { getFormattedRecallLength } from './index'
import { RecallResponse } from '../../../@types/manage-recalls-api/models/RecallResponse'

describe('getFormattedRecallLength', () => {
  it('returns a string if recall length is 14 days', () => {
    const value = getFormattedRecallLength(RecallResponse.recallLength.FOURTEEN_DAYS)
    expect(value).toEqual('14 days')
  })

  it('returns a string if recall length is 28 days', () => {
    const value = getFormattedRecallLength(RecallResponse.recallLength.TWENTY_EIGHT_DAYS)
    expect(value).toEqual('28 days')
  })

  it('returns an empty string if recall length is empty', () => {
    const value = getFormattedRecallLength()
    expect(value).toEqual('')
  })
})
