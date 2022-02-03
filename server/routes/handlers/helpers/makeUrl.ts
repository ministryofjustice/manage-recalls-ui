import { UrlInfo } from '../../../@types'

// used to make URLs that don't lead back to a 'fromPage' like recall information
export const makeUrl = (routeSuffix: string, { fromPage, fromHash, basePath }: UrlInfo, csrfToken?: string) => {
  const fromPageQueryParam = fromPage ? `fromPage=${fromPage}` : undefined
  const fromHashQueryParam = fromHash ? `fromHash=${fromHash}` : undefined
  const csrfQueryParam = csrfToken ? `_csrf=${csrfToken}` : undefined
  const queryParams = [fromPageQueryParam, fromHashQueryParam, csrfQueryParam].filter(Boolean).join('&')
  const includeQuery = queryParams && routeSuffix !== fromPage
  return `${basePath}${routeSuffix}${includeQuery ? `?${queryParams}` : ''}`
}

// make URLs that lead back to a 'fromPage'
export const makeUrlToFromPage = (routeSuffix: string, { fromHash, basePath }: UrlInfo) => {
  return `${basePath}${routeSuffix}${fromHash ? `#${fromHash}` : ''}`
}
