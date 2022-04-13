import { policeForces } from './policeForces'
import { getPoliceForces } from '../clients/manageRecallsApiClient'
import { getReferenceDataItemLabel, isStringValidReferenceData } from './index'

jest.mock('../clients/manageRecallsApiClient')

describe('policeForces refdata', () => {
  beforeEach(() => {
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
    jest.useFakeTimers()
  })
  afterEach(() => {
    jest.useRealTimers()
  })

  const policeForcesRefDataCategory = 'policeForces'

  it('fetches and formats a list of policeForces', () => {
    const promise = policeForces.updateData()
    jest.advanceTimersByTime(5000)
    return promise.then(() => {
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
  it('getReferenceDataItemLabel returns a label for a valid police force Id', () => {
    const promise = policeForces.updateData()
    jest.advanceTimersByTime(5000)
    return promise.then(() => {
      const label = getReferenceDataItemLabel(policeForcesRefDataCategory, 'bedfordshire')
      expect(label).toEqual('Bedfordshire Police')
    })
  })

  it('getReferenceDataItemLabel returns undefined for an invalid police force Id', () => {
    const promise = policeForces.updateData()
    jest.advanceTimersByTime(5000)
    return promise.then(() => {
      const label = getReferenceDataItemLabel(policeForcesRefDataCategory, 'no-such')
      expect(label).toBeUndefined()
    })
  })

  it('isStringValidReferenceData returns false for an invalid label', () => {
    const promise = policeForces.updateData()
    jest.advanceTimersByTime(5000)
    return promise.then(() => {
      const isValid = isStringValidReferenceData(policeForcesRefDataCategory, 'zzz')
      expect(isValid).toEqual(false)
    })
  })

  it('isStringValidReferenceData returns true for a valid label', () => {
    const promise = policeForces.updateData()
    jest.advanceTimersByTime(5000)
    return promise.then(() => {
      const isValid = isStringValidReferenceData(policeForcesRefDataCategory, 'Cambridgeshire Constabulary')
      expect(isValid).toEqual(true)
    })
  })
})
