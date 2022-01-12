import { NextFunction, Request, Response } from 'express'
import { getFieldHistory } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { isString } from '../helpers'
import { AuditForField } from '../../../@types/manage-recalls-api/models/AuditForField'
import { sortListByDateField } from '../helpers/dates/sort'
import { changeHistoryFieldLabel } from './helpers/fieldList'

export const getFieldChangeHistory = async (req: Request, res: Response, next: NextFunction) => {
  const { recallId } = req.params
  const { id } = req.query
  const {
    user: { token },
  } = res.locals
  try {
    if (!isString(recallId)) {
      throw new Error('Invalid recallId')
    }
    if (!isString(id)) {
      throw new Error('Invalid field ID')
    }
    const list = await getFieldHistory(recallId, id as string, token)
    const sortedHistory = sortListByDateField<AuditForField>({ list, dateKey: 'updatedDateTime', newestFirst: true })
    res.locals.fieldHistory = {
      label: changeHistoryFieldLabel(id as string),
      items: sortedHistory,
    }
  } catch (err) {
    next(err)
  } finally {
    next()
  }
}
