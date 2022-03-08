import { getMimeTypeForFileName } from './getMimeTypeForFileName'

describe('getMimeTypeForFileName', () => {
  it('returns mimetype for .pdf document file extension', () => {
    const mimeType = getMimeTypeForFileName('test.pdf')
    expect(mimeType).toEqual('application/pdf')
  })

  it('returns mimetype for .doc word file extension', () => {
    const mimeType = getMimeTypeForFileName('test.doc')
    expect(mimeType).toEqual('application/msword')
  })

  it('returns mimetype for .docx word file extension', () => {
    const mimeType = getMimeTypeForFileName('test.docx')
    expect(mimeType).toEqual('application/vnd.openxmlformats-officedocument.wordprocessingml.document')
  })

  it('returns mimetype for .jpg image file extension', () => {
    const mimeType = getMimeTypeForFileName('test.jpg')
    expect(mimeType).toEqual('image/jpeg')
  })

  it('returns mimetype for .jpeg image file extension', () => {
    const mimeType = getMimeTypeForFileName('test.jpeg')
    expect(mimeType).toEqual('image/jpeg')
  })

  it('returns default mimetype for .msg email file extension', () => {
    const mimeType = getMimeTypeForFileName('test.msg')
    expect(mimeType).toEqual('application/octet-stream')
  })

  it('returns default mimetype for .eml email file extension', () => {
    const mimeType = getMimeTypeForFileName('test.eml')
    expect(mimeType).toEqual('application/octet-stream')
  })

  it('returns default mimetype for unmatched file extension', () => {
    const mimeType = getMimeTypeForFileName('test.ppt')
    expect(mimeType).toEqual('application/octet-stream')
  })

  it('returns default mimetype where filename has no extension', () => {
    const mimeType = getMimeTypeForFileName('test')
    expect(mimeType).toEqual('application/octet-stream')
  })

  it('returns correct mimetype for actual extension where filename has multiple dots', () => {
    const mimeType = getMimeTypeForFileName('test.something.pdf')
    expect(mimeType).toEqual('application/pdf')
  })

  it('returns correct mimetype for filename with spaces etc', () => {
    const mimeType = getMimeTypeForFileName('Weeknote 42 – Friday 4.March.2022.pdf')
    expect(mimeType).toEqual('application/pdf')
  })
})
