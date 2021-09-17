import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { FileDataBase64 } from '../../../../@types'
import { validateUploadDocuments } from './validateUploadDocuments'

describe('validateUploadDocuments', () => {
  it("lists out mandatory docs that aren't in the uploaded files", () => {
    const fileData = [
      {
        category: ApiRecallDocument.category.PART_A_RECALL_REPORT,
        fileName: 'Wesley Holt part a.pdf',
        label: 'Part A',
        fileContent: 'abc',
      },
      {
        category: ApiRecallDocument.category.PRE_SENTENCING_REPORT,
        fileName: 'Wesley Holt psr.pdf',
        label: 'PSR',
        fileContent: 'def',
      },
    ] as unknown as FileDataBase64[]
    const { errors } = validateUploadDocuments({ fileData, requestBody: {} })
    expect(errors).toEqual([
      {
        href: '#LICENCE',
        name: 'LICENCE',
        text: 'Licence',
      },
      {
        href: '#PREVIOUS_CONVICTIONS_SHEET',
        name: 'PREVIOUS_CONVICTIONS_SHEET',
        text: 'Previous convictions sheet',
      },
    ])
  })

  it('lists out all mandatory docs if there are no uploaded files', () => {
    const fileData = [] as unknown as FileDataBase64[]
    const { errors } = validateUploadDocuments({ fileData, requestBody: {} })
    expect(errors).toEqual([
      {
        href: '#PART_A_RECALL_REPORT',
        name: 'PART_A_RECALL_REPORT',
        text: 'Part A recall report',
      },
      {
        href: '#LICENCE',
        name: 'LICENCE',
        text: 'Licence',
      },
      {
        href: '#PREVIOUS_CONVICTIONS_SHEET',
        name: 'PREVIOUS_CONVICTIONS_SHEET',
        text: 'Previous convictions sheet',
      },
      {
        href: '#PRE_SENTENCING_REPORT',
        name: 'PRE_SENTENCING_REPORT',
        text: 'Pre-sentencing report',
      },
    ])
  })

  it('excludes already saved documents from the error list', () => {
    const fileData = [
      {
        category: ApiRecallDocument.category.PART_A_RECALL_REPORT,
        fileName: 'Wesley Holt part a.pdf',
        label: 'Part A',
        fileContent: 'abc',
      },
    ] as unknown as FileDataBase64[]
    const { errors } = validateUploadDocuments({ fileData, requestBody: { LICENCE: 'existingUpload' } })
    expect(errors).toEqual([
      {
        href: '#PREVIOUS_CONVICTIONS_SHEET',
        name: 'PREVIOUS_CONVICTIONS_SHEET',
        text: 'Previous convictions sheet',
      },
      {
        href: '#PRE_SENTENCING_REPORT',
        name: 'PRE_SENTENCING_REPORT',
        text: 'Pre-sentencing report',
      },
    ])
  })
})
