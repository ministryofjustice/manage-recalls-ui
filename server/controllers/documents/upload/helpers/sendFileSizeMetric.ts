import promClient from 'prom-client'
import { bytesToMB } from './index'
import logger from '../../../../../logger'

export const fileUploadHistogram = new promClient.Histogram({
  name: 'upload_file_sizes',
  help: 'sizes in MB of uploaded files',
  buckets: promClient.linearBuckets(0, 5, 20),
  labelNames: ['fileExtension'],
})

export const sendFileSizeMetric = (file: Express.Multer.File) => {
  try {
    if (['DEVELOPMENT', 'PRODUCTION', 'PRE-PRODUCTION'].includes(process.env.ENVIRONMENT) && file) {
      const fileExtension = file.originalname.split('.').pop().toLowerCase()
      fileUploadHistogram.labels({ fileExtension }).observe(bytesToMB(file.size))
    }
  } catch (err) {
    logger.error(err)
  }
}
