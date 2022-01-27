import { validatePolice } from './validatePolice'
import * as referenceDataExports from '../../../../referenceData'

describe('validatePolice', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'prison-police' }

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(referenceDataExports, 'referenceData').mockReturnValue({
      policeForces: [
        {
          value: 'metropolitan',
          text: 'Metropolitan Police Service',
        },
      ],
    })
  })

  it('returns updateRecallRequest as valuesToSave and no errors if valid localPoliceForce is submitted', () => {
    const requestBody = {
      localPoliceForceId: 'metropolitan',
      localPoliceForceIdInput: 'Metropolitan Police Service',
    }
    const { errors, valuesToSave } = validatePolice({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      localPoliceForceId: 'metropolitan',
    })
  })

  it('redirects to issues & needs if fromPage not supplied', () => {
    const requestBody = {
      localPoliceForceId: 'metropolitan',
      localPoliceForceIdInput: 'Metropolitan Police Service',
    }
    const { redirectToPage } = validatePolice({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/issues-needs')
  })

  it('redirects to fromPage if supplied', () => {
    const requestBody = {
      localPoliceForceId: 'metropolitan',
      localPoliceForceIdInput: 'Metropolitan Police Service',
    }
    const { redirectToPage } = validatePolice({ requestBody, urlInfo: { ...urlInfo, fromPage: 'view-recall' } })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })

  it('returns no valuesToSave and an error if nothing is submitted', () => {
    const requestBody = {}
    const { errors, valuesToSave } = validatePolice({ requestBody, urlInfo })
    expect(errors).toEqual([
      {
        href: '#localPoliceForceId',
        name: 'localPoliceForceId',
        text: 'Select a local police force',
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })

  it('returns an error and no valuesToSave for invalid localPoliceForce entry when there is an existing selection', () => {
    const requestBody = {
      localPoliceForceId: 'metropolitan',
      localPoliceForceIdInput: '123',
    }
    const { errors, valuesToSave } = validatePolice({ requestBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#localPoliceForceId',
        name: 'localPoliceForceId',
        text: 'Select a local police force from the list',
        values: '123',
      },
    ])
  })

  it('returns an error and no valuesToSave for invalid localPoliceForce entry when there is no existing selection', () => {
    const requestBody = {
      localPoliceForceId: '',
      localPoliceForceIdInput: '123',
    }
    const { errors, valuesToSave } = validatePolice({ requestBody, urlInfo })

    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#localPoliceForceId',
        name: 'localPoliceForceId',
        text: 'Select a local police force from the list',
        values: '123',
      },
    ])
  })
})
