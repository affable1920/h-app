"""alter guest_contact in appointments table

Revision ID: 81e61308d63b
Revises: 8ae727ef9001
Create Date: 2026-01-21 23:22:31.645884

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "81e61308d63b"
down_revision: Union[str, Sequence[str], None] = "8ae727ef9001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column("appointments", "guest_contact", type_=sa.VARCHAR(10))


def downgrade() -> None:
    """Downgrade schema."""
    pass
    op.alter_column("appointments", "guest_contact", type_=sa.NUMERIC(10))
