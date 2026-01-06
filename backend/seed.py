from app import app
from models import db, User, Group, GroupMember, Move
from werkzeug.security import generate_password_hash
import secrets;

with app.app_context():
    db.drop_all()
    db.create_all()

    user1 = User(
        username='john',
        email='john@example.com',
        password_hash=generate_password_hash('password123')
    )
    user2 = User(
        username='jane',
        email='jane@example.com',
        password_hash=generate_password_hash('password123')
    )
    db.session.add(user1)
    db.session.add(user2)
    db.session.commit()

    # Create a test group
    group1 = Group(
        name='Weekend Warriors',
        created_by=user1.id,
        join_key=secrets.token_urlsafe(8)
    )
    db.session.add(group1)
    db.session.commit()

    # Add users to group
    member1 = GroupMember(group_id=group1.id, user_id=user1.id)
    member2 = GroupMember(group_id=group1.id, user_id=user2.id)
    db.session.add(member1)
    db.session.add(member2)
    db.session.commit()

    # Create test moves
    move1 = Move(
        name='Pizza Night',
        description='Order pizza and watch movies',
        group_id=group1.id,
        created_by=user1.id
    )
    move2 = Move(
        name='Hiking Trip',
        description='Morning hike at the local trail',
        group_id=group1.id,
        created_by=user2.id
    )
    db.session.add(move1)
    db.session.add(move2)
    db.session.commit()

    print("Test data created successfully!")
    print(f"User 1: {user1.username} (ID: {user1.id})")
    print(f"User 2: {user2.username} (ID: {user2.id})")
    print(f"Group: {group1.name} (ID: {group1.id})")
    print(f"Move 1: {move1.name} (ID: {move1.id})")
    print(f"Move 2: {move2.name} (ID: {move2.id})")
