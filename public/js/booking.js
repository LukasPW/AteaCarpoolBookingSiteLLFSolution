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
    const contentEl = document.getElementById('modalContent');
    const buttonEl = document.getElementById('modalButton');
    const printBtn = document.getElementById('printButton');

    if (!overlay || !dialog || !titleEl || !contentEl || !buttonEl) {
        alert(typeof message === 'string' ? message : 'Booking confirmed');
        return;
    }

    titleEl.textContent = title;

    // Detect special case: booking confirmation summary
    const isBookingSummary =
        type === 'success' &&
        title.toLowerCase().includes('booking');

    if (typeof message === 'string' && !isBookingSummary) {
        // Simple text message, no print button
        contentEl.innerHTML = `<p class="modal-message">${message}</p>`;
        if (printBtn) {
            printBtn.classList.add('hidden');
        }
    } else {
        // Detailed content (like booking summary) → allow printing
        contentEl.innerHTML = message;
        if (printBtn) {
            printBtn.classList.remove('hidden');
        }
    }

    dialog.className = 'modal-dialog ' + type;
    buttonEl.className = 'modal-button' + (type === 'error' ? ' danger' : '');
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
    const user = requireAuth();
    if (!user) return;
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
    const fuelIcon = FUEL_ICONS[selectedCar.fuel_type] || 'public/icons/GasolineCar.png';
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

    // Show loading overlay
    const loadingOverlay = document.getElementById('loadingOverlay');
    const bookBtn = document.querySelector('.book-btn');
    if (loadingOverlay) {
        loadingOverlay.classList.add('show');
    }
    if (bookBtn) {
        bookBtn.disabled = true;
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
        let emailMessage = '';
        if (typeof data.email_sent === 'boolean') {
            if (data.email_sent) {
                emailMessage = `
                    <p class="summary-note">
                        A confirmation email has been sent to your email address.
                    </p>
                `;
            } else {
                emailMessage = `
                    <p class="summary-note summary-note-warning">
                        We could not send a confirmation email.  
                        You can still use this confirmation as proof of your booking.
                    </p>
                `;
            }
        }

        if (!res.ok) {
            if (loadingOverlay) loadingOverlay.classList.remove('show');
            if (bookBtn) bookBtn.disabled = false;
            showModal('Booking Failed', data.msg || 'Unable to complete the booking.', 'error');
            return;
        }

        // Hide loading overlay
        if (loadingOverlay) loadingOverlay.classList.remove('show');
        if (bookBtn) bookBtn.disabled = false;

        // Create and show booking summary
        const summaryHtml = createBookingSummary(
            selectedCar,
            startDate,
            endDate,
            sessionStorage.getItem('userName') || 'User',
            data.id,
            emailMessage
        );
        
        // Clear selected booking after success
        sessionStorage.removeItem('selectedCar');
        sessionStorage.removeItem('selectedStartDate');
        sessionStorage.removeItem('selectedEndDate');
        
        showModal('Booking Confirmed', summaryHtml, 'success', () => {
            window.location.href = 'index.html';
        });
    } catch (err) {
        if (loadingOverlay) loadingOverlay.classList.remove('show');
        if (bookBtn) bookBtn.disabled = false;
        showModal('Error', 'Network error. Please try again.', 'error');
    }
}
/**
 * Print booking summary to PDF
 * Uses the browser's print dialog to save as PDF
 */
function createBookingSummary(car, startDate, endDate, userName, bookingId, emailMessage = '') {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationMs = end - start;
    const durationHours = Math.round(durationMs / (1000 * 60 * 60) * 10) / 10;
    const durationDays = Math.floor(durationHours / 24);
    const remainingHours = Math.round((durationHours % 24) * 10) / 10;

    const formatDate = (date) => {
        return date.toLocaleDateString('en-GB', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return `
        <div class="booking-summary">
            <header class="booking-summary-header">
                <div class="summary-logo-title">
                    <img src="public/atea-logo.generated.svg" alt="Atea" class="summary-logo">
                    <div>
                        <h1 class="summary-main-title">Car Booking Confirmation</h1>
                        <p class="summary-subtitle">Atea Car Booking System</p>
                    </div>
                </div>
                <div class="summary-meta">
                    <div class="summary-row">
                        <span class="summary-label">Confirmation #</span>
                        <span class="summary-value">#${bookingId}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Generated</span>
                        <span class="summary-value">${formatDate(new Date())}</span>
                    </div>
                </div>
            </header>

            <section class="summary-section summary-two-column">
                <div class="summary-block">
                    <h2 class="summary-section-title">Vehicle</h2>
                    <div class="summary-row">
                        <span class="summary-label">Car</span>
                        <span class="summary-value">${car.make} ${car.model}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">License plate</span>
                        <span class="summary-value">${car.license_plate}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Seats</span>
                        <span class="summary-value">${car.seats}</span>
                    </div>
                    <div class="summary-row">
                        <span class="summary-label">Fuel type</span>
                        <span class="summary-value">${car.fuel_type}</span>
                    </div>
                </div>

                <div class="summary-block">
                    <h2 class="summary-section-title">Renter</h2>
                    <div class="summary-row">
                        <span class="summary-label">Name</span>
                        <span class="summary-value">${userName}</span>
                    </div>
                </div>
            </section>

            <section class="summary-section">
                <h2 class="summary-section-title">Rental period</h2>
                <div class="summary-row">
                    <span class="summary-label">Pickup</span>
                    <span class="summary-value">${formatDate(start)}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Return</span>
                    <span class="summary-value">${formatDate(end)}</span>
                </div>
                <div class="summary-row">
                    <span class="summary-label">Duration</span>
                    <span class="summary-value">
                        ${durationDays > 0 ? `${durationDays} day(s) ` : ''}${remainingHours} hour(s)
                    </span>
                </div>

                ${emailMessage}
            </section>
        </div>
    `;
}

/**
 * Print booking summary to PDF
 * Uses the browser's print dialog to save as PDF
 */
function printBookingSummary() {
    window.print();
}
