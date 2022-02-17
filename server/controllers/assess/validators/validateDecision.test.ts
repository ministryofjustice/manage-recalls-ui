import { validateDecision } from './validateDecision'

describe('validateDecision', () => {
  const urlInfo = { basePath: '/recalls/', currentPage: 'assess-decision' }

  it('returns valuesToSave, redirect, and no errors if Yes + detail is submitted', () => {
    const requestBody = {
      agreeWithRecall: 'YES',
      agreeWithRecallDetailYes: 'reason 1; reason 2',
    }
    const { errors, valuesToSave, redirectToPage } = validateDecision({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      agreeWithRecall: 'YES',
      agreeWithRecallDetail: 'reason 1; reason 2',
    })
    expect(redirectToPage).toEqual('/recalls/assess-licence')
  })

  it('redirects to assess licence page if Yes is submitted, even if fromPage is set', () => {
    const requestBody = {
      agreeWithRecall: 'YES',
      agreeWithRecallDetailYes: 'reason 1; reason 2',
    }
    const { redirectToPage } = validateDecision({
      requestBody,
      urlInfo: { ...urlInfo, fromPage: 'view-recall' },
    })
    expect(redirectToPage).toEqual('/recalls/assess-licence?fromPage=view-recall')
  })

  it('returns valuesToSave, redirect, and no errors if No + detail is submitted', () => {
    const requestBody = {
      agreeWithRecall: 'NO_STOP',
      agreeWithRecallDetailNo: 'reason 3; reason 4',
    }
    const { errors, valuesToSave, redirectToPage } = validateDecision({ requestBody, urlInfo })
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      agreeWithRecall: 'NO_STOP',
      agreeWithRecallDetail: 'reason 3; reason 4',
    })
    expect(redirectToPage).toEqual('/recalls/assess-stop')
  })

  it('returns an error for the Yes / No decision, if not set', () => {
    const { errors, valuesToSave } = validateDecision({ requestBody: {}, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#agreeWithRecall',
        name: 'agreeWithRecall',
        text: 'Do you agree with the recall recommendation?',
      },
    ])
  })

  it('returns an error for Yes detail, if not set', () => {
    const { errors, valuesToSave } = validateDecision({ requestBody: { agreeWithRecall: 'YES' }, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#agreeWithRecallDetailYes',
        name: 'agreeWithRecallDetailYes',
        text: 'Provide more detail',
      },
    ])
  })

  it('returns an error for No detail, if not set', () => {
    const { errors, valuesToSave } = validateDecision({ requestBody: { agreeWithRecall: 'NO_STOP' }, urlInfo })
    expect(valuesToSave).toBeUndefined()
    expect(errors).toEqual([
      {
        href: '#agreeWithRecallDetailNo',
        name: 'agreeWithRecallDetailNo',
        text: 'Provide more detail',
      },
    ])
  })
})
