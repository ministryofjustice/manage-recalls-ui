import { CategorisedFileMetadata } from '../../../../../@types/documents'
import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { NewDocumentResponse } from '../../../../../@types/manage-recalls-api/models/NewDocumentResponse'
import { NamedFormError, ObjectMap } from '../../../../../@types'
import { makeErrorObject } from '../../../helpers'
import { setDocumentCategory } from '../../../../../clients/manageRecallsApi/manageRecallsApiClient'
import { findDocCategory } from '../../upload/helpers'

export const getMetadataForCategorisedFiles = (requestBody: ObjectMap<string>): CategorisedFileMetadata[] => {
  const categoryKeys = Object.keys(requestBody).filter(key => key.startsWith('category-'))
  return categoryKeys.map(key => {
    const isExistingUpload = key.startsWith('category-existing-')
    const documentId = key.replace(isExistingUpload ? 'category-existing-' : 'category-', '')
    return {
      documentId,
      category: requestBody[key] as RecallDocument.category,
      fileName: requestBody[`fileName-${documentId}`], // TODO - log if not found?
      isExistingUpload,
    }
  })
}

export const listFailedCategorySaves = (
  fileData: CategorisedFileMetadata[],
  responses: PromiseSettledResult<NewDocumentResponse>[]
): NamedFormError[] | null =>
  responses
    .map((result, idx) => {
      if (result.status === 'rejected') {
        return makeErrorObject({
          id: fileData[idx].documentId,
          text: `${fileData[idx].fileName} could not be saved - try again`,
        })
      }
      return null
    })
    .filter(Boolean)

export const saveCategories = async ({
  recallId,
  categorisedToSave,
  token,
}: {
  recallId: string
  categorisedToSave: CategorisedFileMetadata[]
  token: string
}) => {
  if (categorisedToSave?.length) {
    const responses = await Promise.allSettled(
      categorisedToSave.map(file => {
        const { documentId, category } = file
        return setDocumentCategory(recallId, documentId, category, token)
      })
    )
    return listFailedCategorySaves(categorisedToSave, responses)
  }
  return []
}
export const createUsedCategoriesList = (categorisedFileData: CategorisedFileMetadata[]): string[] => {
  return categorisedFileData
    .filter(file => {
      const category = findDocCategory(file.category)
      if (!category) {
        throw new Error(`Unable to find category ${file.category}`)
      }
      return file.isExistingUpload && !category.multiple
    })
    .map(file => file.category)
}
