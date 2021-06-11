import superagent from 'superagent'

export default function wiremock(wiremockUrl) {
  const wiremockAdminUrl = `${wiremockUrl}/__admin`
  const stubFor = mapping => superagent.post(`${wiremockAdminUrl}/mappings`).send(mapping)
  const getRequests = () => superagent.get(`${wiremockAdminUrl}/requests`)
  const resetStubs = () =>
    Promise.all([superagent.delete(`${wiremockAdminUrl}/mappings`), superagent.delete(`${wiremockAdminUrl}/requests`)])

  return {
    stubFor,
    getRequests,
    resetStubs,
  }
}
