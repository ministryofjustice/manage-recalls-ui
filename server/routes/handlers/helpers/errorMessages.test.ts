import { errorMsgUserActionDateTime, errorMsgDate } from './errorMessages'

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

    it('renders "minLengthDateParts" error for date only', () => {
      const error = errorMsgUserActionDateTime({ error: 'minLengthDateParts' }, 'sent the dossier', true)
      expect(error).toEqual('The date you sent the dossier must be in the correct format, like 06 05 2021')
    })

    it('renders "minLengthDateTimeParts" error for date and time', () => {
      const error = errorMsgUserActionDateTime({ error: 'minLengthDateTimeParts' }, 'received the recall email', true)
      expect(error).toEqual(
        'The date and time you received the recall email must be in the correct format, like 06 05 2021 09:03'
      )
    })
  })

  describe('errorMsgDate', () => {
    it('renders "blankDateTime" error', () => {
      const error = errorMsgDate({ error: 'blankDateTime' }, 'date of sentence')
      expect(error).toEqual('Enter the date of sentence')
    })

    it('renders "dateMustBeInPast" error', () => {
      const error = errorMsgDate({ error: 'dateMustBeInPast' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be today or in the past')
    })

    it('renders "dateMustBeInFuture" error', () => {
      const error = errorMsgDate({ error: 'dateMustBeInFuture' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be in the future')
    })

    it('renders "invalidDate" error', () => {
      const error = errorMsgDate({ error: 'invalidDate' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be a real date')
    })

    it('renders "missingDateParts" error', () => {
      const error = errorMsgDate({ error: 'missingDateParts', invalidParts: ['month'] }, 'date of sentence')
      expect(error).toEqual('The date of sentence must include a month')
    })

    it('renders "minLengthDateTimeParts" error', () => {
      const error = errorMsgDate({ error: 'minLengthDateTimeParts' }, 'date and time of receipt')
      expect(error).toEqual('The date and time of receipt must be in the correct format, like 06 05 2021 09:03')
    })

    it('renders "minLengthDateParts" error', () => {
      const error = errorMsgDate({ error: 'minLengthDateParts' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be in the correct format, like 06 05 2021')
    })
  })
})
