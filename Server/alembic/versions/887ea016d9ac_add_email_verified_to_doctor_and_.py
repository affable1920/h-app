"""Add email_verified to doctor and patient tables.

Revision ID: 887ea016d9ac
Revises: 0988eb6ae4a8
Create Date: 2026-09-10 22:11:28.452216

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '887ea016d9ac'
down_revision: Union[str, Sequence[str], None] = '0988eb6ae4a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "doctor",
        sa.Column(
            "email_verified",
            sa.Boolean(),
            nullable=True,
            default=False
        )
    )

    op.add_column(
        "patient",
        sa.Column(
            "email_verified",
            sa.Boolean(),
            nullable=True,
            default=False
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("doctor", "email_verified")
    op.drop_column("patient", "email_verified")
