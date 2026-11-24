"""Modidy email verification token table to adhere to all verification token requiring operations ..

Revision ID: 94a7bec67fca
Revises: a162bbbf627f
Create Date: 2026-11-21 22:31:30.774892

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = '94a7bec67fca'
down_revision: Union[str, Sequence[str], None] = 'a162bbbf627f'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

ENUM_NAME = "verification_token_purpose"

purpose_enum = postgresql.ENUM(
    "EMAIL_VERIFICATION", "PASSWORD_RESET", name=ENUM_NAME
)


def upgrade() -> None:
    """Upgrade schema."""

    purpose_enum.create(op.get_bind(), checkfirst=True)

    op.rename_table("email_verification_token", "verification_token")
    op.alter_column("verification_token", "exp", new_column_name="expires_at")
    op.alter_column("verification_token", "hash", new_column_name="token_hash")

    op.execute(
        "ALTER INDEX ix_email_verification_token_hash "
        "RENAME TO ix_verification_token_token_hash"
    )

    op.execute(
        "ALTER INDEX ix_email_verification_token_user_id "
        "RENAME TO ix_verification_token_user_id"
    )

    op.execute(
        "ALTER INDEX email_verification_token_pkey "
        "RENAME TO verification_token_pkey"
    )

    op.add_column(
        "verification_token",
        sa.Column(
            "purpose",
            postgresql.ENUM(
                name=ENUM_NAME,
                create_type=False
            ),
            server_default="EMAIL_VERIFICATION",
            nullable=False
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("verification_token", "purpose")
    purpose_enum.drop(op.get_bind(), checkfirst=True)

    op.execute(
        "ALTER INDEX ix_verification_token_token_hash "
        "RENAME TO ix_email_verification_token_hash"
    )

    op.execute(
        "ALTER INDEX ix_verification_token_user_id "
        "RENAME TO ix_email_verification_token_user_id"
    )

    op.execute(
        "ALTER INDEX verification_token_pkey "
        "RENAME TO email_verification_token_pkey"
    )

    op.alter_column("verification_token", "expires_at", new_column_name="exp")
    op.alter_column("verification_token", "token_hash", new_column_name="hash")

    op.rename_table("verification_token", "email_verification_token")
