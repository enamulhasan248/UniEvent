from main import SessionLocal, User, Event, Club, Venue

def check_stats():
    db = SessionLocal()
    try:
        users = db.query(User).count()
        events = db.query(Event).count()
        clubs = db.query(Club).count()
        venues = db.query(Venue).count()
        
        print(f"Users: {users}")
        print(f"Events: {events}")
        print(f"Clubs: {clubs}")
        print(f"Venues: {venues}")
        
        # List users to verify admin exists
        print("\n--- Users ---")
        for u in db.query(User).all():
            print(f"{u.email} ({u.role})")
            
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_stats()
