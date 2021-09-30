import { validateSentenceDetails } from './validateSentenceDetails'

describe('validateSentenceDetails', () => {
  const requestBody = {
    lastReleasePrison: 'Belmarsh',
    lastReleaseDateYear: '2021',
    lastReleaseDateMonth: '05',
    lastReleaseDateDay: '20',
    sentenceDateYear: '2020',
    sentenceDateMonth: '03',
    sentenceDateDay: '10',
    licenceExpiryDateYear: '2030',
    licenceExpiryDateMonth: '08',
    licenceExpiryDateDay: '4',
    sentenceExpiryDateYear: '2030',
    sentenceExpiryDateMonth: '10',
    sentenceExpiryDateDay: '20',
    sentencingCourt: 'Birmingham',
    indexOffence: 'Assault',
    conditionalReleaseDateYear: '2021',
    conditionalReleaseDateMonth: '10',
    conditionalReleaseDateDay: '4',
    sentenceLengthYears: '2',
    sentenceLengthMonths: '',
    sentenceLengthDays: '',
    bookingNumber: 'A12345',
  }

  it('returns valuesToSave for all valid fields', () => {
    const { errors, valuesToSave } = validateSentenceDetails(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      conditionalReleaseDate: '2021-10-04',
      indexOffence: 'Assault',
      lastReleaseDate: '2021-05-20',
      lastReleasePrison: 'Belmarsh',
      licenceExpiryDate: '2030-08-04',
      sentenceDate: '2020-03-10',
      sentenceExpiryDate: '2030-10-20',
      sentenceLength: {
        years: 2,
      },
      sentencingCourt: 'Birmingham',
      bookingNumber: 'A12345',
    })
  })

  it('returns errors for missing fields', () => {
    const emptyBody = Object.entries(requestBody).reduce((acc, [key]) => {
      acc[key] = ''
      return acc
    }, {})
    const { errors, valuesToSave } = validateSentenceDetails(emptyBody)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#sentenceDate',
        name: 'sentenceDate',
        text: 'Enter the date of sentence',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
      {
        href: '#licenceExpiryDate',
        name: 'licenceExpiryDate',
        text: 'Enter a licence expiry date',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
      {
        href: '#sentenceExpiryDate',
        name: 'sentenceExpiryDate',
        text: 'Enter a sentence expiry date',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
      {
        href: '#sentenceLength',
        name: 'sentenceLength',
        text: 'Enter the length of sentence',
        values: {
          days: '',
          months: '',
          years: '',
        },
      },
      {
        href: '#sentencingCourt',
        name: 'sentencingCourt',
        text: 'Select a sentencing court',
      },
      {
        href: '#indexOffence',
        name: 'indexOffence',
        text: 'Select an index offence',
      },
      {
        href: '#lastReleasePrison',
        name: 'lastReleasePrison',
        text: 'Select a releasing prison',
      },
      {
        href: '#bookingNumber',
        name: 'bookingNumber',
        text: 'Enter a booking number',
      },
      {
        href: '#lastReleaseDate',
        name: 'lastReleaseDate',
        text: 'Enter a latest release date',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
    ])
  })

  it('returns an error for invalid booking number, and no valuesToSave', () => {
    const body = {
      ...requestBody,
      bookingNumber: '123',
    }
    const { errors, valuesToSave } = validateSentenceDetails(body)
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#bookingNumber',
        name: 'bookingNumber',
        text: 'Enter a booking number in the correct format, like 12345C, A12347 or AB1234',
        values: '123',
      },
    ])
  })
})
