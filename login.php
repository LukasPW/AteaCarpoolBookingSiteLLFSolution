<?php
session_start();
if (isset($_SESSION['user_id'])) {
    header('Location: index.php');
    exit;
}
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; display: flex; flex-direction: column; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; padding: 2rem; }
        .logo { width: 200px; height: auto; margin-bottom: 2rem; }
        .login-container { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); width: 100%; max-width: 400px; }
        h1 { margin-bottom: 1.5rem; text-align: center; color: #333; }
        .form-group { margin-bottom: 1rem; }
        label { display: block; margin-bottom: 0.5rem; color: #555; }
        input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
        input:focus { outline: none; border-color: #007bff; }
        button { width: 100%; padding: 0.75rem; background: #007bff; color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; margin-top: 0.5rem; }
        button:hover { background: #0056b3; }
        .register-link { text-align: center; margin-top: 1rem; color: #555; font-size: 0.9rem; }
        .register-link a { color: #007bff; text-decoration: none; }
        .register-link a:hover { text-decoration: underline; }
        .error { margin-top: 0.75rem; color: #e74c3c; text-align: center; font-size: 0.95rem; }
    </style>
</head>
<body>
    <img src="public/atea-logo.generated.svg" alt="Logo" class="logo">
    <div class="login-container">
        <h1>Login</h1>
        <form id="loginForm">
            <div class="form-group">
                <label for="email">Email</label>
                <input type="email" id="email" placeholder="Enter your email" required>
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input type="password" id="password" placeholder="Enter your password" required>
            </div>
            <button type="submit">Login</button>
            <div class="error" id="errorBox" style="display:none;"></div>
        </form>
        <p class="register-link">Don't have an account? <a href="register.php">Register here</a></p>
    </div>
    <script>
    document.getElementById('loginForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const errorBox = document.getElementById('errorBox');
        errorBox.style.display = 'none';
        errorBox.textContent = '';
        try {
            const res = await fetch('api/login.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
                errorBox.textContent = data.error || 'Login failed';
                errorBox.style.display = 'block';
                return;
            }
            window.location.href = 'index.php';
        } catch (err) {
            errorBox.textContent = 'Network error. Please try again.';
            errorBox.style.display = 'block';
        }
    });
    </script>
</body>
</html>
