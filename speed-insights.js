/**
 * Vercel Speed Insights integration for GUTO TECH
 * This module initializes Speed Insights tracking for the static site
 */
import { injectSpeedInsights } from './node_modules/@vercel/speed-insights/dist/index.mjs';

// Initialize Speed Insights when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    injectSpeedInsights({
      framework: 'vanilla',
      debug: true // Enable debug mode to see console logs during development
    });
  });
} else {
  // DOM is already ready
  injectSpeedInsights({
    framework: 'vanilla',
    debug: true
  });
}
