// A full document fallback is reserved for known offline navigation. Online
// navigation remains under Next's router, including search/history handling.
export function needsOfflineDocument() {
  return !navigator.onLine && Boolean(navigator.serviceWorker?.controller);
}
