<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="public/favicon.ico">
    <title>Register | Atea Car Booking</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; padding: 2rem; }
        .logo { width: 200px; height: auto; margin-bottom: 2rem; }
        .login-container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 100%; max-width: 420px; }
        h1 { margin-bottom: 1.5rem; text-align: center; color: #333; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.5rem; color: #555; }
        input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
        input:focus { outline: none; border-color: #007bff; }
        .button-group { display: flex; gap: 0.5rem; margin-top: 0.5rem; }
        button { flex: 1; padding: 0.75rem; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; }
        .btn-login { background: #007bff; }
        .btn-login:hover { background: #0056b3; }
        .btn-cancel { background: #6c757d; }
        .btn-cancel:hover { background: #5a6268; }
        .error { margin-top: 0.75rem; color: #e74c3c; text-align: center; font-size: 0.95rem; }
    </style>
</head>
<body>
    <img src="public/atea-logo.generated.svg" alt="Logo" class="logo">
    <div class="login-container">
        <h1>Register</h1>
        <form id="registerForm">
            <div class="form-group">
                <label for="name">Name</label>
                <input type="text" id="name" placeholder="Your name" required>
            </div>
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Enter your email" required>
            </div>
            <div class="form-group">
                <label for="confirmEmail">Confirm Email</label>
                <input type="email" id="confirmEmail" placeholder="Confirm your email" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password" required>
            </div>
            <div class="form-group">
                <label for="confirmPassword">Confirm Password</label>
                <input type="password" id="confirmPassword" placeholder="Confirm your password" required>
            </div>
            <div class="button-group">
                <button type="submit" class="btn-login">Create Account</button>
                <button type="button" class="btn-cancel">Cancel</button>
            </div>
            <div class="error" id="errorBox" style="display:none;"></div>
        </form>
    </div>
    <script>
    document.getElementById('registerForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value.trim();
        const email = document.getElementById('email').value.trim();
        const confirmEmail = document.getElementById('confirmEmail').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirmPassword').value.trim();
        const errorBox = document.getElementById('errorBox');
        errorBox.style.display = 'none';
        errorBox.textContent = '';

        if (email !== confirmEmail) {
            errorBox.textContent = 'Emails do not match';
            errorBox.style.display = 'block';
            return;
        }
        if (password !== confirmPassword) {
            errorBox.textContent = 'Passwords do not match';
            errorBox.style.display = 'block';
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ name, email, password })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                errorBox.textContent = data.error || 'Registration failed';
                errorBox.style.display = 'block';
                return;
            }
            if (data.name) sessionStorage.setItem('userName', data.name);
            if (data.email) sessionStorage.setItem('userEmail', data.email);
            window.location.href = 'index.php';
        } catch (err) {
            errorBox.textContent = 'Network error. Please try again.';
            errorBox.style.display = 'block';
        }
    });

    document.querySelector('.btn-cancel').addEventListener('click', () => {
        window.location.href = 'login.php';
    });
    </script>
</body>
</html>
