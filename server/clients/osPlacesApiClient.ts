import config from '../config'
import RestClient from '../data/restClient'
import { Address } from '../@types/manage-recalls-api/models/Address'
import { OsPlacesLookupResponse } from '../@types/os-places-api'

const transformAddresses = (addresses: OsPlacesLookupResponse): Address[] => {
  return addresses.results.map(r => {
    const { ORGANISATION_NAME, BUILDING_NAME, BUILDING_NUMBER, THOROUGHFARE_NAME, POST_TOWN, POSTCODE } = r.DPA
    return {
      line1: [ORGANISATION_NAME, BUILDING_NAME, BUILDING_NUMBER, THOROUGHFARE_NAME].filter(Boolean).join(', '),
      town: POST_TOWN,
      postcode: POSTCODE,
    }
  })
}

export const getAddressesByPostcode = async (postcode: string): Promise<Address[]> => {
  const restClient = new RestClient('OS Places API', config.apis.osPlacesApi)
  const addresses = await restClient.get<OsPlacesLookupResponse>({
    path: '/postcode',
    query: { postcode, key: config.apis.osPlacesApi.apiClientKey },
  })
  return transformAddresses(addresses)
}
