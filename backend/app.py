from flask import Flask, jsonify
from flask_cors import CORS
from models import db
from routes import api
from auth import auth
from groups_routes import groups_bp
from friends_routes import friends_bp
from messages_routes import messages_bp
from votes_routes import votes_bp

app = Flask(__name__)
CORS(app, resources={
    r"/api/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST", "PUT", "DELETE"]},
    r"/auth/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST"]},
    r"/groups/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST", "PUT", "DELETE"]},
    r"/friends/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST", "DELETE"]},
    r"/messages/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST"]},
    r"/votes/*": {"origins": "http://localhost:3000", "methods": ["GET", "POST"]}
}) 

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///moves.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)
app.register_blueprint(api, url_prefix='/api')
app.register_blueprint(auth, url_prefix='/auth')
app.register_blueprint(groups_bp, url_prefix='/groups')
app.register_blueprint(friends_bp, url_prefix='/friends')
app.register_blueprint(messages_bp, url_prefix='/messages')
app.register_blueprint(votes_bp, url_prefix='/votes')

with app.app_context():
    db.create_all()

@app.route('/')
def home():
    return jsonify({"message": "Welcome to Moves API"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)
    