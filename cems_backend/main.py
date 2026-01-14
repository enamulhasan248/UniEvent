from fastapi import FastAPI, HTTPException, Depends, status
from pydantic import BaseModel, EmailStr, Field, validator
from sqlalchemy import create_engine, Column, String, Boolean, ForeignKey, Integer, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import sessionmaker, declarative_base, relationship, Session
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta
from fastapi.middleware.cors import CORSMiddleware # newly added
import uuid
import re
import random
import qrcode
import io
import base64

# --- CONFIGURATION ---
# REPLACE 'your_password' with the one you wrote down!
DATABASE_URL = "postgresql://postgres:eha8358649@localhost:5432/unievent_db"
SECRET_KEY = "super_secret_key_change_this_later"
ALGORITHM = "HS256"

# Hardcoded Admin Credentials
ADMIN_EMAIL = "2022-1-60-149@std.ewubd.edu"
ADMIN_PASS = "1234"

# --- DATABASE SETUP ---
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# --- SECURITY ---
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
# oauth2_scheme moved down to be with get_current_user 

# --- SQLALCHEMY MODELS (Corrected to match your SQL Table) ---
class User(Base):
    __tablename__ = "users"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    first_name = Column(String)  # Added this
    last_name = Column(String)   # Added this
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    role = Column(String, default="student") 
    student_id = Column(String, nullable=True) # Added this
    # Removed 'is_active' to prevent error

# ... inside main.py ...

class Club(Base):
    __tablename__ = "clubs"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True)
    description = Column(String)
    logo_url = Column(String)
    organizer_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))

class Venue(Base):
    __tablename__ = "venues"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String, unique=True)
    location = Column(String)
    capacity = Column(Integer)

# ... The Event class is below this ...

class Event(Base):
    __tablename__ = "events"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    description = Column(String)
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    max_attendees = Column(Integer)
    banner_url = Column(String)  # <--- THIS LINE WAS MISSING
    
    # Relationships
    club_id = Column(UUID(as_uuid=True), ForeignKey("clubs.id"))
    venue_id = Column(UUID(as_uuid=True), ForeignKey("venues.id"))
    
class Registration(Base):
    __tablename__ = "registrations"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    event_id = Column(UUID(as_uuid=True), ForeignKey("events.id"))
    ticket_id = Column(UUID(as_uuid=True), default=uuid.uuid4)
    
    # --- THIS LINE WAS MISSING or INCORRECT ---
    status = Column(String, default='registered')

# --- NEW PYDANTIC MODELS FOR ADMIN ---
class EventCreate(BaseModel):
    title: str
    description: str
    start_time: str  # Changed to String for safer parsing
    end_time: str    # Changed to String
    max_attendees: int
    venue_id: str
    banner_url: str = ""


class ClubCreate(BaseModel):
    name: str
    description: str
    logo_url: str = ""

class VenueCreate(BaseModel):
    name: str
    location: str
    capacity: int

class UserRoleUpdate(BaseModel):
    role: str # 'student', 'organizer', 'admin'


class EventUpdate(BaseModel):
    title: str
    description: str
    start_time: datetime
    end_time: datetime
    max_attendees: int
    venue_id: str
    banner_url: str = ""

# --- PYDANTIC SCHEMAS (Input Validation) ---
class UserSignup(BaseModel):
    first_name: str
    last_name: str
    email: str
    password: str

    @validator('email')
    def validate_ewubd_email(cls, v):
        regex = r"^[a-zA-Z0-9_.+-]+@.*\.ewubd\.edu$"
        if not re.match(regex, v):
            raise ValueError('Email must belong to EWU domain (@*.ewubd.edu)')
        if v == ADMIN_EMAIL:
            raise ValueError('Admin email cannot register via public signup')
        return v

class Login(BaseModel):
    email: str
    password: str

# --- UTILS ---
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=30)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# In-memory OTP storage
otp_storage = {} 

app = FastAPI()

# --- PASTE THIS BLOCK ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# --- ENDPOINTS ---

@app.on_event("startup")
def create_default_admin():
    db = SessionLocal()
    try:
        # Check if admin exists
        admin = db.query(User).filter(User.email == ADMIN_EMAIL).first()
        if not admin:
            hashed_pw = pwd_context.hash(ADMIN_PASS)
            # We must provide first_name and last_name because DB requires them (NOT NULL)
            new_admin = User(
                first_name="System",
                last_name="Admin",
                email=ADMIN_EMAIL, 
                password_hash=hashed_pw, 
                role="admin"
            )
            db.add(new_admin)
            db.commit()
            print(">>> Hardcoded Admin Account Created/Verified")
    except Exception as e:
        print(f"Error creating admin: {e}")
    finally:
        db.close()

# 1. SIGNUP STEP 1: Request OTP
@app.post("/auth/signup/request-otp")
def request_otp(user: UserSignup):
    otp = str(random.randint(1000, 9999))
    # Store all user details temporarily
    otp_storage[user.email] = {
        "otp": otp, 
        "data": user.dict()
    }
    
    print(f"\n[EMAIL SERVICE] Sending OTP to {user.email}: {otp}\n")
    return {"msg": "OTP sent to email. Check console for code."}

# 2. SIGNUP STEP 2: Verify OTP & Create Account
@app.post("/auth/signup/verify")
def verify_signup(email: str, otp: str, db: Session = Depends(get_db)):
    record = otp_storage.get(email)
    if not record or record["otp"] != otp:
        raise HTTPException(status_code=400, detail="Invalid OTP")
    
    user_data = record["data"]
    
    # Create User with all required fields
    hashed_pw = pwd_context.hash(user_data["password"])
    new_user = User(
        first_name=user_data["first_name"],
        last_name=user_data["last_name"],
        email=email, 
        password_hash=hashed_pw, 
        role="student"
    )
    
    try:
        db.add(new_user)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=400, detail="User already exists or DB error")
        
    del otp_storage[email]
    return {"msg": "User created successfully"}

# 3. LOGIN
@app.post("/auth/login")
def login(creds: Login, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == creds.email).first()
    
    if not user or not pwd_context.verify(creds.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_access_token({"sub": user.email, "role": user.role, "user_id": str(user.id)})
    return {"access_token": token, "token_type": "bearer", "role": user.role}

# 4. GET ALL EVENTS
@app.get("/events")
def get_events(db: Session = Depends(get_db)):
    return db.query(Event).all()

@app.get("/events/featured")
def get_featured_events(db: Session = Depends(get_db)):
    # Since we didn't add an 'is_featured' column to the DB yet, 
    # we will just return the 3 most recent events for the carousel.
    # we will just return the 3 most recent events for the carousel.
    return db.query(Event).order_by(Event.start_time.desc()).limit(3).all()

# --- MOVED SECURITY DEPENDENCIES HERE ---
from fastapi.security import OAuth2PasswordBearer
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
    except JWTError:
        raise HTTPException(status_code=401, detail="Could not validate credentials")
    
    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

@app.get("/events/{event_id}")
def get_event_details(event_id: str, db: Session = Depends(get_db)):
    try:
        real_id = uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(400, "Invalid ID format")
        
    event = db.query(Event).filter(Event.id == real_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
    return event

@app.post("/events/{event_id}/register")
def register_for_event(event_id: str, user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Check if event exists
    try:
        real_event_id = uuid.UUID(event_id)
    except ValueError:
        raise HTTPException(400, "Invalid Event ID")
        
    event = db.query(Event).filter(Event.id == real_event_id).first()
    if not event:
        raise HTTPException(404, "Event not found")
        
    # 2. Check if already registered
    existing_reg = db.query(Registration).filter(
        Registration.user_id == user.id,
        Registration.event_id == real_event_id
    ).first()
    
    if existing_reg:
        raise HTTPException(400, "You are already registered for this event")
        
    # 3. Check capacity
    current_count = db.query(Registration).filter(Registration.event_id == real_event_id).count()
    if current_count >= event.max_attendees:
        raise HTTPException(400, "Event is full")
        
    # 4. Register
    new_reg = Registration(
        user_id=user.id,
        event_id=real_event_id
    )
    # db.add(new_reg)
    # db.commit()

    try:
        db.add(new_reg)
        db.commit()
    except Exception as e:
        db.rollback()
        # Check if it's our specific trigger error
        if "Capacity Reached" in str(e):
            raise HTTPException(status_code=400, detail="Event is House Full (Database Locked)")
        else:
            raise HTTPException(status_code=500, detail="Database Error")
    
    return {"msg": "Registration successful", "ticket_id": str(new_reg.ticket_id)}

# 5. GENERATE QR
@app.get("/registrations/qr/{ticket_id}")
def generate_qr(ticket_id: str):
    img = qrcode.make(f"CEMS-TICKET:{ticket_id}")
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return {"qr_image_base64": img_str}



# --- ADMIN SECURITY CHECK ---
def get_current_admin(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Not authorized")
    return current_user

@app.get("/users/me")
def read_users_me(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # 1. Get user details
    user_data = {
        "id": str(current_user.id),
        "first_name": current_user.first_name,
        "last_name": current_user.last_name,
        "email": current_user.email,
        "role": current_user.role,
        "events": []
    }
    
    # 2. Manual query to find their registered events
    regs = db.query(Registration).filter(Registration.user_id == current_user.id).all()
    for reg in regs:
        # Fetch the event details for each registration
        event = db.query(Event).filter(Event.id == reg.event_id).first()
        if event:
            user_data["events"].append({
                "title": event.title,
                "date": event.start_time,
                "ticket_id": str(reg.ticket_id),
                "status": "Registered"
            })
            
    return user_data


# --- ADMIN PANEL ENDPOINTS ---

# A. Dashboard Stats
@app.get("/admin/stats")
def get_stats(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    return {
        "total_users": db.query(User).count(),
        "total_events": db.query(Event).count(),
        "total_clubs": db.query(Club).count(),
        "total_venues": db.query(Venue).count()
    }

# B. User Management
@app.get("/admin/users")
def get_all_users(admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    # Return all users so admin can edit them
    return db.query(User).all()

@app.put("/admin/users/{user_id}/role")
def update_user_role(user_id: str, role_data: UserRoleUpdate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    user.role = role_data.role
    db.commit()
    return {"msg": "Role updated"}

# C. Club Management
@app.post("/clubs")
def create_club(club: ClubCreate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_club = Club(name=club.name, description=club.description, logo_url=club.logo_url)
    db.add(new_club)
    db.commit()
    return {"msg": "Club created"}

@app.get("/clubs") # Public endpoint (anyone can see list of clubs)
def get_clubs(db: Session = Depends(get_db)):
    return db.query(Club).all()

# D. Venue Management
@app.post("/venues")
def create_venue(venue: VenueCreate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    new_venue = Venue(name=venue.name, location=venue.location, capacity=venue.capacity)
    db.add(new_venue)
    db.commit()
    return {"msg": "Venue created"}

@app.get("/venues") # Public endpoint
def get_venues(db: Session = Depends(get_db)):
    return db.query(Venue).all()

# E. Carousel Management (Feature an Event)
@app.put("/admin/events/{event_id}/feature")
def toggle_feature(event_id: str, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event: raise HTTPException(404, "Event not found")
    
    # Toggle the boolean (if True make False, if False make True)
    # Note: Ensure you added 'is_featured' to your Event Model in Step 1, 
    # or this will fail. If you didn't add it to the DB table yet, skip this.
    # event.is_featured = not event.is_featured 
    # db.commit()
    return {"msg": "Feature toggled (Logic commented out until DB column exists)"}



# --- ADD THESE MODELS NEAR THE TOP WITH OTHER MODELS ---
class ClubUpdate(BaseModel):
    name: str
    description: str
    logo_url: str = ""  # <--- Added this line
    organizer_id: str = None  # <--- NEW FIELD

class VenueUpdate(BaseModel):
    name: str
    location: str
    capacity: int

# --- ADD THESE ENDPOINTS AT THE VERY BOTTOM ---

# Edit Club
@app.put("/clubs/{club_id}")
def update_club(club_id: str, club: ClubUpdate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    db_club = db.query(Club).filter(Club.id == club_id).first()
    if not db_club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    # Update basic fields
    db_club.name = club.name
    db_club.description = club.description
    db_club.logo_url = club.logo_url
    
    # Update Organizer (Only if a valid ID is sent)
    if club.organizer_id:
        db_club.organizer_id = club.organizer_id
        
    db.commit()
    return {"msg": "Club updated successfully"}

# Edit Venue
@app.put("/venues/{venue_id}")
def update_venue(venue_id: str, venue: VenueUpdate, admin: User = Depends(get_current_admin), db: Session = Depends(get_db)):
    db_venue = db.query(Venue).filter(Venue.id == venue_id).first()
    if not db_venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    
    db_venue.name = venue.name
    db_venue.location = venue.location
    db_venue.capacity = venue.capacity
    db.commit()
    return {"msg": "Venue updated successfully"}



# --- ORGANIZER DASHBOARD LOGIC ---

# 1. Security Dependency
def get_current_organizer(current_user: User = Depends(get_current_user)):
    if current_user.role != "organizer":
        raise HTTPException(status_code=403, detail="Not authorized. Organizers only.")
    return current_user

# 2. Get My Club (To check if they are assigned)
@app.get("/organizer/club")
def get_my_club(user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.organizer_id == user.id).first()
    if not club:
        raise HTTPException(404, "You are not assigned to any club yet. Contact Admin.")
    return club

# 3. Create Event (Linked to their Club)
@app.post("/organizer/events")
def create_organizer_event(evt: EventCreate, user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    print(f"DEBUG: Attempting to create event: {evt.title}")
    
    # A. Validate Venue ID
    try:
        real_venue_id = uuid.UUID(str(evt.venue_id))
    except ValueError:
        print("DEBUG: Invalid Venue ID format")
        raise HTTPException(status_code=400, detail="Invalid Venue selected.")

    # B. Validate Dates
    try:
        # Parse "2026-01-20T11:44" format
        dt_start = datetime.fromisoformat(evt.start_time)
        dt_end = datetime.fromisoformat(evt.end_time)
    except ValueError:
        print(f"DEBUG: Date parse error. Got {evt.start_time}")
        raise HTTPException(status_code=400, detail="Invalid Date format.")

    # C. Check Club Assignment (THE MOST COMMON CRASH CAUSE)
    club = db.query(Club).filter(Club.organizer_id == user.id).first()
    if not club:
        print(f"DEBUG: User {user.email} is not linked to any club!")
        raise HTTPException(status_code=400, detail="You are not assigned to a Club! Ask Admin to edit a Club and assign you.")

    # D. Create Event
    try:
        new_event = Event(
            title=evt.title,
            description=evt.description,
            start_time=dt_start,
            end_time=dt_end,
            max_attendees=evt.max_attendees,
            venue_id=real_venue_id,
            club_id=club.id,
            banner_url=evt.banner_url
        )
        db.add(new_event)
        db.commit()
        print("DEBUG: Event saved successfully")
        return {"msg": "Event created successfully"}
        
    except Exception as e:
        db.rollback()
        print(f"DEBUG: CRITICAL DATABASE ERROR: {e}")
        raise HTTPException(status_code=500, detail="Database Error. Check Terminal.")

# 4. Get Events with Real-time Stats
@app.get("/organizer/events/stats")
def get_organizer_events_stats(user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.organizer_id == user.id).first()
    if not club: return []

    events = db.query(Event).filter(Event.club_id == club.id).all()
    
    results = []
    for e in events:
        # Calculate Stats
        reg_count = db.query(Registration).filter(Registration.event_id == e.id).count()
        attended_count = db.query(Registration).filter(
            Registration.event_id == e.id, 
            Registration.status == 'checked_in'
        ).count()
        
        results.append({
            "id": str(e.id),
            "title": e.title,
            "start_time": e.start_time,
            "max_attendees": e.max_attendees,
            "registered": reg_count,
            "attended": attended_count,
            "seats_left": e.max_attendees - reg_count
        })
    return results

# 4.5. Organizer Dashboard Stats (Global Counts)
@app.get("/organizer/dashboard-stats")
def get_organizer_dashboard_stats(user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    club = db.query(Club).filter(Club.organizer_id == user.id).first()
    if not club:
        return {"total_events": 0, "total_registrations": 0}

    events = db.query(Event).filter(Event.club_id == club.id).all()
    total_events = len(events)
    total_registrations = 0
    
    for e in events:
        total_registrations += db.query(Registration).filter(Registration.event_id == e.id).count()
        
    return {
        "total_events": total_events,
        "total_registrations": total_registrations
    }

# 5. QR Code Scanner Endpoint
class ScanRequest(BaseModel):
    qr_code: str

@app.post("/organizer/scan")
def scan_ticket(data: ScanRequest, user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    # Parse Format: "CEMS-TICKET:<uuid>"
    try:
        raw_id = data.qr_code.split(":")[1]
    except IndexError:
        raise HTTPException(400, "Invalid QR Format")

    # Find Registration
    reg = db.query(Registration).filter(Registration.ticket_id == raw_id).first()
    if not reg: 
        raise HTTPException(404, "Ticket not found in system")

    # Security: Ensure this ticket belongs to an event hosted by THIS organizer
    event = db.query(Event).filter(Event.id == reg.event_id).first()
    club = db.query(Club).filter(Club.id == event.club_id).first()
    
    if club.organizer_id != user.id:
        raise HTTPException(403, "This ticket is for a different club's event!")

    if reg.status == 'checked_in':
        raise HTTPException(400, "Student already checked in!")

    # Mark as Present
    reg.status = 'checked_in'
    db.commit()
    
    # Return Student Info to display on screen
    student = db.query(User).filter(User.id == reg.user_id).first()
    return {
        "msg": "Check-in Successful", 
        "student": f"{student.first_name} {student.last_name}",
        "email": student.email
    }


@app.put("/organizer/events/{event_id}")
def update_organizer_event(event_id: str, evt: EventUpdate, user: User = Depends(get_current_organizer), db: Session = Depends(get_db)):
    # 1. Find the event
    db_event = db.query(Event).filter(Event.id == event_id).first()
    if not db_event: 
        raise HTTPException(404, "Event not found")

    # 2. Security Check: Does this organizer own the club this event belongs to?
    club = db.query(Club).filter(Club.organizer_id == user.id).first()
    if not club or db_event.club_id != club.id:
        raise HTTPException(403, "You can only edit events for your own club.")

    # 3. Update fields
    db_event.title = evt.title
    db_event.description = evt.description
    db_event.start_time = evt.start_time
    db_event.end_time = evt.end_time
    db_event.max_attendees = evt.max_attendees
    db_event.venue_id = evt.venue_id
    db_event.banner_url = evt.banner_url
    
    db.commit()
    return {"msg": "Event updated successfully"}