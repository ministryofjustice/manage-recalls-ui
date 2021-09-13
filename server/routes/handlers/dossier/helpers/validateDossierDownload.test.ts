import { validateDossierDownload } from './validateDossierDownload'

describe('validateDossierDownload', () => {
  const requestBody = {
    hasDossierBeenChecked: 'YES',
  }

  it('returns valuesToSave', () => {
    const { errors, valuesToSave } = validateDossierDownload(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      hasDossierBeenChecked: true,
    })
  })

  it('returns an error for the confirm checkbox, if not checked', () => {
    const { errors, valuesToSave } = validateDossierDownload({})
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#hasDossierBeenChecked',
        name: 'hasDossierBeenChecked',
        text: 'Have the dossier and letter been checked?',
      },
    ])
  })
})
