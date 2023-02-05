export type RunFnExpression< R> = (...args: unknown[]) => R

export type ProviderFn = () => Promise<string>;
