import { validateGeneratedDocumentVersion } from './validateGeneratedDocumentVersion'

describe('validateGeneratedDocumentVersion', () => {
  it('returns an error if details is missing, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave, unsavedValues } = validateGeneratedDocumentVersion({ requestBody })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      details: undefined,
    })
    expect(errors).toEqual([
      {
        href: '#details',
        name: 'details',
        text: 'Provide more detail',
      },
    ])
  })

  it('returns valuesToSave if details is present, and no errors', () => {
    const requestBody = {
      details: 'Changed',
      category: 'RECALL_NOTIFICATION',
    }
    const { errors, valuesToSave } = validateGeneratedDocumentVersion({ requestBody })
    expect(valuesToSave).toEqual(requestBody)

    expect(errors).toBeUndefined()
  })
})
