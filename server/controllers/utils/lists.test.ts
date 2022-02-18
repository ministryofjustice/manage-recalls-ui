import { listToString, sortList } from './lists'

describe('listToString', () => {
  it('returns a list for 1 item', () => {
    expect(listToString(['day'], 'and')).toEqual('day')
  })

  it('uses the supplied conjunction', () => {
    expect(listToString(['JPG', 'JPEG'], 'or')).toEqual('JPG or JPEG')
  })

  it('returns a list for 2 items', () => {
    expect(listToString(['year', 'day'], 'and')).toEqual('year and day')
  })

  it('returns a list for 3 items', () => {
    expect(listToString(['year', 'month', 'day'], 'and')).toEqual('year, month and day')
  })

  it('returns a list for 4 items', () => {
    expect(listToString(['year', 'month', 'day', 'minute'], 'and')).toEqual('year, month, day and minute')
  })
})

describe('sortList', () => {
  it('sorts ascending', () => {
    const list = [{ name: 'bdd' }, { name: 'bbc' }, { name: 'bcc' }]
    const result = sortList(list, 'name', true)
    expect(result).toEqual([{ name: 'bbc' }, { name: 'bcc' }, { name: 'bdd' }])
  })
  it('sorts descending', () => {
    const list = [{ name: 'Licence.pdf' }, { name: 'Part A.pdf' }, { name: 'OASys.pdf' }]
    const result = sortList(list, 'name', false)
    expect(result).toEqual([{ name: 'Part A.pdf' }, { name: 'OASys.pdf' }, { name: 'Licence.pdf' }])
  })
})
