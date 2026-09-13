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
