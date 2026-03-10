"""add missing date field|column to the appointment table

Revision ID: 4785c22efc1d
Revises: 722fec8f4f42
Create Date: 2026-03-07 19:56:08.201207

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4785c22efc1d'
down_revision: Union[str, Sequence[str], None] = '722fec8f4f42'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column("appointment", sa.Column(name="date", type_=sa.DATE))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("appointment", "date")
