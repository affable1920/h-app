"""add optional guest fields to the appointment table. make patient_id optional.

Revision ID: 669b429b1cfb
Revises: 37ccfc65e722
Create Date: 2026-01-11 13:09:50.852040

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "669b429b1cfb"
down_revision: Union[str, Sequence[str], None] = "37ccfc65e722"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column("appointments", "patient_id", nullable=True)
    op.add_column("appointments", sa.Column("guest_name", sa.String, nullable=True))
    op.add_column(
        "appointments", sa.Column("guest_contact", sa.Numeric(10), nullable=True)
    )

    op.alter_column("patients", "contact", index=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column("appointments", "patient_id", nullable=False)
    op.drop_column("appointments", "guest_name")
    op.drop_column("appointments", "guest_contact")

    op.alter_column("patients", "contact", index=False)
