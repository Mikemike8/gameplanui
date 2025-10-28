# seed_data.py
from main import SessionLocal, User, Channel, ChannelMember, MemberRole
import uuid

def seed_database():
    db = SessionLocal()
    
    # Create users
    users = [
        User(
            id=str(uuid.uuid4()),
            name="Sarah Johnson",
            email="sarah@example.com",
            avatar="https://api.dicebear.com/7.x/notionists/svg?seed=Sarah",
            status="online"
        ),
        User(
            id=str(uuid.uuid4()),
            name="Mike Chen",
            email="mike@example.com",
            avatar="https://api.dicebear.com/7.x/notionists/svg?seed=Mike",
            status="online"
        ),
        User(
            id=str(uuid.uuid4()),
            name="Emily Rodriguez",
            email="emily@example.com",
            avatar="https://api.dicebear.com/7.x/notionists/svg?seed=Emily",
            status="away"
        ),
    ]
    
    for user in users:
        db.add(user)
    
    # Create channels
    channels = [
        Channel(
            id=str(uuid.uuid4()),
            name="general",
            description="Team-wide announcements",
            is_private=False
        ),
        Channel(
            id=str(uuid.uuid4()),
            name="development",
            description="Dev discussions",
            is_private=False
        ),
        Channel(
            id=str(uuid.uuid4()),
            name="design",
            description="Design reviews",
            is_private=False
        ),
    ]
    
    for channel in channels:
        db.add(channel)
    
    db.commit()
    print("✅ Database seeded successfully!")
    db.close()

if __name__ == "__main__":
    seed_database()