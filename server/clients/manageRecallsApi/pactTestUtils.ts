// @ts-nocheck

export function pactGetRequest(description: string, requestPath: string, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'GET',
      path: requestPath,
      headers: { Authorization: `Bearer ${token}` },
    },
  }
}

export function pactJsonResponse(responseBody, expectedStatus = 200) {
  return {
    status: expectedStatus,
    headers: { 'Content-Type': 'application/json' },
    body: responseBody,
  }
}
