import { makeErrorObject, listToString, renderErrorMessages, transformErrorMessages } from './index'

describe('makeErrorObject', () => {
  it('returns an error object', () => {
    const error = makeErrorObject({
      id: 'recallEmailReceivedDateTime',
      text: 'Date and time you received the recall email',
      values: { year: '2021', month: '10', day: '3', hour: '', minute: '' },
    })
    expect(error).toEqual({
      href: '#recallEmailReceivedDateTime',
      name: 'recallEmailReceivedDateTime',
      text: 'Date and time you received the recall email',
      values: {
        day: '3',
        hour: '',
        minute: '',
        month: '10',
        year: '2021',
      },
    })
  })
})

describe('renderErrorMessages', () => {
  it('returns error messages with placeholders filled with data', () => {
    const errors = [
      {
        href: '#additionalLicenceConditionsDetail',
        name: 'additionalLicenceConditionsDetail',
        text: 'Provide detail on additional licence conditions',
      },
      {
        text: 'Enter the NOMIS number {{ recall.fullName }} is being held under',
        href: '#differentNomsNumberDetail',
        name: 'differentNomsNumberDetail',
      },
    ]
    const result = renderErrorMessages(transformErrorMessages(errors), {
      recall: { fullName: 'Dave Angel' },
    })
    expect(result).toEqual({
      additionalLicenceConditionsDetail: {
        text: 'Provide detail on additional licence conditions',
      },
      differentNomsNumberDetail: {
        text: 'Enter the NOMIS number Dave Angel is being held under',
      },
      list: [
        {
          href: '#additionalLicenceConditionsDetail',
          name: 'additionalLicenceConditionsDetail',
          text: 'Provide detail on additional licence conditions',
        },
        {
          href: '#differentNomsNumberDetail',
          name: 'differentNomsNumberDetail',
          text: 'Enter the NOMIS number Dave Angel is being held under',
        },
      ],
    })
  })
})

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
