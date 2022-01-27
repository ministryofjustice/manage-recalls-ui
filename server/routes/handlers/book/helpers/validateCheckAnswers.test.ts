import { validateCheckAnswers } from './validateCheckAnswers'
import { UserDetails } from '../../../../services/userService'

describe('validateCheckAnswers', () => {
  it('returns valuesToSave and no errors if check answers is submitted', () => {
    const urlInfo = { basePath: '/recalls/', currentPage: 'check-answers' }
    const user = {
      uuid: '123',
    } as UserDetails
    const { errors, valuesToSave, redirectToPage } = validateCheckAnswers({ urlInfo, user })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      bookedByUserId: user.uuid,
    })
    expect(redirectToPage).toEqual('/recalls/confirmation')
  })
})
