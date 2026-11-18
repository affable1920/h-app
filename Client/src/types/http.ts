type CamelToSnake<S extends string> = S extends `${infer T}${infer U}`
  ? `${T extends Capitalize<T> ? "_" : ""}${Lowercase<T>}${CamelToSnake<U>}`
  : S;

type KeysToSnakeCase<T> = {
  [K in keyof T as CamelToSnake<string & K>]: T[K];
};

export type APIError = {
  message: string;
  code: string;
  statusCode: number;
  details?: unknown;
};

export type IncomingErrorPayload = KeysToSnakeCase<APIError>;
