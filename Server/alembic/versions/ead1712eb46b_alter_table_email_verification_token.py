"""alter table email_verification_token

Revision ID: ead1712eb46b
Revises: 09657c8103fd
Create Date: 2026-09-11 22:20:17.618851

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'ead1712eb46b'
down_revision: Union[str, Sequence[str], None] = '09657c8103fd'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.alter_column(
        'email_verification_token',
        'created_at',
        server_default=sa.text("now()")
    )

    op.alter_column(
        "email_verification_token",
        "used_at",
        nullable=True
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.alter_column(
        'email_verification_token',
        'created_at',
    )

    op.alter_column(
        "email_verification_token",
        "used_at",
    )
