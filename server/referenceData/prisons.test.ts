import { prisons } from './prisons'
import { getPrisonList } from '../data/prisonRegisterClient'

jest.mock('../data/prisonRegisterClient')

describe('prisons refdata', () => {
  ;(getPrisonList as jest.Mock).mockResolvedValue([
    {
      prisonId: 'ALI',
      prisonName: 'Albany (HMP)',
      active: false,
    },
    {
      prisonId: 'AKI',
      prisonName: 'Acklington (HMP)',
      active: true,
    },
  ])

  it('fetches and formats a list of prisons', async () => {
    await prisons.updateData()
    expect(prisons.data).toEqual([
      {
        value: 'ALI',
        text: 'Albany (HMP)',
        active: false,
      },
      {
        value: 'AKI',
        text: 'Acklington (HMP)',
        active: true,
      },
    ])
  })
})
