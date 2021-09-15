import { mandatoryDocErrors } from './index'
import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'
import { FileDataBase64 } from '../../../../@types'

describe('Upload document helpers', () => {
  describe('mandatoryDocErrors', () => {
    it("lists out mandatory docs that aren't in the uploaded files", () => {
      const files = [
        {
          category: ApiRecallDocument.category.PART_A_RECALL_REPORT,
        },
        {
          category: ApiRecallDocument.category.PRE_SENTENCING_REPORT,
        },
      ] as unknown as FileDataBase64[]
      const errors = mandatoryDocErrors(files)
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
      const files = [] as unknown as FileDataBase64[]
      const errors = mandatoryDocErrors(files)
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
  })
})
