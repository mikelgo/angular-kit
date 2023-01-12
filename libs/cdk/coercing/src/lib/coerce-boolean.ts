import {BooleanType} from "@code-workers.io/angular-kit/cdk/types";


export function coerceBoolean(value: BooleanType | string): boolean {
  if (typeof value === 'string') {
    return `${value}` !== 'false';
  }

  return !!value;
}
