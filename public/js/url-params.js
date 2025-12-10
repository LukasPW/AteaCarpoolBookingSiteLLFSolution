/**
 * ===============================
 * URL PARAMS MODULE - url-params.js
 * ===============================
 * 
 * Handles URL parameter management for filter state persistence
 * - Convert dates between ISO and URL-friendly format
 * - Read/write filter state to URL query parameters
 * - Enable shareable filtered views
 */

/**
 * Convert ISO datetime to readable URL format: YYYYMMDD-HHMM
 * Examples:
 *  - "2025-12-20T15:30" -> "20251220-1530"
 *  - "2025-01-05T09:00" -> "20250105-0900"
 * @param {string} isoString - ISO format datetime string
 * @returns {string|null} URL format date string, or null if invalid
 */
function dateToUrlFormat(isoString) {
    if (!isoString) return null;
    const date = new Date(isoString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}${month}${day}-${hours}${minutes}`;
}

/**
 * Convert URL format back to ISO datetime: YYYYMMDD-HHMM -> YYYY-MM-DDTHH:MM
 * Examples:
 *  - "20251220-1530" -> "2025-12-20T15:30"
 *  - "20250105-0900" -> "2025-01-05T09:00"
 * @param {string} urlString - URL format date string
 * @returns {string|null} ISO format datetime string, or null/original if invalid
 */
function urlFormatToDate(urlString) {
    if (!urlString) return null;
    const match = urlString.match(/(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})/);
    if (!match) return urlString; // Return as-is if format doesn't match
    const [, year, month, day, hours, minutes] = match;
    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Parse current URL query parameters into filter state object
 * Returns default empty arrays if parameters are not present
 * @returns {Object} Filter state with start, end, brands, years, seats, fuels arrays
 */
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        start: urlFormatToDate(params.get('start')),
        end: urlFormatToDate(params.get('end')),
        brands: params.get('brands') ? params.get('brands').split(',') : [],
        years: params.get('years') ? params.get('years').split(',') : [],
        seats: params.get('seats') ? params.get('seats').split(',') : [],
        fuels: params.get('fuels') ? params.get('fuels').split(',') : []
    };
}

/**
 * Update browser URL with current filter state using query parameters
 * Uses history.replaceState to avoid adding new history entries
 * Dates are formatted as YYYYMMDD-HHMM for readability (e.g., 20251220-1530)
 * Empty filter arrays are omitted from URL for cleanliness
 * 
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @param {Array} brands - Selected brand names
 * @param {Array} years - Selected years
 * @param {Array} seats - Selected seat counts
 * @param {Array} fuels - Selected fuel types (full names: Electric, Hybrid, etc.)
 */
function updateUrl(startDate, endDate, brands = [], years = [], seats = [], fuels = []) {
    const params = new URLSearchParams();
    if (startDate) params.set('start', dateToUrlFormat(startDate));
    if (endDate) params.set('end', dateToUrlFormat(endDate));
    if (brands.length > 0) params.set('brands', brands.join(','));
    if (years.length > 0) params.set('years', years.join(','));
    if (seats.length > 0) params.set('seats', seats.join(','));
    if (fuels.length > 0) params.set('fuels', fuels.join(','));
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    window.history.replaceState({}, '', newUrl);
}
