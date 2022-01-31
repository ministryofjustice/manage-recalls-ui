import { Prisoner } from '../../../@types/manage-recalls-api/models/Prisoner'
import { prisonerByNomsNumber } from '../../../clients/manageRecallsApiClient'

export const getPerson = async (nomsNumber: string, token: string): Promise<Prisoner | null> =>
  prisonerByNomsNumber(nomsNumber, token)
