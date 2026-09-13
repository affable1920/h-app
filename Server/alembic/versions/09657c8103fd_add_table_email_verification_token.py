"""Add table 'email_verification_token'

Revision ID: 09657c8103fd
Revises: 887ea016d9ac
Create Date: 2026-09-10 23:24:41.499312

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.schemas.enums import UserRoleV2


# revision identifiers, used by Alembic.
revision: str = '09657c8103fd'
down_revision: Union[str, Sequence[str], None] = '887ea016d9ac'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table("email_verification_token",
                    sa.Column(
                        "id",
                        sa.UUID,
                        primary_key=True,
                        nullable=False,
                        server_default=sa.text("gen_random_uuid()")
                    ),

                    sa.Column(
                        "user_id",
                        sa.UUID,
                        nullable=False
                    ),

                    sa.Column("user_role", sa.Enum(UserRoleV2)),
                    sa.Column("hash", sa.String, nullable=False),
                    sa.Column("exp", sa.DateTime, nullable=False),

                    sa.Column(
                        "used_at",
                        sa.DateTime
                    ),
                    sa.Column(
                        "created_at",
                        sa.DateTime
                    )
                    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("email_verification_token")
