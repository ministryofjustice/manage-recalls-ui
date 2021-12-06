const page = require('./page')

const userDetailsPage = () =>
  page('User details', {
    url: '/user-details',
  })

module.exports = { verifyOnPage: userDetailsPage }
