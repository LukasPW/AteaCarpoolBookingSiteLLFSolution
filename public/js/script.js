/**
 * =====================================
 * MAIN BOOKING APPLICATION - script.js
 * =====================================
 * 
 * Main coordinator for the booking page
 * Loads car data and initializes the application
 * 
 * Dependencies:
 *  - utils.js: Shared constants and utilities
 *  - auth.js: User authentication and menu
 *  - url-params.js: URL parameter management
 *  - filters.js: Filter panel functionality
 *  - cars.js: Car rendering and availability
 */

// ===== GLOBAL STATE =====
let carsData = [];
let selectedStartDate = null;
let selectedEndDate = null;
const API_BASE = 'http://localhost:5000/api';


/**
 * Fetch cars from JSON file and initialize the application
 * If URL contains filter parameters, restores those filters automatically
 * This is called on page load via DOMContentLoaded event
 */
async function loadCars() {
    try {
        const response = await fetch(`${API_BASE}/cars`, { credentials: 'include' });
        if (!response.ok) throw new Error('Network response was not ok');
        carsData = await response.json();
        // Check if we need to restore state from URL
        const urlParams = getUrlParams();
        
        if (urlParams.start && urlParams.end) {
            document.getElementById('startTime').value = urlParams.start;
            document.getElementById('endTime').value = urlParams.end;
            checkDatesAndShowCars();
            
            // Restore filter selections from URL
            setTimeout(() => restoreFiltersFromUrl(urlParams), 100);
        }
    } catch (error) {
        document.getElementById('carsGrid').innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 40px;">Error loading cars data</p>';
    }
}

/**
 * Validate date inputs and control visibility of filters panel
 * Requirements:
 *  - Both start and end dates must be selected
 *  - End date must be after start date
 * When valid, shows the filters panel and renders available cars
 * Also updates URL with the selected dates
 * @returns {boolean} true if dates are valid, false otherwise
 */
function checkDatesAndShowCars() {
    const startTime = document.getElementById('startTime');
    const endTime = document.getElementById('endTime');
    const carsGrid = document.getElementById('carsGrid');
    const filtersPanel = document.querySelector('.filters-panel');
    const emptyState = document.getElementById('emptyState');
    
    if (!startTime.value || !endTime.value) {
        // Show friendly empty state when no dates are chosen
        if (emptyState) emptyState.style.display = 'block';
        carsGrid.innerHTML = '';
        filtersPanel.style.display = 'none';
        return false;
    }
    
    selectedStartDate = new Date(startTime.value);
    selectedEndDate = new Date(endTime.value);
    
    if (selectedStartDate >= selectedEndDate) {
        carsGrid.innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 40px;">End date must be after start date</p>';
        filtersPanel.style.display = 'none';
        return false;
    }

    // Hide empty state once dates are valid
    if (emptyState) emptyState.style.display = 'none';
    
    // Update URL with dates
    const brandFilter = Array.from(document.querySelectorAll('#brandDropdown input[type="checkbox"]:checked')).map(cb => cb.value);
    const yearFilter = Array.from(document.querySelectorAll('#yearDropdown input[type="checkbox"]:checked')).map(cb => cb.value);
    const seatsFilter = Array.from(document.querySelectorAll('#seatsDropdown input[type="checkbox"]:checked')).map(cb => cb.value);
    const fuelFilter = Array.from(document.querySelectorAll('#fuelDropdown input[type="checkbox"]:checked')).map(cb => cb.value);
    updateUrl(startTime.value, endTime.value, brandFilter, yearFilter, seatsFilter, fuelFilter);
    
    // Show filters panel when both dates are valid
    filtersPanel.style.display = 'block';
    populateFilterOptions();
    renderCars();
    return true;
}

// Event listeners
document.getElementById('clearFilters').addEventListener('click', clearFilters);

// Listen for date changes
document.getElementById('startTime').addEventListener('change', checkDatesAndShowCars);
document.getElementById('endTime').addEventListener('change', checkDatesAndShowCars);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const user = requireAuth();
    if (!user) return;
    loadCars();
    initUserMenu();
});
