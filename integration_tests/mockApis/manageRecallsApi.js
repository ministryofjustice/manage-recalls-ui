export default function manageRecallsApi(wiremock) {
  return {
    expectSearchResults: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/search',
          bodyPatterns: [
            {
              equalToJson: {
                nomsNumber: expectation.expectedSearchTerm,
              },
            },
          ],
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: expectation.expectedSearchResults,
        },
      })
    },
    expectGenerateRevocationOrder: expectedPdfFile => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/generate-revocation-order',
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: expectedPdfFile,
        },
      })
    },
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
  }
}
