export type DefaultDataContract = {
  SALE_PRICE: string
  WL_PRICE: string
  MAX_TX: number
  MAX_WL_TX: number
  MAX_WL_SUPPLY: number
  MAX_SUPPLY: number
  WHITELIST: string
}

export const defaultDataContract: DefaultDataContract = {
  SALE_PRICE: '0',
  WL_PRICE: '0',
  MAX_TX: 0,
  MAX_WL_TX: 0,
  MAX_WL_SUPPLY: 0,
  MAX_SUPPLY: 0,
  WHITELIST: '[]',
}

export function formatAddress(value: string, length: number = 4) {
  return `${value.substring(0, length + 1)}...${value.substring(value.length - length)}`
}

export const getDefaultDataContract = async (): Promise<DefaultDataContract> => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    const res = await fetch(process.env.NEXT_PUBLIC_API_URL)
    const result = await res.json()
    return result.data
  }
  return defaultDataContract
}