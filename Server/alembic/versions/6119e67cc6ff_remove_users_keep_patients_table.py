"""remove users, keep patients table

Revision ID: 6119e67cc6ff
Revises: 8f4cded4e316
Create Date: 2026-01-10 23:12:02.823302

"""

from typing import Sequence, Union
from uuid import uuid4

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6119e67cc6ff"
down_revision: Union[str, Sequence[str], None] = "8f4cded4e316"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("slots", "patient_id")
    op.drop_column("appointments", "patient_id")

    op.drop_table("users")

    op.create_table(
        "patients",
        sa.Column("id", sa.Uuid(), primary_key=True, default=uuid4),
        sa.Column("username", sa.String(), nullable=False),
        sa.Column("password", sa.String(), nullable=False),
        sa.Column("email", sa.String()),
        sa.Column("contact", sa.Numeric(10), nullable=False),
        sa.Column("name", sa.String, nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
        sa.Column(
            "last_updated",
            sa.DateTime(timezone=True),
            server_default=sa.func.now(),
            onupdate=sa.func.now(),
        ),
    )

    op.add_column("slots", sa.Column("patient_id", sa.Uuid(), nullable=True))
    op.add_column("appointments", sa.Column("patient_id", sa.Uuid(), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    pass
