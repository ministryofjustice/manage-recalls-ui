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
        text: "Probation officer's name",
      },
      {
        href: '#probationOfficerEmail',
        name: 'probationOfficerEmail',
        text: "Probation officer's email",
        errorMsgForField: "Enter the probation officer's email address",
      },
      {
        href: '#probationOfficerPhoneNumber',
        name: 'probationOfficerPhoneNumber',
        text: "Probation officer's phone number",
        errorMsgForField: "Enter the probation officer's phone number",
      },
      {
        href: '#localDeliveryUnit',
        name: 'localDeliveryUnit',
        text: 'Local Delivery Unit',
      },
      {
        href: '#authorisingAssistantChiefOfficer',
        name: 'authorisingAssistantChiefOfficer',
        text: 'Assistant Chief Officer',
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
        text: "Probation officer's email",
        errorMsgForField: 'Enter a valid email address',
        values: 'probation.office',
      },
      {
        href: '#probationOfficerPhoneNumber',
        name: 'probationOfficerPhoneNumber',
        text: "Probation officer's phone number",
        errorMsgForField: 'Enter a valid UK phone number',
        values: '003139485349',
      },
    ])
  })
})
