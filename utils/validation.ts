export function isValidPhone(phone: string): boolean {
  return /^\+?[1-9]\d{6,14}$/.test(phone);
}

export function isValidOTP(code: string): boolean {
  return /^\d{4}$/.test(code);
}

export function isValidPrice(price: number): boolean {
  return price > 0 && Number.isFinite(price);
}
