import { CategorisedFileMetadata } from '../../../../../@types/documents'
import { RecallDocument } from '../../../../../@types/manage-recalls-api/models/RecallDocument'
import { AddDocumentResponse } from '../../../../../@types/manage-recalls-api/models/AddDocumentResponse'
import { NamedFormError, ObjectMap } from '../../../../../@types'
import { makeErrorObject } from '../../../helpers'
import logger from '../../../../../../logger'
import { setDocumentCategory } from '../../../../../clients/manageRecallsApi/manageRecallsApiClient'

export const getMetadataForCategorisedFiles = (requestBody: ObjectMap<string>): CategorisedFileMetadata[] => {
  logger.info(`getMetadataForCategorisedFiles: ${JSON.stringify(requestBody)}`)
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
  responses: PromiseSettledResult<AddDocumentResponse>[]
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