from flask import Blueprint, request, jsonify, session
from db import get_conn
from werkzeug.security import check_password_hash, generate_password_hash

auth_bp = Blueprint("auth", __name__, url_prefix="/api")

USERS_DDL = """
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
"""

def ensure_users_table():
    conn = get_conn()
    try:
        cur = conn.cursor()
        cur.execute(USERS_DDL)
        conn.commit()
    finally:
        conn.close()

@auth_bp.before_app_request
def _ensure_table():
    ensure_users_table()

@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or request.form
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id, name, email, password_hash FROM users WHERE email=%s LIMIT 1", (email,))
        user = cur.fetchone()
    finally:
        conn.close()

    if not user or not check_password_hash(user["password_hash"], password):
        return jsonify({"error": "Invalid email or password"}), 401

    session["user_id"] = int(user["id"])
    session["user_email"] = user["email"]
    session["user_name"] = user["name"]

    return jsonify({"success": True, "name": user["name"], "email": user["email"]})

@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or request.form
    name = (data.get("name") or "").strip()
    email = (data.get("email") or "").strip()
    password = data.get("password") or ""
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400
    if not name:
        name = email.split("@")[0] or "User"

    ensure_users_table()

    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute("SELECT id FROM users WHERE email=%s LIMIT 1", (email,))
        if cur.fetchone():
            return jsonify({"error": "Email already registered"}), 409

        pwd_hash = generate_password_hash(password)
        cur.execute("INSERT INTO users (name, email, password_hash) VALUES (%s, %s, %s)", (name, email, pwd_hash))
        conn.commit()
        user_id = cur.lastrowid
    finally:
        conn.close()

    session["user_id"] = user_id
    session["user_email"] = email
    session["user_name"] = name

    return jsonify({"success": True, "name": name, "email": email})

@auth_bp.route("/logout", methods=["POST"])
def logout():
    session.clear()
    return jsonify({"success": True})
