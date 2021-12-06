const page = require('./page')

const userDetailsPage = ({ detailsAdded }) =>
  page(detailsAdded ? 'User details' : 'Enter your user details', {
    url: '/user-details',
  })

module.exports = { verifyOnPage: userDetailsPage }
