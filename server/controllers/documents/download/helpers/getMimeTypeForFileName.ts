import { allFileExtensions } from '../../upload/helpers/allowedUploadExtensions'

export const getMimeTypeForFileName = (fileName: string) => {
  const extension = fileName.split('.').pop().toLowerCase()
  if (extension) {
    const found = allFileExtensions.find(fileType => fileType.extension === `.${extension}`)
    if (found) {
      return found.mimeType
    }
  }
  return 'application/octet-stream'
}
