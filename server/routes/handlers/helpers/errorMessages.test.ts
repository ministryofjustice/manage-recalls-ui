import { errorMsgUserActionDateTime, formatValidationErrorMessage } from './errorMessages'

describe('Error messages', () => {
  describe('errorMsgUserActionDateTime', () => {
    it('renders "dateMustBeInPast" error for date only', () => {
      const error = errorMsgUserActionDateTime({ errorId: 'dateMustBeInPast' }, 'sent the email', true)
      expect(error).toEqual('The date you sent the email must be today or in the past')
    })

    it('renders "dateMustBeInPast" error for date and time', () => {
      const error = errorMsgUserActionDateTime({ errorId: 'dateMustBeInPast' }, 'received the email')
      expect(error).toEqual('The time you received the email must be today or in the past')
    })

    it('renders "missingDateParts" error for date only', () => {
      const error = errorMsgUserActionDateTime(
        { errorId: 'missingDateParts', invalidParts: ['day', 'year'] },
        'sent the email',
        true
      )
      expect(error).toEqual('The date you sent the email must include a day and year')
    })

    it('renders "missingDateParts" error for date and time', () => {
      const error = errorMsgUserActionDateTime(
        { errorId: 'missingDateParts', invalidParts: ['day', 'year'] },
        'sent the email'
      )
      expect(error).toEqual('The date and time you sent the email must include a day and year')
    })

    it('renders "minLengthDateParts" error for date only', () => {
      const error = errorMsgUserActionDateTime({ errorId: 'minLengthDateParts' }, 'sent the dossier', true)
      expect(error).toEqual('The date you sent the dossier must be in the correct format, like 06 05 2021')
    })

    it('renders "minLengthDateTimeParts" error for date and time', () => {
      const error = errorMsgUserActionDateTime({ errorId: 'minLengthDateTimeParts' }, 'received the recall email', true)
      expect(error).toEqual(
        'The date and time you received the recall email must be in the correct format, like 06 05 2021 09:03'
      )
    })

    it('renders "minValueDateParts" error for date only', () => {
      const error = errorMsgUserActionDateTime({ errorId: 'minValueDateParts' }, 'sent the dossier', true)
      expect(error).toEqual('The date you sent the dossier must be in the correct format, like 06 05 2021')
    })

    it('renders "minValueDateTimeParts" error for date and time', () => {
      const error = errorMsgUserActionDateTime({ errorId: 'minValueDateTimeParts' }, 'sent the dossier')
      expect(error).toEqual(
        'The date and time you sent the dossier must be in the correct format, like 06 05 2021 09:03'
      )
    })
  })

  describe('errorMsgDate', () => {
    it('renders "blankDateTime" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'blankDateTime' }, 'date of sentence')
      expect(error).toEqual('Enter the date of sentence')
    })

    it('renders "dateMustBeInPast" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'dateMustBeInPast' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be today or in the past')
    })

    it('renders "dateMustBeInFuture" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'dateMustBeInFuture' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be in the future')
    })

    it('renders "invalidDate" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'invalidDate' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be a real date')
    })

    it('renders "missingDateParts" error', () => {
      const error = formatValidationErrorMessage(
        { errorId: 'missingDateParts', invalidParts: ['month'] },
        'date of sentence'
      )
      expect(error).toEqual('The date of sentence must include a month')
    })

    it('renders "minLengthDateTimeParts" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'minLengthDateTimeParts' }, 'date and time of receipt')
      expect(error).toEqual('The date and time of receipt must be in the correct format, like 06 05 2021 09:03')
    })

    it('renders "minLengthDateParts" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'minLengthDateParts' }, 'date of sentence')
      expect(error).toEqual('The date of sentence must be in the correct format, like 06 05 2021')
    })
  })
})
