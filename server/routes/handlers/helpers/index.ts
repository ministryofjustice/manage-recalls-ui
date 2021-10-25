import nunjucks from 'nunjucks'
import { DecoratedDocument, FormError, KeyedFormErrors, NamedFormError, ObjectMap } from '../../../@types'
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

export const isString = (val: unknown) => typeof val === 'string'

export const areStringArraysTheSame = (arr1: unknown[], arr2: unknown[]) => arr1.join('') === arr2.join('')

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
  recallRequestEmail?: DecoratedDocument
  dossierEmail?: DecoratedDocument
} => {
  const decoratedUploadedDocs = [] as DecoratedDocument[]
  documentTypes.forEach(documentType => {
    docs
      .filter(d => documentType.name === d.category)
      .forEach(d => {
        decoratedUploadedDocs.push({
          ...d,
          ...documentType,
          url: `/persons/${nomsNumber}/recalls/${recallId}/documents/${d.documentId}`,
        })
      })
  })
  const decoratedDocTypes = documentTypes
    .filter(doc => doc.type === 'document')
    .map(docType => {
      const uploadedDocs = decoratedUploadedDocs.filter(d => d.name === docType.name)
      return {
        ...docType,
        uploaded: uploadedDocs.map(d => ({ url: d.url, fileName: d.fileName })),
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
      if (curr.name === ApiRecallDocument.category.RECALL_REQUEST_EMAIL) {
        acc.recallRequestEmail = curr
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
      recallRequestEmail: undefined,
      dossierEmail: undefined,
    }
  )
}

export const transformErrorMessages = (errors: NamedFormError[]): KeyedFormErrors => {
  const errorMap = errors.reduce((acc: ObjectMap<FormError>, curr: NamedFormError) => {
    const { name, ...rest } = curr
    acc[name] = rest
    return acc
  }, {})
  return {
    list: errors,
    ...errorMap,
  } as KeyedFormErrors
}

export const renderTemplateString = (str: string, data: ObjectMap<unknown>): string => nunjucks.renderString(str, data)

export const renderErrorMessages = (
  errors: KeyedFormErrors,
  locals: ObjectMap<unknown>
): KeyedFormErrors | undefined => {
  if (!errors) {
    return undefined
  }
  return Object.entries(errors).reduce(
    (acc, [key, val]) => {
      if (key === 'list') {
        acc.list = (val as unknown as NamedFormError[]).map(err => ({
          ...err,
          text: renderTemplateString(err.text, locals),
        }))
      } else {
        acc[key] = { ...acc[key], text: renderTemplateString(val.text, locals) }
      }
      return acc
    },
    { list: [] }
  ) as KeyedFormErrors
}
