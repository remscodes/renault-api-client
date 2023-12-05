export type Optional<T> =
  | T
  | undefined

export type PartialBy<T, P extends keyof T> =
  & Omit<T, P>
  & Partial<Pick<T, P>>

export type PrefixWith<prefix extends string> = `${prefix}${string}`

export type MethodsOf<T> = {
  [P in keyof T as T[P] extends Function ? P : never]: T[P];
}
