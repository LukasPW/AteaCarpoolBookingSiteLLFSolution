from flask import Blueprint, request, jsonify, session
from db import get_conn
from email_service import send_booking_confirmation

booking_bp = Blueprint("booking_bp", __name__, url_prefix="/api")


@booking_bp.route("/bookings", methods=["GET"])
def get_bookings():
    conn = get_conn()
    try:
        cursor = conn.cursor(dictionary=True)
        cursor.execute("SELECT * FROM bookings")
        data = cursor.fetchall()
    finally:
        conn.close()
    return jsonify(data)

def has_overlap(car_id, start, end):
    """Check if a car is already booked during the given time period."""
    conn = get_conn()
    try:
        cursor = conn.cursor()
        sql = """
            SELECT COUNT(*)
            FROM bookings
            WHERE car_id = %s
            AND start_datetime < %s
            AND end_datetime > %s
        """
        cursor.execute(sql, (car_id, end, start))
        (count,) = cursor.fetchone()
        return count > 0
    finally:
        conn.close()

# POST create booking
@booking_bp.route("/bookings", methods=["POST"])
def create_booking():
    data = request.get_json()
    if not data:
        return jsonify({"msg": "Invalid JSON"}), 400

    car_id = data.get("car_id")
    start = data.get("start_datetime")
    end = data.get("end_datetime")
    booked_by = data.get("booked_by")

    if not all([car_id, start, end, booked_by]):
        return jsonify({"msg": "Missing required fields"}), 400

    if has_overlap(car_id, start, end):
        return jsonify({"msg": "Car is already booked for that time period"}), 409

    conn = get_conn()
    cursor = conn.cursor(dictionary=True)
    email_sent = False

    try:
        cursor.execute(
            "INSERT INTO bookings (car_id, start_datetime, end_datetime, booked_by) VALUES (%s, %s, %s, %s)",
            (car_id, start, end, booked_by)
        )
        conn.commit()
        new_id = cursor.lastrowid

        # Get car details for email
        cursor.execute(
            "SELECT make, model, license_plate FROM cars WHERE id = %s",
            (car_id,)
        )
        car_data = cursor.fetchone()

        # Get user info from session
        user_email = session.get("user_email")
        user_name = session.get("user_name") or booked_by

        # Send confirmation email if user email is available
        if user_email and car_data:
            car_info = {
                "make": car_data["make"],
                "model": car_data["model"],
                "license_plate": car_data["license_plate"],
            }

            success, _ = send_booking_confirmation(
                user_email,
                user_name,
                new_id,
                car_info,
                start,
                end,
            )
            email_sent = bool(success)

    except Exception as e:
        conn.rollback()
        return jsonify({"msg": f"DB insert failed: {str(e)}"}), 500

    finally:
        conn.close()

    return jsonify({
        "msg": "booking created",
        "id": new_id,
        "email_sent": email_sent
    }), 201

