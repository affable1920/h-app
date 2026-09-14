"""Add a column to care_journey_table.

Revision ID: 5afae324685e
Revises: 4df32428f9f2
Create Date: 2026-09-14 15:32:50.824751

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '5afae324685e'
down_revision: Union[str, Sequence[str], None] = '4df32428f9f2'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "care_journey",
        sa.Column(
            "reason_for_visit",
            sa.Text,
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column(
        "care_journey",
        "reason_for_visit"
    )
