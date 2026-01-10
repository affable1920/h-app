"""create the appointments table.

Revision ID: e16ad876135f
Revises: 72e7d770c028
Create Date: 2026-01-01 23:08:17.515109

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e16ad876135f"
down_revision: Union[str, Sequence[str], None] = "72e7d770c028"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "appointments",
        sa.Column("id", sa.Uuid, primary_key=True),
        sa.Column("patient_id", sa.Uuid, sa.ForeignKey("patients.id"), nullable=False),
        sa.Column("doctor_id", sa.Uuid, sa.ForeignKey("doctors.id"), nullable=False),
        sa.Column("clinic_id", sa.Uuid, sa.ForeignKey("clinics.id"), nullable=False),
        sa.Column("slot_id", sa.Uuid, sa.ForeignKey("slots.id"), nullable=False),
        sa.Column(
            "schedule_id", sa.Uuid, sa.ForeignKey("schedules.id"), nullable=False
        ),
        sa.Column("created_at", sa.DateTime(timezone=True), default=sa.func.now()),
        sa.Column("date", sa.Date),  # date of the appointment
        # sa.Column("status", sa.Enum("PENDING", "CONFIRMED", "CANCELLED", "COMPLETED")),
    )


def downgrade() -> None:
    """Downgrade schema."""
    pass
