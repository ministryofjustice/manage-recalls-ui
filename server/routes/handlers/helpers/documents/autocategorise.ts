import { documentCategories } from './documentCategories'
import { replaceSpaces } from '../index'
import { DocumentCategoryMetadata } from '../../../../@types/documents'
import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'

const uncategorised = documentCategories.find(doc => doc.name === ApiRecallDocument.category.UNCATEGORISED)

export const autocategoriseDocFileName = (fileName: string): DocumentCategoryMetadata => {
  const fileNameLowerCase = fileName.toLowerCase()

  const category = documentCategories
    .filter(cat => cat.fileNamePatterns)
    .find(cat => {
      return cat.fileNamePatterns.some(
        pattern =>
          fileNameLowerCase.includes(pattern) ||
          fileNameLowerCase.includes(replaceSpaces(pattern, '-')) ||
          fileNameLowerCase.includes(replaceSpaces(pattern, '_')) ||
          fileNameLowerCase.includes(replaceSpaces(pattern, ''))
      )
    })

  return category || uncategorised
}
