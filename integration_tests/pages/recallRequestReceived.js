const page = require('./page')

const recallRequestReceivedPage = (params = {}) =>
  page('When did you receive the recall request?', {
    url: params.recallId ? `/recalls/${params.recallId}/request-received` : null,
  })
module.exports = { verifyOnPage: recallRequestReceivedPage }
