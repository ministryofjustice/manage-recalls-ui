import { personOrPeopleFilter, userNameFilter } from './nunjucksFilters'

describe('personOrPeopleFilter', () => {
  it('count is 0', () => {
    expect(personOrPeopleFilter(0)).toEqual('0 people')
  })

  it('count is 1', () => {
    expect(personOrPeopleFilter(1)).toEqual('1 person')
  })

  it('count is 2', () => {
    expect(personOrPeopleFilter(2)).toEqual('2 people')
  })
})

describe('userNameFilter', () => {
  it('undefined name returns null', () => {
    expect(userNameFilter(undefined)).toEqual(null)
  })

  it('single name returns itself', () => {
    expect(userNameFilter('Smith')).toEqual('Smith')
  })

  it('two names returns first name capitalised and last name', () => {
    expect(userNameFilter('John Smith')).toEqual('J. Smith')
  })

  it('three names returns first name capitalised and last name', () => {
    expect(userNameFilter('John Charles Smith')).toEqual('J. Smith')
  })
})
