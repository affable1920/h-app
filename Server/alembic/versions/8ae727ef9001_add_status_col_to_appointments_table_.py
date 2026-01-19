"""add status col to appointments table after doing a downgrade

Revision ID: 8ae727ef9001
Revises: f20851841b5d
Create Date: 2026-01-19 22:39:52.700646

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8ae727ef9001"
down_revision: Union[str, Sequence[str], None] = "f20851841b5d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

status_enum = sa.Enum(
    "active",
    "cancelled",
    "completed",
    name="appointment_status_enum",
    create_type=False,
)


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("appointments", "status")

    """
    The status_enum.create creates the actual enum type at the database level.
    Then, we can use it as any ordinary sql type.
    """

    status_enum.create(op.get_bind(), checkfirst=True)
    op.add_column(
        "appointments",
        sa.Column("status", status_enum, server_default="active", nullable=False),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("appointments", "status")
    status_enum.drop(op.get_bind(), checkfirst=True)
