import { CategorisedFileMetadata } from '../../../../@types/documents'
import { NamedFormError } from '../../../../@types'
import { formatDocLabel } from '../../upload/helpers'
import { documentCategories } from '../../documentCategories'
import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { createUsedCategoriesList } from '../helpers'
import { makeErrorObject } from '../../../utils/errorMessages'

export const validateCategories = (
  categorisedFileData: CategorisedFileMetadata[]
): {
  errors?: NamedFormError[]
  valuesToSave: CategorisedFileMetadata[]
} => {
  let errors: NamedFormError[]
  let valuesToSave: CategorisedFileMetadata[]
  const usedCategories = createUsedCategoriesList(categorisedFileData)
  categorisedFileData
    .filter(file => !file.isExistingUpload)
    .forEach(file => {
      let hasError = false
      if (usedCategories.includes(file.category)) {
        errors = errors || []
        errors.push(
          makeErrorObject({
            id: file.documentId,
            text: `You can only upload one ${formatDocLabel(file.category)}`,
            values: file.category,
          })
        )
        hasError = true
      }
      const docCategory = documentCategories.find(cat => cat.name === file.category)
      if (!docCategory) {
        throw new Error(`Invalid document category: ${file.category} for file "${file.fileName}"`)
      }
      if (!docCategory.multiple) {
        usedCategories.push(file.category)
      }
      if (file.category === RecallDocument.category.UNCATEGORISED) {
        errors = errors || []
        errors.push(
          makeErrorObject({
            id: file.documentId,
            text: `Choose a type for ${file.fileName}`,
          })
        )
        hasError = true
      }
      if (!hasError) {
        valuesToSave = valuesToSave || []
        valuesToSave.push(file)
      }
    })
  return { errors, valuesToSave }
}
