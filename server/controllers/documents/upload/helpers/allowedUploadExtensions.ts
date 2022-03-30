import { AllowedUploadFileType, DocumentType } from '../../../../@types/documents'
import { findDocCategory, makeMetaDataForFile } from './index'
import { RecallDocument } from '../../../../@types/manage-recalls-api'

export const allowedEmailFileExtensions: AllowedUploadFileType[] = [
  {
    extension: '.msg',
    label: 'MSG',
    mimeType: 'application/octet-stream',
  },
  {
    extension: '.eml',
    label: 'EML',
    mimeType: 'application/octet-stream',
    allowAnyMimeType: true,
  },
]

export const allowedDocumentFileExtensions: AllowedUploadFileType[] = [
  {
    extension: '.pdf',
    label: 'PDF',
    mimeType: 'application/pdf',
  },
]

export const allowedImageFileExtensions: AllowedUploadFileType[] = [
  {
    extension: '.jpg',
    label: 'JPG',
    mimeType: 'image/jpeg',
  },
  {
    extension: '.jpeg',
    label: 'JPEG',
    mimeType: 'image/jpeg',
  },
]

export const allowedWordDocumentFileExtensions: AllowedUploadFileType[] = [
  {
    extension: '.doc',
    label: 'DOC',
    mimeType: 'application/msword',
  },
  {
    extension: '.docx',
    label: 'DOCX',
    mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  },
]

export const allowedNoteFileExtensions: AllowedUploadFileType[] = [
  ...allowedEmailFileExtensions,
  ...allowedWordDocumentFileExtensions,
  ...allowedDocumentFileExtensions,
]

export const allFileExtensions = [
  ...allowedEmailFileExtensions,
  ...allowedWordDocumentFileExtensions,
  ...allowedDocumentFileExtensions,
  ...allowedImageFileExtensions,
]

export const isInvalidFileType = ({
  file,
  category,
}: {
  file: Express.Multer.File
  category: RecallDocument.category
}) => {
  const fileMetaData = makeMetaDataForFile(file, category)
  const docCategory = findDocCategory(fileMetaData.category)
  const allowedExtensions = allowedExtensionsForFileType(docCategory.type)
  return !allowedExtensions.some(
    ext =>
      fileMetaData.originalFileName.endsWith(ext.extension) &&
      (fileMetaData.mimeType === ext.mimeType || ext.allowAnyMimeType === true)
  )
}

export const allowedExtensionsForFileType = (fileType: DocumentType) => {
  switch (fileType) {
    case 'document':
      return allowedDocumentFileExtensions
    case 'email':
      return allowedEmailFileExtensions
    case 'note_document':
      return allowedNoteFileExtensions
    default:
      throw new Error(`Invalid file type: ${fileType}`)
  }
}
