import superagent from 'superagent'

const wiremockUrl = 'http://localhost:9091'
const wiremockAdminUrl = `${wiremockUrl}/__admin`

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const stubFor = mapping => superagent.post(`${wiremockAdminUrl}/mappings`).send(mapping)
const getMappings = () => superagent.get(`${wiremockAdminUrl}/mappings`)

describe('manual stub', () => {
  xit('setup stub in wiremock', async () => {
    const responseBody = { anything: 'something' }
    await stubFor({
      request: {
        method: 'POST',
        urlPattern: '/test',
        bodyPatterns: [
          {
            matchesJsonPath: '$.[?(@.test =~ /((?!^(licence|conviction)$).)*/)]',
          },
        ],
      },
      response: {
        status: 200,
        headers: {
          'Content-Type': 'application/json;charset=UTF-8',
        },
        jsonBody: responseBody,
      },
    })
    const mappings = await getMappings()
    // eslint-disable-next-line no-console
    console.log(JSON.stringify(mappings))

    const output = await superagent.post(`${wiremockUrl}/test`).send({ test: 'licence' })
    expect(output.text).toEqual(JSON.stringify(responseBody))
  })
})
