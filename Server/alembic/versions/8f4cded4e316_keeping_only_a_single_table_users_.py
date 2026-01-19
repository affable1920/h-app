"""Keeping only a single table (users) instead of patients. Adding patient table fields to users' and removing users table

Revision ID: 8f4cded4e316
Revises: 42d9b70d5114
Create Date: 2026-01-10 22:31:46.441287

"""

from typing import Sequence, Union
from app.config import UserRole

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "8f4cded4e316"
down_revision: Union[str, Sequence[str], None] = "42d9b70d5114"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_table("users")

    op.drop_column("slots", "patient_id")
    op.drop_column("appointments", "patient_id")

    op.drop_table("patients")

    op.create_table(
        "users",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("name", sa.String, nullable=False),
        sa.Column("username", sa.VARCHAR, index=True),
        sa.Column("password", sa.String, nullable=False),
        sa.Column("contact", sa.Numeric(10), nullable=False),
        sa.Column(
            "created_at", sa.DateTime(timezone=True), server_default=sa.func.now()
        ),
    )

    op.add_column(
        "slots",
        sa.Column("patient_id", sa.Uuid, sa.ForeignKey("users.id"), nullable=True),
    )
    op.add_column(
        "appointments",
        sa.Column("patient_id", sa.Uuid, sa.ForeignKey("users.id"), nullable=True),
    )


def downgrade() -> None:
    """Downgrade schema."""
    pass
