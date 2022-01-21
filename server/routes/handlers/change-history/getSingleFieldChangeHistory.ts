import { NextFunction, Request, Response } from 'express'
import { getSingleFieldHistory } from '../../../clients/manageRecallsApiClient'
import { isString } from '../helpers'
import { FieldAuditEntry } from '../../../@types/manage-recalls-api/models/FieldAuditEntry'
import { sortListByDateField } from '../helpers/dates/sort'
import { recallFieldLabel, formatRecallFieldValue } from './helpers/recallFieldList'

export const getSingleFieldChangeHistory = async (req: Request, res: Response, next: NextFunction) => {
  const { recallId } = req.params
  const { fieldName, fieldPath } = req.query
  const {
    user: { token },
  } = res.locals
  try {
    if (!isString(recallId)) {
      throw new Error('Invalid recallId')
    }
    if (!isString(fieldName)) {
      throw new Error('Invalid fieldName')
    }
    if (!isString(fieldPath)) {
      throw new Error('Invalid fieldPath')
    }
    const list = await getSingleFieldHistory(recallId, fieldPath as string, token)
    const sortedHistory = sortListByDateField<FieldAuditEntry>({ list, dateKey: 'updatedDateTime', newestFirst: true })
    const withFormattedValues = sortedHistory.map(record => ({
      ...record,
      formattedValue: formatRecallFieldValue({ record, fieldName: fieldName as string }),
    }))
    res.locals.fieldHistory = {
      label: recallFieldLabel(fieldName as string),
      items: withFormattedValues,
    }
  } catch (err) {
    next(err)
  } finally {
    next()
  }
}
