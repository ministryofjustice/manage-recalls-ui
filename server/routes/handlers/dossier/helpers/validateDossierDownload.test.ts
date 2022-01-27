import { validateDossierDownload } from './validateDossierDownload'

describe('validateDossierDownload', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'dossier-download' }
  const requestBody = {
    hasDossierBeenChecked: 'YES',
  }

  it('returns valuesToSave', () => {
    const { errors, valuesToSave, redirectToPage } = validateDossierDownload({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      hasDossierBeenChecked: true,
    })
    expect(redirectToPage).toEqual('/recalls/dossier-email')
  })

  it('returns an error for the confirm checkbox, if not checked', () => {
    const { errors, valuesToSave } = validateDossierDownload({ requestBody: {}, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#hasDossierBeenChecked',
        name: 'hasDossierBeenChecked',
        text: "Confirm you've checked the information in the dossier and letter",
      },
    ])
  })
})
