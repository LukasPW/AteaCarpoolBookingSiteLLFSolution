/**
 * ===========================
 * CARS MODULE - cars.js
 * ===========================
 * 
 * Handles car availability checking and rendering
 * - Check car availability based on bookings
 * - Render car cards with availability status
 * - Handle car booking selection
 * 
 * Dependencies:
 *  - Requires global carsData array
 *  - Requires global selectedStartDate, selectedEndDate
 *  - Requires FUEL_ICONS, FUEL_MAP from utils.js
 */

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
        return `Booked by: ${overlappingBooking.bookedBy || 'Unknown'}`;
    }
    return '';
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
        
        const fuelIcon = FUEL_ICONS[car.fuel_type] || 'public/GasolineCar.png';
        const fuelCode = FUEL_MAP[car.fuel_type] || car.fuel_type.charAt(0);
        
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
    window.location.href = 'booking.php';
}
