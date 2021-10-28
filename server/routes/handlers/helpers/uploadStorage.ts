import multer from 'multer'

const storage = multer.memoryStorage()
const uploadStorage = multer({ storage })

export const uploadStorageField = (fieldName: string) => uploadStorage.single(fieldName)
export const uploadStorageArray = (fieldName: string) => uploadStorage.array(fieldName)
