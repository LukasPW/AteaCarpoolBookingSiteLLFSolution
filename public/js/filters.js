/**
 * ===============================
 * FILTERS MODULE - filters.js
 * ===============================
 * 
 * Handles filter panel functionality and multi-select dropdowns
 * - Populate filter dropdowns from car data
 * - Apply filters to car list
 * - Multi-select dropdown UI behavior
 * - URL sync for filter state
 * 
 * Dependencies:
 *  - Requires global carsData array
 *  - Requires global selectedStartDate, selectedEndDate
 *  - Requires renderCars() from cars.js
 *  - Requires updateUrl() from url-params.js
 */

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
    
    // Populate fuel type filter
    const fuelDropdown = document.getElementById('fuelDropdown');
    fuelDropdown.innerHTML = fuelTypes.map(fuel => 
        `<label><input type="checkbox" value="${fuel}"> ${fuel}</label>`
    ).join('');
    
    // Re-setup multi-select after populating
    setupMultiSelect();
}

/**
 * Apply selected filters to the car list
 * Filter Logic: OR logic within each filter type (match any selected value)
 * Example: If "Tesla" and "BMW" are selected, show cars with either brand
 * 
 * Process:
 *  1. Collect all checked filter values
 *  2. Filter car list based on selections
 *  3. Update filter display text (e.g., "3 brands selected")
 *  4. Update URL with current filter state
 *  5. Re-render the car grid
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
