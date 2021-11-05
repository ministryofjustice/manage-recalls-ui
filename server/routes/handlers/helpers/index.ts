import nunjucks from 'nunjucks'
import { FormError, KeyedFormErrors, NamedFormError, ObjectMap } from '../../../@types'
import { UploadedFileMetadata } from '../../../@types/documents'

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

export const replaceSpaces = (str: string, replacement: string) => str.replace(/ /g, replacement)

export const transformErrorMessages = (errors: NamedFormError[]): KeyedFormErrors => {
  const errorMap = errors.filter(Boolean).reduce((acc: ObjectMap<FormError>, curr: NamedFormError) => {
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

export const listToString = (list: string[], conjunction: string) => {
  if (list.length === 1) {
    return list[0]
  }
  const copy = [...list]
  if (conjunction) {
    const lastItem = copy.pop()
    return `${copy.join(', ')} ${conjunction} ${lastItem}`
  }
  copy.join(', ')
}

export const listDocumentLabels = (docs: UploadedFileMetadata[]) =>
  listToString(
    docs.map(doc => doc.label),
    'and'
  )

export const getProperty = <T, U>(obj: T, accessor: string): U => {
  const listOfKeys = accessor.split('.')
  let traversed = obj
  listOfKeys.forEach(key => {
    traversed = traversed[key]
  })
  return traversed as unknown as U
}
