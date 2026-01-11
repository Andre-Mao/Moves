from flask import Blueprint, request, jsonify
from models import db, Move, User, Group, Vote
from datetime import datetime, timezone, timedelta

api = Blueprint('api', __name__)

# Get all moves for a specific group
@api.route('/groups/<int:group_id>/moves', methods=['GET'])
def get_moves(group_id):
    group = Group.query.get_or_404(group_id)
    moves = Move.query.filter_by(group_id=group_id).all()
    
    moves_data = []
    for move in moves:
        move_dict = move.to_dict()
        
        # Make created_at timezone-aware if it isn't already
        created_at = move.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        
        # Calculate time remaining
        deadline = created_at + timedelta(hours=group.vote_deadline_hours)
        now = datetime.now(timezone.utc)
        time_remaining = (deadline - now).total_seconds()
        
        move_dict['deadline'] = deadline.isoformat()
        move_dict['time_remaining_seconds'] = max(0, time_remaining)
        move_dict['is_expired'] = time_remaining <= 0
        
        moves_data.append(move_dict)
    
    return jsonify(moves_data)

# Create a new move
@api.route('/groups/<int:group_id>/moves', methods=['POST'])
def create_move(group_id):
    try:
        data = request.json
        print(f"Creating move with data: {data}")
        
        group = Group.query.get_or_404(group_id)
        print(f"Found group: {group.name}")
        
        new_move = Move(
            name=data['name'],
            description=data.get('description', ''),
            group_id=group_id,
            created_by=data['created_by']
        )
        db.session.add(new_move)
        db.session.commit()
        print(f"Move created with ID: {new_move.id}")
        
        # Make created_at timezone-aware if it isn't already
        created_at = new_move.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        
        # Return move with deadline info like in get_moves
        move_dict = new_move.to_dict()
        deadline = created_at + timedelta(hours=group.vote_deadline_hours)
        now = datetime.now(timezone.utc)
        time_remaining = (deadline - now).total_seconds()
        
        move_dict['deadline'] = deadline.isoformat()
        move_dict['time_remaining_seconds'] = max(0, time_remaining)
        move_dict['is_expired'] = time_remaining <= 0
        
        print(f"Returning move dict: {move_dict}")
        return jsonify(move_dict), 201
    except Exception as e:
        print(f"Error creating move: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# Update a move
@api.route('/moves/<int:move_id>', methods=['PUT'])
def update_move(move_id):
    try:
        move = Move.query.get_or_404(move_id)
        group = Group.query.get(move.group_id)
        data = request.json
        move.name = data.get('name', move.name)
        move.description = data.get('description', move.description)
        db.session.commit()
        
        # Make created_at timezone-aware if it isn't already
        created_at = move.created_at
        if created_at.tzinfo is None:
            created_at = created_at.replace(tzinfo=timezone.utc)
        
        # Return move with deadline info
        move_dict = move.to_dict()
        deadline = created_at + timedelta(hours=group.vote_deadline_hours)
        now = datetime.now(timezone.utc)
        time_remaining = (deadline - now).total_seconds()
        
        move_dict['deadline'] = deadline.isoformat()
        move_dict['time_remaining_seconds'] = max(0, time_remaining)
        move_dict['is_expired'] = time_remaining <= 0
        
        return jsonify(move_dict)
    except Exception as e:
        print(f"Error updating move: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

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