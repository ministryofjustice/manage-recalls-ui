import {
  checkboxItems,
  filterSelectedItems,
  personOrPeopleFilter,
  selectItems,
  userNameFilter,
} from './nunjucksFunctions'
import { RecallResponse } from '../@types/manage-recalls-api/models/RecallResponse'

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

describe('selectItems function', () => {
  it('inserts a default "Select one" item at the front of the list', () => {
    const items = [
      { value: 'ABC', text: 'A Big Camp' },
      { value: 'DFE', text: 'Dept For Excellence' },
    ]
    const result = selectItems(items)
    expect(result).toEqual([{ value: '', text: 'Select one' }, ...items])
  })

  it('returns an empty array if items param is undefined', () => {
    const result = selectItems()
    expect(result).toEqual([])
  })

  it('returns an empty array if items param is an empty array', () => {
    const result = selectItems([])
    expect(result).toEqual([])
  })

  it('selects the specified item', () => {
    const items = [
      { value: 'ABC', text: 'A Big Camp' },
      { value: 'DFE', text: 'Dept For Excellence' },
    ]
    const result = selectItems(items, 'DFE')
    expect(result).toEqual([
      { value: '', text: 'Select one' },
      { value: 'ABC', text: 'A Big Camp' },
      { value: 'DFE', text: 'Dept For Excellence', selected: true },
    ])
  })
})

describe('checkboxItems function', () => {
  it('marks the selected items as checked', () => {
    const items = [
      {
        value: RecallResponse.reasonForRecall.BREACH_EXCLUSION_ZONE,
        text: 'Breach of exclusion zone',
      },
      {
        value: RecallResponse.reasonForRecall.ELM_BREACH_EXCLUSION_ZONE,
        text: 'Electronic locking and monitoring (ELM) - Breach of exclusion zone - detected by ELM',
      },
      {
        value: RecallResponse.reasonForRecall.ELM_BREACH_NON_CURFEW_CONDITION,
        text: 'Electronic locking and monitoring (ELM) - Breach of non-curfew related condition',
      },
      {
        value: RecallResponse.reasonForRecall.OTHER,
        text: 'Other',
      },
    ]
    const result = checkboxItems(items, [
      RecallResponse.reasonForRecall.BREACH_EXCLUSION_ZONE,
      RecallResponse.reasonForRecall.ELM_EQUIPMENT_TAMPER,
    ])
    expect(result).toEqual([
      {
        checked: true,
        text: 'Breach of exclusion zone',
        value: 'BREACH_EXCLUSION_ZONE',
      },
      {
        text: 'Electronic locking and monitoring (ELM) - Breach of exclusion zone - detected by ELM',
        value: 'ELM_BREACH_EXCLUSION_ZONE',
      },
      {
        text: 'Electronic locking and monitoring (ELM) - Breach of non-curfew related condition',
        value: 'ELM_BREACH_NON_CURFEW_CONDITION',
      },
      {
        text: 'Other',
        value: 'OTHER',
      },
    ])
  })

  it('includes any provided conditional content', () => {
    const items = [
      {
        value: RecallResponse.reasonForRecall.OTHER,
        text: 'Other',
      },
    ]
    const result = checkboxItems(
      items,
      [RecallResponse.reasonForRecall.BREACH_EXCLUSION_ZONE, RecallResponse.reasonForRecall.ELM_EQUIPMENT_TAMPER],
      { OTHER: '<div>test</div>' }
    )
    expect(result).toEqual([
      {
        text: 'Other',
        value: 'OTHER',
        conditional: {
          html: '<div>test</div>',
        },
      },
    ])
  })
})

describe('filterSelectedItems', () => {
  it('returns a filtered list of only selected items', () => {
    const items = [
      {
        value: RecallResponse.reasonForRecall.BREACH_EXCLUSION_ZONE,
        text: 'Electronic locking and monitoring (ELM) - Breach of non-curfew related condition',
      },
      {
        value: RecallResponse.reasonForRecall.OTHER,
        text: 'Other',
      },
    ]
    const result = filterSelectedItems(items, [RecallResponse.reasonForRecall.BREACH_EXCLUSION_ZONE])
    expect(result).toEqual([
      {
        text: 'Electronic locking and monitoring (ELM) - Breach of non-curfew related condition',
        value: 'BREACH_EXCLUSION_ZONE',
      },
    ])
  })
})
