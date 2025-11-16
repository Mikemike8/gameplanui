"""
🔥 TEAM CHAT BACKEND — FastAPI + SQLAlchemy + Socket.IO

Frontend expectations it supports:

REST:
- POST /users/me                          -> create or return backend user
- GET  /workspaces/my?user_id=...        -> list user's workspaces
- GET  /workspaces/{workspace_id}        -> workspace details
- POST /workspaces/create?user_id=...    -> create workspace
- POST /workspaces/join                  -> join via invite_code
- GET  /channels?workspace_id=...        -> list channels
- POST /channels                         -> create channel
- GET  /messages?channel_id=...          -> list messages in channel
- POST /messages                         -> create message
- PATCH /messages/{message_id}/pin       -> pin / unpin message
- POST /reactions                        -> toggle reaction on a message

Socket.IO events (server -> client):
- "new-message"      -> broadcast new message payload
- "message-pinned"   -> broadcast pin state changes
- "reaction-added"   -> broadcast new message reaction state

Socket.IO events (client -> server, optional / future-ready):
- "join_workspace"   -> join a workspace room
- "typing"           -> emit typing state (currently not used by FE)
"""

import os
import enum
import uuid
import secrets
import string
from datetime import datetime
from typing import Optional, Dict, Any, List

from dotenv import load_dotenv
from fastapi import FastAPI, Depends, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    Boolean,
    DateTime,
    ForeignKey,
    Enum as SQLEnum,
)
from sqlalchemy.orm import (
    declarative_base,
    sessionmaker,
    Session,
    relationship,
)
import socketio

# ------------------------------------------------------
# ENV & DATABASE CONFIG
# ------------------------------------------------------

load_dotenv()

DB_USER = os.getenv("DB_USER")
DB_PASSWORD = os.getenv("DB_PASSWORD")
DB_HOST = os.getenv("DB_HOST")
DB_PORT = os.getenv("DB_PORT")
DB_NAME = os.getenv("DB_NAME")

DATABASE_URL = (
    f"postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}"
)

print(f"🔌 Using database: {DATABASE_URL}")

engine = create_engine(DATABASE_URL, pool_pre_ping=True)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)
Base = declarative_base()

# ------------------------------------------------------
# ENUMS
# ------------------------------------------------------


class UserStatus(str, enum.Enum):
    online = "online"
    away = "away"
    offline = "offline"


# ------------------------------------------------------
# MODELS
# ------------------------------------------------------


class User(Base):
    __tablename__ = "users"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    avatar = Column(String(500))
    status = Column(SQLEnum(UserStatus), default=UserStatus.online)
    created_at = Column(DateTime, default=datetime.utcnow)


class Workspace(Base):
    __tablename__ = "workspaces"

    id = Column(String(36), primary_key=True)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    owner_id = Column(String(36), ForeignKey("users.id"))
    is_personal = Column(Boolean, default=False)
    invite_code = Column(String(64), unique=True, index=True, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("WorkspaceMember", back_populates="workspace")


class WorkspaceMember(Base):
    __tablename__ = "workspace_members"

    id = Column(Integer, primary_key=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"))
    user_id = Column(String(36), ForeignKey("users.id"))
    role = Column(String(20), default="member")
    joined_at = Column(DateTime, default=datetime.utcnow)

    workspace = relationship("Workspace", back_populates="members")
    user = relationship("User")


class Channel(Base):
    __tablename__ = "channels"

    id = Column(String(36), primary_key=True)
    workspace_id = Column(String(36), ForeignKey("workspaces.id"))
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_private = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Message(Base):
    __tablename__ = "messages"

    id = Column(String(36), primary_key=True)
    channel_id = Column(String(36), ForeignKey("channels.id"))
    user_id = Column(String(36), ForeignKey("users.id"))
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    is_pinned = Column(Boolean, default=False)
    pinned_by = Column(String(36), ForeignKey("users.id"), nullable=True)
    pinned_at = Column(DateTime, nullable=True)


class MessageReaction(Base):
    __tablename__ = "message_reactions"

    id = Column(Integer, primary_key=True)
    message_id = Column(String(36), ForeignKey("messages.id"))
    user_id = Column(String(36), ForeignKey("users.id"))
    emoji = Column(String(10), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


# Create tables
Base.metadata.create_all(bind=engine)

# ------------------------------------------------------
# Pydantic SCHEMAS (request bodies)
# ------------------------------------------------------


class UserCreate(BaseModel):
    name: str
    email: str
    avatar: Optional[str] = None


class WorkspaceCreate(BaseModel):
    name: str
    description: Optional[str] = None
    is_personal: bool = False


class ChannelCreate(BaseModel):
    workspace_id: str
    name: str
    description: Optional[str] = None
    is_private: bool = False


class MessageCreate(BaseModel):
    channel_id: str
    user_id: str
    content: str


class ReactionCreate(BaseModel):
    message_id: str
    user_id: str
    emoji: str


class PinMessageRequest(BaseModel):
    is_pinned: bool
    user_id: str


class JoinWorkspaceRequest(BaseModel):
    invite_code: str
    user_id: str


# ------------------------------------------------------
# SOCKET.IO SERVER
# ------------------------------------------------------

sio = socketio.AsyncServer(
    async_mode="asgi",
    cors_allowed_origins="*",
)


@sio.event
async def connect(sid, environ, auth):
    print(f"🔗 Socket connected: {sid}")


@sio.event
async def disconnect(sid):
    print(f"🔌 Socket disconnected: {sid}")


@sio.event
async def join_workspace(sid, workspace_id: str):
    """
    (Optional) Let clients join a workspace-specific room.
    Your current frontend doesn't emit this yet, but it's ready to use.
    """
    await sio.enter_room(sid, workspace_id)
    print(f"🚪 Socket {sid} joined workspace room {workspace_id}")


@sio.event
async def typing(sid, data):
    """
    Typing indicator support (optional).
    If in the future you emit `socket.emit("typing", { id, name })`,
    other clients will receive `user_typing`.
    """
    await sio.emit("user_typing", data, skip_sid=sid)


# ------------------------------------------------------
# FASTAPI APP
# ------------------------------------------------------

fastapi_app = FastAPI(title="Team Chat API")

fastapi_app.add_middleware(
  CORSMiddleware,
  allow_origins=["*"],  # dev; restrict in prod
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)


def get_db() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ------------------------------------------------------
# HELPERS
# ------------------------------------------------------


def generate_invite_code(length: int = 10) -> str:
    alphabet = string.ascii_uppercase + string.digits
    return "".join(secrets.choice(alphabet) for _ in range(length))


def serialize_user(user: User) -> Dict[str, Any]:
    return {
        "id": user.id,
        "name": user.name,
        "email": user.email,
        "avatar": user.avatar or "",
        # Frontend's ApiUser doesn't define status, but it's fine to send extra
        "status": user.status.value if isinstance(user.status, UserStatus) else "online",
    }


def serialize_message(db: Session, msg: Message) -> Dict[str, Any]:
    """
    Shape matches your ApiMessage in TS:

    interface ApiMessage {
      id: string;
      content: string;
      timestamp: string;
      user: ApiUser | null;
      reactions: { emoji: string; count: number; users: string[] }[];
      isPinned: boolean;
      pinnedBy?: string;
    }
    """
    user = db.query(User).filter(User.id == msg.user_id).first()
    reactions = db.query(MessageReaction).filter(
        MessageReaction.message_id == msg.id
    ).all()

    grouped: Dict[str, Dict[str, Any]] = {}
    for r in reactions:
        if r.emoji not in grouped:
            grouped[r.emoji] = {"emoji": r.emoji, "count": 0, "users": []}
        grouped[r.emoji]["count"] += 1
        grouped[r.emoji]["users"].append(r.user_id)

    return {
        "id": msg.id,
        "content": msg.content,
        "timestamp": msg.created_at.isoformat(),
        "user": serialize_user(user) if user else None,
        "reactions": list(grouped.values()),
        "isPinned": msg.is_pinned,
        "pinnedBy": msg.pinned_by,
    }


# ------------------------------------------------------
# USERS
# ------------------------------------------------------


@fastapi_app.post("/users/me")
def get_or_create_user(request: UserCreate, db: Session = Depends(get_db)):
    """
    Called from TeamChannelInterface.loadCurrentUser()

    Body: { name, email, avatar }
    Returns: ApiUser
    """
    existing = db.query(User).filter(User.email == request.email).first()
    if existing:
        return serialize_user(existing)

    new_user = User(
        id=str(uuid.uuid4()),
        name=request.name or request.email.split("@")[0],
        email=request.email,
        avatar=request.avatar,
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Create personal workspace on first login
    personal_ws = Workspace(
        id=str(uuid.uuid4()),
        name=f"{new_user.name}'s Space",
        description="Your personal workspace",
        owner_id=new_user.id,
        is_personal=True,
        invite_code=generate_invite_code(),
    )
    db.add(personal_ws)
    db.commit()
    db.refresh(personal_ws)

    member = WorkspaceMember(
        workspace_id=personal_ws.id,
        user_id=new_user.id,
        role="owner",
    )
    db.add(member)
    db.commit()

    print("📥 /users/me body:", request.dict())

    return serialize_user(new_user)


# ------------------------------------------------------
# WORKSPACES
# ------------------------------------------------------


@fastapi_app.get("/workspaces/my")
def my_workspaces(user_id: str, db: Session = Depends(get_db)):
    """
    Used in TeamChannelInterface to populate workspace switcher.

    Returns array of WorkspaceSummary:
    { id, name, role, is_personal }
    (We can also return description/invite_code as extra data.)
    """
    memberships = (
        db.query(WorkspaceMember).filter(WorkspaceMember.user_id == user_id).all()
    )

    result: List[Dict[str, Any]] = []
    seen_workspace_ids = set()

    for membership in memberships:
        ws = db.query(Workspace).filter(Workspace.id == membership.workspace_id).first()
        if not ws:
            continue

        seen_workspace_ids.add(ws.id)
        result.append(
            {
                "id": ws.id,
                "name": ws.name,
                "description": ws.description,
                "role": membership.role,
                "is_personal": ws.is_personal,
                "invite_code": ws.invite_code,
            }
        )

    owned_workspaces = (
        db.query(Workspace)
        .filter(Workspace.owner_id == user_id)
        .all()
    )

    for ws in owned_workspaces:
        if ws.id in seen_workspace_ids:
            continue

        result.append(
            {
                "id": ws.id,
                "name": ws.name,
                "description": ws.description,
                "role": "owner",
                "is_personal": ws.is_personal,
                "invite_code": ws.invite_code,
            }
        )

    return result


@fastapi_app.get("/workspaces/{workspace_id}")
def get_workspace(workspace_id: str, db: Session = Depends(get_db)):
    """
    In case you need details on a single workspace.
    """
    ws = db.query(Workspace).filter(Workspace.id == workspace_id).first()
    if not ws:
        raise HTTPException(status_code=404, detail="Workspace not found")

    return {
        "id": ws.id,
        "name": ws.name,
        "description": ws.description,
        "owner_id": ws.owner_id,
        "is_personal": ws.is_personal,
        "invite_code": ws.invite_code,
    }


@fastapi_app.post("/workspaces/create")
def create_workspace(
    body: WorkspaceCreate,
    user_id: str = Query(..., description="Owner user id"),
    db: Session = Depends(get_db),
):
    """
    Used by CreateWorkspaceForm

    Query: ?user_id=...
    Body: { name, description, is_personal }
    """
    ws = Workspace(
        id=str(uuid.uuid4()),
        name=body.name,
        description=body.description or "",
        owner_id=user_id,
        is_personal=body.is_personal,
        invite_code=generate_invite_code(),
    )
    db.add(ws)
    db.commit()
    db.refresh(ws)

    member = WorkspaceMember(
        workspace_id=ws.id,
        user_id=user_id,
        role="owner",
    )
    db.add(member)
    db.commit()

    return {
        "workspace_id": ws.id,
        "invite_code": ws.invite_code,
    }


@fastapi_app.post("/workspaces/join")
def join_workspace(body: JoinWorkspaceRequest, db: Session = Depends(get_db)):
    """
    Used by JoinWorkspaceForm

    Body: { invite_code, user_id }
    Returns: { workspace_id, role }
    """
    ws = (
        db.query(Workspace)
        .filter(Workspace.invite_code == body.invite_code)
        .first()
    )

    if not ws:
        raise HTTPException(status_code=400, detail="Invalid or expired invite code")

    existing = (
        db.query(WorkspaceMember)
        .filter(
            WorkspaceMember.workspace_id == ws.id,
            WorkspaceMember.user_id == body.user_id,
        )
        .first()
    )

    if existing:
        return {"workspace_id": ws.id, "role": existing.role}

    member = WorkspaceMember(
        workspace_id=ws.id,
        user_id=body.user_id,
        role="member",
    )
    db.add(member)
    db.commit()
    db.refresh(member)

    return {"workspace_id": ws.id, "role": member.role}


# ------------------------------------------------------
# CHANNELS
# ------------------------------------------------------


@fastapi_app.get("/channels")
def get_channels(workspace_id: str, db: Session = Depends(get_db)):
    """
    Used in TeamChannelInterface.loadChannels()
    """
    channels = db.query(Channel).filter(
        Channel.workspace_id == workspace_id
    ).all()

    return [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
            "is_private": c.is_private,
        }
        for c in channels
    ]


@fastapi_app.post("/channels")
def create_channel(body: ChannelCreate, db: Session = Depends(get_db)):
    """
    Used in TeamChannelInterface.handleCreateChannel()
    """
    exists = (
        db.query(Channel)
        .filter(
            Channel.workspace_id == body.workspace_id,
            Channel.name == body.name,
        )
        .first()
    )

    if exists:
        raise HTTPException(status_code=400, detail="Channel already exists")

    ch = Channel(
        id=str(uuid.uuid4()),
        workspace_id=body.workspace_id,
        name=body.name,
        description=body.description or "",
        is_private=body.is_private,
    )
    db.add(ch)
    db.commit()
    db.refresh(ch)

    return {
        "id": ch.id,
        "name": ch.name,
        "description": ch.description,
        "is_private": ch.is_private,
    }


# ------------------------------------------------------
# MESSAGES
# ------------------------------------------------------


@fastapi_app.get("/messages")
def get_messages(channel_id: str, db: Session = Depends(get_db)):
    """
    Used in TeamChannelInterface.loadMessages()
    """
    msgs = (
        db.query(Message)
        .filter(Message.channel_id == channel_id)
        .order_by(Message.created_at)
        .all()
    )
    return [serialize_message(db, m) for m in msgs]


@fastapi_app.post("/messages")
async def create_message(body: MessageCreate, db: Session = Depends(get_db)):
    """
    Used in TeamChannelInterface.handleSendMessage()

    Body: { channel_id, user_id, content }
    """
    msg = Message(
        id=str(uuid.uuid4()),
        channel_id=body.channel_id,
        user_id=body.user_id,
        content=body.content,
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    serialized = serialize_message(db, msg)

    # Current frontend connects globally, so broadcast to all sockets.
    # Later you can optimize to per-workspace or per-channel rooms.
    await sio.emit("new-message", serialized)

    return serialized


# ------------------------------------------------------
# PINNING & REACTIONS
# ------------------------------------------------------


@fastapi_app.patch("/messages/{message_id}/pin")
async def pin_message(
    message_id: str,
    body: PinMessageRequest,
    db: Session = Depends(get_db),
):
    """
    Used in TeamChannelInterface.togglePinMessage()

    Body: { is_pinned, user_id }

    Socket event payload matches the TS handler:

    socket.on("message-pinned", (data: { message_id: string; is_pinned: boolean; pinned_by?: string }) => {
      ...
    });
    """
    msg = db.query(Message).filter(Message.id == message_id).first()
    if not msg:
        raise HTTPException(status_code=404, detail="Message not found")

    msg.is_pinned = body.is_pinned
    msg.pinned_by = body.user_id if body.is_pinned else None
    msg.pinned_at = datetime.utcnow() if body.is_pinned else None
    db.commit()

    payload = {
        "message_id": msg.id,
        "is_pinned": msg.is_pinned,
        "pinned_by": msg.pinned_by,
    }

    await sio.emit("message-pinned", payload)
    return payload


@fastapi_app.post("/reactions")
async def add_reaction(body: ReactionCreate, db: Session = Depends(get_db)):
    """
    Used in TeamChannelInterface.addReaction()
    Frontend listens to "reaction-added" and then calls loadMessages().
    """
    existing = (
        db.query(MessageReaction)
        .filter(
            MessageReaction.message_id == body.message_id,
            MessageReaction.user_id == body.user_id,
            MessageReaction.emoji == body.emoji,
        )
        .first()
    )

    if existing:
        db.delete(existing)
        db.commit()
    else:
        db.add(
            MessageReaction(
                message_id=body.message_id,
                user_id=body.user_id,
                emoji=body.emoji,
            )
        )
        db.commit()

    # Recompute reactions for this message
    reactions = db.query(MessageReaction).filter(
        MessageReaction.message_id == body.message_id
    ).all()

    grouped: Dict[str, Dict[str, Any]] = {}
    for r in reactions:
        if r.emoji not in grouped:
            grouped[r.emoji] = {"emoji": r.emoji, "count": 0, "users": []}
        grouped[r.emoji]["count"] += 1
        grouped[r.emoji]["users"].append(r.user_id)

    payload = {
        "message_id": body.message_id,
        "reactions": list(grouped.values()),
    }

    await sio.emit("reaction-added", payload)
    return payload


# ------------------------------------------------------
# ROOT
# ------------------------------------------------------


@fastapi_app.get("/")
def root():
    return {"status": "ok", "message": "Team Chat API Running 🚀"}


# ------------------------------------------------------
# ASGI APP (for uvicorn main:app --reload)
# ------------------------------------------------------

app = socketio.ASGIApp(sio, fastapi_app)

print("🚀 Backend ready: FastAPI + Socket.IO operational")
