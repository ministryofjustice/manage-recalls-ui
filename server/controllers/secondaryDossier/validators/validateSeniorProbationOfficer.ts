import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { isEmailValid, isPhoneValid } from '../../utils/validate-formats'
import { errorMsgInvalidEmail, errorMsgInvalidPhoneNumber, makeErrorObject } from '../../utils/errorMessages'
import { makeUrl, makeUrlToFromPage } from '../../utils/makeUrl'

export const validateSeniorProbationOfficer = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let unsavedValues
  let valuesToSave

  const {
    seniorProbationOfficerInfo_fullName,
    seniorProbationOfficerInfo_email,
    seniorProbationOfficerInfo_phoneNumber,
    seniorProbationOfficerInfo_functionalEmail,
  } = requestBody
  const emailValid = isEmailValid(seniorProbationOfficerInfo_email)
  const functionalEmailValid = isEmailValid(seniorProbationOfficerInfo_functionalEmail)
  const phoneValid = isPhoneValid(seniorProbationOfficerInfo_phoneNumber)
  if (
    !seniorProbationOfficerInfo_fullName ||
    !seniorProbationOfficerInfo_email ||
    !emailValid ||
    !functionalEmailValid ||
    !seniorProbationOfficerInfo_phoneNumber ||
    !phoneValid
  ) {
    errors = []
    if (!seniorProbationOfficerInfo_fullName) {
      errors.push(
        makeErrorObject({
          id: 'seniorProbationOfficerInfo_fullName',
          text: 'Enter a name',
        })
      )
    }
    if (!seniorProbationOfficerInfo_email) {
      errors.push(
        makeErrorObject({
          id: 'seniorProbationOfficerInfo_email',
          text: 'Enter an email',
        })
      )
    }
    if (seniorProbationOfficerInfo_email && !emailValid) {
      errors.push(
        makeErrorObject({
          id: 'seniorProbationOfficerInfo_email',
          text: errorMsgInvalidEmail,
          values: seniorProbationOfficerInfo_email,
        })
      )
    }
    if (!seniorProbationOfficerInfo_phoneNumber) {
      errors.push(
        makeErrorObject({
          id: 'seniorProbationOfficerInfo_phoneNumber',
          text: 'Enter a phone number',
        })
      )
    }
    if (seniorProbationOfficerInfo_phoneNumber && !phoneValid) {
      errors.push(
        makeErrorObject({
          id: 'seniorProbationOfficerInfo_phoneNumber',
          text: errorMsgInvalidPhoneNumber,
          values: seniorProbationOfficerInfo_phoneNumber,
        })
      )
    }
    if (!seniorProbationOfficerInfo_functionalEmail) {
      errors.push(
        makeErrorObject({
          id: 'seniorProbationOfficerInfo_functionalEmail',
          text: 'Enter a probation functional email address',
        })
      )
    }
    if (seniorProbationOfficerInfo_functionalEmail && !emailValid) {
      errors.push(
        makeErrorObject({
          id: 'seniorProbationOfficerInfo_functionalEmail',
          text: 'Enter a probation functional email address in the correct format, like name@example.com',
          values: seniorProbationOfficerInfo_functionalEmail,
        })
      )
    }
    unsavedValues = {
      seniorProbationOfficerInfo_fullName,
      seniorProbationOfficerInfo_email,
      seniorProbationOfficerInfo_phoneNumber,
      seniorProbationOfficerInfo_functionalEmail,
    }
  }
  if (!errors) {
    valuesToSave = {
      seniorProbationOfficerInfo: {
        fullName: seniorProbationOfficerInfo_fullName,
        email: seniorProbationOfficerInfo_email,
        phoneNumber: seniorProbationOfficerInfo_phoneNumber,
        functionalEmail: seniorProbationOfficerInfo_functionalEmail,
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
