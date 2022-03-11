import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../testUtils/mockRequestUtils'
import { findPerson } from './findPerson'
import { getPrisonerByNomsNumber } from '../../clients/manageRecallsApiClient'

jest.mock('../../clients/manageRecallsApiClient')
const nomsNumber = ' A1234AB '

describe('findPerson', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return data from api for a valid noms number', async () => {
    const person = {
      firstName: 'Bertie',
      lastName: 'Badger',
      nomsNumber,
      dateOfBirth: '1990-10-30',
    }
    ;(getPrisonerByNomsNumber as jest.Mock).mockReturnValueOnce(person)
    const req = mockGetRequest({ query: { nomsNumber } })
    const { res, next } = mockResponseWithAuthenticatedUser('token')
    await findPerson(req, res, next)
    expect(getPrisonerByNomsNumber).toHaveBeenCalledWith(nomsNumber.trim(), 'token')
    expect(res.render).toHaveBeenCalledWith('pages/findPerson')
    expect(res.locals.persons).toEqual([person])
  })

  it('should render an error, if the person request fails', async () => {
    ;(getPrisonerByNomsNumber as jest.Mock).mockRejectedValue(new Error('test'))
    const req = mockGetRequest({ query: { nomsNumber } })
    const { res, next } = mockResponseWithAuthenticatedUser('token')
    await findPerson(req, res, next)
    expect(res.locals.errors).toEqual({
      list: [
        {
          href: '#nomsNumber',
          name: 'nomsNumber',
          text: 'An error occurred searching for the NOMIS number',
        },
      ],
      nomsNumber: {
        href: '#nomsNumber',
        text: 'An error occurred searching for the NOMIS number',
      },
    })
  })

  it('should return error message if invalid noms number', async () => {
    const req = mockGetRequest({ query: { nomsNumber: 0 as unknown as string } })
    const { res, next } = mockResponseWithAuthenticatedUser('')
    await findPerson(req, res, next)
    expect(getPrisonerByNomsNumber).not.toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith('pages/findPerson')
    expect(res.locals.errors).toEqual({
      list: [
        {
          text: 'Enter a NOMIS number',
          href: '#nomsNumber',
          name: 'nomsNumber',
          values: 0,
        },
      ],
      nomsNumber: {
        text: 'Enter a NOMIS number',
        href: '#nomsNumber',
        values: 0,
      },
    })
  })

  it('should return error message and not call the API if noms number is empty string', async () => {
    const req = mockGetRequest({ query: { nomsNumber: '' } })
    const { res, next } = mockResponseWithAuthenticatedUser('')
    await findPerson(req, res, next)
    expect(getPrisonerByNomsNumber).not.toHaveBeenCalled()
    expect(res.render).toHaveBeenCalledWith('pages/findPerson')
    expect(res.locals.errors).toEqual({
      list: [
        {
          text: 'Enter a NOMIS number',
          href: '#nomsNumber',
          name: 'nomsNumber',
          values: '',
        },
      ],
      nomsNumber: {
        text: 'Enter a NOMIS number',
        href: '#nomsNumber',
        values: '',
      },
    })
  })
})
