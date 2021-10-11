export default function prisonRegisterApi(wiremock) {
  return {
    expectPrisonList: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: '/prisons',
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: expectation.expectedResults,
        },
      })
    },
  }
}
