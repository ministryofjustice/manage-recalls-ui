import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { isEmailValid, isPhoneValid } from '../../utils/validate-formats'
import { isStringValidReferenceData } from '../../../referenceData'
import { formatValidationErrorMessage, makeErrorObject } from '../../utils/errorMessages'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'

export const validateProbationOfficer = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let unsavedValues
  let valuesToSave

  const {
    probationOfficerName,
    probationOfficerEmail,
    probationOfficerPhoneNumber,
    localDeliveryUnit,
    localDeliveryUnitInput,
    authorisingAssistantChiefOfficer,
  } = requestBody
  const emailValid = isEmailValid(probationOfficerEmail)
  const phoneValid = isPhoneValid(probationOfficerPhoneNumber)
  // localDeliveryUnit is the value of the hidden select dropdown that's populated by the autocomplete
  // localDeliveryUnitInput is what the user typed into the autocomplete input. It might be a random string and not a valid LDU, so needs validating
  const localDeliveryUnitInvalidInput = Boolean(
    localDeliveryUnitInput && !isStringValidReferenceData('localDeliveryUnits', localDeliveryUnitInput)
  )
  if (
    !probationOfficerName ||
    !probationOfficerEmail ||
    !emailValid ||
    !probationOfficerPhoneNumber ||
    !phoneValid ||
    !localDeliveryUnit ||
    localDeliveryUnitInvalidInput ||
    !authorisingAssistantChiefOfficer
  ) {
    errors = []
    if (!probationOfficerName) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerName',
          text: 'Enter a name',
        })
      )
    }
    if (!probationOfficerEmail) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerEmail',
          text: 'Enter an email',
        })
      )
    }
    if (probationOfficerEmail && !emailValid) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerEmail',
          text: 'Enter an email address in the correct format, like name@example.com',
          values: probationOfficerEmail,
        })
      )
    }
    if (!probationOfficerPhoneNumber) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerPhoneNumber',
          text: 'Enter a phone number',
        })
      )
    }
    if (probationOfficerPhoneNumber && !phoneValid) {
      errors.push(
        makeErrorObject({
          id: 'probationOfficerPhoneNumber',
          text: 'Enter a phone number in the correct format, like 01277 960901',
          values: probationOfficerPhoneNumber,
        })
      )
    }
    if (localDeliveryUnitInvalidInput) {
      errors.push(
        makeErrorObject({
          id: 'localDeliveryUnit',
          text: formatValidationErrorMessage({ errorId: 'invalidSelectionFromList' }, 'a Local Delivery Unit'),
          values: localDeliveryUnitInput,
        })
      )
    } else if (!localDeliveryUnit) {
      errors.push(
        makeErrorObject({
          id: 'localDeliveryUnit',
          text: formatValidationErrorMessage({ errorId: 'noSelectionFromList' }, 'a Local Delivery Unit'),
        })
      )
    }
    if (!authorisingAssistantChiefOfficer) {
      errors.push(
        makeErrorObject({
          id: 'authorisingAssistantChiefOfficer',
          text: 'Enter the Assistant Chief Officer that signed-off the recall',
        })
      )
    }
    unsavedValues = {
      probationOfficerName,
      probationOfficerEmail,
      probationOfficerPhoneNumber,
      localDeliveryUnit,
      authorisingAssistantChiefOfficer,
    }
  }
  if (!errors) {
    valuesToSave = {
      probationOfficerName,
      probationOfficerEmail,
      probationOfficerPhoneNumber,
      localDeliveryUnit: UpdateRecallRequest.localDeliveryUnit[localDeliveryUnit],
      authorisingAssistantChiefOfficer,
    }
  }
  return {
    errors,
    valuesToSave,
    unsavedValues,
    redirectToPage: urlInfo.fromPage
      ? makeUrlToFromPage(urlInfo.fromPage, urlInfo)
      : makeUrl('upload-documents', urlInfo),
  }
}
