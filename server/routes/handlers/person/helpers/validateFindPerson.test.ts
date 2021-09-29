import { validateFindPerson } from './validateFindPerson'

describe('validateFindPerson', () => {
  it('returns undefined if nomsNumber is undefined', () => {
    expect(validateFindPerson()).toBeUndefined()
  })

  it('returns an error if nomsNumber is not a string', () => {
    expect(validateFindPerson(true as unknown as string)).toEqual([
      {
        errorMsgForField: 'Enter a NOMIS number',
        href: '#nomsNumber',
        name: 'nomsNumber',
        text: 'NOMIS number',
        values: true,
      },
    ])
  })

  it('returns an error if nomsNumber is an invalid format', () => {
    expect(validateFindPerson('A123')).toEqual([
      {
        errorMsgForField: '"A123" is not a valid NOMIS number',
        href: '#nomsNumber',
        name: 'nomsNumber',
        text: 'NOMIS number',
        values: 'A123',
      },
    ])
  })

  it('returns an error if nomsNumber is an empty string', () => {
    expect(validateFindPerson('')).toEqual([
      {
        errorMsgForField: 'Enter a NOMIS number',
        href: '#nomsNumber',
        name: 'nomsNumber',
        text: 'NOMIS number',
        values: '',
      },
    ])
  })
})
