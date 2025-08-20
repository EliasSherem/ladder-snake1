// IMPORTANT: Replace G-XXXXXXXXXX with your actual Google Analytics Measurement ID.
// You can find this ID in your Google Analytics dashboard under Admin > Data Streams.
export const GA_MEASUREMENT_ID = "G-78BY9KK7J0";

// Add gtag to the window interface to avoid TypeScript errors.
declare global {
  interface Window {
    gtag?: (command: 'event', action: string, params?: Record<string, unknown>) => void;
  }
}

/**
 * Sends a custom event to Google Analytics.
 * @param {string} action - The name of the event (e.g., 'start_game').
 * @param {Record<string, unknown>} [params] - Optional parameters to send with the event.
 */
export const trackEvent = (
  action: string,
  params?: Record<string, unknown>
): void => {
  // Check if the gtag function is available. It might be blocked by an ad blocker.
  if (typeof window.gtag === 'function') {
    window.gtag("event", action, params);
  } else {
    // Log to console for debugging if gtag is not available.
    console.log(`Analytics Event (gtag not found): ${action}`, params);
  }
};
