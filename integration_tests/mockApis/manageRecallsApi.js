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
    expectGetRecallNotification: expectation =>
      expectGetPdfDocument(wiremock, '/recalls/(.*)/recallNotification', expectation),
    expectGetDossier: expectation => expectGetPdfDocument(wiremock, '/recalls/(.*)/dossier', expectation),
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
    expectSearchRecalls: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: `/recalls/search`,
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
          jsonBody: expectation.expectedResults,
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
          status: (expectation && expectation.statusCode) || 201,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: (expectation && expectation.responseBody) || { documentId: '123' },
        },
      })
    },
    expectDeleteRecallDocument: () => {
      return wiremock.stubFor({
        request: {
          method: 'DELETE',
          urlPattern: `/recalls/(.*)/documents/(.*)`,
        },
        response: {
          status: 204,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
        },
      })
    },
    expectAddMissingDocumentsRecord: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/missing-documents-records',
        },
        response: {
          status: expectation.statusCode || 201,
        },
      })
    },
    expectGetRecallDocument: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: `/recalls/(.*)/documents/(.*)`,
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: {
            content: expectation.file,
            category: expectation.category,
            fileName: expectation.fileName,
            documentId: expectation.documentId,
          },
        },
      })
    },
    expectSetDocumentCategory: () => {
      return wiremock.stubFor({
        request: {
          method: 'PATCH',
          urlPattern: `/recalls/([^/]+)/documents/(.*)$`,
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: { documentId: '123' },
        },
      })
    },
    expectGetUserDetails: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: `/users/([0-9\\-]+)`,
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: {
            firstName: expectation.firstName,
            lastName: expectation.lastName,
          },
        },
      })
    },
    expectGetCurrentUserDetails: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: '/users/current',
        },
        response: {
          status: (expectation && expectation.status) || 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: (expectation && expectation.expectedResult) || {},
        },
      })
    },
    expectAddUserDetails: () => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/users',
        },
        response: {
          status: 201,
        },
      })
    },
    expectRefData: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: `/reference-data/${expectation.refDataPath}`,
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
    expectAssignUserToRecall: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: `/recalls/(.*)/assignee/(.*)`,
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
    expectUnassignAssessment: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'DELETE',
          urlPattern: `/recalls/(.*)/assignee/(.*)`,
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

function expectGetPdfDocument(wiremock, path, expectation) {
  return wiremock.stubFor({
    request: {
      method: 'GET',
      urlPattern: path,
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
}
