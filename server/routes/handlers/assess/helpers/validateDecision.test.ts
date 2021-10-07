import { validateDecision } from './validateDecision'

describe('validateDecision', () => {
  it('returns valuesToSave and no errors if Yes + detail is submitted', () => {
    const requestBody = {
      agreeWithRecall: 'YES',
      agreeWithRecallDetailYes: 'reason 1; reason 2',
    }
    const { errors, valuesToSave } = validateDecision(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      agreeWithRecall: 'YES',
      agreeWithRecallDetail: 'reason 1; reason 2',
    })
  })

  it('returns valuesToSave, redirect, and no errors if No + detail is submitted', () => {
    const requestBody = {
      agreeWithRecall: 'NO_STOP',
      agreeWithRecallDetailNo: 'reason 3; reason 4',
    }
    const { errors, valuesToSave, redirectToPage } = validateDecision(requestBody)
    expect(errors).toBeUndefined()
    expect(valuesToSave).toEqual({
      agreeWithRecall: 'NO_STOP',
      agreeWithRecallDetail: 'reason 3; reason 4',
    })
    expect(redirectToPage).toEqual('assess-stop')
  })

  it('returns an error for the Yes / No decision, if not set', () => {
    const { errors, valuesToSave } = validateDecision({})
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
    const { errors, valuesToSave } = validateDecision({ agreeWithRecall: 'YES' })
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
    const { errors, valuesToSave } = validateDecision({ agreeWithRecall: 'NO_STOP' })
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
