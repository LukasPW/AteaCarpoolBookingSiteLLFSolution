// Global variable to store cars data
let carsData = [];

// Fetch cars from JSON file
async function loadCars() {
    try {
        const response = await fetch('cars.json');
        carsData = await response.json();
        
        // Populate filter options based on available data
        populateFilterOptions();
        
        // Initial render
        renderCars();
    } catch (error) {
        console.error('Error loading cars:', error);
        document.getElementById('carsGrid').innerHTML = '<p style="color: #e74c3c; text-align: center; padding: 40px;">Error loading cars data</p>';
    }
}

// Populate filter options dynamically
function populateFilterOptions() {
    // Get unique values from the data
    const brands = [...new Set(carsData.map(car => car.make))].sort();
    const years = [...new Set(carsData.map(car => car.year))].sort((a, b) => b - a);
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

// Render cars
function renderCars(cars = carsData) {
    const carsGrid = document.getElementById('carsGrid');
    carsGrid.innerHTML = '';

    if (cars.length === 0) {
        carsGrid.innerHTML = '<p style="color: #999; text-align: center; padding: 40px;">No cars match your filters</p>';
        return;
    }

    cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = `car-card ${car.available ? 'available' : 'unavailable'}`;
        
        // Get fuel type icon
        const fuelIcon = car.fuel_type === 'Electric' ? 'public/ElectricCar.png' : 'public/GasolineCar.png';
        const fuelMap = {
            'Electric': 'E',
            'Gasoline': 'G',
            'Hybrid': 'H',
            'Diesel': 'D'
        };
        const fuelCode = fuelMap[car.fuel_type] || car.fuel_type.charAt(0);
        
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
                        <div class="status-label">${car.available ? 'Available' : 'Not available'}</div>
                        ${!car.available ? `<div class="booked-by">Booked by: ${car.bookedBy}</div>` : ''}
                    </div>
                </div>
            </div>
        `;

        carCard.addEventListener('click', () => {
            if (car.available) {
                alert(`Booking ${car.make} ${car.model}...`);
                // Add booking logic here
            }
        });

        carsGrid.appendChild(carCard);
    });
}

// Filter functionality
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

    renderCars(filtered);
}

// Update select display text
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

// Toggle dropdown
function setupMultiSelect() {
    const selects = document.querySelectorAll('.multi-select');
    
    selects.forEach(select => {
        const dropdownId = select.id.replace('Filter', 'Dropdown');
        const dropdown = document.getElementById(dropdownId);
        
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

// Clear filters function
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
    
    renderCars(carsData);
}

// Event listeners
document.getElementById('clearFilters').addEventListener('click', clearFilters);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    loadCars();
});
