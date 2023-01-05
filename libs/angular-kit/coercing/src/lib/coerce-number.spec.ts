import { coerceNumber } from './coerce-number';

describe('coerceNumber', () => {
  it('should coerce a number value', () => {
    expect(coerceNumber(1)).toBe(1);
    expect(coerceNumber(0)).toBe(0);
  });

  it('should coerce a string value', () => {
    expect(coerceNumber('1')).toBe(1);
    expect(coerceNumber('0')).toBe(0);
  });

  it('should coerce a null value', () => {
    expect(coerceNumber(null)).toBe(0);
  });

  it('should coerce an undefined value', () => {
    expect(coerceNumber(undefined)).toBe(0);
  });

  it('should return the fallback value if the provided value can not be coerced', () => {
    expect(coerceNumber('test', 1)).toBe(1);
  });

  it('should return the fallback when value is null and a fallback is given', () => {
    expect(coerceNumber(null, 10)).toBe(10);
  });

  it('should return the fallback when value is undefined and a fallback is given', () => {
    expect(coerceNumber(undefined, 10)).toBe(10);
  });
});
