"""Add patient id to the slot id

Revision ID: 72e7d770c028
Revises: e87bebbe0bfb
Create Date: 2026-01-01 15:31:15.855232

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "72e7d770c028"
down_revision: Union[str, Sequence[str], None] = "e87bebbe0bfb"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column(
        "slots", sa.Column("patient_id", sa.Uuid, sa.ForeignKey("patients.id"))
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column("slots", "patient_id")
