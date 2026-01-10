"""drop patient's emai, slot_id and doctor_id from the patient's table

Revision ID: 42d9b70d5114
Revises: e16ad876135f
Create Date: 2026-01-03 00:53:39.094135

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "42d9b70d5114"
down_revision: Union[str, Sequence[str], None] = "e16ad876135f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


cols = ["email", "slot_id", "doctor_id"]


def upgrade() -> None:
    """Upgrade schema."""
    for col in cols:
        op.drop_column("patients", col)


def downgrade() -> None:
    """Downgrade schema."""
    for col in cols:
        op.add_column("patients", sa.Column(col, sa.String))
