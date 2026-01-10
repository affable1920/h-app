// TYPESCRIPT UTILITY TYPE FUNDAMENTALS

// 1. CONDITIONAL TYPES - The Foundation
// Pattern: T extends U ? X : Y
type IsString<T> = T extends string ? true : false;
type Test1 = IsString<"hello">; // true
type Test2 = IsString<number>; // false

// 2. GENERIC CONSTRAINTS
// Pattern: T extends SomeType
type OnlyStrings<T extends string> = T;
type Valid = OnlyStrings<"hello">; // ✅ works
// type Invalid = OnlyStrings<number>; // ❌ error

// 3. KEYOF OPERATOR - Extract keys
type User = { name: string; age: number; email: string };
type UserKeys = keyof User; // "name" | "age" | "email"

// 4. INDEXED ACCESS TYPES - Extract values
type UserName = User["name"]; // string
type UserValues = User[keyof User]; // string | number

// 5. MAPPED TYPES - Transform all properties
type Optional<T> = {
  [K in keyof T]?: T[K]; // Make all properties optional
};
type PartialUser = Optional<User>; // { name?: string; age?: number; email?: string }

// 6. TEMPLATE LITERAL TYPES
type EventName<T extends string> = `on${Capitalize<T>}`;
type ClickEvent = EventName<"click">; // "onClick"

// 7. UTILITY TYPE PATTERNS

// A. Type Checking Utilities
export type IsArray<T> = T extends any[] ? true : false;
export type IsFunction<T> = T extends (...args: any[]) => any ? true : false;
export type IsObject<T> = T extends object ? true : false;

// B. Type Extraction Utilities
export type ArrayElement<T> = T extends (infer U)[] ? U : never;
export type ReturnType<T> = T extends (...args: any[]) => infer R ? R : never;
export type Parameters<T> = T extends (...args: infer P) => any ? P : never;

// C. Type Filtering Utilities
export type NonNullable<T> = T extends null | undefined ? never : T;
export type StringKeys<T> = {
  [K in keyof T]: T[K] extends string ? K : never;
}[keyof T];

// D. Type Construction Utilities
export type Pick<T, K extends keyof T> = {
  [P in K]: T[P];
};
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;

// 8. ADVANCED PATTERNS

// A. Recursive Types
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// B. Union to Intersection
type UnionToIntersection<U> = 
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

// C. Tuple to Union
type TupleToUnion<T extends readonly any[]> = T[number];

// 9. PRACTICAL EXAMPLES FOR YOUR ERROR TYPES

// Pattern 1: Type Checking
export type HasProperty<T, K extends string> = K extends keyof T ? true : false;

// Pattern 2: Property Extraction
export type GetProperty<T, K extends keyof T> = T[K];

// Pattern 3: Conditional Property Access
export type SafeGet<T, K extends string> = K extends keyof T ? T[K] : undefined;

// Pattern 4: Error Type Utilities
export type ErrorWithCode<T> = T extends { code: infer C } ? C : never;
export type ErrorMessage<T> = T extends { message: infer M } ? M : string;

// Pattern 5: API Response Utilities
export type APISuccess<T> = T extends { data: infer D } ? D : never;
export type APIError<T> = T extends { error: infer E } ? E : never;

// 10. BUILDING YOUR VALIDATION ERROR UTILITIES

// Step 1: Define the base structure
type ValidationErrorBase = {
  loc: string[];
  msg: string;
  type: string;
};

// Step 2: Create checking utilities
export type IsValidationErrorType<T> = T extends ValidationErrorBase ? true : false;

// Step 3: Create extraction utilities
export type ValidationErrorLocation<T> = T extends { loc: infer L } ? L : never;
export type ValidationErrorMessage<T> = T extends { msg: infer M } ? M : never;

// Step 4: Create filtering utilities
export type OnlyValidationErrors<T> = T extends ValidationErrorBase ? T : never;

// Step 5: Create transformation utilities
export type ValidationErrorSummary<T> = T extends ValidationErrorBase 
  ? { message: T["msg"]; field: T["loc"][0] }
  : never;

// 11. COMMON PATTERNS CHEAT SHEET

// Check if type extends another: T extends U ? true : false
// Extract from union: T extends any ? (T extends U ? T : never) : never
// Get array element: T extends (infer U)[] ? U : never
// Get function return: T extends (...args: any[]) => infer R ? R : never
// Make optional: { [K in keyof T]?: T[K] }
// Make required: { [K in keyof T]-?: T[K] }
// Filter keys: { [K in keyof T]: T[K] extends U ? K : never }[keyof T]
// Exclude keys: Exclude<keyof T, K>
// Pick properties: { [P in K]: T[P] }

// 12. DEBUGGING UTILITY TYPES
// Use these to understand what your types resolve to:
type Debug<T> = T extends infer U ? { [K in keyof U]: U[K] } : never;
type Expand<T> = T extends (...args: infer A) => infer R
  ? (...args: Expand<A>) => Expand<R>
  : T extends infer O
  ? { [K in keyof O]: O[K] }
  : never;

export type DebugValidationError<T> = Debug<IsValidationErrorType<T>>;