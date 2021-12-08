import { documentCategories } from '../../documentCategories'
import { replaceSpaces } from '../../../helpers'
import { DocumentCategoryMetadata } from '../../../../../@types/documents'

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
