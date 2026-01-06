from flask import Blueprint, request, jsonify
from models import db, Vote, Move, User

votes_bp = Blueprint('votes', __name__)

# vote on a move
@votes_bp.route('/move/<int:move_id>/vote', methods=['POST'])
def toggle_vote(move_id):
    data = request.json
    user_id = data['user_id']
    
    existing_vote = Vote.query.filter_by(move_id=move_id, user_id=user_id).first()
    
    if existing_vote:
        # remove vote
        db.session.delete(existing_vote)
        db.session.commit()
        return jsonify({"message": "Vote removed", "voted": False})
    else:
        # add vote
        new_vote = Vote(
            move_id=move_id,
            user_id=user_id
        )
        db.session.add(new_vote)
        db.session.commit()
        return jsonify({"message": "Vote added", "voted": True})

# get votes for a move
@votes_bp.route('/move/<int:move_id>', methods=['GET'])
def get_move_votes(move_id):
    votes = Vote.query.filter_by(move_id=move_id).all()
    
    vote_list = []
    for vote in votes:
        user = User.query.get(vote.user_id)
        if user:
            vote_list.append({
                'id': vote.id,
                'user': user.to_dict(),
                'created_at': vote.created_at.isoformat()
            })
    
    return jsonify({
        'vote_count': len(vote_list),
        'votes': vote_list
    })

# get all votes for moves in a group
@votes_bp.route('/group/<int:group_id>', methods=['GET'])
def get_group_votes(group_id):
    moves = Move.query.filter_by(group_id=group_id).all()
    
    votes_data = {}
    for move in moves:
        votes = Vote.query.filter_by(move_id=move.id).all()
        votes_data[move.id] = {
            'vote_count': len(votes),
            'voter_ids': [v.user_id for v in votes]
        }
    
    return jsonify(votes_data) 