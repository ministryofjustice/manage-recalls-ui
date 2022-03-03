import { formatPersonName } from './person'
import { RecallResponse } from '../../@types/manage-recalls-api'

describe('formatPersonName', () => {
  it('should format first + last name', () => {
    const recall = {
      firstName: 'John',
      lastName: 'Doe',
    } as RecallResponse
    expect(formatPersonName({ category: 'FIRST_LAST', recall })).toBe('John Doe')
  })

  it('should format first + middle + last name', () => {
    const recall = {
      firstName: 'John',
      middleNames: 'Michael',
      lastName: 'Doe',
    } as RecallResponse
    expect(formatPersonName({ category: 'FIRST_MIDDLE_LAST', recall })).toBe('John Michael Doe')
  })

  it('should leave out middle name if it does not exist, even if FIRST_MIDDLE_LAST is the category', () => {
    const recall = {
      firstName: 'John',
      middleNames: '',
      lastName: 'Doe',
    } as RecallResponse
    expect(formatPersonName({ category: 'FIRST_MIDDLE_LAST', recall })).toBe('John Doe')
  })

  it('should format other name', () => {
    const recall = {
      firstName: 'John',
      middleNames: 'Michael',
      lastName: 'Doe',
    } as RecallResponse
    expect(formatPersonName({ category: 'OTHER', otherName: 'Dave Bumble', recall })).toBe('Dave Bumble')
  })
})
