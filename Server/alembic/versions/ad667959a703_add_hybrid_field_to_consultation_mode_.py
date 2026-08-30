"""Add hybrid field to consultation mode TYPE.

Revision ID: ad667959a703
Revises: 4e2b1967da6a
Create Date: 2026-08-28 20:27:36.469245

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ad667959a703'
down_revision: Union[str, Sequence[str], None] = '4e2b1967da6a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute("ALTER TYPE consultation_mode ADD VALUE IF NOT EXISTS 'hybrid'")


def downgrade() -> None:
    """Downgrade schema."""
    pass
