// Sample car data
const carsData = [
    {
        id: 1,
        brand: 'Tesla',
        model: 'Model 3',
        plate: 'XCO365',
        seats: 5,
        fuelType: 'E',
        available: true,
        bookedBy: null,
        image: '🚗'
    },
    {
        id: 2,
        brand: 'Toyota',
        model: 'Corolla',
        plate: 'JTM660',
        seats: 5,
        fuelType: 'G',
        available: false,
        bookedBy: 'Tommy Askey',
        image: '🚗'
    },
    {
        id: 3,
        brand: 'Ford',
        model: 'Focus',
        plate: 'GUU694',
        seats: 5,
        fuelType: 'G',
        available: false,
        bookedBy: 'Peter Hosewol',
        image: '🚗'
    },
    {
        id: 4,
        brand: 'BMW',
        model: 'X5',
        plate: 'ABC123',
        seats: 7,
        fuelType: 'E',
        available: true,
        bookedBy: null,
        image: '🚙'
    },
    {
        id: 5,
        brand: 'Mercedes',
        model: 'C-Class',
        plate: 'MER456',
        seats: 5,
        fuelType: 'G',
        available: false,
        bookedBy: 'John Smith',
        image: '🚗'
    },
    {
        id: 6,
        brand: 'Audi',
        model: 'A4',
        plate: 'AUD789',
        seats: 5,
        fuelType: 'E',
        available: true,
        bookedBy: null,
        image: '🚗'
    }
];

// Render cars
function renderCars(cars = carsData) {
    const carsGrid = document.getElementById('carsGrid');
    carsGrid.innerHTML = '';

    cars.forEach(car => {
        const carCard = document.createElement('div');
        carCard.className = `car-card ${car.available ? 'available' : 'unavailable'}`;
        
        carCard.innerHTML = `
            <div class="car-image">${car.image}</div>
            <div class="car-info">
                <div>
                    <div class="car-header">
                        <span class="car-brand">${car.brand}</span>
                        <span class="car-model">${car.model}</span>
                        <span class="car-plate">| ${car.plate}</span>
                    </div>
                    <div class="car-specs">
                        <span class="car-spec">
                            <span class="car-spec-icon">🪑</span>
                            ${car.seats}
                        </span>
                        <span class="car-spec">
                            <span class="car-spec-icon">⚡</span>
                            ${car.fuelType}
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
                alert(`Booking ${car.brand} ${car.model}...`);
                // Add booking logic here
            }
        });

        carsGrid.appendChild(carCard);
    });
}

// Filter functionality
const selects = document.querySelectorAll('select');
const inputs = document.querySelectorAll('input');

function applyFilters() {
    let filtered = carsData;

    // Add filter logic based on user selections
    // This is a basic implementation - extend as needed

    renderCars(filtered);
}

selects.forEach(select => {
    select.addEventListener('change', applyFilters);
});

inputs.forEach(input => {
    input.addEventListener('change', applyFilters);
});

// Initial render
renderCars();
