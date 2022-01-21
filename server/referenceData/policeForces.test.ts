import { policeForces } from './policeForces'
import { getPoliceForces } from '../clients/manageRecallsApiClient'
import { getReferenceDataItemLabel, isStringValidReferenceData } from './index'

jest.mock('../clients/manageRecallsApi/manageRecallsApiClient')

describe('policeForces refdata', () => {
  ;(getPoliceForces as jest.Mock).mockResolvedValue([
    {
      id: 'avon-and-somerset',
      name: 'Avon and Somerset Constabulary',
    },
    {
      id: 'bedfordshire',
      name: 'Bedfordshire Police',
    },
    {
      id: 'cambridgeshire',
      name: 'Cambridgeshire Constabulary',
    },
  ])
  beforeEach(() => {
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  const policeForcesRefDataCategory = 'policeForces'

  it('fetches and formats a list of policeForces', async () => {
    const promise = policeForces.updateData()
    jest.advanceTimersByTime(5000)
    await promise.then(() => {
      expect(policeForces.data).toEqual([
        {
          value: 'avon-and-somerset',
          text: 'Avon and Somerset Constabulary',
        },
        {
          value: 'bedfordshire',
          text: 'Bedfordshire Police',
        },
        {
          value: 'cambridgeshire',
          text: 'Cambridgeshire Constabulary',
        },
      ])
    })
  })

  // TODO Equivalent tests to the following not present for courts, prisons and LDUs?
  it('getReferenceDataItemLabel returns a label for a valid police force Id', async () => {
    const promise = policeForces.updateData()
    jest.advanceTimersByTime(5000)
    await promise.then(() => {
      const label = getReferenceDataItemLabel(policeForcesRefDataCategory, 'bedfordshire')
      expect(label).toEqual('Bedfordshire Police')
    })
  })

  it('getReferenceDataItemLabel returns undefined for an invalid police force Id', async () => {
    const promise = policeForces.updateData()
    jest.advanceTimersByTime(5000)
    await promise.then(() => {
      const label = getReferenceDataItemLabel(policeForcesRefDataCategory, 'no-such')
      expect(label).toBeUndefined()
    })
  })

  it('isStringValidReferenceData returns false for an invalid label', async () => {
    const promise = policeForces.updateData()
    jest.advanceTimersByTime(5000)
    await promise.then(() => {
      const isValid = isStringValidReferenceData(policeForcesRefDataCategory, 'zzz')
      expect(isValid).toEqual(false)
    })
  })

  it('isStringValidReferenceData returns true for a valid label', async () => {
    const promise = policeForces.updateData()
    jest.advanceTimersByTime(5000)
    await promise.then(() => {
      const isValid = isStringValidReferenceData(policeForcesRefDataCategory, 'Cambridgeshire Constabulary')
      expect(isValid).toEqual(true)
    })
  })
})
