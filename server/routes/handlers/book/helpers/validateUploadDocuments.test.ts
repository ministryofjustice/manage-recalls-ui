import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { validateUploadDocuments } from './validateUploadDocuments'

describe('validateUploadDocuments', () => {
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
    const { errors } = validateUploadDocuments({ fileData })
    expect(errors).toEqual([
      {
        href: '#PART_A_RECALL_REPORT',
        name: 'PART_A_RECALL_REPORT',
        text: 'The part A recall report must be a PDF',
      },
      {
        href: '#PRE_SENTENCING_REPORT',
        name: 'PRE_SENTENCING_REPORT',
        text: 'The pre-sentencing report must be a PDF',
      },
    ])
  })
})
