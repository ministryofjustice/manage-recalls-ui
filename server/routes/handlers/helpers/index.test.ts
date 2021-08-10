import { getFormattedRecallLength, makeErrorObject, splitIsoDateToParts, validateDate } from './index'
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

describe('validateDate', () => {
  it('returns a UTC corrected date object for a valid date-time that falls within BST period', () => {
    const result = validateDate({ year: '2021', month: '05', day: '30', hour: '14', minute: '12' })
    expect(result.toISOString()).toEqual('2021-05-30T13:12:00.000Z')
  })

  it('returns a UTC corrected date object for a valid date-time that falls outside BST period', () => {
    const result = validateDate({ year: '2021', month: '01', day: '12', hour: '11', minute: '40' })
    expect(result.toISOString()).toEqual('2021-01-12T11:40:00.000Z')
  })

  it('returns a date object for a valid date-time', () => {
    const result = validateDate({ year: '2021', month: '01', day: '12', hour: '10', minute: '53' })
    expect(result.toISOString()).toEqual('2021-01-12T10:53:00.000Z')
  })

  it('returns a date object for a valid date', () => {
    const result = validateDate({ year: '2021', month: '01', day: '12' })
    expect(result.toISOString()).toEqual('2021-01-12T00:00:00.000Z')
  })

  it('returns null for an invalid date-time', () => {
    const result = validateDate({ year: '2021', month: '14', day: '45', hour: '10', minute: '53' })
    expect(result).toBeNull()
  })

  it('returns null for a blank date-time', () => {
    const result = validateDate({ year: '', month: '', day: '', hour: '', minute: '' })
    expect(result).toBeNull()
  })
})

describe('splitIsoDateToParts', () => {
  it('returns date parts for a given ISO date string, with hours corrected for the current time zone', () => {
    const result = splitIsoDateToParts('2021-05-30T13:12:00.000Z')
    expect(result).toEqual({
      year: 2021,
      month: 5,
      day: 30,
      hour: 14,
      minute: 12,
    })
  })

  it('returns undefined if passed an empty date string', () => {
    const result = splitIsoDateToParts()
    expect(result).toBeUndefined()
  })
})
