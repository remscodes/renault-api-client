export type Nullable<T> =
  | T
  | null

export type Optional<T> =
  | T
  | undefined

export type PartialBy<T, P extends keyof T> =
  & Omit<T, P>
  & Partial<Pick<T, P>>

export type Prefixed<prefix extends string> = `${prefix}${string}`
