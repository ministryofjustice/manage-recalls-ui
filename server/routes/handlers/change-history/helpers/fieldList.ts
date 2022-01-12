import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'
import { isDefined } from '../../helpers'

export const changeHistoryFieldList = (recall?: RecallResponse) => {
  return [
    {
      label: 'Prison held in',
      id: 'currentPrison',
      hasHistory: recall ? isDefined(recall.currentPrison) : undefined,
    },
  ]
}

export const changeHistoryFieldLabel = (fieldId: string) =>
  changeHistoryFieldList().find(field => field.id === fieldId)?.label
