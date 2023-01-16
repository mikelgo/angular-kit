# @code-workers-io/angular-kit/types

Tired of writing e.g. `@Input() arg: string | null | undefined` over and over again when using Angular's strict mode?

`@code-workers-io/angular-kit/types` to the rescue! This handy lib provides a collection of types which will reflect strict inputs.

## Supported types

- `StringType`
- `NumberType`
- `BooleanType`
- `DateType`
- `ArrayType`
- `ObjectType`
- `Nullable<T>`: `T | null`
- `Undefinable<T>`: `T | undefined`
- `Optional<T>`: `T | null |undefined`

## Util types
- `KeysOf`: Get the keys of an object type
- `ValuesOf`: Get the values of an object type
