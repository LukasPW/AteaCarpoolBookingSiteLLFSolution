from flask import Flask, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from config import Config
from routes.cars import cars_bp
from routes.auth import auth_bp
from routes.bookings import booking_bp

load_dotenv()

def create_app():
    app = Flask(__name__)
    app.config.from_object(Config)

    # Register blueprints
    app.register_blueprint(cars_bp)
    app.register_blueprint(auth_bp)
    app.register_blueprint(booking_bp)

    # Enable CORS for /api/* endpoints
    CORS(
        app,
        resources={r"/api/*": {"origins": ["http://localhost", "http://127.0.0.1"]}},
        supports_credentials=True,
    )

    # error handlers
    @app.errorhandler(404)
    def not_found(e):
        return jsonify({"error": "Not found"}), 404

    @app.errorhandler(500)
    def server_error(e):
        return jsonify({"error": "Internal server error"}), 500

    return app

if __name__ == "__main__":
    app = create_app()
    app.run(host="0.0.0.0", port=5000, debug=True)