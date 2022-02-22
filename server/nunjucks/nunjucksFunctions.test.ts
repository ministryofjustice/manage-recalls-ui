import {
  allowedDocumentFileExtensionList,
  allowedEmailFileExtensionList,
  checkboxItems,
  dateTimeItems,
  filterSelectedItems,
  formatNsyWarrantEmailLink,
  personOrPeopleFilter,
  recallInfoActionMenuItems,
  removeUndefinedFromObject,
  selectItems,
  userNameFilter,
} from './nunjucksFunctions'
import { getReferenceDataItemLabel, reasonForRecall } from '../referenceData'
import { RecallResponse } from '../@types/manage-recalls-api/models/RecallResponse'
import status = RecallResponse.status

jest.mock('../referenceData')

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

describe('removeUndefinedFromObject', () => {
  it('removes properties with undefined values', () => {
    const result = removeUndefinedFromObject({
      multiple: undefined,
      classNames: null,
    })
    expect(result).toEqual({ classNames: null })
  })
})

describe('recallInfoActionMenuItems', () => {
  it('adds a "Rescind recall" link if there are no rescind records', () => {
    const actionItems = recallInfoActionMenuItems(
      {
        status: RecallResponse.status.BOOKED_ON,
        rescindRecords: [],
      } as RecallResponse,
      { basePath: '/recalls/', currentPage: 'recall-info' },
      'view-recall'
    )
    expect(actionItems).toEqual([
      {
        href: '/recalls/change-history?fromPage=view-recall',
        text: 'View change history',
      },
      {
        href: '/recalls/rescind-request?fromPage=view-recall',
        text: 'Rescind recall',
      },
      {
        href: '/recalls/stop-recall?fromPage=view-recall',
        text: 'Stop recall',
      },
    ])
  })

  it('does not add a rescind link if the last rescind was approved', () => {
    const actionItems = recallInfoActionMenuItems(
      {
        status: RecallResponse.status.BOOKED_ON,
        rescindRecords: [
          {
            approved: true,
          },
        ],
      } as RecallResponse,
      { basePath: '/recalls/', currentPage: 'recall-info' },
      'view-recall'
    )
    expect(actionItems).toEqual([
      {
        href: '/recalls/change-history?fromPage=view-recall',
        text: 'View change history',
      },
      {
        href: '/recalls/stop-recall?fromPage=view-recall',
        text: 'Stop recall',
      },
    ])
  })

  it('adds a "Rescind recall" link if the last rescind was not approved', () => {
    const actionItems = recallInfoActionMenuItems(
      {
        status: RecallResponse.status.ASSESSED_NOT_IN_CUSTODY,
        rescindRecords: [
          {
            approved: false,
          },
        ],
      } as RecallResponse,
      { basePath: '/recalls/', currentPage: 'recall-info' },
      'view-recall'
    )
    expect(actionItems).toEqual([
      {
        href: '/recalls/change-history?fromPage=view-recall',
        text: 'View change history',
      },
      {
        href: '/recalls/rescind-request?fromPage=view-recall',
        text: 'Rescind recall',
      },
      {
        href: '/recalls/stop-recall?fromPage=view-recall',
        text: 'Stop recall',
      },
    ])
  })

  it('adds a "Update rescind" link if the last rescind is in progress', () => {
    const actionItems = recallInfoActionMenuItems(
      {
        status: RecallResponse.status.AWAITING_DOSSIER_CREATION,
        rescindRecords: [
          {
            requestDetails: 'requested',
          },
        ],
      } as RecallResponse,
      { basePath: '/recalls/', currentPage: 'recall-info' },
      'view-recall'
    )
    expect(actionItems).toEqual([
      {
        href: '/recalls/change-history?fromPage=view-recall',
        text: 'View change history',
      },
      {
        href: '/recalls/rescind-decision?fromPage=view-recall',
        text: 'Update rescind',
      },
      {
        href: '/recalls/stop-recall?fromPage=view-recall',
        text: 'Stop recall',
      },
    ])
  })

  it('does not add a "Stop recall" link if recall status is stopped', () => {
    const actionItems = recallInfoActionMenuItems(
      {
        status: status.STOPPED,
      } as RecallResponse,
      { basePath: '/recalls/', currentPage: 'recall-info' },
      'view-recall'
    )
    expect(actionItems).toEqual([
      {
        href: '/recalls/change-history?fromPage=view-recall',
        text: 'View change history',
      },
      {
        href: '/recalls/rescind-request?fromPage=view-recall',
        text: 'Rescind recall',
      },
    ])
  })
})

describe('formatNsyWarrantEmailLink', () => {
  it('returns a formatted link', () => {
    const recall = {
      firstName: 'Dave',
      lastName: 'Smith',
      dateOfBirth: '1999-05-28',
      croNumber: '345345',
      bookingNumber: 'A123456',
      returnedToCustodyDateTime: '2022-01-22T13:45:33.000Z',
      currentPrison: 'KTI',
    } as RecallResponse
    ;(getReferenceDataItemLabel as jest.Mock).mockReturnValue('Kennet (HMP)')
    const link = formatNsyWarrantEmailLink(recall)
    expect(link).toEqual(
      'mailto:[nsy_pnc_email]?subject=RTC%20-%20Dave%20Smith%20-%20A123456&body=Please%20note%20that%20Dave%20Smith%20-%2028%20May%201999%2C%20345345%2C%20A123456%20-%20was%20returned%20to%20Kennet%20(HMP)%20on%2022%20January%202022%20at%2013%3A45.%20Please%20remove%20them%20from%20the%20PNC%20if%20this%20has%20not%20already%20been%20done.'
    )
  })
})
