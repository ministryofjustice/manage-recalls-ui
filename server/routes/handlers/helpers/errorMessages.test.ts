import { errorMsgUserActionDateTime, listItems } from './errorMessages'

describe('Error messages', () => {
  describe('listItems', () => {
    it('returns a list for 1 item', () => {
      expect(listItems(['day'])).toEqual('day')
    })

    it('returns a list for 2 items', () => {
      expect(listItems(['year', 'day'])).toEqual('year and day')
    })

    it('returns a list for 3 items', () => {
      expect(listItems(['year', 'month', 'day'])).toEqual('year, month and day')
    })

    it('returns a list for 4 items', () => {
      expect(listItems(['year', 'month', 'day', 'minute'])).toEqual('year, month, day and minute')
    })
  })

  describe('errorMsgUserActionDateTime', () => {
    it('renders "dateMustBeInPast" error for date only', () => {
      const error = errorMsgUserActionDateTime({ error: 'dateMustBeInPast' }, 'sent the email', true)
      expect(error).toEqual('The date you sent the email must be in the past')
    })

    it('renders "dateMustBeInPast" error for date and time', () => {
      const error = errorMsgUserActionDateTime({ error: 'dateMustBeInPast' }, 'received the email')
      expect(error).toEqual('The time you received the email must be in the past')
    })

    it('renders "missingDateParts" error for date only', () => {
      const error = errorMsgUserActionDateTime(
        { error: 'missingDateParts', invalidParts: ['day', 'year'] },
        'sent the email',
        true
      )
      expect(error).toEqual('The date you sent the email must include a day and year')
    })

    it('renders "missingDateParts" error for date and time', () => {
      const error = errorMsgUserActionDateTime(
        { error: 'missingDateParts', invalidParts: ['day', 'year'] },
        'sent the email'
      )
      expect(error).toEqual('The date and time you sent the email must include a day and year')
    })
  })
})
