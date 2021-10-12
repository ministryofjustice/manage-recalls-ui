import { RecallResponse } from '../@types/manage-recalls-api/models/RecallResponse'

export const recallLengths = [
  {
    value: RecallResponse.recallLength.FOURTEEN_DAYS,
    text: '14',
  },
  {
    value: RecallResponse.recallLength.TWENTY_EIGHT_DAYS,
    text: '28',
  },
]
