import { RecallResponse } from '../@types/manage-recalls-api/models/RecallResponse'

export const mappaLevels = [
  {
    value: RecallResponse.mappaLevel.NA,
    text: 'N/A',
  },
  {
    value: RecallResponse.mappaLevel.LEVEL_1,
    text: 'Level 1',
  },
  {
    value: RecallResponse.mappaLevel.LEVEL_2,
    text: 'Level 2',
  },
  {
    value: RecallResponse.mappaLevel.LEVEL_3,
    text: 'Level 3',
  },
  {
    value: RecallResponse.mappaLevel.NOT_KNOWN,
    text: 'Not known',
  },
  {
    value: RecallResponse.mappaLevel.CONFIRMATION_REQUIRED,
    text: 'Confirmation required',
  },
]
