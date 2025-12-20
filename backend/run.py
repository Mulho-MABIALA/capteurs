import os
from app import create_app

# Create Flask app
config_name = os.getenv('FLASK_ENV', 'development')
app = create_app(config_name)

if __name__ == '__main__':
    host = os.getenv('HOST', '0.0.0.0')
    port = int(os.getenv('PORT', 5000))

    print(f"Starting IoT Platform Backend on {host}:{port}")
    app.run(host=host, port=port, debug=True)
