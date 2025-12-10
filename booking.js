/**
 * =========================================
 * BOOKING CONFIRMATION PAGE - booking.js
 * =========================================
 * 
 * This script handles the booking confirmation page.
 * It displays the selected car with its details and the booking dates.
 * Data is retrieved from sessionStorage which was set when the user
 * clicked on a car in the main booking page.
 * 
 * Data Flow:
 *  1. User clicks on a car in index.html
 *  2. bookCar() stores car + dates in sessionStorage
 *  3. User redirected to booking.html
 *  4. This script loads sessionStorage data and populates the page
 *  5. User confirms or cancels the booking
 */

// ===== FUEL TYPE MAPPINGS =====
// Maps full fuel type names to icon paths for display
// Fuel type icons mapping
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

/**
 * Initialize the booking page with car and date information
 * This event fires when the DOM is fully loaded
 * 
 * Process:
 *  1. Retrieve car object from sessionStorage
 *  2. Retrieve start and end dates from sessionStorage
 *  3. Validate that all required data exists
 *  4. Populate page elements with car details
 *  5. Format and display dates
 */
document.addEventListener('DOMContentLoaded', () => {
    // Get car and dates from sessionStorage
    const selectedCar = JSON.parse(sessionStorage.getItem('selectedCar'));
    const startDate = sessionStorage.getItem('selectedStartDate');
    const endDate = sessionStorage.getItem('selectedEndDate');

    if (selectedCar) {
        document.title = `${selectedCar.make} ${selectedCar.model} | Atea Car Booking`;
    }

    if (!selectedCar || !startDate || !endDate) {
        document.querySelector('.car-card').innerHTML = '<p style="text-align: center; color: #999;">No car selected. Please go back and select a car.</p>';
        return;
    }

    // Populate car image
    const carImage = document.getElementById('carImage');
    carImage.src = selectedCar.image;
    carImage.alt = `${selectedCar.make} ${selectedCar.model}`;

    // Populate car info
    document.getElementById('carBrand').textContent = selectedCar.make;
    document.getElementById('carModel').textContent = selectedCar.model;
    document.getElementById('carPlate').textContent = `| ${selectedCar.license_plate}`;
    document.getElementById('carSeats').textContent = selectedCar.seats;

    // Populate fuel type
    const fuelIcon = fuelIcons[selectedCar.fuel_type] || 'public/GasolineCar.png';
    const fuelCode = fuelMap[selectedCar.fuel_type] || selectedCar.fuel_type.charAt(0);
    document.getElementById('fuelIcon').src = fuelIcon;
    document.getElementById('fuelCode').textContent = fuelCode;

    // Populate dates
    document.getElementById('startDateTime').textContent = formatDateTime(startDate);
    document.getElementById('endDateTime').textContent = formatDateTime(endDate);
});

/**
 * Navigate back to the previous page in browser history
 * Called when user clicks the "Cancel" button
 */
function goBack() {
    window.history.back();
}

/**
 * Confirm the booking and return to main page
 * Called when user clicks the "Book car" button
 * 
 * Note: Currently shows a placeholder alert.
 * This function should be updated to send booking data to backend/database
 * before redirecting to index.html
 */
function confirmBooking() {
    alert('Booking confirmed! [Placeholder, database integration needed]');
    window.location.href = 'index.html';
}
