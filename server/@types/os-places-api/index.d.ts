export interface OsPlacesApiAddress {
  UPRN: string
  UDPRN: string
  ADDRESS: string
  ORGANISATION_NAME?: string
  BUILDING_NUMBER?: string
  BUILDING_NAME?: string
  THOROUGHFARE_NAME: string
  POST_TOWN: string
  POSTCODE: string
  RPC: string
  X_COORDINATE: number
  Y_COORDINATE: number
  STATUS: 'APPROVED'
  LOGICAL_STATUS_CODE: string
  CLASSIFICATION_CODE: string
  CLASSIFICATION_CODE_DESCRIPTION: string
  LOCAL_CUSTODIAN_CODE: number
  LOCAL_CUSTODIAN_CODE_DESCRIPTION: string
  COUNTRY_CODE: 'E'
  COUNTRY_CODE_DESCRIPTION: string
  POSTAL_ADDRESS_CODE: string
  POSTAL_ADDRESS_CODE_DESCRIPTION: string
  BLPU_STATE_CODE: string
  BLPU_STATE_CODE_DESCRIPTION: string
  TOPOGRAPHY_LAYER_TOID: string
  LAST_UPDATE_DATE: string
  ENTRY_DATE: string
  BLPU_STATE_DATE: string
  LANGUAGE: 'EN'
  MATCH: number
  MATCH_DESCRIPTION: 'EXACT'
  DELIVERY_POINT_SUFFIX: string
}

export interface OsPlacesLookupItem {
  DPA: OsPlacesApiAddress
}

export interface OsPlacesLookupResponse {
  results: OsPlacesLookupItem[]
}
