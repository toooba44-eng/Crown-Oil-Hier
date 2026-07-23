/* Device-aware order destination.
   The "Order now" / "Order your bottle" CTAs should route to:
   - the web store  (../store/)  when browsing from a desktop browser
   - the mobile app (../app/)    when browsing from a phone/tablet

   The showcase page lives at /v1.2/, so the relative "../store/" and
   "../app/" resolve to /store/ and /app/ on any deployment (root or
   GitHub Pages subpath). */

const MOBILE_RE = /Android|iPhone|iPad|iPod|Windows Phone|BlackBerry|Opera Mini|IEMobile|Mobi/i;

/** True when the current visitor is on a phone/tablet. */
export function isMobileDevice() {
  if (typeof navigator === 'undefined') return false;
  // Prefer the modern UA-CH hint, fall back to the UA string, then coarse pointer.
  if (navigator.userAgentData && typeof navigator.userAgentData.mobile === 'boolean') {
    return navigator.userAgentData.mobile;
  }
  if (MOBILE_RE.test(navigator.userAgent || '')) return true;
  if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
    return window.matchMedia('(hover: none) and (pointer: coarse)').matches;
  }
  return false;
}

/** Relative URL of the order destination for this device. */
export function orderHref() {
  return isMobileDevice() ? '../app/' : '../store/';
}
