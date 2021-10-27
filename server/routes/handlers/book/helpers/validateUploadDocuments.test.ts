import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { validateCategories, validateUploadedFileTypes } from './validateDocuments'

describe('validateUploadedFileTypes', () => {
  it('returns errors for any docs with invalid file extensions or MIME types', () => {
    const fileData = [
      {
        category: ApiRecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt part a.doc',
        label: 'Part A recall report',
        fileContent: 'abc',
        mimeType: 'application/pdf',
      },
      {
        category: ApiRecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt psr.pdf',
        label: 'Pre-sentencing report',
        fileContent: 'def',
        mimeType: 'application/msword',
      },
    ]
    const { errors } = validateUploadedFileTypes(fileData)
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
})

describe('validateCategories', () => {
  it("returns errors and valuesToSave if there are more than one of a category that doesn't allow multiples", () => {
    const files = [
      {
        documentId: '23',
        category: ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
        fileName: 'report.pdf',
      },
      {
        documentId: '45',
        category: ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
        fileName: 'report2.pdf',
      },
      {
        documentId: '67',
        category: ApiRecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
        fileName: 'report3.pdf',
      },
    ]
    const { errors, valuesToSave } = validateCategories(files)
    expect(errors).toEqual([
      {
        href: '#45',
        name: '45',
        text: "You can't upload more than one previous convictions sheet",
      },
      {
        href: '#67',
        name: '67',
        text: "You can't upload more than one previous convictions sheet",
      },
    ])
    expect(valuesToSave).toEqual([{ category: 'PREVIOUS_CONVICTIONS_SHEET', documentId: '23', fileName: 'report.pdf' }])
  })

  it('does not return errors if there are more than one of a category that does allow multiples', () => {
    const files = [
      {
        documentId: '23',
        category: ApiRecallDocument.category.OTHER,
        fileName: 'report.pdf',
      },
      {
        documentId: '45',
        category: ApiRecallDocument.category.OTHER,
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
        category: ApiRecallDocument.category.UNCATEGORISED,
        fileName: 'report.pdf',
      },
      {
        documentId: '45',
        category: ApiRecallDocument.category.LICENCE,
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
