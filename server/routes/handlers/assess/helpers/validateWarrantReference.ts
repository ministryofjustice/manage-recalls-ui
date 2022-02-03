import { makeErrorObject } from '../../helpers'
import { ReqValidatorArgs, ReqValidatorReturn } from '../../../../@types'
import { makeUrl } from '../../helpers/makeUrl'

export const validateWarrantReference = ({ requestBody, urlInfo }: ReqValidatorArgs): ReqValidatorReturn => {
  let errors
  let valuesToSave

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
  }
  return {
    errors,
    valuesToSave,
    redirectToPage: makeUrl('view-recall', { ...urlInfo, fromPage: '/', fromHash: 'notInCustody' }),
  }
}
