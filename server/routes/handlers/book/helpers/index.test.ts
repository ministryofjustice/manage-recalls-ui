import { addErrorsToDocuments } from './index'
import { ApiRecallDocument } from '../../../../@types/manage-recalls-api/models/ApiRecallDocument'

describe('Upload document helpers', () => {
  describe('addErrorsToDocuments', () => {
    it('adds errors to documents', () => {
      const errors = [
        {
          name: ApiRecallDocument.category.PART_A_RECALL_REPORT,
          fileName: 'part_a.pdf',
          text: 'part_a.pdf - an error occurred during upload',
          href: '#1',
        },
        {
          name: ApiRecallDocument.category.PRE_SENTENCING_REPORT,
          fileName: 'pre_sentencing.pdf',
          text: 'pre_sentencing.pdf - an error occurred during upload',
          href: '#2',
        },
      ]
      const documents = addErrorsToDocuments(errors)
      const partAdoc = documents.find(doc => doc.name === ApiRecallDocument.category.PART_A_RECALL_REPORT)
      const preSentencingDoc = documents.find(doc => doc.name === ApiRecallDocument.category.PRE_SENTENCING_REPORT)
      expect(partAdoc.error).toEqual(errors[0].text)
      expect(preSentencingDoc.error).toEqual(errors[1].text)
    })
  })
})
