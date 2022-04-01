// @ts-nocheck
import { fileUploadHistogram, sendFileSizeMetric } from './sendFileSizeMetric'

describe('sendFileSizeMetric', () => {
  let observe
  let labels

  beforeEach(() => {
    observe = jest.fn()
    labels = jest.spyOn(fileUploadHistogram, 'labels').mockReturnValue({
      observe,
    })
  })

  it('sends the metric in production', () => {
    process.env.ENVIRONMENT = 'PRODUCTION'
    sendFileSizeMetric({
      originalname: 'test.pdf',
      size: 1000000,
    })
    expect(observe).toHaveBeenCalledWith(1)
  })

  it('sets the label to the file extension', () => {
    process.env.ENVIRONMENT = 'PRODUCTION'
    sendFileSizeMetric({
      originalname: 'test.pdf',
      size: 1000000,
    })
    expect(labels).toHaveBeenCalledWith({ fileExtension: 'pdf' })
  })

  it('sends the metric in pre-production', () => {
    process.env.ENVIRONMENT = 'PRE-PRODUCTION'
    sendFileSizeMetric({
      originalname: 'test.pdf',
      size: 10500000,
    })
    expect(observe).toHaveBeenCalledWith(10.5)
  })

  it('sends the metric in development', () => {
    process.env.ENVIRONMENT = 'DEVELOPMENT'
    sendFileSizeMetric({
      originalname: 'test.pdf',
      size: 10500000,
    })
    expect(observe).toHaveBeenCalledWith(10.5)
  })

  it('does not send the metric if process.env.ENVIRONMENT is not set', () => {
    process.env.ENVIRONMENT = undefined
    sendFileSizeMetric({
      originalname: 'test.pdf',
      size: 10500000,
    })
    expect(observe).not.toHaveBeenCalled()
  })
})
