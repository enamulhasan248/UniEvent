# UniEvent - Campus Event Management System

UniEvent is a comprehensive web application designed to manage campus events, clubs, and venues. It facilitates interaction between students, event organizers, and administrators, providing a seamless experience for event registration, management, and tracking.

## 🚀 Technology Stack

### Frontend
- **Framework:** Angular 18+ (Standalone Components)
- **UI Library:** Angular Material
- **Styling:** SCSS
- **State Management:** RxJS (Reactive Extensions)
- **Routing:** Angular Router with Lazy Loading & Role-based Guards

### Backend
- **Framework:** FastAPI (Python)
- **Server:** Uvicorn
- **ORM:** SQLAlchemy
- **Authentication:** JWT (JSON Web Tokens) with OAuth2PasswordBearer
- **Validation:** Pydantic

### Database
- **Database:** PostgreSQL
- **Driver:** psycopg2-binary

---

## 📂 Project Structure

```
UniEvent/
├── cems-angular/          # Frontend Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── core/      # Services, Guards, Interceptors
│   │   │   ├── features/  # Feature Modules (Admin, Organizer, Public, Student)
│   │   │   └── shared/    # Shared Components & Pipes
│   └── ...
│
└── cems_backend/          # Backend Application
    ├── main.py            # Main Application Entry Point & API Routes
    ├── Pages/             # Static HTML Pages (Legacy/Fallback)
    └── ...
```

---

## 🗄️ Database Structure

The application uses a relational database (PostgreSQL) with the following schema:

### 1. Users (`users`)
- `id`: UUID (Primary Key)
- `first_name`: String
- `last_name`: String
- `email`: String (Unique, must be @ewubd.edu)
- `password_hash`: String
- `role`: String ('student', 'organizer', 'admin')

### 2. Clubs (`clubs`)
- `id`: UUID (Primary Key)
- `name`: String (Unique)
- `description`: String
- `logo_url`: String
- `organizer_id`: UUID (Foreign Key -> users.id)

### 3. Venues (`venues`)
- `id`: UUID (Primary Key)
- `name`: String (Unique)
- `location`: String
- `capacity`: Integer

### 4. Events (`events`)
- `id`: UUID (Primary Key)
- `title`: String
- `description`: String
- `start_time`: DateTime
- `end_time`: DateTime
- `max_attendees`: Integer
- `banner_url`: String
- `club_id`: UUID (Foreign Key -> clubs.id)
- `venue_id`: UUID (Foreign Key -> venues.id)

### 5. Registrations (`registrations`)
- `id`: UUID (Primary Key)
- `user_id`: UUID (Foreign Key -> users.id)
- `event_id`: UUID (Foreign Key -> events.id)
- `ticket_id`: UUID (Unique Ticket Identifier)
- `status`: String (default: 'registered')

---

## 🛠️ Setup & Installation

### Prerequisites
- Node.js & npm
- Python 3.8+
- PostgreSQL Database

### 1. Database Setup
Ensure you have a PostgreSQL database running. Update the connection string in `cems_backend/main.py`:
```python
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:password@localhost/cems_db"
```

### 2. Backend Setup
Navigate to the backend directory:
```bash
cd cems_backend
```

Install dependencies (create a virtual environment recommended):
```bash
pip install fastapi uvicorn sqlalchemy psycopg2-binary passlib[bcrypt] python-jose[cryptography] python-multipart qrcode pillow
```

Run the server:
```bash
python -m uvicorn main:app --reload
```
The API will be available at `http://127.0.0.1:8000`.

### 3. Frontend Setup
Navigate to the frontend directory:
```bash
cd cems-angular
```

Install dependencies:
```bash
npm install
```

Run the development server:
```bash
npm start
```
The application will be available at `http://localhost:4200`.

---

## 🔑 Key Features

- **Role-Based Access Control:** Distinct dashboards for Students, Organizers, and Admins.
- **Event Management:** Create, edit, and manage events with real-time stats.
- **Registration System:** Students can register for events and receive digital tickets (QR Codes).
- **QR Code Scanning:** Organizers can verify tickets using the built-in QR scanner.
- **Resource Management:** Admins can manage users, clubs, and venues.
