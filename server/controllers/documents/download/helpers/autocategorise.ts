import { documentCategories } from '../../documentCategories'
import { DocumentCategoryMetadata } from '../../../../@types/documents'
import { replaceSpaces } from '../../../../utils/utils'

export const autocategoriseDocFileName = (fileName: string): DocumentCategoryMetadata => {
  const fileNameLowerCase = fileName.toLowerCase()

  return documentCategories
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
}
