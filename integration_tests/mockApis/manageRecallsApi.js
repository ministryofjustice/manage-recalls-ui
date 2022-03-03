export default function manageRecallsApi(wiremock) {
  return {
    expectPrisonerResult: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: '/prisoner/(.*)',
        },
        response: {
          status: (expectation && expectation.status) || 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: expectation.expectedPrisonerResult,
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
    expectUpdateRecall: ({ recallId, status }) => {
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
          jsonBody: { recallId, status },
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
    expectUploadRecallDocument: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: `/recalls/(.*)/documents/uploaded`,
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
    expectGenerateRecallDocument: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: `/recalls/(.*)/documents/generated`,
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
    expectAddNote: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/recalls/(.*)/notes',
        },
        response: {
          status: (expectation && expectation.statusCode) || 201,
        },
      })
    },
    expectAddRescindRequestRecord: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/recalls/(.*)/rescind-records',
        },
        response: {
          status: (expectation && expectation.statusCode) || 201,
        },
      })
    },
    expectUpdateRescindRequestRecord: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'PATCH',
          urlPattern: '/recalls/(.*)/rescind-records/(.*)',
        },
        response: {
          status: (expectation && expectation.statusCode) || 200,
        },
      })
    },
    expectStopRecall: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/recalls/(.*)/stop',
        },
        response: {
          status: (expectation && expectation.statusCode) || 200,
        },
      })
    },
    expectAddReturnToCustodyDates: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/recalls/(.*)/returned-to-custody',
        },
        response: {
          status: (expectation && expectation.statusCode) || 200,
        },
      })
    },
    expectAddLastKnownAddress: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/last-known-addresses',
        },
        response: {
          status: (expectation && expectation.statusCode) || 201,
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
    expectGetRecallDocumentHistory: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: `/recalls/(.*)/documents\\?category=(.*)`,
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
    expectGetSingleFieldChangeHistory: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: `/audit/(.*)/(.*)`,
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
    expectGetAllFieldsChangeHistory: expectation => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: `/audit/(.*)`,
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
    expectSetRecommendedRecallType: () => {
      return wiremock.stubFor({
        request: {
          method: 'PATCH',
          urlPattern: `/recalls/([^/]+)/recommended-recall-type$`,
        },
        response: {
          status: 200,
        },
      })
    },
    expectSetConfirmedRecallType: () => {
      return wiremock.stubFor({
        request: {
          method: 'PATCH',
          urlPattern: `/recalls/([^/]+)/confirmed-recall-type$`,
        },
        response: {
          status: 200,
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
          jsonBody: expectation ? expectation.expectedResult : {},
        },
      })
    },
    stubPing: () => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: '/health',
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
