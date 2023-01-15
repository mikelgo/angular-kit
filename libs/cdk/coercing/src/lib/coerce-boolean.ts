import {BooleanType} from "@angular-kit/cdk/types";


export function coerceBoolean(value: BooleanType | string): boolean {
  if (typeof value === 'string') {
    return `${value}` !== 'false';
  }

  return !!value;
}
