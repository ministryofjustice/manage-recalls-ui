import { DecoratedDocument, NamedFormError, ObjectMap } from '../../../@types'
import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { documentTypes } from '../book/documentTypes'

export const makeErrorObject = ({
  id,
  text,
  values,
}: {
  id: string
  text: string
  values?: ObjectMap<string> | string
}): NamedFormError => ({
  name: id,
  text,
  href: `#${id}`,
  values,
})

export const isInvalid = (value: string): boolean => {
  return !value || (value && typeof value !== 'string')
}

export const isDefined = (val: unknown) => typeof val !== 'undefined'

export const decorateDocs = ({
  docs,
  nomsNumber,
  recallId,
}: {
  docs: ApiRecallDocument[]
  nomsNumber: string
  recallId: string
}): {
  documents: DecoratedDocument[]
  recallNotificationEmail?: DecoratedDocument
  dossierEmail?: DecoratedDocument
} => {
  const decoratedUploadedDocs = documentTypes
    .map(documentType => {
      const doc = docs.find(d => documentType.name === d.category)
      if (doc) {
        return {
          ...doc,
          ...documentType,
          url: `/persons/${nomsNumber}/recalls/${recallId}/documents/${doc.documentId}`,
        }
      }
      return undefined
    })
    .filter(Boolean)
  const decoratedDocTypes = documentTypes
    .filter(doc => doc.type === 'document')
    .map(docType => {
      const uploadedDoc = decoratedUploadedDocs.find(d => d.category === docType.name)
      return {
        ...docType,
        uploaded: uploadedDoc && { url: uploadedDoc.url, fileName: uploadedDoc.fileName },
      }
    })
  return decoratedUploadedDocs.reduce(
    (acc, curr) => {
      if (curr.type === 'document') {
        acc.documents.push(curr)
      }
      if (curr.name === ApiRecallDocument.category.RECALL_NOTIFICATION_EMAIL) {
        acc.recallNotificationEmail = curr
      }
      if (curr.name === ApiRecallDocument.category.DOSSIER_EMAIL) {
        acc.dossierEmail = curr
      }
      return acc
    },
    {
      documents: [],
      documentTypes: decoratedDocTypes,
      recallNotificationEmail: undefined,
      dossierEmail: undefined,
    }
  )
}
