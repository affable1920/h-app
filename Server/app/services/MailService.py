import smtplib
import ssl
from pydantic import EmailStr
from email.message import EmailMessage
from app.core.config import settings


def send_mail(
        recipient: EmailStr,
        body: tuple[str, str]
):
    from_ = "affableshamik98@gmail.com"
    port = 465

    context = ssl.create_default_context(
        purpose=ssl.Purpose.SERVER_AUTH
    )

    message = EmailMessage()

    message["From"] = from_
    message["To"] = recipient
    message["Subject"] = body[0]
    message.set_content(body[1])

    with smtplib.SMTP_SSL(
        host="smtp.gmail.com",
        port=port,
        context=context
    ) as server:
        server.login(from_, settings.gmail_password)
        server.send_message(message)


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
        cls.send_mail(
            recipient=recipient,
            content=(
                "Email Verification",
                "Confirm your email address using the link below\n\n"
                f"{verification_link}\n\n"
                "The link is only valid for 5 minutes."
            )
        )
