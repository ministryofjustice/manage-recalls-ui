import config from '../config'
import RestClient from '../data/restClient'
import { Address } from '../@types'
import { OsPlacesApiAddress, OsPlacesLookupResponse } from '../@types/os-places-api'

interface DecoratedAddress extends Address {
  uprn: string
  address: string
}
const transformAddress = (address: OsPlacesApiAddress): DecoratedAddress => {
  const {
    UPRN,
    ADDRESS,
    ORGANISATION_NAME,
    SUB_BUILDING_NAME,
    BUILDING_NAME,
    BUILDING_NUMBER,
    THOROUGHFARE_NAME,
    POST_TOWN,
    POSTCODE,
  } = address
  return {
    uprn: UPRN,
    address: ADDRESS,
    line1: [ORGANISATION_NAME, SUB_BUILDING_NAME, BUILDING_NAME, BUILDING_NUMBER, THOROUGHFARE_NAME]
      .filter(Boolean)
      .join(', '),
    town: POST_TOWN,
    postcode: POSTCODE,
  }
}

export const getAddressesByPostcode = async (postcode: string): Promise<DecoratedAddress[]> => {
  const restClient = new RestClient('OS Places API', config.apis.osPlacesApi)
  const response = await restClient.get<OsPlacesLookupResponse>({
    path: '/postcode',
    query: { postcode, key: config.apis.osPlacesApi.apiClientKey },
  })
  if (response.header && response.header.totalresults === 0) {
    return []
  }
  return response.results.map(r => transformAddress(r.DPA))
}

export const getAddressByUprn = async (uprn: string): Promise<Address> => {
  const restClient = new RestClient('OS Places API', config.apis.osPlacesApi)
  const response = await restClient.get<OsPlacesLookupResponse>({
    path: '/uprn',
    query: { uprn, key: config.apis.osPlacesApi.apiClientKey },
  })
  return transformAddress(response.results[0].DPA)
}
