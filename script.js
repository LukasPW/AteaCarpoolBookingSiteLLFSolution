/**
 * =====================================
 * MAIN BOOKING APPLICATION - script.js
 * =====================================
 * 
 * This script handles the main carpool booking interface.
 * It manages:
 *  - Loading and displaying available cars
 *  - Date/time selection and validation
 *  - Multi-filter functionality (brand, year, seats, fuel type)
 *  - URL parameter persistence for shareable filters
 *  - Car availability checking based on booking conflicts
 *  - Responsive car card rendering with sorting
 *
 * Data Flow:
 *  1. Load cars.json on page load
 *  2. Restore filters from URL parameters (if present)
 *  3. User selects start/end dates
 *  4. Filters panel becomes visible
 *  5. User applies filters via checkboxes
 *  6. Cars are sorted (available first, then alphabetically)
 *  7. URL updates with current filter state
 *  8. Clicking a car stores its data and redirects to booking.html
 */

// ===== GLOBAL STATE =====
// Global variable to store cars data
let carsData = [];
let selectedStartDate = null;
let selectedEndDate = null;

// ===== URL PARAMETER MANAGEMENT =====
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        start: params.get('start'),
        end: params.get('end'),
        brands: params.get('brands') ? params.get('brands').split(',') : [],
        years: params.get('years') ? params.get('years').split(',') : [],
        seats: params.get('seats') ? params.get('seats').split(',') : [],
        fuels: params.get('fuels') ? params.get('fuels').split(',') : []
    };
}

/**
 * Update browser URL with current filter state using query parameters
 * Uses history.replaceState to avoid adding new history entries
 * @param {string} startDate - Start date in ISO format
 * @param {string} endDate - End date in ISO format
 * @param {Array} brands - Selected brand names
 * @param {Array} years - Selected years
 * @param {Array} seats - Selected seat counts
 * @param {Array} fuels - Selected fuel types
 */
function updateUrl(startDate, endDate, brands = [], years = [], seats = [], fuels = []) {
    const params = new URLSearchParams();
    if (startDate) params.set('start', startDate);
    if (endDate) params.set('end', endDate);
    if (brands.length > 0) params.set('brands', brands.join(','));
    if (years.length > 0) params.set('years', years.join(','));
    if (seats.length > 0) params.set('seats', seats.join(','));
    if (fuels.length > 0) params.set('fuels', fuels.join(','));
    
    const newUrl = params.toString() ? `?${params.toString()}` : '';
    window.history.replaceState({}, '', newUrl);
}

/**
 * Fetch cars from JSON file and initialize the application
 * If URL contains filter parameters, restores those filters automatically
 * This is called on page load via DOMContentLoaded event
 */
async function loadCars() {
    try {
        const response = await fetch('api/get_cars.php');
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
        console.error('Error loading cars:', error);
        document.getElementById('carsGrid').innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 40px;">Error loading cars data</p>';
    }
}

/**
 * Restore filter checkbox selections based on URL parameters
 * This allows users to share links with pre-applied filters
 * Uses a small timeout to ensure DOM is fully ready
 * @param {Object} urlParams - Object from getUrlParams() containing filter arrays
 */
function restoreFiltersFromUrl(urlParams) {
    // Restore brands
    if (urlParams.brands.length > 0) {
        document.querySelectorAll('#brandDropdown input[type="checkbox"]').forEach(cb => {
            cb.checked = urlParams.brands.includes(cb.value);
        });
    }
    
    // Restore years
    if (urlParams.years.length > 0) {
        document.querySelectorAll('#yearDropdown input[type="checkbox"]').forEach(cb => {
            cb.checked = urlParams.years.includes(cb.value);
        });
    }
    
    // Restore seats
    if (urlParams.seats.length > 0) {
        document.querySelectorAll('#seatsDropdown input[type="checkbox"]').forEach(cb => {
            cb.checked = urlParams.seats.includes(cb.value);
        });
    }
    
    // Restore fuels
    if (urlParams.fuels.length > 0) {
        document.querySelectorAll('#fuelDropdown input[type="checkbox"]').forEach(cb => {
            cb.checked = urlParams.fuels.includes(cb.value);
        });
    }
    
    if (urlParams.brands.length > 0 || urlParams.years.length > 0 || urlParams.seats.length > 0 || urlParams.fuels.length > 0) {
        applyFilters();
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
    
    if (!startTime.value || !endTime.value) {
        carsGrid.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">Please select start and end dates to see available cars</p>';
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

/**
 * Dynamically populate filter dropdowns based on unique values in cars.json
 * Extracts unique brands, years, seats, and fuel types from all cars
 * Years are sorted oldest to newest for better UX
 * Re-initializes multi-select listeners after populating
 */
function populateFilterOptions() {
    // Get unique values from the data
    const brands = [...new Set(carsData.map(car => car.make))].sort();
    const years = [...new Set(carsData.map(car => car.year))].sort((a, b) => a - b);
    const seats = [...new Set(carsData.map(car => car.seats))].sort((a, b) => a - b);
    const fuelTypes = [...new Set(carsData.map(car => car.fuel_type))].sort();
    
    // Populate brand filter
    const brandDropdown = document.getElementById('brandDropdown');
    brandDropdown.innerHTML = brands.map(brand => 
        `<label><input type="checkbox" value="${brand}"> ${brand}</label>`
    ).join('');
    
    // Populate year filter
    const yearDropdown = document.getElementById('yearDropdown');
    yearDropdown.innerHTML = years.map(year => 
        `<label><input type="checkbox" value="${year}"> ${year}</label>`
    ).join('');
    
    // Populate seats filter
    const seatsDropdown = document.getElementById('seatsDropdown');
    seatsDropdown.innerHTML = seats.map(seat => 
        `<label><input type="checkbox" value="${seat}"> ${seat}</label>`
    ).join('');
    
    // Populate fuel type filter with short codes
    const fuelDropdown = document.getElementById('fuelDropdown');
    const fuelMap = {
        'Electric': 'E',
        'Gasoline': 'G',
        'Hybrid': 'H',
        'Diesel': 'D'
    };
    fuelDropdown.innerHTML = fuelTypes.map(fuel => 
        `<label><input type="checkbox" value="${fuel}"> ${fuel}</label>`
    ).join('');
    
    // Re-setup multi-select after populating
    setupMultiSelect();
}

/**
 * Render car cards to the grid with proper styling and functionality
 * Sorting Logic:
 *  1. Available cars (green border) appear first
 *  2. Within availability, sorted alphabetically by brand then model
 *  3. Unavailable cars (red border) appear at the bottom
 * 
 * Features:
 *  - Shows car image, brand, model, year, seats, fuel type
 *  - Green border for available cars, red for booked
 *  - Shows who booked the car and when (if unavailable)
 *  - Only available cars are clickable
 * 
 * @param {Array} cars - Array of car objects to render (defaults to all carsData)
 */
function renderCars(cars = carsData) {
    const carsGrid = document.getElementById('carsGrid');
    carsGrid.innerHTML = '';

    if (cars.length === 0) {
        carsGrid.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No cars match your filters</p>';
        return;
    }

    // Sort cars: available first (alphabetically), then unavailable (alphabetically)
    cars.sort((a, b) => {
        const aAvailable = isCarAvailable(a, selectedStartDate, selectedEndDate);
        const bAvailable = isCarAvailable(b, selectedStartDate, selectedEndDate);
        
        // Available cars (green) come first
        if (aAvailable !== bAvailable) {
            return bAvailable - aAvailable;
        }
        
        // Within same availability, sort alphabetically by brand then model
        const brandCompare = a.make.localeCompare(b.make);
        if (brandCompare !== 0) return brandCompare;
        return a.model.localeCompare(b.model);
    });

    cars.forEach(car => {
        // Check if car is available for the selected date range
        const isAvailable = isCarAvailable(car, selectedStartDate, selectedEndDate);
        
        const carCard = document.createElement('div');
        carCard.className = `car-card ${isAvailable ? 'available' : 'unavailable'}`;
        
        // Get fuel type icon
        const fuelIcons = {
            'Electric': 'public/ElectricCar.png',
            'Hybrid': 'public/HybridCar.png',
            'Gasoline': 'public/GasolineCar.png',
            'Diesel': 'public/GasolineCar.png'
        };
        const fuelMap = {
            'Electric': 'E',
            'Hybrid': 'H',
            'Gasoline': 'G',
            'Diesel': 'D'
        };
        const fuelIcon = fuelIcons[car.fuel_type] || 'public/GasolineCar.png';
        const fuelCode = fuelMap[car.fuel_type] || car.fuel_type.charAt(0);
        
        // Get booking info for the selected dates
        const bookingInfo = getBookingInfo(car, selectedStartDate, selectedEndDate);
        
        carCard.innerHTML = `
            <div class="car-image">
                <img src="${car.image}" alt="${car.make} ${car.model}">
            </div>
            <div class="car-info">
                <div>
                    <div class="car-header">
                        <span class="car-brand">${car.make}</span>
                        <span class="car-model">${car.model}</span>
                        <span class="car-plate">| ${car.license_plate}</span>
                    </div>
                    <div class="car-year">${car.year}</div>
                    <div class="car-specs">
                        <span class="car-spec">
                            <img src="public/CarSeat.png" alt="Seats" class="car-spec-icon">
                            ${car.seats}
                        </span>
                        <span class="car-spec">
                            <img src="${fuelIcon}" alt="${car.fuel_type}" class="car-spec-icon">
                            ${fuelCode}
                        </span>
                    </div>
                </div>
                <div class="car-status">
                    <div>
                        <div class="status-label">${isAvailable ? 'Available' : 'Not available'}</div>
                        ${!isAvailable ? `<div class="booked-by">${bookingInfo}</div>` : ''}
                    </div>
                </div>
            </div>
        `;

        // Make card clickable if available
        if (isAvailable) {
            carCard.style.cursor = 'pointer';
            carCard.addEventListener('click', () => {
                bookCar(car);
            });
        }

        carsGrid.appendChild(carCard);
    });
}

/**
 * Apply selected filters to the car list
 * Filter Logic: OR logic within each filter type (match any selected value)
 * Example: If "Tesla" and "BMW" are selected, show cars with either brand
 * 
 * Process:
 *  1. Collect all checked filter values
 *  2. Filter car list based on selections
 *  3. Sort filtered results (available first, then alphabetically)
 *  4. Update filter display text (e.g., "3 brands selected")
 *  5. Update URL with current filter state
 *  6. Re-render the car grid
 */
function applyFilters() {
    const brandCheckboxes = document.querySelectorAll('#brandDropdown input[type="checkbox"]:checked');
    const yearCheckboxes = document.querySelectorAll('#yearDropdown input[type="checkbox"]:checked');
    const seatsCheckboxes = document.querySelectorAll('#seatsDropdown input[type="checkbox"]:checked');
    const fuelCheckboxes = document.querySelectorAll('#fuelDropdown input[type="checkbox"]:checked');

    const brandFilter = Array.from(brandCheckboxes).map(cb => cb.value);
    const yearFilter = Array.from(yearCheckboxes).map(cb => cb.value);
    const seatsFilter = Array.from(seatsCheckboxes).map(cb => cb.value);
    const fuelFilter = Array.from(fuelCheckboxes).map(cb => cb.value);

    let filtered = carsData.filter(car => {
        // Apply brand filter (OR logic - match any selected brand)
        if (brandFilter.length > 0 && !brandFilter.includes(car.make)) return false;
        
        // Apply year filter (OR logic - match any selected year)
        if (yearFilter.length > 0 && !yearFilter.includes(car.year.toString())) return false;
        
        // Apply seats filter (OR logic - match any selected seats)
        if (seatsFilter.length > 0 && !seatsFilter.includes(car.seats.toString())) return false;
        
        // Apply fuel type filter (OR logic - match any selected fuel type)
        if (fuelFilter.length > 0 && !fuelFilter.includes(car.fuel_type)) return false;
        
        return true;
    });

    // Sort filtered cars: available first (alphabetically), then unavailable (alphabetically)
    filtered.sort((a, b) => {
        // Check availability for both cars
        const aAvailable = isCarAvailable(a, selectedStartDate, selectedEndDate);
        const bAvailable = isCarAvailable(b, selectedStartDate, selectedEndDate);
        
        // Available cars come first
        if (aAvailable !== bAvailable) {
            return bAvailable - aAvailable;
        }
        // Within same availability, sort by brand then model
        const brandCompare = a.make.localeCompare(b.make);
        if (brandCompare !== 0) return brandCompare;
        return a.model.localeCompare(b.model);
    });

    // Update select display text
    updateSelectDisplay('brandFilter', brandFilter.length, 'brands');
    updateSelectDisplay('yearFilter', yearFilter.length, 'years');
    updateSelectDisplay('seatsFilter', seatsFilter.length, 'seats');
    updateSelectDisplay('fuelFilter', fuelFilter.length, 'fuel types');

    // Update URL with current filters
    const startTime = document.getElementById('startTime').value;
    const endTime = document.getElementById('endTime').value;
    updateUrl(startTime, endTime, brandFilter, yearFilter, seatsFilter, fuelFilter);

    renderCars(filtered);
}

/**
 * Update the displayed text on filter select elements
 * When filters are selected, shows "X filters selected"
 * When no filters are selected, shows the placeholder text
 * @param {string} selectId - HTML element ID of the select
 * @param {number} count - Number of selected filters
 * @param {string} label - Descriptive label (e.g., 'brands', 'years')
 */
function updateSelectDisplay(selectId, count, label) {
    const select = document.getElementById(selectId);
    if (count > 0) {
        select.options[0].text = `${count} ${label} selected`;
        select.style.color = 'var(--text-dark)';
    } else {
        select.options[0].text = `Select ${label}...`;
        select.style.color = 'var(--text-light)';
    }
}

/**
 * Initialize multi-select dropdown functionality
 * Features:
 *  - Prevents native browser dropdown to avoid visual artifacts
 *  - Toggle dropdown visibility on click
 *  - Close other dropdowns when one is opened
 *  - Close all dropdowns when clicking outside
 *  - Trigger applyFilters when any checkbox is changed
 */
function setupMultiSelect() {
    const selects = document.querySelectorAll('.multi-select');
    
    selects.forEach(select => {
        const dropdownId = select.id.replace('Filter', 'Dropdown');
        const dropdown = document.getElementById(dropdownId);

        // Prevent native dropdown from opening (avoids empty/black bar)
        select.addEventListener('mousedown', (e) => {
            e.preventDefault();
        });
        
        // Toggle dropdown on select click
        select.addEventListener('click', (e) => {
            e.preventDefault();
            dropdown.classList.toggle('show');
            
            // Close other dropdowns
            document.querySelectorAll('.multi-select-dropdown').forEach(dd => {
                if (dd !== dropdown) dd.classList.remove('show');
            });
        });
        
        // Apply filters when checkbox changes
        dropdown.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', applyFilters);
        });
    });
    
    // Close dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.multi-select-wrapper')) {
            document.querySelectorAll('.multi-select-dropdown').forEach(dd => {
                dd.classList.remove('show');
            });
        }
    });
}

/**
 * Check if a car is available for the selected date range
 * A car is unavailable if it has ANY booking that overlaps with selected dates
 * Date overlap logic: Two date ranges overlap if NOT (endA <= startB || startA >= endB)
 * @param {Object} car - Car object from cars.json
 * @param {Date} startDate - Selected start date
 * @param {Date} endDate - Selected end date
 * @returns {boolean} true if car is available, false if booked
 */
function isCarAvailable(car, startDate, endDate) {
    if (!startDate || !endDate) return false;
    
    // Check if any booking overlaps with selected dates
    return !car.bookings.some(booking => {
        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        return !(endDate <= bookingStart || startDate >= bookingEnd);
    });
}

/**
 * Get booking details for display when car is unavailable
 * Returns the name of the person who booked the car
 * @param {Object} car - Car object from cars.json
 * @param {Date} startDate - Selected start date
 * @param {Date} endDate - Selected end date
 * @returns {string} Formatted booking info (e.g., "Booked by: John Smith")
 */
function getBookingInfo(car, startDate, endDate) {
    if (!startDate || !endDate) return '';
    
    const overlappingBooking = car.bookings.find(booking => {
        const bookingStart = new Date(booking.start);
        const bookingEnd = new Date(booking.end);
        return !(endDate <= bookingStart || startDate >= bookingEnd);
    });
    
    if (overlappingBooking) {
        const startStr = new Date(overlappingBooking.start).toLocaleString();
        const endStr = new Date(overlappingBooking.end).toLocaleString();
        return `Booked by: ${overlappingBooking.bookedBy || 'Unknown'}`;
    }
    return '';
}

/**
 * Handle car booking: Store selected car and dates, then navigate to booking confirmation page
 * Data is stored in sessionStorage so it persists during browser navigation
 * @param {Object} car - Selected car object
 */
function bookCar(car) {
    // Store selected car and dates in sessionStorage
    sessionStorage.setItem('selectedCar', JSON.stringify(car));
    sessionStorage.setItem('selectedStartDate', document.getElementById('startTime').value);
    sessionStorage.setItem('selectedEndDate', document.getElementById('endTime').value);
    
    // Navigate to booking page
    window.location.href = 'booking.html';
}

/**
 * Reset all filters and dates to initial state
 * - Uncheck all filter checkboxes
 * - Clear date inputs
 * - Clear URL parameters
 * - Show initial message prompting date selection
 */
function clearFilters() {
    document.querySelectorAll('.multi-select-dropdown input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
    });
    
    updateSelectDisplay('brandFilter', 0, 'brands');
    updateSelectDisplay('yearFilter', 0, 'years');
    updateSelectDisplay('seatsFilter', 0, 'seats');
    updateSelectDisplay('fuelFilter', 0, 'fuel types');
    
    document.getElementById('startTime').value = '';
    document.getElementById('endTime').value = '';
    
    // Clear URL parameters
    updateUrl('', '', [], [], [], []);
    
    const carsGrid = document.getElementById('carsGrid');
    carsGrid.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">Please select start and end dates to see available cars</p>';
}

// Event listeners
document.getElementById('clearFilters').addEventListener('click', clearFilters);

// Listen for date changes
document.getElementById('startTime').addEventListener('change', checkDatesAndShowCars);
document.getElementById('endTime').addEventListener('change', checkDatesAndShowCars);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadCars();
});
