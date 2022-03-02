import { EmailUploadValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { errorMsgEmailUpload, errorMsgProvideDetail, makeErrorObject } from '../../utils/errorMessages'
import { ConfirmedRecallTypeRequest } from '../../../@types/manage-recalls-api/models/ConfirmedRecallTypeRequest'
import { UploadDocumentRequest } from '../../../@types/manage-recalls-api/models/UploadDocumentRequest'

export const validateDecision = ({
  requestBody,
  emailFileSelected,
  uploadFailed,
  invalidFileFormat,
}: EmailUploadValidatorArgs): ReqValidatorReturn<ConfirmedRecallTypeRequest> => {
  let errors
  let unsavedValues
  let valuesToSave

  const {
    recommendedRecallType,
    confirmedRecallType,
    confirmedRecallTypeDetailFixed,
    confirmedRecallTypeDetailStandard,
  } = requestBody
  const isAgreeValueValid = ['FIXED', 'STANDARD'].includes(confirmedRecallType)
  const userDisagreedWithRecommendation = recommendedRecallType !== confirmedRecallType
  const isFixed = confirmedRecallType === 'FIXED'
  const isStandard = confirmedRecallType === 'STANDARD'
  const fixedDetailMissing = isFixed && !confirmedRecallTypeDetailFixed
  const standardDetailMissing = isStandard && !confirmedRecallTypeDetailStandard
  const existingUpload = requestBody[UploadDocumentRequest.category.CHANGE_RECALL_TYPE_EMAIL] === 'existingUpload'
  const uploadFailedValidation =
    userDisagreedWithRecommendation && ((!emailFileSelected && !existingUpload) || uploadFailed || invalidFileFormat)
  if (uploadFailedValidation || !isAgreeValueValid || fixedDetailMissing || standardDetailMissing) {
    errors = []
    if (!isAgreeValueValid) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallType',
          text: 'Do you agree with the recall recommendation?',
        })
      )
    }
    if (fixedDetailMissing) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallTypeDetailFixed',
          text: errorMsgProvideDetail,
        })
      )
    }
    if (standardDetailMissing) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallTypeDetailStandard',
          text: errorMsgProvideDetail,
        })
      )
    }
    if (!emailFileSelected && !existingUpload) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallTypeEmailFileName',
          text: errorMsgEmailUpload.noFile,
        })
      )
    }
    if (uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallTypeEmailFileName',
          text: errorMsgEmailUpload.uploadFailed,
        })
      )
    }
    if (!uploadFailed && invalidFileFormat) {
      errors.push(
        makeErrorObject({
          id: 'confirmedRecallTypeEmailFileName',
          text: errorMsgEmailUpload.invalidFileFormat,
        })
      )
    }
    unsavedValues = {
      confirmedRecallType,
      confirmedRecallTypeDetailFixed,
      confirmedRecallTypeDetailStandard,
    }
  }
  if (!errors) {
    const detail = isFixed ? confirmedRecallTypeDetailFixed : confirmedRecallTypeDetailStandard
    valuesToSave = {
      confirmedRecallType: confirmedRecallType as ConfirmedRecallTypeRequest.confirmedRecallType,
      confirmedRecallTypeDetail: detail,
    }
  }
  return { errors, valuesToSave, unsavedValues, redirectToPage: 'assess-licence' }
}
