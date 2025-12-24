from flask_sqlalchemy import SQLAlchemy
import uuid

db = SQLAlchemy()

class User(db.Model):
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password = db.Column(db.String(200), nullable=False)

class Project(db.Model):
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(120), nullable=False)
    owner_id = db.Column(db.String, db.ForeignKey('user.id'), nullable=False)

class Edge(db.Model):
    id = db.Column(db.String, primary_key=True, default=lambda: str(uuid.uuid4()))
    project_id = db.Column(db.String, db.ForeignKey('project.id'), nullable=False)
    u = db.Column(db.String(50), nullable=False)
    v = db.Column(db.String(50), nullable=False)
    cost = db.Column(db.Float, nullable=False)
    capacity = db.Column(db.Float, nullable=False)
