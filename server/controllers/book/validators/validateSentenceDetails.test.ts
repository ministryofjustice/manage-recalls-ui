import { validateSentenceDetails } from './validateSentenceDetails'
import * as referenceDataExports from '../../../referenceData'

describe('validateSentenceDetails', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'last-release' }
  const requestBody = {
    lastReleasePrison: 'BAI',
    lastReleasePrisonInput: 'Belmarsh (HMP)',
    lastReleaseDateYear: '2021',
    lastReleaseDateMonth: '05',
    lastReleaseDateDay: '20',
    sentenceDateYear: '2020',
    sentenceDateMonth: '03',
    sentenceDateDay: '10',
    licenceExpiryDateYear: '2030',
    licenceExpiryDateMonth: '08',
    licenceExpiryDateDay: '04',
    sentenceExpiryDateYear: '2030',
    sentenceExpiryDateMonth: '10',
    sentenceExpiryDateDay: '20',
    sentencingCourt: 'ABDRCT',
    sentencingCourtInput: 'Aberdare County Court',
    indexOffence: 'Assault',
    conditionalReleaseDateYear: '2021',
    conditionalReleaseDateMonth: '10',
    conditionalReleaseDateDay: '04',
    sentenceLengthYears: '2',
    sentenceLengthMonths: '',
    sentenceLengthDays: '',
    bookingNumber: 'A12345',
  }

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(referenceDataExports, 'referenceData').mockReturnValue({
      courts: [
        {
          value: 'ABDRCT',
          text: 'Aberdare County Court',
        },
      ],
      prisons: [
        {
          value: 'BAI',
          text: 'Belmarsh (HMP)',
        },
      ],
    })
  })

  it('returns valuesToSave for all valid fields', () => {
    const { errors, valuesToSave } = validateSentenceDetails({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      conditionalReleaseDate: '2021-10-04',
      indexOffence: 'Assault',
      lastReleaseDate: '2021-05-20',
      lastReleasePrison: 'BAI',
      licenceExpiryDate: '2030-08-04',
      sentenceDate: '2020-03-10',
      sentenceExpiryDate: '2030-10-20',
      sentenceLength: {
        years: 2,
      },
      sentencingCourt: 'ABDRCT',
      bookingNumber: 'A12345',
    })
  })

  it('redirects to prison-police if fromPage not supplied', () => {
    const { redirectToPage } = validateSentenceDetails({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/prison-police')
  })

  it('redirects to fromPage if supplied', () => {
    const { redirectToPage } = validateSentenceDetails({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'view-recall' },
    })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })

  it('returns errors for missing fields', () => {
    const emptyBody = Object.entries(requestBody).reduce((acc, [key]) => {
      acc[key] = ''
      return acc
    }, {})
    const { errors, valuesToSave } = validateSentenceDetails({ requestBody: emptyBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#sentenceDate-sentenceDateDay',
        name: 'sentenceDate-sentenceDateDay',
        text: 'Enter the date of sentence',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
      {
        href: '#licenceExpiryDate-licenceExpiryDateDay',
        name: 'licenceExpiryDate-licenceExpiryDateDay',
        text: 'Enter the licence expiry date',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
      {
        href: '#sentenceExpiryDate-sentenceExpiryDateDay',
        name: 'sentenceExpiryDate-sentenceExpiryDateDay',
        text: 'Enter the sentence expiry date',
        values: {
          day: '',
          month: '',
          year: '',
        },
      },
      {
        href: '#sentenceLength-sentenceLengthYears',
        name: 'sentenceLength-sentenceLengthYears',
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
        href: '#lastReleaseDate-lastReleaseDateDay',
        name: 'lastReleaseDate-lastReleaseDateDay',
        text: 'Enter the latest release date',
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
    const { errors, valuesToSave } = validateSentenceDetails({ requestBody: body, urlInfo })
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

  it("returns an error for invalid Sentencing Court entry when there's an existing selection, and no valuesToSave", () => {
    const { errors, valuesToSave } = validateSentenceDetails({
      requestBody: { ...requestBody, sentencingCourtInput: '123' },
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#sentencingCourt',
        name: 'sentencingCourt',
        text: 'Select a sentencing court from the list',
        values: '123',
      },
    ])
  })

  it("returns an error for invalid Sentencing Court entry when there's no existing selection, and no valuesToSave", () => {
    const { errors, valuesToSave } = validateSentenceDetails({
      requestBody: {
        ...requestBody,
        sentencingCourt: '',
        sentencingCourtInput: '123',
      },
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#sentencingCourt',
        name: 'sentencingCourt',
        text: 'Select a sentencing court from the list',
        values: '123',
      },
    ])
  })

  it("returns an error for invalid releasing prison when there's an existing selection, and no valuesToSave", () => {
    const { errors, valuesToSave } = validateSentenceDetails({
      requestBody: { ...requestBody, lastReleasePrisonInput: '123' },
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#lastReleasePrison',
        name: 'lastReleasePrison',
        text: 'Select a releasing prison from the list',
        values: '123',
      },
    ])
  })

  it("returns an error for invalid releasing prison when there's no existing selection, and no valuesToSave", () => {
    const { errors, valuesToSave } = validateSentenceDetails({
      requestBody: {
        ...requestBody,
        lastReleasePrison: '',
        lastReleasePrisonInput: '123',
      },
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#lastReleasePrison',
        name: 'lastReleasePrison',
        text: 'Select a releasing prison from the list',
        values: '123',
      },
    ])
  })
})
