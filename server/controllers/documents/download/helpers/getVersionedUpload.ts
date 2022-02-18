import { DecoratedUploadedDoc, DocumentCategoryMetadata } from '../../../../@types/documents'

export const getVersionedUpload = ({
  versionedCategoryName,
  docCategoriesWithUploads,
}: {
  versionedCategoryName: string
  docCategoriesWithUploads: DocumentCategoryMetadata[]
}) => {
  let versionedUpload: DecoratedUploadedDoc
  if (versionedCategoryName) {
    const categoryData = docCategoriesWithUploads.find(type => type.name === versionedCategoryName && type.versioned)
    if (categoryData) {
      // the uploaded array might include uncategorised docs, so filter them out
      const uploaded = categoryData.uploaded
        .filter(file => file.category === versionedCategoryName)
        .sort((a, b) => b.version - a.version)
      if (uploaded.length) {
        const { label, type, standardFileName } = categoryData
        const { version, url, documentId, category, createdDateTime, createdByUserName, fileName } = uploaded[0]
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
  }
  return versionedUpload
}
