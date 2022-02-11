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
  filterActiveItems,
  allowedEmailFileExtensionList,
  allowedDocumentFileExtensionList,
  allowedImageFileExtensionList,
  backLinkUrl,
  backLinkUrlRecallReceived,
  backLinkUrlAssessDownload,
  changeLinkUrl,
  errorMessage,
  removeUndefinedFromObject,
  allowedImageFileTypeLabelList,
  selectDocCategory,
} from './nunjucksFunctions'
import { isDefined, listDocumentLabels, objectToArray, sortList } from '../routes/handlers/helpers'
import { formatDateTimeFromIsoString, dueDateLabel } from '../routes/handlers/helpers/dates/format'
import { isoDateToMillis } from '../routes/handlers/helpers/dates/convert'
import { getReferenceDataItemLabel } from '../referenceData'
import { formatDocLabel } from '../routes/handlers/documents/upload/helpers'
import { generatedDocCategoriesList, getGeneratedDocFileName } from '../routes/handlers/documents/download/helpers'
import { makeUrl } from '../routes/handlers/helpers/makeUrl'
import {
  isStatusAfterAssessStart,
  isInCustody,
  isStatusAfterAssessComplete,
  recallStatusTagProperties,
} from '../routes/handlers/helpers/recallStatus'

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
  njkEnv.addFilter('dateOnly', val => formatDateTimeFromIsoString(val, true))
  njkEnv.addFilter('dateTime', formatDateTimeFromIsoString)
  njkEnv.addGlobal('dateTimeItems', dateTimeItems)
  njkEnv.addGlobal('isoDateToMillis', isoDateToMillis)
  njkEnv.addGlobal('selectItems', selectItems)
  njkEnv.addGlobal('checkboxItems', checkboxItems)
  njkEnv.addGlobal('filterSelectedItems', filterSelectedItems)
  njkEnv.addGlobal('isDefined', isDefined)
  njkEnv.addGlobal('allowedEmailFileExtensionList', allowedEmailFileExtensionList)
  njkEnv.addGlobal('allowedDocumentFileExtensionList', allowedDocumentFileExtensionList)
  njkEnv.addGlobal('allowedImageFileExtensionList', allowedImageFileExtensionList)
  njkEnv.addGlobal('allowedImageFileTypeLabelList', allowedImageFileTypeLabelList)
  njkEnv.addGlobal('backLinkUrl', backLinkUrl)
  njkEnv.addGlobal('backLinkUrlRecallReceived', backLinkUrlRecallReceived)
  njkEnv.addGlobal('backLinkUrlAssessDownload', backLinkUrlAssessDownload)
  njkEnv.addGlobal('makeUrl', makeUrl)
  njkEnv.addGlobal('changeLinkUrl', changeLinkUrl)
  njkEnv.addGlobal('errorMessage', errorMessage)
  njkEnv.addGlobal('getReferenceDataItemLabel', getReferenceDataItemLabel)
  njkEnv.addGlobal('filterActiveItems', filterActiveItems)
  njkEnv.addGlobal('removeUndefinedFromObject', removeUndefinedFromObject)
  njkEnv.addGlobal('listDocumentLabels', listDocumentLabels)
  njkEnv.addGlobal('dueDateLabel', dueDateLabel)
  njkEnv.addGlobal('recallStatusTagProperties', recallStatusTagProperties)
  njkEnv.addGlobal('formatDocLabel', formatDocLabel)
  njkEnv.addGlobal('getGeneratedDocFileName', getGeneratedDocFileName)
  njkEnv.addGlobal('generatedDocCategoriesList', generatedDocCategoriesList)
  njkEnv.addGlobal('sortList', sortList)
  njkEnv.addGlobal('selectDocCategory', selectDocCategory)
  njkEnv.addGlobal('objectToArray', objectToArray)
  njkEnv.addGlobal('isStatusAfterAssessStart', isStatusAfterAssessStart)
  njkEnv.addGlobal('isStatusAfterAssessComplete', isStatusAfterAssessComplete)
  njkEnv.addGlobal('isInCustody', isInCustody)

  nunjucksDate.setDefaultFormat('d MMM YYYY')
  nunjucksDate.install(njkEnv)
}
