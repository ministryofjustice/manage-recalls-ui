import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { DecoratedUploadedDoc } from '../../../../../@types/documents'
import { documentCategories } from '../../documentCategories'
import { autocategoriseDocFileName } from './autocategorise'
import { findDocCategory } from '../../upload/helpers'
import { documentDownloadUrl } from './index'

export const decorateAllDocTypes = ({
  docs,
  nomsNumber,
  recallId,
}: {
  docs: RecallDocument[]
  nomsNumber: string
  recallId: string
}): DecoratedUploadedDoc[] => {
  const categoryNamesForSorting = documentCategories.map(d => d.name)
  return docs
    .map(doc => {
      const autocategory =
        doc.category === RecallDocument.category.UNCATEGORISED && autocategoriseDocFileName(doc.fileName)
      const documentCategory = findDocCategory(doc.category)
      let suggestedCategory
      if (documentCategory.type === 'document') {
        suggestedCategory = autocategory ? autocategory.name : documentCategory.name
      }
      return {
        ...doc,
        type: documentCategory.type,
        standardFileName: documentCategory.standardFileName,
        label: documentCategory.label,
        labelLowerCase: documentCategory.labelLowerCase,
        category: documentCategory.name,
        suggestedCategory,
        url: documentDownloadUrl({ recallId, nomsNumber, documentId: doc.documentId }),
      }
    })
    .sort((a, b) => {
      const aIndex = categoryNamesForSorting.indexOf(a.category)
      const bIndex = categoryNamesForSorting.indexOf(b.category)
      if (aIndex > bIndex) {
        return 1
      }
      if (aIndex < bIndex) {
        return -1
      }
      return 0
    })
}
