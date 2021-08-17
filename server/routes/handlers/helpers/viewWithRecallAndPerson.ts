import { Request, Response } from 'express'
import { getRecall, searchByNomsNumber } from '../../../clients/manageRecallsApi/manageRecallsApiClient'
import { documentTypes } from '../book/documentTypes'
import { getFormattedRecallLength, isInvalid, splitIsoDateToParts } from './index'
import { DatePartsParsed, FormError, ObjectMap, RecallFormValues } from '../../../@types'
import { RecallResponse } from '../../../@types/manage-recalls-api'

export type ViewName =
  | 'assessConfirmation'
  | 'assessDecision'
  | 'assessRecall'
  | 'recallLastRelease'
  | 'recallRequestReceived'
  | 'recallPrisonPolice'
  | 'recallIssuesNeeds'

const getFormValues = ({
  errors = {},
  apiValues,
}: {
  errors: ObjectMap<FormError>
  apiValues: RecallResponse
}): RecallFormValues => {
  const formValues = {} as RecallFormValues
  formValues.recallEmailReceivedDateTimeParts =
    errors.recallEmailReceivedDateTime?.values || splitIsoDateToParts(apiValues.recallEmailReceivedDateTime)
  formValues.lastReleasePrison =
    (errors.lastReleasePrison?.values?.lastReleasePrison as string) || apiValues.lastReleasePrison
  formValues.lastReleaseDateTimeParts =
    (errors.lastReleaseDateTime?.values as unknown as DatePartsParsed) ||
    splitIsoDateToParts(apiValues.lastReleaseDateTime)
  formValues.contraband = errors.contraband?.values?.contraband as boolean
  formValues.contrabandDetail =
    (errors.contrabandDetail?.values?.contrabandDetail as string) || apiValues.contrabandDetail
  formValues.vulnerabilityDiversity = errors.vulnerabilityDiversity?.values?.vulnerabilityDiversity as boolean
  formValues.vulnerabilityDiversityDetail =
    (errors.vulnerabilityDiversityDetail?.values?.vulnerabilityDiversityDetail as string) ||
    apiValues.vulnerabilityDiversityDetail
  formValues.mappaLevel = (errors.mappaLevel?.values?.mappaLevel as string) || apiValues.mappaLevel
  return formValues
}

export const viewWithRecallAndPerson =
  (viewName: ViewName) =>
  async (req: Request, res: Response): Promise<void> => {
    const { nomsNumber, recallId } = req.params
    if (isInvalid(nomsNumber) || isInvalid(recallId)) {
      res.sendStatus(400)
      return
    }
    const [person, recall] = await Promise.all([
      searchByNomsNumber(nomsNumber as string, res.locals.user.token),
      getRecall(recallId, res.locals.user.token),
    ])
    recall.documents = recall.documents.map(doc => ({
      ...doc,
      ...(documentTypes.find(d => d.name === doc.category) || {}),
    }))
    res.locals.recall = recall
    if (recall.recallLength) {
      res.locals.recall.recallLengthFormatted = getFormattedRecallLength(recall.recallLength)
    }
    res.locals.formValues = getFormValues({ errors: res.locals.errors, apiValues: recall })
    res.locals.person = person
    res.render(`pages/${viewName}`)
  }
