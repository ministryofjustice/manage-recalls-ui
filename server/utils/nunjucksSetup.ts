import nunjucks from 'nunjucks'
import nunjucksDate from 'nunjucks-date'
import express from 'express'
import * as pathModule from 'path'
import {
  personOrPeopleFilter,
  userNameFilter,
  dateTimeItems,
  selectItems,
  checkboxItems,
  filterSelectedItems,
} from './nunjucksFunctions'
import { isDefined } from '../routes/handlers/helpers'
import { formatDateTimeFromIsoString } from '../routes/handlers/helpers/dates'

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
  njkEnv.addFilter('dateTime', formatDateTimeFromIsoString)

  njkEnv.addGlobal('dateTimeItems', dateTimeItems)
  njkEnv.addGlobal('selectItems', selectItems)
  njkEnv.addGlobal('checkboxItems', checkboxItems)
  njkEnv.addGlobal('filterSelectedItems', filterSelectedItems)
  njkEnv.addGlobal('isDefined', isDefined)

  nunjucksDate.setDefaultFormat('DD MMM YYYY')
  nunjucksDate.install(njkEnv)
}
