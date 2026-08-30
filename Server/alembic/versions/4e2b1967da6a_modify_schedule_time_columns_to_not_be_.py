"""Modify schedule time columns to not be timezone aware.

Revision ID: 4e2b1967da6a
Revises: 74cb21acde09
Create Date: 2026-08-26 10:33:56.923711

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '4e2b1967da6a'
down_revision: Union[str, Sequence[str], None] = '74cb21acde09'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "schedule",
        "start_time",
        type_=sa.Time,
        nullable=False
    )
    op.alter_column(
        "schedule",
        "end_time",
        type_=sa.Time,
        nullable=False
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        "schedule",
        "start_time",
        type_=sa.Time(timezone=True),
        nullable=False
    )
    op.alter_column(
        "schedule",
        "end_time",
        type_=sa.Time(timezone=True),
        nullable=False
    )
