import { Request, Response } from 'express'
import { updateRecall } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import logger from '../../../../logger'
import { isInvalid, makeErrorObject } from '../helpers'

export const probationOfficer = async (req: Request, res: Response): Promise<void> => {
  const { nomsNumber, recallId } = req.params
  if (isInvalid(nomsNumber) || isInvalid(recallId)) {
    return res.redirect(303, `/persons/${nomsNumber}`)
  }

  const {
    probationOfficerName,
    probationOfficerEmail,
    probationOfficerPhoneNumber,
    probationDivision,
    authorisingAssistantChiefOfficer,
  } = req.body

  if (
    !probationOfficerName ||
    !probationOfficerEmail ||
    !probationOfficerPhoneNumber ||
    !probationDivision ||
    !authorisingAssistantChiefOfficer
  ) {
    req.session.errors = []
    if (!probationOfficerName) {
      req.session.errors.push(
        makeErrorObject({
          id: 'probationOfficerName',
          text: "Probation officer's name",
        })
      )
    }
    if (!probationOfficerEmail) {
      req.session.errors.push(
        makeErrorObject({
          id: 'probationOfficerEmail',
          text: "Probation officer's email",
        })
      )
    }
    if (!probationOfficerPhoneNumber) {
      req.session.errors.push(
        makeErrorObject({
          id: 'probationOfficerPhoneNumber',
          text: "Probation officer's phone number",
        })
      )
    }
    if (!probationDivision) {
      req.session.errors.push(
        makeErrorObject({
          id: 'probationDivision',
          text: 'Probation division',
        })
      )
    }
    if (!authorisingAssistantChiefOfficer) {
      req.session.errors.push(
        makeErrorObject({
          id: 'authorisingAssistantChiefOfficer',
          text: 'Assistant Chief Officer',
        })
      )
    }
  }
  if (req.session.errors) {
    return res.redirect(303, req.originalUrl)
  }
  try {
    const recall = await updateRecall(
      recallId,
      {
        probationOfficerName,
        probationOfficerEmail,
        probationOfficerPhoneNumber,
        probationDivision,
        authorisingAssistantChiefOfficer,
      },
      res.locals.user.token
    )
    res.redirect(303, `/persons/${nomsNumber}/recalls/${recall.recallId}/upload-documents`)
  } catch (err) {
    logger.error(err)
    res.redirect(303, `/persons/${nomsNumber}`)
  }
}
