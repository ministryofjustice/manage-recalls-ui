import { AllowedUploadFileType } from '../../../../@types/documents'

export const allowedEmailFileExtensions: AllowedUploadFileType[] = [
  {
    extension: '.msg',
    label: 'MSG',
  },
  {
    extension: '.eml',
    label: 'EML',
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
