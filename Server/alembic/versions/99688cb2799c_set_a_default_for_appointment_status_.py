"""set a default for appointment status enum to be used in the appointment table.

Revision ID: 99688cb2799c
Revises: 4785c22efc1d
Create Date: 2026-03-07 22:15:31.356933

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '99688cb2799c'
down_revision: Union[str, Sequence[str], None] = '4785c22efc1d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column("appointment", "status",
                    server_default=sa.text("'ACTIVE'"))


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column("appointment", "status", server_default=None)
