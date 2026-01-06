from flask import Blueprint, request, jsonify
from models import db, Message, User

messages_bp = Blueprint('messages', __name__)

# gend a message
@messages_bp.route('/send', methods=['POST'])
def send_message():
    data = request.json
    
    new_message = Message(
        sender_id=data['sender_id'],
        recipient_id=data['recipient_id'],
        content=data['content']
    )
    
    db.session.add(new_message)
    db.session.commit()
    
    return jsonify({"message": "Message sent successfully"}), 201

# get conversation between two users
@messages_bp.route('/conversation/<int:user1_id>/<int:user2_id>', methods=['GET'])
def get_conversation(user1_id, user2_id):
    messages = Message.query.filter(
        ((Message.sender_id == user1_id) & (Message.recipient_id == user2_id)) |
        ((Message.sender_id == user2_id) & (Message.recipient_id == user1_id))
    ).order_by(Message.created_at.asc()).all()
    
    # mark messages as read
    for msg in messages:
        if msg.recipient_id == user1_id and not msg.read:
            msg.read = True
    
    db.session.commit()
    
    return jsonify([msg.to_dict() for msg in messages])

# get all conversations for a user (list of people they've messaged)
@messages_bp.route('/user/<int:user_id>/conversations', methods=['GET'])
def get_user_conversations(user_id):
    # get all unique users this user has messaged or received messages from
    sent_messages = Message.query.filter_by(sender_id=user_id).all()
    received_messages = Message.query.filter_by(recipient_id=user_id).all()
    
    user_ids = set()
    for msg in sent_messages:
        user_ids.add(msg.recipient_id)
    for msg in received_messages:
        user_ids.add(msg.sender_id)
    
    conversations = []
    for uid in user_ids:
        user = User.query.get(uid)
        if user:
            # get last message
            last_msg = Message.query.filter(
                ((Message.sender_id == user_id) & (Message.recipient_id == uid)) |
                ((Message.sender_id == uid) & (Message.recipient_id == user_id))
            ).order_by(Message.created_at.desc()).first()
            
            # count unread messages
            unread_count = Message.query.filter_by(
                sender_id=uid,
                recipient_id=user_id,
                read=False
            ).count()
            
            conversations.append({
                'user': user.to_dict(),
                'last_message': last_msg.to_dict() if last_msg else None,
                'unread_count': unread_count
            })
    
    # sort by last message time
    conversations.sort(key=lambda x: x['last_message']['created_at'] if x['last_message'] else '', reverse=True)
    
    return jsonify(conversations) 