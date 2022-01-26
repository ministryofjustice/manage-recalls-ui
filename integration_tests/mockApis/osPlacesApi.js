export default function osPlacesApi(wiremock) {
  return {
    stubPing: () => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: '/health/ping',
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: { status: 'UP' },
        },
      })
    },
    osPlacesPostcodeLookup: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: '/search/places/v1/postcode(.*)',
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: expectation.expectedResult,
        },
      })
    },
    osPlacesUprnLookup: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: '/search/places/v1/uprn(.*)',
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: expectation.expectedResult,
        },
      })
    },
  }
}
