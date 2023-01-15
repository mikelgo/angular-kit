import {merge, ReplaySubject, Subject, throwError} from 'rxjs';
import {KeysOf, RxSignals, ValuesOf} from './types';


// eslint-disable-next-line @typescript-eslint/ban-types
export function actionProxyHandler<T extends object, U extends {}>(
  subjects: { [K in keyof T]: Subject<ValuesOf<T>> },
  transforms?: U,
): ProxyHandler<RxSignals<T, U>> {
  type KeysOfT = KeysOf<T>;
  type ValuesOfT = ValuesOf<T>;

  function dispatch(value: ValuesOfT, prop: KeysOfT) {
    subjects[prop] = subjects[prop] || createSubject<ValuesOfT>();
    try {
      const val =
        transforms && (transforms as any)[prop]
          ? (transforms as any)[prop](value)
          : value;
      subjects[prop].next(val);
    } catch (err) {
      throwError(() => err)
    }
  }
  type K = keyof T;
  return {
    // shorthand setter for multiple signals e.g. signals({propA: 1, propB: 2})
    apply(_: RxSignals<T, U>, __: any, props: [T]): any {
      props.forEach((slice) =>
        Object.entries(slice).forEach(([k, v]) =>
          dispatch(v as any, k as any as KeysOfT)
        )
      );
    },
    get(_, property: string) {
      const prop = property as KeysOfT;

      // the user wants to get a single signal as observable
      if (prop.toString().split('').pop() === '$') {
        if(prop.toString().length === 1) {
          return (props: KeysOfT[]) => merge(
              ...props.map((k) => {
                subjects[k] = subjects[k] || createSubject<ValuesOfT>();
                return subjects[k];
              })
            );
        }

        const propName = prop.toString().slice(0, -1) as KeysOfT;
        subjects[propName] = subjects[propName] || createSubject<ValuesOfT>();
        return subjects[propName];
      }

      // the user wants to get a dispatcher function
      return (args: ValuesOfT) => {
        dispatch(args, prop);
      };
    },
    set() {
      throw new Error('No setters available. To emit execute the function');
    },
  };
}

function createSubject<T>(): Subject<T> {
  return new ReplaySubject<T>(1);
}
