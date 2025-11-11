"""
Database Population Script for Team Chat API
Run this script to populate your database with sample data.

Usage:
1. Make sure your FastAPI server is running
2. Run: python populate_db.py
"""

import requests
import time
from datetime import datetime

BASE_URL = "http://localhost:8000"

def create_users():
    """Create sample users"""
    users = [
        {"name": "Alice Johnson", "email": "alice@example.com", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=alice"},
        {"name": "Bob Smith", "email": "bob@example.com", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=bob"},
        {"name": "Carol Williams", "email": "carol@example.com", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=carol"},
        {"name": "David Brown", "email": "david@example.com", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=david"},
        {"name": "Eve Martinez", "email": "eve@example.com", "avatar": "https://api.dicebear.com/7.x/avataaars/svg?seed=eve"},
    ]
    
    created_users = []
    print("Creating users...")
    for user in users:
        try:
            response = requests.post(f"{BASE_URL}/users", json=user)
            if response.status_code == 200:
                created_user = response.json()
                created_users.append(created_user)
                print(f"✓ Created user: {user['name']}")
            else:
                print(f"✗ Failed to create user {user['name']}: {response.text}")
        except Exception as e:
            print(f"✗ Error creating user {user['name']}: {str(e)}")
    
    return created_users

def create_channels():
    """Create sample channels"""
    channels = [
        {"name": "general", "description": "General discussion for the team", "is_private": False},
        {"name": "random", "description": "Random chat and fun stuff", "is_private": False},
        {"name": "dev-team", "description": "Development team discussions", "is_private": False},
        {"name": "announcements", "description": "Important team announcements", "is_private": False},
        {"name": "project-alpha", "description": "Project Alpha planning", "is_private": True},
    ]
    
    created_channels = []
    print("\nCreating channels...")
    for channel in channels:
        try:
            response = requests.post(f"{BASE_URL}/channels", json=channel)
            if response.status_code == 200:
                created_channel = response.json()
                created_channels.append(created_channel)
                print(f"✓ Created channel: #{channel['name']}")
            else:
                print(f"✗ Failed to create channel {channel['name']}: {response.text}")
        except Exception as e:
            print(f"✗ Error creating channel {channel['name']}: {str(e)}")
    
    return created_channels

def create_messages(users, channels):
    """Create sample messages"""
    if not users or not channels:
        print("No users or channels available to create messages")
        return []
    
    # Sample messages for different channels
    messages_data = [
        # General channel
        {"channel": "general", "user_idx": 0, "content": "Hey everyone! Welcome to the team chat! 👋"},
        {"channel": "general", "user_idx": 1, "content": "Thanks Alice! Excited to be here!"},
        {"channel": "general", "user_idx": 2, "content": "Great to see everyone online. Let's have a productive week!"},
        {"channel": "general", "user_idx": 3, "content": "Anyone up for lunch later?"},
        {"channel": "general", "user_idx": 4, "content": "I'm in! How about that new place downtown?"},
        
        # Random channel
        {"channel": "random", "user_idx": 1, "content": "Just watched an amazing documentary about space exploration 🚀"},
        {"channel": "random", "user_idx": 2, "content": "Oh nice! What was it called?"},
        {"channel": "random", "user_idx": 0, "content": "Weekend plans anyone? I'm thinking hiking 🏔️"},
        {"channel": "random", "user_idx": 3, "content": "Coffee recommendations? Need a new favorite spot ☕"},
        
        # Dev team channel
        {"channel": "dev-team", "user_idx": 1, "content": "Starting the sprint planning. Let's review the backlog."},
        {"channel": "dev-team", "user_idx": 2, "content": "I've finished the authentication module. Ready for review!"},
        {"channel": "dev-team", "user_idx": 3, "content": "Working on the API endpoints today. Should be done by EOD."},
        {"channel": "dev-team", "user_idx": 0, "content": "Great progress team! Let's do a code review session tomorrow."},
        {"channel": "dev-team", "user_idx": 4, "content": "Found a bug in the user service. Creating a ticket now."},
        
        # Announcements channel
        {"channel": "announcements", "user_idx": 0, "content": "🎉 Team meeting scheduled for Friday at 2 PM. Please mark your calendars!"},
        {"channel": "announcements", "user_idx": 0, "content": "Reminder: Code freeze starts Wednesday for the production deployment."},
        {"channel": "announcements", "user_idx": 2, "content": "New security guidelines have been posted. Please review by end of week."},
        
        # Project Alpha channel
        {"channel": "project-alpha", "user_idx": 1, "content": "Initial designs for Project Alpha are ready for review."},
        {"channel": "project-alpha", "user_idx": 3, "content": "Database schema looks good. Let's discuss performance optimization."},
        {"channel": "project-alpha", "user_idx": 4, "content": "Client feedback is positive! They want to proceed to the next phase."},
    ]
    
    created_messages = []
    print("\nCreating messages...")
    
    # Create a mapping of channel names to IDs
    channel_map = {ch['name']: ch['id'] for ch in channels}
    
    for msg_data in messages_data:
        channel_name = msg_data['channel']
        if channel_name not in channel_map:
            continue
        
        channel_id = channel_map[channel_name]
        user_idx = msg_data['user_idx']
        
        if user_idx >= len(users):
            continue
        
        user_id = users[user_idx]['id']
        
        message = {
            "content": msg_data['content'],
            "channel_id": channel_id,
            "user_id": user_id
        }
        
        try:
            response = requests.post(f"{BASE_URL}/messages", json=message)
            if response.status_code == 200:
                created_message = response.json()
                created_messages.append(created_message)
                print(f"✓ Created message in #{channel_name}: {msg_data['content'][:50]}...")
                time.sleep(0.1)  # Small delay to preserve message order
            else:
                print(f"✗ Failed to create message: {response.text}")
        except Exception as e:
            print(f"✗ Error creating message: {str(e)}")
    
    return created_messages

def add_reactions(messages, users):
    """Add sample reactions to messages"""
    if not messages or not users:
        print("No messages or users available to add reactions")
        return
    
    emojis = ["👍", "❤️", "😂", "🎉", "🚀", "👀", "🔥"]
    
    print("\nAdding reactions...")
    
    # Add reactions to some messages
    for i, message in enumerate(messages[:10]):  # React to first 10 messages
        num_reactions = min(i % 3 + 1, len(users))  # 1-3 reactions per message
        
        for j in range(num_reactions):
            reaction = {
                "message_id": message['id'],
                "user_id": users[j % len(users)]['id'],
                "emoji": emojis[j % len(emojis)]
            }
            
            try:
                response = requests.post(f"{BASE_URL}/reactions", json=reaction)
                if response.status_code == 200:
                    print(f"✓ Added reaction {reaction['emoji']} to message")
                else:
                    print(f"✗ Failed to add reaction: {response.text}")
            except Exception as e:
                print(f"✗ Error adding reaction: {str(e)}")
            
            time.sleep(0.05)

def pin_messages(messages, users):
    """Pin some important messages"""
    if not messages or not users:
        print("No messages or users available to pin")
        return
    
    print("\nPinning important messages...")
    
    # Pin the first message in announcements (if it exists)
    announcement_messages = [m for m in messages if "meeting" in m.get('content', '').lower() 
                            or "reminder" in m.get('content', '').lower()]
    
    for msg in announcement_messages[:2]:  # Pin first 2 announcement messages
        pin_request = {
            "is_pinned": True,
            "user_id": users[0]['id']
        }
        
        try:
            response = requests.patch(f"{BASE_URL}/messages/{msg['id']}/pin", json=pin_request)
            if response.status_code == 200:
                print(f"✓ Pinned message: {msg['content'][:50]}...")
            else:
                print(f"✗ Failed to pin message: {response.text}")
        except Exception as e:
            print(f"✗ Error pinning message: {str(e)}")

def main():
    print("=" * 60)
    print("DATABASE POPULATION SCRIPT")
    print("=" * 60)
    print(f"Target: {BASE_URL}")
    print()
    
    try:
        # Test connection
        response = requests.get(BASE_URL)
        if response.status_code != 200:
            print("✗ Cannot connect to the API. Make sure your FastAPI server is running!")
            return
        print("✓ Connected to API successfully!")
        print()
        
        # Create all data
        users = create_users()
        channels = create_channels()
        messages = create_messages(users, channels)
        add_reactions(messages, users)
        pin_messages(messages, users)
        
        print("\n" + "=" * 60)
        print("DATABASE POPULATION COMPLETE!")
        print("=" * 60)
        print(f"✓ Created {len(users)} users")
        print(f"✓ Created {len(channels)} channels")
        print(f"✓ Created {len(messages)} messages")
        print("\nYour database is now populated with sample data!")
        print("You can start using your chat application.")
        
    except requests.exceptions.ConnectionError:
        print("✗ Error: Cannot connect to the API!")
        print("Make sure your FastAPI server is running on http://localhost:8000")
    except Exception as e:
        print(f"✗ Unexpected error: {str(e)}")

if __name__ == "__main__":
    main()