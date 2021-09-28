import { PhoneNumberUtil } from 'google-libphonenumber'

const validEmailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/

export const isEmailValid = (email: string) => validEmailRegex.test(email)

export const isPhoneValid = (phone: string) => {
  try {
    const phoneUtil = PhoneNumberUtil.getInstance()
    return phoneUtil.isValidNumberForRegion(phoneUtil.parse(phone, 'GB'), 'GB')
  } catch (err) {
    return false
  }
}

// e.g. 12345A, A12345, AB1234
const validBookingNumberRegexes = [/^\d{5}[A-Z]$/, /^[A-Z]\d{5}$/, /^[A-Z]{2}\d{4}$/]

export const isBookingNumberValid = (bookingNumber: string) =>
  validBookingNumberRegexes.some(regex => regex.test(bookingNumber))

// e.g. A1234AB
const validNomsNumberRegex = /^[A-Z]\d{4}[A-Z]{2}$/

export const isNomsNumberValid = (nomsNumber: string) => validNomsNumberRegex.test(nomsNumber)
