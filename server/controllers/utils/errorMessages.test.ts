import {
  errorMsgUserActionDateTime,
  formatValidationErrorMessage,
  makeErrorObject,
  renderErrorMessages,
  transformErrorMessages,
} from './errorMessages'

describe('Error messages', () => {
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

  describe('renderErrorMessages', () => {
    it('returns error messages with placeholders filled with data', () => {
      const errors = [
        {
          href: '#additionalLicenceConditionsDetail',
          name: 'additionalLicenceConditionsDetail',
          text: 'Provide detail on additional licence conditions',
        },
        {
          text: 'Enter the NOMIS number <span data-private>{{ recall.fullName }}</span> is being held under',
          href: '#differentNomsNumberDetail',
          name: 'differentNomsNumberDetail',
          values: 'A123',
        },
      ]
      const result = renderErrorMessages(transformErrorMessages(errors), {
        recall: { fullName: 'Dave Angel' },
      })
      expect(result).toEqual({
        additionalLicenceConditionsDetail: {
          href: '#additionalLicenceConditionsDetail',
          text: 'Provide detail on additional licence conditions',
        },
        differentNomsNumberDetail: {
          text: 'Enter the NOMIS number <span data-private>Dave Angel</span> is being held under',
          href: '#differentNomsNumberDetail',
          values: 'A123',
        },
        list: [
          {
            href: '#additionalLicenceConditionsDetail',
            name: 'additionalLicenceConditionsDetail',
            html: 'Provide detail on additional licence conditions',
          },
          {
            href: '#differentNomsNumberDetail',
            name: 'differentNomsNumberDetail',
            html: 'Enter the NOMIS number <span data-private>Dave Angel</span> is being held under',
            values: 'A123',
          },
        ],
      })
    })
  })

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
      const error = errorMsgUserActionDateTime(
        { errorId: 'minLengthDateTimeParts' },
        'received the recall email',
        false
      )
      expect(error).toEqual(
        'The date and time you received the recall email must be in the correct format, like 06 05 2021 09:03'
      )
    })

    it('renders "minValueDateYear" error for date only', () => {
      const error = errorMsgUserActionDateTime({ errorId: 'minValueDateYear' }, 'sent the dossier', true)
      expect(error).toEqual('The year you sent the dossier must be later than 1900')
    })
  })

  describe('formatValidationErrorMessage', () => {
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

    it('renders "missingDate" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'missingDate' }, 'date and time of email')
      expect(error).toEqual('The date and time of email must include a date')
    })

    it('renders "missingTime" error', () => {
      const error = formatValidationErrorMessage({ errorId: 'missingTime' }, 'date and time of email')
      expect(error).toEqual('The date and time of email must include a time')
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
