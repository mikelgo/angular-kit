/** Type describing the allowed values for a boolean Type. */
export type BooleanType = string | boolean | null | undefined;

/** Type describing the allowed values for a string Type. */
export type StringType = string | null | undefined;

/** Type describing the allowed values for a number Type. */
export type NumberType = number | null | undefined;

/** Type describing the allowed values for a date Type. */
export type DateType = Date | string | number | null | undefined;

/** Type describing the allowed values for an array Type. */
export type ArrayType<T> = T[] | null | undefined;

/** Type describing the allowed values for an object Type. */
export type ObjectType<T> = T | null | undefined;

export type Nullable<T> = T | null;

export type Undefinable<T> = T | undefined;

export type Optional<T> = T | null | undefined;
