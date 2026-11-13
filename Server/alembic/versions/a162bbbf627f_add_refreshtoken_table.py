"""Add RefreshToken table

Revision ID: a162bbbf627f
Revises: 9ce845c61670
Create Date: 2026-11-08 23:02:31.134205

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from sqlalchemy.dialects.postgresql import ENUM

# revision identifiers, used by Alembic.
revision: str = 'a162bbbf627f'
down_revision: Union[str, Sequence[str], None] = '9ce845c61670'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "refresh_token",
        sa.Column(
            "id",
            sa.UUID,
            primary_key=True,
            server_default=sa.text("gen_random_uuid()")
        ),
        sa.Column(
            "user_id",
            sa.UUID,
            index=True,
            nullable=False
        ),
        sa.Column(
            "user_role",
            ENUM(
                "CLINIC_ADMIN",
                "DOCTOR",
                "PATIENT",
                name="user_role",
                create_type=False
            ),
            nullable=False
        ),
        sa.Column(
            "token_hash",
            sa.VARCHAR(64),
            unique=True,
            index=True,
            nullable=False
        ),
        sa.Column(
            "family_id",
            sa.UUID,
            index=True,
            nullable=False,
        ),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            nullable=False
        ),
        sa.Column(
            "expires_at",
            sa.DateTime(timezone=True),
            nullable=False
        ),
        sa.Column(
            "family_expires_at",
            sa.DateTime(timezone=True),
            nullable=False
        ),
        sa.Column(
            "used_at",
            sa.DateTime(timezone=True),
            nullable=True
        ),
        sa.Column(
            "revoked_at",
            sa.DateTime(timezone=True),
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("refresh_token")
