import { DecoratedDocument, DocumentCategoryMetadata } from '../../../../../@types/documents'

export const getVersionedUpload = ({
  versionedCategoryName,
  docCategoriesWithUploads,
}: {
  versionedCategoryName: string
  docCategoriesWithUploads: DocumentCategoryMetadata[]
}) => {
  let versionedUpload: DecoratedDocument
  if (versionedCategoryName) {
    const categoryData = docCategoriesWithUploads.find(type => type.name === versionedCategoryName && type.versioned)
    if (categoryData && categoryData.uploaded.length) {
      const { label, type, standardFileName } = categoryData
      const { version, url, documentId, category, createdDateTime, createdByUserName, fileName } =
        categoryData.uploaded[0]
      versionedUpload = {
        label,
        standardFileName,
        fileName,
        type,
        version,
        url,
        documentId,
        category,
        createdDateTime,
        createdByUserName,
      }
    }
  }
  return versionedUpload
}
