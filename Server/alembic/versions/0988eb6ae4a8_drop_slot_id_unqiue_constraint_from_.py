"""Drop slot_id unqiue constraint from appointment table. Add a unqiue constraint for when an appointment is active.

Revision ID: 0988eb6ae4a8
Revises: ad667959a703
Create Date: 2026-09-03 17:48:38.789035

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '0988eb6ae4a8'
down_revision: Union[str, Sequence[str], None] = 'ad667959a703'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_constraint(
        constraint_name="appointment_slot_id_key",
        table_name="appointment",
        type_="unique"
    )

    op.create_index(
        "uq_appointment_active_slot",
        "appointment",
        ["slot_id"],
        unique=True,
        postgresql_where=sa.text("status != 'CANCELLED'")
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index("uq_appointment_active_slot", "appointment")
    op.create_unique_constraint(
        "appointment_slot_id_key",
        "appointment",
        ["slot_id"]
    )
