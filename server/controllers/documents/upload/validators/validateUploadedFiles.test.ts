import { RecallDocument } from '../../../../@types/manage-recalls-api/models/RecallDocument'
import { validateUploadedFiles } from './validateUploadedFiles'
import { MAX_UPLOAD_FILE_SIZE_MB } from '../helpers'

describe('validateUploadedFiles', () => {
  const fileUploadInputName = 'documents'

  it('returns errors for any docs with invalid file extensions or MIME types', () => {
    const files = [
      {
        originalname: 'Wesley Holt part a.doc',
        mimetype: 'application/pdf',
        buffer: Buffer.from('def', 'base64'),
      },
      {
        originalname: 'Wesley Holt psr.pdf',
        mimetype: 'application/msword',
        buffer: Buffer.from('def', 'base64'),
      },
    ] as Express.Multer.File[]
    const uploadedFileData = [
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt part a.doc',
        label: 'Part A recall report',
        fileContent: 'abc',
        mimeType: 'application/pdf',
        sizeMB: 3,
      },
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt psr.pdf',
        label: 'Pre-sentencing report',
        fileContent: 'def',
        mimeType: 'application/msword',
        sizeMB: 0.5,
      },
    ]
    const { errors } = validateUploadedFiles({
      files,
      uploadedFileData,
      fileUploadInputName,
    })
    expect(errors).toEqual([
      {
        href: '#documents',
        name: 'documents',
        text: "The selected file 'Wesley Holt part a.doc' must be a PDF",
      },
      {
        href: '#documents',
        name: 'documents',
        text: "The selected file 'Wesley Holt psr.pdf' must be a PDF",
      },
    ])
  })

  it('returns errors for any docs exceeding the max file size', () => {
    const files = [
      {
        originalname: 'Wesley Holt part a.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('def', 'base64'),
      },
      {
        originalname: 'Wesley Holt psr.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('def', 'base64'),
      },
    ] as Express.Multer.File[]
    const uploadedFileData = [
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt part a.pdf',
        label: 'Part A recall report',
        fileContent: 'abc',
        mimeType: 'application/pdf',
        sizeMB: MAX_UPLOAD_FILE_SIZE_MB + 1,
      },
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'Wesley Holt psr.pdf',
        label: 'Pre-sentencing report',
        fileContent: 'def',
        mimeType: 'application/pdf',
        sizeMB: MAX_UPLOAD_FILE_SIZE_MB - 1,
      },
    ]
    const { errors } = validateUploadedFiles({
      files,
      uploadedFileData,
      fileUploadInputName,
    })
    expect(errors).toEqual([
      {
        href: '#documents',
        name: 'documents',
        text: "The selected file 'Wesley Holt part a.pdf' must be smaller than 25MB",
      },
    ])
  })

  it('returns valuesToSave and no errors if inputs are valid', () => {
    const files = [
      {
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        buffer: Buffer.from('def', 'base64'),
      },
    ] as Express.Multer.File[]
    const uploadedFileData = [
      {
        category: RecallDocument.category.UNCATEGORISED,
        originalFileName: 'test.pdf',
        label: 'Choose a type',
        fileContent: 'abc',
        mimeType: 'application/pdf',
        sizeMB: 0.5,
      },
    ]
    const { errors, valuesToSave } = validateUploadedFiles({
      files,
      uploadedFileData,
      fileUploadInputName,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual([
      {
        category: 'UNCATEGORISED',
        fileContent: 'abc',
        label: 'Choose a type',
        mimeType: 'application/pdf',
        originalFileName: 'test.pdf',
      },
    ])
  })

  it('allows any mime type for .eml files', () => {
    const files = [
      {
        originalname: 'test.eml',
        mimetype: 'unknown',
        buffer: Buffer.from('def', 'base64'),
      },
    ] as Express.Multer.File[]
    const uploadedFileData = [
      {
        category: RecallDocument.category.PART_B_EMAIL_FROM_PROBATION,
        originalFileName: 'test.eml',
        label: 'Choose a type',
        fileContent: 'abc',
        mimeType: 'message/rfc822',
      },
    ]
    const { errors, valuesToSave } = validateUploadedFiles({
      files,
      uploadedFileData,
      fileUploadInputName,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual([
      {
        category: 'PART_B_EMAIL_FROM_PROBATION',
        fileContent: 'abc',
        label: 'Choose a type',
        mimeType: 'message/rfc822',
        originalFileName: 'test.eml',
      },
    ])
  })
})
