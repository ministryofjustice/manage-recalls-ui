import { Request, Response } from 'express'
import { getAddressByUprn } from '../../../clients/osPlacesApiClient'
import { validateSelectedAddress } from './helpers/validateSelectedAddress'
import { makeErrorObject, makeUrl } from '../helpers'
import { addLastKnownAddress } from '../../../clients/manageRecallsApiClient'
import { LastKnownAddress } from '../../../@types/manage-recalls-api/models/LastKnownAddress'

export const selectLookupAddressHandler = async (req: Request, res: Response): Promise<void> => {
  const { recallId } = req.params
  const { addressUprn, postcode: postcodeQuery } = req.body
  const { user, urlInfo } = res.locals
  const reloadOnError = () => res.redirect(303, `${req.originalUrl}?postcode=${postcodeQuery}`)

  try {
    const { errors, valuesToSave } = validateSelectedAddress(addressUprn)
    if (errors) {
      req.session.errors = errors
      return reloadOnError()
    }
    const { line1, line2, town, postcode } = await getAddressByUprn(valuesToSave.addressUprn)

    await addLastKnownAddress(
      { line1, line2, town, postcode, recallId, source: LastKnownAddress.source.LOOKUP },
      user.token
    )

    res.redirect(303, makeUrl('address-list', urlInfo))
  } catch (err) {
    req.session.errors = [
      makeErrorObject({
        id: 'postcode',
        text: 'An error occurred',
      }),
    ]
    return reloadOnError()
  }
}
