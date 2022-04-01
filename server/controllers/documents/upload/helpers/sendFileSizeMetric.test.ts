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

  it('sends the metric', () => {
    sendFileSizeMetric({
      originalname: 'test.pdf',
      size: 1000000,
    })
    expect(observe).toHaveBeenCalledWith(1)
  })

  it('sets the label to the file extension', () => {
    sendFileSizeMetric({
      originalname: 'test.pdf',
      size: 1000000,
    })
    expect(labels).toHaveBeenCalledWith({ fileExtension: 'pdf' })
  })

  it('does not send the metric if file is not set', () => {
    sendFileSizeMetric()
    expect(observe).not.toHaveBeenCalled()
  })
})
