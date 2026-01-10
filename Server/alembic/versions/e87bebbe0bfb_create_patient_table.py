"""create patient table.

Revision ID: e87bebbe0bfb
Revises:
Create Date: 2025-12-31 21:38:30.392041

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e87bebbe0bfb"
down_revision: Union[str, Sequence[str], None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "patients",
        sa.Column("id", sa.Uuid(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String, index=True),
        sa.Column("email", sa.String, index=True, unique=True, nullable=False),
        sa.Column("contact", sa.String(10), nullable=False),
        sa.Column("slot_id", sa.Uuid, sa.ForeignKey("slots.id")),
        sa.Column("doctor_id", sa.Uuid, sa.ForeignKey("doctors.id")),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table("patients")
