import smtplib
import ssl
from pydantic import EmailStr
from email.message import EmailMessage
from app.core.config import settings


class MailService:
    @classmethod
    def send_mail(
        cls,
        recipient: EmailStr,
        content: tuple[str, str]  # Subject, message
    ):
        from_ = "affableshamik98@gmail.com"
        port = 465
        context = ssl.create_default_context(
            purpose=ssl.Purpose.SERVER_AUTH
        )
        message = EmailMessage()

        message["To"] = recipient
        message["Subject"] = content[0]
        message.set_content(content[1])

        with smtplib.SMTP_SSL(
            host="smtp.gmail.com",
            port=port,
            context=context
        ) as server:
            server.login(
                user=from_,
                password=settings.gmail_password
            )
            server.send_message(message)

    #

    @classmethod
    def send_verification_mail(
        cls,
        recipient: EmailStr,
        verification_link: str
    ):
        print(
            f"verification mail to be sent to recipient: {recipient}"
        )

        cls.send_mail(
            recipient=recipient,
            content=(
                "Email Verification",
                f"""Confirm your email address using the link below\n\n
                {verification_link}
                The link is only valid for 5 minutes."""
            )
        )
