import asyncio
import os
import smtplib
from email.message import EmailMessage

async def test_email():
    SMTP_SERVER = "smtp.sendgrid.net"
    SMTP_PORT = 587
    SMTP_USERNAME = "apikey"
    SMTP_PASSWORD = ""
    FROM_EMAIL = "vulnerax1work@gmail.com"
    # Wait, SendGrid requires the sender email to be a verified Single Sender Identity or an authenticated domain.
    # "security@vulnerax.local" is definitely NOT a verified sender in their SendGrid account.
    # This is 100% the reason why the email is being rejected by SendGrid or dropped.
    to_email = "test@example.com" # Just for testing the SMTP connection/auth
    
    msg = EmailMessage()
    msg.set_content("This is a test email")
    msg["Subject"] = "Test from VulneraX"
    msg["From"] = FROM_EMAIL
    msg["To"] = to_email

    try:
        print("Connecting to SendGrid...")
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            server.set_debuglevel(1) # Enable verbose SMTP logging
            server.starttls()
            print("Authenticating...")
            server.login(SMTP_USERNAME, SMTP_PASSWORD)
            print("Sending email...")
            server.send_message(msg)
        print("Email sent successfully!")
    except Exception as e:
        print(f"Failed to send email: {e}")

if __name__ == "__main__":
    asyncio.run(test_email())
