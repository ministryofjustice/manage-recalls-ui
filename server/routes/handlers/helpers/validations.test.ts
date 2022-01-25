import { isEmailValid, isPhoneValid, isBookingNumberValid, isNomsNumberValid, normalisePostcode } from './validations'

describe('Validations', () => {
  describe('isEmailValid', () => {
    it('fails if domain suffix missing', () => {
      expect(isEmailValid('dave@probation')).toEqual(false)
    })

    it('fails if @ missing', () => {
      expect(isEmailValid('daveprobation.gov.uk')).toEqual(false)
    })

    it('passes if valid', () => {
      expect(isEmailValid('dave@probation.gov.uk')).toEqual(true)
    })
  })

  describe('isPhoneValid', () => {
    it('fails if it has a non-UK prefix', () => {
      expect(isPhoneValid('0011277231432')).toEqual(false)
    })

    it('passes if it has a UK prefix and no leading zero following that', () => {
      expect(isPhoneValid('00441277231432')).toEqual(true)
    })

    it('passes if it has a UK prefix and a leading zero following that', () => {
      expect(isPhoneValid('004401277231432')).toEqual(true)
    })

    it('passes if it has a UK prefix for a mobile number', () => {
      expect(isPhoneValid('004407934526353')).toEqual(true)
    })

    it('passes if it has a mobile number without UK prefix', () => {
      expect(isPhoneValid('07934526353')).toEqual(true)
    })

    it('passes if it has a mobile number without zero prefix', () => {
      expect(isPhoneValid('7934526353')).toEqual(true)
    })
  })

  describe('isBookingNumberValid', () => {
    it('fails for the wrong format', () => {
      expect(isBookingNumberValid('231')).toEqual(false)
    })

    it('passes for format 12345A', () => {
      expect(isBookingNumberValid('12345A')).toEqual(true)
    })

    it('passes for format A12345', () => {
      expect(isBookingNumberValid('A12345')).toEqual(true)
    })

    it('passes for format AB1234', () => {
      expect(isBookingNumberValid('AB1234')).toEqual(true)
    })
  })

  describe('isNomsNumberValid', () => {
    it('fails for the wrong format', () => {
      expect(isNomsNumberValid('ABC')).toEqual(false)
    })

    it('passes for format A1234AB', () => {
      expect(isNomsNumberValid('A1234AB')).toEqual(true)
    })
  })

  describe('normalizePostcode', () => {
    it('removes whitespace', () => {
      expect(normalisePostcode('  S1A 1AA  ')).toEqual('S1A 1AA')
    })

    it('removes hyphens', () => {
      expect(normalisePostcode('  SW1A-1AA-  ')).toEqual('SW1A 1AA')
    })

    it('removes underscores', () => {
      expect(normalisePostcode('  M1_1AA-  ')).toEqual('M1 1AA')
    })

    it('removes full stops', () => {
      expect(normalisePostcode('  .SW1A_1AA-  ')).toEqual('SW1A 1AA')
    })

    it('converts to uppercase and inserts a space', () => {
      expect(normalisePostcode('dt34by')).toEqual('DT3 4BY')
    })
  })
})
