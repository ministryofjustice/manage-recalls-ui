import { NamedFormError, ObjectMap, ReqValidatorReturn, UrlInfo, ValidationError } from '../../../@types'
import { PartBRecordRequest } from '../../../@types/manage-recalls-api/models/PartBRecordRequest'
import { makeMetaDataForFile } from '../../documents/upload/helpers'
import { RecallDocument } from '../../../@types/manage-recalls-api/models/RecallDocument'
import { isInvalidFileType } from '../../documents/upload/validators/validateUploadedFiles'
import { convertGmtDatePartsToUtc, dateHasError } from '../../utils/dates/convert'
import {
  errorMsgDocumentUpload,
  errorMsgEmailUpload,
  errorMsgProvideDetail,
  errorMsgUserActionDateTime,
  makeErrorObject,
} from '../../utils/errorMessages'
import { makeUrl } from '../../utils/makeUrl'

export const validatePartB = ({
  requestBody,
  filesUploaded,
  uploadFailed,
  urlInfo,
}: {
  requestBody: ObjectMap<string>
  filesUploaded: ObjectMap<Express.Multer.File[]>
  uploadFailed: boolean
  urlInfo: UrlInfo
}): ReqValidatorReturn<PartBRecordRequest> => {
  let errors: NamedFormError[]
  let valuesToSave
  let confirmationMessage
  let redirectToPage

  const partBFile = filesUploaded?.partBFileName?.[0]
  const oasysFile = filesUploaded?.oasysFileName?.[0]
  const emailFile = filesUploaded?.emailFileName?.[0]
  const partBInvalid =
    partBFile && isInvalidFileType(makeMetaDataForFile(partBFile, RecallDocument.category.PART_B_RISK_REPORT))
  const oasysInvalid =
    oasysFile && isInvalidFileType(makeMetaDataForFile(oasysFile, RecallDocument.category.OASYS_RISK_ASSESSMENT))
  const emailInvalid =
    emailFile && isInvalidFileType(makeMetaDataForFile(emailFile, RecallDocument.category.PART_B_EMAIL_FROM_PROBATION))

  const { partBReceivedDateDay, partBReceivedDateMonth, partBReceivedDateYear, partBDetails } = requestBody
  const partBReceivedDateParts = {
    year: partBReceivedDateYear,
    month: partBReceivedDateMonth,
    day: partBReceivedDateDay,
  }
  const partBReceivedDate = convertGmtDatePartsToUtc(partBReceivedDateParts, {
    dateMustBeInPast: true,
    includeTime: false,
  })

  if (
    uploadFailed ||
    !partBFile ||
    partBInvalid ||
    oasysInvalid ||
    !emailFile ||
    emailInvalid ||
    dateHasError(partBReceivedDate) ||
    !partBDetails
  ) {
    errors = []
    if (uploadFailed) {
      errors.push({
        name: 'uploadError',
        text: 'An error occurred uploading the files',
      })
    }
    if (!uploadFailed) {
      if (!partBFile) {
        errors.push(
          makeErrorObject({
            id: 'partBFileName',
            text: 'Select a part B',
          })
        )
      }
      if (partBInvalid) {
        errors.push(
          makeErrorObject({
            id: 'partBFileName',
            text: errorMsgDocumentUpload.invalidFileFormat(partBFile.originalname),
          })
        )
      }
      if (oasysInvalid) {
        errors.push(
          makeErrorObject({
            id: 'oasysFileName',
            text: errorMsgDocumentUpload.invalidFileFormat(oasysFile.originalname),
          })
        )
      }
    }
    if (!partBDetails) {
      errors.push(
        makeErrorObject({
          id: 'partBDetails',
          text: errorMsgProvideDetail,
        })
      )
    }
    if (dateHasError(partBReceivedDate)) {
      errors.push(
        makeErrorObject({
          name: 'partBReceivedDate',
          id: 'partBReceivedDate-partBReceivedDateDay',
          text: errorMsgUserActionDateTime(partBReceivedDate as ValidationError, 'received the part B', true),
          values: partBReceivedDateParts,
        })
      )
    }
    if (!uploadFailed) {
      if (!emailFile) {
        errors.push(
          makeErrorObject({
            id: 'emailFileName',
            text: 'Select a part B email from probation',
          })
        )
      }
      if (emailInvalid) {
        errors.push(
          makeErrorObject({
            id: 'emailFileName',
            text: errorMsgEmailUpload.invalidFileFormat(emailFile.originalname),
          })
        )
      }
    }
  }

  if (!errors) {
    confirmationMessage = {
      heading: 'Part B added',
      bannerType: 'message_group',
      pageToDisplayOn: 'view-recall',
      items: [
        {
          text: `Part B report ${oasysFile ? 'and OASys ' : ''}uploaded.`,
          link: {
            text: 'View',
            href: '#uploaded-documents',
          },
        },
        {
          text: 'Part B email and note added.',
          link: {
            text: 'View',
            href: '#recallDetails-part-b',
          },
        },
        {
          text: 'Re-release recommendation added', // TODO - move to validateSupportRerelease and add to existing confirmationMessage
        },
      ],
    }
    valuesToSave = {
      details: partBDetails,
      partBReceivedDate: partBReceivedDate as string,
      partBFileName: partBFile?.originalname,
      partBFileContent: partBFile?.buffer.toString('base64'),
      emailFileName: emailFile.originalname,
      emailFileContent: emailFile.buffer.toString('base64'),
      oasysFileName: oasysFile?.originalname,
      oasysFileContent: oasysFile?.buffer.toString('base64'),
    }
    redirectToPage = makeUrl('support-rerelease', urlInfo)
  }
  const unsavedValues = {
    partBDetails,
    partBReceivedDateParts,
  }
  return { errors, valuesToSave, unsavedValues, confirmationMessage, redirectToPage }
}
