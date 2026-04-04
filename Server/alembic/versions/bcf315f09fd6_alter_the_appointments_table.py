"""alter the appointments table

Revision ID: bcf315f09fd6
Revises: 750bbbe8bc04
Create Date: 2026-03-28 20:08:33.507708

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'bcf315f09fd6'
down_revision: Union[str, Sequence[str], None] = '750bbbe8bc04'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.drop_column("appointment", "guest_name")
    op.drop_column("appointment", "guest_contact")

    op.alter_column("appointment", "patient_id", nullable=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.add_column(
        "appointment",
        sa.Column("guest_name", sa.String, nullable=True),
    )
    op.add_column(
        "appointment",
        sa.Column("guest_contact", sa.String(10), nullable=True),
    )
    op.alter_column("appointment", "patient_id", nullable=True)
