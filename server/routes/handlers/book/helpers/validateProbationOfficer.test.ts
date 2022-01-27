import { validateProbationOfficer } from './validateProbationOfficer'
import * as referenceDataExports from '../../../../referenceData'

describe('validateProbationOfficer', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'probation-officer' }
  const requestBody = {
    probationOfficerName: 'Dave Angel',
    probationOfficerPhoneNumber: '07473739388',
    probationOfficerEmail: 'probation.office@justice.com',
    localDeliveryUnit: 'CENTRAL_AUDIT_TEAM',
    localDeliveryUnitInput: 'Central Audit Team',
    authorisingAssistantChiefOfficer: 'Bob Monkfish',
  }
  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    jest.spyOn(referenceDataExports, 'referenceData').mockReturnValue({
      localDeliveryUnits: [
        {
          value: 'CENTRAL_AUDIT_TEAM',
          text: 'Central Audit Team',
        },
        {
          value: 'CHANNEL_ISLANDS',
          text: 'Channel Islands',
        },
      ],
    })
  })

  it('returns valuesToSave and no errors if all fields are submitted', () => {
    const { errors, valuesToSave } = validateProbationOfficer({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      probationOfficerName: 'Dave Angel',
      probationOfficerPhoneNumber: '07473739388',
      probationOfficerEmail: 'probation.office@justice.com',
      localDeliveryUnit: 'CENTRAL_AUDIT_TEAM',
      authorisingAssistantChiefOfficer: 'Bob Monkfish',
    })
  })

  it('redirects to upload documents if fromPage not supplied', () => {
    const { redirectToPage } = validateProbationOfficer({ requestBody, urlInfo })
    expect(redirectToPage).toEqual('/recalls/upload-documents')
  })

  it('redirects to fromPage if supplied', () => {
    const { redirectToPage } = validateProbationOfficer({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'view-recall' },
    })
    expect(redirectToPage).toEqual('/recalls/view-recall')
  })

  it('returns errors for missing fields, and no valuesToSave', () => {
    const emptyBody = {}
    const { errors, valuesToSave } = validateProbationOfficer({ requestBody: emptyBody, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#probationOfficerName',
        name: 'probationOfficerName',
        text: 'Enter a name',
      },
      {
        href: '#probationOfficerEmail',
        name: 'probationOfficerEmail',
        text: 'Enter an email',
      },
      {
        href: '#probationOfficerPhoneNumber',
        name: 'probationOfficerPhoneNumber',
        text: 'Enter a phone number',
      },
      {
        href: '#localDeliveryUnit',
        name: 'localDeliveryUnit',
        text: 'Select a Local Delivery Unit',
      },
      {
        href: '#authorisingAssistantChiefOfficer',
        name: 'authorisingAssistantChiefOfficer',
        text: 'Enter the Assistant Chief Officer that signed-off the recall',
      },
    ])
  })

  it('returns errors for invalid email and phone, and no valuesToSave', () => {
    const { errors, valuesToSave } = validateProbationOfficer({
      requestBody: {
        ...requestBody,
        probationOfficerPhoneNumber: '003139485349',
        probationOfficerEmail: 'probation.office',
      },
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#probationOfficerEmail',
        name: 'probationOfficerEmail',
        text: 'Enter an email address in the correct format, like name@example.com',
        values: 'probation.office',
      },
      {
        href: '#probationOfficerPhoneNumber',
        name: 'probationOfficerPhoneNumber',
        text: 'Enter a phone number in the correct format, like 01277 960901',
        values: '003139485349',
      },
    ])
  })

  it("returns an error for invalid Local Delivery Unit when there's an existing selection, and no valuesToSave", () => {
    const { errors, valuesToSave } = validateProbationOfficer({
      requestBody: { ...requestBody, localDeliveryUnitInput: '123' },
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#localDeliveryUnit',
        name: 'localDeliveryUnit',
        text: 'Select a Local Delivery Unit from the list',
        values: '123',
      },
    ])
  })

  it("returns an error for invalid Local Delivery Unit when there's no existing selection, and no valuesToSave", () => {
    const { errors, valuesToSave } = validateProbationOfficer({
      requestBody: {
        ...requestBody,
        localDeliveryUnit: '',
        localDeliveryUnitInput: '123',
      },
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#localDeliveryUnit',
        name: 'localDeliveryUnit',
        text: 'Select a Local Delivery Unit from the list',
        values: '123',
      },
    ])
  })
})
