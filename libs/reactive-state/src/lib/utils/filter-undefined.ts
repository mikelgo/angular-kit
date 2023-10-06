/**
 * Helper to filter out undefined values and infer type correctly (omit undefined)
 */
export function filterUndefined<T>(arg: T | undefined | null): arg is T {
    return arg !== undefined;
}