import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { isEmailValid, isPhoneValid } from '../../utils/validate-formats'
import { errorMsgInvalidEmail, errorMsgInvalidPhoneNumber, makeErrorObject } from '../../utils/errorMessages'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'

export const validateLegalRep = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let unsavedValues
  let valuesToSave

  const { legalRepresentativeInfo_fullName, legalRepresentativeInfo_email, legalRepresentativeInfo_phoneNumber } =
    requestBody
  const emailValid = isEmailValid(legalRepresentativeInfo_email)
  const phoneValid = isPhoneValid(legalRepresentativeInfo_phoneNumber)
  if (
    !legalRepresentativeInfo_fullName ||
    !legalRepresentativeInfo_email ||
    !emailValid ||
    !legalRepresentativeInfo_phoneNumber ||
    !phoneValid
  ) {
    errors = []
    if (!legalRepresentativeInfo_fullName) {
      errors.push(
        makeErrorObject({
          id: 'legalRepresentativeInfo_fullName',
          text: 'Enter a name',
        })
      )
    }
    if (!legalRepresentativeInfo_email) {
      errors.push(
        makeErrorObject({
          id: 'legalRepresentativeInfo_email',
          text: 'Enter an email',
        })
      )
    }
    if (legalRepresentativeInfo_email && !emailValid) {
      errors.push(
        makeErrorObject({
          id: 'legalRepresentativeInfo_email',
          text: errorMsgInvalidEmail,
          values: legalRepresentativeInfo_email,
        })
      )
    }
    if (!legalRepresentativeInfo_phoneNumber) {
      errors.push(
        makeErrorObject({
          id: 'legalRepresentativeInfo_phoneNumber',
          text: 'Enter a phone number',
        })
      )
    }
    if (legalRepresentativeInfo_phoneNumber && !phoneValid) {
      errors.push(
        makeErrorObject({
          id: 'legalRepresentativeInfo_phoneNumber',
          text: errorMsgInvalidPhoneNumber,
          values: legalRepresentativeInfo_phoneNumber,
        })
      )
    }
    unsavedValues = {
      legalRepresentativeInfo_fullName,
      legalRepresentativeInfo_email,
      legalRepresentativeInfo_phoneNumber,
    }
  }
  if (!errors) {
    valuesToSave = {
      legalRepresentativeInfo: {
        fullName: legalRepresentativeInfo_fullName,
        email: legalRepresentativeInfo_email,
        phoneNumber: legalRepresentativeInfo_phoneNumber,
      },
    }
  }
  return {
    errors,
    valuesToSave,
    unsavedValues,
    redirectToPage: urlInfo.fromPage ? makeUrlToFromPage(urlInfo.fromPage, urlInfo) : makeUrl('view-recall', urlInfo),
  }
}
