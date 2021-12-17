import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { validateUploadedFileTypes } from './validateUploadedFileTypes'

describe('validateUploadedFileTypes', () => {
  it('returns errors for any docs with invalid file extensions or MIME types', () => {
    const fileData = [
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt part a.doc',
        label: 'Part A recall report',
        fileContent: 'abc',
        mimeType: 'application/pdf',
      },
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt psr.pdf',
        label: 'Pre-sentencing report',
        fileContent: 'def',
        mimeType: 'application/msword',
      },
    ]
    const { errors } = validateUploadedFileTypes(fileData, 'documents')
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

  it('returns valuesToSave and no errors if inputs are valid', () => {
    const fileData = [
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'test.pdf',
        label: 'Choose a type',
        fileContent: 'abc',
        mimeType: 'application/pdf',
      },
    ]
    const { errors, valuesToSave } = validateUploadedFileTypes(fileData, 'documents')
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
})
