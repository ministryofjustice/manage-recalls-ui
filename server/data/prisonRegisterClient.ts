import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'
import { Prison } from '../@types'

export const getActivePrisonList = async (): Promise<Prison[] | undefined> => {
  logger.info(`Getting prison list`)
  try {
    const client = new RestClient('Prison register client', config.apis.prisonRegister)
    const prisons = await client.get<Prison[]>({ path: '/prisons' })
    if (prisons?.length) {
      return prisons.filter(prison => prison.active)
    }
    return undefined
  } catch (err) {
    logger.error(err)
    return undefined
  }
}
