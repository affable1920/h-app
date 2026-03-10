"""set enum defaults.

Revision ID: 722fec8f4f42
Revises: 84679a055ae9
Create Date: 2026-03-06 12:47:20.174070

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

from app.shared.enums import Status, UserRole


# revision identifiers, used by Alembic.
revision: str = "722fec8f4f42"
down_revision: Union[str, Sequence[str], None] = "84679a055ae9"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        "user",
        "role",
        existing_type=sa.Enum(UserRole, name="userrole"),
        server_default=sa.text("'PATIENT'"),
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column("user", "role", server_default=None)
