import { validateDossierPrison } from './validateDossierPrison'
import * as referenceDataExports from '../../../referenceData'

describe('validatePrison', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'assess-prison' }

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(referenceDataExports, 'referenceData').mockReturnValue({
      prisons: [
        {
          value: 'BAI',
          text: 'Belmarsh (HMP)',
        },
      ],
    })
  })

  it('returns valuesToSave and no errors if prison is submitted', () => {
    const requestBody = {
      currentPrison: 'BEL',
      currentPrisonInput: 'Belmarsh (HMP)',
    }
    const { errors, valuesToSave } = validateDossierPrison({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      currentPrison: 'BEL',
    })
  })

  it('redirects to dossier letter page if fromPage not supplied', () => {
    const requestBody = {
      currentPrison: 'BEL',
      currentPrisonInput: 'Belmarsh (HMP)',
    }
    const { redirectToPage } = validateDossierPrison({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/dossier-nsy-email')
  })

  it('redirects to fromPage if supplied', () => {
    const requestBody = {
      currentPrison: 'BEL',
      currentPrisonInput: 'Belmarsh (HMP)',
    }
    const { redirectToPage } = validateDossierPrison({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'view-recall', fromHash: 'prisonDetails' },
    })
    expect(redirectToPage).toEqual('/recalls/view-recall#prisonDetails')
  })

  it('returns no valuesToSave and an error if nothing is submitted', () => {
    const requestBody = {}
    const { errors, valuesToSave } = validateDossierPrison({ requestBody, urlInfo })
    expect(errors).toEqual([
      {
        href: '#currentPrison',
        name: 'currentPrison',
        text: 'Select a prison',
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })

  it("returns an error for invalid prison when there's an existing selection, and no valuesToSave", () => {
    const requestBody = {
      currentPrison: 'BAI',
      currentPrisonInput: '1235',
    }
    const { errors, valuesToSave } = validateDossierPrison({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#currentPrison',
        name: 'currentPrison',
        text: 'Select a prison from the list',
        values: '1235',
      },
    ])
  })

  it("returns an error for invalid prison when there's no existing selection, and no valuesToSave", () => {
    const requestBody = {
      currentPrison: '',
      currentPrisonInput: '1235',
    }
    const { errors, valuesToSave } = validateDossierPrison({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#currentPrison',
        name: 'currentPrison',
        text: 'Select a prison from the list',
        values: '1235',
      },
    ])
  })
})
