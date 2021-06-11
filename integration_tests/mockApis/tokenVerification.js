export default function auth(wiremock) {
  return {
    stubPing: () => {
      return wiremock.stubFor({
        request: {
          method: 'GET',
          urlPattern: '/verification/health/ping',
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: { status: 'UP' },
        },
      })
    },
    stubVerifyToken: () => {
      return wiremock.stubFor({
        request: {
          method: 'POST',
          urlPattern: '/verification/token/verify',
        },
        response: {
          status: 200,
          headers: { 'Content-Type': 'application/json;charset=UTF-8' },
          jsonBody: { active: 'true' },
        },
      })
    },
  }
}
