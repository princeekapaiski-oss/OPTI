import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

SQLALCHEMY_DATABASE_URI = os.getenv(
    "DATABASE_URL",
    f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}"
)

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "dev-secret")
