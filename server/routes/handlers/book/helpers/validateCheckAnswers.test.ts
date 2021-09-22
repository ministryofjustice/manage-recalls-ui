import { validateCheckAnswers } from './validateCheckAnswers'
import { UserDetails } from '../../../../services/userService'

describe('validateCheckAnswers', () => {
  it('returns valuesToSave and no errors if prison is submitted', () => {
    const requestBody = {}
    const user = {
      uuid: '123',
    } as UserDetails
    const { errors, valuesToSave } = validateCheckAnswers(requestBody, user)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      bookedByUserId: user.uuid,
    })
  })
})
