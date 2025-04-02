import KSUID from 'ksuid'

export function validateKsuid(ksuid: string): boolean {
  try {
    const parseKsuid = KSUID.parse(ksuid) // Parse the KSUID string
    const isValid = KSUID.isValid(parseKsuid.raw)
    return isValid
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // If parsing fails, it's not a valid KSUID
    return false
  }
}
