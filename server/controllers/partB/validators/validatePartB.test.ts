import { DateTime } from 'luxon'
import { validatePartB } from './validatePartB'
import { padWithZeroes } from '../../utils/dates/format'
import { ConfirmationMessageGroup, UrlInfo } from '../../../@types'

describe('validatePartB', () => {
  const requestBody = {
    partBDetails: 'details text',
    partBReceivedDateDay: '05',
    partBReceivedDateMonth: '03',
    partBReceivedDateYear: '2022',
  }
  const filesUploaded = {
    partBFileName: [
      {
        originalname: 'partB.pdf',
        buffer: Buffer.from('def', 'base64'),
        mimetype: 'application/pdf',
      },
    ] as Express.Multer.File[],
    oasysFileName: [
      {
        originalname: 'oasys.pdf',
        buffer: Buffer.from('def', 'base64'),
        mimetype: 'application/pdf',
      },
    ] as Express.Multer.File[],
    emailFileName: [
      {
        originalname: 'email.msg',
        buffer: Buffer.from('def', 'base64'),
        mimetype: 'application/octet-stream',
      },
    ] as Express.Multer.File[],
  }
  const urlInfo: UrlInfo = {
    fromPage: 'view-recall',
    fromHash: 'recallDetails-part-b',
    currentPage: 'part-b',
    basePath: '/recalls/',
  }

  it('returns valuesToSave, a confirmation message, and no errors if all fields are submitted', () => {
    const { errors, unsavedValues, valuesToSave, redirectToPage, confirmationMessage } = validatePartB({
      requestBody,
      filesUploaded,
      uploadFailed: false,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(unsavedValues).toEqual({
      partBDetails: 'details text',
      partBReceivedDateParts: {
        day: '05',
        month: '03',
        year: '2022',
      },
    })
    expect(valuesToSave).toEqual({
      details: 'details text',
      emailFileContent: 'dec=',
      emailFileName: 'email.msg',
      oasysFileContent: 'dec=',
      oasysFileName: 'oasys.pdf',
      partBFileContent: 'dec=',
      partBFileName: 'partB.pdf',
      partBReceivedDate: '2022-03-05',
    })
    expect(redirectToPage).toEqual('/recalls/support-rerelease?fromPage=view-recall&fromHash=recallDetails-part-b')
    expect(confirmationMessage).toEqual({
      heading: 'Part B added',
      pageToDisplayOn: 'view-recall',
      items: [
        {
          link: {
            href: '#uploaded-documents',
            text: 'View',
          },
          text: 'Part B report and OASys uploaded.',
        },
        {
          link: {
            href: '#recallDetails-part-b',
            text: 'View',
          },
          text: 'Part B email and note added.',
        },
        {
          text: 'Re-release recommendation added',
        },
      ],
      bannerType: 'message_group',
    })
  })

  it('returns valuesToSave with subject and details, and no errors if only the optional OASys upload is missing', () => {
    const { errors, valuesToSave, confirmationMessage } = validatePartB({
      requestBody,
      filesUploaded: {
        ...filesUploaded,
        oasysFileName: [],
      },
      uploadFailed: false,
      urlInfo,
    })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      details: 'details text',
      emailFileContent: 'dec=',
      emailFileName: 'email.msg',
      partBFileContent: 'dec=',
      partBFileName: 'partB.pdf',
      partBReceivedDate: '2022-03-05',
    })
    expect((confirmationMessage as ConfirmationMessageGroup).items[0].text).toEqual('Part B report uploaded.')
  })

  it('returns errors if subject and details are missing, and no valuesToSave', () => {
    const { errors, valuesToSave, unsavedValues } = validatePartB({
      requestBody: {},
      filesUploaded: {
        partBFileName: [],
        oasysFileName: [],
        emailFileName: [],
      },
      uploadFailed: false,
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      partBReceivedDateParts: {},
    })
    expect(errors).toEqual([
      {
        href: '#partBFileName',
        name: 'partBFileName',
        text: 'Select a part B',
      },
      {
        href: '#partBDetails',
        name: 'partBDetails',
        text: 'Provide more detail',
      },
      {
        href: '#partBReceivedDate-partBReceivedDateDay',
        name: 'partBReceivedDate',
        text: 'Enter the date you received the part B',
        values: {},
      },
      {
        href: '#emailFileName',
        name: 'emailFileName',
        text: 'Select a part B email from probation',
      },
    ])
  })

  it('returns an error if the file upload was tried and failed', () => {
    const { errors } = validatePartB({
      requestBody,
      filesUploaded: {
        partBFileName: [],
        oasysFileName: [],
        emailFileName: [],
      },
      uploadFailed: true,
      urlInfo,
    })
    expect(errors).toEqual([
      {
        name: 'uploadError',
        text: 'An error occurred uploading the files',
      },
    ])
  })

  it('returns errors if the uploaded file types are invalid', () => {
    const { errors, valuesToSave, unsavedValues } = validatePartB({
      requestBody,
      filesUploaded: {
        partBFileName: [
          {
            originalname: 'partB.doc',
            buffer: Buffer.from('def', 'base64'),
            mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          },
        ] as Express.Multer.File[],
        oasysFileName: [
          {
            originalname: 'oasys.ppt',
            buffer: Buffer.from('def', 'base64'),
            mimetype: 'MS/powerpoint',
          },
        ] as Express.Multer.File[],
        emailFileName: [
          {
            originalname: 'email.exe',
            buffer: Buffer.from('def', 'base64'),
            mimetype: 'application/executable',
          },
        ] as Express.Multer.File[],
      },
      uploadFailed: false,
      urlInfo,
    })
    expect(valuesToSave).toBeUndefined()
    expect(unsavedValues).toEqual({
      partBDetails: 'details text',
      partBReceivedDateParts: {
        day: '05',
        month: '03',
        year: '2022',
      },
    })
    expect(errors).toEqual([
      {
        href: '#partBFileName',
        name: 'partBFileName',
        text: "The selected file 'partB.doc' must be a PDF",
      },
      {
        href: '#oasysFileName',
        name: 'oasysFileName',
        text: "The selected file 'oasys.ppt' must be a PDF",
      },
      {
        href: '#emailFileName',
        name: 'emailFileName',
        text: "The selected file 'email.exe' must be a MSG or EML",
      },
    ])
  })

  it('returns an error if the date is not in the past', () => {
    const { year, month, day } = DateTime.now().plus({ days: 1 })
    const body = {
      partBDetails: 'details text',
      partBReceivedDateDay: padWithZeroes(day),
      partBReceivedDateMonth: padWithZeroes(month),
      partBReceivedDateYear: year.toString(),
    }
    const { errors } = validatePartB({
      requestBody: body,
      filesUploaded,
      uploadFailed: false,
      urlInfo,
    })
    expect(errors).toEqual([
      {
        href: '#partBReceivedDate-partBReceivedDateDay',
        name: 'partBReceivedDate',
        text: 'The date you received the part B must be today or in the past',
        values: {
          day: padWithZeroes(day),
          month: padWithZeroes(month),
          year: padWithZeroes(year),
        },
      },
    ])
  })
})
