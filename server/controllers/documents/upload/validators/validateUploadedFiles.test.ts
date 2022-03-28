import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { validateUploadedFiles } from './validateUploadedFiles'
import { MAX_UPLOAD_FILE_SIZE_MB } from '../helpers'

describe('validateUploadedFiles', () => {
  it('returns errors for any docs with invalid file extensions or MIME types', () => {
    const fileData = [
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt part a.doc',
        label: 'Part A recall report',
        fileContent: 'abc',
        mimeType: 'application/pdf',
        sizeMB: 3,
      },
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt psr.pdf',
        label: 'Pre-sentencing report',
        fileContent: 'def',
        mimeType: 'application/msword',
        sizeMB: 0.5,
      },
    ]
    const { errors } = validateUploadedFiles(fileData, 'documents')
    expect(errors).toEqual([
      {
        href: '#documents',
        name: 'documents',
        text: "The selected file 'Wesley Holt part a.doc' must be a PDF",
      },
      {
        href: '#documents',
        name: 'documents',
        text: "The selected file 'Wesley Holt psr.pdf' must be a PDF",
      },
    ])
  })

  it('returns errors for any docs exceeding the max file size', () => {
    const fileData = [
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt part a.pdf',
        label: 'Part A recall report',
        fileContent: 'abc',
        mimeType: 'application/pdf',
        sizeMB: MAX_UPLOAD_FILE_SIZE_MB + 1,
      },
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt psr.pdf',
        label: 'Pre-sentencing report',
        fileContent: 'def',
        mimeType: 'application/pdf',
        sizeMB: MAX_UPLOAD_FILE_SIZE_MB - 1,
      },
    ]
    const { errors } = validateUploadedFiles(fileData, 'documents')
    expect(errors).toEqual([
      {
        href: '#documents',
        name: 'documents',
        text: "The selected file 'Wesley Holt part a.pdf' must be smaller than 25MB",
      },
    ])
  })

  it('returns valuesToSave and no errors if inputs are valid', () => {
    const fileData = [
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'test.pdf',
        label: 'Choose a type',
        fileContent: 'abc',
        mimeType: 'application/pdf',
        sizeMB: 0.5,
      },
    ]
    const { errors, valuesToSave } = validateUploadedFiles(fileData, 'documents')
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual([
      {
        category: 'UNCATEGORISED',
        fileContent: 'abc',
        label: 'Choose a type',
        mimeType: 'application/pdf',
        originalFileName: 'test.pdf',
      },
    ])
  })

  it('allows any mime type for .eml files', () => {
    const fileData = [
      {
        category: RecallDocument.category.PART_B_EMAIL_FROM_PROBATION,
        originalFileName: 'test.eml',
        label: 'Choose a type',
        fileContent: 'abc',
        mimeType: 'message/rfc822',
      },
    ]
    const { errors, valuesToSave } = validateUploadedFiles(fileData, 'documents')
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual([
      {
        category: 'PART_B_EMAIL_FROM_PROBATION',
        fileContent: 'abc',
        label: 'Choose a type',
        mimeType: 'message/rfc822',
        originalFileName: 'test.eml',
      },
    ])
  })
})
