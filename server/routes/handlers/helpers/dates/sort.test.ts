import { sortListByDateField, sortNotInCustodyList, sortToDoList } from './sort'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'

describe('sortToDoList', () => {
  it('places recalls with no due date at the top, earliest created first', () => {
    const recalls = [{ createdDateTime: '2020-12-05T16:33:57.000Z' }, { createdDateTime: '2020-12-04T16:33:57.000Z' }]
    const sorted = sortToDoList(recalls as RecallResponse[])
    expect(sorted).toEqual([
      { createdDateTime: '2020-12-04T16:33:57.000Z' },
      { createdDateTime: '2020-12-05T16:33:57.000Z' },
    ])
  })

  it('sorts recalls that have dossierTargetDate set', () => {
    const recalls = [
      { dossierTargetDate: '2021-08-14', recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' },
      { dossierTargetDate: '2021-08-13', recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' },
    ]
    const sorted = sortToDoList(recalls as RecallResponse[])
    expect(sorted).toEqual([
      { dossierTargetDate: '2021-08-13', recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' },
      { dossierTargetDate: '2021-08-14', recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' },
    ])
  })

  it('sorts recalls that have recallAssessmentDueDateTime set', () => {
    const recalls = [
      { recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' },
      { recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' },
    ]
    const sorted = sortToDoList(recalls as RecallResponse[])
    expect(sorted).toEqual([
      { recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' },
      { recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' },
    ])
  })

  it('sorts dossierTargetDate against recallAssessmentDueDateTime, newest date first', () => {
    const recalls = [
      { dossierTargetDate: '2021-08-15T15:33:57.000Z' },
      { recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' },
    ]
    const sorted = sortToDoList(recalls as RecallResponse[])
    expect(sorted).toEqual([
      { recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' },
      { dossierTargetDate: '2021-08-15T15:33:57.000Z' },
    ])
  })

  it('places a recall with no due date before one with a dossierTargetDate', () => {
    const recalls = [{ dossierTargetDate: '2021-08-15T15:33:57.000Z' }, {}]
    const sorted = sortToDoList(recalls as RecallResponse[])
    expect(sorted).toEqual([{}, { dossierTargetDate: '2021-08-15T15:33:57.000Z' }])
  })

  it('places a recall with no due date before one with a recallAssessmentDueDateTime', () => {
    const recalls = [{ recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' }, {}]
    const sorted = sortToDoList(recalls as RecallResponse[])
    expect(sorted).toEqual([{}, { recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' }])
  })
})

describe('sortCompletedList', () => {
  it('sorts recalls that have dossierEmailSentDate set', () => {
    const recalls = [
      { dossierEmailSentDate: '2021-08-14', lastUpdatedDateTime: '2021-08-15T15:33:57.000Z' },
      { dossierEmailSentDate: '2021-08-13', lastUpdatedDateTime: '2021-08-14T10:22:05.000Z' },
    ]
    const sorted = sortToDoList(recalls as RecallResponse[])
    expect(sorted).toEqual([
      { dossierEmailSentDate: '2021-08-14', lastUpdatedDateTime: '2021-08-15T15:33:57.000Z' },
      { dossierEmailSentDate: '2021-08-13', lastUpdatedDateTime: '2021-08-14T10:22:05.000Z' },
    ])
  })

  it('sorts recalls that have lastUpdatedDateTime set', () => {
    const recalls = [
      { lastUpdatedDateTime: '2021-08-15T15:33:57.000Z' },
      { lastUpdatedDateTime: '2021-08-14T10:22:05.000Z' },
    ]
    const sorted = sortToDoList(recalls as RecallResponse[])
    expect(sorted).toEqual([
      { lastUpdatedDateTime: '2021-08-15T15:33:57.000Z' },
      { lastUpdatedDateTime: '2021-08-14T10:22:05.000Z' },
    ])
  })

  it('sorts dossierEmailSentDate against lastUpdatedDateTime, newest date first', () => {
    const recalls = [
      { dossierEmailSentDate: '2021-08-15T15:33:57.000Z' },
      { lastUpdatedDateTime: '2021-08-14T10:22:05.000Z' },
    ]
    const sorted = sortToDoList(recalls as RecallResponse[])
    expect(sorted).toEqual([
      { dossierEmailSentDate: '2021-08-15T15:33:57.000Z' },
      { lastUpdatedDateTime: '2021-08-14T10:22:05.000Z' },
    ])
  })
})

describe('sortNotInCustodyList', () => {
  it('sorts by assessment complete first', () => {
    const recalls = [{ status: 'ASSESSED_NOT_IN_CUSTODY' }, { status: 'AWAITING_RETURN_TO_CUSTODY' }]
    const sorted = sortNotInCustodyList(recalls as RecallResponse[])
    expect(sorted).toEqual([{ status: 'ASSESSED_NOT_IN_CUSTODY' }, { status: 'AWAITING_RETURN_TO_CUSTODY' }])
  })
})

describe('sortListByDateField', () => {
  it('sorts by a deeply nested key, oldest first', () => {
    const list = [{ a: { b: { c: '2021-10-03' } } }, { a: { b: { c: '2021-10-02' } } }]
    const sorted = sortListByDateField({ list, dateKey: 'a.b.c', newestFirst: false })
    expect(sorted).toEqual([{ a: { b: { c: '2021-10-02' } } }, { a: { b: { c: '2021-10-03' } } }])
  })

  it('sorts by a deeply nested key, newest first', () => {
    const list = [
      { a: { b: { c: '2021-02-13' } } },
      { a: { b: { c: '2021-08-22' } } },
      { a: { b: { c: '2022-02-11' } } },
    ]
    const sorted = sortListByDateField({ list, dateKey: 'a.b.c', newestFirst: true })
    expect(sorted).toEqual([
      { a: { b: { c: '2022-02-11' } } },
      { a: { b: { c: '2021-08-22' } } },
      { a: { b: { c: '2021-02-13' } } },
    ])
  })
})
