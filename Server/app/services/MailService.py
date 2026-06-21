import logging
import smtplib
import ssl

from app.core.config import settings
from pydantic import EmailStr

#

logger = logging.getLogger(__name__)


def send_mail(recipient: EmailStr, msg: str):
    from_ = "affableshamik98@gmail.com"
    port = 465

    context = ssl.create_default_context(purpose=ssl.Purpose.SERVER_AUTH)

    with smtplib.SMTP_SSL(
        host="smtp.gmail.com", port=port, context=context
    ) as server:

        logger.info(f"gmail_password -> {settings.gmail_password}")

        try:
            server.login(from_, settings.gmail_password)
            server.sendmail(
                from_addr=from_,
                to_addrs=recipient,
                msg=msg
            )
        except smtplib.SMTPAuthenticationError as e:
            logger.debug(e)
            pass
