import { getVersionedUpload } from './getVersionedUpload'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { DecoratedUploadedDoc } from '../../../../@types/documents'

describe('getVersionedUpload', () => {
  it('filters out uncategorised uploads', () => {
    const versionedUpload = getVersionedUpload({
      versionedCategoryName: 'PART_A_RECALL_REPORT',
      docCategoriesWithUploads: [
        {
          label: 'Part A recall report',
          labelLowerCase: 'part A recall report',
          name: RecallDocument.category.PART_A_RECALL_REPORT,
          type: 'document',
          required: true,
          standardFileName: 'Part A.pdf',
          fileNamePatterns: ['part a'],
          versioned: true,
          uploaded: [
            {
              category: RecallDocument.category.UNCATEGORISED,
              suggestedCategory: RecallDocument.category.PART_A_RECALL_REPORT,
              label: 'Part A recall report',
            } as DecoratedUploadedDoc,
            {
              category: RecallDocument.category.PART_A_RECALL_REPORT,
              suggestedCategory: RecallDocument.category.PART_A_RECALL_REPORT,
              label: 'Part A recall report',
              version: 2,
            } as DecoratedUploadedDoc,
          ],
        },
      ],
    })
    expect(versionedUpload).toEqual({
      category: RecallDocument.category.PART_A_RECALL_REPORT,
      standardFileName: 'Part A.pdf',
      type: 'document',
      label: 'Part A recall report',
      version: 2,
    })
  })
})
