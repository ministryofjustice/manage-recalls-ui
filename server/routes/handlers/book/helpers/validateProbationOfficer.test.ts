import { validateProbationOfficer } from './validateProbationOfficer'

describe('validateProbationOfficer', () => {
  it('returns valuesToSave and no errors if all fields are submitted', () => {
    const requestBody = {
      probationOfficerName: 'Dave Angel',
      probationOfficerPhoneNumber: '07473739388',
      probationOfficerEmail: 'probation.office@justice.com',
      localDeliveryUnit: 'CENTRAL_AUDIT_TEAM',
      authorisingAssistantChiefOfficer: 'Bob Monkfish',
    }
    const { errors, valuesToSave } = validateProbationOfficer(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      probationOfficerName: 'Dave Angel',
      probationOfficerPhoneNumber: '07473739388',
      probationOfficerEmail: 'probation.office@justice.com',
      localDeliveryUnit: 'CENTRAL_AUDIT_TEAM',
      authorisingAssistantChiefOfficer: 'Bob Monkfish',
    })
  })

  it('returns errors for missing fields, and no valuesToSave', () => {
    const requestBody = {}
    const { errors, valuesToSave } = validateProbationOfficer(requestBody)
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
        text: 'Enter the Assistant Chief Officer',
      },
    ])
  })

  it('returns errors for invalid email and phone, and no valuesToSave', () => {
    const requestBody = {
      probationOfficerName: 'Dave Angel',
      probationOfficerPhoneNumber: '003139485349',
      probationOfficerEmail: 'probation.office',
      localDeliveryUnit: 'CENTRAL_AUDIT_TEAM',
      authorisingAssistantChiefOfficer: 'Bob Monkfish',
    }
    const { errors, valuesToSave } = validateProbationOfficer(requestBody)
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
})
