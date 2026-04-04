"""backfill patients from users.

Revision ID: b33406566246
Revises: bcf315f09fd6
Create Date: 2026-03-29 14:51:27.621166

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b33406566246'
down_revision: Union[str, Sequence[str], None] = 'bcf315f09fd6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.execute(
        sa.text("""
            INSERT INTO patient (id)
            SELECT u.id FROM "user" u
            LEFT JOIN patient p ON u.id = p.id
            WHERE u.role = 'PATIENT' AND p.id IS NULL
        """)
    )


def downgrade() -> None:
    """Downgrade schema."""
    pass
