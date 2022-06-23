export function enumFromStringValue<T>(
  enumeration: { [s: string]: T },
  value: string
): T | undefined {
  return (Object.values(enumeration) as unknown as string[]).includes(value)
    ? (value as unknown as T)
    : undefined
}
