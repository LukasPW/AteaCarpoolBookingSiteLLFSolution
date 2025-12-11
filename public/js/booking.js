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
 * 
 * Dependencies:
 *  - utils.js: FUEL_ICONS, FUEL_MAP, formatDateTime()
 *  - auth.js: initUserMenu()
 */

/**
 * Show custom modal popup
 */
function showModal(title, message, type = 'info', callback = null) {
    const overlay = document.getElementById('modalOverlay');
    const dialog = document.getElementById('modalDialog');
    const titleEl = document.getElementById('modalTitle');
    const messageEl = document.getElementById('modalMessage');
    const buttonEl = document.getElementById('modalButton');

    if (!overlay || !dialog || !titleEl || !messageEl || !buttonEl) {
        alert(message); // Fallback to alert if modal elements missing
        return;
    }

    titleEl.textContent = title;
    messageEl.textContent = message;

    // Remove all type classes and add the appropriate one
    dialog.className = 'modal-dialog ' + type;
    buttonEl.className = 'modal-button' + (type === 'error' ? ' danger' : '');

    // Store callback for when modal is closed
    window.modalCallback = callback;

    overlay.classList.add('show');
}

/**
 * Close the modal popup
 */
function closeModal() {
    const overlay = document.getElementById('modalOverlay');
    overlay.classList.remove('show');
    
    // Execute callback if provided
    if (window.modalCallback && typeof window.modalCallback === 'function') {
        window.modalCallback();
        window.modalCallback = null;
    }
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
    initUserMenu();
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
    const fuelIcon = FUEL_ICONS[selectedCar.fuel_type] || 'public/GasolineCar.png';
    const fuelCode = FUEL_MAP[selectedCar.fuel_type] || selectedCar.fuel_type.charAt(0);
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
 */
async function confirmBooking() {
    const API_BASE = window.API_BASE || 'http://localhost:5000/api';
    const selectedCar = JSON.parse(sessionStorage.getItem('selectedCar'));
    const startDate = sessionStorage.getItem('selectedStartDate');
    const endDate = sessionStorage.getItem('selectedEndDate');

    if (!selectedCar || !startDate || !endDate) {
        showModal('Error', 'No car selected. Please go back and select a car.', 'error');
        return;
    }

    // Normalize to "YYYY-MM-DD HH:MM:SS" for the API
    const toDbFormat = (value) => {
        const d = new Date(value);
        const pad = (n) => String(n).padStart(2, '0');
        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
    };

    const payload = {
        car_id: selectedCar.id,
        start_datetime: toDbFormat(startDate),
        end_datetime: toDbFormat(endDate),
        booked_by: sessionStorage.getItem('userName') || 'User'
    };

    try {
        const res = await fetch(`${API_BASE}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(payload)
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
            showModal('Booking Failed', data.msg || 'Unable to complete the booking.', 'error');
            return;
        }

        // Clear selected booking after success
        sessionStorage.removeItem('selectedCar');
        sessionStorage.removeItem('selectedStartDate');
        sessionStorage.removeItem('selectedEndDate');
        
        showModal('Success', 'Booking confirmed!', 'success', () => {
            window.location.href = 'index.html';
        });
    } catch (err) {
        showModal('Error', 'Network error. Please try again.', 'error');
    }
}
