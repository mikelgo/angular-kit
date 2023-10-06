export function isKeyOf<O>(k: unknown): k is keyof O {
    const typeofK = typeof k;
    return (
        k !== null &&
        k !== undefined &&
        ['string', 'symbol', 'number'].includes(typeofK)
    );
}