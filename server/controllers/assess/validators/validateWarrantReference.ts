import { ReqValidatorArgs, ReqValidatorReturn } from '../../../@types'
import { makeUrl } from '../../utils/makeUrl'
import { makeErrorObject } from '../../utils/errorMessages'
import { UpdateRecallRequest } from '../../../@types/manage-recalls-api/models/UpdateRecallRequest'

export const validateWarrantReference = ({
  requestBody,
  urlInfo,
}: ReqValidatorArgs): ReqValidatorReturn<UpdateRecallRequest> => {
  let errors
  let valuesToSave
  let confirmationMessage

  const { warrantReferenceNumber } = requestBody
  if (!warrantReferenceNumber) {
    errors = [
      makeErrorObject({
        id: 'warrantReferenceNumber',
        text: 'What is the warrant reference number?',
      }),
    ]
  }
  if (!errors) {
    valuesToSave = { warrantReferenceNumber }
    confirmationMessage = {
      text: 'Warrant reference number has been added.',
      link: {
        text: 'View',
        href: '#custody',
      },
      type: 'success',
    }
  }
  return {
    errors,
    valuesToSave,
    redirectToPage: makeUrl('view-recall', { ...urlInfo, fromPage: '/', fromHash: 'notInCustody' }),
    confirmationMessage,
  }
}
