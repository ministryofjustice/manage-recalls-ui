import { sortListByDateField, sortToDoList } from './sort'
import { RecallResult } from '../../../../@types'

describe('sortToDoList', () => {
  it('places recalls with no due date at the top, earliest created first', () => {
    const recalls = [
      { recall: { createdDateTime: '2020-12-05T16:33:57.000Z' } },
      { recall: { createdDateTime: '2020-12-04T16:33:57.000Z' } },
    ]
    const sorted = sortToDoList(recalls as RecallResult[])
    expect(sorted).toEqual([
      { recall: { createdDateTime: '2020-12-04T16:33:57.000Z' } },
      { recall: { createdDateTime: '2020-12-05T16:33:57.000Z' } },
    ])
  })

  it('sorts recalls that have dossierTargetDate set', () => {
    const recalls = [
      { recall: { dossierTargetDate: '2021-08-14', recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' } },
      { recall: { dossierTargetDate: '2021-08-13', recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' } },
    ]
    const sorted = sortToDoList(recalls as RecallResult[])
    expect(sorted).toEqual([
      { recall: { dossierTargetDate: '2021-08-13', recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' } },
      { recall: { dossierTargetDate: '2021-08-14', recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' } },
    ])
  })

  it('sorts recalls that have recallAssessmentDueDateTime set', () => {
    const recalls = [
      { recall: { recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' } },
      { recall: { recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' } },
    ]
    const sorted = sortToDoList(recalls as RecallResult[])
    expect(sorted).toEqual([
      { recall: { recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' } },
      { recall: { recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' } },
    ])
  })

  it('compares dossierTargetDate against recallAssessmentDueDateTime', () => {
    const recalls = [
      { recall: { dossierTargetDate: '2021-08-15T15:33:57.000Z' } },
      { recall: { recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' } },
    ]
    const sorted = sortToDoList(recalls as RecallResult[])
    expect(sorted).toEqual([
      { recall: { recallAssessmentDueDateTime: '2021-08-14T10:22:05.000Z' } },
      { recall: { dossierTargetDate: '2021-08-15T15:33:57.000Z' } },
    ])
  })

  it('places a recall with no due date before one with a dossierTargetDate', () => {
    const recalls = [{ recall: { dossierTargetDate: '2021-08-15T15:33:57.000Z' } }, { recall: {} }]
    const sorted = sortToDoList(recalls as RecallResult[])
    expect(sorted).toEqual([{ recall: {} }, { recall: { dossierTargetDate: '2021-08-15T15:33:57.000Z' } }])
  })

  it('places a recall with no due date before one with a recallAssessmentDueDateTime', () => {
    const recalls = [{ recall: { recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' } }, { recall: {} }]
    const sorted = sortToDoList(recalls as RecallResult[])
    expect(sorted).toEqual([{ recall: {} }, { recall: { recallAssessmentDueDateTime: '2021-08-15T15:33:57.000Z' } }])
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
