"""Make name col inside the patients table nullable at start.

Revision ID: dbe67b6f3617
Revises: 6119e67cc6ff
Create Date: 2026-01-11 00:32:50.544718

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "dbe67b6f3617"
down_revision: Union[str, Sequence[str], None] = "6119e67cc6ff"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column("patients", "name", nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    pass
    op.alter_column("patients", "name", nullable=False)
