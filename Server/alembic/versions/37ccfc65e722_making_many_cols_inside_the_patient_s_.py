"""Making many cols inside the patient's table optional, like contact, name.

Revision ID: 37ccfc65e722
Revises: dbe67b6f3617
Create Date: 2026-01-11 00:40:03.871096

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "37ccfc65e722"
down_revision: Union[str, Sequence[str], None] = "dbe67b6f3617"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column("patients", "contact", nullable=True)


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column("patients", "contact", nullable=False)
