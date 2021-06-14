export default function manageRecallsApi(wiremock) {
  return {
    stubOffenderSearch: () => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/search',
        },
        response: {
          status: 200,
          headers: {
            'Content-Type': 'application/json;charset=UTF-8',
          },
          jsonBody: [
            {
              firstName: 'Bobby',
              lastName: 'Badger',
              nomisNumber: '123ABC',
              dateOfBirth: '1999-05-28',
            },
          ],
        },
      })
    },
  }
}
