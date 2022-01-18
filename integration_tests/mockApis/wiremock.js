import superagent from 'superagent'

export default function wiremock(wiremockUrl) {
  const wiremockAdminUrl = `${wiremockUrl}/__admin`
  const stubFor = mapping => superagent.post(`${wiremockAdminUrl}/mappings`).send(mapping)
  const getRequests = () => superagent.get(`${wiremockAdminUrl}/requests`)
  const findApiRequests = ({ url, method }) => {
    return new Promise(resolve => {
      superagent.get(`${wiremockAdminUrl}/requests`, (err, res) => {
        const parsed = JSON.parse(res.text)
        const reqs = parsed.requests.filter(entry => entry.request.url === url && entry.request.method === method)
        resolve(reqs || null)
      })
    })
  }
  const resetStubs = () =>
    Promise.all([superagent.delete(`${wiremockAdminUrl}/mappings`), superagent.delete(`${wiremockAdminUrl}/requests`)])
  return {
    stubFor,
    getRequests,
    findApiRequests,
    resetStubs,
  }
}
