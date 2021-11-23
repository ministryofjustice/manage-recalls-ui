import { getPersonAndRecall } from './getPersonAndRecall'
import { getRecall } from '../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { getPerson } from '../personCache'

jest.mock('../../../../clients/manageRecallsApi/manageRecallsApiClient')
jest.mock('../personCache')

describe('getPersonAndRecall', () => {
  it('returns a person and recall if API calls succeed', async () => {
    const nomsNumber = '456'
    const recallId = '789'
    const token = 'token'
    const person = { firstName: 'Bobby', lastName: 'Badger' }
    const recall = {
      bookingNumber: '123',
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence Wesley Holt.pdf',
        },
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'PreCons Wesley Holt.pdf',
        },
      ],
    }
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    const { person: personFromApi, recall: recallFromApi } = await getPersonAndRecall({ recallId, nomsNumber, token })
    expect(personFromApi).toEqual(person)
    expect(recallFromApi).toEqual(recall)
  })

  it('throws if recall call fails but person call succeeds', async () => {
    const nomsNumber = '456'
    const recallId = '789'
    const token = 'token'
    const person = { firstName: 'Bobby', lastName: 'Badger' }
    ;(getRecall as jest.Mock).mockRejectedValue(new Error('Timeout'))
    ;(getPerson as jest.Mock).mockResolvedValue(person)
    try {
      await getPersonAndRecall({ recallId, nomsNumber, token })
    } catch (e) {
      expect(e.message).toEqual(`getRecall failed for ID ${recallId}`)
    }
  })

  it('throws if person call fails but recall call succeeds', async () => {
    const nomsNumber = '456'
    const recallId = '789'
    const token = 'token'
    const recall = {
      bookingNumber: '123',
      documents: [
        {
          category: 'LICENCE',
          documentId: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
          fileName: 'Licence Wesley Holt.pdf',
        },
        {
          category: 'PREVIOUS_CONVICTIONS_SHEET',
          documentId: '1234-5717-4562-b3fc-2c963f66afa6',
          fileName: 'PreCons Wesley Holt.pdf',
        },
      ],
    }
    ;(getRecall as jest.Mock).mockResolvedValue(recall)
    ;(getPerson as jest.Mock).mockRejectedValue(new Error('Timeout'))
    try {
      await getPersonAndRecall({ recallId, nomsNumber, token })
    } catch (e) {
      expect(e.message).toEqual(`getPerson failed`)
    }
  })
})
