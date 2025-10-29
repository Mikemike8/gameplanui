# main.py
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, Boolean, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from datetime import datetime
from typing import Optional, List\
#SQLAlchemy imports
import socketio # Socket.IO server
import enum
import uuid

# ----------------------
# PostgreSQL connection
# ----------------------
DB_USER = "postgres"
DB_PASSWORD = "Lilmike800#"
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "PythonFastApi"

DATABASE_URL = f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# ----------------------
# Enums
# ----------------------
class UserStatus(str, enum.Enum):
    online = "online"
    away = "away"
    offline = "offline"

class MemberRole(str, enum.Enum):
    owner = "owner"
    admin = "admin"
    member = "member"

# ----------------------
# Database Models
# ----------------------
class User(Base):
    __tablename__ = "users"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    email = Column(String(255), nullable=False, unique=True)
    avatar = Column(String(500))
    status = Column(SQLEnum(UserStatus), default=UserStatus.online)
    last_seen = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

class Channel(Base):
    __tablename__ = "channels"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    workspace_id = Column(String(36))
    name = Column(String(100), nullable=False, unique=True)
    description = Column(Text)
    is_private = Column(Boolean, default=False)
    created_by = Column(String(36), ForeignKey('users.id'))
    created_at = Column(DateTime, default=datetime.utcnow)

class ChannelMember(Base):
    __tablename__ = "channel_members"
    id = Column(Integer, primary_key=True, autoincrement=True)
    channel_id = Column(String(36), ForeignKey('channels.id'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    role = Column(SQLEnum(MemberRole), default=MemberRole.member)
    joined_at = Column(DateTime, default=datetime.utcnow)

class Message(Base):
    __tablename__ = "messages"
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    channel_id = Column(String(36), ForeignKey('channels.id'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    content = Column(Text, nullable=False)
    is_pinned = Column(Boolean, default=False)
    pinned_by = Column(String(36), ForeignKey('users.id'), nullable=True)
    pinned_at = Column(DateTime, nullable=True)
    parent_message_id = Column(String(36), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    edited_at = Column(DateTime, nullable=True)
    deleted_at = Column(DateTime, nullable=True)

class MessageReaction(Base):
    __tablename__ = "message_reactions"
    id = Column(Integer, primary_key=True, autoincrement=True)
    message_id = Column(String(36), ForeignKey('messages.id'), nullable=False)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    emoji = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class UserReadMarker(Base):
    __tablename__ = "user_read_markers"
    id = Column(Integer, primary_key=True, autoincrement=True)
    user_id = Column(String(36), ForeignKey('users.id'), nullable=False)
    channel_id = Column(String(36), ForeignKey('channels.id'), nullable=False)
    last_read_message_id = Column(String(36))
    last_read_at = Column(DateTime, default=datetime.utcnow)

# Create all tables
Base.metadata.create_all(bind=engine)

# ----------------------
# Pydantic Models
# ----------------------
class UserCreate(BaseModel):
    name: str
    email: str
    avatar: Optional[str] = None

class ChannelCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_private: bool = False

class MessageCreate(BaseModel):
    content: str
    channel_id: str
    user_id: str

class ReactionCreate(BaseModel):
    message_id: str
    user_id: str
    emoji: str

class PinMessageRequest(BaseModel):
    is_pinned: bool
    user_id: str

# ----------------------
# Socket.IO setup
# ----------------------
sio = socketio.AsyncServer(
    async_mode='asgi',
    cors_allowed_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "https://gameplanuipro.onrender.com" 
    ]
)

# ----------------------
# FastAPI app
# ----------------------
app = FastAPI(title="Team Chat API")

origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://gameplanuipro.onrender.com" 
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Combine with Socket.IO
socket_app = socketio.ASGIApp(sio, app)

# ----------------------
# Socket.IO events
# ----------------------
@sio.event
async def connect(sid, environ):
    print(f"Client connected: {sid}")

@sio.event
async def disconnect(sid):
    print(f"Client disconnected: {sid}")

# ----------------------
# Dependency
# ----------------------
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ----------------------
# USER ROUTES
# ----------------------
@app.post("/users")
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == user.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already exists")
    
    db_user = User(
        id=str(uuid.uuid4()),
        name=user.name,
        email=user.email,
        avatar=user.avatar or f"https://api.dicebear.com/7.x/notionists/svg?seed={user.name}"
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.get("/users")
def get_users(db: Session = Depends(get_db)):
    return db.query(User).all()

@app.get("/users/{user_id}")
def get_user(user_id: str, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

# ----------------------
# CHANNEL ROUTES
# ----------------------
@app.post("/channels")
def create_channel(channel: ChannelCreate, db: Session = Depends(get_db)):
    existing = db.query(Channel).filter(Channel.name == channel.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Channel name already exists")
    
    db_channel = Channel(
        id=str(uuid.uuid4()),
        name=channel.name,
        description=channel.description,
        is_private=channel.is_private
    )
    db.add(db_channel)
    db.commit()
    db.refresh(db_channel)
    return db_channel

@app.get("/channels")
def get_channels(db: Session = Depends(get_db)):
    return db.query(Channel).all()

@app.get("/channels/{channel_id}")
def get_channel(channel_id: str, db: Session = Depends(get_db)):
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="Channel not found")
    return channel

# ----------------------
# MESSAGE ROUTES
# ----------------------
@app.post("/messages")
async def create_message(message: MessageCreate, db: Session = Depends(get_db)):
    # Get user info
    user = db.query(User).filter(User.id == message.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create message
    db_message = Message(
        id=str(uuid.uuid4()),
        content=message.content,
        channel_id=message.channel_id,
        user_id=message.user_id
    )
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    
    # Prepare message data for broadcast
    message_data = {
        "id": db_message.id,
        "content": db_message.content,
        "timestamp": db_message.created_at.isoformat(),
        "user": {
            "id": user.id,
            "name": user.name,
            "avatar": user.avatar,
            "status": user.status.value
        },
        "reactions": [],
        "isPinned": False
    }
    
    # Broadcast to all connected clients
    await sio.emit('new-message', message_data)
    
    return message_data

@app.get("/messages")
def get_messages(channel_id: Optional[str] = None, db: Session = Depends(get_db)):
    query = db.query(Message)
    if channel_id:
        query = query.filter(Message.channel_id == channel_id)
    
    messages = query.order_by(Message.created_at).all()
    
    result = []
    for msg in messages:
        user = db.query(User).filter(User.id == msg.user_id).first()
        reactions = db.query(MessageReaction).filter(MessageReaction.message_id == msg.id).all()
        
        # Group reactions by emoji
        reaction_dict = {}
        for r in reactions:
            if r.emoji not in reaction_dict:
                reaction_dict[r.emoji] = {"emoji": r.emoji, "count": 0, "users": []}
            reaction_dict[r.emoji]["count"] += 1
            reaction_dict[r.emoji]["users"].append(r.user_id)
        
        result.append({
            "id": msg.id,
            "content": msg.content,
            "timestamp": msg.created_at.isoformat(),
            "user": {
                "id": user.id,
                "name": user.name,
                "avatar": user.avatar,
                "status": user.status.value
            } if user else None,
            "reactions": list(reaction_dict.values()),
            "isPinned": msg.is_pinned,
            "pinnedBy": msg.pinned_by
        })
    
    return result

@app.patch("/messages/{message_id}/pin")
async def toggle_pin_message(message_id: str, request: PinMessageRequest, db: Session = Depends(get_db)):
    message = db.query(Message).filter(Message.id == message_id).first()
    if not message:
        raise HTTPException(status_code=404, detail="Message not found")
    
    message.is_pinned = request.is_pinned
    message.pinned_by = request.user_id if request.is_pinned else None
    message.pinned_at = datetime.utcnow() if request.is_pinned else None
    
    db.commit()
    db.refresh(message)
    
    # Broadcast pin update
    await sio.emit('message-pinned', {
        "message_id": message_id,
        "is_pinned": message.is_pinned,
        "pinned_by": message.pinned_by
    })
    
    return {"message": "Pin status updated", "is_pinned": message.is_pinned}

# ----------------------
# REACTION ROUTES
# ----------------------
@app.post("/reactions")
async def add_reaction(reaction: ReactionCreate, db: Session = Depends(get_db)):
    # Check if reaction already exists
    existing = db.query(MessageReaction).filter(
        MessageReaction.message_id == reaction.message_id,
        MessageReaction.user_id == reaction.user_id,
        MessageReaction.emoji == reaction.emoji
    ).first()
    
    if existing:
        # Remove reaction (toggle off)
        db.delete(existing)
        db.commit()
        action = "removed"
    else:
        # Add reaction
        db_reaction = MessageReaction(
            message_id=reaction.message_id,
            user_id=reaction.user_id,
            emoji=reaction.emoji
        )
        db.add(db_reaction)
        db.commit()
        action = "added"
    
    # Broadcast reaction update
    await sio.emit('reaction-updated', {
        "message_id": reaction.message_id,
        "user_id": reaction.user_id,
        "emoji": reaction.emoji,
        "action": action
    })
    
    return {"message": f"Reaction {action}", "emoji": reaction.emoji}

@app.get("/messages/{message_id}/reactions")
def get_reactions(message_id: str, db: Session = Depends(get_db)):
    reactions = db.query(MessageReaction).filter(MessageReaction.message_id == message_id).all()
    
    # Group by emoji
    reaction_dict = {}
    for r in reactions:
        if r.emoji not in reaction_dict:
            reaction_dict[r.emoji] = {"emoji": r.emoji, "count": 0, "users": []}
        reaction_dict[r.emoji]["count"] += 1
        reaction_dict[r.emoji]["users"].append(r.user_id)
    
    return list(reaction_dict.values())

# ----------------------
# READ MARKERS
# ----------------------
@app.post("/channels/{channel_id}/mark-read")
def mark_channel_read(channel_id: str, user_id: str, db: Session = Depends(get_db)):
    # Get last message in channel
    last_message = db.query(Message).filter(
        Message.channel_id == channel_id
    ).order_by(Message.created_at.desc()).first()
    
    if not last_message:
        return {"message": "No messages to mark as read"}
    
    # Update or create read marker
    marker = db.query(UserReadMarker).filter(
        UserReadMarker.user_id == user_id,
        UserReadMarker.channel_id == channel_id
    ).first()
    
    if marker:
        marker.last_read_message_id = last_message.id
        marker.last_read_at = datetime.utcnow()
    else:
        marker = UserReadMarker(
            user_id=user_id,
            channel_id=channel_id,
            last_read_message_id=last_message.id
        )
        db.add(marker)
    
    db.commit()
    return {"message": "Channel marked as read"}

# ----------------------
# Root route
# ----------------------
@app.get("/")
def hello_world():
    return {"message": "Team Chat API with WebSocket Support"}