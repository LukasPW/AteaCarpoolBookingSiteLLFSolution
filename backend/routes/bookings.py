from flask import Blueprint, request, jsonify, session
from db import get_conn
from email_service import send_booking_confirmation

booking_bp = Blueprint("booking_bp", __name__, url_prefix="/api")

def debug_db():
    db = get_conn()
    db.autocommit = True
    print("DB CONNECTED TO:", db.database)
    return db

# GET all bookings
@booking_bp.route("/bookings", methods=["GET"])
def get_bookings():
    db = debug_db()
    cursor = db.cursor(dictionary=True)
    cursor.execute("SELECT * FROM bookings")
    data = cursor.fetchall()
    cursor.close()
    db.close()
    return jsonify(data)

# CHECK overlap
def has_overlap(car_id, start, end):
    print("OVERLAP CHECK:", car_id, start, end)
    db = debug_db()
    cursor = db.cursor()
    sql = """
        SELECT COUNT(*)
        FROM bookings
        WHERE car_id = %s
        AND start_datetime < %s
        AND end_datetime > %s
    """
    cursor.execute(sql, (car_id, end, start))
    (count,) = cursor.fetchone()
    print("OVERLAP COUNT:", count)
    cursor.close()
    db.close()
    return count > 0

# POST create booking
@booking_bp.route("/bookings", methods=["POST", "OPTIONS"])
def create_booking():
    if request.method == "OPTIONS":
        # handle preflight for CORS
        response = jsonify({})
        response.headers.add("Access-Control-Allow-Origin", "*")
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type")
        return response

    data = request.json
    print("INCOMING JSON:", data)

    car_id = data.get("car_id")
    start = data.get("start_datetime")
    end = data.get("end_datetime")
    booked_by = data.get("booked_by")

    if not all([car_id, start, end, booked_by]):
        print("MISSING FIELD ERROR")
        return jsonify({"msg": "missing fields"}), 400

    if has_overlap(car_id, start, end):
        print("BLOCKED: CAR ALREADY BOOKED")
        return jsonify({"msg": "car already booked in that time slot"}), 409

    db = debug_db()
    cursor = db.cursor(dictionary=True)

    # Nieuw: track of mail wel/niet gelukt is
    email_sent = False

    try:
        cursor.execute(
            "INSERT INTO bookings (car_id, start_datetime, end_datetime, booked_by) VALUES (%s, %s, %s, %s)",
            (car_id, start, end, booked_by)
        )
        db.commit()
        new_id = cursor.lastrowid
        print("INSERTED BOOKING ID:", new_id)
        
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

            success, msg = send_booking_confirmation(
                user_email,
                user_name,
                new_id,
                car_info,
                start,
                end,
            )
            email_sent = bool(success)
            print("[EMAIL RESULT]", success, msg)
        else:
            print("[EMAIL] Skipped – no user_email in session or no car_data")
        
    except Exception as e:
        print("SQL ERROR:", e)
        db.rollback()
        cursor.close()
        db.close()
        return jsonify({"msg": "DB insert failed"}), 500

    cursor.close()
    db.close()

    return jsonify({
        "msg": "booking created",
        "id": new_id,
        "email_sent": email_sent
    }), 201

