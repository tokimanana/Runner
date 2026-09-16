type DeepDateToString<T> = T extends Date
  ? string
  : T extends (infer U)[]
    ? DeepDateToString<U>[]
    : T extends object
      ? { [K in keyof T]: DeepDateToString<T[K]> }
      : T;

export function serializeDates<T>(value: T): DeepDateToString<T> {
  if (value instanceof Date) {
    return value.toISOString() as DeepDateToString<T>;
  }

  if (Array.isArray(value)) {
    return (value as unknown[]).map((item) =>
      serializeDates(item),
    ) as DeepDateToString<T>;
  }

  if (value !== null && typeof value === 'object') {
    const result: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      result[key] = serializeDates(val);
    }
    return result as DeepDateToString<T>;
  }

  return value as DeepDateToString<T>;
}
