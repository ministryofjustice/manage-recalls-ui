import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { FileDataBase64 } from '../../../../@types'
import { validateUploadDocuments } from './validateUploadDocuments'

describe('validateUploadDocuments', () => {
  it("returns errors for mandatory docs that aren't in the uploaded files", () => {
    const fileData = [
      {
        category: ApiRecallDocument.category.PART_A_RECALL_REPORT,
        originalFileName: 'Wesley Holt part a.pdf',
        label: 'Part A',
        fileContent: 'abc',
        mimeType: 'application/pdf',
      },
      {
        category: ApiRecallDocument.category.PRE_SENTENCING_REPORT,
        originalFileName: 'Wesley Holt psr.pdf',
        label: 'PSR',
        fileContent: 'def',
        mimeType: 'application/pdf',
      },
    ]
    const { errors } = validateUploadDocuments({ fileData, requestBody: {} })
    expect(errors).toEqual([
      {
        href: '#LICENCE',
        name: 'LICENCE',
        text: 'Select a Licence',
      },
      {
        href: '#PREVIOUS_CONVICTIONS_SHEET',
        name: 'PREVIOUS_CONVICTIONS_SHEET',
        text: 'Select a Previous convictions sheet',
      },
    ])
  })

  it('returns errors for all mandatory docs if there are no uploaded files', () => {
    const fileData = [] as unknown as FileDataBase64[]
    const { errors } = validateUploadDocuments({ fileData, requestBody: {} })
    expect(errors).toEqual([
      {
        href: '#PART_A_RECALL_REPORT',
        name: 'PART_A_RECALL_REPORT',
        text: 'Select a Part A recall report',
      },
      {
        href: '#LICENCE',
        name: 'LICENCE',
        text: 'Select a Licence',
      },
      {
        href: '#PREVIOUS_CONVICTIONS_SHEET',
        name: 'PREVIOUS_CONVICTIONS_SHEET',
        text: 'Select a Previous convictions sheet',
      },
      {
        href: '#PRE_SENTENCING_REPORT',
        name: 'PRE_SENTENCING_REPORT',
        text: 'Select a Pre-sentencing report',
      },
    ])
  })

  it('excludes already saved documents from the error list', () => {
    const fileData = [
      {
        category: ApiRecallDocument.category.PART_A_RECALL_REPORT,
        originalFileName: 'Wesley Holt part a.pdf',
        label: 'Part A',
        fileContent: 'abc',
        mimeType: 'application/pdf',
      },
    ]
    const { errors } = validateUploadDocuments({ fileData, requestBody: { LICENCE: 'existingUpload' } })
    expect(errors).toEqual([
      {
        href: '#PREVIOUS_CONVICTIONS_SHEET',
        name: 'PREVIOUS_CONVICTIONS_SHEET',
        text: 'Select a Previous convictions sheet',
      },
      {
        href: '#PRE_SENTENCING_REPORT',
        name: 'PRE_SENTENCING_REPORT',
        text: 'Select a Pre-sentencing report',
      },
    ])
  })

  it('returns errors for any docs with invalid file extensions or MIME types', () => {
    const fileData = [
      {
        category: ApiRecallDocument.category.PART_A_RECALL_REPORT,
        originalFileName: 'Wesley Holt part a.doc',
        label: 'Part A recall report',
        fileContent: 'abc',
        mimeType: 'application/pdf',
      },
      {
        category: ApiRecallDocument.category.PRE_SENTENCING_REPORT,
        originalFileName: 'Wesley Holt psr.pdf',
        label: 'Pre-sentencing report',
        fileContent: 'def',
        mimeType: 'application/msword',
      },
    ]
    const { errors } = validateUploadDocuments({ fileData, requestBody: {} })
    expect(errors).toEqual([
      {
        href: '#PART_A_RECALL_REPORT',
        name: 'PART_A_RECALL_REPORT',
        text: 'The Part A recall report must be a PDF',
      },
      {
        href: '#LICENCE',
        name: 'LICENCE',
        text: 'Select a Licence',
      },
      {
        href: '#PREVIOUS_CONVICTIONS_SHEET',
        name: 'PREVIOUS_CONVICTIONS_SHEET',
        text: 'Select a Previous convictions sheet',
      },
      {
        href: '#PRE_SENTENCING_REPORT',
        name: 'PRE_SENTENCING_REPORT',
        text: 'The Pre-sentencing report must be a PDF',
      },
    ])
  })
})
