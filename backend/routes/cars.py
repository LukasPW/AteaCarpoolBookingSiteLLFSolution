from flask import Blueprint, jsonify
from db import get_conn

cars_bp = Blueprint("cars", __name__, url_prefix="/api")

@cars_bp.route("/cars", methods=["GET"])
def get_cars():
    sql = """
        SELECT c.id, c.make, c.model, c.year, c.fuel_type, c.seats, c.body_style,
               c.license_plate, c.image,
               b.start_datetime, b.end_datetime, b.booked_by
        FROM cars c
        LEFT JOIN bookings b ON b.car_id = c.id
        ORDER BY c.id, b.start_datetime
    """
    conn = get_conn()
    try:
        cur = conn.cursor(dictionary=True)
        cur.execute(sql)
        rows = cur.fetchall()
    finally:
        conn.close()

    cars = {}
    for row in rows:
        cid = int(row["id"])
        if cid not in cars:
            cars[cid] = {
                "id": cid,
                "make": row["make"],
                "model": row["model"],
                "year": int(row["year"]),
                "fuel_type": row["fuel_type"],
                "seats": int(row["seats"]),
                "body_style": row["body_style"],
                "license_plate": row["license_plate"],
                "image": row["image"],
                "bookings": [],
            }
        if row["start_datetime"] and row["end_datetime"]:
            cars[cid]["bookings"].append({
                "start": row["start_datetime"].isoformat(),
                "end": row["end_datetime"].isoformat(),
                "bookedBy": row["booked_by"],
            })

    return jsonify(list(cars.values()))
