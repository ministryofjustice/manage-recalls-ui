import { validateFindPerson } from './validateFindPerson'

describe('validateFindPerson', () => {
  it('returns undefined if nomsNumber is undefined', () => {
    expect(validateFindPerson()).toBeUndefined()
  })

  it('returns an error if nomsNumber is not a string', () => {
    expect(validateFindPerson(true as unknown as string)).toEqual([
      {
        text: 'Enter a NOMIS number',
        href: '#nomsNumber',
        name: 'nomsNumber',
        values: true,
      },
    ])
  })

  it('returns an error if nomsNumber is an invalid format', () => {
    expect(validateFindPerson('A123')).toEqual([
      {
        text: 'Enter a NOMIS number in the correct format',
        href: '#nomsNumber',
        name: 'nomsNumber',
        values: 'A123',
      },
    ])
  })

  it('returns an error if nomsNumber is an empty string', () => {
    expect(validateFindPerson('')).toEqual([
      {
        text: 'Enter a NOMIS number',
        href: '#nomsNumber',
        name: 'nomsNumber',
        values: '',
      },
    ])
  })
})
