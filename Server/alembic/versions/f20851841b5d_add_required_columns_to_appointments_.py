"""add required columns to appointments table.

Revision ID: f20851841b5d
Revises: 9c4a31f44e81
Create Date: 2026-01-19 17:23:59.067701

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.config import AppointmentStatus


# revision identifiers, used by Alembic.
revision: str = "f20851841b5d"
down_revision: Union[str, Sequence[str], None] = "9c4a31f44e81"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "appointments",
        sa.Column(
            "status",
            sa.Enum("active", "cancelled", "completed", name="status"),
        ),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("appointments", "status")
