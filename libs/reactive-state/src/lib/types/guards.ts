import { Observable } from 'rxjs';
import { ProjectStateFn } from './project-state-fn';

export function isFunction(arg: any): arg is Function {
    return typeof arg === 'function';
}

export function isObject(arg: any): arg is object {
    return typeof arg === 'object' && !Array.isArray(arg) && arg !== null && arg !== undefined;
}

export function isProjectStateFn<T>(arg: any): arg is ProjectStateFn<T> {
    return isFunction(arg);
}

export function isPartialOfObservables<T extends object>(
    arg: any
): arg is Partial<{ [P in keyof T]: Observable<T[P]> }> {
    if (!isObject(arg)) {
        return false;
    }

    for (const key in arg) {
        // eslint-disable-next-line no-prototype-builtins
        if (arg.hasOwnProperty(key)) {
            // @ts-ignore
            if (!('subscribe' in arg[key])) {
                return false;
            }
        }
    }

    return true;
}
