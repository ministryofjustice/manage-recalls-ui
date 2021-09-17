import { makeErrorObject } from '../../helpers'
import { FileDataBase64, NamedFormError, ObjectMap, UploadDocumentMetadata } from '../../../../@types'
import { mandatoryDocs } from './index'

interface Args {
  fileData: FileDataBase64[]
  requestBody: ObjectMap<string>
}

export const validateUploadDocuments = ({ fileData, requestBody }: Args): { errors?: NamedFormError[] } => {
  const errors = mandatoryDocs()
    .map((doc: UploadDocumentMetadata) => {
      if (!fileData.find(file => file.category === doc.name) && !requestBody[doc.name]) {
        return makeErrorObject({
          id: doc.name,
          text: doc.label,
        })
      }
      return undefined
    })
    .filter(Boolean)
  return { errors }
}
