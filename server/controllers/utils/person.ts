import { RecallResponse } from '../../@types/manage-recalls-api/models/RecallResponse'
import { RecallResponseLite } from '../../@types/manage-recalls-api/models/RecallResponseLite'

export const formatPersonName = ({
  category,
  otherName,
  recall,
}: {
  category: string
  otherName?: string
  recall: RecallResponse | RecallResponseLite
}) => {
  if (otherName) {
    return otherName
  }
  const { firstName, middleNames, lastName } = recall
  if (category === 'FIRST_MIDDLE_LAST') {
    return `${firstName} ${middleNames ? `${middleNames} ` : ''}${lastName}`
  }
  return `${firstName} ${lastName}`
}
