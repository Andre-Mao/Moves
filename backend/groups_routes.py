from flask import Blueprint, request, jsonify
from models import db, Group, GroupMember, User, GroupInvitation
import secrets;

groups_bp = Blueprint('groups', __name__)

# get all groups for a user
@groups_bp.route('/user/<int:user_id>/groups', methods=['GET'])
def get_user_groups(user_id):
    memberships = GroupMember.query.filter_by(user_id=user_id).all()
    group_ids = [m.group_id for m in memberships]
    groups = Group.query.filter(Group.id.in_(group_ids)).all()
    return jsonify([group.to_dict() for group in groups])

# create a new group
@groups_bp.route('/groups', methods=['POST'])
def create_group():
    data = request.json

    # generate unique join key
    join_key = secrets.token_urlsafe(8)

    new_group = Group(
        name=data['name'],
        created_by=data['created_by'],
        join_key=join_key
    )
    db.session.add(new_group)
    db.session.commit()
    
    # automatically add creator as a member
    membership = GroupMember(
        group_id=new_group.id,
        user_id=data['created_by']
    )
    db.session.add(membership)
    db.session.commit()
    
    return jsonify(new_group.to_dict()), 201

# join a group
@groups_bp.route('/join', methods=['POST'])
def join_group_by_key():
    data = request.json

    # find group by join key
    group = Group.query.filter_by(join_key=data['join_key']).first()

    if not group:
        return jsonify({"error": "Invalid join key"}), 404
    
    # check if already a member
    existing = GroupMember.query.filter_by(
        group_id=group.id, 
        user_id=data['user_id']
    ).first()
    
    if existing:
        return jsonify({"error": "Already a member"}), 400
    
    membership = GroupMember(
        group_id=group.id,
        user_id=data['user_id']
    )
    db.session.add(membership)
    db.session.commit()
    
    return jsonify({"message": "Joined group successfully", "group": group.to_dict()}), 200

# invite a friend to a group
@groups_bp.route('/<int:group_id>/add-member', methods=['POST'])
def send_group_invitation(group_id):
    data = request.json
    user_id = data['user_id']  # The friend being invited
    invited_by = data['added_by']  # Current user inviting them
    
    # Check if group exists
    group = Group.query.get_or_404(group_id)
    
    # Check if the person inviting is a member
    is_member = GroupMember.query.filter_by(
        group_id=group_id,
        user_id=invited_by
    ).first()
    
    if not is_member:
        return jsonify({"error": "You must be a member to invite others"}), 403
    
    # Check if friend is already a member
    already_member = GroupMember.query.filter_by(
        group_id=group_id,
        user_id=user_id
    ).first()
    
    if already_member:
        return jsonify({"error": "User is already a member"}), 400
    
    # Check if invitation already exists
    existing_invite = GroupInvitation.query.filter_by(
        group_id=group_id,
        user_id=user_id,
        status='pending'
    ).first()
    
    if existing_invite:
        return jsonify({"error": "Invitation already sent"}), 400
    
    # Create invitation
    invitation = GroupInvitation(
        group_id=group_id,
        user_id=user_id,
        invited_by=invited_by,
        status='pending'
    )
    
    db.session.add(invitation)
    db.session.commit()
    
    return jsonify({"message": "Group invitation sent successfully"}), 201

# get pending group invitations for a user
@groups_bp.route('/user/<int:user_id>/invitations', methods=['GET'])
def get_group_invitations(user_id):
    invitations = GroupInvitation.query.filter_by(user_id=user_id, status='pending').all()
    
    invite_list = []
    for invite in invitations:
        group = Group.query.get(invite.group_id)
        inviter = User.query.get(invite.invited_by)
        invite_list.append({
            'id': invite.id,
            'group': group.to_dict(),
            'invited_by': inviter.to_dict(),
            'created_at': invite.created_at.isoformat()
        })
    
    return jsonify(invite_list)

# accept group invitation
@groups_bp.route('/invitations/<int:invitation_id>/accept', methods=['POST'])
def accept_group_invitation(invitation_id):
    invitation = GroupInvitation.query.get_or_404(invitation_id)
    
    # Add user to group
    new_member = GroupMember(
        group_id=invitation.group_id,
        user_id=invitation.user_id
    )
    
    db.session.add(new_member)
    invitation.status = 'accepted'
    db.session.commit()
    
    return jsonify({"message": "Group invitation accepted"}), 200

# decline group invitation
@groups_bp.route('/invitations/<int:invitation_id>/decline', methods=['POST'])
def decline_group_invitation(invitation_id):
    invitation = GroupInvitation.query.get_or_404(invitation_id)
    invitation.status = 'declined'
    db.session.commit()
    
    return jsonify({"message": "Group invitation declined"}), 200 

# get group settings (only for group leader)
@groups_bp.route('/<int:group_id>/settings', methods=['GET'])
def get_group_settings(group_id):
    group = Group.query.get_or_404(group_id)
    return jsonify(group.to_dict())

# update group settings (only for group leader)
@groups_bp.route('/<int:group_id>/settings', methods=['PUT'])
def update_group_settings(group_id):
    data = request.json
    user_id = data.get('user_id')
    
    group = Group.query.get_or_404(group_id)
    
    # check if group leader
    if group.created_by != user_id:
        return jsonify({"error": "Only the group owner can update settings"}), 403
    
    # update settings
    if 'min_votes_required' in data:
        group.min_votes_required = data['min_votes_required']
    if 'vote_deadline_hours' in data:
        group.vote_deadline_hours = data['vote_deadline_hours']
    
    db.session.commit()
    
    return jsonify({"message": "Settings updated successfully", "group": group.to_dict()})

# check and delete moves that haven't met vote threshold
@groups_bp.route('/<int:group_id>/cleanup-moves', methods=['POST'])
def cleanup_expired_moves(group_id):
    from models import Move, Vote
    from datetime import datetime, timezone, timedelta
    
    group = Group.query.get_or_404(group_id)
    
    # get all moves in this group
    moves = Move.query.filter_by(group_id=group_id).all()
    
    deleted_count = 0
    for move in moves:
        # calculate deadline
        deadline = move.created_at + timedelta(hours=group.vote_deadline_hours)
        
        # check if deadline has passed
        if datetime.now(timezone.utc) > deadline:
            # Count votes for this move
            vote_count = Vote.query.filter_by(move_id=move.id).count()
            
            # delete if votes don't meet threshold
            if vote_count < group.min_votes_required:
                Vote.query.filter_by(move_id=move.id).delete()
                db.session.delete(move)
                deleted_count += 1
    
    db.session.commit()
    
    return jsonify({
        "message": f"Cleanup complete. {deleted_count} move(s) deleted.",
        "deleted_count": deleted_count
    })

# get member count for a group
@groups_bp.route('/<int:group_id>/member-count', methods=['GET'])
def get_member_count(group_id):
    count = GroupMember.query.filter_by(group_id=group_id).count()
    return jsonify({"count": count})