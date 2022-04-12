import { Request, Response } from 'express'
import { getAddressByUprn } from '../../clients/osPlacesApiClient'
import { validateSelectedAddress } from './validators/validateSelectedAddress'
import { addLastKnownAddress } from '../../clients/manageRecallsApiClient'
import { LastKnownAddress } from '../../@types/manage-recalls-api/models/LastKnownAddress'
import { makeUrl } from '../utils/makeUrl'
import { saveErrorWithDetails } from '../utils/errorMessages'

export const selectLookupAddressHandler = async (req: Request, res: Response): Promise<void> => {
  const { recallId } = req.params
  const { addressUprn, postcode: postcodeQuery } = req.body
  const reloadOnError = () => res.redirect(303, `${req.originalUrl}?postcode=${postcodeQuery}`)
  try {
    const { user, urlInfo } = res.locals

    const { errors, valuesToSave } = validateSelectedAddress(addressUprn)
    if (errors) {
      req.session.errors = errors
      return reloadOnError()
    }
    const { line1, line2, town, postcode } = await getAddressByUprn(valuesToSave.addressUprn)

    await addLastKnownAddress({
      recallId,
      valuesToSave: { line1, line2, town, postcode, recallId, source: LastKnownAddress.source.LOOKUP },
      user,
    })

    res.redirect(303, makeUrl('address-list', urlInfo))
  } catch (err) {
    req.session.errors = [saveErrorWithDetails({ err, isProduction: res.locals.env === 'PRODUCTION' })]
    return reloadOnError()
  }
}
