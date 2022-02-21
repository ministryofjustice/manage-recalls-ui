import { UrlInfo } from '../@types'
import { RecallResponse } from '../@types/manage-recalls-api'

export const backLinkUrl = (path: string, { fromPage, fromHash, basePath }: UrlInfo) => {
  if (fromPage) {
    return `${basePath}${fromPage}${fromHash ? `#${fromHash}` : ''}`
  }
  if (path.startsWith('/')) {
    return `${path}${fromHash ? `#${fromHash}` : ''}`
  }
  return `${basePath}${path}`
}

export const backLinkUrlAssessDownload = ({
  inCustodyAtBooking,
  inCustodyAtAssessment,
  urlInfo,
}: {
  inCustodyAtBooking: boolean
  inCustodyAtAssessment: boolean
  urlInfo: UrlInfo
}) => {
  if (inCustodyAtBooking === true) {
    return backLinkUrl('assess-licence', urlInfo)
  }
  if (inCustodyAtBooking === false && inCustodyAtAssessment === false) {
    return backLinkUrl('assess-custody-status', urlInfo)
  }
  if (inCustodyAtBooking === false && inCustodyAtAssessment === true) {
    return backLinkUrl('assess-prison', urlInfo)
  }
}

export const backLinkUrlRecallReceived = ({
  inCustodyAtBooking,
  lastKnownAddressOption,
  urlInfo,
}: {
  inCustodyAtBooking: boolean
  lastKnownAddressOption?: RecallResponse.lastKnownAddressOption
  urlInfo: UrlInfo
}) => {
  if (inCustodyAtBooking === true) {
    return backLinkUrl('custody-status', urlInfo)
  }
  if (lastKnownAddressOption === 'YES') {
    return backLinkUrl('address-list', urlInfo)
  }
  return backLinkUrl('last-known-address', urlInfo)
}

export const changeLinkUrl = (
  pageSlug: string,
  { currentPage, basePath }: UrlInfo,
  fromHash: string,
  toHash?: string,
  queryString?: string
) => {
  const queryParam = currentPage
    ? `?fromPage=${currentPage}&fromHash=${fromHash}${queryString ? `&${queryString}` : ''}`
    : ''
  return `${basePath}${pageSlug}${queryParam}${toHash ? `#${toHash}` : ''}`
}
