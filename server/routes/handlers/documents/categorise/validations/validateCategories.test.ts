import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { validateCategories } from './validateCategories'

describe('validateCategories', () => {
  it("returns errors and valuesToSave if there are more than one of a category that doesn't allow multiples", () => {
    const files = [
      {
        documentId: '23',
        category: RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
        fileName: 'report.pdf',
        isExistingUpload: false,
      },
      {
        documentId: '45',
        category: RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
        fileName: 'report2.pdf',
        isExistingUpload: false,
      },
      {
        documentId: '67',
        category: RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
        fileName: 'report3.pdf',
        isExistingUpload: false,
      },
    ]
    const { errors, valuesToSave } = validateCategories(files)
    expect(errors).toEqual([
      {
        href: '#45',
        name: '45',
        text: 'You can only upload one previous convictions sheet',
        values: 'PREVIOUS_CONVICTIONS_SHEET',
      },
      {
        href: '#67',
        name: '67',
        text: 'You can only upload one previous convictions sheet',
        values: 'PREVIOUS_CONVICTIONS_SHEET',
      },
    ])
    expect(valuesToSave).toEqual([
      { category: 'PREVIOUS_CONVICTIONS_SHEET', documentId: '23', fileName: 'report.pdf', isExistingUpload: false },
    ])
  })

  it('returns errors and no valuesToSave if there is an existing (already saved) instance of a category, and a newly categorised instance', () => {
    const files = [
      {
        documentId: '23',
        category: RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
        fileName: 'report.pdf',
        isExistingUpload: true,
      },
      {
        documentId: '45',
        category: RecallDocument.category.PREVIOUS_CONVICTIONS_SHEET,
        fileName: 'report2.pdf',
        isExistingUpload: false,
      },
    ]
    const { errors, valuesToSave } = validateCategories(files)
    expect(errors).toEqual([
      {
        href: '#45',
        name: '45',
        text: 'You can only upload one previous convictions sheet',
        values: 'PREVIOUS_CONVICTIONS_SHEET',
      },
    ])
    expect(valuesToSave).toBeUndefined()
  })

  it('does not return errors if there are more than one of a category that does allow multiples', () => {
    const files = [
      {
        documentId: '23',
        category: RecallDocument.category.OTHER,
        fileName: 'report.pdf',
        isExistingUpload: false,
      },
      {
        documentId: '45',
        category: RecallDocument.category.OTHER,
        fileName: 'report2.pdf',
        isExistingUpload: false,
      },
    ]
    const { errors, valuesToSave } = validateCategories(files)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual([
      { category: 'OTHER', documentId: '23', fileName: 'report.pdf', isExistingUpload: false },
      { category: 'OTHER', documentId: '45', fileName: 'report2.pdf', isExistingUpload: false },
    ])
  })

  it('returns errors for uncategorised documents', () => {
    const files = [
      {
        documentId: '23',
        category: RecallDocument.category.UNCATEGORISED,
        fileName: 'report.pdf',
        isExistingUpload: false,
      },
      {
        documentId: '45',
        category: RecallDocument.category.LICENCE,
        fileName: 'report2.pdf',
        isExistingUpload: false,
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
    expect(valuesToSave).toEqual([
      { category: 'LICENCE', documentId: '45', fileName: 'report2.pdf', isExistingUpload: false },
    ])
  })
})
