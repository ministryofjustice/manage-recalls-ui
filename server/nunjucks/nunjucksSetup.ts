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
  allowedNoteFileExtensionList,
  errorMessage,
  removeUndefinedFromObject,
  allowedImageFileTypeLabelList,
  allowedNoteFileTypeLabelList,
  selectDocCategory,
  recallInfoActionMenuItems,
  formatNsyWarrantEmailLink,
  makePageTitle,
  linkTextWithPerson,
} from './nunjucksFunctions'
import { formatDateTimeFromIsoString, dueDateTimeLabel, dueDateShortLabel } from '../controllers/utils/dates/format'
import { isoDateToMillis } from '../controllers/utils/dates/convert'
import { getReferenceDataItemLabel } from '../referenceData'
import { formatDocLabel } from '../controllers/documents/upload/helpers'
import { makeUrl } from '../controllers/utils/makeUrl'
import {
  isStatusAfterAssessStart,
  isInCustody,
  isStatusAfterAssessComplete,
  recallStatusTagProperties,
} from '../controllers/utils/recallStatus'
import { listDocumentLabels, objectToArray, sortList } from '../controllers/utils/lists'
import { isDefined } from '../utils/utils'
import { backLinkUrl, backLinkUrlAssessDownload, backLinkUrlRecallType, changeLinkUrl } from './urls'
import { generatedDocCategoriesList, getGeneratedDocFileName } from '../controllers/documents/generated/helpers'

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
  njkEnv.addFilter('dateOnly', val => formatDateTimeFromIsoString({ isoDate: val, dateOnly: true }))
  njkEnv.addFilter('dateTime', val => formatDateTimeFromIsoString({ isoDate: val }))
  njkEnv.addFilter('dateTimeShort', val => formatDateTimeFromIsoString({ isoDate: val, shortDateFormat: true }))
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
  njkEnv.addGlobal('allowedNoteFileExtensionList', allowedNoteFileExtensionList)
  njkEnv.addGlobal('allowedNoteFileTypeLabelList', allowedNoteFileTypeLabelList)
  njkEnv.addGlobal('backLinkUrl', backLinkUrl)
  njkEnv.addGlobal('backLinkUrlRecallType', backLinkUrlRecallType)
  njkEnv.addGlobal('backLinkUrlAssessDownload', backLinkUrlAssessDownload)
  njkEnv.addGlobal('makeUrl', makeUrl)
  njkEnv.addGlobal('changeLinkUrl', changeLinkUrl)
  njkEnv.addGlobal('errorMessage', errorMessage)
  njkEnv.addGlobal('getReferenceDataItemLabel', getReferenceDataItemLabel)
  njkEnv.addGlobal('filterActiveItems', filterActiveItems)
  njkEnv.addGlobal('removeUndefinedFromObject', removeUndefinedFromObject)
  njkEnv.addGlobal('listDocumentLabels', listDocumentLabels)
  njkEnv.addGlobal('dueDateTimeLabel', dueDateTimeLabel)
  njkEnv.addGlobal('dueDateShortLabel', dueDateShortLabel)
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
  njkEnv.addGlobal('formatNsyWarrantEmailLink', formatNsyWarrantEmailLink)
  njkEnv.addGlobal('makePageTitle', makePageTitle)
  njkEnv.addGlobal('linkTextWithPerson', linkTextWithPerson)

  nunjucksDate.setDefaultFormat('d MMM YYYY')
  nunjucksDate.install(njkEnv)
}
