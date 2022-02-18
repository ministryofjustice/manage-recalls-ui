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
  recallInfoActionMenuItems,
} from './nunjucksFunctions'
import { formatDateTimeFromIsoString, dueDateLabel } from '../controllers/utils/dates/format'
import { isoDateToMillis } from '../controllers/utils/dates/convert'
import { getReferenceDataItemLabel } from '../referenceData'
import { formatDocLabel } from '../controllers/documents/upload/helpers'
import { generatedDocCategoriesList, getGeneratedDocFileName } from '../controllers/documents/download/helpers'
import { makeUrl } from '../controllers/utils/makeUrl'
import {
  isStatusAfterAssessStart,
  isInCustody,
  isStatusAfterAssessComplete,
  recallStatusTagProperties,
} from '../controllers/utils/recallStatus'
import { listDocumentLabels, objectToArray, sortList } from '../controllers/utils/lists'
import { isDefined } from '../utils/utils'

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
  njkEnv.addGlobal('recallInfoActionMenuItems', recallInfoActionMenuItems)

  nunjucksDate.setDefaultFormat('d MMM YYYY')
  nunjucksDate.install(njkEnv)
}