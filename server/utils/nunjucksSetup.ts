import nunjucks from 'nunjucks'
import nunjucksDate from 'nunjucks-date'
import express from 'express'
import * as pathModule from 'path'
import { personOrPeopleFilter, userNameFilter, dateFilter, dateTimeFilter } from './nunjucksFilters'

export default function nunjucksSetup(app: express.Application, path: pathModule.PlatformPath): void {
  const njkEnv = nunjucks.configure(
    [
      path.join(__dirname, '../../server/views'),
      'node_modules/govuk-frontend/',
      'node_modules/govuk-frontend/components/',
      'node_modules/@ministryofjustice/frontend/',
      'node_modules/@ministryofjustice/frontend/moj/components/',
    ],
    {
      autoescape: true,
      express: app,
    }
  )

  njkEnv.addFilter('personOrPeople', personOrPeopleFilter)
  njkEnv.addFilter('userName', userNameFilter)
  njkEnv.addFilter('dateGov', dateFilter)
  njkEnv.addFilter('dateTime', dateTimeFilter)
  nunjucksDate.setDefaultFormat('DD MMM YYYY')
  nunjucksDate.install(njkEnv)
}
