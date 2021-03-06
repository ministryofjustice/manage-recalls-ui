// @ts-nocheck

export function pactGetRequest(description: string, requestPath: string, token?: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'GET',
      path: requestPath,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
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

export function pactPostRequest(description: string, path: string, body: unknown, token: string) {
  return pactRequestWithBody(description, 'POST', path, body, token)
}

export function pactPatchRequest(description: string, path: string, body: unknown, token: string) {
  return pactRequestWithBody(description, 'PATCH', path, body, token)
}

export function pactDeleteRequest(description: string, path: string, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'DELETE',
      path,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    },
  }
}

function pactRequestWithBody(description: string, method: string, path: string, body: unknown, token: string) {
  return {
    uponReceiving: description,
    withRequest: {
      method,
      path,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body,
    },
  }
}

export function pactGetRequestWithQuery({
  description,
  path,
  query,
  token,
}: {
  description: string
  path: string
  query: string
  token: string
}) {
  return {
    uponReceiving: description,
    withRequest: {
      method: 'GET',
      path,
      headers: { Authorization: `Bearer ${token}` },
      query,
    },
  }
}
