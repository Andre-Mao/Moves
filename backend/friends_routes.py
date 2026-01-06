from flask import Blueprint, request, jsonify
from models import db, Friendship, User, GroupMember, Group

friends_bp = Blueprint('friends', __name__)

@friends_bp.route('/request', methods=['POST'])
def send_friend_request():
    data = request.json
    user_id = data['user_id']
    friend_username = data['friend_username']

    # find a friend by their username
    friend = User.query.filter_by(username=friend_username).first()

    if not friend: 
        return jsonify({"error": "User not found"}), 404
    
    if friend.id == user_id:
        return jsonify({"error": "Cannot add yourself as friend"}), 400
    
    # check if friendship already exists
    existing = Friendship.query.filter(
        ((Friendship.user_id == user_id) & (Friendship.friend_id == friend.id)) |
        ((Friendship.user_id == friend.id) & (Friendship.friend_id == user_id))
    ).first()

    if existing:
        return jsonify({"error": "Friend request already exists"}), 400
    
    # create a friend request
    friendship = Friendship(
        user_id = user_id,
        friend_id = friend.id,
        status = 'pending'
    )

    db.session.add(friendship)
    db.session.commit()

    return jsonify({"message": "Friend request sent"}), 201

@friends_bp.route('/user/<int:user_id>', methods=['GET'])
def get_friends(user_id):
    # get accepted friendships
    friendships = Friendship.query.filter(
        ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) &
        (Friendship.status == 'accepted')
    ).all()

    friends = []
    for friendship in friendships:
        friend_id = friendship.friend_id if friendship.user_id == user_id else friendship.user_id
        friend = User.query.get(friend_id)
        if friend:
            friends.append(friend.to_dict())

    return jsonify(friends)

@friends_bp.route('/user/<int:user_id>/requests', methods=['GET'])
def get_friend_requests(user_id):
    # get pending requests where user is the recipient
    requests = Friendship.query.filter_by(friend_id=user_id, status='pending').all()

    request_list = []
    for req in requests:
        sender = User.query.get(req.user_id)
        if sender:
            request_list.append({
                'id': req.id,
                'user': sender.to_dict(),
                'created_at': req.created_at.isoformat()
            })
    return jsonify(request_list)

@friends_bp.route('/accept/<int:friendship_id>', methods=['POST'])
def accept_friend_request(friendship_id):
    friendship = Friendship.query.get_or_404(friendship_id)
    friendship.status = 'accepted'
    db.session.commit()

    return jsonify({"message": "Friend request accepted"})

@friends_bp.route('/remove/<int:friendship_id>', methods=['DELETE'])
def remove_friend(friendship_id):
    friendship = Friendship.query.get_or_404(friendship_id)
    db.session.delete(friendship)
    db.session.commit()
    
    return jsonify({"message": "Friendship removed"})

@friends_bp.route('/profile/<int:user_id>', methods=['GET'])
def get_user_profile(user_id):
    # get user profile information
    current_user_id = request.args.get('current_user_id', type=int)

    user = User.query.get_or_404(user_id)

    # count the number of friends
    friend_count = Friendship.query.filter(
        ((Friendship.user_id == user_id) | (Friendship.friend_id == user_id)) &
        (Friendship.status == 'accepted')
    ).count()

    # count the number of groups
    group_count = GroupMember.query.filter_by(user_id=user_id).count()

    # get mutual groups if current_user_id provided
    mutual_groups = []
    if current_user_id:
        user_groups = GroupMember.query.filter_by(user_id = user_id).all()
        current_user_groups = GroupMember.query.filter_by(user_id=current_user_id).all()

        user_group_ids = [g.group_id for g in user_groups]
        current_user_group_ids = [g.group_id for g in current_user_groups]

        mutual_group_ids = set(user_group_ids).intersection(set(current_user_group_ids))
        mutual_groups = Group.query.filter(Group.id.in_(mutual_group_ids)).all()
        mutual_groups = [g.to_dict() for g in mutual_groups]

    return jsonify({
        'user': user.to_dict(),
        'friend_count': friend_count,
        'group_count': group_count,
        'mutual_groups': mutual_groups
    })

