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
    licenceExpiryDateYear: '2020',
    licenceExpiryDateMonth: '08',
    licenceExpiryDateDay: '4',
    sentenceExpiryDateYear: '2022',
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
    bookingNumber: 'A123456',
  }

  it('returns valuesToSave for all valid fields', () => {
    const { errors, valuesToSave } = validateSentenceDetails(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      conditionalReleaseDate: '2021-10-04',
      indexOffence: 'Assault',
      lastReleaseDate: '2021-05-20',
      lastReleasePrison: 'Belmarsh',
      licenceExpiryDate: '2020-08-04',
      sentenceDate: '2020-03-10',
      sentenceExpiryDate: '2022-10-20',
      sentenceLength: {
        years: 2,
      },
      sentencingCourt: 'Birmingham',
      bookingNumber: 'A123456',
    })
  })

  it('returns errors for missing fields', () => {
    const emptyBody = Object.entries(requestBody).reduce((acc, [key]) => {
      acc[key] = ''
      return acc
    }, {})
    const { errors, valuesToSave } = validateSentenceDetails(emptyBody)
    expect(valuesToSave).toEqual({})
    expect(errors).toEqual([
      {
        href: '#sentenceDate',
        name: 'sentenceDate',
        text: 'Date of sentence',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
      {
        href: '#licenceExpiryDate',
        name: 'licenceExpiryDate',
        text: 'Licence expiry date',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
      {
        href: '#sentenceExpiryDate',
        name: 'sentenceExpiryDate',
        text: 'Sentence expiry date',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
      {
        href: '#sentenceLength',
        name: 'sentenceLength',
        text: 'Length of sentence',
        values: {
          days: '',
          months: '',
          years: '',
        },
      },
      {
        href: '#sentencingCourt',
        name: 'sentencingCourt',
        text: 'Sentencing court',
      },
      {
        href: '#indexOffence',
        name: 'indexOffence',
        text: 'Index offence',
      },
      {
        href: '#lastReleasePrison',
        name: 'lastReleasePrison',
        text: 'Releasing prison',
      },
      {
        href: '#bookingNumber',
        name: 'bookingNumber',
        text: 'Booking number',
      },
      {
        href: '#lastReleaseDate',
        name: 'lastReleaseDate',
        text: 'Latest release date',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
    ])
  })
})
