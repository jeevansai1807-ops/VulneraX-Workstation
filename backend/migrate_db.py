import sqlite3

def migrate():
    conn = sqlite3.connect('scans/VulneraX.db')
    cursor = conn.cursor()
    
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN email VARCHAR(100) DEFAULT 'placeholder@vulnerax.local'")
        print("Added email column.")
    except Exception as e:
        print(f"Skipped adding email: {e}")
        
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN reset_token VARCHAR(100)")
        print("Added reset_token column.")
    except Exception as e:
        print(f"Skipped adding reset_token: {e}")
        
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN reset_token_expires DATETIME")
        print("Added reset_token_expires column.")
    except Exception as e:
        print(f"Skipped adding reset_token_expires: {e}")

    conn.commit()
    conn.close()

if __name__ == "__main__":
    migrate()
