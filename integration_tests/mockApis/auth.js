import jwt from 'jsonwebtoken'
import tokenVerificationApi from './tokenVerification'

export default function auth(wiremock, uiClientId, manageRecallsUiUrl) {
  const tokenVerification = tokenVerificationApi(wiremock)
  return {
    getLoginUrl: () => getLoginUrl(wiremock),
    stubPing: () => Promise.all([ping(wiremock), tokenVerification.stubPing()]),
    stubLogin: () =>
      Promise.all([
        favicon(wiremock),
        redirect(wiremock, uiClientId, manageRecallsUiUrl),
        logout(wiremock),
        token(wiremock, manageRecallsUiUrl),
        tokenVerification.stubVerifyToken(),
      ]),
    stubUser: () => Promise.all([stubUser(wiremock), stubUserRoles(wiremock)]),
  }
}

const createToken = () => {
  const payload = {
    user_name: 'USER1',
    scope: ['read'],
    auth_source: 'nomis',
    authorities: [],
    jti: '83b50a10-cca6-41db-985f-e87efb303ddb',
    client_id: 'clientid',
  }

  return jwt.sign(payload, 'secret', { expiresIn: '1h' })
}

const getLoginUrl = wiremock =>
  wiremock.getRequests().then(data => {
    try {
      const { requests } = data.body
      const stateParam = requests[0].request.queryParams.state
      const stateValue = stateParam ? stateParam.values[0] : requests[1].request.queryParams.state.values[0]
      return `/login/callback?code=codexxxx&state=${stateValue}`
    } catch (e) {
      cy.log('Error thrown in getLoginUrl', e)
      return null
    }
  })

const favicon = wiremock =>
  wiremock.stubFor({
    request: {
      method: 'GET',
      urlPattern: '/favicon.ico',
    },
    response: {
      status: 200,
    },
  })

const ping = wiremock =>
  wiremock.stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/health/ping',
    },
    response: {
      status: 200,
    },
  })

const redirect = (wiremock, uiClientId, manageRecallsUiUrl) =>
  wiremock.stubFor({
    request: {
      method: 'GET',
      urlPattern: `/auth/oauth/authorize\\?response_type=code&redirect_uri=.+?&state=.+?&client_id=${uiClientId}`,
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        Location: `${manageRecallsUiUrl}/login/callback?code=codexxxx&state=stateyyyy`,
      },
      body: '<html><body>Login page<h1>Sign in</h1></body></html>',
    },
  })

const logout = wiremock =>
  wiremock.stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/logout.*',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
      },
      body: '<html><body>Login page<h1>Sign in</h1></body></html>',
    },
  })

const token = (wiremock, manageRecallsUiUrl) =>
  wiremock.stubFor({
    request: {
      method: 'POST',
      urlPattern: '/auth/oauth/token',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        Location: `${manageRecallsUiUrl}/login/callback?code=codexxxx&state=stateyyyy`,
      },
      jsonBody: {
        access_token: createToken(),
        token_type: 'bearer',
        user_name: 'USER1',
        expires_in: 599,
        scope: 'read',
        internalUser: true,
      },
    },
  })

const stubUser = wiremock =>
  wiremock.stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/api/user/me',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: {
        staffId: 231232,
        username: 'USER1',
        active: true,
        name: 'john smith',
        uuid: '1223',
      },
    },
  })

const stubUserRoles = wiremock =>
  wiremock.stubFor({
    request: {
      method: 'GET',
      urlPattern: '/auth/api/user/me/roles',
    },
    response: {
      status: 200,
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
      },
      jsonBody: [{ roleId: 'SOME_USER_ROLE' }],
    },
  })
