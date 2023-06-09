/**
 * @description
 * This transform is a side effecting operation applying `preventDefault` to a passed Event
 * @param e
 */
export function preventDefault(e: Event): Event {
  e.preventDefault();
  return e;
}
