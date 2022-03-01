import { NoteDocumentUploadValidatorArgs, NamedFormError, ObjectMap } from '../../../@types'
import { errorMsgNoteFileUpload, errorMsgProvideDetail, makeErrorObject } from '../../utils/errorMessages'

export const validateAddNote = ({
  requestBody,
  fileName,
  uploadFailed,
  invalidFileFormat,
}: NoteDocumentUploadValidatorArgs): {
  errors?: NamedFormError[]
  valuesToSave: { subject: string; details: string }
  unsavedValues: ObjectMap<unknown>
} => {
  let errors
  let valuesToSave
  const { subject, details } = requestBody
  if (uploadFailed || invalidFileFormat || !subject || !details) {
    errors = []
    if (!subject) {
      errors.push(
        makeErrorObject({
          id: 'subject',
          text: errorMsgProvideDetail,
        })
      )
    }
    if (!details) {
      errors.push(
        makeErrorObject({
          id: 'details',
          text: errorMsgProvideDetail,
        })
      )
    }
    if (uploadFailed) {
      errors.push(
        makeErrorObject({
          id: 'fileName',
          text: errorMsgNoteFileUpload.uploadFailed(fileName),
        })
      )
    }
    if (!uploadFailed && invalidFileFormat) {
      errors.push(
        makeErrorObject({
          id: 'fileName',
          text: errorMsgNoteFileUpload.invalidFileFormat(fileName),
        })
      )
    }
  }
  const unsavedValues = {
    subject,
    details,
  }
  if (!errors) {
    valuesToSave = { subject, details }
  }
  return { errors, valuesToSave, unsavedValues }
}
