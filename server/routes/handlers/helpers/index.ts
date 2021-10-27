import nunjucks from 'nunjucks'
import {
  DecoratedDocument,
  FormError,
  KeyedFormErrors,
  NamedFormError,
  ObjectMap,
  UploadDocumentMetadata,
} from '../../../@types'
import { ApiRecallDocument } from '../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { documentCategories } from '../book/documentCategories'

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

export const requiredDocsList = (): UploadDocumentMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document' && doc.required)

export const missingNotRequiredDocsList = (): UploadDocumentMetadata[] =>
  documentCategories.filter(doc => doc.type === 'document' && doc.hintIfMissing)

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
  documentCategories.forEach(documentCategory => {
    docs
      .filter(d => documentCategory.name === d.category)
      .forEach(d => {
        decoratedUploadedDocs.push({
          ...d,
          ...documentCategory,
          url: `/persons/${nomsNumber}/recalls/${recallId}/documents/${d.documentId}`,
        })
      })
  })
  const decoratedDocTypes = documentCategories
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
      documentCategories: decoratedDocTypes,
      requiredDocsMissing: requiredDocsList().filter(
        requiredDocCategory => !decoratedUploadedDocs.find(doc => doc.name === requiredDocCategory.name)
      ),
      missingNotRequiredDocs: missingNotRequiredDocsList().filter(
        requiredDocCategory => !decoratedUploadedDocs.find(doc => doc.name === requiredDocCategory.name)
      ),
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

export const listToString = (list: string[]) => {
  if (list.length === 1) {
    return list[0]
  }
  const copy = [...list]
  const lastItem = copy.pop()
  return `${copy.join(', ')} and ${lastItem}`
}

export const listDocumentLabels = (docs: UploadDocumentMetadata[]) => listToString(docs.map(doc => doc.label))
