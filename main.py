from flask import Flask 
from pytube import YouTube
from flask import Flask
from application.models import db

app = Flask(__name__,static_folder='static')
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.sqlite3'
db.init_app(app)
app.app_context().push()
db.create_all()



from application.controllers import *



if __name__ == '__main__':
    app.run(debug=True)
