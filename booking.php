<?php
session_start();
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}
$userName = htmlspecialchars($_SESSION['user_name'] ?? 'User');
$userEmail = htmlspecialchars($_SESSION['user_email'] ?? '');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="icon" type="image/x-icon" href="public/favicon.ico">
    <link rel="stylesheet" href="public/style/style.css">
    <link rel="stylesheet" href="public/style/bookingPage.css">
    <title>Atea Car Booking</title>
</head>
<body>

    <!-- HEADER -->
    <header class="topbar">
        <img class="logo" src="public/atea-logo.generated.svg" alt="Atea">
        <div class="header-right">
            <button class="user-pill" id="userMenuToggle" aria-haspopup="true" aria-expanded="false">
                <span class="user-name"><?php echo $userName; ?></span>
                <img src="public/UserIcon.png" alt="User" class="user-avatar">
            </button>
            <div class="user-menu" id="userMenu" hidden>
                <button id="logoutBtn" class="logout-item">Logout</button>
            </div>
        </div>
    </header>

    <!-- MAIN CONTAINER -->
    <main class="page-container">
        <div class="car-card">
            <!-- Car Image -->
            <div class="car-image">
                <img id="carImage" src="" alt="Car" />
            </div>

            <!-- Car Info -->
            <div class="car-info">
                <h2><span class="brand" id="carBrand"></span> <span id="carModel"></span> <span class="plate" id="carPlate"></span></h2>

                <div class="car-icons">
                    <div class="info-item"><img class="car-spec-icon" src="public/CarSeat.png" alt="Seats"> <span id="carSeats"></span></div>
                    <div class="info-item"><img class="car-spec-icon" id="fuelIcon" src="" alt="Fuel"> <span id="fuelCode"></span></div>
                </div>

                <div class="datetime">
                    <p><strong>Start:</strong> <span id="startDateTime"></span></p>
                    <p><strong>End:</strong> <span id="endDateTime"></span></p>
                </div>

                <div class="buttons">
                    <button class="cancel-btn" onclick="goBack()">Cancel</button>
                    <button class="book-btn" onclick="confirmBooking()">Book car</button>
                </div>
            </div>
        </div>
    </main>

    <!-- Modular JavaScript files loaded in dependency order -->
    <script src="public/js/utils.js"></script>
    <script src="public/js/auth.js"></script>
    <script src="public/js/booking.js"></script>

</body>
</html>
