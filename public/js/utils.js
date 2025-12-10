/**
 * ===========================
 * UTILS MODULE - utils.js
 * ===========================
 * 
 * Shared constants and utility functions used across the application
 * - Fuel type mappings (icons and codes)
 * - Date/time formatting utilities
 */

/**
 * Maps full fuel type names to icon file paths
 * Used for displaying fuel type icons on car cards
 */
const FUEL_ICONS = {
    'Electric': 'public/ElectricCar.png',
    'Hybrid': 'public/HybridCar.png',
    'Gasoline': 'public/GasolineCar.png',
    'Diesel': 'public/GasolineCar.png'
};

/**
 * Maps full fuel type names to short display codes
 * Used for compact fuel type display (E, H, G, D)
 */
const FUEL_MAP = {
    'Electric': 'E',
    'Hybrid': 'H',
    'Gasoline': 'G',
    'Diesel': 'D'
};

/**
 * Format a datetime string into a readable format
 * Input format: ISO datetime (e.g., "2025-12-20T15:30")
 * Output format: "HH:MM DD-MM-YYYY" (e.g., "15:30 20-12-2025")
 * @param {string} dateTimeString - ISO format datetime string
 * @returns {string} Formatted date and time
 */
function formatDateTime(dateTimeString) {
    const date = new Date(dateTimeString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${day}-${month}-${year}`;
}
