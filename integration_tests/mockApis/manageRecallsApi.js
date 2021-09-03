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
    expectGetRevocationOrder: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: '/recalls/(.*)/revocationOrder',
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: {
            content: expectation.expectedPdfFile,
          },
        },
      })
    },
    expectCreateRecall: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/recalls',
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
    expectUpdateRecall: recallId => {
      return wiremock.stubFor({
        request: {
          method: 'PATCH',
          urlPattern: `/recalls/([^/]+)$`,
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: { recallId },
        },
      })
    },
    expectListRecalls: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: '/recalls',
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
    expectGetRecall: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: `/recalls/([^/]+)$`,
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: expectation.expectedResult,
        },
      })
    },
    expectAddRecallDocument: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: `/recalls/(.*)/documents`,
        },
        response: {
          status: expectation.statusCode || 201,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: { documentId: '123' },
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
