import multer from 'multer'

const storage = multer.memoryStorage()
const uploadStorage = multer({ storage })

interface Field {
  name: string
}
export const uploadStorageFields = (fields: Field[]) => uploadStorage.fields(fields)
export const uploadStorageField = (fieldName: string) => uploadStorage.single(fieldName)
export const uploadStorageArray = (fieldName: string) => uploadStorage.array(fieldName)
