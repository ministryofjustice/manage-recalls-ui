import { errorMsgUserActionDateTime } from './errorMessages'

describe('Error messages', () => {
  describe('errorMsgUserActionDateTime', () => {
    it('renders "dateMustBeInPast" error for date only', () => {
      const error = errorMsgUserActionDateTime({ error: 'dateMustBeInPast' }, 'sent the email', true)
      expect(error).toEqual('The date you sent the email must be today or in the past')
    })

    it('renders "dateMustBeInPast" error for date and time', () => {
      const error = errorMsgUserActionDateTime({ error: 'dateMustBeInPast' }, 'received the email')
      expect(error).toEqual('The time you received the email must be today or in the past')
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
