import os
import smtplib
from email.message import EmailMessage
import logging

logger = logging.getLogger(__name__)

# Basic configuration
SMTP_SERVER = os.getenv("SMTP_SERVER", "smtp.sendgrid.net")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USERNAME = os.getenv("SMTP_USERNAME", "apikey")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
FROM_EMAIL = os.getenv("FROM_EMAIL", "vulnerax1work@gmail.com")
REPLY_TO_EMAIL = os.getenv("REPLY_TO_EMAIL", "aryanr110xxxten@gmail.com")

async def send_reset_password_email(to_email: str, token: str):
    """
    Send a password reset email. If SMTP is not configured, logs the token to the console.
    """
    reset_link = f"http://127.0.0.1:8000/reset-password?token={token}"
    
    msg_body = f"""
Hello,

You have requested to reset your password for VulneraX.
Please click on the following link to set a new password:

{reset_link}

If you did not request a password reset, please ignore this email.

Best,
VulneraX Team
    """

    if not SMTP_SERVER:
        # Fallback for local development and desktop application without SMTP
        logger.info("\n" + "="*50)
        logger.info("  PASSWORD RESET REQUESTED")
        logger.info(f"  User Email: {to_email}")
        logger.info(f"  Reset Link: {reset_link}")
        logger.info("="*50 + "\n")
        print("\n" + "="*50)
        print("  PASSWORD RESET REQUESTED")
        print(f"  User Email: {to_email}")
        print(f"  Reset Link: {reset_link}")
        print("="*50 + "\n")
        return True

    try:
        msg = EmailMessage()
        msg.set_content(msg_body)
        msg["Subject"] = "VulneraX Password Reset"
        msg["From"] = FROM_EMAIL
        msg["To"] = to_email
        msg["Reply-To"] = REPLY_TO_EMAIL

        # Send via standard smtplib
        with smtplib.SMTP(SMTP_SERVER, SMTP_PORT) as server:
            if SMTP_PORT == 587:
                server.starttls()
            if SMTP_USERNAME and SMTP_PASSWORD:
                server.login(SMTP_USERNAME, SMTP_PASSWORD)
            server.send_message(msg)
        return True
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        print(f"Fallback Reset Link: {reset_link}")
        return False
