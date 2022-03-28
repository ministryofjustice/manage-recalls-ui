import * as docExports from './index'
import { UrlInfo } from '../../../../@types'
import { RecallResponse } from '../../../../@types/manage-recalls-api/models/RecallResponse'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { requiredDocsList } from './index'

const { enableDeleteDocuments, makeMetaDataForFile } = docExports

describe('enableDeleteDocuments', () => {
  it('should return true if recall is being booked on and fromPage is valid', () => {
    expect(enableDeleteDocuments(RecallResponse.status.BEING_BOOKED_ON, { fromPage: 'check-answers' } as UrlInfo)).toBe(
      true
    )
  })

  it('should return true if recall is being booked on and fromPage is not set', () => {
    expect(enableDeleteDocuments(RecallResponse.status.BEING_BOOKED_ON, {} as UrlInfo)).toBe(true)
  })

  it('should return false if recall is being booked on and fromPage is invalid', () => {
    expect(enableDeleteDocuments(RecallResponse.status.BEING_BOOKED_ON, { fromPage: 'view-recall' } as UrlInfo)).toBe(
      false
    )
  })

  it('should return false if recall is not being booked on and fromPage is valid', () => {
    expect(enableDeleteDocuments(RecallResponse.status.BOOKED_ON, {} as UrlInfo)).toBe(false)
  })
})

describe('makeMetaDataForFile', () => {
  it('uses the supplied category', () => {
    const details = 'Extra details'
    const result = makeMetaDataForFile(
      {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('def', 'base64'),
      } as Express.Multer.File,
      RecallDocument.category.LICENCE,
      details
    )
    expect(result.category).toEqual(RecallDocument.category.LICENCE)
    expect(result.details).toEqual(details)
  })

  it('throws if given an invalid category', () => {
    try {
      makeMetaDataForFile(
        {
          originalname: 'test.pdf',
          mimetype: 'application/pdf',
          buffer: Buffer.from('def', 'base64'),
        } as Express.Multer.File,
        'RANDOM' as RecallDocument.category
      )
    } catch (err) {
      expect(err.message).toEqual('makeMetaDataForFile: invalid category name: RANDOM')
    }
  })

  it('returns undefined if not given a file', () => {
    const result = makeMetaDataForFile(undefined, RecallDocument.category.LICENCE)
    expect(result).toBeUndefined()
  })

  it('returns file size, converted to MB', () => {
    const result = makeMetaDataForFile(
      {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('def', 'base64'),
        size: 1540000,
      } as Express.Multer.File,
      RecallDocument.category.LICENCE
    )
    expect(result.sizeMB).toEqual(1.5)
  })
})

describe('requiredDocsList', () => {
  it('returns a list of required docs', () => {
    const list = requiredDocsList({} as RecallResponse)
    expect(list).toEqual([
      {
        fileNamePatterns: ['part a'],
        label: 'Part A recall report',
        labelLowerCase: 'part A recall report',
        name: 'PART_A_RECALL_REPORT',
        required: true,
        requiredReason: 'DOSSIER',
        standardFileName: 'Part A.pdf',
        type: 'document',
        versioned: true,
      },
      {
        fileNamePatterns: ['licence'],
        label: 'Licence',
        name: 'LICENCE',
        required: true,
        requiredReason: 'DOSSIER',
        standardFileName: 'Licence.pdf',
        type: 'document',
        versioned: true,
      },
    ])
  })

  it('includes part B if status is AWAITING_PART_B, there is a part B due date and no part B record', () => {
    const list = requiredDocsList({
      partBDueDate: '2020-01-01',
      partBRecords: [],
      status: RecallResponse.status.AWAITING_PART_B,
    } as RecallResponse)
    const partBIncluded = list.some(record => record.name === RecallDocument.category.PART_B_RISK_REPORT)
    expect(partBIncluded).toEqual(true)
  })

  it('does not include part B if status is not AWAITING_PART_B, even if there is a part B due date and no part B record', () => {
    const list = requiredDocsList({
      partBDueDate: '2020-01-01',
      partBRecords: [],
      status: RecallResponse.status.AWAITING_DOSSIER_CREATION,
    } as RecallResponse)
    const partBIncluded = list.some(record => record.name === RecallDocument.category.PART_B_RISK_REPORT)
    expect(partBIncluded).toEqual(false)
  })
})
