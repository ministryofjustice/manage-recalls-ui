import {
  allowedDocumentFileExtensionList,
  allowedEmailFileExtensionList,
  backLinkUrl,
  changeLinkUrl,
  checkboxItems,
  dateTimeItems,
  filterSelectedItems,
  makeUrl,
  personOrPeopleFilter,
  recallStatusTagProperties,
  removeUndefinedFromObject,
  selectItems,
  userNameFilter,
} from './nunjucksFunctions'
import { reasonForRecall } from '../referenceData'
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

  it('sets the default item to a blank string if the select will be used as an autocomplete', () => {
    const items = [
      { value: 'ABC', text: 'A Big Camp' },
      { value: 'DFE', text: 'Dept For Excellence' },
    ]
    const result = selectItems(items, 'ABC', true)
    expect(result).toEqual([
      { value: '', text: '' },
      { value: 'ABC', text: 'A Big Camp', selected: true },
      { value: 'DFE', text: 'Dept For Excellence' },
    ])
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

  it('returns a separate copy of all items, not references to the same ones', () => {
    const items = [
      { value: 'ABC', text: 'A Big Camp' },
      { value: 'DFE', text: 'Dept For Excellence' },
    ]
    const result = selectItems(items)
    expect(result[1]).not.toBe(items[0])
  })
})

describe('checkboxItems function', () => {
  it('marks the selected items as checked', () => {
    const items = [
      {
        value: reasonForRecall.BREACH_EXCLUSION_ZONE,
        text: 'Breach of exclusion zone',
      },
      {
        value: reasonForRecall.ELM_BREACH_EXCLUSION_ZONE,
        text: 'Electronic locking and monitoring (ELM) - Breach of exclusion zone - detected by ELM',
      },
      {
        value: reasonForRecall.ELM_BREACH_NON_CURFEW_CONDITION,
        text: 'Electronic locking and monitoring (ELM) - Breach of non-curfew related condition',
      },
      {
        value: reasonForRecall.OTHER,
        text: 'Other',
      },
    ]
    const result = checkboxItems(items, [reasonForRecall.BREACH_EXCLUSION_ZONE, reasonForRecall.ELM_EQUIPMENT_TAMPER])
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
        value: reasonForRecall.OTHER,
        text: 'Other',
      },
    ]
    const result = checkboxItems(items, [reasonForRecall.BREACH_EXCLUSION_ZONE, reasonForRecall.ELM_EQUIPMENT_TAMPER], {
      OTHER: '<div>test</div>',
    })
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
        value: reasonForRecall.BREACH_EXCLUSION_ZONE,
        text: 'Electronic locking and monitoring (ELM) - Breach of non-curfew related condition',
      },
      {
        value: reasonForRecall.OTHER,
        text: 'Other',
      },
    ]
    const result = filterSelectedItems(items, [reasonForRecall.BREACH_EXCLUSION_ZONE])
    expect(result).toEqual([
      {
        text: 'Electronic locking and monitoring (ELM) - Breach of non-curfew related condition',
        value: 'BREACH_EXCLUSION_ZONE',
      },
    ])
  })
})

describe('dateTimeItems', () => {
  it('generates a list of items for input values', () => {
    const items = dateTimeItems('testField', { year: '2021', month: '8', day: '20', hour: '0', minute: '5' }, true)
    expect(items).toEqual([
      {
        attributes: {
          maxlength: 2,
        },
        classes: 'govuk-input--width-2',
        label: 'Day',
        name: 'testFieldDay',
        value: '20',
      },
      {
        attributes: {
          maxlength: 2,
        },
        classes: 'govuk-input--width-2',
        label: 'Month',
        name: 'testFieldMonth',
        type: 'number',
        value: '8',
      },
      {
        attributes: {
          maxlength: 4,
        },
        classes: 'govuk-input--width-4 govuk-!-margin-right-8',
        label: 'Year',
        name: 'testFieldYear',
        value: '2021',
      },
      {
        attributes: {
          maxlength: 2,
        },
        classes: 'govuk-input--width-2',
        label: 'Hour',
        name: 'testFieldHour',
        type: 'number',
        value: '0',
      },
      {
        attributes: {
          maxlength: 2,
        },
        classes: 'govuk-input--width-2 govuk-!-margin-right-8',
        label: 'Minute',
        name: 'testFieldMinute',
        value: '5',
      },
    ])
  })
})

describe('allowedDocumentFileExtensionList', () => {
  it('should return a list of extensions', () => {
    expect(allowedDocumentFileExtensionList()).toEqual('.pdf')
  })
})

describe('allowedEmailFileExtensionList', () => {
  it('should return a list of extensions', () => {
    expect(allowedEmailFileExtensionList()).toEqual('.msg,.eml')
  })
})

describe('makeUrl', () => {
  it('uses fromPage and CSRF query strings if both are supplied', () => {
    const url = makeUrl(
      'request-received',
      { fromPage: 'check-answers', currentPage: 'check-answers', basePath: '/person/123/recalls/456/' },
      'a1b2c3'
    )
    expect(url).toEqual('/person/123/recalls/456/request-received?fromPage=check-answers&_csrf=a1b2c3')
  })

  it('uses fromPage query string if supplied', () => {
    const url = makeUrl('request-received', {
      fromPage: 'check-answers',
      currentPage: 'check-answers',
      basePath: '/person/123/recalls/456/',
    })
    expect(url).toEqual('/person/123/recalls/456/request-received?fromPage=check-answers')
  })

  it('uses CSRF query string if supplied', () => {
    const url = makeUrl(
      'request-received',
      { basePath: '/person/123/recalls/456/', currentPage: 'check-answers' },
      'a1b2c3'
    )
    expect(url).toEqual('/person/123/recalls/456/request-received?_csrf=a1b2c3')
  })
})

describe('changeLinkUrl', () => {
  it('adds currentPage as the fromPage param', () => {
    const url = changeLinkUrl(
      'request-received',
      {
        basePath: '/person/123/recalls/456/',
        currentPage: 'check-answers',
      },
      'recallRequest'
    )
    expect(url).toEqual('/person/123/recalls/456/request-received?fromPage=check-answers&fromHash=recallRequest')
  })

  it('adds a hash if supplied', () => {
    const url = changeLinkUrl(
      'last-release',
      { basePath: '/person/123/recalls/456/', currentPage: 'check-answers' },
      'sentenceDetails',
      'sentenceExpiryDateFieldset'
    )
    expect(url).toEqual(
      '/person/123/recalls/456/last-release?fromPage=check-answers&fromHash=sentenceDetails#sentenceExpiryDateFieldset'
    )
  })

  it('appends an extra query string if supplied', () => {
    const url = changeLinkUrl(
      'last-release',
      { basePath: '/person/123/recalls/456/', currentPage: 'check-answers' },
      'sentenceDetails',
      'sentenceExpiryDateFieldset',
      'key=val'
    )
    expect(url).toEqual(
      '/person/123/recalls/456/last-release?fromPage=check-answers&fromHash=sentenceDetails&key=val#sentenceExpiryDateFieldset'
    )
  })
})

describe('backLinkUrl', () => {
  it('uses the fromPage param if supplied', () => {
    const url = backLinkUrl('request-received', {
      fromPage: 'check-answers',
      currentPage: 'check-answers',
      basePath: '/person/123/recalls/456/',
    })
    expect(url).toEqual('/person/123/recalls/456/check-answers')
  })

  it('uses fromPage over a path leading with /', () => {
    const url = backLinkUrl('/find-person?nomsNumber=A1234AA', {
      fromPage: 'check-answers',
      currentPage: 'check-answers',
      basePath: '/person/123/recalls/456/',
    })
    expect(url).toEqual('/person/123/recalls/456/check-answers')
  })

  it('uses the fromHash param if supplied', () => {
    const url = backLinkUrl('request-received', {
      fromPage: 'check-answers',
      fromHash: 'sentenceDetails',
      currentPage: 'check-answers',
      basePath: '/person/123/recalls/456/',
    })
    expect(url).toEqual('/person/123/recalls/456/check-answers#sentenceDetails')
  })

  it('uses the path parameter if fromPage param not supplied', () => {
    const url = backLinkUrl('request-received', { basePath: '/person/123/recalls/456/', currentPage: 'check-answers' })
    expect(url).toEqual('/person/123/recalls/456/request-received')
  })

  it("doesn't use the basePath if the path has a leading /", () => {
    const url = backLinkUrl('/', { basePath: '', fromPage: '/', currentPage: 'view-recall' })
    expect(url).toEqual('/')
  })

  it('uses the fromHash param if the path has a leading /', () => {
    const url = backLinkUrl('/', {
      fromPage: '/',
      fromHash: 'completed',
      currentPage: 'view-recall',
      basePath: '',
    })
    expect(url).toEqual('/#completed')
  })
})

describe('removeUndefinedFromObject', () => {
  it('removes properties with undefined values', () => {
    const result = removeUndefinedFromObject({
      multiple: undefined,
      classNames: null,
    })
    expect(result).toEqual({ classNames: null })
  })
})

describe('recallStatusTagProperties', () => {
  it('returns the correct properties for a given status', () => {
    expect(recallStatusTagProperties(RecallResponse.status.DOSSIER_ISSUED)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Dossier complete',
      classes: `govuk-tag--green`,
    })
    expect(recallStatusTagProperties(RecallResponse.status.RECALL_NOTIFICATION_ISSUED)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Assessment complete',
      classes: `govuk-tag--orange`,
    })
    expect(recallStatusTagProperties(RecallResponse.status.DOSSIER_IN_PROGRESS)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Dossier in progress',
      classes: `govuk-tag--orange`,
    })
    expect(recallStatusTagProperties(RecallResponse.status.BEING_BOOKED_ON)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Booking in progress',
      classes: `govuk-tag--orange`,
    })
    expect(recallStatusTagProperties(RecallResponse.status.BOOKED_ON)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Booking complete',
      classes: `govuk-tag--orange`,
    })
    expect(recallStatusTagProperties(RecallResponse.status.IN_ASSESSMENT)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Assessment in progress',
      classes: `govuk-tag--orange`,
    })
    expect(recallStatusTagProperties(RecallResponse.status.STOPPED)).toEqual({
      attributes: {
        'data-qa': 'recallStatus',
      },
      text: 'Stopped',
      classes: `govuk-tag--red`,
    })
  })
})
