import { coerceBoolean } from './coerce-boolean';

describe('coerceBoolean', () => {
  it('should coerce a boolean value', () => {
    expect(coerceBoolean(true)).toBe(true);
    expect(coerceBoolean(false)).toBe(false);
  });

  it('should coerce a string value', () => {
    expect(coerceBoolean('true')).toBe(true);
    expect(coerceBoolean('false')).toBe(false);
  });

  it('should coerce a null value', () => {
    expect(coerceBoolean(null)).toBe(false);
  });

  it('should coerce an undefined value', () => {
    expect(coerceBoolean(undefined)).toBe(false);
  });
});
