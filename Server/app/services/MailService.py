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
        content: tuple[str, str],  # Subject, message
        html: str | None = None    # optional html version
    ):
        from_ = "affableshamik98@gmail.com"
        context = ssl.create_default_context(purpose=ssl.Purpose.SERVER_AUTH)

        port = 465
        message = EmailMessage()

        message["From"] = from_
        message["To"] = recipient
        message["Subject"] = content[0]
        message.set_content(content[1])

        if html:
            message.add_alternative(html, subtype="html")

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

    @classmethod
    def send_verification_mail(
        cls,
        recipient: EmailStr,
        verification_link: str
    ):
        text = (
            "Confirm your email address using the link below:\n\n"
            f"{verification_link}\n\n"
            "The link is only valid for 10 minutes."
        )

        html = f"""
            <p>Confirm your email address using the link below:</p>
            <p><a href="{verification_link}"><strong><em>Verify mail</em></strong></a></p>
            <p>The link is only valid for 10 minutes.</p>"""

        cls.send_mail(
            recipient=recipient,
            content=("Email Verification", text),
            html=html
        )
