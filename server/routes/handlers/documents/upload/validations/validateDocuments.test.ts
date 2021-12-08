import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { validateCategories, validateUploadedFileTypes } from './validateDocuments'

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

describe('validateCategories', () => {
  it("returns errors and valuesToSave if there are more than one of a category that doesn't allow multiples", () => {
    const files = [
      {
        documentId: '23',
        category: RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
        fileName: 'report.pdf',
      },
      {
        documentId: '45',
        category: RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
        fileName: 'report2.pdf',
      },
      {
        documentId: '67',
        category: RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
        fileName: 'report3.pdf',
      },
    ]
    const { errors, valuesToSave } = validateCategories(files)
    expect(errors).toEqual([
      {
        href: '#45',
        name: '45',
        text: 'You can only upload one previous convictions sheet',
      },
      {
        href: '#67',
        name: '67',
        text: 'You can only upload one previous convictions sheet',
      },
    ])
    expect(valuesToSave).toEqual([{ category: 'PREVIOUS_CONVICTIONS_SHEET', documentId: '23', fileName: 'report.pdf' }])
  })

  it('does not return errors if there are more than one of a category that does allow multiples', () => {
    const files = [
      {
        documentId: '23',
        category: RecallDocument.category.OTHER,
        fileName: 'report.pdf',
      },
      {
        documentId: '45',
        category: RecallDocument.category.OTHER,
        fileName: 'report2.pdf',
      },
    ]
    const { errors, valuesToSave } = validateCategories(files)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual([
      { category: 'OTHER', documentId: '23', fileName: 'report.pdf' },
      { category: 'OTHER', documentId: '45', fileName: 'report2.pdf' },
    ])
  })

  it('returns errors for uncategorised documents', () => {
    const files = [
      {
        documentId: '23',
        category: RecallDocument.category.UNCATEGORISED,
        fileName: 'report.pdf',
      },
      {
        documentId: '45',
        category: RecallDocument.category.LICENCE,
        fileName: 'report2.pdf',
      },
    ]
    const { errors, valuesToSave } = validateCategories(files)
    expect(errors).toEqual([
      {
        href: '#23',
        name: '23',
        text: 'Choose a type for report.pdf',
      },
    ])
    expect(valuesToSave).toEqual([{ category: 'LICENCE', documentId: '45', fileName: 'report2.pdf' }])
  })
})
