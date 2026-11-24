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
            "The link is valid for 3 hours."
        )

        html = f"""
            <p>Confirm your email address using the link below:</p>
            <p><a href="{verification_link}"><strong><em>Verify mail</em></strong></a></p>
            <p>The link is valid for 3 hours.</p>"""

        cls.send_mail(
            recipient=recipient,
            content=("Email Verification", text),
            html=html
        )

    @classmethod
    def send_password_reset_mail(
        cls,
        recipient: EmailStr,
        reset_link: str
    ):
        text = (
            f"""We're sorry to hear you've forgotten the password to your account.
            Use the link below to reset your password 
            \n{reset_link} \n
            The link will expire in 15 minutes, so make sure to use it before then.
        """
        )

        html = (
            f"""<p>We're sorry to hear you've forgotten the password to your account.</p>
            <p>Use the link below to reset your password</p>
            <p><a href="{reset_link}"><strong><em>Reset Password</em></strong></a></p>
            The link will expire in 15 minutes, so make sure to use it before then.
        """)

        cls.send_mail(
            recipient=recipient,
            content=("Reset Password", text),
            html=html
        )
