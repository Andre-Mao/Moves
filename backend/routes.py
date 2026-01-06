from flask import Blueprint, request, jsonify
from models import db, Move, User, Group, Vote

api = Blueprint('api', __name__)

# Get all moves for a specific group
@api.route('/groups/<int:group_id>/moves', methods=['GET'])
def get_moves(group_id):
    moves = Move.query.filter_by(group_id=group_id).all()
    return jsonify([move.to_dict() for move in moves])

# Create a new move
@api.route('/groups/<int:group_id>/moves', methods=['POST'])
def create_move(group_id):
    data = request.json
    new_move = Move(
        name=data['name'],
        description=data.get('description', ''),
        group_id=group_id,
        created_by=data['created_by']
    )
    db.session.add(new_move)
    db.session.commit()
    return jsonify(new_move.to_dict()), 201

# Update a move
@api.route('/moves/<int:move_id>', methods=['PUT'])
def update_move(move_id):
    move = Move.query.get_or_404(move_id)
    data = request.json
    move.name = data.get('name', move.name)
    move.description = data.get('description', move.description)
    db.session.commit()
    return jsonify(move.to_dict())

# Delete a move
@api.route('/moves/<int:move_id>', methods=['DELETE'])
def delete_move(move_id):
    print(f"Attempting to delete move with ID: {move_id}")
    move = Move.query.get_or_404(move_id)
    print(f"Found move: {move.name}")
    db.session.delete(move)
    db.session.commit()
    print("Move deleted successfully")
    return jsonify({"message": "Move deleted"}), 200

@api.route('/test-delete/<int:move_id>', methods=['GET'])
def test_delete(move_id):
    move = Move.query.get_or_404(move_id)
    db.session.delete(move)
    db.session.commit()
    return jsonify({"message": f"Move {move_id} deleted"}), 200
