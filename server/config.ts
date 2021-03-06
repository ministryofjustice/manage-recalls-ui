import 'dotenv/config'

const production = process.env.NODE_ENV === 'production'

function get<T>(name: string, fallback: T, options = { requireInProduction: false }): T | string {
  if (process.env[name]) {
    return process.env[name]
  }
  if (fallback !== undefined && (!production || !options.requireInProduction)) {
    return fallback
  }
  throw new Error(`Missing env var ${name}`)
}

const requiredInProduction = { requireInProduction: true }

export class AgentConfig {
  maxSockets: 100

  maxFreeSockets: 10

  freeSocketTimeout: 30000
}

export interface ApiConfig {
  url: string
  timeout: {
    response: number
    deadline: number
  }
  agent: AgentConfig
}

const config = {
  https: production,
  applicationName: 'Manage a recall',
  staticResourceCacheDuration: 20,
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10) || 6379,
    password: process.env.REDIS_AUTH_TOKEN,
    tls_enabled: get('REDIS_TLS_ENABLED', 'false'),
  },
  session: {
    secret: get('SESSION_SECRET', 'app-insecure-default-session', requiredInProduction),
    expiryMinutes: Number(get('WEB_SESSION_TIMEOUT_IN_MINUTES', 120)),
  },
  apis: {
    hmppsAuth: {
      url: get('HMPPS_AUTH_URL', 'http://localhost:9090/auth', requiredInProduction),
      externalUrl: get('HMPPS_AUTH_EXTERNAL_URL', get('HMPPS_AUTH_URL', 'http://localhost:9090/auth')),
      timeout: {
        response: Number(get('HMPPS_AUTH_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('HMPPS_AUTH_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
      apiClientId: get('API_CLIENT_ID', 'ppud-ui-client', requiredInProduction),
      apiClientSecret: get('API_CLIENT_SECRET', 'clientsecret', requiredInProduction),
      systemClientId: get('SYSTEM_CLIENT_ID', 'clientid', requiredInProduction),
      systemClientSecret: get('SYSTEM_CLIENT_SECRET', 'clientsecret', requiredInProduction),
    },
    manageRecallsApi: {
      url: get('MANAGE_RECALLS_API_URL', 'http://localhost:9091', requiredInProduction),
      timeout: {
        response: Number(get('MANAGE_RECALLS_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('MANAGE_RECALLS_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
    },
    tokenVerification: {
      url: get('TOKEN_VERIFICATION_API_URL', 'http://localhost:9090', requiredInProduction),
      timeout: {
        response: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_RESPONSE', 5000)),
        deadline: Number(get('TOKEN_VERIFICATION_API_TIMEOUT_DEADLINE', 5000)),
      },
      agent: new AgentConfig(),
      enabled: get('TOKEN_VERIFICATION_ENABLED', 'false') === 'true',
    },
    osPlacesApi: {
      url: get('OS_PLACES_API_URL', 'https://api.os.uk/search/places/v1'),
      apiClientKey: get('OS_PLACES_API_KEY', requiredInProduction),
      timeout: {
        response: Number(get('OS_PLACES_API_TIMEOUT_RESPONSE', 10000)),
        deadline: Number(get('OS_PLACES_API_TIMEOUT_DEADLINE', 10000)),
      },
      agent: new AgentConfig(),
    },
  },
  domain: get('INGRESS_URL', 'http://localhost:3000', requiredInProduction),
  sensitiveInfo: {
    newScotlandYardPncEmail: get('NSY_PNC_EMAIL', 'test@domain.com'),
  },
  personCache: {
    ttl: Number(get('PERSON_CACHE_TTL', 60 * 60 * 4)),
  },
}
export default config

export const manageRecallsApiConfig = (): ApiConfig => config.apis.manageRecallsApi
