import { listItems } from './errorMessages'

describe('Error messages', () => {
  describe('listItems', () => {
    it('returns a list for 1 item', () => {
      expect(listItems(['day'])).toEqual('day')
    })

    it('returns a list for 2 items', () => {
      expect(listItems(['year', 'day'])).toEqual('year and day')
    })

    it('returns a list for 3 items', () => {
      expect(listItems(['year', 'month', 'day'])).toEqual('year, month and day')
    })

    it('returns a list for 4 items', () => {
      expect(listItems(['year', 'month', 'day', 'minute'])).toEqual('year, month, day and minute')
    })
  })
})
