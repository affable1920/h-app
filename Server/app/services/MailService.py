import smtplib
import ssl

from app.core import config
from pydantic import EmailStr

#


def send_mail(recipient: EmailStr, msg: str):
    my_mail = "affableshamik98@gmail.com"
    port = 465

    context = ssl.create_default_context(purpose=ssl.Purpose.SERVER_AUTH)

    with smtplib.SMTP_SSL(
        host="smtp.gmail.com", port=port, context=context
    ) as server:

        server.login(my_mail, "")
        server.sendmail(my_mail, recipient, msg)
