import { getMimeTypeForFileName } from './getMimeTypeForFileName'

describe('getMimeTypeForFileName', () => {
  it('returns a matched file extension', () => {
    const mimeType = getMimeTypeForFileName('test.pdf')
    expect(mimeType).toEqual('application/pdf')
  })

  it('returns a default file extension if unmatched', () => {
    const mimeType = getMimeTypeForFileName('test.ppt')
    expect(mimeType).toEqual('application/octet-stream')
  })

  it('returns a default file extension filename has no extension', () => {
    const mimeType = getMimeTypeForFileName('test')
    expect(mimeType).toEqual('application/octet-stream')
  })
})
