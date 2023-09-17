from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class Queue(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    song_name = db.Column(db.String(255), nullable=False)
    song_path = db.Column(db.String(255), nullable=False)
