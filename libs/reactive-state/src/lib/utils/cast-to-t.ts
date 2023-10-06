import { map, pipe } from "rxjs";

/**
 * Helper function to cast a value to T for TypeScript
 */
export const castToT = <T>() =>
    pipe(
        map((v) => v as T)
    );