/**
 * @internal
 * Checks if the browser supports IntersectionObserver.
 */
export function supportsIntersectionObserver() {
  return typeof window.IntersectionObserver !== 'undefined';
}
