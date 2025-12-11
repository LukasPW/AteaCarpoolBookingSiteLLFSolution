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
 *  1. User clicks on a car in index.php
 *  2. bookCar() stores car + dates in sessionStorage
 *  3. User redirected to booking.php
 *  4. This script loads sessionStorage data and populates the page
 *  5. User confirms or cancels the booking
 * 
 * Dependencies:
 *  - utils.js: FUEL_ICONS, FUEL_MAP, formatDateTime()
 *  - auth.js: initUserMenu()
 */

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
 * 
 * Note: Currently shows a placeholder alert.
 * This function should be updated to send booking data to backend/database
 * before redirecting to index.php
 */
async function confirmBooking() {
    const selectedCar = JSON.parse(sessionStorage.getItem('selectedCar'));
    const startDate = sessionStorage.getItem('selectedStartDate');
    const endDate = sessionStorage.getItem('selectedEndDate');

    if (!selectedCar || !startDate || !endDate) {
        alert("Missing booking details.");
        return;
    }

    const payload = {
        car_id: selectedCar.id,
        start_datetime: startDate.replace("T", " ") + ":00",
        end_datetime: endDate.replace("T", " ") + ":00",
        booked_by: localStorage.getItem("username") || "unknown"
    };

    try {
        const res = await fetch("http://127.0.0.1:5000/api/bookings", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        });

        const data = await res.json();
        console.log("BOOKING RESPONSE:", data);

        if (res.ok) {
            alert("Booking saved.");
            window.location.href = "index.php";
        } else {
            alert("Could not book: " + data.msg);
        }
    } catch (err) {
        console.error("NETWORK ERR:", err);
        alert("Network issue. Backend unreachable.");
    }
}

