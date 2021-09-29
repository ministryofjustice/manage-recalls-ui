import { mockGetRequest, mockResponseWithAuthenticatedUser } from '../../testutils/mockRequestUtils'
import { findPerson } from './findPerson'
import { searchByNomsNumber, searchRecalls } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import getRecallsResponse from '../../../../fake-manage-recalls-api/stubs/__files/get-recalls.json'

jest.mock('../../../clients/manageRecallsApi/manageRecallsApiClient')
const nomsNumber = ' A1234AB '

describe('findPerson', () => {
  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should return data from api for a valid noms number, including recalls', async () => {
    const person = {
      firstName: 'Bertie',
      lastName: 'Badger',
      nomsNumber,
      dateOfBirth: '1990-10-30',
    }
    ;(searchByNomsNumber as jest.Mock).mockReturnValueOnce(person)
    ;(searchRecalls as jest.Mock).mockReturnValueOnce(getRecallsResponse)
    const req = mockGetRequest({ query: { nomsNumber } })
    const { res, next } = mockResponseWithAuthenticatedUser('token')
    await findPerson(req, res, next)
    expect(searchByNomsNumber).toHaveBeenCalledWith(nomsNumber.trim(), 'token')
    expect(res.render).toHaveBeenCalledWith('pages/findPerson')
    expect(res.locals.persons).toEqual([person])
    expect(res.locals.persons[0].recalls).toEqual(getRecallsResponse)
  })

  it('should person data without recalls, if the recalls request fails', async () => {
    const person = {
      firstName: 'Bertie',
      lastName: 'Badger',
      nomsNumber,
      dateOfBirth: '1990-10-30',
    }
    ;(searchByNomsNumber as jest.Mock).mockReturnValueOnce(person)
    ;(searchRecalls as jest.Mock).mockRejectedValue(new Error('test'))
    const req = mockGetRequest({ query: { nomsNumber } })
    const { res, next } = mockResponseWithAuthenticatedUser('token')
    await findPerson(req, res, next)
    expect(res.locals.persons[0].recalls).toEqual([])
  })

  it('should render an error, if the person request fails', async () => {
    ;(searchByNomsNumber as jest.Mock).mockRejectedValue(new Error('test'))
    ;(searchRecalls as jest.Mock).mockReturnValueOnce(getRecallsResponse)
    const req = mockGetRequest({ query: { nomsNumber } })
    const { res, next } = mockResponseWithAuthenticatedUser('token')
    await findPerson(req, res, next)
    expect(res.locals.errors).toEqual({
      list: [
        {
          href: '#nomsNumber',
          name: 'nomsNumber',
          text: 'An error occurred searching for the NOMIS number"',
        },
      ],
      nomsNumber: {
        href: '#nomsNumber',
        text: 'An error occurred searching for the NOMIS number"',
      },
    })
  })

  it('should return error message if invalid noms number', async () => {
    const req = mockGetRequest({ query: { nomsNumber: 0 as unknown as string } })
    const { res, next } = mockResponseWithAuthenticatedUser('')
    await findPerson(req, res, next)
    expect(res.render).toHaveBeenCalledWith('pages/findPerson')
    expect(res.locals.errors).toEqual({
      list: [
        {
          errorMsgForField: 'Enter a NOMIS number',
          href: '#nomsNumber',
          name: 'nomsNumber',
          text: 'NOMIS number',
          values: 0,
        },
      ],
      nomsNumber: {
        errorMsgForField: 'Enter a NOMIS number',
        href: '#nomsNumber',
        text: 'NOMIS number',
        values: 0,
      },
    })
  })
})
