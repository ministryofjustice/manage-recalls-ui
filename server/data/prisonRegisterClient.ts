import logger from '../../logger'
import config from '../config'
import RestClient from './restClient'
import { Prison } from '../@types'

export const getPrisonList = async (): Promise<Prison[] | undefined> => {
  logger.info(`Getting prison list`)
  try {
    const prisons = await restClient().get<Prison[]>({ path: '/prisons' })
    if (prisons?.length) {
      return prisons.sort((a, b) => (a.prisonName < b.prisonName ? -1 : 1))
    }
    return undefined
  } catch (err) {
    logger.error(err)
    return undefined
  }
}

export async function findPrisonById(prisonId: string): Promise<Prison | undefined> {
  logger.info(`Finding prison for ${prisonId}`)
  try {
    return await restClient().get<Prison>({ path: `/prisons/id/${prisonId}` })
  } catch (err) {
    logger.error(err)
    return undefined
  }
}

const restClient = () => new RestClient('Prison register client', config.apis.prisonRegister)
