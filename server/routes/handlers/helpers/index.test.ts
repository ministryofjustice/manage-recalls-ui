import { getFormattedRecallLength, makeErrorObject, getFormattedMappaLevel } from './index'
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

describe('makeErrorObject', () => {
  it('returns an error object', () => {
    const error = makeErrorObject({
      id: 'recallEmailReceivedDateTime',
      text: 'Date and time you received the recall email',
      values: { year: '2021', month: '10', day: '3', hour: '', minute: '' },
    })
    expect(error).toEqual({
      href: '#recallEmailReceivedDateTime',
      name: 'recallEmailReceivedDateTime',
      text: 'Date and time you received the recall email',
      values: {
        day: '3',
        hour: '',
        minute: '',
        month: '10',
        year: '2021',
      },
    })
  })
})

describe('getFormattedMappaLevel', () => {
  it('returns a string if recall length is level 1', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.LEVEL_1)
    expect(value).toEqual('Level 1')
  })

  it('returns a string if recall length is Level 2', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.LEVEL_2)
    expect(value).toEqual('Level 2')
  })

  it('returns a string if recall length is Level 3', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.LEVEL_3)
    expect(value).toEqual('Level 3')
  })

  it('returns a string if recall length is N/A', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.NA)
    expect(value).toEqual('N/A')
  })

  it('returns a string if recall length is CONFIRMATION_REQUIRED', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.CONFIRMATION_REQUIRED)
    expect(value).toEqual('Confirmation required')
  })

  it('returns a string if recall length is Not known', () => {
    const value = getFormattedMappaLevel(RecallResponse.mappaLevel.NOT_KNOWN)
    expect(value).toEqual('Not known')
  })

  it('returns an empty string if recall length is empty', () => {
    const value = getFormattedMappaLevel()
    expect(value).toEqual('')
  })
})
