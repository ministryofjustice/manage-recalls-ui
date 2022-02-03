import { makeUrl } from './makeUrl'

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

  it('does not use the fromPage query string if fromPage is the same as the page suffix', () => {
    const url = makeUrl('check-answers', {
      fromPage: 'check-answers',
      currentPage: 'check-answers',
      basePath: '/person/123/recalls/456/',
    })
    expect(url).toEqual('/person/123/recalls/456/check-answers')
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
